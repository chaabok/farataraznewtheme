import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IS_PUBLIC_JWT_KEY } from './decorators';
import { verifyAccessToken } from './jwt';

export function hasMetadata(ctx: ExecutionContext, key: string): boolean {
  return (
    Reflect.getMetadata(key, ctx.getHandler()) === true ||
    Reflect.getMetadata(key, ctx.getClass()) === true
  );
}

/**
 * Global JWT guard: every route requires `Authorization: Bearer <token>`
 * unless decorated with @PublicJwt().
 * Verifies HS256 signature, issuer and expiry (jose).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (hasMetadata(ctx, IS_PUBLIC_JWT_KEY)) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const header: unknown = request.headers?.['authorization'];

    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('توکن احراز هویت ارسال نشده است');
    }

    try {
      request.user = await verifyAccessToken(header.slice(7).trim());
      return true;
    } catch {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده است');
    }
  }
}
