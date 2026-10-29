import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { VoucherTypeService } from "./voucher-type.service";
import { UpsertVoucherTypeDto } from "./voucher-type.dto";

/**
 * VoucherType — Task 153 (درخواست مالک): فرم «نوع سند جدید»
 * (نرم‌افزار «حسابداری» ← زیرمنوی «سند حسابداری» — Task 150).
 * GET    /voucher-type       — فهرست انواع سند (شامل ۹ نوع پیش‌فرض seed)
 * POST   /voucher-type       — ثبت جدید با زنجیرهٔ اعتبارسنجی
 * PUT    /voucher-type/:id   — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /voucher-type/:id   — حذف
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/voucher-type/**).
 */
@Controller("voucher-type")
export class VoucherTypeController {
  constructor(private readonly voucherType: VoucherTypeService) {}

  @Get()
  list() {
    return this.voucherType.list();
  }

  @Post()
  create(@Body() dto: UpsertVoucherTypeDto) {
    return this.voucherType.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertVoucherTypeDto) {
    return this.voucherType.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.voucherType.remove(id);
  }
}
