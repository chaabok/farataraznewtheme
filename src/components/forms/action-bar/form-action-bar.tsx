"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { ResetFieldsButton } from "./reset-button";
import { SaveButton } from "./save-button";
import { SaveNewButton } from "./save-new-button";
import { SaveCloseButton } from "./save-close-button";
import { CopyRecordButton } from "./copy-button";
import { DeleteRecordButton } from "./delete-button";
import { DeleteNewButton } from "./delete-new-button";
import { DeleteCloseButton } from "./delete-close-button";
import { PrintFormButton } from "./print-button";
import { RecordListDropdown } from "./list-dropdown";
import { HelpButton } from "./help-button";
import type { ActionBarListItem, FormAction } from "./types";

export interface FormActionBarProps {
  /* 1..10 — granular handlers (caller owns persistence + toasts) */
  onReset?: FormAction;
  onSave?: FormAction;
  onSaveNew?: FormAction;
  onSaveClose?: FormAction;
  onCopy?: FormAction;
  onDelete?: FormAction;
  onDeleteNew?: FormAction;
  onDeleteClose?: FormAction;
  onPrint?: FormAction;
  /** required for the composed «ذخیره و بستن» / «حذف و بستن» defaults */
  onClose?: FormAction;
  /** optional action 11 (Task 28) — help icon as a gradient tile at the end
      of the cluster (redesigned out of the form header); caller-owned */
  onHelp?: FormAction;

  /* action 10 — records-list dropdown */
  listItems?: ActionBarListItem[];
  listLoading?: boolean;
  onOpenListItem?: (item: ActionBarListItem) => void;

  /* capability gates (e.g. delete only when a saved record is loaded) */
  canSave?: boolean;
  canCopy?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;

  className?: string;
}

/** legacy semantics: run a, then b (used for the *-New / *-Close compositions) */
function sequence(a?: FormAction, b?: FormAction): FormAction | undefined {
  if (!a || !b) return undefined;
  return () => Promise.resolve(a()).then(() => b());
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-border" />;
}

/**
 * FormActionBar (Task 20) — the composed legacy action bar. All ten action
 * icons (each a standalone component) in the owner's right-to-left order:
 *
 *   1 ریست  |  2 ذخیره  3 ذخیره و جدید  4 ذخیره و بستن  |  5 کپی
 *   6 حذف  7 حذف و جدید  8 حذف و بستن  |  9 پرینت  10 لیست (dropdown)
 *   (+ optional 11 راهنما — Task 28, rendered right after «لیست»)
 *
 * Legacy semantics are composed automatically when granular handlers are not
 * provided: «ذخیره و جدید» = save → reset fields; «ذخیره و بستن» = save →
 * close; «حذف و جدید» = delete → reset; «حذف و بستن» = delete → close.
 * Every delete-family action asks for confirmation before deleting.
 * In RTL the first action appears right-most, exactly like the legacy bar.
 */
export function FormActionBar({
  onReset,
  onSave,
  onSaveNew,
  onSaveClose,
  onCopy,
  onDelete,
  onDeleteNew,
  onDeleteClose,
  onPrint,
  onClose,
  onHelp,
  listItems,
  listLoading,
  onOpenListItem,
  canSave = true,
  canCopy = true,
  canDelete = true,
  canPrint = true,
  className,
}: FormActionBarProps) {
  const t = useT();

  const saveNew = onSaveNew ?? sequence(onSave, onReset);
  const saveClose = onSaveClose ?? sequence(onSave, onClose);
  const deleteNew = onDeleteNew ?? sequence(onDelete, onReset);
  const deleteClose = onDeleteClose ?? sequence(onDelete, onClose);
  const print = onPrint ?? (() => window.print());

  return (
    <div
      role="toolbar"
      aria-label={t("abar.toolbar")}
      className={cn("flex w-full flex-wrap items-center gap-1.5", className)}
    >
      <ResetFieldsButton onClick={onReset} />
      <Divider />
      <SaveButton onClick={onSave} disabled={!canSave} />
      <SaveNewButton onClick={saveNew} disabled={!canSave || !saveNew} />
      <SaveCloseButton onClick={saveClose} disabled={!canSave || !saveClose} />
      <Divider />
      <CopyRecordButton onClick={onCopy} disabled={!canCopy} />
      <DeleteRecordButton onClick={onDelete} disabled={!canDelete} />
      <DeleteNewButton onClick={deleteNew} disabled={!canDelete || !deleteNew} />
      <DeleteCloseButton onClick={deleteClose} disabled={!canDelete || !deleteClose} />
      <Divider />
      <PrintFormButton onClick={print} disabled={!canPrint} />
      <RecordListDropdown
        items={listItems}
        loading={listLoading}
        onOpenListItem={onOpenListItem}
      />
      {onHelp && <HelpButton onClick={onHelp} />}
    </div>
  );
}
