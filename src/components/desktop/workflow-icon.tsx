"use client";

import * as React from "react";
import { Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { appApi } from "@/lib/api";
import { useT } from "@/stores/settings-store";
import { useAuthStore } from "@/store/auth-store";
import { useDesktop } from "@/stores/desktop-store";

/**
 * WorkflowIcon — آیکون گردش کار در نوار وظیفه (t181 — فاز ۵ + t183: با تبدیل
 * هاب به «منوی گردش کار»، کلیکِ این آیکون مستقیماً «کارتابل گردش کار» را
 * باز می‌کند — بج آن شمارندهٔ گام‌ها/ابلاغ‌های همان صندوق است؛ منوی کامل
 * فرم‌ها از آیکون گردش کارِ دسکتاپ در دسترس است). خلاصهٔ شمارنده‌ها را هر
 * ۶۰ ثانیه می‌خواند و بج می‌زند.
 */
export function WorkflowIcon() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const openWindow = useDesktop((s) => s.openWindow);
  const wf = React.useMemo(() => appApi("workflow"), []);
  const [badge, setBadge] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    const uid = user?.username?.trim() ?? "";
    const tick = async () => {
      if (!uid) {
        if (alive) setBadge(0);
        return;
      }
      try {
        const s = await wf.get<{ tasks: number; unread: number }>(
          `workflow-cartable/summary?userId=${encodeURIComponent(uid)}`,
        );
        if (alive) setBadge(Math.max(0, (s?.tasks ?? 0) + (s?.unread ?? 0)));
      } catch {
        if (alive) setBadge(0);
      }
    };
    void tick();
    const iv = setInterval(() => void tick(), 60_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [user?.username, wf]);

  return (
    <button
      type="button"
      data-testid="workflow-icon"
      title={t("wf.cartable.title")}
      aria-label={`${t("wf.cartable.title")}${badge > 0 ? ` (${badge})` : ""}`}
      onClick={() => openWindow("workflow-cartable")}
      className={cn(
        "relative flex items-center justify-center rounded-lg transition-colors hover:bg-foreground/10 cursor-pointer",
        "h-8 w-8",
        badge > 0 && "text-teal-600 dark:text-teal-300",
      )}
    >
      <Workflow className="h-4 w-4" aria-hidden />
      {badge > 0 && (
        <span
          data-testid="workflow-icon-badge"
          className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow"
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
