import { create } from 'zustand';
import { translate } from '@/i18n';
import {
  DEFAULT_LOCALE,
  DIR_BY_LOCALE,
  LOCALE_COOKIE,
  isLocale,
} from '@/i18n/config';
import type { DesktopIconItem, Direction, Locale, TaskbarApp } from '@/types/desktop';

/**
 * Pinned apps shown in the center of the taskbar (Windows 11 style).
 * These are UI-level state; desktop icons come from the desktop-service API.
 */
const PINNED_APPS: TaskbarApp[] = [
  { id: 'explorer', label: 'pin.explorer', iconKey: 'folder', color: '#f59e0b' },
  { id: 'browser', label: 'pin.browser', iconKey: 'globe', color: '#ef4444' },
  { id: 'terminal', label: 'pin.terminal', iconKey: 'terminal', color: '#e2e8f0' },
];

/** One open module window on the desktop. */
export interface DesktopWindow {
  moduleId: string;
  /** Stacking order (higher = on top). */
  z: number;
  /** Cascade position slot when the window was opened. */
  slot: number;
}

function persistLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function applyDocumentDirection(locale: Locale, direction: Direction): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;
}

interface DesktopState {
  /** Icons fetched from the desktop-service (NestJS microservice). */
  icons: DesktopIconItem[];
  isLoading: boolean;
  error: string | null;
  /** Id of the currently selected desktop icon (single click). */
  selectedIconId: string | null;
  /** Windows 11 style start menu visibility. */
  isStartMenuOpen: boolean;
  /** Language picker popup visibility (taskbar tray). */
  isLanguageMenuOpen: boolean;
  /** Active interface language — drives RTL/LTR + all translations. */
  locale: Locale;
  /** Text/layout direction derived from `locale`. */
  direction: Direction;
  /** Apps pinned to the taskbar. */
  pinnedApps: TaskbarApp[];
  /** Open module windows with stacking order. */
  windows: DesktopWindow[];
  windowZCounter: number;
  windowSlotCounter: number;

  fetchIcons: () => Promise<void>;
  selectIcon: (id: string | null) => void;
  toggleStartMenu: (open?: boolean) => void;
  toggleLanguageMenu: (open?: boolean) => void;
  /** Switch language: updates state, cookie, <html> attrs and refetches icons. */
  setLocale: (locale: Locale) => void;
  /** Syncs the store with the locale already rendered by the server (cookie). */
  initLocaleFromDocument: () => void;
  openWindow: (moduleId: string) => void;
  closeWindow: (moduleId: string) => void;
  focusWindow: (moduleId: string) => void;
}

export const useDesktopStore = create<DesktopState>((set, get) => ({
  icons: [],
  isLoading: true,
  error: null,
  selectedIconId: null,
  isStartMenuOpen: false,
  isLanguageMenuOpen: false,
  locale: DEFAULT_LOCALE,
  direction: DIR_BY_LOCALE[DEFAULT_LOCALE],
  pinnedApps: PINNED_APPS,
  windows: [],
  windowZCounter: 10,
  windowSlotCounter: 0,

  fetchIcons: async () => {
    const locale = get().locale;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/desktop/icons?locale=${locale}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(translate(locale, 'common.desktopServiceError'));
      }
      const payload = (await res.json()) as { data: DesktopIconItem[] };
      set({ icons: payload.data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : translate(locale, 'common.serviceError'),
        isLoading: false,
      });
    }
  },

  selectIcon: (id) => set({ selectedIconId: id }),

  toggleStartMenu: (open) =>
    set((state) => ({ isStartMenuOpen: open ?? !state.isStartMenuOpen })),

  toggleLanguageMenu: (open) =>
    set((state) => ({ isLanguageMenuOpen: open ?? !state.isLanguageMenuOpen })),

  setLocale: (locale) => {
    const direction = DIR_BY_LOCALE[locale];
    persistLocaleCookie(locale);
    applyDocumentDirection(locale, direction);
    set({ locale, direction, isLanguageMenuOpen: false });
    void get().fetchIcons();
  },

  initLocaleFromDocument: () => {
    if (typeof document === 'undefined') return;
    const lang = document.documentElement.lang;
    if (isLocale(lang) && lang !== get().locale) {
      const direction = DIR_BY_LOCALE[lang];
      persistLocaleCookie(lang);
      applyDocumentDirection(lang, direction);
      set({ locale: lang, direction });
      void get().fetchIcons();
    }
  },

  openWindow: (moduleId) =>
    set((state) => {
      const nextZ = state.windowZCounter + 1;
      const existing = state.windows.find((w) => w.moduleId === moduleId);
      if (existing) {
        return {
          windows: state.windows.map((w) =>
            w.moduleId === moduleId ? { ...w, z: nextZ } : w,
          ),
          windowZCounter: nextZ,
          isStartMenuOpen: false,
        };
      }
      return {
        windows: [
          ...state.windows,
          { moduleId, z: nextZ, slot: state.windowSlotCounter },
        ],
        windowZCounter: nextZ,
        windowSlotCounter: state.windowSlotCounter + 1,
        isStartMenuOpen: false,
        selectedIconId: null,
      };
    }),

  closeWindow: (moduleId) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.moduleId !== moduleId),
    })),

  focusWindow: (moduleId) =>
    set((state) => {
      const nextZ = state.windowZCounter + 1;
      const target = state.windows.find((w) => w.moduleId === moduleId);
      if (!target || target.z === state.windowZCounter) {
        return state;
      }
      return {
        windows: state.windows.map((w) =>
          w.moduleId === moduleId ? { ...w, z: nextZ } : w,
        ),
        windowZCounter: nextZ,
      };
    }),
}));
