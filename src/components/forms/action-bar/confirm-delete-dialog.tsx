"use client";

import * as React from "react";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Confirmation dialog required before every delete-family action
 * (حذف / حذف و جدید / حذف و بستن — actions 6, 7, 8 of the legacy bar).
 * The delete runs only after the user confirms (Task 20 spec).
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  body,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** override texts; default to the i18n confirm-delete strings */
  title?: string;
  body?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const t = useT();
  const [working, setWorking] = React.useState(false);

  const confirm = async () => {
    setWorking(true);
    try {
      await onConfirm();
    } finally {
      setWorking(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir="auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
            {title ?? t("abar.confirmDeleteTitle")}
          </DialogTitle>
          <DialogDescription className="text-start leading-relaxed">
            {body ?? t("abar.confirmDeleteBody")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={working}
            className="cursor-pointer"
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={working}
            className="cursor-pointer"
          >
            {working ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden />
            )}
            {t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
