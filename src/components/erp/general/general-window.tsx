"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Earth,
  FolderOpen,
  UserRoundPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useGeneralNav, type GeneralSubPage } from "@/stores/general-nav-store";
import { useWindowChrome } from "@/components/desktop/app-window";
import { FiscalYearForm } from "@/components/erp/general/fiscal-year-form";
import { PartyForm } from "@/components/forms/common/Party";
import { GeoLocationsForm } from "@/components/erp/general/geo-locations-form";
import { CurrencyTypeForm } from "@/components/erp/general/currency-type-form";
import { DfbAppFormsSection } from "@/components/erp/form-builder/dfb-app-forms";

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
  const [basicInfoOpen, setBasicInfoOpen] = React.useState(true);
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
              : null;
    setWindowTitle(
      chrome.windowId,
      titleKey ? `${t("app.general")} — ${t(titleKey as never)}` : undefined,
    );
  }, [page, t, chrome?.windowId, setWindowTitle]);

  /* §1.4 — direction-aware navigation glyphs (no hardcoded physical sides) */
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const ForwardIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

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

  return (
    <div className="h-full overflow-y-auto scrollbar-slim">
      {/* window header */}
      <div className="border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md">
            <Boxes className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold">{t("app.general")}</h2>
            <p className="text-xs text-muted-foreground">{t("app.name")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-4 p-4" dir="auto">
        {/* Task 111/113 — فقط فرم‌های ساختهٔ کاربر در فرمساز؛ فرم‌های سیستمی
            (اطلاعات پایه و…) بدنهٔ بومی خودشان را در همین پنجره دارند و
            فهرست‌شدن دوباره‌شان = دوبل (درخواست مالک). تا وقتی فرمی از
            ساخته‌های کاربر نباشد کل این بخش رندر نمی‌شود. */}
        <DfbAppFormsSection appKey="general" hideSystem />

        {/* زیرمنوی «اطلاعات پایه» — collapsible classic-ERP menu group */}
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
          <button
            onClick={() => setBasicInfoOpen((v) => !v)}
            aria-expanded={basicInfoOpen}
            className="flex w-full items-center gap-3 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring cursor-pointer"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <FolderOpen className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{t("fy.menuBasicInfo")}</span>
              <span className="block text-xs text-muted-foreground">
                {t("fy.menuBasicInfoDesc")}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                !basicInfoOpen && (dir === "rtl" ? "rotate-90" : "-rotate-90"),
              )}
              aria-hidden
            />
          </button>

          {basicInfoOpen && (
            <div className="space-y-1 border-t border-border/60 p-2">
              {/* فرم «سال مالی جدید» — اولین آیتم اعلام‌شدهٔ مالک (Task 75) */}
              <button
                onClick={() => go("fiscal-year")}
                className="flex w-full items-center gap-3 rounded-lg p-3 pe-6 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                  <CalendarPlus className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t("fy.formTitle")}</span>
                  <span className="block text-xs text-muted-foreground">{t("fy.formDesc")}</span>
                </span>
                <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>

              {/* فرم «طرف حساب جدید» — Task 84 (درخواست مالک) */}
              <button
                onClick={() => go("party")}
                className="flex w-full items-center gap-3 rounded-lg p-3 pe-6 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-sm">
                  <UserRoundPlus className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t("party.formTitle")}</span>
                  <span className="block text-xs text-muted-foreground">{t("party.formDesc")}</span>
                </span>
                <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>

              {/* فرم «محل های جغرافیایی» — Task 103 (درخواست مالک، SimpleTreeForm) */}
              <button
                onClick={() => go("geo-location")}
                className="flex w-full items-center gap-3 rounded-lg p-3 pe-6 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                  <Earth className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t("geo.formTitle")}</span>
                  <span className="block text-xs text-muted-foreground">{t("geo.formDesc")}</span>
                </span>
                <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>

              {/* فرم «نوع ارز جدید» — Task 114 (درخواست مالک، seed ارزهای ISO 4217) */}
              <button
                onClick={() => go("currency-type")}
                className="flex w-full items-center gap-3 rounded-lg p-3 pe-6 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-sm">
                  <Coins className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t("currency.formTitle")}</span>
                  <span className="block text-xs text-muted-foreground">{t("currency.formDesc")}</span>
                </span>
                <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>

              {/* آیتم‌های بعدی «به‌مرور» اعلام می‌شوند (قرارداد پنجره‌های اعلامی) */}
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/80 px-3 py-2.5">
                <span className="text-xs leading-relaxed text-muted-foreground/80">
                  {t("fy.menuPending")}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
