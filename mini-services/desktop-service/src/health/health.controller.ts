import { Controller, Get } from '@erp/shared';
import { PublicApiKey, PublicJwt } from '@erp/shared';

@Controller('health')
export class HealthController {
  @Get()
  @PublicJwt()
  @PublicApiKey()
  check() {
    return {
      status: 'ok',
      service: 'desktop-service',
      timestamp: new Date().toISOString(),
    };
  }
}
