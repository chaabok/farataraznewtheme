import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3009);

void bootstrapSecureService({
  module: AppModule,
  appName: 'procurement-service',
  port: PORT,
});
