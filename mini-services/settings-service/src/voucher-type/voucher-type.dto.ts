import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * VoucherType DTOs — Task 153 (درخواست مالک): فرم «نوع سند جدید» در
 * نرم‌افزار «حسابداری» → زیرمنوی «سند حسابداری» (Task 150).
 *
 * قرارداد فیلدها (عین فرمان مالک — به ترتیب):
 *   · کد        — اجباری، یکتا در ساختار سازمانی.
 *   · عنوان     — اجباری، یکتا در ساختار سازمانی.
 *   · توضیحات   — اختیاری.
 *   · فعال      — بولی (پیش‌فرض true — در فرم تیک‌خورده).
 *
 * قوانین ثبت (سمت سرور — خط دفاعی نهایی):
 *   ۱. کد/عنوان اجباری‌اند و نمی‌توانند خالی باشند.
 *   ۲. نوع سند تکراری رد می‌شود (کد یا عنوان یکتا در ساختار سازمانی —
 *      هم‌راستا با unique index دوتایی جدول).
 */
export class UpsertVoucherTypeDto {
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
}
