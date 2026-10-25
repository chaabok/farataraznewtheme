import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

/**
 * DataTranslation DTOs — Task 92 (تأیید مالک): انبار ترجمهٔ «دادهٔ» فرم‌های
 * سیستمی روی بانک اصلی (هم‌سان با قرارداد DfbTranslation فرم‌ساز — Task 70).
 *
 *   · entityType — نام مدل سیستمی (الان «Party»؛ الگوی نام لاتین برای فرم‌های
 *                  سیستمی آینده — FiscalYear و …)
 *   · entityId   — شناسهٔ رکورد در همان مدل (IDهای دستی §16 — در DTO عدد)
 *   · fieldKey   — کلید فیلد؛ فیلد ساده («name») یا مسیر ردیف جدولی
 *                  («address.0.fullAddress» / «persons.1.notes»)
 *   · locale     — زبان مقصد؛ فقط ۱۲ زبان غیر-fa (fa خودِ مقدار اصلی رکورد است)
 *   · value      — متن ترجمه؛ خالی = حذف ترجمه (fallback به fa) در ورود دستی
 */

/** ۱۲ زبان غیر-fa — عین TRANSLATION_LANGS در src/app/api/dfb-translations/auto-translate */
export const TRANSLATION_LOCALES = [
  "en",
  "tr",
  "ar",
  "hi",
  "ps",
  "ckb",
  "pt",
  "ko",
  "fr",
  "zh",
  "de",
  "ru",
] as const;

export class SaveDataTranslationItemDto {
  @IsString()
  @Matches(/^[A-Za-z][A-Za-z0-9._]{0,119}$/)
  fieldKey!: string;

  @IsIn(TRANSLATION_LOCALES as unknown as string[])
  locale!: string;

  /** "" = حذف ترجمهٔ همین زبان (fallback به fa) */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  value?: string;
}

export class SaveDataTranslationsDto {
  @IsString()
  @Matches(/^[A-Za-z][A-Za-z0-9_]{0,39}$/)
  entityType!: string;

  @IsInt()
  @Min(1)
  entityId!: number;

  @IsArray()
  @ArrayMaxSize(360) // ۳۰ فیلد × ۱۲ زبان
  @ValidateNested({ each: true })
  @Type(() => SaveDataTranslationItemDto)
  items!: SaveDataTranslationItemDto[];
}
