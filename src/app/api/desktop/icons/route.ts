import { NextResponse } from 'next/server';
import { DESKTOP_SERVICE } from '@/lib/services-registry';

/**
 * BFF gateway: forwards the desktop icons request to the NestJS
 * `desktop-service` microservice (port 3001).
 *
 * The browser only ever talks to this relative route; the internal
 * service URL and API key stay on the server side.
 */
export async function GET() {
  if (!DESKTOP_SERVICE.apiKey) {
    console.error('[gateway] DESKTOP_SERVICE_API_KEY missing');
    return NextResponse.json(
      { message: 'سرویس دسکتاپ پیکربندی نشده است' },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${DESKTOP_SERVICE.baseUrl}/api/icons`, {
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
