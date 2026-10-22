import { NextResponse } from 'next/server';
import { AUTH_SERVICE } from '@/lib/services-registry';

/**
 * BFF gateway → auth-service token verification.
 * Forwards the user's Bearer token; the API key is injected server-side.
 */
export async function GET(request: Request) {
  if (!AUTH_SERVICE.apiKey) {
    return NextResponse.json(
      { message: 'سرویس احراز هویت پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(`${AUTH_SERVICE.baseUrl}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_SERVICE.apiKey,
        ...(authorization ? { Authorization: authorization } : {}),
      },
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
    console.error('[gateway] auth verify failed:', error);
    return NextResponse.json(
      { message: 'سرویس احراز هویت در دسترس نیست' },
      { status: 503 },
    );
  }
}
