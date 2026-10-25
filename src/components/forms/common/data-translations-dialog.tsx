"use client";

/**
 * DataTranslationsDialog (Task 92 — تأیید مالک): «ورود دستی (آفلاین)» برای
 * ترجمهٔ «دادهٔ» فرم‌های سیستمی (مثل طرف حساب) — کامپوننت عمومی و فرم‌مستقل.
 *
 * قرارداد هم‌سان با RuntimeTranslateDialog فرم‌ساز (Task 90/70):
 *   · فیلدها را «فرم» می‌فرستد (کلید/برچسب/مقدار fa رکورد باز) — کلید می‌تواند
 *     مسیر ردیف جدولی باشد (address.0.fullAddress)؛
 *   · انبار = DataTranslation روی بانک اصلی (settings-service) —
 *     GET  /api/settings/data-translations?entityType=&entityId=
 *     POST /api/settings/data-translations/save  (value خالی = حذف ترجمه)؛
 *   · یک انتخابگر زبان مشترک (زبان‌های فعال منهای fa) + یک ورودی به‌ازای هر
 *     فیلد؛ نقطهٔ سبز = ترجمهٔ همان زبان پر است؛
 *   · ذخیرهٔ دکمه‌ای (برخلاف کش تایپی فرم‌ساز) — چون رکورد سیستمی است و
 *     کاربر انتظار «ثبت آگاهانه» دارد؛ بعد از ذخیره، دیالوگ باز می‌ماند تا
 *     زبان‌های دیگر هم تکمیل شوند.
 * بدنهٔ دیالوگ keyed remount است (هر بازشدن = state تازه) — پس بارگیری در
 * effect فقط setState ناهمگام دارد (قاعدهٔ react-hooks/set-state-in-effect).
 */

import * as React from "react";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";

export interface DataTranslationField {
  /** کلید پایدار فیلد — فیلد ساده («name») یا مسیر ردیف («address.0.fullAddress») */
  key: string;
  /** برچسب نمایشی فیلد (همان برچسب فرم) */
  label: string;
  /** مقدار اصلی (fa) برای placeholder/مرجع */
  value: string;
}

type TrMap = Record<string, Partial<Record<Locale, string>>>;

export function DataTranslationsDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  fields,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** نام مدل سیستمی («Party»، بعداً «FiscalYear» و …) */
  entityType: string;
  entityId: number | null;
  fields: DataTranslationField[];
}) {
  const t = useT();
  const activeLocales = useSettings((s) => s.activeLocales);
  const trLangs = React.useMemo(
    () => LOCALES.filter((l) => l !== "fa" && activeLocales.includes(l)),
    [activeLocales],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto scrollbar-slim">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Languages className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden />
            {t("dfb.list.translateManualTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("dfb.list.translateOfflineHint")}
            <span className="mx-1 font-mono text-[10px]" dir="ltr">
              #{entityId ?? ""}
            </span>
          </DialogDescription>
        </DialogHeader>
        {/*
          key = هویت رکورد + باز/بسته — هر بازشدنِ تازه، بدنه را از نو می‌سازد
          (ویرایش‌ها/نقشه/زبان انتخابی reset می‌شود و بارگیری از اول).
        */}
        <DataTranslationsBody
          key={`${entityType}:${entityId ?? 0}:${open ? "open" : "closed"}`}
          entityType={entityType}
          entityId={entityId}
          fields={fields}
          trLangs={trLangs}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/** بدنهٔ keyed — state بارگیری/ویرایش/زبان فقط داخل همین کامپوننت */
function DataTranslationsBody({
  entityType,
  entityId,
  fields,
  trLangs,
  onClose,
}: {
  entityType: string;
  entityId: number | null;
  fields: DataTranslationField[];
  trLangs: Locale[];
  onClose: () => void;
}) {
  const t = useT();
  const [lang, setLang] = React.useState<Locale>(trLangs[0] ?? "en");
  const [map, setMap] = React.useState<TrMap>({});
  const [edits, setEdits] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(entityId != null);
  const [saving, setSaving] = React.useState(false);

  const editKey = (key: string, l: Locale) => `${key}::${l}`;
  const valueOf = (key: string, l: Locale): string => {
    const ek = editKey(key, l);
    if (ek in edits) return edits[ek];
    return map[key]?.[l] ?? "";
  };

  /* بارگیری ترجمه‌های موجود (mount — هویت رکورد با key تضمین شده) */
  React.useEffect(() => {
    if (entityId == null) return;
    let alive = true;
    api
      .get<{ items?: Array<{ fieldKey: string; locale: string; value: string }> }>(
        `data-translations?entityType=${encodeURIComponent(entityType)}&entityId=${entityId}`,
      )
      .then((res) => {
        if (!alive) return;
        const next: TrMap = {};
        for (const it of res.items ?? []) {
          (next[it.fieldKey] ??= {})[it.locale as Locale] = it.value;
        }
        setMap(next);
      })
      .catch(() => {
        /* بارگیری ناموفق — دیالوگ با نقشهٔ خالی کار می‌کند */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filledCount = (l: Locale) =>
    fields.filter((f) => (map[f.key]?.[l] ?? "").trim().length > 0).length;

  const save = async () => {
    if (entityId == null) return;
    setSaving(true);
    try {
      const items = fields.map((f) => ({
        fieldKey: f.key,
        locale: lang,
        value: valueOf(f.key, lang).trim(),
      }));
      const res = await api.post<{ ok?: boolean }>("data-translations/save", {
        entityType,
        entityId,
        items,
      });
      if (!res?.ok) throw new Error(t("common.error"));
      /* خوش‌بینانه: نقشهٔ محلی با ویرایش‌های همین زبان تازه می‌شود */
      setMap((prev) => {
        const next: TrMap = { ...prev };
        for (const f of fields) {
          next[f.key] = { ...next[f.key], [lang]: valueOf(f.key, lang).trim() };
        }
        return next;
      });
      setEdits({});
      toast.success(t("abar.savedToast"));
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (fields.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
        {t("dfb.list.translateNoTextFields")}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {/* انتخابگر زبان مشترک — نقطهٔ سبز = پرشدن همان زبان */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Languages className="h-3.5 w-3.5" aria-hidden />
          {t("settings.activeLangs")}
        </span>
        <Select value={lang} onValueChange={(v) => setLang(v as Locale)}>
          <SelectTrigger
            aria-label={t("settings.activeLangs")}
            className="h-7 w-40 text-[11px]"
            data-window-btn
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {trLangs.map((l) => (
              <SelectItem key={l} value={l}>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={
                      filledCount(l) > 0
                        ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                        : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                    }
                  />
                  {LOCALE_NAMES[l]}
                  <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">
                    {filledCount(l)}/{fields.length}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : (
        fields.map((f) => (
          <div key={f.key} className="grid gap-1">
            <span className="text-xs font-medium">{f.label}</span>
            <Input
              dir="auto"
              value={valueOf(f.key, lang)}
              onChange={(e) =>
                setEdits((prev) => ({ ...prev, [editKey(f.key, lang)]: e.target.value }))
              }
              placeholder={f.value || "—"}
              className="h-8"
              aria-label={`${f.label} — ${LOCALE_NAMES[lang]}`}
            />
          </div>
        ))
      )}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={saving}
        >
          {t("common.close")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => void save()}
          disabled={saving || entityId == null || trLangs.length === 0}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {t("common.save")}
        </Button>
      </DialogFooter>
    </div>
  );
}
