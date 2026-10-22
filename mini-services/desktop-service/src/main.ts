import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3001);

void bootstrapSecureService({
  module: AppModule,
  appName: 'desktop-service',
  port: PORT,
});
