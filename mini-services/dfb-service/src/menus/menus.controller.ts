import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode } from "@nestjs/common";
import { MenusService } from "./menus.service";
import { CreateMenuDto, UpdateMenuDto } from "./menus.dto";
import { MENU_ICON_KEYS } from "./menus.service";

/** BFF forwards /api/advancedTools/** → dfb-service; full path prefix = "advancedTools". */
@Controller("advancedTools/menus")
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get("tree")
  tree() {
    return this.menus.tree();
  }

  @Get("icons")
  icons() {
    return { items: MENU_ICON_KEYS };
  }

  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menus.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menus.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(200)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.menus.remove(id);
  }
}
