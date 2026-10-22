import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
}

/** i18n key of the last login failure (see `login.error.*` dictionaries). */
export type AuthErrorKey = 'invalidCredentials' | 'network' | 'generic';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggingIn: boolean;
  /** Raw server/debug message (kept for debugging, not shown directly). */
  error: string | null;
  /** Localizable failure kind — derived from the HTTP status. */
  errorKey: AuthErrorKey | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

/**
 * Session-scoped auth store. The JWT lives in sessionStorage so closing
 * the tab ends the session (never persisted to localStorage).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggingIn: false,
      error: null,
      errorKey: null,

      login: async (username, password) => {
        set({ isLoggingIn: true, error: null, errorKey: null });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            cache: 'no-store',
          });
          const payload = (await res.json()) as {
            accessToken?: string;
            user?: AuthUser;
            message?: string;
          };
          if (!res.ok || !payload.accessToken || !payload.user) {
            throw Object.assign(
              new Error(payload.message ?? 'ورود ناموفق بود'),
              { errorKey: res.status === 401 ? 'invalidCredentials' : 'generic' },
            );
          }
          set({
            token: payload.accessToken,
            user: payload.user,
            isLoggingIn: false,
            error: null,
            errorKey: null,
          });
          return true;
        } catch (error) {
          // Fetch/parse failures (no errorKey attached) mean the auth service
          // was unreachable; anything else carries its key from the status.
          const errorKey =
            (error as { errorKey?: AuthErrorKey }).errorKey ?? 'network';
          set({
            isLoggingIn: false,
            error:
              error instanceof Error ? error.message : 'خطای ناشناخته در ورود',
            errorKey,
          });
          return false;
        }
      },

      logout: () =>
        set({ token: null, user: null, error: null, errorKey: null }),
    }),
    {
      name: 'erp-auth-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
