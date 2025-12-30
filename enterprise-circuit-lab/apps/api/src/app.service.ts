import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // TODO: Actual health check
        redis: 'connected', // TODO: Actual health check
        minio: 'connected', // TODO: Actual health check
      },
    };
  }
}
