import { create } from 'zustand';
import { translate } from '@/i18n';
import { apiFetch } from '@/lib/api-client';
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
  /** Present only for database-driven form windows (`form:<formKey>`). */
  form?: FormWindowInfo;
}

/** Descriptor of a DB-driven form opened as its own desktop window. */
export interface FormWindowInfo {
  /** Owning module key, e.g. `settings` — used to build the API path. */
  moduleKey: string;
  /** Form definition key, e.g. `account-class`. */
  formKey: string;
  /** Display name (localized by the menu that opened the form). */
  name: string;
  /** Lucide icon key for the window chrome. */
  iconKey: string;
  /** Preselect this record after load (opened from a data list). */
  recordId?: string;
  /** Start in "new record" mode (opened from a data list). */
  startInNew?: boolean;
  /** Changes on every list-driven open → forces the form to reload. */
  nonce?: number;
}

/** Descriptor of a data-list tab browsing the records of one form. */
export interface ListWindowInfo {
  /** Owning module key, e.g. `settings` — used to build the API path. */
  moduleKey: string;
  /** Form definition key, e.g. `account-class` (without the list: prefix). */
  formKey: string;
  /** Display name (localized by the menu that opened the list). */
  name: string;
  /** Lucide icon key for the window chrome. */
  iconKey: string;
}

/** Kind of a workspace tab shown in the dashboard tab bar. */
export type DesktopTabKind =
  | 'home'
  | 'form'
  | 'list'
  | 'module'
  | 'business-structure';

/**
 * One browser-style workspace tab of the dashboard tab bar. The Home tab
 * hosts the live desktop (icons + flyout menus + floating windows); every
 * opened form/module gets its own tab and stays alive while hidden.
 */
export interface DesktopTab {
  /** `home` | `form:<formKey>` | `module:<moduleId>`. */
  id: string;
  kind: DesktopTabKind;
  /** Display title captured when the tab was opened (menu-provided). */
  title: string;
  /** Lucide icon key resolved through the shared icon registry. */
  iconKey: string;
  /** Accent hex used by the active-tab glow. */
  accentColor: string;
  /** Present for kind `form`. */
  form?: FormWindowInfo;
  /** Present for kind `list` — records browser of one form. */
  list?: ListWindowInfo;
  /** Present for kind `business-structure` — the multi-company backbone. */
  businessStructure?: { name: string; iconKey: string };
  /** Present for kind `module`. */
  moduleId?: string;
}

/** The permanent first tab: the live desktop itself. */
const HOME_TAB: DesktopTab = {
  id: 'home',
  kind: 'home',
  title: 'home',
  iconKey: 'monitor',
  accentColor: '#38bdf8',
};

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
  /** Workspace tabs of the tab bar — Home first, one per opened form/module. */
  tabs: DesktopTab[];
  /** Id of the active tab (`home` shows the desktop). */
  activeTabId: string;
  /** True once the tab bar has been revealed (first module menu open). */
  isTabBarActive: boolean;

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
  /** Opens (or focuses) a database-driven form window (`form:<formKey>`). */
  openFormWindow: (form: FormWindowInfo) => void;
  closeWindow: (moduleId: string) => void;
  focusWindow: (moduleId: string) => void;
  /** Opens (or focuses) a tab for a database-driven form; menu stays open. */
  addFormTab: (form: FormWindowInfo) => void;
  /** Opens (or focuses) the records list tab of a database-driven form. */
  addListTab: (list: ListWindowInfo) => void;
  /** Opens (or focuses) the «ساختار کسب و کار» backbone window. */
  addBusinessStructureTab: (info: { name: string; iconKey: string }) => void;
  /** Opens (or focuses) a tab hosting the generic module app. */
  addModuleTab: (info: {
    moduleId: string;
    name: string;
    iconKey: string;
    color?: string;
  }) => void;
  /** Switches the active workspace tab. */
  activateTab: (id: string) => void;
  /** Closes a tab (Home cannot be closed); activates the neighbour. */
  closeTab: (id: string) => void;
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
  tabs: [HOME_TAB],
  activeTabId: 'home',
  isTabBarActive: false,

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
      // The tab bar is revealed the first time a module menu opens and
      // then stays for the rest of the session (Home tab is always there).
      isTabBarActive: true,
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
      // apiFetch attaches the user JWT so the gateway can forward it to
      // the module services when enriching with the data-lists menu.
      const payload = await apiFetch<{ data: ModuleMenusPayload }>(
        `/api/desktop/menus/${encodeURIComponent(moduleKey)}?locale=${locale}`,
      );
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

  /**
   * Opens a form window reusing the generic openWindow slot/z logic,
   * then attaches the form descriptor so the window layer can render
   * the generic DataFormWindow instead of a module window.
   */
  openFormWindow: (form) => {
    const moduleId = `form:${form.formKey}`;
    get().openWindow(moduleId);
    set((state) => ({
      windows: state.windows.map((w) =>
        w.moduleId === moduleId ? { ...w, form } : w,
      ),
    }));
  },

  closeWindow: (moduleId) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.moduleId !== moduleId),
    })),

  /** Opens (or refocuses) a tab for a database-driven form. */
  addFormTab: (form) => {
    const id = `form:${form.formKey}`;
    set((state) => {
      const exists = state.tabs.some((tab) => tab.id === id);
      const tab: DesktopTab = {
        id,
        kind: 'form',
        title: form.name,
        iconKey: form.iconKey,
        accentColor: '#38bdf8',
        form,
      };
      return {
        tabs: exists
          ? state.tabs.map((candidate) =>
              candidate.id === id ? { ...candidate, ...tab } : candidate,
            )
          : [...state.tabs, tab],
        activeTabId: id,
        isTabBarActive: true,
        // NOTE: the module flyout menu intentionally stays open — it lives
        // on the Home tab and reappears when the user switches back to it.
      };
    });
  },

  /** Opens (or refocuses) the records list tab of a database-driven form. */
  addListTab: (list) => {
    const id = `list:${list.formKey}`;
    set((state) => {
      const exists = state.tabs.some((tab) => tab.id === id);
      const tab: DesktopTab = {
        id,
        kind: 'list',
        title: list.name,
        iconKey: list.iconKey,
        accentColor: '#38bdf8',
        list,
      };
      return {
        tabs: exists
          ? state.tabs.map((candidate) =>
              candidate.id === id ? { ...candidate, ...tab } : candidate,
            )
          : [...state.tabs, tab],
        activeTabId: id,
        isTabBarActive: true,
      };
    });
  },

  /** Opens (or refocuses) the «ساختار کسب و کار» backbone window. */
  addBusinessStructureTab: ({ name, iconKey }) => {
    const id = 'business-structure';
    set((state) => {
      const exists = state.tabs.some((tab) => tab.id === id);
      const tab: DesktopTab = {
        id,
        kind: 'business-structure',
        title: name,
        iconKey,
        accentColor: '#38bdf8',
        businessStructure: { name, iconKey },
      };
      return {
        tabs: exists
          ? state.tabs.map((candidate) =>
              candidate.id === id ? { ...candidate, ...tab } : candidate,
            )
          : [...state.tabs, tab],
        activeTabId: id,
        isTabBarActive: true,
      };
    });
  },

  /** Opens (or refocuses) a tab hosting the generic module app. */
  addModuleTab: ({ moduleId, name, iconKey, color }) => {
    const id = `module:${moduleId}`;
    set((state) => {
      const exists = state.tabs.some((tab) => tab.id === id);
      const tab: DesktopTab = {
        id,
        kind: 'module',
        title: name,
        iconKey,
        accentColor: color ?? '#38bdf8',
        moduleId,
      };
      return {
        tabs: exists
          ? state.tabs.map((candidate) =>
              candidate.id === id ? { ...candidate, ...tab } : candidate,
            )
          : [...state.tabs, tab],
        activeTabId: id,
        isTabBarActive: true,
      };
    });
  },

  activateTab: (id) => set({ activeTabId: id }),

  closeTab: (id) =>
    set((state) => {
      if (id === 'home') return state; // the desktop tab is permanent
      const index = state.tabs.findIndex((tab) => tab.id === id);
      if (index === -1) return state;
      const tabs = state.tabs.filter((tab) => tab.id !== id);
      const wasActive = state.activeTabId === id;
      return {
        tabs,
        // Activate the neighbour before the closed tab (Home fallback).
        activeTabId: wasActive
          ? (tabs[Math.max(0, index - 1)]?.id ?? 'home')
          : state.activeTabId,
      };
    }),

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
