import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber } from '@erp/shared';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(['balance_sheet', 'income_statement', 'cash_flow'])
  kind!: string;

  @IsString()
  @IsNotEmpty()
  period!: string;

  @IsNumber()
  netValue!: number;
}
