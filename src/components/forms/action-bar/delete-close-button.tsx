"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 8 — «حذف و بستن»: deletes the entered data (after user confirmation)
 * and then closes the current form. When the composer receives only onDelete +
 * onClose, it builds this handler automatically (delete → close).
 */
export function DeleteCloseButton({
  onClick,
  disabled,
  label,
  confirmTitle,
  confirmBody,
}: ActionBarButtonProps & { confirmTitle?: string; confirmBody?: string }) {
  const t = useT();
  const { busy, run } = useActionRun();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  return (
    <>
      <ActionIconButton
        label={label ?? t("abar.deleteClose")}
        tint="from-rose-500 to-rose-600"
        busy={busy}
        disabled={disabled}
        onClick={() => setConfirmOpen(true)}
        badge="close"
        icon={<Trash2 className="h-[18px] w-[18px]" aria-hidden />}
      />
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle ?? t("abar.confirmDeleteTitle")}
        body={confirmBody ?? t("abar.confirmDeleteBody")}
        onConfirm={() => run(onClick)}
      />
    </>
  );
}
