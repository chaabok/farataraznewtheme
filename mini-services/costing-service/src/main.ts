import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3011);

void bootstrapSecureService({
  module: AppModule,
  appName: 'costing-service',
  port: PORT,
});
