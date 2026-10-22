/**
 * Shared types for the desktop dashboard.
 */

/** Supported interface languages. `fa`/`ar` are RTL, `en`/`tr` are LTR. */
export type Locale = 'fa' | 'en' | 'tr' | 'ar';

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
