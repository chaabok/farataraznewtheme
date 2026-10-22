import {
  APP_GUARD,
  ApiKeyGuard,
  JwtAuthGuard,
  Module,
} from '@erp/shared';
import { PrismaModule } from './prisma/prisma.module';
import { DataModule } from './data/data.module';
import { SetupModule } from './setup/setup.module';

@Module({
  imports: [PrismaModule, DataModule, SetupModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
