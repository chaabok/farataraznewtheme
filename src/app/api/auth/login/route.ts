import { NextResponse } from 'next/server';
import { AUTH_SERVICE } from '@/lib/services-registry';

/**
 * BFF gateway → auth-service login.
 * Injects the internal API key server-side; the browser never sees it.
 */
export async function POST(request: Request) {
  if (!AUTH_SERVICE.apiKey) {
    console.error('[gateway] AUTH_SERVICE_API_KEY missing');
    return NextResponse.json(
      { message: 'سرویس احراز هویت پیکربندی نشده است' },
      { status: 503 },
    );
  }

  try {
    const body = await request.text();
    const upstream = await fetch(`${AUTH_SERVICE.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_SERVICE.apiKey,
      },
      body,
      cache: 'no-store',
    });

    const payload = await upstream.text();
    return new Response(payload, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[gateway] auth login failed:', error);
    return NextResponse.json(
      { message: 'سرویس احراز هویت در دسترس نیست' },
      { status: 503 },
    );
  }
}
