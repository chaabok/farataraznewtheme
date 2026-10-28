import { Injectable, Inject, UnauthorizedException, Logger } from '@erp/shared';
import bcrypt from 'bcryptjs';
import { signAccessToken } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    // Same message for unknown user / wrong password (no user enumeration)
    const invalid = new UnauthorizedException(
      'نام کاربری یا رمز عبور اشتباه است',
    );
    if (!user) {
      this.logger.warn(`Failed login attempt for username "${dto.username}"`);
      throw invalid;
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      this.logger.warn(`Failed login attempt for username "${dto.username}"`);
      throw invalid;
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    });

    this.logger.log(`User "${user.username}" logged in`);
    return {
      accessToken,
      user: {
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }
}
