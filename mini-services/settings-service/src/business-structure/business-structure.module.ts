import { Module } from '@erp/shared';
import { BusinessStructureController } from './business-structure.controller';
import { BusinessStructureService } from './business-structure.service';

@Module({
  controllers: [BusinessStructureController],
  providers: [BusinessStructureService],
  exports: [BusinessStructureService],
})
export class BusinessStructureModule {}
