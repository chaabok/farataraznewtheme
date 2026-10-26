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
 * Task 108 (درخواست مالک) — ترجمهٔ زنجیرهٔ درخت: فرم‌های درختی (SimpleTreeForm)
 * با گزینهٔ اختیاری getSubtreeRecords همهٔ زیرشاخه‌های سرشاخهٔ انتخابی را هم
 * می‌دهند؛ «ترجمهٔ آنلاین» حالا شاخهٔ انتخابی + «تمامی زیرشاخه‌هایش» را در
 * دسته‌های ≤ CHUNK_RECORDS با endpoint دسته‌ای /api/data-translations/
 * auto-translate-batch (یک LLM به‌ازای هر دسته + save-many سرور) ترجمه می‌کند
 * — پیشرفت = توست شمارش‌دار «{done}/{total}»؛ کاربر دیگر نباید روی تک‌تک
 * زیرشاخه‌ها کلیک کند. فرم‌های بدون زیرشاخه (Party و…) عین رفتار قبلی.
 *
 * مصرف (حداقلی — عین فرم محل های جغرافیایی):
 *   const tr = useRecordTranslation({
 *     entityType: "GeoLocation", entityId: selectedId,
 *     getFields: () => [{ key: "title", label: t("bs.field.title"), value: form.title }],
 *     getSubtreeRecords: (rootId) => collectDescendants(rootId), // اختیاری — فرم درختی
 *     onTranslated: () => setTrVersion((v) => v + 1),
 *   });
 *   <FormShell onTranslateOnline={tr.translateOnline} onTranslateOffline={tr.openTranslateOffline} … />
 *   {tr.dialog}
 *
 * TranslateButton (Task 90) با رسیدن همین دو handler فعال می‌شود — پس «هر فرم
 * جدید» با چند خط، هر دو گزینهٔ منوی ترجمه را فعال دارد (و فرم درختی، ترجمهٔ
 * زنجیره‌ای زیرشاخه‌ها را خودکار می‌گیرد).
 */

import * as React from "react";
import { toast } from "sonner";
import { useT, useSettings } from "@/stores/settings-store";
import { LOCALES } from "@/i18n/config";
import {
  DataTranslationsDialog,
  type DataTranslationField,
} from "./data-translations-dialog";

/** یک رکورد زیرمجموعه برای ترجمهٔ زنجیره‌ای (Task 108) */
export interface SubtreeTranslationRecord {
  entityId: number;
  fields: DataTranslationField[];
}

export interface UseRecordTranslationOptions {
  /** مدل انبار DataTranslation («GeoLocation»، «Party»، … — ^[A-Za-z][A-Za-z0-9_]{0,39}$) */
  entityType: string;
  /** شناسهٔ رکورد باز — null یعنی رکوردی باز نیست (ترجمه با توست راهنما رد می‌شود) */
  entityId: number | null;
  /** فیلدهای متنیِ قابل ترجمهٔ رکورد باز (کلید پایدار / برچسب فرم / مقدار پایهٔ fa) */
  getFields: () => DataTranslationField[];
  /** Task 108 — (اختیاری؛ فرم درختی) همهٔ زیرشاخه‌های سرشاخهٔ انتخابی —
   * با رسیدنش، «ترجمهٔ آنلاین» زنجیره‌ای می‌شود: سرشاخه + تمامی زیرشاخه‌ها */
  getSubtreeRecords?: (rootEntityId: number) => SubtreeTranslationRecord[];
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

/** اندازهٔ دستهٔ ارسالی به endpoint دسته‌ای — = MAX_RECORDS سمت BFF */
const CHUNK_RECORDS = 25;
/** هم‌زمانی حلقهٔ دسته‌ها — تجربهٔ زندهٔ Task 108: سرویس LLM زیر فشار ×۳
 * 429 می‌دهد؛ ×۲ + صف تلاش‌مجدد + backoff = نرخ پایدار */
const CHUNK_CONCURRENCY = 2;
/** بیشینهٔ تلاش هر دسته در صف تلاش‌مجدد قلاب (server-side backoff هم دارد) */
const CHUNK_MAX_ATTEMPTS = 3;

export function useRecordTranslation(
  opts: UseRecordTranslationOptions,
): UseRecordTranslationResult {
  const { entityType, entityId, getFields, getSubtreeRecords, onTranslated, onOfflineClose } = opts;
  const t = useT();
  const activeLocales = useSettings((s) => s.activeLocales);
  const [offlineOpen, setOfflineOpen] = React.useState(false);
  /* گارد ورود دوباره — ترجمهٔ زنجیره‌ای ممکن است دقیقه‌ها طول بکشد */
  const runningRef = React.useRef(false);

  const translateOnline = React.useCallback(async () => {
    if (runningRef.current) {
      toast.info(t("dfb.list.translateTreeBusy"));
      return;
    }
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

    /* Task 108 — رکورد باز + همهٔ زیرشاخه‌های دارای فیلد متنی (فرم درختی) */
    const subtree = getSubtreeRecords?.(entityId) ?? [];
    const records: SubtreeTranslationRecord[] = [
      { entityId, fields },
      ...subtree.filter((r) => Number.isInteger(r.entityId) && r.entityId > 0 && r.fields.length > 0),
    ];
    /* برگ/فرم بدون زیرشاخه = عین مسیر تک‌رکوردی Task 92-99 */
    const chained = records.length > 1;

    runningRef.current = true;
    try {
      if (!chained) {
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
        return;
      }

      /* --- مسیر زنجیره‌ای (Task 108): دسته‌های ≤۲۵ رکورد، هم‌زمانی ×۳ --- */
      const chunks: SubtreeTranslationRecord[][] = [];
      for (let i = 0; i < records.length; i += CHUNK_RECORDS) {
        chunks.push(records.slice(i, i + CHUNK_RECORDS));
      }
      const progressToastId = `tr-tree-${Date.now()}`;
      const progressMsg = () =>
        t("dfb.list.translateTreeProgress")
          .replace("{done}", String(doneCount))
          .replace("{total}", String(records.length));
      let doneCount = 0;
      let failedChunks = 0;
      let failedRecords = 0;
      toast.loading(progressMsg(), { id: progressToastId, duration: Infinity });

      /* صف تلاش‌مجدد (Task 108 — تجربهٔ زندهٔ 429): دستهٔ ناموفق با backoff
         به انتهای صف برمی‌گردد تا هم‌زمانی پایین بماند و همهٔ دسته‌ها بالاخره
         ترجمه شوند؛ upsert سرور = امن برای تکرار. */
      interface ChunkJob {
        records: SubtreeTranslationRecord[];
        attempt: number;
      }
      const queue: ChunkJob[] = chunks.map((records) => ({ records, attempt: 1 }));
      const runChunk = async (job: ChunkJob): Promise<boolean> => {
        try {
          const res = await fetch("/api/data-translations/auto-translate-batch", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ entityType, langs, records: job.records }),
          });
          const json = (await res.json().catch(() => null)) as
            | { ok?: boolean; message?: string }
            | null;
          if (!res.ok || !json?.ok) {
            throw new Error(json?.message || t("common.error"));
          }
          return true;
        } catch {
          return false;
        }
      };
      const worker = async () => {
        for (;;) {
          const job = queue.shift();
          if (!job) return;
          const ok = await runChunk(job);
          if (ok) {
            doneCount += job.records.length;
            toast.loading(progressMsg(), { id: progressToastId, duration: Infinity });
          } else if (job.attempt < CHUNK_MAX_ATTEMPTS) {
            queue.push({ records: job.records, attempt: job.attempt + 1 });
            /* backoff — نفس‌کشیدن برای سقف نرخ سرویس LLM */
            await new Promise((r) => setTimeout(r, 3500 * job.attempt));
          } else {
            failedChunks += 1;
            failedRecords += job.records.length;
            doneCount += job.records.length;
            toast.loading(progressMsg(), { id: progressToastId, duration: Infinity });
          }
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(CHUNK_CONCURRENCY, chunks.length) }, () => worker()),
      );

      await onTranslated?.();
      if (failedChunks === 0) {
        toast.success(
          t("dfb.list.translateTreeDone")
            .replace("{n}", String(records.length))
            .replace("{m}", String(langs.length)),
          { id: progressToastId, duration: 6000 },
        );
      } else {
        toast.warning(
          t("dfb.list.translateTreePartial")
            .replace("{n}", String(records.length - failedRecords))
            .replace("{m}", String(langs.length))
            .replace("{k}", String(failedChunks)),
          { id: progressToastId, duration: 8000 },
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      runningRef.current = false;
    }
  }, [entityId, entityType, getFields, getSubtreeRecords, activeLocales, onTranslated, t]);

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
