import { NextResponse } from 'next/server';
import { getModuleService } from '@/lib/services-registry';

/**
 * BFF gateway for the multi-company backbone («ساختار کسب و کار»):
 *   GET    /api/modules/settings/business-structure                → flat node list
 *   GET    /api/modules/settings/business-structure/settings       → root-only options
 *   POST   /api/modules/settings/business-structure                → create node
 *   PUT    /api/modules/settings/business-structure/root-settings  → root options (atomic)
 *   PUT    /api/modules/settings/business-structure/:id            → update node
 *   DELETE /api/modules/settings/business-structure/:id            → delete node
 *
 * proxied to `settings-service /api/business-structure/<...path>`.
 *
 * Security model (same as the forms gateway):
 * - only the `settings` module exposes this backbone (its owner service)
 * - only whitelisted sub-path shapes are forwarded (no traversal / SSRF)
 * - the internal API key is injected here, never exposed to the browser
 * - the user's JWT is forwarded; the microservice enforces both layers
 */

/** Allowed sub-path shapes: nothing, the settings read, root-settings, or a node uuid. */
const UUID_SHAPE = '[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}';
const SUB_PATH_PATTERN = new RegExp(`^(settings|root-settings|${UUID_SHAPE})?$`);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Which method may hit which sub-path shape (defense in depth). */
const METHOD_ALLOWED: Record<HttpMethod, RegExp> = {
  GET: new RegExp(`^(settings)?$`),
  POST: /^$/,
  PUT: new RegExp(`^(root-settings|${UUID_SHAPE})$`),
  DELETE: new RegExp(`^${UUID_SHAPE}$`),
};

async function proxy(
  request: Request,
  moduleId: string,
  subPath: readonly string[] | undefined,
  method: HttpMethod,
): Promise<Response> {
  // The business structure lives in the general/settings service only.
  if (moduleId !== 'settings' || !getModuleService(moduleId)) {
    return NextResponse.json(
      { message: 'ماژول مورد نظر یافت نشد' },
      { status: 404 },
    );
  }
  const service = getModuleService(moduleId)!;
  if (!service.apiKey) {
    console.error('[gateway] API key for module "settings" missing');
    return NextResponse.json(
      { message: 'سرویس این ماژول پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const joinedPath = (subPath ?? []).join('/');
  if (!SUB_PATH_PATTERN.test(joinedPath) || !METHOD_ALLOWED[method].test(joinedPath)) {
    return NextResponse.json(
      { message: 'مسیر درخواست نامعتبر است' },
      { status: 400 },
    );
  }

  const search = new URL(request.url).search;
  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(
      `${service.baseUrl}/api/business-structure${joinedPath ? `/${joinedPath}` : ''}${search}`,
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
    // 204 (node deleted) must be returned with a null body.
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
    console.error('[gateway] module "settings" unreachable:', error);
    return NextResponse.json(
      { message: 'سرویس این ماژول در دسترس نیست' },
      { status: 503 },
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ module: string; path?: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'GET');
}

export async function POST(
  request: Request,
  context: { params: Promise<{ module: string; path?: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'POST');
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ module: string; path?: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'PUT');
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ module: string; path?: string[] }> },
) {
  const { module: moduleId, path } = await context.params;
  return proxy(request, moduleId, path, 'DELETE');
}
