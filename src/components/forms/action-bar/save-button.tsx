"use client";

import { Save } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 2 — «ذخیره اطلاعات»: saves the data entered in the form fields.
 * The caller persists (and toasts); this button only runs the handler.
 */
export function SaveButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("abar.save")}
      tint="from-emerald-500 to-emerald-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick)}
      icon={<Save className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
