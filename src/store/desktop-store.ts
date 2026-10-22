import { create } from 'zustand';
import { translate } from '@/i18n';
import {
  DEFAULT_LOCALE,
  DIR_BY_LOCALE,
  LOCALE_COOKIE,
  isLocale,
} from '@/i18n/config';
import type {
  DesktopIconItem,
  Direction,
  Locale,
  ModuleMenuItem,
  ModuleMenusPayload,
  TaskbarApp,
} from '@/types/desktop';

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
  /** Module flyout menu: which module's menu is open (null = closed). */
  openMenuModuleKey: string | null;
  /** Menus + forms per `${locale}:${moduleKey}` (session cache). */
  menusCache: Record<string, ModuleMenuItem[]>;
  isMenusLoading: boolean;
  menusError: string | null;
  /** Id of the active menu inside the open module flyout. */
  activeMenuId: string | null;
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
  /** Opens the flyout menu of a module and loads its menus/forms. */
  openModuleMenu: (moduleKey: string) => void;
  closeModuleMenu: () => void;
  /** Switches the active menu inside the open module flyout. */
  selectMenu: (menuId: string) => void;
  /** Loads (or reads from cache) the menus of a module for the active locale. */
  loadModuleMenus: (moduleKey: string) => Promise<void>;
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
  openMenuModuleKey: null,
  menusCache: {},
  isMenusLoading: false,
  menusError: null,
  activeMenuId: null,
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
    set((state) => {
      const next = open ?? !state.isStartMenuOpen;
      // The start menu and the module flyout are mutually exclusive.
      return next
        ? { isStartMenuOpen: true, openMenuModuleKey: null, activeMenuId: null }
        : { isStartMenuOpen: false };
    }),

  toggleLanguageMenu: (open) =>
    set((state) => ({ isLanguageMenuOpen: open ?? !state.isLanguageMenuOpen })),

  openModuleMenu: (moduleKey) => {
    set({
      openMenuModuleKey: moduleKey,
      isStartMenuOpen: false,
      isLanguageMenuOpen: false,
      activeMenuId: null,
      menusError: null,
    });
    void get().loadModuleMenus(moduleKey);
  },

  closeModuleMenu: () =>
    set({ openMenuModuleKey: null, activeMenuId: null }),

  selectMenu: (menuId) => set({ activeMenuId: menuId }),

  loadModuleMenus: async (moduleKey) => {
    const { locale, menusCache } = get();
    const cacheKey = `${locale}:${moduleKey}`;
    const cached = menusCache[cacheKey];
    if (cached) {
      set({ activeMenuId: cached[0]?.id ?? null });
      return;
    }
    set({ isMenusLoading: true, menusError: null });
    try {
      const res = await fetch(
        `/api/desktop/menus/${encodeURIComponent(moduleKey)}?locale=${locale}`,
        { cache: 'no-store' },
      );
      if (!res.ok) {
        throw new Error(translate(locale, 'moduleMenu.loadError'));
      }
      const payload = (await res.json()) as { data: ModuleMenusPayload };
      const menus = payload.data?.menus ?? [];
      set((state) => ({
        menusCache: { ...state.menusCache, [cacheKey]: menus },
        isMenusLoading: false,
        activeMenuId:
          state.openMenuModuleKey === moduleKey
            ? (menus[0]?.id ?? null)
            : state.activeMenuId,
      }));
    } catch (error) {
      set({
        isMenusLoading: false,
        menusError:
          error instanceof Error
            ? error.message
            : translate(locale, 'common.serviceError'),
      });
    }
  },

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
          openMenuModuleKey: null,
          activeMenuId: null,
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
        openMenuModuleKey: null,
        activeMenuId: null,
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
