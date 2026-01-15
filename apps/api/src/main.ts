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

    // CORS - Allow all origins dynamically (reflects request origin)
    app.enableCors({
        origin: true, // Dynamically allows any origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
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
