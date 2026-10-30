"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { useLoupe } from "@/stores/loupe-store";

/**
 * Task 160 — دکمهٔ خاص ذره‌بین در نوار وضعیت: با کلیک فعال می‌شود و هر عنصری
 * که نشانگر روی آن قرار بگیرد بزرگ‌نمایی می‌شود (لایهٔ LoupeLayer). حالت فعال
 * با پس‌زمینهٔ سبز مشخص است؛ خروج با کلیک دوباره یا Esc.
 */
export function LoupeToggle() {
  const t = useT();
  const active = useLoupe((s) => s.active);
  const toggle = useLoupe((s) => s.toggle);

  return (
    <button
      type="button"
      aria-label={t("taskbar.loupe")}
      aria-pressed={active}
      title={active ? t("taskbar.loupeHint") : t("taskbar.loupe")}
      onClick={toggle}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer",
        active
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
      )}
    >
      <Search className="h-4 w-4" aria-hidden />
    </button>
  );
}
