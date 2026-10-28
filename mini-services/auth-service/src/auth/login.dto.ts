import { IsString, IsNotEmpty, MinLength, MaxLength } from '@erp/shared';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
