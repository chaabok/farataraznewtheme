"use client";

import { HelpCircle } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 11 (Task 28) — «راهنما»: opens the form's help. Redesigned from the
 * old ghost header icon into the same gradient tile as its sibling actions
 * and rendered at the end of the action-bar cluster (right after «لیست»).
 * The caller decides what "help" means (dialog, toast, wiki link…).
 */
export function HelpButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("sft.help")}
      tint="from-fuchsia-500 to-fuchsia-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick)}
      icon={<HelpCircle className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
