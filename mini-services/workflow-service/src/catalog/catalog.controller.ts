import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

@Controller("workflow-catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list() {
    return this.catalog.list();
  }

  @Put(":entityType")
  setParticipation(
    @Param("entityType") entityType: string,
    @Body() dto: { participates: boolean },
  ) {
    return this.catalog.setParticipation(entityType, !!dto.participates);
  }
}
