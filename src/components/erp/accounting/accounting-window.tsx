"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useAccountingNav, type AccountingSubPage } from "@/stores/accounting-nav-store";
import { useWindowChrome } from "@/components/desktop/app-window";
import { AccountingMenuHome } from "./accounting-menu-home";
import { DetailTypeForm } from "./detail-type-form";
import { DetailTypeNumberingForm } from "./detail-type-numbering-form";
import { DetailItemsForm } from "./detail-items-form";
import { AccountTreeForm } from "./account-tree-form";

/**
 * AccountingWindow — Task 119/120/131 (درخواست مالک): پنجرهٔ نرم‌افزار
 * «حسابداری» (appKey "accounting"). تا امروز placeholder بود؛ از Task 119
 * بدنهٔ واقعی با زیرمنوی «اطلاعات پایه» دارد.
 *
 * ساختار پنجره الگوی عمومی (Task 75/117) است: home = منوی اعلامی با ۴ حالت
 * نمایش؛ فرم‌های اعلامی به‌صورت زیرصفحهٔ نوار-باریک (بازگشت + breadcrumb)
 * در همین پنجره باز می‌شوند — هر فرم اعلامی یک زیرصفحه به این switch اضافه
 * می‌کند. فرم‌ها: «نوع تفصیل جدید» (Task 120)، «شماره گذاری تفصیلی ها»
 * (Task 131) و «ایجاد تفصیلی ها» (Task 144 — از Task 145 زیر زیرمنوی
 * «اطلاعات تفصیلی ها»).
 */

/** عنوان زندهٔ برگه به ازای هر زیرصفحهٔ فرم (Task 82 — الگوی عمومی) */
const PAGE_TITLE_KEY: Partial<Record<AccountingSubPage, string>> = {
  "detail-type": "dt.formTitle",
  "detail-type-numbering": "dtn.formTitle",
  "detail-items": "di.formTitle",
  "account-tree": "atr.formTitle",
};

/** زیرمنوی مادر هر زیرصفحه برای breadcrumb — Task 145: تفصیلی ها زیرمنوی
 *  مستقل خودش را دارد و دیگر زیر «اطلاعات پایه» نیست */
const PAGE_GROUP_KEY: Partial<Record<AccountingSubPage, string>> = {
  "detail-type": "acc.menuBasicInfo",
  "detail-type-numbering": "acc.menuBasicInfo",
  "detail-items": "acc.menuDetailInfo",
  "account-tree": "acc.menuBasicInfo",
};

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
    const titleKey = PAGE_TITLE_KEY[page];
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

  const titleKey = PAGE_TITLE_KEY[page];

  if (page !== "home" && titleKey) {
    return (
      <div className="flex h-full flex-col">
        {/* نوار زیرصفحهٔ باریک: حسابداری / اطلاعات پایه / {فرم} */}
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
            {t((PAGE_GROUP_KEY[page] ?? "acc.menuBasicInfo") as never)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t(titleKey as never)}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-slim">
          {page === "detail-type" && <DetailTypeForm onBack={() => go("home")} />}
          {page === "detail-type-numbering" && <DetailTypeNumberingForm />}
          {page === "detail-items" && <DetailItemsForm onBack={() => go("home")} />}
          {page === "account-tree" && <AccountTreeForm onBack={() => go("home")} />}
        </div>
      </div>
    );
  }

  return <AccountingMenuHome go={go} />;
}
