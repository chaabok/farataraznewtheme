import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

/**
 * GeoLocation DTOs — Task 103 (فرم «محل های جغرافیایی»، اطلاعات پایهٔ عمومی).
 * قواعد درخت و بازهٔ نوع‌ها روی سرور اعتبارسنجی می‌شود (تک‌منبع حقیقت).
 */

export class CreateGeoDto {
  /** 0 = ریشهٔ مجازی فرم (فقط کشور)؛ بقیه = شناسهٔ گرهٔ والد */
  @IsInt()
  @Min(0)
  parentRef!: number;

  /** 1=کشور 2=استان 3=شهر 4=روستا 5=خیابان 6=کوچه (ترتیب مالک) */
  @IsInt()
  @Min(1)
  @Max(6)
  levelType!: number;

  /** کد عددی اجباری — یکتا بین خواهرها (سرور 409 برای تکراری) */
  @IsInt()
  @Min(1)
  code!: number;

  @IsString()
  @IsNotEmpty({ message: "عنوان الزامی است" })
  @MaxLength(120)
  title!: string;

  /* Task 110 (درخواست مالک): «فیلد عنوان لاتین» حذف شد — ترجمهٔ هر زبان
     روی انبار DataTranslation نگهداری می‌شود؛ ستون قدیمی legacy می‌ماند. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titleLatin?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGeoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  levelType?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  titleLatin?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
