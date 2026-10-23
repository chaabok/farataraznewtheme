import { Module } from "@nestjs/common";
import { InternalHttpClient } from "../../../_shared/internal-http";
import { AppsController } from "./apps.controller";
import { AppsService } from "./apps.service";

@Module({
  controllers: [AppsController],
  providers: [
    AppsService,
    { provide: InternalHttpClient, useValue: new InternalHttpClient(process.env.INTERNAL_API_KEY ?? "") },
  ],
})
export class AppsModule {}
