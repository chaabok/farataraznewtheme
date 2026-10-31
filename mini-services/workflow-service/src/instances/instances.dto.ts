import { IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * StartInstanceDto — «ارسال به رسیدگی / ارسال به گردش کار» (D-3):
 * فرم فقط entityType+entityID اعلام می‌کند (ارجاع سبک)؛ formStatus برای
 * اعتبارسنجی گلوگاه ورود (باید وضعیت «تایید کاربر» = entry-gate باشد) و
 * amount برای ارزیابی شرط آستانهٔ per فرم (D-2) در طول چرخه همراه می‌آید —
 * هیچ دادهٔ دیگری از فرم کپی نمی‌شود.
 */
export class StartInstanceDto {
  @IsString()
  @MaxLength(60)
  entityType!: string;

  @IsString()
  @MaxLength(60)
  entityId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  entityLabel?: string;

  @IsString()
  @MaxLength(60)
  startedBy!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  startedByName?: string;

  @IsOptional()
  @IsNumber()
  formStatus?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

/**
 * ActDto — اقدام استاندارد روی گام جاری (FR-04): تایید / رد / ابطال.
 * رد = دلیل اجباری (FR-05)؛ ابطال = فقط آغازگر و با دلیل (FR-13).
 */
export class ActDto {
  @IsString()
  @MaxLength(30)
  action!: string;

  @IsString()
  @MaxLength(60)
  actorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  actorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  /** مقدار مبلغ سند برای ارزیابی شرط (مثل آستانهٔ per فرم — D-2) */
  @IsOptional()
  @IsNumber()
  amount?: number;
}

/**
 * UndoFinalDto — واگرد تایید نهایی (D-5 — t178 فاز ۲): فقط نمونهٔ approved،
 * تا پیش از ثبت «اقدام آتی» در فرم‌های دیگر؛ دلیل اجباری و ثبت در تاریخچه.
 */
export class UndoFinalDto {
  @IsString()
  @MaxLength(60)
  actorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  actorName?: string;

  @IsString()
  @MaxLength(500)
  comment!: string;
}

/**
 * RegisterDependencyDto — ثبت «اقدام آتی» بر اساس سند تاییدشده در دفتر
 * وابستگی (فقط-موتور — فرم‌های مصرف‌کنندهٔ آینده). با وجود هر ردیفی،
 * واگردِ سند ۴۰۹ می‌گیرد (D-5).
 */
export class RegisterDependencyDto {
  @IsString()
  @MaxLength(60)
  dependentEntityType!: string;

  @IsString()
  @MaxLength(60)
  dependentEntityId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  dependentEntityLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  registeredBy?: string;
}
