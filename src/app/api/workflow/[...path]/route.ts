import type { NextRequest } from "next/server";
import { signedInternalHeaders } from "@/lib/internal-sign";

/**
 * BFF proxy → workflow-service (:3004 — زیرسیستم گردش کار، t177 فاز ۱).
 * The browser only ever sees relative /api/workflow/** paths (§3.3).
 * §4: every upstream hop is HMAC-signed (secret never leaves the server).
 */
const BASE = process.env.WORKFLOW_SERVICE_URL ?? "http://127.0.0.1:3004";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path?: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const upstreamPath = `/${(path ?? []).join("/")}`;
  const target = `${BASE}${upstreamPath}${new URL(req.url).search}`;

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
      { statusCode: 502, message: "workflow-service unavailable", messageKey: "common.error" },
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
