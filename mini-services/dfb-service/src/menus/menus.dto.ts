import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateMenuDto {
  @IsOptional() @IsInt() @Min(0) parentRef?: number; // 0 = آیکون اصلی
  @IsOptional() @IsInt() @Min(1) nodeType?: number; // 1=MainIcon 2=SubMenu (derived from parentRef when omitted)
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(40) iconKey?: string;
}

export class UpdateMenuDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(40) iconKey?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() isActive?: boolean;
}
