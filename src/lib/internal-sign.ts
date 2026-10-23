import { createHmac } from "node:crypto";

/**
 * §4 Internal API security — BFF-side signer (server-only, never shipped to the browser).
 * MUST mirror mini-services/_shared/internal-auth.ts exactly:
 * canonical = `${METHOD}:${PATH}:${TIMESTAMP}` (PATH normalized: no query, no trailing slash).
 */
export const INTERNAL_KEY_HEADER = "x-internal-key";
export const INTERNAL_TS_HEADER = "x-internal-timestamp";
export const INTERNAL_SIGN_HEADER = "x-internal-signature";

export function normalizePath(pathname: string): string {
  const p = pathname.split("?")[0];
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

export function signedInternalHeaders(method: string, pathname: string): Record<string, string> {
  const secret = process.env.INTERNAL_API_KEY ?? "";
  const ts = Date.now().toString();
  const canonical = `${method.toUpperCase()}:${normalizePath(pathname)}:${ts}`;
  return {
    [INTERNAL_KEY_HEADER]: secret,
    [INTERNAL_TS_HEADER]: ts,
    [INTERNAL_SIGN_HEADER]: createHmac("sha256", secret).update(canonical).digest("hex"),
  };
}
