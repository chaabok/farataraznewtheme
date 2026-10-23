import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { APP_CATALOG, findApp } from "../../../_shared/app-catalog";
import { PublicInternal } from "../../../_shared/internal-auth";
import { AppsService } from "./apps.service";

@Controller()
export class AppsController {
  constructor(private readonly apps: AppsService) {}

  @PublicInternal()
  @Get("health")
  health() {
    return {
      service: "apps-service",
      status: "ok",
      hostedApps: APP_CATALOG.filter((a) => a.host === "apps-service").length,
      catalogApps: APP_CATALOG.length,
      at: new Date().toISOString(),
    };
  }

  @Get("apps")
  listApps() {
    return this.apps.listApps();
  }

  @Get(":appKey/meta")
  meta(@Param("appKey") appKey: string) {
    if (!findApp(appKey)) throw new NotFoundException(`unknown app: ${appKey}`);
    return this.apps.getMeta(appKey);
  }

  @PublicInternal()
  @Get(":appKey/health")
  appHealth(@Param("appKey") appKey: string) {
    const app = findApp(appKey);
    if (!app) throw new NotFoundException(`unknown app: ${appKey}`);
    return {
      appKey: app.appKey,
      status: "ok",
      dbMode: app.dbMode,
      host: app.host,
      note: "no business tables yet — owner provides analysis documents incrementally",
    };
  }

  @Get(":appKey/integrations/status")
  async integrations(@Param("appKey") appKey: string) {
    if (!findApp(appKey)) throw new NotFoundException(`unknown app: ${appKey}`);
    return this.apps.integrationStatus(appKey);
  }
}
