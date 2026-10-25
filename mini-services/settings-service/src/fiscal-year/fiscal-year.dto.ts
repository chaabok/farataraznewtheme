import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * FiscalYear DTOs — Task 75 (درخواست مالک): فرم «سال مالی جدید» در نرم‌افزار
 * «عمومی» → زیرمنوی «اطلاعات پایه».
 *
 * قرارداد فیلدها (عین عبارت مالک):
 *   · کد          — اجباری، نمی‌تواند خالی باشد.
 *   · عنوان        — اجباری، نمی‌تواند خالی باشد، فقط عدد، دقیقاً ۴ کاراکتر.
 *   · تاریخ شروع  — 'YYYY/MM/DD' شمسی از فرانت؛ سرور به 'YYYYMMDD' نرمال می‌کند.
 *   · تاریخ پایان  — همان قالب؛ پس از تاریخ شروع.
 *   · فعال        — بولی.
 *
 * قوانین ثبت (سمت سرور — خط دفاعی نهایی):
 *   ۱. سال مالی تکراری (کد یا عنوان تکراری در همان ساختار سازمانی) رد می‌شود.
 *   ۲. بازهٔ شروع/پایان تکراری (هم‌پوشانی با هر سال مالی موجود) رد می‌شود.
 *   ۳. طول بازه از «تعداد ماه‌های مالی» پیکربندی نرم‌افزار → تب حسابداری
 *      (SoftwareConfig: accounting/fiscalMonthsCount، پیش‌فرض ۱۲) بیشتر نباشد.
 */
export class UpsertFiscalYearDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(4)
  title!: string; // فقط عدد ۴رقمی — اعتبارسنجی دقیق در سرویس

  /** میلادی 'YYYY-MM-DD' (Task 77 — DB فقط میلادی)؛ خالی = ثبت‌نشده */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  endDate?: string;

  @IsBoolean()
  isActive!: boolean;
}
