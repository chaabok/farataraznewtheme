import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3005);

void bootstrapSecureService({
  module: AppModule,
  appName: 'payment-service',
  port: PORT,
});
