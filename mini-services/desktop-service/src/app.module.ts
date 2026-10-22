import { APP_GUARD, ApiKeyGuard, JwtAuthGuard, Module } from '@erp/shared';
import { PrismaModule } from './prisma/prisma.module';
import { IconsModule } from './icons/icons.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, IconsModule, HealthModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
