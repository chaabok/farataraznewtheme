import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { SoftwareConfigService } from "./software-config.service";
import { UpsertSoftwareConfigDto } from "./software-config.dto";

/**
 * GET /software-config         — فهرست نرم‌افزارهای دارای تب پیکربندی
 * GET /software-config/:appKey — مقادیر ذخیره‌شدهٔ پیکربندی یک نرم‌افزار
 * PUT /software-config/:appKey — ذخیرهٔ دسته‌ای (مقدار خالی = حذف)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/software-config/**).
 */
@Controller("software-config")
export class SoftwareConfigController {
  constructor(private readonly softwareConfig: SoftwareConfigService) {}

  @Get()
  apps() {
    return this.softwareConfig.listApps();
  }

  @Get(":appKey")
  list(@Param("appKey") appKey: string) {
    return this.softwareConfig.list(appKey);
  }

  @Put(":appKey")
  upsert(@Param("appKey") appKey: string, @Body() dto: UpsertSoftwareConfigDto) {
    return this.softwareConfig.upsert(appKey, dto);
  }
}
