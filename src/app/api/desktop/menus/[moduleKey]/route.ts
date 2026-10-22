import { NextResponse } from 'next/server';
import { DESKTOP_SERVICE } from '@/lib/services-registry';

/** Locales the desktop-service can resolve menu names for. */
const SUPPORTED_LOCALES = new Set(['fa', 'en', 'tr', 'ar', 'hi', 'ps', 'ckb', 'pt', 'ko', 'fr', 'zh']);
const DEFAULT_LOCALE = 'fa';

/**
 * Module keys are the camelCase ids shared with the frontend registry.
 * Strict whitelist → nothing but a well-formed module key is ever
 * forwarded to the internal microservice (anti-SSRF / path traversal).
 */
const MODULE_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,49}$/;

/**
 * BFF gateway: forwards the module flyout menu request to the NestJS
 * `desktop-service` microservice (port 3001).
 *
 * The browser only ever talks to this relative route; the internal
 * service URL and API key stay on the server side. `locale` is
 * whitelisted too (fa|en|tr|ar, default fa).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ moduleKey: string }> },
): Promise<NextResponse> {
  const { moduleKey } = await context.params;

  if (!MODULE_KEY_PATTERN.test(moduleKey)) {
    return NextResponse.json(
      { message: 'شناسه ماژول نامعتبر است.' },
      { status: 400 },
    );
  }

  if (!DESKTOP_SERVICE.apiKey) {
    console.error('[gateway] DESKTOP_SERVICE_API_KEY missing');
    return NextResponse.json(
      { message: 'سرویس دسکتاپ پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const requested = new URL(request.url).searchParams.get('locale') ?? '';
  const locale = SUPPORTED_LOCALES.has(requested) ? requested : DEFAULT_LOCALE;

  try {
    const upstream = new URL(
      `/api/menus/${encodeURIComponent(moduleKey)}`,
      DESKTOP_SERVICE.baseUrl,
    );
    upstream.searchParams.set('locale', locale);

    const response = await fetch(upstream, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DESKTOP_SERVICE.apiKey,
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { message: 'منویی برای این ماژول تعریف نشده است.' },
        { status: 404 },
      );
    }

    if (!response.ok) {
      console.error(
        `[gateway] desktop-service menus responded with ${response.status}`,
      );
      return NextResponse.json(
        { message: 'سرویس دسکتاپ پاسخ معتبر نداد.' },
        { status: 502 },
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[gateway] failed to reach desktop-service menus:', error);
    return NextResponse.json(
      { message: 'سرویس دسکتاپ در دسترس نیست. لطفاً بعداً تلاش کنید.' },
      { status: 503 },
    );
  }
}
