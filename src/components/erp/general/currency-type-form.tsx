"use client";

import * as React from "react";
import { Coins } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
} from "@/components/forms/simple-form-two-row-tabbed";
import { normalizeDigits } from "@/components/forms/form-primitives";

/**
 * CurrencyTypeForm — Task 114 (درخواست مالک): فرم «نوع ارز جدید» در نرم‌افزار
 * «عمومی» ← زیرمنوی «اطلاعات پایه».
 *
 * فیلدها (عین تصویر مالک):
 *   ۱. کد — اجباری (مثل IRR/USD — کد یکتا در ساختار سازمانی).
 *   ۲. عنوان — اجباری (فارسی).
 *   ۳. عنوان لاتین — اجباری (LTR).
 *   ۴. واحد مبنا — اجباری، عدد صحیح ≥ ۱ (پیش‌فرض ۱).
 *   ۵. تعداد اعشار — اجباری، عدد صحیح ۰..۳ (الگوی ISO 4217؛ دینارها ۳).
 *   ۶. عنوان اعشار — اختیاری (مثل «سنت»).
 *   ۷. عنوان اعشار لاتین — اختیاری، LTR (مثل «Cent»).
 *   ۸. ثبت فعال — چک‌باکس (پیش‌فرض فعال).
 *
 * Seed (Task 114): ۲۵ ارز معتبر بین‌المللی ISO 4217 از بوت سرویس تنظیمات
 * (ریال ایران + majorهای جهان و همسایگان) در فهرست رکوردهای همین فرم دیده
 * می‌شوند — کد تکراری/عنوان تکراری رد می‌شود (سرور 409 با پیام روشن).
 */

interface CurrencyTypeDto {
  id: number;
  code: string;
  title: string;
  titleLatin: string;
  baseUnit: number;
  decimalPlaces: number;
  decimalTitle: string;
  decimalTitleLatin: string;
  isActive: boolean;
}

interface FormValues {
  code: string;
  title: string;
  titleLatin: string;
  baseUnit: string;
  decimalPlaces: string;
  decimalTitle: string;
  decimalTitleLatin: string;
  active: boolean;
}

const BLANK: FormValues = {
  code: "",
  title: "",
  titleLatin: "",
  baseUnit: "1",
  decimalPlaces: "0",
  decimalTitle: "",
  decimalTitleLatin: "",
  active: true,
};

export function CurrencyTypeForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "general")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<CurrencyTypeDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  /* Task 82 — unsaved-data flag of the tab (owner alarm contract) */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const fetchRecords = React.useCallback(async (): Promise<CurrencyTypeDto[]> => {
    const res = await api.get<{ items?: CurrencyTypeDto[] }>("currency-type");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: CurrencyTypeDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  const applyRecord = React.useCallback((r: CurrencyTypeDto) => {
    setCurrentId(r.id);
    setDirty(false); // Task 82 — رکورد ذخیره‌شده باز شد
    setValues({
      code: r.code,
      title: r.title,
      titleLatin: r.titleLatin,
      baseUnit: String(r.baseUnit),
      decimalPlaces: String(r.decimalPlaces),
      decimalTitle: r.decimalTitle ?? "",
      decimalTitleLatin: r.decimalTitleLatin ?? "",
      active: r.isActive,
    });
  }, []);

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // Task 82 — فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
  }, []);

  /* عنوان لاتین/عنوان اعشار لاتین: فقط نویسه‌های لاتین (LTR) — فیلتر هم‌زمان تایپ */
  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // Task 82 — هر ویرایش = اطلاعات ذخیره‌نشده
    if (typeof value === "string" && (id === "titleLatin" || id === "decimalTitleLatin")) {
      const latin = value.replace(/[^A-Za-z0-9 ()/.,'-]/g, "");
      setValues((v) => ({ ...v, [id]: latin }));
      return;
    }
    if (typeof value === "string" && (id === "baseUnit" || id === "decimalPlaces")) {
      const num = normalizeDigits(value).replace(/[^0-9]/g, "").slice(0, 2);
      setValues((v) => ({ ...v, [id]: num }));
      return;
    }
    setValues((v) => ({ ...v, [id]: value }));
  }, []);

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور، برای بازخورد فوری */
  const validate = (vals: FormValues): string | null => {
    if (vals.code.trim() === "") return t("currency.errCodeRequired");
    if (vals.title.trim() === "") return t("currency.errTitleRequired");
    if (vals.titleLatin.trim() === "") return t("currency.errTitleLatinRequired");
    const baseUnit = Number(normalizeDigits(vals.baseUnit));
    if (!Number.isInteger(baseUnit) || baseUnit < 1) return t("currency.errBaseUnit");
    const dec = Number(normalizeDigits(vals.decimalPlaces));
    if (!Number.isInteger(dec) || dec < 0 || dec > 3) return t("currency.errDecimal");
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT) */
  const doSave = async (): Promise<boolean> => {
    const err = validate(values);
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      code: values.code.trim(),
      title: values.title.trim(),
      titleLatin: values.titleLatin.trim(),
      baseUnit: Number(normalizeDigits(values.baseUnit)) || 1,
      decimalPlaces: Number(normalizeDigits(values.decimalPlaces)) || 0,
      decimalTitle: values.decimalTitle.trim(),
      decimalTitleLatin: values.decimalTitleLatin.trim(),
      isActive: values.active,
    };
    try {
      const res = currentId == null
        ? await api.post<CurrencyTypeDto>("currency-type", body)
        : await api.put<CurrencyTypeDto>(`currency-type/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as CurrencyTypeDto[]);
      applyRecords(rows);
      applyRecord(res);
      return true;
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
      return false;
    }
  };

  const doDelete = async (): Promise<void> => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    try {
      await api.del(`currency-type/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as CurrencyTypeDto[]);
      applyRecords(rows);
      newRecord();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ناوبری رکوردها «|< < > >|» */
  const currentIndex = records.findIndex((r) => r.id === currentId);
  const nav = (i: number) => {
    const r = records[i];
    if (r) applyRecord(r);
  };

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      { id: "code", label: t("currency.code"), required: true, value: values.code },
      { id: "title", label: t("currency.title"), required: true, value: values.title },
      { id: "titleLatin", label: t("currency.titleLatin"), required: true, ltr: true, value: values.titleLatin },
      { id: "baseUnit", label: t("currency.baseUnit"), required: true, type: "number", value: values.baseUnit },
      { id: "decimalPlaces", label: t("currency.decimalPlaces"), required: true, type: "number", value: values.decimalPlaces },
      { id: "decimalTitle", label: t("currency.decimalTitle"), value: values.decimalTitle },
      { id: "decimalTitleLatin", label: t("currency.decimalTitleLatin"), ltr: true, value: values.decimalTitleLatin },
      { id: "active", label: t("currency.active"), type: "checkbox", checked: values.active },
    ],
    [t, values],
  );

  return (
    <SimpleFormTwoRowTabbed
      title={t("currency.formTitle")}
      badge={t("app.general")}
      icon={<Coins className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ جدید: فرم خالی می‌شود */
        newRecord();
        toast.success(t("abar.resetToast"));
      }}
      onSave={async () => {
        await doSave();
      }}
      onSaveNew={async () => {
        if (await doSave()) newRecord();
      }}
      onCopy={() => {
        /* ثبت جدید با همان مقادیر — شناسه پاک می‌شود تا رکورد نو ساخته شود */
        setCurrentId(null);
        toast.success(t("abar.copyToast"));
      }}
      onDelete={doDelete}
      onDeleteNew={async () => {
        await doDelete();
        newRecord();
      }}
      onPrint={() => {
        toast.success(t("abar.printToast"));
      }}
      onClose={onBack}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: `${r.code} - ${r.title}`,
        subtitle: r.titleLatin || undefined,
        cells: [
          { label: t("currency.code"), value: r.code },
          { label: t("currency.title"), value: r.title },
          { label: t("currency.titleLatin"), value: r.titleLatin },
          { label: t("currency.baseUnit"), value: String(r.baseUnit) },
          { label: t("currency.decimalPlaces"), value: String(r.decimalPlaces) },
          { label: t("currency.decimalTitle"), value: r.decimalTitle },
          { label: t("currency.decimalTitleLatin"), value: r.decimalTitleLatin },
          { label: t("currency.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
        ],
      }))}
      listLoading={listLoading}
      listActiveId={currentId != null ? String(currentId) : null}
      onListRefresh={async () => {
        try {
          applyRecords(await fetchRecords());
        } catch {
          applyRecords([]);
        }
      }}
      onOpenListItem={(item) => {
        const r = records.find((x) => String(x.id) === item.id);
        if (r) {
          applyRecord(r);
          toast.success(t("abar.itemOpened"));
        }
      }}
      canDelete={currentId != null}
      onHeaderClose={onBack}
      onHeaderMinimize={chrome?.onMinimize}
      onHeaderMaximize={chrome?.onToggleMaximize}
      headerMaximized={headerMaximized}
      onHeaderDragStart={chrome?.onDragStart}
      onHeaderDragMove={chrome?.onDragMove}
      onHeaderDragEnd={chrome?.onDragEnd}
      onHeaderDoubleClick={chrome?.onDoubleClick}
    />
  );
}
