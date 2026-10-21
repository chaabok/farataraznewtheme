import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IconsModule } from './icons/icons.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, IconsModule, HealthModule],
})
export class AppModule {}
