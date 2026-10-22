import { IsString, IsNotEmpty, IsOptional, IsNumber } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  initialValue!: number;

  @IsOptional()
  @IsNumber()
  depreciationRate?: number;
}
