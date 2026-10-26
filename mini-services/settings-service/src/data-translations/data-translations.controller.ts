import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { DataTranslationsService } from "./data-translations.service";
import {
  SaveDataTranslationsDto,
  SaveDataTranslationsManyDto,
} from "./data-translations.dto";

/**
 * DataTranslation — Task 92 (تأیید مالک): انبار ترجمهٔ دادهٔ فرم‌های سیستمی.
 * GET  /data-translations?entityType=Party&entityId=5  — ترجمه‌های یک رکورد
 * POST /data-translations/save                         — ذخیرهٔ دسته‌ای (upsert)
 * POST /data-translations/save-many                    — ذخیرهٔ چند رکورد (Task 108)
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
    @Query("entityIds") entityIds?: string,
    @Query("fieldKeys") fieldKeys?: string,
  ) {
    /* Task 99 — حالت دسته‌ای: entityIds=5,7,8 (+fieldKeys=name,lastName اختیاری)
       برای ترجمهٔ دادهٔ لیست‌ها/دراپ‌داون‌ها؛ بدون entityIds = خواندن تک‌رکورد
       قرارداد قبلی (Task 92). سقف‌ها محافظه‌کارند (۵۰۰ رکورد / ۶۰ کلید). */
    const ids = (entityIds ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 500);
    if (ids.length > 0) {
      const keys = (fieldKeys ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[A-Za-z][A-Za-z0-9._]{0,119}$/.test(s))
        .slice(0, 60);
      return this.dataTranslations.listMany(entityType ?? "", ids, keys);
    }
    return this.dataTranslations.list(entityType ?? "", Number(entityId));
  }

  @Post("save")
  save(@Body() dto: SaveDataTranslationsDto) {
    return this.dataTranslations.save(dto);
  }

  @Post("save-many")
  saveMany(@Body() dto: SaveDataTranslationsManyDto) {
    return this.dataTranslations.saveMany(dto);
  }
}
