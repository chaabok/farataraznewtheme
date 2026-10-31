"use client";

import * as React from "react";
import { BarChart3, Inbox, PencilRuler, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { WorkflowCartable } from "./workflow-cartable";
import { WorkflowReports } from "./workflow-reports";
import { WorkflowRoleForm } from "@/components/erp/settings/workflow-role-form";
import { WorkflowDesignerForm } from "@/components/erp/settings/workflow-designer-form";

/**
 * WorkflowHub — پنجرهٔ واحد زیرسیستم گردش کار (t181 — فاز ۵ + تصمیم تازهٔ
 * مالک: «فرم‌هایی که مربوط به زیرسیستم کارتابل و گردش کار هستند باید در
 * آیکون گردش کار نمایش داده شوند و نباید در منوی تنظیمات باشند»).
 *
 * آیکون گردش کار در نوار وظیفه این هاب را باز می‌کند؛ چهار صفحه با نوار
 * ناوبری سمت شروع:
 *  · کارتابل (پیش‌فرض) — پنج صندوق per کاربر (t179 فاز ۳)
 *  · سمت‌های گردش کار — فرم مدیریتی سمت‌ها و تخصیص‌ها (t177 فاز ۱)
 *  · طراح فرآیند — کاتالوگ فرم‌های مشارکت‌کننده + بوم دیاگرام (t180 فاز ۴)
 *  · گزارش‌ها — داشبورد گردش سازمان + گلوگاه‌ها (t181 فاز ۵)
 * این صفحات دیگر هیچ لانچری در پنجرهٔ تنظیمات ندارند (حذف t177/t180 از آنجا).
 */

type HubPage = "cartable" | "roles" | "designer" | "reports";

export function WorkflowHub() {
  const t = useT();
  const [page, setPage] = React.useState<HubPage>("cartable");

  const nav: { id: HubPage; label: string; icon: React.ReactNode }[] = [
    { id: "cartable", label: t("wf.cartable.title"), icon: <Inbox className="h-4 w-4" aria-hidden /> },
    { id: "roles", label: t("wf.formTitle"), icon: <Workflow className="h-4 w-4" aria-hidden /> },
    { id: "designer", label: t("wf.des.title"), icon: <PencilRuler className="h-4 w-4" aria-hidden /> },
    { id: "reports", label: t("wf.rep.navLabel"), icon: <BarChart3 className="h-4 w-4" aria-hidden /> },
  ];

  return (
    <div className="flex h-full min-h-0" data-testid="wf-hub" dir="auto">
      {/* نوار ناوبری سمت شروع (در RTL راست) */}
      <nav
        aria-label={t("wf.hub.title")}
        className="flex w-40 shrink-0 flex-col gap-1 border-e border-border/60 bg-muted/30 p-2 sm:w-48"
        data-testid="wf-hub-nav"
      >
        <div className="mb-2 flex items-center gap-2 px-1.5 pt-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-sm">
            <Workflow className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold">{t("wf.hub.title")}</span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {t("wf.hub.subtitle")}
            </span>
          </span>
        </div>
        {nav.map((n) => (
          <button
            key={n.id}
            type="button"
            data-testid={`wf-hub-nav-${n.id}`}
            aria-current={page === n.id ? "page" : undefined}
            onClick={() => setPage(n.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-start text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              page === n.id
                ? "bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                page === n.id
                  ? "bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-sm"
                  : "bg-muted/70",
              )}
            >
              {n.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* محتوای صفحهٔ فعال */}
      <div className="min-h-0 min-w-0 flex-1">
        {page === "cartable" && <WorkflowCartable />}
        {page === "roles" && <WorkflowRoleForm onBack={() => setPage("cartable")} />}
        {page === "designer" && <WorkflowDesignerForm />}
        {page === "reports" && <WorkflowReports />}
      </div>
    </div>
  );
}
