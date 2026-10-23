import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from "@nestjs/common";
import { BusinessStructureService } from "./business-structure.service";
import { CreateBsDto, UpdateBsDto } from "./business-structure.dto";

@Controller("business-structure")
export class BusinessStructureController {
  constructor(private readonly service: BusinessStructureService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() dto: CreateBsDto) {
    return this.service.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateBsDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
