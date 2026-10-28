import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength, Min } from "class-validator";

/**
 * DetailItem DTOs — Task 144 (درخواست مالک): فرم «ایجاد تفصیلی ها» در
 * نرم‌افزار «حسابداری» → زیرمنوی «اطلاعات پایه». رکورد تفصیلی زیر یک نوع تفصیل.
 *
 * قرارداد فیلدها:
 *   · نوع تفصیل  — اجباری (detailTypeRef)؛ باید در دامنهٔ گرهٔ فعال دیده شود.
 *   · کد تفصیلی  — اختیاری؛ خالی ⇒ تخصیص خودکار از بازهٔ شماره‌گذاری همان
 *                  نوع (IsAutomatic ردیف Task 131)؛ پر ⇒ دستی با قوانین
 *                  عددی/درون‌بازه/یکتا (۴۲۲/۴۰۹).
 *   · عنوان      — اجباری، حداکثر ۱۰۰ نویسه، یکتا در همان نوع و همان گره.
 *   · توضیحات    — اختیاری، حداکثر ۵۰۰ نویسه.
 *   · فعال       — بولی (پیش‌فرض true).
 *
 * زنجیرهٔ اعتبارسنجی سرور (خط دفاعی نهایی — فرانت همان قوانین را پیش از
 * ارسال هم چک می‌کند): ۴۲۲ فیلدی، ۴۰۹ تکراری، ۴۰۴ ناموجود.
 */
export class UpsertDetailItemDto {
  /** نوع تفصیل مالک این تفصیلی. */
  @IsInt()
  @Min(1)
  detailTypeRef!: number;

  /** کد تفصیلی — اختیاری؛ خالی = خودکار از بازهٔ شماره‌گذاری. */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  isActive!: boolean;

  /**
   * Task 122 (قرارداد مشترک) — گرهٔ ساختار سازمانی هدف (از OrgScope فرانت).
   * اختیاری: نبودِ آن = دفتر مرکزی. سرور وجود/فعال‌بودنِ گره را کنترل می‌کند.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  structureId?: number;
}
