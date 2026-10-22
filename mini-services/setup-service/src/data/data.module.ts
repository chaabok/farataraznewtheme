import { Global, Module } from '@erp/shared';
import { DataDatabasesService } from './data-databases.service';

@Global()
@Module({
  providers: [DataDatabasesService],
  exports: [DataDatabasesService],
})
export class DataModule {}
