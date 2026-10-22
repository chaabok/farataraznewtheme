import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3006);

void bootstrapSecureService({
  module: AppModule,
  appName: 'inventory-service',
  port: PORT,
});
