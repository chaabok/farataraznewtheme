import { createHmac } from "node:crypto";

/**
 * §4 Internal API security — BFF-side signer (server-only, never shipped to the browser).
 * MUST mirror mini-services/_shared/internal-auth.ts exactly:
 * canonical = `${METHOD}:${PATH}:${TIMESTAMP}` (PATH normalized: no query, no trailing slash).
 */
export const INTERNAL_KEY_HEADER = "x-internal-key";
export const INTERNAL_TS_HEADER = "x-internal-timestamp";
export const INTERNAL_SIGN_HEADER = "x-internal-signature";

/**
 * t188 — پشتوانهٔ کلید داخلی: سندباکس فایل .env ریشه را در بوتِ مجدد بازتولید
 * می‌کند (فقط DATABASE_URL می‌گذارد) و کلید از دست می‌رود ⇒ BFF با رشتهٔ خالی
 * امضا می‌کرد و همهٔ سرویس‌ها 401 «bad internal key» می‌دادند. مقدارِ پیش‌فرض
 * باید EXACTLY با mini-services/_shared/internal-auth.ts یکی باشد (مدل تهدید:
 * loopback-only — هر env موجود بر این پیش‌فرض مقدم است).
 */
export const DEFAULT_INTERNAL_API_KEY = "farataraz-internal-dev-key-2026";

export function normalizePath(pathname: string): string {
  const p = pathname.split("?")[0];
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

export function signedInternalHeaders(method: string, pathname: string): Record<string, string> {
  const secret = process.env.INTERNAL_API_KEY || DEFAULT_INTERNAL_API_KEY;
  const ts = Date.now().toString();
  const canonical = `${method.toUpperCase()}:${normalizePath(pathname)}:${ts}`;
  return {
    [INTERNAL_KEY_HEADER]: secret,
    [INTERNAL_TS_HEADER]: ts,
    [INTERNAL_SIGN_HEADER]: createHmac("sha256", secret).update(canonical).digest("hex"),
  };
}
