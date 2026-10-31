import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @MaxLength(60)
  code!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  actor?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  actor?: string;
}

export class AssignmentRowDto {
  @IsString()
  @MaxLength(60)
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  scope?: string;

  /** YYYY-MM-DD یا خالی */
  @IsOptional()
  @IsString()
  validFrom?: string;

  @IsOptional()
  @IsString()
  validTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/** REPLACE-semantics bulk save of one role's assignments (t177 — grid tab). */
export class BulkAssignmentsDto {
  @IsIn(["replace"])
  mode!: "replace";

  @IsString()
  @MaxLength(60)
  roleCode!: string;

  rows!: AssignmentRowDto[];

  @IsOptional()
  @IsString()
  actor?: string;
}
