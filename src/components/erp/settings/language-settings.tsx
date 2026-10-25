"use client";

import * as React from "react";
import { Globe, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { Badge } from "@/components/ui/badge";

/* Task 73 — «زبان» و «زبان‌های فعال» از خانهٔ پنجرهٔ تنظیمات به تب «عمومی»
   هاب «پیکربندی نرم افزارها» منتقل شدند (درخواست مالک). این کامپوننت مشترک
   هر دو بخش را رندر می‌کند؛ ماندگاری همچنان سمت کلاینت (erp.settings) است. */

export function LanguageSettingsSections() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const setLocale = useSettings((s) => s.setLocale);
  const activeLocales = useSettings((s) => s.activeLocales);
  const toggleActiveLocale = useSettings((s) => s.toggleActiveLocale);

  return (
    <>
      {/* language */}
      <section className="rounded-xl border border-border/70 bg-card/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t("common.language")}</h3>
          <Badge variant="secondary" className="ms-auto font-mono text-[10px]">
            {LOCALES.length}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LOCALES.filter((l) => activeLocales.includes(l as Locale)).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l as Locale)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-all cursor-pointer",
                locale === l
                  ? "border-primary bg-primary/10 font-semibold text-primary shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-accent",
              )}
            >
              <span className="font-mono text-[10px] text-muted-foreground">{l}</span>
              {LOCALE_NAMES[l]}
            </button>
          ))}
        </div>
      </section>

      {/* Task 70 — active languages: which locales the switcher and the
          translation panels show (fa is the base language and always on) */}
      <section className="rounded-xl border border-border/70 bg-card/60 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t("settings.activeLangs")}</h3>
          <Badge variant="secondary" className="ms-auto font-mono text-[10px]">
            {activeLocales.length}/{LOCALES.length}
          </Badge>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t("settings.activeLangsDesc")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LOCALES.map((l) => {
            const loc = l as Locale;
            const isActive = activeLocales.includes(loc);
            return (
              <button
                key={l}
                onClick={() => toggleActiveLocale(loc)}
                disabled={loc === "fa"}
                aria-pressed={isActive}
                title={loc === "fa" ? undefined : t("settings.activeLangs")}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-all",
                  loc === "fa"
                    ? "cursor-not-allowed border-primary/30 bg-primary/5 font-semibold text-primary"
                    : isActive
                      ? "cursor-pointer border-emerald-500/60 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400"
                      : "cursor-pointer border-border text-muted-foreground hover:border-primary/40 hover:bg-accent",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    isActive ? "bg-emerald-500" : "bg-muted-foreground/30",
                  )}
                />
                <span className="font-mono text-[10px] text-muted-foreground">{l}</span>
                <span className="truncate">{LOCALE_NAMES[loc]}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
