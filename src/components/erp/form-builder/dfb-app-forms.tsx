"use client";

import * as React from "react";
import { FileText, Folder, Wrench } from "lucide-react";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { Badge } from "@/components/ui/badge";
import {
  useDfb, findMenuNodeByAppKey, dfbNodeTitle, dfbFormTitle,
  type DfbFormSummary, type DfbMenuNode,
} from "@/stores/dfb-store";
import { useDfbTrMap } from "@/stores/dfb-translations";
import { DfbGlyph } from "./dfb-dialogs";
import { openDfbFormReal } from "./dfb-system-forms";

/**
 * DfbAppFormsSection (Task 111 — درخواست مالک) — «فرم‌های فرم‌ساز» در پنجرهٔ
 * برنامه‌های سیستمی: هر فرمی که در فرم‌ساز روی آیکون اصلیِ یک برنامهٔ سیستمی
 * (یا زیرمنوهایش) ساخته می‌شود، از همین بخش در پنجرهٔ همان برنامه دیده می‌شود
 * و با کلیک باز می‌شود — عین رفتار پنجرهٔ منوی dfb-menu (قرارداد Task 46) اما
 * به‌صورت یک بخش افزودنی داخل پنجرهٔ خود برنامه (عمومی/placeholder ها).
 *
 * Task 112 — فلت‌کردن یک سطح: فرم‌های مستقیمِ زیرمنوهای سیستمی هم بدون کلیک
 * اضافه در همین بخش فهرست می‌شوند (سرگروه = عنوان خود زیرمنو) — «فرم هایی که
 * در زیرمنوی اطلاعات پایه منوی عمومی ایجاد شده اند مثل طرف حساب در درختواره
 * فرمساز و منوی عمومی دیده نمی شود». مدخل‌های سیستمیِ دارای فرم واقعی با کلیک
 * همان فرم واقعی را باز می‌کنند (openDfbFormReal).
 *
 * systemic contract: فرم‌های جدید بدون هیچ تنظیم اضافه‌ای در منوی برنامه ظاهر
 * می‌شوند؛ زیرمنوها هم به‌صورت کاشی هستند و با کلیک، پنجرهٔ dfb-menu همان گره
 * را باز می‌کنند (ناوبری کامل همان‌جا ادامه می‌یابد).
 */
export function DfbAppFormsSection({ appKey }: { appKey: string }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const trMap = useDfbTrMap(); // Task 68 — عنوان‌های زبان فعلی
  const tree = useDfb((s) => s.tree);
  const loaded = useDfb((s) => s.loaded);
  const load = useDfb((s) => s.load);
  const openWindow = useDesktop((s) => s.openWindow);

  React.useEffect(() => {
    void load();
  }, [load]);

  const node = React.useMemo(
    () => findMenuNodeByAppKey(tree, appKey),
    [tree, appKey],
  );

  const openForm = React.useCallback((f: DfbFormSummary) => openDfbFormReal(f), []);

  /* the tree is still loading (or the node is inactive): render nothing —
     the section must never flicker an empty state it cannot know yet */
  if (!loaded || !node) return null;

  const submenus = node.children ?? [];
  const directForms = node.forms ?? [];
  /* Task 112 — فرم‌های مستقیمِ زیرمنوها (یک سطح پایین‌تر) به‌صورت سرگروه‌دار */
  const groups: Array<{ sm: DfbMenuNode; forms: DfbFormSummary[] }> = submenus
    .map((sm) => ({ sm, forms: sm.forms ?? [] }))
    .filter((g) => g.forms.length > 0);
  const totalForms = directForms.length + groups.reduce((n, g) => n + g.forms.length, 0);

  const renderRow = (f: DfbFormSummary) => {
    const isBuilder = f.componentKey === "dfb-builder";
    return (
      <li key={f.id}>
        <button
          type="button"
          onClick={() => openForm(f)}
          className="flex w-full items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-start transition-all hover:border-foreground/25 hover:shadow-md"
        >
          <span
            className={
              isBuilder
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm"
            }
          >
            {isBuilder ? <Wrench className="h-4 w-4" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{dfbFormTitle(f, locale, trMap)}</span>
            <span className="block truncate text-[11px] text-muted-foreground" dir="ltr">
              {f.code}
            </span>
          </span>
          {f.isSystem && <Badge variant="secondary" className="shrink-0 text-[10px]">{t("dfb.systemForm")}</Badge>}
        </button>
      </li>
    );
  };

  return (
    <section
      aria-label={t("dfb.appFormsSection")}
      className="w-full rounded-2xl border border-border/70 bg-card/60"
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
          <Wrench className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {t("dfb.appFormsSection")}
        </h2>
        {totalForms > 0 && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {totalForms} {t("dfb.formsCount")}
          </Badge>
        )}
      </div>

      <div className="grid gap-3 p-3">
        {submenus.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {submenus.map((sm) => (
              <button
                key={sm.id}
                type="button"
                onClick={() => openWindow("dfb-menu", String(sm.id))}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 transition-all hover:border-foreground/25 hover:shadow-md"
              >
                <DfbGlyph iconKey={sm.iconKey} className="h-9 w-9" iconClass="h-5 w-5" />
                <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">
                  {dfbNodeTitle(sm, t, locale, trMap)}
                </span>
              </button>
            ))}
          </div>
        )}

        {directForms.length > 0 && <ul className="grid gap-2">{directForms.map(renderRow)}</ul>}

        {groups.map(({ sm, forms }) => (
          <div key={sm.id} className="grid gap-1.5">
            <h3 className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground">
              <DfbGlyph iconKey={sm.iconKey} className="h-3.5 w-3.5 rounded" iconClass="h-2 w-2" />
              {dfbNodeTitle(sm, t, locale, trMap)}
            </h3>
            <ul className="grid gap-2">{forms.map(renderRow)}</ul>
          </div>
        ))}

        {submenus.length === 0 && directForms.length === 0 && (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border/80 px-3 py-4 text-center">
            <Folder className="h-6 w-6 text-muted-foreground/50" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("dfb.appFormsEmpty")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
