import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  supplier!: string;

  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @IsNumber()
  total!: number;

  @IsOptional()
  @IsIn(['pending', 'approved', 'received'])
  status?: string;
}
