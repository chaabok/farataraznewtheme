import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/**
 * CurrencyType DTOs — Task 114 (درخواست مالک): فرم «نوع ارز جدید» در
 * نرم‌افزار «عمومی» → زیرمنوی «اطلاعات پایه».
 *
 * قرارداد فیلدها (عین تصویر مالک):
 *   · کد                  — اجباری، یکتا در ساختار سازمانی (مثل IRR/USD).
 *   · عنوان               — اجباری، یکتا در ساختار سازمانی.
 *   · عنوان لاتین         — اجباری.
 *   · واحد مبنا           — اجباری، عدد صحیح ≥ ۱ (پیش‌فرض ۱).
 *   · تعداد اعشار         — اجباری، عدد صحیح ۰..۳ (الگوی ISO 4217).
 *   · عنوان اعشار         — اختیاری (مثل «سنت»).
 *   · عنوان اعشار لاتین   — اختیاری (مثل «Cent»).
 *   · ثبت فعال            — بولی (پیش‌فرض true).
 *
 * قوانین ثبت (سمت سرور — خط دفاعی نهایی):
 *   ۱. نوع ارز تکراری (کد یا عنوان تکراری در همان ساختار سازمانی) رد می‌شود.
 *   ۲. تعداد اعشار فقط ۰..۳ قبول می‌شود (سقف استاندارد ISO 4217).
 *   ۳. واحد مبنا باید عدد صحیح ≥ ۱ باشد.
 */
export class UpsertCurrencyTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  titleLatin!: string;

  @IsInt()
  @Min(1)
  baseUnit!: number;

  @IsInt()
  @Min(0)
  @Max(3)
  decimalPlaces!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  decimalTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  decimalTitleLatin?: string;

  @IsBoolean()
  isActive!: boolean;
}
