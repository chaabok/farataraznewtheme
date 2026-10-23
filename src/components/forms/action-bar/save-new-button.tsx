"use client";

import { Save } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 3 — «ذخیره و جدید»: saves the entered data to the database and then
 * resets the fields for the next record. When the composer receives only
 * onSave + onReset, it builds this handler automatically (save → reset).
 */
export function SaveNewButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("abar.saveNew")}
      tint="from-emerald-500 to-emerald-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick)}
      badge="plus"
      icon={<Save className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
