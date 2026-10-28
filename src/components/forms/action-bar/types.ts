/** Shared types for the legacy-style form action bar (Task 20). */

/** Any action handler: sync or async. The caller owns persistence + toasts. */
export type FormAction = () => void | Promise<void>;

/** حالت رکورد فرم — Task 145: از مونولیت حذف‌شدهٔ action-bar.tsx به اینجا
 *  منتقل شد تا مصرف‌کنندگان «./action-bar» (form-window، forms/index) همچنان
 *  به‌صورت type-only resolve شوند؛ مونولیت مسیر پوشهٔ مرجع را shadow می‌کرد. */
export type FormMode = "view" | "new" | "edit";

/** Task 86 — one column cell of the mini-grid list dropdown: the field label
    (column header) and the record's display value for that field. */
export interface ActionBarListCell {
  label: string;
  value: string;
}

/** One row of the records-list dropdown (the «لیست» icon, action 10).
    Task 86 — `cells` feeds the mini-grid presentation (column per field);
    absent cells fall back to the legacy title/subtitle two columns. */
export interface ActionBarListItem {
  id: string;
  title: string;
  subtitle?: string;
  cells?: ActionBarListCell[];
}

/** Common props of every standalone action-bar button. */
export interface ActionBarButtonProps {
  onClick?: FormAction;
  disabled?: boolean;
  /** Optional label override — every button falls back to its own i18n tooltip. */
  label?: string;
}
