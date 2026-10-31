/**
 * Cartable DTOs — t179 فاز ۳ (کارتابل/ابلاغ/تفویض/SLA).
 * قرارداد فرم‌های سرویس: class-validator با @IsString/@IsOptional و…
 */
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class MarkReadDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ids?: number[];
}

export class CreateDelegationDto {
  @IsString()
  roleCode!: string;

  @IsString()
  delegatorUserId!: string;

  @IsOptional()
  @IsString()
  delegatorName?: string;

  @IsString()
  delegateUserId!: string;

  @IsOptional()
  @IsString()
  delegateName?: string;

  /** ISO — شروع بازهٔ تفویض (الزامی) */
  @IsISO8601()
  validFrom!: string;

  /** ISO — پایان بازه (اختیاری = تا اطلاع ثانوی) */
  @IsOptional()
  @IsISO8601()
  validTo?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  actor?: string;
}

export class UpdateDelegationDto {
  @IsOptional()
  @IsISO8601()
  validFrom?: string;

  @IsOptional()
  @IsISO8601()
  validTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  actor?: string;
}

/** بدنهٔ runSlaCheck — now فقط برای اجرای دستی/تست */
export class SlaCheckDto {
  @IsOptional()
  @IsISO8601()
  now?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
