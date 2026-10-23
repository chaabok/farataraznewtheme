"use client";

import { Plus } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 1 — «ریست کردن فیلدهای فرم»: clears the form fields so a new record
 * can be entered (right-most icon of the legacy bar; the «+» blue tile).
 * The caller decides what "reset" means for its fields.
 */
export function ResetFieldsButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("abar.reset")}
      tint="from-sky-500 to-sky-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick)}
      icon={<Plus className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
