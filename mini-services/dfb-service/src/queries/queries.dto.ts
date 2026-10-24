import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class QueryFieldInputDto {
  @IsString() @MinLength(1) @MaxLength(60) fieldName: string;
  @IsOptional() @IsString() @MaxLength(60) alias?: string;
  @IsOptional() @IsInt() @Min(0) orderIndex?: number;
}

export class CreateQueryDto {
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsString() @MinLength(1) @MaxLength(60) sourceTable: string; // QUERY_TABLES whitelist key
  @IsOptional() @IsString() @MaxLength(60) filterColumn?: string;
  @IsOptional() @IsString() @MaxLength(200) filterValue?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => QueryFieldInputDto) fields: QueryFieldInputDto[];
}
