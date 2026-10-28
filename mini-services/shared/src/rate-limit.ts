import type { NextFunction, Request, Response } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitRule {
  /** Returns true when this rule applies to the given request. */
  match: (path: string, method: string) => boolean;
  windowMs: number;
  max: number;
}

export interface RateLimiterOptions {
  rules?: RateLimitRule[];
  /** Default sliding window (ms). */
  windowMs?: number;
  /** Default max requests per window per client. */
  max?: number;
}

/**
 * Framework-agnostic in-memory rate limiter (no NestJS DI required, so it is
 * safe across package boundaries). Sliding fixed-window per client.
 *
 * NOTE for production: swap this implementation for a distributed store
 * (e.g. Redis) when running multiple replicas.
 *
 * Client identity: first X-Forwarded-For entry (set by the local gateway)
 * falling back to the socket address.
 */
export function createRateLimiter(options: RateLimiterOptions = {}) {
  const defaultWindowMs = options.windowMs ?? 60_000;
  const defaultMax = options.max ?? 120;
  const rules = options.rules ?? [];
  const buckets = new Map<string, Bucket>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, defaultWindowMs);
  cleanup.unref?.();

  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path ?? req.url ?? '';
    const method = (req.method ?? 'GET').toUpperCase();
    const rule = rules.find((r) => r.match(path, method));
    const limit = rule?.max ?? defaultMax;
    const windowMs = rule?.windowMs ?? defaultWindowMs;

    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) ??
      req.socket?.remoteAddress ??
      'unknown';

    const key = `${rules.indexOf(rule)}:${ip}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(0, limit - bucket.count)),
    );

    if (bucket.count > limit) {
      res.status(429).json({
        message: 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد تلاش کنید.',
      });
      return;
    }

    next();
  };
}
