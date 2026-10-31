import { Module } from "@nestjs/common";
import { InstancesController } from "./instances.controller";
import { InstancesService } from "./instances.service";
import { DefinitionsModule } from "../definitions/definitions.module";

@Module({
  imports: [DefinitionsModule],
  controllers: [InstancesController],
  providers: [InstancesService],
})
export class InstancesModule {}
