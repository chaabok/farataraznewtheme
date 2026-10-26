import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { DetailTypeService } from "./detail-type.service";
import { UpsertDetailTypeDto } from "./detail-type.dto";

/**
 * DetailType — Task 120 (درخواست مالک): فرم «نوع تفصیل جدید»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه»).
 * GET    /detail-type       — فهرست انواع تفصیل (شامل seed تفصیل‌های رایج)
 * POST   /detail-type       — ثبت جدید با زنجیرهٔ اعتبارسنجی
 * PUT    /detail-type/:id   — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /detail-type/:id   — حذف
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/detail-type/**).
 */
@Controller("detail-type")
export class DetailTypeController {
  constructor(private readonly detailType: DetailTypeService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    /* Task 122 — قرارداد اشتراک دادهٔ واحد: بدون پارامتر = خواندن سراسری
       (سازگاری قبلی)؛ با structureId = ردیف‌های همان گره (+ دفتر مرکزی در
       صورت اشتراک — مالک کنترل می‌کند با تیک فرم ساختار کسب‌وکار). */
    const sid = Number(structureId);
    return this.detailType.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Post()
  create(@Body() dto: UpsertDetailTypeDto) {
    return this.detailType.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertDetailTypeDto) {
    return this.detailType.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.detailType.remove(id);
  }
}
