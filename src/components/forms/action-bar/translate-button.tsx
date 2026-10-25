"use client";

/**
 * Action 12 — «ترجمه» (Task 90 — درخواست مالک):
 * «دکمه ترجمه باید در تمامی فرم های سیستم و غیرسیستمی وجود داشته باشد.
 *  اگر کاربر 2 زبان را در تنظیمات انتخاب کرده بود باید دکمه ترجمه در
 *  اکشن بار فعال گردد»
 *
 * Contract:
 *  · در همهٔ فرم‌ها (سیستمی و غیرسیستمی) رندر می‌شود — مستقل از allowlist
 *    ذخیره‌شدهٔ فرم (فرمان صریح مالک)؛
 *  · فعال بودن کاشی = حداقل دو زبان فعال (fa زبان پایه و همیشه فعال است)؛
 *  · منوی کشویی عین الگوی «فهرست کلّی» (Task 70):
 *      ✨ ترجمهٔ خودکار (آنلاین) → onTranslateOnline
 *      ⌨  ورود دستی (آفلاین)   → onTranslateOffline
 *  · فرم‌هایی که هنوز رفتار ترجمه برای داده‌شان بسته نشده (دادهٔ فرم‌های
 *    سیستمی بیرون از dfb.db است) آیتم‌های غیرفعال با توضیح نمایش می‌دهند —
 *    بدون کلیک مرده؛
 *  · busy داخلی: تا پایان فراخوانی آنلاین، چرخان + قفل آیتم‌ها.
 */

import * as React from "react";
import { Keyboard, Languages, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT, useSettings } from "@/stores/settings-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TranslateButton({
  onTranslateOnline,
  onTranslateOffline,
  disabled,
}: {
  /** online auto-translate of the form's current record (caller-owned) */
  onTranslateOnline?: () => void | Promise<void>;
  /** offline manual entry dialog of the form's current record (caller-owned) */
  onTranslateOffline?: () => void;
  disabled?: boolean;
}) {
  const t = useT();
  const activeLocales = useSettings((s) => s.activeLocales);
  const label = t("dfb.list.translate");

  /* owner rule: the tile is active only with ≥2 active languages */
  const langsOk = activeLocales.length >= 2;
  const inactive = Boolean(disabled) || !langsOk;
  /* does this form have translation behavior wired for its data? */
  const wired = Boolean(onTranslateOnline || onTranslateOffline);
  const targetCount = React.useMemo(
    () => activeLocales.filter((l) => l !== "fa").length,
    [activeLocales],
  );

  const [busy, setBusy] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const runOnline = React.useCallback(async () => {
    if (!onTranslateOnline) return;
    setBusy(true);
    try {
      await onTranslateOnline();
    } finally {
      setBusy(false);
    }
  }, [onTranslateOnline]);

  return (
    <TooltipProvider delayDuration={250}>
      {/* open-ring is driven by state — Tooltip's and Dropdown's data-state
          both write to this button and would clash (same as the list trigger) */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild disabled={inactive}>
              <button
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-disabled={inactive || undefined}
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  "border border-purple-300/60 bg-gradient-to-br from-purple-500 to-purple-600 text-white",
                  "shadow-md shadow-purple-600/30 transition-all duration-150",
                  "hover:brightness-110 hover:shadow-lg hover:shadow-purple-600/40 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 disabled:hover:shadow-md disabled:active:scale-100",
                  "cursor-pointer",
                  menuOpen && !inactive && "border-purple-200/80 ring-2 ring-purple-300/70",
                )}
              >
                {busy ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                ) : (
                  <Languages className="h-[18px] w-[18px]" aria-hidden />
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent dir="auto" className="text-[11px]">
            {label}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuItem
            disabled={!wired || !onTranslateOnline || busy}
            onClick={() => void runOnline()}
          >
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="flex flex-col">
              <span>{t("dfb.list.translateOnline")}</span>
              <span className="text-[10px] text-muted-foreground">
                {wired && onTranslateOnline
                  ? `${targetCount} ${t("dfb.list.translateLangsHint")}`
                  : t("abar.translateUnavailable")}
              </span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!wired || !onTranslateOffline || busy}
            onClick={onTranslateOffline}
          >
            <Keyboard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="flex flex-col">
              <span>{t("dfb.list.translateOffline")}</span>
              <span className="text-[10px] text-muted-foreground">
                {wired && onTranslateOffline
                  ? t("dfb.list.translateOfflineHint")
                  : t("abar.translateUnavailable")}
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
