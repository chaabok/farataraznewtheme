import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggingIn: boolean;
  error: string | null;
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

      login: async (username, password) => {
        set({ isLoggingIn: true, error: null });
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
            throw new Error(payload.message ?? 'ورود ناموفق بود');
          }
          set({
            token: payload.accessToken,
            user: payload.user,
            isLoggingIn: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isLoggingIn: false,
            error:
              error instanceof Error ? error.message : 'خطای ناشناخته در ورود',
          });
          return false;
        }
      },

      logout: () => set({ token: null, user: null, error: null }),
    }),
    {
      name: 'erp-auth-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
