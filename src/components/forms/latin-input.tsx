"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { useT } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

/**
 * Task 50 (owner request) — Latin-only title input.
 *
 * The owner rule: «کاربر نباید بتواند توی فیلد عنوان لاتین، زبان‌های دیگر را
 * وارد کند» — non-Latin characters (Persian/Arabic/CJK/Cyrillic/…) must never
 * enter the field. The filter is applied on EVERY change (typing, drag-drop,
 * paste, IME): disallowed characters are stripped before the value reaches
 * state, and a brief notice flashes when a strip happened so the user
 * understands why nothing appeared.
 *
 * Allowed: Latin letters, digits, space and basic punctuation
 * ( - _ ( ) . , / & + ' " ). Everything else (including ZWNJ) is stripped.
 */

const LATIN_ALLOWED = /[^A-Za-z0-9 _\-().,&/+'"]/g;

/** strips every non-Latin character from a title value */
export function sanitizeLatin(value: string): string {
  return value.replace(LATIN_ALLOWED, "");
}

export function LatinInput({
  value, onValueChange, id, maxLength = 120, className, ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "dir"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const t = useT();
  const [blocked, setBlocked] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = sanitizeLatin(raw);
    if (clean !== raw) {
      setBlocked(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setBlocked(false), 2400);
    }
    onValueChange(clean);
  };

  return (
    <div className="grid gap-1">
      <Input
        {...props}
        id={id}
        dir="ltr"
        value={value}
        maxLength={maxLength}
        onChange={handleChange}
        className={cn("text-start", blocked && "border-rose-500 ring-1 ring-rose-500/40", className)}
      />
      <p
        aria-live="polite"
        className={cn(
          "text-[10px] leading-tight",
          blocked ? "font-medium text-rose-600 dark:text-rose-400" : "text-muted-foreground/70",
        )}
      >
        {blocked ? t("dfb.studio.latinBlocked") : t("dfb.studio.latinOnly")}
      </p>
    </div>
  );
}
