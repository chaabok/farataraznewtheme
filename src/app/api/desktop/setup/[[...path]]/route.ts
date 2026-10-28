import { NextResponse } from 'next/server';
import { SETUP_SERVICE } from '@/lib/services-registry';

/**
 * BFF gateway for the setup-service (application installation settings).
 *
 *   GET  /api/desktop/setup/overview
 *   PUT  /api/desktop/setup/services/<moduleKey>
 *   GET  /api/desktop/setup/services/<moduleKey>/records[?database=…]
 *   POST /api/desktop/setup/services/<moduleKey>/records
 *   POST /api/desktop/setup/exchange
 *   GET  /api/desktop/setup/health
 *
 * Security model (same as the other gateways):
 * - the upstream path is matched against a strict structural whitelist —
 *   no arbitrary path or query string is ever forwarded (no SSRF)
 * - the internal API key is injected server-side, never exposed
 * - the user's JWT is forwarded; the microservice enforces both layers
 */

const MAX_SEGMENT = 60;
const SEGMENT_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,59}$/;

type UpstreamRoute =
  | { kind: 'overview' | 'exchange' | 'health' }
  | { kind: 'service'; moduleKey: string; tail?: 'records' };

function parseRoute(segments: string[]): UpstreamRoute | null {
  if (segments.length === 0) return { kind: 'overview' };
  if (segments.length === 1) {
    if (segments[0] === 'overview') return { kind: 'overview' };
    if (segments[0] === 'health') return { kind: 'health' };
    if (segments[0] === 'exchange') return { kind: 'exchange' };
    return null;
  }
  if (segments[0] !== 'services' || segments.length > 3) return null;
  const moduleKey = segments[1];
  if (!moduleKey || moduleKey.length > MAX_SEGMENT) return null;
  if (segments.length === 2) return { kind: 'service', moduleKey };
  if (segments.length === 3 && segments[2] === 'records') {
    return { kind: 'service', moduleKey, tail: 'records' };
  }
  return null;
}

function buildUpstreamPath(route: UpstreamRoute): string {
  switch (route.kind) {
    case 'overview':
      return '/api/setup/overview';
    case 'health':
      return '/api/setup/health';
    case 'exchange':
      return '/api/setup/exchange';
    case 'service':
      return `/api/setup/services/${encodeURIComponent(route.moduleKey)}${
        route.tail ? `/${route.tail}` : ''
      }`;
  }
}

async function proxy(
  request: Request,
  segments: string[],
  method: 'GET' | 'PUT' | 'POST',
): Promise<NextResponse> {
  if (!SETUP_SERVICE.apiKey) {
    console.error('[gateway] SETUP_SERVICE_API_KEY missing');
    return NextResponse.json(
      { message: 'سرویس نصب برنامه پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const route = parseRoute(segments);
  if (!route) {
    return NextResponse.json(
      { message: 'مسیر سرویس نصب برنامه مجاز نیست' },
      { status: 400 },
    );
  }

  // Only the records list may receive an optional database filter.
  const forwardedQuery = new URLSearchParams();
  if (route.kind === 'service' && route.tail === 'records') {
    const database = new URL(request.url).searchParams.get('database');
    if (database === 'main' || database === 'secondary') {
      forwardedQuery.set('database', database);
    }
  }

  const authorization = request.headers.get('authorization') ?? '';

  try {
    const upstream = new URL(buildUpstreamPath(route), SETUP_SERVICE.baseUrl);
    const qs = forwardedQuery.toString();
    if (qs) upstream.search = qs;

    const response = await fetch(upstream, {
      method,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SETUP_SERVICE.apiKey,
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: method === 'GET' ? undefined : await request.text(),
    });

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[gateway] failed to reach setup-service:', error);
    return NextResponse.json(
      { message: 'سرویس نصب برنامه در دسترس نیست. لطفاً بعداً تلاش کنید.' },
      { status: 503 },
    );
  }
}

function splitSegments(request: Request): string[] {
  const path = new URL(request.url).pathname;
  const prefix = '/api/desktop/setup';
  const rest = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  return rest.split('/').filter(Boolean).map(decodeURIComponent);
}

export async function GET(request: Request): Promise<NextResponse> {
  return proxy(request, splitSegments(request), 'GET');
}

export async function PUT(request: Request): Promise<NextResponse> {
  return proxy(request, splitSegments(request), 'PUT');
}

export async function POST(request: Request): Promise<NextResponse> {
  return proxy(request, splitSegments(request), 'POST');
}
