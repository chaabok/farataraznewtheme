"use client";

import * as React from "react";
import { BarChart3, Inbox, PencilRuler, Workflow } from "lucide-react";
import { useT } from "@/stores/settings-store";
import { useDesktop, type WindowKind } from "@/stores/desktop-store";

/**
 * WorkflowMenu — «منوی گردش کار» (t183 — فرمان مالک: «هر کدام از تب‌های فرم
 * گردش کار را یک فرم کنید و در منوی گردش کار قرار دهید»).
 *
 * هاب تک‌پنجره‌ای t181 به الگوی منوی فرم‌ها تبدیل شد (همانند «ابزارهای
 * پیشرفته»): آیکون گردش کارِ دسکتاپ/منوی استارت/پین نوار وظیفه این منو را
 * باز می‌کند و هر آیتم، فرم مستقلِ خودش را در تب جداگانه باز می‌کند:
 *  · کارتابل گردش کار — پنج صندوق per کاربر (t179 فاز ۳)
 *  · سمت‌های گردش کار — سمت‌ها، تخصیص کاربران و بازهٔ اعتبار (t177 فاز ۱)
 *  · طراح فرآیند — کاتالوگ فرم‌های مشارکت‌کننده + بوم دیاگرام (t180 فاز ۴)
 *  · گزارش‌ها — داشبورد گردش سازمان + گلوگاه‌ها (t181 فاز ۵)
 * زنگولهٔ نوار وظیفه (WorkflowIcon) مستقیماً کارتابل را باز می‌کند —
 * بج آن شمارندهٔ گام‌ها/ابلاغ‌های همان صندوق است.
 */

interface WorkflowFormEntry {
  kind: WindowKind;
  testId: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  tile: string;
}

export function WorkflowMenu() {
  const t = useT();
  const openWindow = useDesktop((s) => s.openWindow);

  const forms: WorkflowFormEntry[] = [
    {
      kind: "workflow-cartable",
      testId: "wf-menu-cartable",
      titleKey: "wf.cartable.title",
      descKey: "wf.cartable.subtitle",
      icon: <Inbox className="h-4 w-4" aria-hidden />,
      tile: "from-cyan-500 to-teal-600",
    },
    {
      kind: "workflow-roles",
      testId: "wf-menu-roles",
      titleKey: "wf.formTitle",
      descKey: "wf.rolesSubtitle",
      icon: <Workflow className="h-4 w-4" aria-hidden />,
      tile: "from-teal-600 to-cyan-800",
    },
    {
      kind: "workflow-designer",
      testId: "wf-menu-designer",
      titleKey: "wf.des.title",
      descKey: "wf.des.subtitle",
      icon: <PencilRuler className="h-4 w-4" aria-hidden />,
      tile: "from-cyan-600 to-teal-700",
    },
    {
      kind: "workflow-reports",
      testId: "wf-menu-reports",
      titleKey: "wf.rep.navLabel",
      descKey: "wf.rep.subtitle",
      icon: <BarChart3 className="h-4 w-4" aria-hidden />,
      tile: "from-teal-500 to-cyan-700",
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden" data-testid="wf-menu" dir="auto">
      {/* سربرگ هویت زیرسیستم */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border/60 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-sm">
          <Workflow className="h-4.5 w-4.5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{t("wf.hub.title")}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {t("wf.hub.subtitle")}
          </span>
        </span>
      </div>

      {/* فهرست فرم‌ها */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim p-4 sm:p-5">
        <section aria-label={t("wf.menu.formsLabel")}>
          <h2 className="mb-2 text-xs font-semibold text-muted-foreground">
            {t("wf.menu.formsLabel")}
          </h2>
          <ul className="grid gap-2">
            {forms.map((f) => (
              <li key={f.kind}>
                <button
                  type="button"
                  data-testid={f.testId}
                  onClick={() => openWindow(f.kind)}
                  aria-label={t(f.titleKey as never)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-start transition-all hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${f.tile} text-white shadow-sm`}
                  >
                    {f.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t(f.titleKey as never)}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {t(f.descKey as never)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
