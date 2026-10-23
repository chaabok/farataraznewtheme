"use client";

import { ChevronDown, FileText, List, Loader2 } from "lucide-react";
import { useT } from "@/stores/settings-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActionBarListItem } from "./types";

/**
 * Action 10 — «لیست»: dropdown of the previously saved records of the current
 * form. Shows the form's main fields per row; selecting a row opens that
 * record in the form (via onOpenListItem, Task 20 spec).
 */
export function RecordListDropdown({
  items,
  loading,
  disabled,
  label,
  onOpenListItem,
}: {
  items?: ActionBarListItem[];
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  onOpenListItem?: (item: ActionBarListItem) => void;
}) {
  const t = useT();
  const text = label ?? t("abar.list");
  const list = items ?? [];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={text}
          aria-label={text}
          disabled={disabled}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <List className="h-[18px] w-[18px]" aria-hidden />
          <ChevronDown className="absolute bottom-1 h-2.5 w-2.5 opacity-80" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-64 overflow-y-auto scrollbar-slim"
      >
        <DropdownMenuLabel className="text-xs">{text}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            {t("common.loading")}
          </div>
        ) : list.length === 0 ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">{t("abar.listEmpty")}</div>
        ) : (
          list.map((it) => (
            <DropdownMenuItem
              key={it.id}
              onClick={() => onOpenListItem?.(it)}
              className="cursor-pointer gap-2.5"
            >
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400"
              >
                <FileText className="h-3.5 w-3.5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-medium">{it.title}</span>
                {it.subtitle && (
                  <span className="truncate text-[10px] text-muted-foreground">
                    {it.subtitle}
                  </span>
                )}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
