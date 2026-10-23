"use client";

import { Copy } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 5 — «کپی»: copies the current form's data so the user can save it as
 * a new record. The caller decides what "copy into a new form" means.
 */
export function CopyRecordButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("abar.copy")}
      tint="from-violet-500 to-violet-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick)}
      icon={<Copy className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
