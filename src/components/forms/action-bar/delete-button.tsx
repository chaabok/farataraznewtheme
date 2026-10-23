"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { ActionIconButton } from "./action-icon-button";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { useActionRun } from "./use-action-run";
import type { ActionBarButtonProps } from "./types";

/**
 * Action 6 — «حذف»: deletes the current form's data. ALWAYS asks the user for
 * confirmation first; the delete runs only after the user confirms.
 */
export function DeleteRecordButton({
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
        label={label ?? t("abar.delete")}
        tint="from-rose-500 to-rose-600"
        busy={busy}
        disabled={disabled}
        onClick={() => setConfirmOpen(true)}
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
