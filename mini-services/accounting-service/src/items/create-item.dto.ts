import { IsString, IsNotEmpty, IsOptional, IsNumber } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  debit?: number;

  @IsOptional()
  @IsNumber()
  credit?: number;
}
