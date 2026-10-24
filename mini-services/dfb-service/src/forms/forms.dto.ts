import {
  IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class FormHeaderDto {
  @IsOptional() badge?: string;
  @IsOptional() tone?: string; // gradient tailwind pair key, e.g. "teal-emerald"
}

export class FormFooterDto {
  @IsOptional() @IsArray() buttons?: string[]; // subset: save | saveNew | saveClose | reset | delete | print
}

export class FieldInputDto {
  @IsOptional() @IsInt() @Min(0) id?: number; // present on update (existing field)
  @IsString() @MinLength(1) @MaxLength(60) fieldKey: string;
  @IsString() @MinLength(1) @MaxLength(120) label: string;
  @IsOptional() @IsString() @MaxLength(120) labelEn?: string;
  @IsString() fieldType: string; // text|number|select|lookup|checkbox|date|textarea
  @IsOptional() tabRef?: number | null;
  @IsOptional() section?: string; // header|body|footer (default body)
  @IsOptional() required?: boolean;
  @IsOptional() readOnly?: boolean;
  @IsOptional() @IsInt() @Min(0) orderIndex?: number;
  @IsOptional() @IsInt() @Min(1) widthSpan?: number;
  @IsOptional() defaultValue?: string | null;
  @IsOptional() queryRef?: number | null;
  @IsOptional() queryFieldKey?: string | null;
}

export class TabInputDto {
  @IsOptional() @IsInt() @Min(0) id?: number;
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @IsInt() @Min(0) orderIndex?: number;
}

export class CreateFormDto {
  @IsInt() @Min(1) menuRef: number;
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsString() componentKey: string; // simpleTwoRowTabbed | treeForm
  @IsOptional() @ValidateNested() @Type(() => FormHeaderDto) header?: FormHeaderDto;
  @IsOptional() @IsObject() body?: Record<string, unknown>;
  @IsOptional() @ValidateNested() @Type(() => FormFooterDto) footer?: FormFooterDto;
  @IsOptional() @IsInt() @Min(1) @Max(2) status?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TabInputDto) tabs?: TabInputDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FieldInputDto) fields?: FieldInputDto[];
}

export class UpdateFormDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  @IsOptional() @ValidateNested() @Type(() => FormHeaderDto) header?: FormHeaderDto;
  @IsOptional() @IsObject() body?: Record<string, unknown>;
  @IsOptional() @ValidateNested() @Type(() => FormFooterDto) footer?: FormFooterDto;
  @IsOptional() @IsInt() @Min(1) @Max(2) status?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TabInputDto) tabs?: TabInputDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FieldInputDto) fields?: FieldInputDto[];
}

export class AddFieldDto {
  @IsString() @MinLength(1) @MaxLength(60) fieldKey: string;
  @IsString() @MinLength(1) @MaxLength(120) label: string;
  @IsOptional() @IsString() @MaxLength(120) labelEn?: string;
  @IsString() fieldType: string;
  @IsOptional() tabRef?: number | null;
  @IsOptional() section?: string;
  @IsOptional() required?: boolean;
  @IsOptional() readOnly?: boolean;
  @IsOptional() @IsInt() @Min(0) orderIndex?: number;
  @IsOptional() @IsInt() @Min(1) widthSpan?: number;
  @IsOptional() defaultValue?: string | null;
  @IsOptional() queryRef?: number | null;
  @IsOptional() queryFieldKey?: string | null;
}

export class SaveFormDataDto {
  @IsOptional() @IsString() @MaxLength(120) externalKey?: string;
  /** { [fieldId: string]: string | boolean | null } */
  @IsObject() values: Record<string, string | boolean | number | null>;
}

function isValidComponentKey(key: string): boolean {
  return key === "simpleTwoRowTabbed" || key === "treeForm";
}

const FIELD_TYPES = new Set(["text", "number", "select", "lookup", "checkbox", "date", "textarea"]);

export function assertFieldType(t: string) {
  if (!FIELD_TYPES.has(t)) throw new Error(`invalid fieldType: ${t}`);
}

export function assertComponentKey(k: string) {
  if (!isValidComponentKey(k)) throw new Error(`invalid componentKey: ${k}`);
}
