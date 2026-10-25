import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { PartyService } from "./party.service";
import { UpsertPartyDto } from "./party.dto";

/**
 * Party — Task 84: فرم «طرف حساب جدید» (نرم‌افزار «عمومی» ← اطلاعات پایه).
 * GET    /party               — فهرست کامل (با ردیف‌های تب‌ها)
 * GET    /party/next-tafsili  — شمارهٔ بعدی «کد تفصیلی» (بدون سوزاندن)
 * GET    /party/cities        — جدول شهرها (دراپ‌داون تب نشانی)
 * POST   /party               — ثبت جدید (کد تفصیلی خودکار از شماره‌گذاری)
 * PUT    /party/:id           — ویرایش (بازنویسی کامل ردیف‌های تب‌ها)
 * DELETE /party/:id           — حذف (فرزندان با FK cascade)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/party/**).
 */
@Controller("party")
export class PartyController {
  constructor(private readonly party: PartyService) {}

  @Get()
  list() {
    return this.party.list();
  }

  @Get("next-tafsili")
  nextTafsili() {
    return this.party.nextTafsili();
  }

  @Get("cities")
  cities() {
    return this.party.cities();
  }

  @Post()
  create(@Body() dto: UpsertPartyDto) {
    return this.party.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpsertPartyDto) {
    return this.party.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.party.remove(id);
  }
}
