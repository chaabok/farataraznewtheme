import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { DetailItemService } from "./detail-item.service";
import { UpsertDetailItemDto } from "./detail-item.dto";

/**
 * DetailItem — سرویس مشترک رکورد تفصیلی (Task 144؛ از Task 174 فرم عمومی
 * «ایجاد تفصیلی ها» حذف شد و این endpointها عمدتاً توسط فرم «تفصیلی سایر»
 * (Task 154) مصرف می‌شوند — نرم‌افزار «حسابداری» ← «اطلاعات تفصیلی ها»).
 * GET    /detail-items            — فهرست تفصیلی‌ها (+ join نوع تفصیل)
 * GET    /detail-items/next-code  — پیشنهاد کد خودکار از بازهٔ شماره‌گذاری نوع
 * GET    /detail-items/other-category — تضمین نوع «سایر» (Task 154 — تفصیلی سایر)
 * POST   /detail-items            — ثبت جدید با زنجیرهٔ اعتبارسنجی
 * PUT    /detail-items/:id        — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /detail-items/:id        — حذف
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/detail-items/**).
 */
@Controller("detail-items")
export class DetailItemController {
  constructor(private readonly detailItems: DetailItemService) {}

  @Get()
  list(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
    @Query("detailTypeRef") detailTypeRef?: string,
  ) {
    const sid = Number(structureId);
    const tref = Number(detailTypeRef);
    return this.detailItems.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
      detailTypeRef: detailTypeRef && Number.isFinite(tref) && tref > 0 ? tref : undefined,
    });
  }

  @Get("next-code")
  nextCode(
    @Query("detailTypeRef") detailTypeRef?: string,
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    const tref = Number(detailTypeRef);
    const sid = Number(structureId);
    return this.detailItems.nextCode({
      detailTypeRef: detailTypeRef && Number.isFinite(tref) && tref > 0 ? tref : 0,
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  /**
   * Task 154 — فرم «تفصیلی سایر»: تضمین نوع تفصیل «سایر» (کد آزاد از ۲۲)
   * + ردیف شماره‌گذاری خودکار؛ شناسهٔ نوع برای فیلتر/ثبت رکوردهای فرم.
   */
  @Get("other-category")
  otherCategory(
    @Query("structureId") structureId?: string,
    @Query("headOfficeShares") headOfficeShares?: string,
  ) {
    const sid = Number(structureId);
    return this.detailItems.ensureOtherCategory({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
      headOfficeShares: headOfficeShares === "true",
    });
  }

  @Post()
  create(@Body() dto: UpsertDetailItemDto) {
    return this.detailItems.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertDetailItemDto) {
    return this.detailItems.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.detailItems.remove(id);
  }
}
