"use client";

import * as React from "react";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ActionIconButtonProps {
  /** tooltip / aria-label text (already translated by the caller) */
  label: string;
  /** tailwind gradient stops, e.g. "from-sky-500 to-sky-600" */
  tint: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  /** small corner badge (used by the save/delete family: + for «و جدید», ✕ for «و بستن») */
  badge?: "plus" | "close";
}

/**
 * Base square gradient icon-button of the form action bar (Task 20) —
 * mirrors the legacy FaraTaraz action bar: solid tinted square, white glyph,
 * hover tooltip, busy spinner, corner badge for compound actions.
 */
export function ActionIconButton({
  label,
  tint,
  icon,
  onClick,
  disabled,
  busy,
  badge,
}: ActionIconButtonProps) {
  const inactive = Boolean(disabled) || Boolean(busy);
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            aria-disabled={inactive || undefined}
            onClick={() => {
              if (!inactive) onClick?.();
            }}
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer",
              tint,
              inactive && "opacity-40 hover:brightness-100 cursor-not-allowed",
            )}
          >
            {busy ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
            ) : (
              icon
            )}
            {badge && !busy && (
              <span
                aria-hidden
                className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border"
              >
                {badge === "plus" ? (
                  <Plus className="h-2.5 w-2.5" />
                ) : (
                  <X className="h-2.5 w-2.5" />
                )}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent dir="auto" className="text-[11px]">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
