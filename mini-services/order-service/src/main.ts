import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3010);

void bootstrapSecureService({
  module: AppModule,
  appName: 'order-service',
  port: PORT,
});
