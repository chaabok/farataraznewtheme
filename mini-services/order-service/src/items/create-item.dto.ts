import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  customer!: string;

  @IsNumber()
  total!: number;

  @IsOptional()
  @IsIn(['new', 'processing', 'completed', 'cancelled'])
  status?: string;
}
