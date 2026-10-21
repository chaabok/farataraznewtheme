import { NextResponse } from 'next/server';

/**
 * BFF gateway: forwards the desktop icons request to the NestJS
 * `desktop-service` microservice (port 3001).
 *
 * The browser only ever talks to this relative route; the internal
 * service URL stays on the server side.
 */
const DESKTOP_SERVICE_URL =
  process.env.DESKTOP_SERVICE_URL ?? 'http://127.0.0.1:3001';

export async function GET() {
  try {
    const response = await fetch(`${DESKTOP_SERVICE_URL}/api/icons`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
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
