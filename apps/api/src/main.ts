import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // CORS - Allow jahyeon.com and localhost
    const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://jahyeon.com',
        'https://www.jahyeon.com',
    ];
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || defaultOrigins,
        credentials: true,
    });

    // WebSocket adapter
    app.useWebSocketAdapter(new IoAdapter(app));

    // Global prefix
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3001;
    // Bind to 0.0.0.0 for external access (required for Render, Railway, etc.)
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 API Server running on http://0.0.0.0:${port}`);
}

bootstrap();
