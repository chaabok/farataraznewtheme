import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@erp/shared';
import { PublicJwt, type AccessTokenPayload } from '@erp/shared';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

interface AuthedRequest {
  user?: AccessTokenPayload;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  /**
   * Login is JWT-public (no token yet) but STILL requires the internal
   * API key injected by the gateway. Brute-force protection (10/min/IP)
   * is applied by the shared rate-limiter middleware in bootstrap().
   */
  @Post('login')
  @PublicJwt()
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Requires a valid JWT (used by the frontend on boot). */
  @Get('verify')
  async verify(@Req() request: AuthedRequest) {
    return { valid: true, user: request.user };
  }
}
