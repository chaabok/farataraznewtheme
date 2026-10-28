import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from '@erp/shared';

/**
 * Body of POST `/business-structure` (create) and PUT
 * `/business-structure/:id` (update). `parentRef` is only honored on
 * create — moving a node is not supported (identity fields `code` /
 * `isSystem` are always server-owned).
 */
export class SaveNodeDto {
  /** Id of the parent node (the system root record on level 1). */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  parentRef?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  titleEn?: string | null;

  /** 1=Headquarter/Holding · 2=Company · 3=Branch · 4=Agency. */
  @IsInt()
  @Min(0)
  @Max(4)
  structureType!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  manager?: string | null;

  /** Logo as a data URL (sandbox scale) — validated for size client-side. */
  @IsOptional()
  @IsString()
  @MaxLength(9_000_000)
  logoUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Body of PUT `/business-structure/root-settings` — the two root-only
 * options persisted in the namespaced Setting rows (single source of
 * truth, written atomically in one transaction).
 */
export class RootSettingsDto {
  @IsBoolean()
  shareHeadquarterData!: boolean;

  /** Enabled structure types of the whole tree (subset of 1..4). */
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(4, { each: true })
  activeStructureTypes!: number[];
}
