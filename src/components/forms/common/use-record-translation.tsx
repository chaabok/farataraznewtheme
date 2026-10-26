"use client";

/**
 * useRecordTranslation (Task 107 — درخواست مالک) — قلاب عمومیِ ترجمهٔ «دادهٔ»
 * رکورد باز برای «تمامی فرم‌ها»، تا فعال‌بودن «ترجمهٔ خودکار (آنلاین)» و
 * «ورود دستی (آفلاین)» دیگر نیازی به فرمان جداگانه برای هر فرم جدید نداشته
 * باشد (پرسش مالک: «نمی‌شه هر فرمی ایجاد شد این گزینه‌ها فعال باشند؟»).
 *
 * قرارداد دقیقاً همان الگوی Party (Task 92/93/95/98/99) است، یک‌بار برای همیشه
 * کپسوله شده:
 *   · آنلاین: POST /api/data-translations/auto-translate — یک فراخوانی LLM
 *     به‌ازای هر فیلد؛ upsert به انبار DataTranslation سرویس تنظیمات؛
 *     بازخورد = توست شمارش‌دار (بدون هیچ مودالی — حکم Task 98)؛
 *   · آفلاین: دیالوگ عمومی DataTranslationsDialog (ورود دستی به‌ازای هر زبان
 *     فعال؛ ذخیرهٔ دکمه‌ای) — خودکار رندر می‌شود (dialog خروجی قلاب)؛
 *   · رکوردی باز نبود (entityId = null) → توست راهنما، بدون کرش.
 *
 * مصرف (حداقلی — عین فرم محل های جغرافیایی):
 *   const tr = useRecordTranslation({
 *     entityType: "GeoLocation", entityId: selectedId,
 *     getFields: () => [{ key: "title", label: t("bs.field.title"), value: form.title }],
 *     onTranslated: () => setTrVersion((v) => v + 1),
 *   });
 *   <FormShell onTranslateOnline={tr.translateOnline} onTranslateOffline={tr.openTranslateOffline} … />
 *   {tr.dialog}
 *
 * TranslateButton (Task 90) با رسیدن همین دو handler فعال می‌شود — پس «هر فرم
 * جدید» با چند خط، هر دو گزینهٔ منوی ترجمه را فعال دارد.
 */

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { LOCALES } from "@/i18n/config";
import {
  DataTranslationsDialog,
  type DataTranslationField,
} from "./data-translations-dialog";

export interface UseRecordTranslationOptions {
  /** مدل انبار DataTranslation («GeoLocation»، «Party»، … — ^[A-Za-z][A-Za-z0-9_]{0,39}$) */
  entityType: string;
  /** شناسهٔ رکورد باز — null یعنی رکوردی باز نیست (ترجمه با توست راهنما رد می‌شود) */
  entityId: number | null;
  /** فیلدهای متنیِ قابل ترجمهٔ رکورد باز (کلید پایدار / برچسب فرم / مقدار پایهٔ fa) */
  getFields: () => DataTranslationField[];
  /** پس از ترجمهٔ آنلاین موفق — تازه‌سازی نقشهٔ نمایش/فهرست (مثلاً bump نسخه) */
  onTranslated?: () => void | Promise<void>;
  /** هنگام بستن دیالوگ ورود دستی — برای تازه‌سازی ترجمه‌های ذخیره‌شدهٔ دستی */
  onOfflineClose?: () => void;
}

export interface UseRecordTranslationResult {
  /** handler «ترجمهٔ خودکار (آنلاین)» — سازگار با FormAction */
  translateOnline: () => Promise<void>;
  /** handler «ورود دستی (آفلاین)» — دیالوگ عمومی را باز می‌کند */
  openTranslateOffline: () => void;
  /** وضعیت دیالوگ آفلاین (در صورت نیاز برای نشانگرهای بیرونی) */
  offlineOpen: boolean;
  /** المان آمادهٔ دیالوگ — کافی است در فرم رندر شود */
  dialog: React.ReactNode;
}

export function useRecordTranslation(
  opts: UseRecordTranslationOptions,
): UseRecordTranslationResult {
  const { entityType, entityId, getFields, onTranslated, onOfflineClose } = opts;
  const t = useT();
  const activeLocales = useSettings((s) => s.activeLocales);
  const [offlineOpen, setOfflineOpen] = React.useState(false);

  const translateOnline = React.useCallback(async () => {
    if (entityId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    const fields = getFields();
    if (fields.length === 0) {
      toast.info(t("dfb.list.translateNoTextFields"));
      return;
    }
    const langs = LOCALES.filter((l) => l !== "fa" && activeLocales.includes(l));
    if (langs.length === 0) {
      toast.info(t("settings.activeLangs"));
      return;
    }
    try {
      const res = await fetch("/api/data-translations/auto-translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entityType, entityId, langs, fields }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || t("common.error"));
      }
      /* Task 98 (حکم مالک): در ترجمهٔ آنلاین هیچ مودالی باز نمی‌شود —
         ترجمه‌ها همین‌جا در انبار ذخیره شده‌اند؛ بازخورد = توست شمارش‌دار
         + onTranslated (نشستن فوری ترجمه در درخت/فهرست فرم). */
      await onTranslated?.();
      toast.success(
        t("dfb.list.translateDoneCounts")
          .replace("{n}", String(fields.length))
          .replace("{m}", String(langs.length)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    }
  }, [entityId, entityType, getFields, activeLocales, onTranslated, t]);

  const openTranslateOffline = React.useCallback(() => setOfflineOpen(true), []);
  const handleOfflineChange = React.useCallback(
    (o: boolean) => {
      if (o) {
        setOfflineOpen(true);
        return;
      }
      setOfflineOpen(false);
      onOfflineClose?.();
    },
    [onOfflineClose],
  );

  /* fields هر رندر تازه خوانده می‌شود — دیالوگِ بسته مصرفی ندارد و دیالوگِ
     باز همیشه فیلدهای رکورد جاری را می‌بیند (همان الگوی Party). */
  const dialog = (
    <DataTranslationsDialog
      open={offlineOpen}
      onOpenChange={handleOfflineChange}
      entityType={entityType}
      entityId={entityId}
      fields={getFields()}
    />
  );

  return { translateOnline, openTranslateOffline, offlineOpen, dialog };
}
