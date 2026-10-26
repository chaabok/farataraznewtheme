import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/**
 * ExchangeRate DTOs — Task 116 (درخواست مالک): فرم «نرخ برابری جدید» در
 * نرم‌افزار «عمومی» → زیرمنوی «عملیات» (گروه نوپای منوی عمومی).
 *
 * قرارداد فیلدها (عین تصویر مالک — بدون فیلد شناسه):
 *   · تاریخ موثر*        — میلادی 'YYYY-MM-DD' (فرانت طبق Task 77 می‌فرستد).
 *   · ارز مبنا*          — شناسهٔ CurrencyType.
 *   · ارز مورد مبادله*   — شناسهٔ CurrencyType؛ ≠ ارز مبنا.
 *   · واحد مبادله        — اختیاری؛ خالی = استخراج از واحد مبنای ارز مبنا.
 *   · نرخ برابری 1 واحد* — عدد مثبت (رشتهٔ اعشاری نرمال).
 *
 * قوانین ثبت (سمت سرور — خط دفاعی نهایی):
 *   ۱. تاریخ/ارزها/نرخ اجباری‌اند؛ ارزها باید موجود و متمایز باشند.
 *   ۲. نرخ تکراری همان جفت‌ارز در همان تاریخ رد می‌شود (409 — unique index).
 *   ۳. واحد مبادله در صورت ورود باید عدد صحیح ≥ ۱ باشد.
 */
export class UpsertExchangeRateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  effectiveDate!: string; // 'YYYY-MM-DD' میلادی

  @IsInt()
  @Min(1)
  baseCurrencyRef!: number;

  @IsInt()
  @Min(1)
  quoteCurrencyRef!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  exchangeUnit?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  rate!: string; // عدد مثبت — رشتهٔ اعشاری نرمال‌شده
}
