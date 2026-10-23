"use client";

import { Printer } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 9 — «پرینت»: prints the current form. Defaults to window.print()
 * when the caller does not provide a custom print handler.
 */
export function PrintFormButton({ onClick, disabled, label }: ActionBarButtonProps) {
  const t = useT();
  const { busy, run } = useActionRun();
  return (
    <ActionIconButton
      label={label ?? t("abar.print")}
      tint="from-amber-500 to-amber-600"
      busy={busy}
      disabled={disabled}
      onClick={() => run(onClick ?? (() => window.print()))}
      icon={<Printer className="h-[18px] w-[18px]" aria-hidden />}
    />
  );
}
