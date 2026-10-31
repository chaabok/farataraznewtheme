import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";

/**
 * ReportsController — گزارش گردش/گلوگاه و داشبورد گردش سازمان (t181 فاز ۵).
 * خوانشی (GET-only) روی دیتای موتور؛ همهٔ فیلترها صریح از کوئری (هم‌الگوی
 * کارتابل) و مسیرها زیر گارد HMAC سرویس‌داخلی.
 */
@Controller("workflow-reports")
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  /** کارت‌های KPI داشبورد گردش سازمان */
  @Get("overview")
  overview() {
    return this.reports.overview();
  }

  /** نقاط گلوگاه — میانگین/بیشینهٔ توقف per گره + انتظارهای باز و نقض SLA */
  @Get("bottlenecks")
  bottlenecks() {
    return this.reports.bottlenecks();
  }

  /** فهرست نمونه‌های اخیر با گام جاری و وضعیت SLA (فیلتر status/entityType/limit) */
  @Get("instances")
  instances(
    @Query("status") status?: string,
    @Query("entityType") entityType?: string,
    @Query("limit") limit?: string,
  ) {
    return this.reports.instances({ status, entityType, limit });
  }
}
