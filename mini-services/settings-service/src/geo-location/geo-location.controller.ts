import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from "@nestjs/common";
import { GeoLocationService } from "./geo-location.service";
import { CreateGeoDto, UpdateGeoDto } from "./geo-location.dto";

/** GeoLocation — Task 103: فرم «محل های جغرافیایی» (عمومی ← اطلاعات پایه). */
@Controller("geo-location")
export class GeoLocationController {
  constructor(private readonly service: GeoLocationService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() dto: CreateGeoDto) {
    return this.service.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateGeoDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
