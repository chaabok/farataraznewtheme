import { IsIn, IsOptional, IsString, MaxLength, MinLength } from '@erp/shared';

/** POST /api/setup/exchange — API-based data exchange between the two databases. */
export class ExchangeDto {
  /** A module key, or "all" to exchange every module at once. */
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  moduleKey!: string;

  /** Direction of the exchange. */
  @IsIn(['toMain', 'toSecondary'])
  direction!: 'toMain' | 'toSecondary';

  /**
   * move  → copy then delete from the source database (default)
   * copy  → duplicate into the target database, keep the source
   */
  @IsOptional()
  @IsIn(['move', 'copy'])
  mode?: 'move' | 'copy';
}
