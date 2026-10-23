/** Shared types for the legacy-style form action bar (Task 20). */

/** Any action handler: sync or async. The caller owns persistence + toasts. */
export type FormAction = () => void | Promise<void>;

/** One row of the records-list dropdown (the «لیست» icon, action 10). */
export interface ActionBarListItem {
  id: string;
  title: string;
  subtitle?: string;
}

/** Common props of every standalone action-bar button. */
export interface ActionBarButtonProps {
  onClick?: FormAction;
  disabled?: boolean;
  /** Optional label override — every button falls back to its own i18n tooltip. */
  label?: string;
}
