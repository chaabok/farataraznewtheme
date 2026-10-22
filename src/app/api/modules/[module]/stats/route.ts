import { NextResponse } from 'next/server';
import { getModuleService } from '@/lib/services-registry';

/**
 * BFF gateway → module microservice aggregated stats:
 *   GET /api/modules/<module>/stats
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ module: string }> },
) {
  const { module: moduleId } = await context.params;
  const service = getModuleService(moduleId);
  if (!service) {
    return NextResponse.json(
      { message: 'ماژول مورد نظر یافت نشد' },
      { status: 404 },
    );
  }
  if (!service.apiKey) {
    return NextResponse.json(
      { message: 'سرویس این ماژول پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(`${service.baseUrl}/api/items/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': service.apiKey,
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
    console.error(`[gateway] module "${moduleId}" stats failed:`, error);
    return NextResponse.json(
      { message: 'سرویس این ماژول در دسترس نیست' },
      { status: 503 },
    );
  }
}
