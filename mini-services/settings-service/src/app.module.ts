import { APP_GUARD, ApiKeyGuard, JwtAuthGuard, Module } from '@erp/shared';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [PrismaModule, ItemsModule, FormsModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
