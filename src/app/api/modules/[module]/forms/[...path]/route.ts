import { NextResponse } from 'next/server';
import { getModuleService } from '@/lib/services-registry';

/**
 * BFF gateway for the database-driven form system:
 *   GET    /api/modules/<module>/forms/<formKey>                     → definition
 *   GET    /api/modules/<module>/forms/<formKey>/records             → list records
 *   POST   /api/modules/<module>/forms/<formKey>/records             → create record
 *   PUT    /api/modules/<module>/forms/<formKey>/records/<recordId>  → update record
 *   DELETE /api/modules/<module>/forms/<formKey>/records/<recordId>  → delete record
 *   GET    /api/modules/<module>/forms/<formKey>/lookups/<lookupKey> → lookup options
 *
 * proxied to `<module-service>/api/forms/<module>/<...path>`.
 *
 * Security model (same as the module gateway):
 * - the module id is validated against the server-side services registry
 * - only whitelisted sub-path shapes are forwarded (no traversal / SSRF)
 * - the internal API key is injected here, never exposed to the browser
 * - the user's JWT is forwarded; microservices enforce both layers
 */

/** formKey (+ optional /records|/lookups + recordId|lookupKey) whitelist. */
const SUB_PATH_PATTERN =
  /^[a-z][a-zA-Z0-9-]{0,49}(\/(records|lookups)(\/[0-9a-fA-F-]{36}|\/[a-z][a-zA-Z0-9-]{0,49})?)?$/;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function proxy(
  request: Request,
  moduleId: string,
  subPath: readonly string[],
  method: HttpMethod,
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

  const joinedPath = subPath.join('/');
  if (!SUB_PATH_PATTERN.test(joinedPath)) {
    return NextResponse.json(
      { message: 'مسیر درخواست نامعتبر است' },
      { status: 400 },
    );
  }

  const search = new URL(request.url).search;
  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(
      `${service.baseUrl}/api/forms/${moduleId}/${joinedPath}${search}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': service.apiKey,
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body:
          method === 'POST' || method === 'PUT'
            ? await request.text()
            : undefined,
        cache: 'no-store',
      },
    );

    const payload = await upstream.text();
    // 204 (record deleted) must be returned with a null body — the Response
    // constructor rejects any body (even an empty string) for that status.
    if (upstream.status === 204 || upstream.status === 304) {
      return new Response(null, {
        status: upstream.status,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
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
  context: { params: Promise<{ module: string; path: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'GET');
}

export async function POST(
  request: Request,
  context: { params: Promise<{ module: string; path: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'POST');
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ module: string; path: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'PUT');
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ module: string; path: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'DELETE');
}
