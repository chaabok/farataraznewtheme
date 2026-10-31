import { Module } from "@nestjs/common";
import { StatusMapController } from "./status-map.controller";

@Module({
  controllers: [StatusMapController],
})
export class StatusMapModule {}
