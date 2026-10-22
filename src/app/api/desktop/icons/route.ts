import { NextResponse } from 'next/server';
import { DESKTOP_SERVICE } from '@/lib/services-registry';

/** Locales the desktop-service can resolve icon names for. */
const SUPPORTED_LOCALES = new Set(['fa', 'en', 'tr', 'ar']);
const DEFAULT_LOCALE = 'fa';

/**
 * BFF gateway: forwards the desktop icons request to the NestJS
 * `desktop-service` microservice (port 3001).
 *
 * The browser only ever talks to this relative route; the internal
 * service URL and API key stay on the server side.
 *
 * `locale` is whitelisted here too (fa|en|tr|ar, default fa) so no
 * arbitrary query string is ever forwarded to the internal service.
 */
export async function GET(request: Request): Promise<NextResponse> {
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
    const upstream = new URL('/api/icons', DESKTOP_SERVICE.baseUrl);
    upstream.searchParams.set('locale', locale);

    const response = await fetch(upstream, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DESKTOP_SERVICE.apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `[gateway] desktop-service responded with ${response.status}`,
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
    console.error('[gateway] failed to reach desktop-service:', error);
    return NextResponse.json(
      { message: 'سرویس دسکتاپ در دسترس نیست. لطفاً بعداً تلاش کنید.' },
      { status: 503 },
    );
  }
}
