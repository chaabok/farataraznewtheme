import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber } from '@erp/shared';

export class CreateItemDto {
  @IsIn(['receipt', 'payment'])
  kind!: string;

  @IsString()
  @IsNotEmpty()
  party!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
