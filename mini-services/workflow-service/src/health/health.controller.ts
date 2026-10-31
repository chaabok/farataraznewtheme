import { Controller, Get } from "@nestjs/common";
import { PublicInternal } from "../../../_shared/internal-auth";

@Controller()
export class HealthController {
  @PublicInternal()
  @Get("health")
  health() {
    return { service: "workflow-service", status: "ok", at: new Date().toISOString() };
  }
}
