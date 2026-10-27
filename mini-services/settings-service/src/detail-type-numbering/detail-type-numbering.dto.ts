import { IsBoolean, IsInt, Min } from "class-validator";

/**
 * DetailTypeNumbering DTOs — Task 131 (درخواست مالک): فرم «شماره گذاری
 * تفصیلی ها» در نرم‌افزار «حسابداری» → زیرمنوی «اطلاعات پایه».
 *
 * ردیف‌ها هرگز دستی ساخته نمی‌شوند (به ازای هر نوع تفصیل، خودکار پدید
 * می‌آیند)؛ فقط ویرایشِ بازه/پرچم‌ها از این DTO می‌گذرد:
 *   · شماره شروع / شماره پایان — عدد صحیح مثبت؛ شروع ≤ پایان؛
 *   · خودکار / شرکت           — بولی (پیش‌فرض‌های تصویر مالک: تیک/خالی).
 *
 * زنجیرهٔ اعتبارسنجی سرور (خط دفاعی نهایی):
 *   ۱. اعداد صحیح مثبتِ امن (≤ 2^53-۱) — ۴۲۲؛
 *   ۲. شروع ≤ پایان — ۴۲۲؛
 *   ۳. تداخل بازه با هر ردیف دیگرِ همان گرهٔ ساختار — ۴۰۹ (قاعدهٔ مالک).
 */
export class UpdateDetailTypeNumberingDto {
  @IsInt()
  @Min(1)
  startNumber!: number;

  @IsInt()
  @Min(1)
  endNumber!: number;

  @IsBoolean()
  isAutomatic!: boolean;

  @IsBoolean()
  isCompany!: boolean;
}
