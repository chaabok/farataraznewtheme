import { Controller, Get, Post, Body, HttpCode, Query } from "@nestjs/common";
import { TranslationsService } from "./translations.service";
import { UpsertTranslationsDto, TRANSLATION_LANGS } from "./translations.dto";

/** BFF forwards /api/advancedTools/** → dfb-service; full path prefix = "advancedTools". */
@Controller("advancedTools/translations")
export class TranslationsController {
  constructor(private readonly translations: TranslationsService) {}

  /** کل نقشهٔ ترجمه (کوچک) — یک واکشی، کش دائمی کلاینت، سوییچ آفلاین */
  @Get()
  findAll(@Query("lang") _lang?: string) {
    return this.translations.findAll();
  }

  /** upsert دسته‌ای (مقدار خالی = حذف) */
  @Post()
  @HttpCode(200)
  upsert(@Body() dto: UpsertTranslationsDto) {
    return this.translations.upsert(dto);
  }

  /** گواهی زبان‌های پذیرفته‌شده (برای UI استودیو) */
  @Get("langs")
  langs() {
    return { items: TRANSLATION_LANGS };
  }
}
