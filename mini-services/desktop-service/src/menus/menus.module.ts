import { Module } from '@erp/shared';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
