import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { FiscalYearService } from "./fiscal-year.service";
import { UpsertFiscalYearDto } from "./fiscal-year.dto";

/**
 * FiscalYear — Task 75: فرم «سال مالی جدید» (نرم‌افزار «عمومی» ← اطلاعات پایه).
 * GET    /fiscal-year       — فهرست سال‌های مالی
 * POST   /fiscal-year       — ثبت جدید با زنجیرهٔ اعتبارسنجی مالک
 * PUT    /fiscal-year/:id   — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /fiscal-year/:id   — حذف
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/fiscal-year/**).
 */
@Controller("fiscal-year")
export class FiscalYearController {
  constructor(private readonly fiscalYear: FiscalYearService) {}

  @Get()
  list() {
    return this.fiscalYear.list();
  }

  @Post()
  create(@Body() dto: UpsertFiscalYearDto) {
    return this.fiscalYear.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertFiscalYearDto) {
    return this.fiscalYear.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.fiscalYear.remove(id);
  }
}
