import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'desktop-service',
      timestamp: new Date().toISOString(),
    };
  }
}
