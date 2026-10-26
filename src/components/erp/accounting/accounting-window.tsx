"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useAccountingNav, type AccountingSubPage } from "@/stores/accounting-nav-store";
import { useWindowChrome } from "@/components/desktop/app-window";
import { AccountingMenuHome } from "./accounting-menu-home";
import { DetailTypeForm } from "./detail-type-form";

/**
 * AccountingWindow — Task 119/120 (درخواست مالک): پنجرهٔ نرم‌افزار
 * «حسابداری» (appKey "accounting"). تا امروز placeholder بود؛ از Task 119
 * بدنهٔ واقعی با زیرمنوی «اطلاعات پایه» دارد.
 *
 * ساختار پنجره الگوی عمومی (Task 75/117) است: home = منوی اعلامی با ۴ حالت
 * نمایش؛ فرم‌های اعلامی به‌صورت زیرصفحهٔ نوار-باریک (بازگشت + breadcrumb)
 * در همین پنجره باز می‌شوند — هر فرم اعلامی یک زیرصفحه به این switch اضافه
 * می‌کند. اولین فرم (Task 120): «نوع تفصیل جدید».
 */
export function AccountingWindow() {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const [page, setPage] = React.useState<AccountingSubPage>("home");
  /* Task 82 — عنوان زندهٔ برگه = نام فرمی که کاربر می‌بیند (الگوی عمومی) */
  const chrome = useWindowChrome();
  const setWindowTitle = useDesktop((s) => s.setWindowTitle);
  const go = React.useCallback((p: AccountingSubPage) => setPage(p), []);

  React.useEffect(() => {
    if (!chrome?.windowId) return;
    const titleKey = page === "detail-type" ? "dt.formTitle" : null;
    setWindowTitle(
      chrome.windowId,
      titleKey ? `${t("app.accounting")} — ${t(titleKey as never)}` : undefined,
    );
  }, [page, t, chrome?.windowId, setWindowTitle]);

  /* §1.4 — direction-aware navigation glyphs */
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  /* Task 85 الگو — مصرف درخواست ناوبری یک‌باره (mount + idهای دیده‌نشده) */
  const navReq = useAccountingNav((s) => s.req);
  const navHandledRef = React.useRef(-1);
  React.useEffect(() => {
    if (navReq && navReq.id !== navHandledRef.current) {
      navHandledRef.current = navReq.id;
      go(navReq.page);
    }
  }, [navReq, go]);

  if (page === "detail-type") {
    return (
      <div className="flex h-full flex-col">
        {/* نوار زیرصفحهٔ باریک: حسابداری / اطلاعات پایه / نوع تفصیل جدید */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-2 scrollbar-slim">
          <button
            type="button"
            onClick={() => go("home")}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <BackIcon className="h-3.5 w-3.5" aria-hidden />
            {t("settings.back")}
          </button>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {t("acc.menuBasicInfo")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t("dt.formTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-slim">
          <DetailTypeForm onBack={() => go("home")} />
        </div>
      </div>
    );
  }

  return <AccountingMenuHome go={go} />;
}
