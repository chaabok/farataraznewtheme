/** Form action bar (Task 20 + Task 28 help) — legacy FaraTaraz-style action infrastructure. */
export { FormActionBar, type FormActionBarProps } from "./form-action-bar";

/**
 * Task 48 — canonical action keys of the legacy bar, in the owner's
 * right-to-left display order. Forms store a subset in footerJson.buttons;
 * per the owner's rule «تمامی آیکون‌های اکشن بار بصورت پیش‌فرض» a NEW form
 * is created with ALL keys (wizard default) and a form WITHOUT a stored
 * configuration renders all of them too.
 */
export const ACTION_BAR_KEYS = [
  "reset",
  "save",
  "saveNew",
  "saveClose",
  "copy",
  "delete",
  "deleteNew",
  "deleteClose",
  "print",
  "list",
] as const;
export type ActionBarKey = (typeof ACTION_BAR_KEYS)[number];
export { ActionIconButton, type ActionIconButtonProps } from "./action-icon-button";
export { ConfirmDeleteDialog } from "./confirm-delete-dialog";
export { ResetFieldsButton } from "./reset-button";
export { SaveButton } from "./save-button";
export { SaveNewButton } from "./save-new-button";
export { SaveCloseButton } from "./save-close-button";
export { CopyRecordButton } from "./copy-button";
export { DeleteRecordButton } from "./delete-button";
export { DeleteNewButton } from "./delete-new-button";
export { DeleteCloseButton } from "./delete-close-button";
export { PrintFormButton } from "./print-button";
export { RecordListDropdown } from "./list-dropdown";
export { TranslateButton } from "./translate-button";
export { HelpButton } from "./help-button";
export { useActionRun } from "./use-action-run";
export type { ActionBarButtonProps, ActionBarListItem, FormAction } from "./types";
