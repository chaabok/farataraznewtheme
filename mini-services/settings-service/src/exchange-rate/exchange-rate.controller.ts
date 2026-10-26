import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { ExchangeRateService } from "./exchange-rate.service";
import { UpsertExchangeRateDto } from "./exchange-rate.dto";

/**
 * ExchangeRate — Task 116: فرم «نرخ برابری جدید» (نرم‌افزار «عمومی» ← عملیات).
 * GET    /exchange-rate       — فهرست نرخ‌ها (جدیدترین تاریخ اول)
 * POST   /exchange-rate       — ثبت جدید با زنجیرهٔ اعتبارسنجی
 * PUT    /exchange-rate/:id   — ویرایش (همان قوانین، خود رکورد مستثنا)
 * DELETE /exchange-rate/:id   — حذف
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/exchange-rate/**).
 */
@Controller("exchange-rate")
export class ExchangeRateController {
  constructor(private readonly exchangeRate: ExchangeRateService) {}

  @Get()
  list() {
    return this.exchangeRate.list();
  }

  @Post()
  create(@Body() dto: UpsertExchangeRateDto) {
    return this.exchangeRate.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertExchangeRateDto) {
    return this.exchangeRate.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.exchangeRate.remove(id);
  }
}
