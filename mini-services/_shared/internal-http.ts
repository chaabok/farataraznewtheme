/** Signed service-to-service HTTP client (§4). Never throws — returns result objects. */
import { signInternalRequest } from "./internal-auth";

export interface InternalCallResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  latencyMs: number;
  error?: string;
}

export class InternalHttpClient {
  constructor(private readonly secret: string) {}

  async call<T>(
    baseURL: string,
    path: string,
    init?: { method?: string; body?: unknown; timeoutMs?: number },
  ): Promise<InternalCallResult<T>> {
    const method = (init?.method ?? "GET").toUpperCase();
    const url = `${baseURL.replace(/\/+$/, "")}${path}`;
    const started = Date.now();
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "content-type": "application/json",
          ...signInternalRequest(this.secret, method, path),
        },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
        signal: AbortSignal.timeout(init?.timeoutMs ?? 4000),
      });
      const latencyMs = Date.now() - started;
      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        /* non-json */
      }
      return { ok: res.ok, status: res.status, data: data as T, latencyMs };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        data: null,
        latencyMs: Date.now() - started,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
