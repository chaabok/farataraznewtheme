"use client";

import * as React from "react";
import {
  Boxes,
  Calculator,
  HandCoins,
  Landmark,
  ListPlus,
  ReceiptText,
  Save,
  ShoppingCart,
  SlidersHorizontal,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { useTabDirty } from "@/components/desktop/app-window";
import type { DictKey } from "@/i18n/dictionaries";
import { LanguageSettingsSections } from "@/components/erp/settings/language-settings";

/* Task 72 (owner-approved consultation) — «پیکربندی نرم افزارها» hub inside
   the Settings window: one tab per system software (7 announced by the owner;
   the list grows gradually). Each configuration FIELD of a software is one
   key/value row in the SoftwareConfig table (full AppBaseEntity inheritance on
   the server) so FUTURE field announcements need NO database migration — only
   an entry in SOFTWARE_CONFIG_FIELDS below (+ backend whitelist mirror +
   i18n labels). Until a tab's fields are announced it renders the pending
   placeholder.

   Task 73 (owner request) — the «عمومی» tab hosts the FIRST announced
   content: the language + active-languages sections (moved out of the
   settings home). They are client-side settings (erp.settings persist) and
   render ABOVE the future SoftwareConfig rows of this tab. */

export interface SwConfigFieldDef {
  /** پایدار — کلید ردیف در SoftwareConfig.ConfigKey (پس از انتشار تغییر نکنید). */
  key: string;
  labelKey: DictKey;
  type: "text" | "number" | "date" | "checkbox" | "select" | "textarea";
  required?: boolean;
  /** فقط برای type="number" — بازهٔ مجاز (اعتبارسنجی فرانت + آینهٔ قانون سرور) */
  min?: number;
  max?: number;
  /** فقط برای type="number" — فقط عدد صحیح (شمارنده‌ها) */
  integer?: boolean;
  /** فقط برای type="number" — مقدار پیش‌فرض وقتی مقدار ذخیره‌شده‌ای وجود ندارد */
  defaultValue?: string;
  /** فقط برای type="select" */
  options?: { value: string; labelKey: DictKey }[];
  /** Task 135 — گروپ فیلد: فیلدهای هم‌گروه پشت‌سرهم داخل یک فیلدست با عنوان
   *  مشترک و شبکهٔ ۲ستونی (RTL: اولین فیلد = راست‌ترین — عین تصویر مالک) رندر
   *  می‌شوند؛ فیلدهای بی‌گروه مثل قبل ساده می‌آیند. */
  groupLabelKey?: DictKey;
  /** Task 137 — فیلد مشتق‌شده (فقط‌خواندنی): مقدار = value(from) − Σvalue(minus)
   *  به‌صورت زنده از مقادیر فعلی فرم (با بازگشت به defaultValue)؛ در payload
   *  همان مقدار محاسبه‌شده ارسال می‌شود و سرور هم برابری را کنترل می‌کند. */
  derived?: { from: string; minus: string[] };
}

/** ۷ نرم‌افزارِ اعلام‌شدهٔ مالک — عنوان‌ها از واژه‌نامهٔ کاتالوگ (×۱۳ زبان موجود)؛
    فقط «حقوق» طبق عبارت دقیق مالک کلید مستقل گرفت (settings.swConfigPayroll). */
const SW_CONFIG_TABS: { appKey: string; titleKey: DictKey; icon: React.ElementType }[] = [
  { appKey: "general", titleKey: "app.general", icon: Boxes },
  { appKey: "accounting", titleKey: "app.accounting", icon: Calculator },
  { appKey: "receiptsPayment", titleKey: "app.receiptsPayment", icon: ReceiptText },
  { appKey: "inventory", titleKey: "app.inventory", icon: Warehouse },
  { appKey: "sales", titleKey: "app.sales", icon: ShoppingCart },
  { appKey: "fixedAssets", titleKey: "app.fixedAssets", icon: Landmark },
  { appKey: "payroll", titleKey: "settings.swConfigPayroll", icon: HandCoins },
];

/** رجیستری فیلدهای پیکربندی هر نرم‌افزار (سمت فرانت — آینهٔ whitelist سرور در
    software-config.dto.ts). فیلدها «به‌مرور» اعلام می‌شوند؛ هر اعلام = افزودن
    به همین رجیستری + ترجمه‌های labelKey — بدون هیچ مهاجرت دیتابیس/کد جدید. */
const SOFTWARE_CONFIG_FIELDS: Record<string, SwConfigFieldDef[]> = {
  general: [
    {
      /* Task 95 (درخواست مالک) — اولین فیلد اعلام‌شدهٔ تب «عمومی»:
         «ترجمه آنلاین اطلاعات فیلدها همزمان با ذخیره‌سازی» — فعال ⇒ ذخیرهٔ
         فرم، ترجمهٔ آنلاین را خودکار اجرا می‌کند؛ آینهٔ سرور:
         software-config.dto.ts (type checkbox، پیش‌فرض «0»). */
      key: "autoTranslateOnSave",
      labelKey: "settings.swAutoTranslateOnSave",
      type: "checkbox",
    },
  ],
  accounting: [
    {
      /* Task 73 — اولین فیلد اعلام‌شدهٔ مالک (تب حسابداری):
         «تعداد ماه‌های مالی» — عددی، پیش‌فرض ۱۲، حداکثر ۱۶؛
         آینهٔ قانون سرور: software-config.dto.ts (min 1 / max 16 / integer). */
      key: "fiscalMonthsCount",
      labelKey: "settings.swFiscalMonths",
      type: "number",
      min: 1,
      max: 16,
      integer: true,
      defaultValue: "12",
    },
    /* Task 135 + 136 + 137 (درخواست مالک) — گروپ فیلد «طول کدینگ حسابها»:
       سطر ۱ = راست «طول کد حسابها» (۶ — Task 137 تازه) و چپ «طول گروه حساب» (۲)؛
       سطر ۲ = راست «طول حساب کل» (۲ — پیش‌فرض Task 137) و چپ «طول حساب معین»
       (مشتق‌شدهٔ فقط‌خواندنی = طول کد حسابها − طول گروه حساب − طول حساب کل؛
       عبارت مالک Task 137: «از تفریغ طول کدحسابها و طول گروه حساب و طول
       حساب کل محاسبه می شود و فیلد فقط خواندنی می باشد» — پیش‌فرض‌ها: 6−2−2=2)؛
       سطر ۳ = «طول حساب تفصیلی» (۰ — از Task 135 حفظ شده). آینهٔ سرور:
       software-config.dto.ts. */
    {
      /* Task 137 — طول کد حسابها (کل طول کدینگ) — اولین فیلد گروه */
      key: "accCodeLen",
      labelKey: "settings.swAccCodeLen",
      type: "number",
      required: true,
      min: 1,
      max: 15,
      integer: true,
      defaultValue: "6",
      groupLabelKey: "settings.swAccCodeLenGroup",
    },
    {
      key: "accGroupCodeLen",
      labelKey: "settings.swAccGroupLen",
      type: "number",
      required: true,
      min: 1,
      max: 15,
      integer: true,
      defaultValue: "2",
      groupLabelKey: "settings.swAccCodeLenGroup",
    },
    {
      key: "accLedgerCodeLen",
      labelKey: "settings.swAccLedgerLen",
      type: "number",
      required: true,
      min: 1,
      max: 15,
      integer: true,
      defaultValue: "2",
      groupLabelKey: "settings.swAccCodeLenGroup",
    },
    {
      key: "accSubsidiaryCodeLen",
      labelKey: "settings.swAccSubsidiaryLen",
      type: "number",
      required: true,
      min: 0,
      max: 15,
      integer: true,
      defaultValue: "2",
      groupLabelKey: "settings.swAccCodeLenGroup",
      derived: { from: "accCodeLen", minus: ["accGroupCodeLen", "accLedgerCodeLen"] },
    },
    {
      key: "accDetailCodeLen",
      labelKey: "settings.swAccDetailLen",
      type: "number",
      required: true,
      min: 0,
      max: 15,
      integer: true,
      defaultValue: "0",
      groupLabelKey: "settings.swAccCodeLenGroup",
    },
  ],
  receiptsPayment: [],
  inventory: [],
  sales: [],
  fixedAssets: [],
  payroll: [],
};

type ValuesMap = Record<string, string>;

export function SoftwareConfigBody() {
  const t = useT();
  const [activeTab, setActiveTab] = React.useState<string>("general");
  const [values, setValues] = React.useState<Record<string, ValuesMap>>({});
  /* Task 82 — unsaved-data flag of the hosting tab (owner alarm contract):
     با اولین تغییر مقدار روشن و پس از ذخیرهٔ موفق خاموش می‌شود */
  const [cfgDirty, setCfgDirty] = React.useState(false);
  useTabDirty(cfgDirty);

  const fields = SOFTWARE_CONFIG_FIELDS[activeTab] ?? [];

  /* واکشی خالص — بدون setState (الگوی fetchRows در records-list) */
  const fetchValues = React.useCallback(async (appKey: string): Promise<ValuesMap> => {
    const res = await fetch(`/api/settings/software-config/${appKey}`);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      items?: { configKey: string; configValue: string }[];
    };
    const map: ValuesMap = {};
    for (const it of data.items ?? []) map[it.configKey] = it.configValue;
    return map;
  }, []);

  const applyValues = React.useCallback((appKey: string, map: ValuesMap | null) => {
    setValues((prev) => ({ ...prev, [appKey]: map ?? {} }));
  }, []);

  /* فقط وقتی تب فیلد اعلام‌شده دارد واکشی می‌کنیم (تا آن زمان هیچ درخواست
     شبکه‌ای لازم نیست)؛ کش در state کلیدخورده با appKey می‌ماند. */
  React.useEffect(() => {
    if ((SOFTWARE_CONFIG_FIELDS[activeTab] ?? []).length === 0) return;
    if (values[activeTab] !== undefined) return;
    let alive = true;
    fetchValues(activeTab)
      .then((map) => {
        if (alive) applyValues(activeTab, map);
      })
      .catch(() => {
        if (alive) applyValues(activeTab, null);
      });
    return () => {
      alive = false;
    };
  }, [activeTab, values, fetchValues, applyValues]);

  const setVal = (key: string, v: string) => {
    setCfgDirty(true); // Task 82 — ویرایش ذخیره‌نشده
    setValues((prev) => ({ ...prev, [activeTab]: { ...(prev[activeTab] ?? {}), [key]: v } }));
  };

  const save = async () => {
    if (values[activeTab] === undefined) return; // دادهٔ تب هنوز لود نشده
    /* Task 73 — اعتبارسنجی بازهٔ فیلدهای عددی پیش از ارسال (خط اول؛
       خط دوم همان قانون روی سرور است) */
    for (const f of fields) {
      if (f.type !== "number") continue;
      const label = t(f.labelKey);
      /* Task 137 — مقدار فیلد مشتق‌شده = محاسبهٔ زندهٔ فرم (نه مقدار state) */
      const v = f.derived ? derivedValue(f) : (values[activeTab]?.[f.key] ?? f.defaultValue ?? "");
      if (v === "") {
        if (f.derived) {
          /* مراجع عدد معتبر ندارند — مثلاً ورودی خالی شده */
          toast.error(t("settings.swDeriveError").replace("{field}", label));
          return;
        }
        continue;
      }
      const num = Number(v);
      if (!Number.isFinite(num)) {
        toast.error(t("settings.swRangeError").replace("{field}", label).replace("{min}", String(f.min ?? 0)).replace("{max}", String(f.max ?? 0)));
        return;
      }
      if (f.integer && !Number.isInteger(num)) {
        toast.error(t("settings.swIntError").replace("{field}", label));
        return;
      }
      if ((f.min !== undefined && num < f.min) || (f.max !== undefined && num > f.max)) {
        /* منفی‌شدن معین (کد حسابها < گروه + کل) پیام اختصاصی دارد */
        if (f.derived && f.min !== undefined && num < f.min) {
          toast.error(t("settings.swDeriveError").replace("{field}", label));
          return;
        }
        toast.error(t("settings.swRangeError").replace("{field}", label).replace("{min}", String(f.min ?? 0)).replace("{max}", String(f.max ?? 0)));
        return;
      }
    }
    try {
      const res = await fetch(`/api/settings/software-config/${activeTab}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: fields.map((f) => ({
            configKey: f.key,
            /* Task 137 — فیلد مشتق‌شده همان مقدار محاسبه‌شدهٔ زنده را می‌فرستد */
            configValue: f.derived
              ? derivedValue(f)
              : (values[activeTab]?.[f.key] ?? f.defaultValue ?? ""),
          })),
        }),
      });
      if (!res.ok) {
        /* پیام روشن سرور (مثل رد بازهٔ ۴۲۲) مستقیم به توست می‌رسد */
        const serverMsg = await res
          .json()
          .then((j) => (typeof j?.message === "string" && j.message ? j.message : ""))
          .catch(() => "");
        toast.error(serverMsg || t("common.error"));
        return;
      }
      toast.success(t("common.save"));
      setCfgDirty(false); // Task 82 — ذخیره شد
      applyValues(activeTab, await fetchValues(activeTab)); // بازخوانی پس از ذخیره
    } catch {
      toast.error(t("common.error"));
    }
  };

  /* Task 135 — قطعه‌بندی فیلدها: فیلدهای هم‌گروهِ پشت‌سرهم در یک فیلدست با
     عنوان مشترک و شبکهٔ ۲ستونی می‌نشینند (RTL: اولین فیلد = راست‌ترین —
     عین چینش تصویر مالک)؛ فیلدهای بی‌گروه مثل قبل ساده می‌آیند. */
  const segments: { group: DictKey | null; fields: SwConfigFieldDef[] }[] = [];
  for (const f of fields) {
    const g = f.groupLabelKey ?? null;
    const last = segments[segments.length - 1];
    if (last && last.group === g) last.fields.push(f);
    else segments.push({ group: g, fields: [f] });
  }

  const renderField = (f: SwConfigFieldDef) => {
    /* Task 73 — مقدار پیش‌فرض وقتی ردیف ذخیره‌شده‌ای نیست */
    const val = values[activeTab]?.[f.key] ?? f.defaultValue ?? "";
    if (f.type === "checkbox") {
      return (
        <label
          key={f.key}
          className="flex cursor-pointer items-center justify-between gap-3 text-sm"
        >
          <span className="font-medium">{t(f.labelKey)}</span>
          <input
            type="checkbox"
            checked={val === "1"}
            onChange={(e) => setVal(f.key, e.target.checked ? "1" : "0")}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
        </label>
      );
    }
    return (
      <div key={f.key} className="space-y-1.5">
        <label htmlFor={`swc-${f.key}`} className="text-sm font-medium">
          {t(f.labelKey)}
          {f.required ? <span className="text-rose-500"> *</span> : null}
        </label>
        {f.type === "textarea" ? (
          <textarea
            id={`swc-${f.key}`}
            dir="auto"
            rows={3}
            value={val}
            onChange={(e) => setVal(f.key, e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : f.type === "select" ? (
          <select
            id={`swc-${f.key}`}
            dir="auto"
            value={val}
            onChange={(e) => setVal(f.key, e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">—</option>
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`swc-${f.key}`}
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
            dir={f.type === "number" || f.type === "date" ? "ltr" : "auto"}
            min={f.type === "number" ? f.min : undefined}
            max={f.type === "number" ? f.max : undefined}
            step={f.type === "number" ? 1 : undefined}
            value={val}
            onChange={(e) => setVal(f.key, e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* hub header */}
      <div className="border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md">
            <SlidersHorizontal className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold">{t("settings.swConfig")}</h2>
            <p className="text-xs text-muted-foreground">{t("settings.swConfigDesc")}</p>
          </div>
        </div>
      </div>

      {/* tab strip — RTL natural order, horizontally scrollable on narrow widths */}
      <div
        role="tablist"
        aria-label={t("settings.swConfig")}
        className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border/60 px-3 py-2 scrollbar-slim"
      >
        {SW_CONFIG_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.appKey === activeTab;
          return (
            <button
              key={tab.appKey}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.appKey)}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs transition-all cursor-pointer",
                isActive
                  ? "border-primary bg-primary/10 font-semibold text-primary shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t(tab.titleKey)}
            </button>
          );
        })}
      </div>

      {/* tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim" dir="auto">
        <div className="mx-auto max-w-xl space-y-4 p-4">
          {activeTab === "general" && (
            /* Task 73 — محتوای اعلام‌شدهٔ تب «عمومی»: زبان + زبان‌های فعال
               (تنظیمات سمت کلاینت با ماندگاری erp.settings؛ ردیف‌های
               SoftwareConfig این تب هنوز اعلام نشده‌اند) */
            <LanguageSettingsSections />
          )}
          {fields.length === 0 && activeTab !== "general" && (
            /* placeholder — فیلدهای این تب هنوز اعلام نشده‌اند */
            <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                  <ListPlus className="h-7 w-7 text-muted-foreground" aria-hidden />
                </span>
                <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {t("settings.swConfigPending")}
                </p>
              </div>
            </div>
          )}
          {fields.length > 0 && (
            /* فرم فیلدهای اعلام‌شده — هر اعلام جدید فقط از رجیستری می‌آید؛
               Task 135: فیلدهای هم‌گروه داخل فیلدست با شبکهٔ ۲ستونی */
            <section className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="space-y-4">
                {segments.map((seg, si) =>
                  seg.group === null ? (
                    <div key={`plain-${si}`} className="space-y-4">
                      {seg.fields.map((f) => renderField(f))}
                    </div>
                  ) : (
                    <div
                      key={`group-${seg.group}`}
                      role="group"
                      aria-labelledby={`swc-grp-${si}`}
                      className="rounded-xl border border-border/70 bg-background/40 p-4"
                    >
                      <p id={`swc-grp-${si}`} className="mb-3 text-sm font-semibold">
                        {t(seg.group)}
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {seg.fields.map((f) => renderField(f))}
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={save}
                  disabled={values[activeTab] === undefined}
                  className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {t("common.save")}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
