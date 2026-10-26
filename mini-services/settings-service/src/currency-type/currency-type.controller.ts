import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { CurrencyTypeService } from "./currency-type.service";
import { UpsertCurrencyTypeDto } from "./currency-type.dto";

/**
 * CurrencyType — Task 114: فرم «نوع ارز جدید» (نرم‌افزار «عمومی» ← اطلاعات پایه).
 * GET    /currency-type       — فهرست انواع ارز (شامل seed ارزهای بین‌المللی)
 * POST   /currency-type       — ثبت جدید با زنجیرهٔ اعتبارسنجی
 * PUT    /currency-type/:id   — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /currency-type/:id   — حذف
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/currency-type/**).
 */
@Controller("currency-type")
export class CurrencyTypeController {
  constructor(private readonly currencyType: CurrencyTypeService) {}

  @Get()
  list() {
    return this.currencyType.list();
  }

  @Post()
  create(@Body() dto: UpsertCurrencyTypeDto) {
    return this.currencyType.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertCurrencyTypeDto) {
    return this.currencyType.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.currencyType.remove(id);
  }
}
