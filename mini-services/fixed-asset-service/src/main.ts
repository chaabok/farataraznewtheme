import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3008);

void bootstrapSecureService({
  module: AppModule,
  appName: 'fixed-asset-service',
  port: PORT,
});
