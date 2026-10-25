"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useT } from "@/stores/settings-store";
import { HeaderButton } from "@/components/forms/form-primitives";

/* Task 73 (owner request) — دکمهٔ تم شب/روز در «هدر فرم»: روی نوار هدرِ
   گرادیانی هر دو پوستهٔ فرم (SimpleFormTwoRowTabbed / SimpleTreeForm)،
   کنار خوشهٔ دکمه‌های caption [– □ ✕] می‌نشیند و تم سراسری next-themes را
   بین روشن/تیره جابه‌جا می‌کند. tooltip برچسب حالت «مقصد» را نشان می‌دهد
   (کلیدهای موجود settings.light / settings.dark — بدون کلید i18n جدید).
   Hydration-safe: تا پیش از mount آیکون مطابق تم پیش‌فرض «روشن» رندر
   می‌شود تا با SSR یکی باشد. */
export function FormThemeToggle() {
  const t = useT();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <HeaderButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      label={isDark ? t("settings.light") : t("settings.dark")}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </HeaderButton>
  );
}
