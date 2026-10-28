import { NextResponse } from 'next/server';
import { getModuleService } from '@/lib/services-registry';

/**
 * Generic BFF gateway for every ERP module microservice:
 *   GET  /api/modules/<module>        → list records
 *   POST /api/modules/<module>        → create record
 *
 * Security model:
 * - the module id is validated against a server-side whitelist (no SSRF)
 * - the internal API key is injected here, never exposed to the browser
 * - the user's JWT is forwarded; microservices enforce both layers
 */
async function proxy(
  request: Request,
  moduleId: string,
  method: 'GET' | 'POST',
): Promise<Response> {
  const service = getModuleService(moduleId);
  if (!service) {
    return NextResponse.json(
      { message: 'ماژول مورد نظر یافت نشد' },
      { status: 404 },
    );
  }
  if (!service.apiKey) {
    console.error(`[gateway] API key for module "${moduleId}" missing`);
    return NextResponse.json(
      { message: 'سرویس این ماژول پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(`${service.baseUrl}/api/items`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': service.apiKey,
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: method === 'POST' ? await request.text() : undefined,
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
    console.error(`[gateway] module "${moduleId}" unreachable:`, error);
    return NextResponse.json(
      { message: 'سرویس این ماژول در دسترس نیست' },
      { status: 503 },
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ module: string }> },
) {
  const { module: moduleId } = await context.params;
  return proxy(request, moduleId, 'GET');
}

export async function POST(
  request: Request,
  context: { params: Promise<{ module: string }> },
) {
  const { module: moduleId } = await context.params;
  return proxy(request, moduleId, 'POST');
}
