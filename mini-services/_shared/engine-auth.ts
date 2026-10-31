/**
 * §4b Engine-only endpoints — t178 (فاز ۲ گردش کار).
 *
 * موتور گردش کار برای نوشتنِ وضعیت پایانی روی فرم‌ها (D-4) و ثبتِ وابستگیِ
 * واگرد (D-5) از کلید جداگانهٔ ENGINE_API_KEY استفاده می‌کند که «فقط» در
 * .env سرویس‌هاست و در BFF Next.js نیست — بنابراین مرورگر هرگز نمی‌تواند از
 * مسیر BFFِ امضاشده قاعدهٔ «وضعیت ۳/۴ فقط از مسیر موتور» را دور بزند.
 *
 * Loopback-only threat model (هم‌الگوی internal-auth §4) — کلید ثابت با
 * timing-safe مقایسه می‌شود؛ اگر env تنظیم نشده باشد گارد همیشه رد می‌کند.
 */
import { timingSafeEqual } from "node:crypto";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const ENGINE_KEY_HEADER = "x-engine-key";

export function engineSecret(): string {
  return process.env.ENGINE_API_KEY ?? "";
}

function safeEqual(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

@Injectable()
export class EngineKeyGuard implements CanActivate {
  // Reflector برای هم‌ترازی تزریق وابستگی NestJS نگه داشته می‌شود (بدون متادیتا).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = engineSecret();
    if (!expected) {
      throw new UnauthorizedException("ENGINE_API_KEY تنظیم نشده است — endpoint فقط-موتور غیرفعال است");
    }
    const req = context.switchToHttp().getRequest();
    const got = String(req?.headers?.[ENGINE_KEY_HEADER] ?? "");
    if (!got || !safeEqual(got, expected)) {
      throw new UnauthorizedException("این endpoint فقط از موتور گردش کار قابل فراخوانی است (کلید موتور لازم است)");
    }
    return true;
  }
}

/** سرصفحه‌های کلید موتور برای فراخوانی از سمت موتور (workflow-service). */
export function engineKeyHeaders(): Record<string, string> {
  return { [ENGINE_KEY_HEADER]: engineSecret() };
}
