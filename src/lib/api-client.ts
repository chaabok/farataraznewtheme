import { useAuthStore } from '@/store/auth-store';

export class SessionExpiredError extends Error {
  constructor() {
    super('نشست شما منقضی شده است. دوباره وارد شوید.');
    this.name = 'SessionExpiredError';
  }
}

/**
 * Authenticated client-side fetch through the Next.js BFF gateway.
 * - attaches the user JWT
 * - on 401 → clears the session so the lock screen appears
 */
export async function apiFetch<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT'; body?: unknown } = {},
): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new SessionExpiredError();
  }

  const payload = (await res.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!res.ok) {
    throw new Error(payload?.message ?? 'خطا در ارتباط با سرور');
  }
  return payload as T;
}
