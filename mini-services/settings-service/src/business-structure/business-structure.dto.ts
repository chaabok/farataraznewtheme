import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
} from "class-validator";

const MAX_LOGO_BYTES = 300 * 1024; // dataURL size guard

export class CreateBsDto {
  @IsInt()
  @Min(0)
  parentRef!: number;

  @IsString()
  @IsNotEmpty({ message: "عنوان الزامی است" })
  @MaxLength(200)
  title!: string;

  /* Task 110 (درخواست مالک): «فیلد عنوان لاتین» حذف شد — ترجمهٔ هر زبان
     روی انبار DataTranslation نگهداری می‌شود؛ ستون قدیمی legacy می‌ماند. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  businessStructureType!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  manager?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_LOGO_BYTES)
  logoUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  businessStructureType?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  manager?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_LOGO_BYTES)
  logoUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /* root-mode only (single-endpoint transaction also mirrors these into Setting) */
  @IsOptional()
  @IsBoolean()
  isBasicInfoShared?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(8)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  activeStructureTypes?: number[];
}

export class IdParamDto {
  @IsInt()
  @Min(1)
  id!: number;
}
