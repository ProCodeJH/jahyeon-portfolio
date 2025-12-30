import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  getInfo() {
    return {
      name: 'Circuit Lab API',
      version: '1.0.0',
      description: 'Enterprise-grade Arduino circuit simulator API',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users',
        orgs: '/api/orgs',
        projects: '/api/projects',
        compile: '/api/compile',
      },
    };
  }
}
