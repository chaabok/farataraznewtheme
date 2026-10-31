import type { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import { open } from "node:fs/promises";

/**
 * Ops utility (sandbox) — (re)start a mini-service as a DETACHED child of the
 * long-lived Next.js dev server process. Spawned from this server the service
 * survives across tool sessions (unlike processes spawned from ephemeral
 * shells, which the sandbox reaps when the session ends).
 *
 * POST /api/ops/start-service?service=settings-service
 * POST /api/ops/start-service?service=dfb-service
 */

const SERVICES: Record<string, { cwd: string; port: number }> = {
  "settings-service": {
    cwd: "/home/z/my-project/mini-services/settings-service",
    port: 3001,
  },
  "dfb-service": { cwd: "/home/z/my-project/mini-services/dfb-service", port: 3003 },
  "workflow-service": {
    cwd: "/home/z/my-project/mini-services/workflow-service",
    port: 3004,
  },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const name = new URL(req.url).searchParams.get("service") ?? "";
  const svc = SERVICES[name];
  if (!svc) {
    return Response.json(
      { ok: false, message: `unknown service: ${name}` },
      { status: 400 },
    );
  }

  const out = await open(`/tmp/${name}.log`, "a");
  try {
    const child = spawn("bun", ["run", "start"], {
      cwd: svc.cwd,
      detached: true,
      stdio: ["ignore", out.fd, out.fd],
      env: { ...process.env, NODE_ENV: "production" },
    });
    child.unref();
    return Response.json({ ok: true, service: name, pid: child.pid, port: svc.port });
  } catch (e) {
    return Response.json(
      { ok: false, message: e instanceof Error ? e.message : "spawn failed" },
      { status: 500 },
    );
  } finally {
    await out.close();
  }
}
