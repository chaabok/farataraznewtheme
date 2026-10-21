/**
 * Shared types for the desktop dashboard.
 */

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
