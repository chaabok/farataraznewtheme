import {
  IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class FormStyleDto {
  @IsOptional() @IsString() @MaxLength(30) theme?: string; // teal | emerald | amber | violet | rose
  @IsOptional() @IsString() @MaxLength(10) titleSize?: string; // sm | md | lg
  @IsOptional() @IsString() @MaxLength(10) font?: string; // sans | serif | mono
  /** Task 48 — bank field alignment: key "main" | "tab{i}" → start|center|end */
  @IsOptional() @IsObject() bankAlign?: Record<string, string>;
}

export class FormHeaderDto {
  @IsOptional() badge?: string;
  @IsOptional() tone?: string; // gradient tailwind pair key, e.g. "teal-emerald"
  /* Task 47 — design-studio shell style (theme / title font size / body font) */
  @IsOptional() @ValidateNested() @Type(() => FormStyleDto) style?: FormStyleDto;
}

export class FormFooterDto {
  /** Task 48 — subset of ACTION_BAR_KEYS; missing/empty = full default bar */
  @IsOptional() @IsArray() buttons?: string[];
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
  /** Task 48 — width percent of the flow row (25..100, step 5); legacy
      1=half/2=full rows normalize client-side */
  @IsOptional() @IsInt() @Min(25) @Max(100) widthSpan?: number;
  @IsOptional() defaultValue?: string | null;
  @IsOptional() queryRef?: number | null;
  @IsOptional() queryFieldKey?: string | null;
}

export class TabInputDto {
  @IsOptional() @IsInt() @Min(0) id?: number;
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(120) titleEn?: string;
  /** Task 49 — tab model: 1=grid (default/legacy, records via footer add
      button) | 2=input fields (no grid, plain input fields) */
  @IsOptional() @IsInt() @Min(1) @Max(2) tabKind?: number;
  @IsOptional() @IsInt() @Min(0) orderIndex?: number;
  /** Task 50 — hierarchy correlation keys: the studio rebuilds tabs on every
      save (fresh ids), so a records-table band and the tabs INSIDE it are
      linked with client-side keys, not DB ids. clientKey = this row's stable
      client key; parentKey = clientKey of the band row that owns this tab
      (empty/omitted = band-level row, ParentRef=0). The server resolves
      parentRef and echoes clientKey back so the fields phase can map
      tabRef to the FRESH ids. */
  @IsOptional() @IsString() @MaxLength(60) clientKey?: string;
  @IsOptional() @IsString() @MaxLength(60) parentKey?: string;
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
  @IsOptional() @IsInt() @Min(25) @Max(100) widthSpan?: number;
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
