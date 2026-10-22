import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { IS_PUBLIC_API_KEY } from './decorators';
import { hasMetadata } from './jwt-auth.guard';

/** Constant-time string comparison to avoid timing attacks. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Global internal API-key guard: every route requires the `x-api-key`
 * header to match the service's SERVICE_API_KEY env value, unless
 * decorated with @PublicApiKey().
 *
 * The key is injected server-side by the Next.js BFF gateway and is
 * never exposed to browsers, so external clients can never reach the
 * microservices directly (defense in depth on top of JWT).
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    if (hasMetadata(ctx, IS_PUBLIC_API_KEY)) {
      return true;
    }

    const expected = process.env.SERVICE_API_KEY;
    if (!expected) {
      throw new UnauthorizedException('سرویس به‌درستی پیکربندی نشده است');
    }

    const request = ctx.switchToHttp().getRequest();
    const provided = request.headers?.['x-api-key'];

    if (typeof provided !== 'string' || !safeEqual(provided, expected)) {
      throw new UnauthorizedException('API key نامعتبر است');
    }
    return true;
  }
}
