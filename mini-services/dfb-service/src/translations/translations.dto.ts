import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/** ۱۰ زبان غیر-fa (هم‌راستا با src/i18n/config.ts LOCALES فرانت) */
export const TRANSLATION_LANGS = ["en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh"] as const;

/** موجودیت‌های ترجمه‌پذیر (Tab فعلاً پشتیبانی نمی‌شود — ID تب‌ها در هر ذخیره بازتولید می‌شود) */
export const TRANSLATION_ENTITY_TYPES = ["Menu", "Form", "Field"] as const;

export type TranslationEntityType = (typeof TRANSLATION_ENTITY_TYPES)[number];

/**
 * Task 68 — DfbTranslation DTO.
 * زبان پایه fa پذیرفته نمی‌شود (متن اصلی Label/Title همان fa است)؛ فقط ۱۰ زبان دیگر.
 * مقدار خالی ("" پس از trim) یعنی «حذف ترجمه».
 */
export class UpsertTranslationItem {
  @IsIn(TRANSLATION_ENTITY_TYPES as unknown as string[]) entityType!: string;
  @IsInt() @Min(1) entityRef!: number;
  @IsString() @MinLength(1) @MaxLength(200) fieldKey!: string; // "Title" | FieldKey فیلد
  @IsIn(TRANSLATION_LANGS as unknown as string[]) lang!: string;
  @IsString() @MaxLength(1000) value!: string; // "" = حذف
}

export class UpsertTranslationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => UpsertTranslationItem)
  items!: UpsertTranslationItem[];
}
