import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { SaveVoucherDto } from "./voucher.dto";

/**
 * Voucher — Task 158 (درخواست مالک): فرم «سند حسابداری جدید»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «سند حسابداری»).
 * GET    /vouchers/meta         — منابع دراپ‌داون فرم (یک‌واکشی)
 * GET    /vouchers/next-number  — پیشنهاد شماره سند/شماره عطف (خودکار)
 * GET    /vouchers              — فهرست اسناد (اکشن‌بار/ناوبری)
 * GET    /vouchers/:id          — جزئیات کامل سند (اقلام + تفصیلی‌ها + نام‌ها)
 * POST   /vouchers              — ثبت سند جدید (شماره‌گذاری خودکار سرور)
 * PUT    /vouchers/:id          — ویرایش سند
 * DELETE /vouchers/:id          — حذف سند (اتمی با اقلام و تفصیلی‌ها)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/vouchers/**).
 */
@Controller("vouchers")
export class VoucherController {
  constructor(private readonly vouchers: VoucherService) {}

  /** مسیرهای ثابت قبل از :id اعلام می‌شوند (ترتیب مسیریابی NestJS). */
  @Get("meta")
  meta() {
    return this.vouchers.meta();
  }

  @Get("next-number")
  nextNumber(
    @Query("voucherTypeRef") voucherTypeRef?: string,
    @Query("structureId") structureId?: string,
  ) {
    const tref = Number(voucherTypeRef);
    const sid = Number(structureId);
    return this.vouchers.nextNumber({
      voucherTypeRef: voucherTypeRef && Number.isFinite(tref) && tref > 0 ? tref : undefined,
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
    });
  }

  @Get()
  list(@Query("structureId") structureId?: string) {
    const sid = Number(structureId);
    return this.vouchers.list({
      structureId: structureId && Number.isFinite(sid) && sid > 0 ? sid : undefined,
    });
  }

  @Get(":id")
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.vouchers.detail(id);
  }

  @Post()
  create(@Body() dto: SaveVoucherDto) {
    return this.vouchers.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: SaveVoucherDto) {
    return this.vouchers.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.vouchers.remove(id);
  }
}
