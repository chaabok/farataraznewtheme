import { NextResponse } from 'next/server';
import { getModuleService } from '@/lib/services-registry';

/**
 * BFF gateway for the module-root forms listing:
 *   GET /api/modules/<module>/forms → `{ data: FormSummary[] }`
 *
 * proxied to `<module-service>/api/forms/<module>` — drives the
 * «فهرست‌های اطلاعات» data-list menus (one list per saved form).
 *
 * Security model (same as the other gateways): module whitelist, internal
 * API key injected server-side, user JWT forwarded, no path guessing.
 */
const MODULE_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,49}$/;

export async function GET(
  request: Request,
  context: { params: Promise<{ module: string }> },
): Promise<Response> {
  const { module: moduleId } = await context.params;

  if (!MODULE_KEY_PATTERN.test(moduleId)) {
    return NextResponse.json(
      { message: 'شناسه ماژول نامعتبر است' },
      { status: 400 },
    );
  }

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

  const requested = new URL(request.url).searchParams.get('locale') ?? '';
  const locale = /^[a-z]{2}$/.test(requested) ? requested : 'fa';
  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = new URL(
      `/api/forms/${encodeURIComponent(moduleId)}`,
      service.baseUrl,
    );
    upstream.searchParams.set('locale', locale);

    const response = await fetch(upstream, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': service.apiKey,
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const payload = await response.text();
    return new Response(payload, {
      status: response.status,
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
