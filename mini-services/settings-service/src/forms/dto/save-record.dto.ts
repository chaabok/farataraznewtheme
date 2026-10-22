import { IsObject } from '@erp/shared';

/** Body of POST/PUT `.../records`: `{ data: { fieldKey: value } }`. */
export class SaveRecordDto {
  @IsObject()
  data!: Record<string, string | number | boolean | null>;
}
