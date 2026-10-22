import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  customer!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsIn(['draft', 'sent', 'paid'])
  status?: string;
}
