import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from "class-validator";

/**
 * User — Task 126: فرم «کاربر جدید» (تنظیمات ← مدیریت کاربران).
 * DTO سبک (الگوی detail-type): پیام‌های غنی فارسی (۴۲۲) در سرویس داده می‌شود؛
 * اینجا فقط شکل و سقف طول اعتبارسنجی می‌شود.
 */

/** یک شاخهٔ درختوارهٔ دسترسی (menu | submenu | form | action). */
export class AccessItemDto {
  @IsIn(["menu", "submenu", "form", "action"])
  nodeType: string;

  @IsString()
  @Length(1, 120)
  refKey: string;
}

export class UpsertUserDto {
  /** طرف حساب منتخب (اختیاری در DTO؛ سرویس وجودش را می‌سنجد) */
  @IsOptional()
  @IsNumber()
  partyRef?: number;

  /** «نام + نام خانوادگی» اسنپ‌شده از فرم طرف حساب */
  @IsString()
  @MaxLength(200)
  fullName: string;

  /** اجباری؛ قاعدهٔ «بیشتر از ۵ نویسه» در سرویس با پیام فارسی */
  @IsString()
  @MaxLength(60)
  username: string;

  /** ثبت: اجباری — ویرایش: خالی = بدون تغییر کلمه عبور */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  password?: string;

  @IsNumber()
  userRoleRef: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** شاخه‌های تأییدشدهٔ درختوارهٔ دسترسی (هر شاخه/آیکون یک ردیف) */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessItemDto)
  accesses: AccessItemDto[];
}
