import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateIconDto {
  /** Display name shown under the icon, e.g. "این کامپیوتر" */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Key mapped to a Lucide icon on the frontend, e.g. "monitor" */
  @IsString()
  @IsNotEmpty()
  iconKey: string;

  /** Hex tile color, e.g. "#38bdf8" */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a hex color' })
  color?: string;

  /** Ordering inside the desktop grid */
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
