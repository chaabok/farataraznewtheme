"use client";

/**
 * FiscalYearMissingPrompt (Task 85 — درخواست مالک):
 * «اگر برنامه نصب شده بود و سال مالی ایجاد نشده بود باید به کاربر پیغام داده
 * شود "سال مالی وجود ندارد. می خواهید سال مالی را ایجاد کنید؟" اگر کاربر روی
 * دکمه بلی کلیک کرد فرم تعریف سال مالی برای کاربر باز شود»
 *
 * Contract:
 *  · «برنامه نصب شده» = پوستهٔ ERP در حال اجراست — این پیغام داخل خود پوسته
 *    (tray نوار وظیفه) سوار است، پس هر وقت بررسی انجام می‌شود برنامه نصب است؛
 *  · بلافاصله پس از نخستین بارگیری فهرست سال‌های مالی، فهرستِ خالی همین دیالوگ
 *    را «یک بار در هر نشست» برمی‌دارد (خیر/Escape/کلیک بیرون فقط می‌بندد —
 *    اجرای بعدی برنامه تا ساخته‌شدن سال مالی دوباره می‌پرسد)؛
 *  · «بلی» فرم تعریف سال مالی را باز می‌کند: برگهٔ «عمومی» که مستقیم روی
 *    زیرصفحهٔ «سال مالی جدید» فرود می‌آید (درخواست GeneralNavStore)؛
 *  · بارگیریِ خطاخورده هرگز دیالوگ را برنمی‌دارد (no false alarm).
 */

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useFiscalYear } from "@/stores/fiscal-year-store";
import { useGeneralNav } from "@/stores/general-nav-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function FiscalYearMissingPrompt() {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  /* the check runs exactly once per session — the first settled list load
     decides; later reloads (erp:records-changed) never re-open the dialog */
  const checkedRef = React.useRef(false);

  /* same hydration contract as the fiscal-year footer: rehydrate the
     persisted selection, then load the list once */
  React.useEffect(() => {
    void Promise.resolve(useFiscalYear.persist.rehydrate())
      .then(() => useFiscalYear.getState().load())
      .catch(() => useFiscalYear.getState().load());
  }, []);

  /* Task 85 — the decision comes from the store's own notifications (never a
     setState-in-effect): the FIRST settled load answers the question exactly
     once. Always safe against mount order: this effect itself triggers a
     load(), so a notification is guaranteed to follow the subscription (a
     deduped call means a footer load is in flight — it notifies on settle). */
  React.useEffect(() => {
    const decide = (s: {
      items: { id: number }[];
      loaded: boolean;
      loading: boolean;
      failed: boolean;
    }) => {
      if (checkedRef.current || !s.loaded || s.loading) return;
      checkedRef.current = true;
      if (!s.failed && s.items.length === 0) setOpen(true);
    };
    return useFiscalYear.subscribe(decide);
  }, []);

  /* بلی — فرم تعریف سال مالی: برگهٔ «عمومی»، فرود مستقیم روی زیرصفحه */
  const onYes = React.useCallback(() => {
    setOpen(false);
    useDesktop.getState().openWindow("app", "general");
    useGeneralNav.getState().requestGeneralPage("fiscal-year");
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        /* Escape / overlay / ✕ = «خیر» (safe default — just dismiss) */
        if (!o) setOpen(false);
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0">
        <div className="flex items-start gap-3.5 p-5">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400"
          >
            <CalendarDays className="h-5 w-5" />
          </span>
          <DialogHeader className="min-w-0 space-y-1.5">
            <DialogTitle className="text-base">{t("fy.missingTitle")}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {t("fy.missingAsk")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="border-t border-border/60 px-5 py-3.5">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("fy.missingNo")}
          </Button>
          <Button type="button" onClick={onYes}>
            {t("fy.missingYes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
