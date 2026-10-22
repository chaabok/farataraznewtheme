import { IsBoolean } from '@erp/shared';

/** PUT /api/setup/services/:moduleKey — change the installation target. */
export class SetInstalledDto {
  /** true → install into the MAIN database, false → SECONDARY database. */
  @IsBoolean()
  selected!: boolean;
}
