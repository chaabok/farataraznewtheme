import { Logger, ValidationPipe, type Type } from '@nestjs/common';
import { NestFactory, type NestExpressApplication } from '@nestjs/core';
import helmet from 'helmet';
import { createRateLimiter } from './rate-limit';
import type { RateLimitRule } from './rate-limit';

export interface SecureServiceOptions {
  module: Type<unknown>;
  appName: string;
  port: number;
  /** Extra rate-limit rules (e.g. stricter limits for login). */
  rateLimitRules?: RateLimitRule[];
}

/**
 * Hardened bootstrap used by every ERP microservice:
 *
 * 1. helmet security headers
 * 2. in-memory rate limiting (default 120 req/min, stricter rules optional)
 * 3. strict CORS (only the Next.js origin)
 * 4. global ValidationPipe (whitelist + forbidNonWhitelisted + transform)
 * 5. binds to 127.0.0.1 ONLY → not reachable from outside the host;
 *    external traffic must pass through the Next.js BFF gateway which
 *    injects the internal API key server-side.
 *
 * JWT + API-key guards are provided per-app via APP_GUARD (see app.module).
 */
export async function bootstrapSecureService(
  options: SecureServiceOptions,
): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(options.module);

  app.use(helmet());
  app.use(
    createRateLimiter({
      rules: [
        // Brute-force protection for credential endpoints
        {
          match: (path, method) =>
            path.endsWith('/auth/login') && method === 'POST',
          windowMs: 60_000,
          max: 10,
        },
        ...(options.rateLimitRules ?? []),
      ],
      windowMs: 60_000,
      max: 120,
    }),
  );
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: false,
  });
  app.set('trust proxy', false);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(options.port, '127.0.0.1');
  logger.log(
    `${options.appName} listening on http://127.0.0.1:${options.port}/api`,
  );
}
