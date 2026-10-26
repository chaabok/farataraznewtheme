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
import { TranslateButton } from "./translate-button";
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
  /* Task 86 — mini-grid dropdown: highlight of the open record + reload */
  listActiveId?: string | null;
  onListRefresh?: () => void | Promise<void>;

  /* action 12 — «ترجمه» (Task 90 — owner: the button exists in ALL forms,
     system and non-system, and activates when ≥2 languages are selected in
     settings). Callers own the behavior: DFB forms wire their current
     record; system forms may leave them undefined (items show a hint). */
  onTranslateOnline?: FormAction;
  onTranslateOffline?: FormAction;

  /* capability gates (e.g. delete only when a saved record is loaded) */
  canSave?: boolean;
  canCopy?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;

  /** Task 48 — optional allowlist of action keys (see ACTION_BAR_KEYS).
      When provided, ONLY those icons render (stored form configuration);
      omitted/undefined = all ten icons render (legacy default — untouched
      behavior for existing consumers, §5.1 additive). */
  actions?: readonly string[];

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
 * icons (each a standalone component) in the owner's reading order:
 *
 *   10 لیست (dropdown)  |  1 ریست  |  2 ذخیره  3 ذخیره و جدید  4 ذخیره و بستن
 *   |  5 کپی  6 حذف  7 حذف و جدید  8 حذف و بستن  |  9 پرینت
 *   (+ 12 ترجمه — Task 90، در همهٔ فرم‌ها)
 *   (+ optional 11 راهنما — Task 28, rendered at the end of the cluster)
 *
 * Task 104 (درخواست مالک) — «دکمهٔ لیست اطلاعات قبل از دکمهٔ ایجاد»: the
 * records-list dropdown LEADS the bar — right-most tile in RTL / left-most
 * in LTR — immediately before the blue «+» (create) tile.
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
  listActiveId,
  onListRefresh,
  onTranslateOnline,
  onTranslateOffline,
  canSave = true,
  canCopy = true,
  canDelete = true,
  canPrint = true,
  actions,
  className,
}: FormActionBarProps) {
  const t = useT();

  /* Task 48 — per-key visibility (undefined allowlist = everything shows) */
  const show = (k: string) => !actions || actions.includes(k);
  const hasReset = show("reset");
  const hasSaveGroup = show("save") || show("saveNew") || show("saveClose");
  const hasCopyDelete = show("copy") || show("delete") || show("deleteNew") || show("deleteClose");

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
      {/* Task 104 — «لیست اطلاعات» پیش از دکمهٔ ایجاد: تریگر لیست اولین کاشی
          نوار است (در RTL راست‌ترین و در LTR چپ‌ترین)، دقیقاً پیش از کاشی
          آبی «+»؛ جداکننده فقط وقتی که ریست هم حاضر است. */}
      {show("list") && (
        <RecordListDropdown
          items={listItems}
          loading={listLoading}
          onOpenListItem={onOpenListItem}
          activeId={listActiveId}
          onRefresh={onListRefresh}
        />
      )}
      {show("list") && hasReset && <Divider />}
      {hasReset && <ResetFieldsButton onClick={onReset} />}
      {hasReset && hasSaveGroup && <Divider />}
      {show("save") && <SaveButton onClick={onSave} disabled={!canSave} />}
      {show("saveNew") && <SaveNewButton onClick={saveNew} disabled={!canSave || !saveNew} />}
      {show("saveClose") && <SaveCloseButton onClick={saveClose} disabled={!canSave || !saveClose} />}
      {hasSaveGroup && hasCopyDelete && <Divider />}
      {show("copy") && <CopyRecordButton onClick={onCopy} disabled={!canCopy} />}
      {show("delete") && <DeleteRecordButton onClick={onDelete} disabled={!canDelete} />}
      {show("deleteNew") && <DeleteNewButton onClick={deleteNew} disabled={!canDelete || !deleteNew} />}
      {show("deleteClose") && <DeleteCloseButton onClick={deleteClose} disabled={!canDelete || !deleteClose} />}
      {/* Task 104 — پرینت آخرین کاشیِ خودِ نوار است (لیست به ابتدای نوار رفت)؛
          جداکنندهٔ پیش از آن فقط با حضور خودِ پرینت معنا دارد. */}
      {hasCopyDelete && show("print") && <Divider />}
      {show("print") && <PrintFormButton onClick={print} disabled={!canPrint} />}
      {/* Task 90 — «ترجمه» renders in EVERY form (system + non-system),
          deliberately OUTSIDE the stored-actions allowlist per the owner's
          blanket rule; its enablement (≥2 active languages) lives inside. */}
      <TranslateButton
        onTranslateOnline={onTranslateOnline}
        onTranslateOffline={onTranslateOffline}
      />
      {onHelp && <HelpButton onClick={onHelp} />}
    </div>
  );
}
