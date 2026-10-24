import type { NextRequest } from "next/server";
import { signedInternalHeaders } from "@/lib/internal-sign";

/**
 * BFF proxy for the ERP app mesh (Task 18): /api/{appKey}/** → hosting service.
 * settings → settings-service:3001 (its static /api/settings route takes precedence);
 * advancedTools → dfb-service:3003 (فرمساز — first promoted standalone app, Task 45);
 * every other appKey → apps-service:3002 (composite host, catalog-driven).
 * §3.3: browser sees relative paths only. §4: every upstream hop is HMAC-signed;
 * the internal secret never reaches the browser.
 */
const APPS_SERVICE = process.env.APPS_SERVICE_URL ?? "http://127.0.0.1:3002";
const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE_URL ?? "http://127.0.0.1:3001";
const DFB_SERVICE = process.env.DFB_SERVICE_URL ?? "http://127.0.0.1:3003";
const HOST_BY_APP: Record<string, string> = {
  settings: SETTINGS_SERVICE,
  advancedTools: DFB_SERVICE,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ app: string; path?: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const { app, path } = await ctx.params;
  const host = HOST_BY_APP[app] ?? APPS_SERVICE;
  const upstreamPath = `/${app}/${(path ?? []).join("/")}`;
  const target = `${host}${upstreamPath}${new URL(req.url).search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...signedInternalHeaders(req.method, upstreamPath),
    },
    cache: "no-store",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(target, init);
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch {
    return Response.json(
      { statusCode: 502, message: `${app} host service unavailable`, messageKey: "common.error" },
      { status: 502 },
    );
  }
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
