import { Module } from '@erp/shared';
import { DataModule } from '../data/data.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  imports: [PrismaModule, DataModule],
  controllers: [SetupController],
  providers: [SetupService],
})
export class SetupModule {}
