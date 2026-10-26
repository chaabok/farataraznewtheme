import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * UserRole DTOs — Task 100 (درخواست مالک): فرم «نقش کاربری جدید» در پنجرهٔ
 * تنظیمات ← مدیریت کاربران.
 *
 *   · کد نقش / عنوان نقش — اجباری؛ یکتا در ساختار سازمانی (سرور 409 برای تکراری).
 *   · توضیحات — اختیاری.
 *   · فعال — بولی (پیش‌فرض تیک در فرانت).
 *   · softwareKeys  — کلیدهای نرم‌افزارهای برگزیده (appKey از Systems)؛
 *     آرایهٔ خالی = «همهٔ نرم‌افزارها» (بدون محدودیت).
 *   · structureIds  — شناسه‌های گره‌های برگزیدهٔ ساختار سازمانی (رشتهٔ عددی)؛
 *     آرایهٔ خالی = «کل ساختار سازمانی» (بدون محدودیت)؛ معنای هر گره شامل
 *     زیرمجموعه‌هایش است.
 *
 * اعتبارسنجی محتوایی (وجود appKey/گره در Systems/BusinessStructure، تکراری
 * نبودن کد/عنوان) در سرویس انجام می‌شود — خط دفاعی نهایی سمت سرور.
 */
export class UpsertUserRoleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  softwareKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  structureIds?: string[];
}
