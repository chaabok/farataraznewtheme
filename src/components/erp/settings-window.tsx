"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Sun,
  Moon,
  MonitorCog,
  Network,
  SlidersHorizontal,
  ShieldPlus,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings, useT } from "@/stores/settings-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BusinessStructureWindow } from "@/components/erp/business-structure/bs-window";
import { SoftwareConfigBody } from "@/components/erp/settings/software-config-window";
import { UserRoleForm } from "@/components/erp/settings/user-role-form";
import { AppTile } from "@/components/desktop/app-tile";

/* Task 35 — the Settings window hosts the BusinessStructure form as a
   sub-page (owner request): «home» keeps the classic language/appearance
   sections and adds a launcher card; «business-structure» embeds the SAME
   BusinessStructureWindow in embedded mode (no window chrome on the form
   header — the Settings window owns the caption buttons; «بستن»/save-close
   returns to the settings home).

   Task 37 — the userManagement catalog app moved into Settings the same way
   (owner request): launcher card on «home», sub-page is a §4.6 placeholder
   (NO forms/fields — the multi-form content follows its analysis document).

   Task 72 — «پیکربندی نرم افزارها» hub (owner-approved consultation):
   launcher card on «home»; sub-page = 7 per-software tabs (fields announced
   gradually; full AppBaseEntity inheritance on SoftwareConfig rows).

   Task 73 — the language + active-languages sections moved OUT of «home»
   into the hub's «عمومی» tab (owner request) — see language-settings.tsx. */

type SettingsPage = "home" | "business-structure" | "user-management" | "user-role" | "software-config";

export function SettingsWindow() {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [page, setPage] = React.useState<SettingsPage>("home");

  /* §1.4 — direction-aware navigation glyphs (no hardcoded physical sides) */
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const ForwardIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  if (page === "business-structure") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: back to the settings home (Win-11 settings pattern) */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-border/60 px-2">
          <button
            onClick={() => setPage("home")}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <BackIcon className="h-3.5 w-3.5" aria-hidden />
            {t("settings.back")}
          </button>
          <span className="text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="truncate text-xs font-semibold text-foreground/90">
            {t("menus.businessStructure")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <BusinessStructureWindow embedded onEmbeddedClose={() => setPage("home")} />
        </div>
      </div>
    );
  }

  if (page === "software-config") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: back to the settings home (Win-11 settings pattern) */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-border/60 px-2">
          <button
            onClick={() => setPage("home")}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <BackIcon className="h-3.5 w-3.5" aria-hidden />
            {t("settings.back")}
          </button>
          <span className="text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="truncate text-xs font-semibold text-foreground/90">
            {t("settings.swConfig")}
          </span>
        </div>
        <SoftwareConfigBody />
      </div>
    );
  }

  if (page === "user-role") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: back to the user-management hub (Win-11 pattern) */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-border/60 px-2">
          <button
            onClick={() => setPage("user-management")}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <BackIcon className="h-3.5 w-3.5" aria-hidden />
            {t("settings.back")}
          </button>
          <span className="text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="truncate text-xs font-semibold text-foreground/90">
            {t("app.userManagement")}
          </span>
          <span className="text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="truncate text-xs font-semibold text-foreground/90">
            {t("um.roleFormTitle")}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <UserRoleForm onBack={() => setPage("user-management")} />
        </div>
      </div>
    );
  }

  if (page === "user-management") {
    return (
      <div className="flex h-full flex-col">
        {/* slim sub-page bar: back to the settings home (Win-11 settings pattern) */}
        <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-border/60 px-2">
          <button
            onClick={() => setPage("home")}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <BackIcon className="h-3.5 w-3.5" aria-hidden />
            {t("settings.back")}
          </button>
          <span className="text-xs text-muted-foreground/50" aria-hidden>
            /
          </span>
          <span className="truncate text-xs font-semibold text-foreground/90">
            {t("app.userManagement")}
          </span>
        </div>
        {/* Task 100 — first form of §4.6 arrives (owner request): the launcher
            card opens the «نقش کاربری جدید» form; remaining forms follow
            their analysis document. */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto p-6 scrollbar-slim" dir="auto">
          <AppTile
            appKey="userManagement"
            className="h-20 w-20 rounded-3xl"
            iconClass="h-9 w-9"
          />
          <div className="text-center">
            <h2 className="text-lg font-bold tracking-tight">{t("app.userManagement")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("settings.umDesc")}</p>
          </div>
          <button
            onClick={() => setPage("user-role")}
            className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
              <ShieldPlus className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{t("um.roleFormTitle")}</span>
              <span className="block text-xs text-muted-foreground">{t("um.roleLauncherDesc")}</span>
            </span>
            <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("um.morePending")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-slim">
      <div className="border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            <MonitorCog className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold">{t("settings.title")}</h2>
            <p className="text-xs text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-5 p-4">
        {/* Task 73 — «زبان» و «زبان‌های فعال» به تب «عمومی» هاب
            «پیکربندی نرم افزارها» منتقل شدند (LanguageSettingsSections) */}
        {/* appearance */}
        <section className="rounded-xl border border-border/70 bg-card/60 p-4">
          <h3 className="mb-3 text-sm font-semibold">{t("settings.appearance")}</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-switch" className="flex items-center gap-2 text-sm">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4 text-primary" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              {theme === "dark" ? t("settings.dark") : t("settings.light")}
            </Label>
            <Switch
              id="theme-switch"
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
        </section>

        {/* Task 35 — business structure launcher: the form moved from the
            desktop into Settings (no standalone icon anymore, owner request) */}
        <button
          onClick={() => setPage("business-structure")}
          className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
            <Network className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{t("menus.businessStructure")}</span>
            <span className="block text-xs text-muted-foreground">{t("settings.bsDesc")}</span>
          </span>
          <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>

        {/* Task 37 — user-management launcher: the catalog app moved from the
            desktop/start menu into Settings (owner request); its own AppTile
            identity is kept. Content = §4.6 placeholder sub-page until the
            analysis document arrives. */}
        <button
          onClick={() => setPage("user-management")}
          className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <AppTile appKey="userManagement" className="h-10 w-10" iconClass="h-5 w-5" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{t("app.userManagement")}</span>
            <span className="block text-xs text-muted-foreground">{t("settings.umDesc")}</span>
          </span>
          <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>

        {/* Task 72 — software-configuration hub launcher (owner request):
            ۷ تب per-software (عمومی/حسابداری/دریافت و پرداخت/انبار/فروش/
            دارایی ثابت/حقوق)؛ فیلدها به‌مرور اعلان می‌شوند. */}
        <button
          onClick={() => setPage("software-config")}
          className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md">
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{t("settings.swConfig")}</span>
            <span className="block text-xs text-muted-foreground">{t("settings.swConfigDesc")}</span>
          </span>
          <ForwardIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>

        <Separator />

        <p className="text-center text-xs text-muted-foreground">
          {t("app.name")} — ERP Rebuild · NestJS 11 + Next.js 16 + Prisma
        </p>
      </div>
    </div>
  );
}
