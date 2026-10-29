"use client";

import * as React from "react";
import {
  Boxes,
  Calculator,
  HandCoins,
  Landmark,
  ListPlus,
  ReceiptText,
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
/* Task 138 — دکمهٔ ذخیره از خانوادهٔ اکشن‌بار فرم‌ها: همان آیکون/ظاهر
   ذخیرهٔ اکشن‌بار (دکمهٔ مربعی سبز با آیکون Save و تولتیپ) در هدر. */
import { SaveButton } from "@/components/forms/action-bar/save-button";

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
      /* Task 138 — مالک: «فیلد طول کدتفصیلی را بصورت پیش فرض با عدد 6
         تکمیل نمایید» ⇒ پیش‌فرض از ۰ به ۶؛ آینهٔ سرور: software-config.dto.ts */
      defaultValue: "6",
      groupLabelKey: "settings.swAccCodeLenGroup",
    },
    {
      /* Task 139 (درخواست مالک) — فیلد مستقل «تعداد سطوح تفصیلی» (تب
         حسابداری): عددی، پیش‌فرض ۱۰، حداکثر ۲۰؛ حداقل ۱ (تفسیر اعلامی §0.6 —
         شمارِ سطوح نمی‌تواند صفر یا منفی باشد)؛ بیرون از گروپ «طول کدینگ
         حسابها» چون مالک آن را فیلدی جداگانه اعلام کرد. آینهٔ سرور:
         software-config.dto.ts. */
      key: "accDetailLevels",
      labelKey: "settings.swAccDetailLevels",
      type: "number",
      required: true,
      min: 1,
      max: 20,
      integer: true,
      defaultValue: "10",
    },
    /* Task 155 (درخواست مالک) — ۴ فیلد چک‌باکس تصویر مالک (تب حسابداری)،
       به ترتیب تصویر؛ فقط اولی پیش‌فرض تیک‌دار است و بقیه خالی:
       ۱. «سقف تاریخ و شماره پیگیری در سند نمایش داده شود» (تیک‌دار در تصویر)
       ۲. «ورود اطلاعات تاریخ و شماره پیگیری اجباری باشد»
       ۳. «سقف های ارزی نمایش داده شود»
       ۴. «دسترسی مجاز در سطح معین فعال باشد»
       آینهٔ سرور: software-config.dto.ts. */
    {
      key: "showDocDateTrackCap",
      labelKey: "settings.swDocDateTrackCap",
      type: "checkbox",
      defaultValue: "1",
    },
    {
      key: "docDateTrackEntryMandatory",
      labelKey: "settings.swDocDateTrackMandatory",
      type: "checkbox",
      defaultValue: "0",
    },
    {
      key: "showCurrencyCaps",
      labelKey: "settings.swCurrencyCaps",
      type: "checkbox",
      defaultValue: "0",
    },
    {
      key: "enableMoeinLevelAccess",
      labelKey: "settings.swMoeinLevelAccess",
      type: "checkbox",
      defaultValue: "0",
    },
  ],
  receiptsPayment: [],
  inventory: [],
  sales: [],
  fixedAssets: [],
  payroll: [],
};

/* Task 156 (درخواست مالک) — بنتوگرید باکس‌های فیلدها (همهٔ تب‌ها):
   «برای نمایش فیلدها به کاربر از باکس های مختلف استفاده کنید که همه فیلدها
   در یک باکس نباشد. باکس ها باید با استایل تصویری که برات بارگذاری کردم
   نمایش داده شوند. چیدمان باکس ها دقیقا مشابه تصویر باشد. پس زمینه تیره
   نباشد. می خواهم بنتوگرید باشد.»
   سبک تصویر: کارت‌های گرد (rounded-3xl) با اندازه‌های متنوع — کارت بلند
   سفید (یک‌طرف)، کارت سبز پهن (بالا)، کارت روشن (وسط)، کارت سبز بلند
   (طرف دیگر) و کارت روشن پهن (پایین)؛ همه با توکن‌های تم — بدون هیچ
   پس‌زمینهٔ تیره (الگوی تاییدشدهٔ Task 152). هر ورودی = یک باکس مستقل؛
   تب‌های بدون چیدمان صریح به‌صورت خودکار هر قطعه (segment) را در یک باکس
   جدا نشان می‌دهند تا اعلام‌های آینده هم بنتو بمانند. */
type BentoVariant = "plain" | "accent";

interface BentoBoxSpec {
  /** عنوان باکس (اختیاری — سبک برچسب کوچک تصویر) */
  titleKey?: DictKey;
  /** کلید فیلدهای این باکس به ترتیب نمایش */
  fields: string[];
  /** plain = کارت روشن تم‌پسند | accent = کارت سبز زمردی (سبک تصویر) */
  variant: BentoVariant;
  /** ورودی عددی درشت (سبک «$12.99»/«Aa» کارت سبز تصویر) */
  big?: boolean;
  /** کلاس جای‌گذاری در گرید بنتو (span ستون/ردیف) */
  cls?: string;
}

const BENTO_LAYOUT: Record<string, BentoBoxSpec[]> = {
  accounting: [
    /* کارت بلند سفید (یک‌طرف بنتو — عین کارت «UPGRADE DISCOUNT» تصویر):
       گروپ «طول کدینگ حسابها» با ۵ فیلد پشت‌سرهم + پانوشت قاعدهٔ مشتق‌شده */
    {
      titleKey: "settings.swAccCodeLenGroup",
      fields: ["accCodeLen", "accGroupCodeLen", "accLedgerCodeLen", "accSubsidiaryCodeLen", "accDetailCodeLen"],
      variant: "plain",
      cls: "sm:col-span-2 lg:col-span-1 lg:row-span-2",
    },
    /* کارت سبز پهن با عدد درشت (سبک کارت «Urbanist Aa» تصویر) */
    {
      titleKey: "settings.swFiscalMonths",
      fields: ["fiscalMonthsCount"],
      variant: "accent",
      big: true,
    },
    /* کارت روشن کوچک (سبک کارت «ANALYSIS» تصویر — روشن نه تیره) */
    {
      titleKey: "settings.swAccDetailLevels",
      fields: ["accDetailLevels"],
      variant: "plain",
    },
    /* کارت سبز بلند (طرف دیگر بنتو — سبک کارت موبایل تصویر):
       دو چک‌باکسِ «تاریخ و شماره پیگیری» */
    {
      titleKey: "settings.swDocDateTrackGroup",
      fields: ["showDocDateTrackCap", "docDateTrackEntryMandatory"],
      variant: "accent",
      cls: "sm:col-span-2 lg:col-span-1 lg:row-span-2",
    },
    /* کارت روشن پهن پایین (سبک کارت «technexus» تصویر):
       دو چک‌باکس دیگر در کنار هم */
    {
      titleKey: "settings.swDocOtherGroup",
      fields: ["showCurrencyCaps", "enableMoeinLevelAccess"],
      variant: "plain",
      cls: "sm:col-span-2 lg:col-span-2",
    },
  ],
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

  /* Task 137 — مقدار مشتق‌شدهٔ زندهٔ یک فیلد (derived): value(from) − Σvalue(minus)
     از مقادیر فعلی فرم؛ برای هر مرجع، مقدار ویرایش‌شده وگرنه defaultValue
     (هم‌راستا با چیزی که پس از ذخیره/بازخوانی نمایش داده می‌شود)؛ اگر هر مرجع
     عدد معتبری نباشد رشتهٔ خالی برمی‌گردد (ذخیره با خطای اختصاصی رد می‌شود). */
  const derivedValue = (f: SwConfigFieldDef): string => {
    if (!f.derived) return "";
    const defs = SOFTWARE_CONFIG_FIELDS[activeTab] ?? [];
    const eff = (key: string): string => {
      const v = values[activeTab]?.[key];
      if (v !== undefined && v !== "") return v;
      return defs.find((d) => d.key === key)?.defaultValue ?? "";
    };
    const raws = [eff(f.derived.from), ...f.derived.minus.map(eff)];
    if (raws.some((r) => r === "")) return "";
    const nums = raws.map((r) => Number(r));
    if (nums.some((n) => !Number.isFinite(n))) return "";
    return String(nums[0] - nums.slice(1).reduce((s, n) => s + n, 0));
  };

  const save = async () => {
    if (fields.length === 0) return;
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

  /* Task 135 — قطعه‌بندی فیلدها (fallback بنتوی خودکار برای تب‌های بدون
     چیدمان صریح): فیلدهای هم‌گروهِ پشت‌سرهم یک باکس می‌شوند؛ هر قطعه = یک
     باکس مستقل تا همهٔ تب‌ها (حالا و آینده) بنتو بمانند. */
  const segments: { group: DictKey | null; fields: SwConfigFieldDef[] }[] = [];
  for (const f of fields) {
    const g = f.groupLabelKey ?? null;
    const last = segments[segments.length - 1];
    if (last && last.group === g) last.fields.push(f);
    else segments.push({ group: g, fields: [f] });
  }

  /* Task 156 — مونتاژ باکس‌های بنتوی تب فعال:
     چیدمان صریح BENTO_LAYOUT اگر هست، وگرنه قطعه‌بندی خودکار؛ فیلدهای
     ثبت‌شده در رجیستری ولی خارج از چیدمان صریح هم در باکس احتیاطی دیده
     می‌شوند تا هیچ فیلد اعلام‌شده‌ای بی‌باکس نماند. */
  const bentoBoxes: {
    key: string;
    titleKey?: DictKey;
    defs: SwConfigFieldDef[];
    variant: BentoVariant;
    big?: boolean;
    cls?: string;
  }[] = [];
  const layout = BENTO_LAYOUT[activeTab];
  if (layout) {
    const covered = new Set<string>();
    layout.forEach((spec, i) => {
      const defs = spec.fields
        .map((key) => fields.find((f) => f.key === key))
        .filter((f): f is SwConfigFieldDef => !!f);
      defs.forEach((d) => covered.add(d.key));
      if (defs.length > 0)
        bentoBoxes.push({
          key: `bento-${i}`,
          titleKey: spec.titleKey,
          defs,
          variant: spec.variant,
          big: spec.big,
          cls: spec.cls,
        });
    });
    const leftovers = fields.filter((f) => !covered.has(f.key));
    if (leftovers.length > 0)
      bentoBoxes.push({
        key: "bento-leftover",
        defs: leftovers,
        variant: "plain",
        cls: "sm:col-span-2 lg:col-span-4",
      });
  } else {
    segments.forEach((seg, si) => {
      bentoBoxes.push({
        key: `auto-${si}`,
        titleKey: seg.group ?? undefined,
        defs: seg.fields,
        variant: "plain",
        cls:
          segments.length === 1
            ? "sm:col-span-2 lg:col-span-4"
            : "sm:col-span-1 lg:col-span-2",
      });
    });
  }

  const renderField = (f: SwConfigFieldDef, variant: BentoVariant = "plain", big = false) => {
    /* Task 73 — مقدار پیش‌فرض وقتی ردیف ذخیره‌شده‌ای نیست؛ Task 137 — فیلد
       مشتق‌شده مقدار زندهٔ محاسبه‌شده را نشان می‌دهد (فقط‌خواندنی) */
    const val = f.derived
      ? derivedValue(f)
      : (values[activeTab]?.[f.key] ?? f.defaultValue ?? "");
    const accent = variant === "accent";
    if (f.type === "checkbox") {
      return (
        <label
          key={f.key}
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 text-sm",
            /* Task 156 — کاشی سفیدنما روی کارت سبز (سبک ویجت‌های تصویر مالک) */
            accent && "rounded-2xl bg-white/10 px-3.5 py-3 text-white",
          )}
        >
          <span className="font-medium leading-6">{t(f.labelKey)}</span>
          <input
            type="checkbox"
            checked={val === "1"}
            onChange={(e) => setVal(f.key, e.target.checked ? "1" : "0")}
            className={cn(
              "h-4 w-4 shrink-0",
              accent ? "accent-white" : "accent-[hsl(var(--primary))]",
            )}
          />
        </label>
      );
    }
    return (
      <div key={f.key} className="space-y-1.5">
        <label htmlFor={`swc-${f.key}`} className={cn("text-sm font-medium", accent && "text-white/90")}>
          {t(f.labelKey)}
          {f.required ? (
            <span className={accent ? "text-emerald-100" : "text-rose-500"}> *</span>
          ) : null}
        </label>
        {f.type === "textarea" ? (
          <textarea
            id={`swc-${f.key}`}
            dir="auto"
            rows={3}
            value={val}
            onChange={(e) => setVal(f.key, e.target.value)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring",
              accent
                ? "border border-white/30 bg-white/15 text-white placeholder:text-white/60"
                : "border border-border bg-background",
            )}
          />
        ) : f.type === "select" ? (
          <select
            id={`swc-${f.key}`}
            dir="auto"
            value={val}
            onChange={(e) => setVal(f.key, e.target.value)}
            className={cn(
              "h-9 w-full rounded-lg px-2 text-sm outline-none focus:ring-2 focus:ring-ring",
              accent
                ? "border border-white/30 bg-white/15 text-white"
                : "border border-border bg-background",
            )}
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
            /* Task 137 — فیلد مشتق‌شده فقط‌خواندنی است؛ مقدارش از سه فیلد
               دیگر به‌دست می‌آید و با تغییر آن‌ها زنده به‌روز می‌شود */
            readOnly={!!f.derived}
            aria-readonly={f.derived ? "true" : undefined}
            title={f.derived ? t("settings.swAccDeriveHint") : undefined}
            className={cn(
              "w-full outline-none focus:ring-2",
              big
                ? /* Task 156 — عدد درشت کارت سبز (سبک «$12.99»/«Aa» تصویر) */
                  "h-14 rounded-2xl border border-white/30 bg-white/15 px-4 text-3xl font-bold text-white focus:ring-white/60"
                : cn(
                    "h-9 rounded-lg px-3 text-sm focus:ring-ring",
                    accent
                      ? "border border-white/30 bg-white/15 text-white"
                      : "border border-border bg-background",
                    f.derived && !accent && "cursor-default bg-muted/50 text-muted-foreground",
                  ),
            )}
          />
        )}
      </div>
    );
  };

  /* Task 156 — رندر یک باکس بنتو (کارت گرد تصویر مالک؛ روشن یا سبز زمردی) */
  const renderBentoBox = (box: (typeof bentoBoxes)[number]) => {
    const accent = box.variant === "accent";
    const hasDerived = box.defs.some((f) => f.derived);
    const bigDef = box.big ? box.defs[0] : undefined;
    return (
      <div
        key={box.key}
        role={box.titleKey ? "group" : undefined}
        aria-label={box.titleKey ? t(box.titleKey) : undefined}
        className={cn(
          "flex flex-col gap-3 rounded-3xl p-5",
          accent
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
            : "border border-border/70 bg-card shadow-sm",
          box.cls,
        )}
      >
        {box.titleKey && (
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              accent ? "text-white/85" : "text-muted-foreground",
            )}
          >
            {t(box.titleKey)}
          </p>
        )}
        {box.big ? (
          <div className="flex flex-1 items-center">{box.defs.map((f) => renderField(f, box.variant, true))}</div>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-3">{box.defs.map((f) => renderField(f, box.variant))}</div>
        )}
        {bigDef && bigDef.min !== undefined && bigDef.max !== undefined && (
          /* پانوشت کارت سبز (سبک نوار پیشرفت تصویر) — بازهٔ مجاز مقدار */
          <div className="flex items-center justify-between">
            <span dir="ltr" className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[11px] text-white">
              {bigDef.min}–{bigDef.max}
            </span>
          </div>
        )}
        {hasDerived && (
          <p
            className={cn(
              "text-[11px] leading-relaxed",
              accent ? "text-white/75" : "text-muted-foreground",
            )}
          >
            {t("settings.swAccDeriveHint")}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* hub header — Task 138: دکمهٔ ذخیره به هدر منتقل شد (سمت مقابل عنوان؛
         RTL: چپ / LTR: راست) با ظاهر اکشن‌بار (SaveButton)؛ در تب‌های بی‌فیلد
         یا دادهٔ لودنشده غیرفعال است */}
      <div className="border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md">
              <SlidersHorizontal className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-bold">{t("settings.swConfig")}</h2>
              <p className="text-xs text-muted-foreground">{t("settings.swConfigDesc")}</p>
            </div>
          </div>
          <SaveButton
            onClick={save}
            disabled={fields.length === 0 || values[activeTab] === undefined}
          />
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

      {/* tab content — Task 156: بنتوگرید باکس‌ها در همهٔ تب‌ها (سبک تصویر
         مالک؛ پس‌زمینه روشن و تم‌پسند) */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim" dir="auto">
        <div className="mx-auto max-w-5xl p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeTab === "general" && (
              /* Task 73 — محتوای اعلام‌شدهٔ تب «عمومی»: زبان + زبان‌های فعال
                 (دو کارت بنتوی مستقل؛ تنظیمات سمت کلاینت با ماندگاری
                 erp.settings) */
              <LanguageSettingsSections />
            )}
            {bentoBoxes.map((box) => renderBentoBox(box))}
            {fields.length === 0 && activeTab !== "general" && (
              /* placeholder — فیلدهای این تب هنوز اعلام نشده‌اند (کارت بنتوی خط‌چین) */
              <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 sm:col-span-2 lg:col-span-4">
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                    <ListPlus className="h-7 w-7 text-muted-foreground" aria-hidden />
                  </span>
                  <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                    {t("settings.swConfigPending")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
