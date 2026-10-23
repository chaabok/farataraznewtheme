"use client";

import { Save } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 4 — «ذخیره و بستن»: saves the entered data to the database and then
 * closes the form. When the composer receives only onSave + onClose, it builds
 * this handler automatically (save → close).
 */
export function SaveCloseButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("abar.saveClose")}
      tint="from-emerald-500 to-emerald-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick)}
      badge="close"
      icon={<Save className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
