/**
 * Shared types for the desktop dashboard.
 */

/**
 * Supported interface languages.
 * RTL: fa, ar, ps (Pashto), ckb (Sorani Kurdish) — LTR: the rest.
 * Calendars per locale live in `src/i18n/calendar.ts`.
 */
export type Locale =
  | 'fa'
  | 'en'
  | 'tr'
  | 'ar'
  | 'hi'
  | 'ps'
  | 'ckb'
  | 'pt'
  | 'ko'
  | 'fr'
  | 'zh';

/** Text/layout direction derived from the active locale. */
export type Direction = 'rtl' | 'ltr';

/** A single icon rendered on the desktop grid (comes from desktop-service). */
export interface DesktopIconItem {
  id: string;
  name: string;
  iconKey: string;
  color: string;
  sortOrder: number;
}

/** A pinned app inside the taskbar. */
export interface TaskbarApp {
  id: string;
  label: string;
  iconKey: string;
  color: string;
  /** Whether the app shows the "running" underline indicator. */
  isActive?: boolean;
}

/** A form entry inside a module menu (from desktop-service). */
export interface ModuleFormItem {
  id: string;
  formKey: string;
  iconKey: string;
  name: string;
  sortOrder: number;
}

/** A menu (section) of a module inside the module flyout menu. */
export interface ModuleMenuItem {
  id: string;
  iconKey: string;
  name: string;
  sortOrder: number;
  forms: ModuleFormItem[];
}

/** Payload of `GET /api/desktop/menus/[moduleKey]`. */
export interface ModuleMenusPayload {
  moduleKey: string;
  menus: ModuleMenuItem[];
}

/** One of the two installation target databases (setup-service). */
export type SetupDatabaseKey = 'main' | 'secondary';

/** Installation state of one ERP module (from setup-service). */
export interface SetupServiceItem {
  moduleKey: string;
  name: string;
  selected: boolean;
  databaseKey: SetupDatabaseKey;
  recordCount: number;
}

/** One installation database card in the setup window. */
export interface SetupDatabaseItem {
  key: SetupDatabaseKey;
  file: string;
  serviceCount: number;
  recordCount: number;
}

/** Payload of `GET /api/desktop/setup/overview`. */
export interface SetupOverview {
  databases: SetupDatabaseItem[];
  services: SetupServiceItem[];
}
