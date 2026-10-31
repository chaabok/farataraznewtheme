import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { DefinitionsService } from "./definitions.service";

@Controller("workflow-definitions")
export class DefinitionsController {
  constructor(private readonly defs: DefinitionsService) {}

  @Get()
  list(@Query("entityType") entityType?: string) {
    return this.defs.list(entityType);
  }

  @Get(":id")
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.defs.getOne(BigInt(id));
  }
}
