"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useGeneralNav, type GeneralSubPage } from "@/stores/general-nav-store";
import { useWindowChrome } from "@/components/desktop/app-window";
import { FiscalYearForm } from "@/components/erp/general/fiscal-year-form";
import { PartyForm } from "@/components/forms/common/Party";
import { GeoLocationsForm } from "@/components/erp/general/geo-locations-form";
import { CurrencyTypeForm } from "@/components/erp/general/currency-type-form";
import { ExchangeRateForm } from "@/components/erp/general/exchange-rate-form";
import { GeneralMenuHome } from "@/components/erp/general/general-menu-view";

/**
 * GeneralWindow — Task 75 (درخواست مالک): پنجرهٔ نرم‌افزار «عمومی» (appKey
 * "general") با منوی «اطلاعات پایه». هر آیتمِ فرم به‌مرور اعلام می‌شود؛ اولین
 * فرم اعلام‌شده «سال مالی جدید» است که به‌صورت زیرصفحه (الگوی Win-11 تنظیمات:
 * نوار باریک + بازگشت) در همین پنجره باز می‌شود.
 *
 * ساختار منو (عین عبارت مالک): «در منوی عمومی و در زیرمنوی اطلاعات پایه یک
 * فرم اضافه کنید بنام سال مالی جدید» — منو = عمومی، زیرمنو = اطلاعات پایه.
 */

type GeneralPage = GeneralSubPage;

export function GeneralWindow() {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const [page, setPage] = React.useState<GeneralPage>("home");
  /* Task 82 — the hosting TAB retitles itself while the سال مالی sub-page is
     open, so the footer's unsaved-data alarm names the real form
     («عمومی — سال مالی جدید») exactly like the tab strip shows it. */
  const chrome = useWindowChrome();
  const setWindowTitle = useDesktop((s) => s.setWindowTitle);
  const go = React.useCallback((p: GeneralPage) => setPage(p), []);

  /* Task 82/98 — عنوان زندهٔ برگه = نام فرمی که کاربر می‌بیند، و باید همراه
     تغییر زبان نرم‌افزار هم تازه شود (الگوی افکتِ زندهٔ records-list-window).
     قبلاً عنوان فقط هنگام ناوبری set می‌شد و رشتهٔ زمانِ ناوبری (مثلاً فارسی)
     به‌عنوان titleOverride منجمد می‌ماند — اسکرین‌شات مالک: همهٔ UI پرتغالی
     ولی تب همچنان فارسی. useT با locale میمویز می‌شود ⇒ افکت فقط با تغییر
     صفحه/زبان اجرا می‌شود، نه هر رندر. */
  React.useEffect(() => {
    if (!chrome?.windowId) return;
    const titleKey =
      page === "fiscal-year"
        ? "fy.formTitle"
        : page === "party"
          ? "party.formTitle"
          : page === "geo-location"
            ? "geo.formTitle"
            : page === "currency-type"
              ? "currency.formTitle"
              : page === "exchange-rate"
                ? "rate.formTitle"
                : null;
    setWindowTitle(
      chrome.windowId,
      titleKey ? `${t("app.general")} — ${t(titleKey as never)}` : undefined,
    );
  }, [page, t, chrome?.windowId, setWindowTitle]);

  /* §1.4 — direction-aware navigation glyphs (no hardcoded physical sides) */
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  /* Task 85 — the shell can request a sub-page (the fiscal-year-missing
     prompt's «بلی» opens سال مالی جدید directly): consume the pending request
     on mount (fresh window) and follow unseen request ids while mounted.
     Requests are id-keyed one-shots ⇒ language changes / re-renders never
     re-navigate. */
  const navReq = useGeneralNav((s) => s.req);
  const navHandledRef = React.useRef(-1);
  React.useEffect(() => {
    if (navReq && navReq.id !== navHandledRef.current) {
      navHandledRef.current = navReq.id;
      go(navReq.page);
    }
  }, [navReq, go]);

  if (page === "party") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: عمومی / اطلاعات پایه / طرف حساب جدید */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-2 scrollbar-slim">
          <button
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
            {t("fy.menuBasicInfo")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t("party.formTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <PartyForm onBack={() => go("home")} />
        </div>
      </div>
    );
  }

  if (page === "fiscal-year") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: عمومی / اطلاعات پایه / سال مالی جدید */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-2 scrollbar-slim">
          <button
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
            {t("fy.menuBasicInfo")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t("fy.formTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <FiscalYearForm onBack={() => go("home")} />
        </div>
      </div>
    );
  }

  if (page === "currency-type") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: عمومی / اطلاعات پایه / نوع ارز جدید (Task 114) */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-2 scrollbar-slim">
          <button
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
            {t("fy.menuBasicInfo")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t("currency.formTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <CurrencyTypeForm onBack={() => go("home")} />
        </div>
      </div>
    );
  }

  if (page === "exchange-rate") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: عمومی / عملیات / نرخ برابری جدید (Task 116) */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-2 scrollbar-slim">
          <button
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
            {t("rate.menuGroup")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t("rate.formTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <ExchangeRateForm onBack={() => go("home")} />
        </div>
      </div>
    );
  }

  if (page === "geo-location") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: عمومی / اطلاعات پایه / محل های جغرافیایی */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/60 px-2 scrollbar-slim">
          <button
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
            {t("fy.menuBasicInfo")}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="shrink-0 truncate text-xs font-semibold text-foreground/90">
            {t("geo.formTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <GeoLocationsForm onBack={() => go("home")} />
        </div>
      </div>
    );
  }

  /* Task 117 — بدنهٔ home (منوی عمومی + سوییچر حالت‌های نمایش زیرمنو) به
     GeneralMenuHome منتقل شد؛ تک‌منبع دادهٔ MENU_GROUPS با ۴ چیدمان
     (کشویی/کنار‌هم/لیستی/کاشی) و ماندگاری انتخاب کاربر. */
  return <GeneralMenuHome go={go} />;
}
