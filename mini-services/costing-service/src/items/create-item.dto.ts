import { IsString, IsNotEmpty, IsOptional, IsNumber } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  product!: string;

  @IsOptional()
  @IsNumber()
  materialCost?: number;

  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @IsOptional()
  @IsNumber()
  overhead?: number;
}
