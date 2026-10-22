import { IsNotEmpty, IsOptional, IsString, MaxLength } from '@erp/shared';

/** POST /api/setup/services/:moduleKey/records — create a record in the DB the service is installed in. */
export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  /** Optional JSON string payload (kept generic across all modules). */
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  payload?: string;
}
