import { IsString, IsNotEmpty, IsOptional } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsString()
  category?: string;
}
