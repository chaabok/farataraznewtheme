import { APP_GUARD, ApiKeyGuard, JwtAuthGuard, Module } from '@erp/shared';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { FormsModule } from './forms/forms.module';
import { BusinessStructureModule } from './business-structure/business-structure.module';

@Module({
  imports: [PrismaModule, ItemsModule, FormsModule, BusinessStructureModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
