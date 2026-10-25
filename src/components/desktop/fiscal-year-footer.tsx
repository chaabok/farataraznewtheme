"use client";

/**
 * FiscalYearFooter (Task 82 — درخواست مالک، فوتر دسکتاپ):
 * «در فوتر دسکتاپ، لیست سال‌های مالی تعریف شده توسط کاربر نمایش داده شود و
 * کاربر اگر سال مالی را تغییر داد تمامی فرم‌های باز در تب بار باید بسته شود
 * و اگر فرمی در تب بار باز بود که دارای اطلاعات بود و ذخیره نشده بود باید به
 * کاربر آلارم داده شود که اطلاعات ذخیره نشده در فرم [نام فرم] وجود دارد.
 * آیا ادامه می‌دهید؟ اگر کاربر تایید کرد فرم بسته شود و اگر خیر را انتخاب کرد
 * فرم مورد نظر در تب بار برای کاربر نمایش داده شود.»
 *
 * Contract:
 *  · the desktop footer (taskbar tray) lists the fiscal years defined by the
 *    user (settings-service «fiscal-year» via BFF) and shows the last user
 *    selection (erp.fiscalYear, default = first defined year);
 *  · changing the year closes EVERY open form tab (the «صفحه اصلی» tab is
 *    implicit and stays — the strip itself disappears with the last tab);
 *  · before closing, each DIRTY tab (unsaved edits, useTabDirty registry)
 *    raises the owner's alarm: «اطلاعات ذخیره نشده در فرم «{form}» وجود
 *    دارد. آیا ادامه می‌دهید؟» — تأیید closes that form and walks the rest,
 *    خیر aborts the whole change, activates that form's tab (it stays open
 *    and displayed) and the year selection reverts;
 *  · a clean tab set commits instantly (no dialog at all).
 */

import * as React from "react";
import { CalendarDays, Check, ChevronDown, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useDfb } from "@/stores/dfb-store";
import { useDfbTrMap } from "@/stores/dfb-translations";
import { useFiscalYear, effectiveFiscalYearId } from "@/stores/fiscal-year-store";
import { useChromeMetrics } from "./chrome-metrics";
import { resolveWindowMeta } from "./window-meta";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/** one pending fiscal-year change: the target, the tabs still to clear and —
    while a DIRTY tab is reached — the alarm it is asking permission for */
interface GuardState {
  nextId: number;
  nextTitle: string;
  /** tab ids left to clear, in open order */
  queue: string[];
  /** the dirty tab currently raising the alarm (null = walking clean tabs) */
  asking: { id: string; title: string } | null;
}

export function FiscalYearFooter() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const metrics = useChromeMetrics();

  const items = useFiscalYear((s) => s.items);
  const loaded = useFiscalYear((s) => s.loaded);
  const savedId = useFiscalYear((s) => s.fiscalYearId);
  const trMap = useDfbTrMap(); // Task 68 — نقشهٔ ترجمهٔ زبان فعلی (برای عنوان برگه‌ها)
  /* effective current year = saved selection if still valid, else the first */
  const currentId = React.useMemo(
    () => effectiveFiscalYearId({ items, fiscalYearId: savedId } as never),
    [items, savedId],
  );
  const currentItem = React.useMemo(
    () => items.find((i) => Number(i.id) === currentId) ?? null,
    [items, currentId],
  );

  /* footer list stays live: the سال مالی form fires erp:records-changed */
  React.useEffect(() => {
    /* persist.rehydrate() is typed void | Promise<void> — normalize first */
    void Promise.resolve(useFiscalYear.persist.rehydrate())
      .then(() => useFiscalYear.getState().load())
      .catch(() => useFiscalYear.getState().load());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ entity?: string }>).detail;
      if (detail?.entity === "fiscal-year") void useFiscalYear.getState().load();
    };
    window.addEventListener("erp:records-changed", onChange);
    return () => window.removeEventListener("erp:records-changed", onChange);
  }, []);

  /* ---------- the guard state machine (event-driven, no effects) ---------- */
  const [guard, setGuard] = React.useState<GuardState | null>(null);

  /* display title of a tab — exactly what the tab strip shows */
  const tabTitle = React.useCallback(
    (id: string): string => {
      const win = useDesktop.getState().windows.find((w) => w.id === id);
      if (!win) return id;
      if (win.titleOverride) return win.titleOverride;
      const dfbTree = useDfb.getState().tree;
      return resolveWindowMeta(win, t, dfbTree, locale, trMap).title;
    },
    [t, locale, trMap],
  );

  /** walk the queue: first dirty tab asks, a clean queue commits at once */
  const advance = React.useCallback(
    (g: GuardState) => {
      const { windows, dirtyTabs } = useDesktop.getState();
      const queue = g.queue.filter((id) => windows.some((w) => w.id === id));
      while (queue.length > 0) {
        const id = queue[0];
        if (dirtyTabs[id]) {
          setGuard({ ...g, queue, asking: { id, title: tabTitle(id) } });
          return;
        }
        queue.shift();
      }
      /* every remaining tab is clean (or already gone) → close all + commit */
      useDesktop.getState().closeAllFormTabs();
      useFiscalYear.getState().setFiscalYearId(g.nextId);
      setGuard(null);
      toast.success(t("fy.changedToast").replace("{fy}", g.nextTitle));
    },
    [t, tabTitle],
  );

  const beginChange = React.useCallback(
    (nextId: number) => {
      const prev = currentId;
      if (prev === nextId) return;
      const nextTitle = items.find((i) => Number(i.id) === nextId)?.title ?? String(nextId);
      const { windows } = useDesktop.getState();
      advance({ nextId, nextTitle, queue: windows.map((w) => w.id), asking: null });
    },
    [currentId, items, advance],
  );

  /* تأیید — close the asking form, keep walking the rest */
  const onConfirm = React.useCallback(() => {
    if (!guard?.asking) return;
    const askingId = guard.asking.id;
    useDesktop.getState().closeWindow(askingId);
    advance({
      ...guard,
      queue: guard.queue.filter((q) => q !== askingId),
      asking: null,
    });
  }, [guard, advance]);

  /* خیر — abort: keep everything open, SHOW the asking form in the tab bar */
  const onDeny = React.useCallback(() => {
    if (!guard?.asking) return;
    const askingId = guard.asking.id;
    setGuard(null);
    useDesktop.getState().activateTab(askingId);
    toast.info(t("fy.changeCancelled"));
  }, [guard, t]);

  const currentTitle = currentItem?.title ?? "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={t("fy.footerAria")}
            title={t("fy.footerAria")}
            disabled={!loaded || items.length === 0}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
              metrics.tabbarOpen ? "h-8" : "h-9",
              currentItem?.isActive && "text-foreground",
            )}
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {currentItem ? (
              <span className="flex min-w-0 items-center gap-1.5">
                {currentItem.isActive && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500/60"
                  />
                )}
                <span className="max-w-24 truncate tabular-nums">{currentTitle}</span>
              </span>
            ) : (
              <span className="whitespace-nowrap text-muted-foreground">
                {t("fy.footerEmpty")}
              </span>
            )}
            {items.length > 0 && (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-48 max-h-72 overflow-y-auto scrollbar-slim"
        >
          {items.map((fy) => {
            const selected = Number(fy.id) === currentId;
            return (
              <DropdownMenuItem
                key={String(fy.id)}
                onClick={() => beginChange(Number(fy.id))}
                className={cn("gap-2", selected && "bg-accent font-semibold")}
              >
                {fy.isActive ? (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                  />
                ) : (
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" />
                )}
                <span className="min-w-0 flex-1 truncate tabular-nums">{fy.title}</span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Task 82 — the owner's alarm: unsaved data in form {name}. Do you
          want to continue? Escape / overlay / ✕ all count as «خیر» (safe). */}
      <Dialog
        open={guard?.asking != null}
        onOpenChange={(open) => {
          if (!open) onDeny();
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0">
          <div className="flex items-start gap-3.5 p-5">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400"
            >
              <TriangleAlert className="h-5 w-5" />
            </span>
            <DialogHeader className="min-w-0 space-y-1.5">
              <DialogTitle className="text-base">{t("fy.unsavedTitle")}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {t("fy.unsavedBody").replace(
                  "{form}",
                  guard?.asking?.title ?? "",
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-t border-border/60 px-5 py-3.5">
            <Button type="button" variant="outline" onClick={onDeny}>
              {t("fy.unsavedNo")}
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              {t("fy.unsavedYes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
