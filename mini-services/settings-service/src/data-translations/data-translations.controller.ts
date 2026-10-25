import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { DataTranslationsService } from "./data-translations.service";
import { SaveDataTranslationsDto } from "./data-translations.dto";

/**
 * DataTranslation — Task 92 (تأیید مالک): انبار ترجمهٔ دادهٔ فرم‌های سیستمی.
 * GET  /data-translations?entityType=Party&entityId=5  — ترجمه‌های یک رکورد
 * POST /data-translations/save                          — ذخیرهٔ دسته‌ای (upsert)
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/data-translations/**).
 */
@Controller("data-translations")
export class DataTranslationsController {
  constructor(private readonly dataTranslations: DataTranslationsService) {}

  @Get()
  list(
    @Query("entityType") entityType: string,
    @Query("entityId") entityId: string,
  ) {
    return this.dataTranslations.list(entityType ?? "", Number(entityId));
  }

  @Post("save")
  save(@Body() dto: SaveDataTranslationsDto) {
    return this.dataTranslations.save(dto);
  }
}
