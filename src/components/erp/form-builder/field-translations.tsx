"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT, useSettings } from "@/stores/settings-store";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";
import {
  dfbTransKey,
  saveDfbTranslations,
  useDfbTranslations,
  type DfbTransEntityType,
} from "@/stores/dfb-translations";

/**
 * DfbTranslationsBody (Task 68/69) — پنل ترجمهٔ یک متن دیتابیسی فرمساز به
 * ۱۰ زبان غیر-fa: برچسب فیلد (Field)، عنوان تب/باند (Tab — Task 69) و
 * آیتم‌های select/radio (Option — Task 69)، داخل ریل تنظیمات و مودال
 * ویژگی‌های استودیو طراحی.
 *
 * رفتار آفلاین: هر ضربهٔ کلید فوراً در کش کلاینت (Zustand + localStorage)
 * اعمال می‌شود و ذخیرهٔ سرور debounce (۶۰۰ms) می‌گیرد؛ در unmount هم
 * ذخیرهٔ معوق flush می‌شود. مقدار خالی = حذف ترجمه (fallback به fa).
 * هویت پایدار:
 *   · Field → (Field، formRef، fieldKey)
 *   · Tab   → (Tab، formRef، clientKey)   — ClientKey در DfbFormTab ذخیره می‌شود
 *   · Option→ (Option، formRef، `<fieldKey>::<value>`)
 */

const FLUSH_MS = 600;

/** زبان‌های ترجمهٔ پنل = زبان‌های فعال منهای fa (Task 70 — تنظیم «زبان‌های فعال») */
function useTranslationLangs(): Locale[] {
  const activeLocales = useSettings((s) => s.activeLocales);
  return React.useMemo(
    () => (LOCALES as Locale[]).filter((l) => l !== "fa" && activeLocales.includes(l)),
    [activeLocales],
  );
}

export function DfbTranslationsBody({
  entityType,
  entityRef,
  fieldKey,
  fallbackFa,
  labelKey,
}: {
  entityType: DfbTransEntityType;
  entityRef: number;
  /** Field = fieldKey فیلد | Tab = clientKey تب/باند | Option = `<fieldKey>::<value>` */
  fieldKey: string;
  fallbackFa: string;
  /** کلید i18n عنوان پنل (پیش‌فرض: ترجمهٔ برچسب) */
  labelKey?:
    | "dfb.i18n.title"
    | "dfb.i18n.tabTitle"
    | "dfb.i18n.optionTitle"
    | "dfb.i18n.valueTitle";
}) {
  const t = useT();
  const [lang, setLang] = React.useState<Locale>("en");
  const trLangs = useTranslationLangs();
  const byLang = useDfbTranslations((s) => s.byLang);
  const key = dfbTransKey(entityType, entityRef, fieldKey);
  const value = byLang[lang]?.[key] ?? "";

  const filled = React.useMemo(
    () => trLangs.filter((l) => (byLang[l]?.[key] ?? "").trim().length > 0).length,
    [byLang, key, trLangs],
  );

  const pendingRef = React.useRef<string | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const flush = React.useCallback(
    (payload: string) => {
      pendingRef.current = null;
      saveDfbTranslations([
        { entityType, entityRef, fieldKey, lang, value: payload },
      ]).catch(() => toast.error(t("common.error")));
    },
    [entityType, entityRef, fieldKey, lang, t],
  );

  const onChange = (v: string) => {
    /* خوش‌بینانه: کش کلاینت همان لحظه — همهٔ پنجره‌های باز به‌روز می‌شوند */
    useDfbTranslations.getState().applyLocal([
      { entityType, entityRef, fieldKey, lang, value: v },
    ]);
    pendingRef.current = v.trim();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (pendingRef.current !== null) flush(pendingRef.current);
    }, FLUSH_MS);
  };

  /* flush در unmount — ترجمهٔ تایپ‌شده هرگز گم نمی‌شود */
  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (pendingRef.current !== null) {
        saveDfbTranslations([
          { entityType, entityRef, fieldKey, lang, value: pendingRef.current },
        ]).catch(() => undefined);
      }
    };
  }, [entityType, entityRef, fieldKey, lang]);

  const title = t(labelKey ?? "dfb.i18n.title");

  return (
    <div className="grid gap-1.5 rounded-xl border border-dashed border-border/70 p-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Languages className="h-3.5 w-3.5" aria-hidden />
          {title}
          <span
            className="ms-1 rounded-full bg-emerald-500/10 px-1.5 py-px font-mono text-[9px] text-emerald-600 dark:text-emerald-400"
            dir="ltr"
          >
            {filled}/{trLangs.length}
          </span>
        </Label>
        <Select value={lang} onValueChange={(v) => setLang(v as Locale)}>
          <SelectTrigger
            aria-label={title}
            className="h-7 w-32 text-[11px]"
            data-window-btn
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {trLangs.map((l) => {
              const filledLang = (byLang[l]?.[key] ?? "").trim().length > 0;
              return (
                <SelectItem key={l} value={l}>
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className={
                        filledLang
                          ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                          : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                      }
                    />
                    {LOCALE_NAMES[l]}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <Input
        dir="auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fallbackFa || "—"}
        className="h-8"
        aria-label={`${title} — ${LOCALE_NAMES[lang]}`}
      />
    </div>
  );
}

/** پنل ترجمهٔ برچسب فیلد (Task 68) — همان DfbTranslationsBody با entityType=Field */
export function FieldTranslationsBody(props: {
  formRef: number;
  fieldKey: string;
  fallbackFa: string;
}) {
  return <DfbTranslationsBody entityType="Field" {...props} />;
}
