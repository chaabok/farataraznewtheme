import { Module } from "@nestjs/common";
import { GeoLocationController } from "./geo-location.controller";
import { GeoLocationService } from "./geo-location.service";

@Module({
  controllers: [GeoLocationController],
  providers: [GeoLocationService],
})
export class GeoLocationModule {}
