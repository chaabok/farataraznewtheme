import { Module } from "@nestjs/common";
import { SoftwareConfigController } from "./software-config.controller";
import { SoftwareConfigService } from "./software-config.service";

@Module({
  controllers: [SoftwareConfigController],
  providers: [SoftwareConfigService],
})
export class SoftwareConfigModule {}
