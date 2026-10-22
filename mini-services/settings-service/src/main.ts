import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3003);

void bootstrapSecureService({
  module: AppModule,
  appName: 'settings-service',
  port: PORT,
});
