/**
 * §4 Internal API security — HMAC-SHA256 signed service-to-service calls (v1).
 * Canonical string: `${METHOD}:${PATH}:${TIMESTAMP}` (PATH = URL path WITHOUT query,
 * WITHOUT trailing slash). Loopback-only threat model (services bind 127.0.0.1);
 * body integrity is delegated to v2 when services leave loopback — documented in AGENTS.md §4.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const INTERNAL_KEY_HEADER = "x-internal-key";
export const INTERNAL_TS_HEADER = "x-internal-timestamp";
export const INTERNAL_SIGN_HEADER = "x-internal-signature";

export const PUBLIC_INTERNAL_METADATA = "public-internal";
export const PublicInternal = () => SetMetadata(PUBLIC_INTERNAL_METADATA, true);

export function normalizePath(pathname: string): string {
  const p = pathname.split("?")[0];
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

export function canonicalString(method: string, pathname: string, timestamp: string): string {
  return `${method.toUpperCase()}:${normalizePath(pathname)}:${timestamp}`;
}

export function signInternalRequest(
  secret: string,
  method: string,
  pathname: string,
): Record<string, string> {
  const ts = Date.now().toString();
  const sig = createHmac("sha256", secret).update(canonicalString(method, pathname, ts)).digest("hex");
  return {
    [INTERNAL_KEY_HEADER]: secret,
    [INTERNAL_TS_HEADER]: ts,
    [INTERNAL_SIGN_HEADER]: sig,
  };
}

function safeEqual(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

const ALLOWED_CLOCK_SKEW_MS = 5 * 60 * 1000;

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_INTERNAL_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const secret = process.env.INTERNAL_API_KEY;
    if (!secret) throw new UnauthorizedException("internal auth not configured");

    const key = request.headers[INTERNAL_KEY_HEADER];
    const ts = request.headers[INTERNAL_TS_HEADER];
    const sig = request.headers[INTERNAL_SIGN_HEADER];
    if (typeof key !== "string" || typeof ts !== "string" || typeof sig !== "string") {
      throw new UnauthorizedException("missing internal auth headers");
    }
    if (!safeEqual(key, secret)) throw new UnauthorizedException("bad internal key");

    const tsNum = Number(ts);
    if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum) > ALLOWED_CLOCK_SKEW_MS) {
      throw new UnauthorizedException("stale internal timestamp");
    }

    const expected = createHmac("sha256", secret)
      .update(canonicalString(request.method, request.path ?? request.url, ts))
      .digest("hex");
    if (!safeEqual(expected, sig)) throw new UnauthorizedException("bad internal signature");
    return true;
  }
}
