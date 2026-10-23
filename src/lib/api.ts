"use client";

/** Thin client for the ERP BFF: /api/settings/** (public service) + /api/{app}/** (app mesh). */

export class ApiError extends Error {
  status: number;
  messageKey?: string;
  constructor(status: number, message: string, messageKey?: string) {
    super(message);
    this.status = status;
    this.messageKey = messageKey;
  }
}

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}/${path.replace(/^\//, "")}`, {
      headers: { "content-type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "network error", "common.error");
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* non-json */
  }
  if (!res.ok) {
    const b = (body ?? {}) as { message?: string; messageKey?: string };
    throw new ApiError(res.status, b.message ?? `HTTP ${res.status}`, b.messageKey);
  }
  return body as T;
}

export const api = {
  get: <T,>(path: string) => request<T>("/api/settings", path),
  post: <T,>(path: string, body: unknown) =>
    request<T>("/api/settings", path, { method: "POST", body: JSON.stringify(body) }),
  put: <T,>(path: string, body: unknown) =>
    request<T>("/api/settings", path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T,>(path: string) => request<T>("/api/settings", path, { method: "DELETE" }),
};

/** App-mesh client: /api/{appKey}/** — signed by the BFF, never by the browser (§4). */
export function appApi(appKey: string) {
  const base = `/api/${appKey}`;
  return {
    get: <T,>(path: string) => request<T>(base, path),
    post: <T,>(path: string, body: unknown) =>
      request<T>(base, path, { method: "POST", body: JSON.stringify(body) }),
    put: <T,>(path: string, body: unknown) =>
      request<T>(base, path, { method: "PUT", body: JSON.stringify(body) }),
    del: <T,>(path: string) => request<T>(base, path, { method: "DELETE" }),
  };
}
