import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength, Min } from "class-validator";

/**
 * DetailType DTOs — Task 120 (درخواست مالک): فرم «نوع تفصیل جدید» در
 * نرم‌افزار «حسابداری» → زیرمنوی «اطلاعات پایه».
 *
 * قرارداد فیلدها (عین تصویر مالک — و بدون عنوان لاتین به فرمان صریح مالک:
 * «عنوان لاتین را نیاز نداریم که در فرم باشد»):
 *   · کد         — اجباری، حداکثر ۲۰ نویسه، یکتا در ساختار سازمانی.
 *   · عنوان      — اجباری، حداکثر ۱۰۰ نویسه، یکتا در ساختار سازمانی.
 *   · فعال است   — بولی (پیش‌فرض true — در تصویر تیک خورده).
 *   · توضیحات    — اختیاری، حداکثر ۵۰۰ نویسه (متن چندخطی عرض کامل).
 *
 * زنجیرهٔ اعتبارسنجی سرور (خط دفاعی نهایی):
 *   ۱. کد/عنوان اجباری‌اند (۴۲۲ پیام روشن).
 *   ۲. نوع تفصیل تکراری رد می‌شود (کد یا عنوان یکتا در ساختار — ۴۰۹).
 */
export class UpsertDetailTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;

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
   * Task 122 (درخواست مالک) — گرهٔ ساختار سازمانی هدف (از OrgScope فرانت).
   * اختیاری: نبودِ آن = دفتر مرکزی (قرارداد قبلی). سرور وجود/فعال‌بودنِ
   * گره را کنترل می‌کند (۴۲۲) و زنجیرهٔ ارث AppBase را از همان گره می‌سازد.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  structureId?: number;
}
