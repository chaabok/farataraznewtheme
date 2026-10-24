import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, HttpCode } from "@nestjs/common";
import { QueriesService } from "./queries.service";
import { CreateQueryDto } from "./queries.dto";

/** BFF forwards /api/advancedTools/** → dfb-service; full path prefix = "advancedTools". */
@Controller("advancedTools/queries")
export class QueriesController {
  constructor(private readonly queries: QueriesService) {}

  @Get("tables")
  tables() {
    return this.queries.tables();
  }

  @Get()
  list() {
    return this.queries.list();
  }

  @Post()
  create(@Body() dto: CreateQueryDto) {
    return this.queries.create(dto);
  }

  @Post(":id/execute")
  execute(@Param("id", ParseIntPipe) id: number) {
    return this.queries.execute(id);
  }

  @Delete(":id")
  @HttpCode(200)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.queries.remove(id);
  }
}
