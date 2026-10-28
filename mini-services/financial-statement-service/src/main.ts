import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? 3012);

void bootstrapSecureService({
  module: AppModule,
  appName: 'financial-statement-service',
  port: PORT,
});
