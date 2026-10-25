"use client";

import * as React from "react";
import { UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { displayToStoredDate, storedToDisplayDate } from "@/lib/calendar-date";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";
import { normalizeDigits } from "@/components/forms/form-primitives";
import {
  DataTranslationsDialog,
  type DataTranslationField,
} from "@/components/forms/common/data-translations-dialog";
import { LOCALES } from "@/i18n/config";

/**
 * PartyForm — Task 84 (درخواست مالک): فرم «تعریف طرف حساب» در نرم‌افزار
 * «عمومی» ← زیرمنوی «اطلاعات پایه»، با کامپوننت SimpleFormTwoRowTabbed.
 * محل فایل = عین مسیر اعلامی مالک: components/forms/common/Party.tsx —
 * از دو بخش تشکیل شده است: فیلدهای اصلی فرم + ۵ تب پایین.
 *
 * فیلدهای اصلی (دوستونه RTL — عین عبارت مالک):
 *   ۱. ماهیت — لیست (شخص حقیقی / شخص حقوقی)، اجباری، پیش‌فرض حقیقی.
 *   ۲. نوع فرعی — لیست هفت‌گزینه؛ فقط برای شخص حقوقی فعال.
 *   ۳. نام — اجباری.
 *   حقیقی: ۴. نام خانوادگی (اجباری)، ۵. نام (2) (لاتین)، ۶. نام خانوادگی (2) (لاتین).
 *   حقوقی: ۴. نام لاتین.
 *   ۷. کد تفصیلی — اجباری، «به‌صورت خودکار از شماره‌گذاری پر می‌شود»
 *      (حقیقی ← نوع تفصیلی ۶، حقوقی ← نوع تفصیلی ۷ — چیپ پایانِ فیلد)؛
 *      فقط-نمایش: شمارهٔ بعدی هنگام ورود نشان داده و سرور سریال قطعی را می‌دهد.
 *   ۸. کد اقتصادی — اختیاری.
 *   ۹. حقیقی: کد ملی؛ حقوقی: شناسه ملی + شماره ثبت — اختیاری.
 *   ۱۰. فعال — چک‌باکس، پیش‌فرض تیک (آخرین فیلد).
 * تغییر ماهیت، فیلدهای مخصوص حالت دیگر را خودکار پاک می‌کند.
 *
 * تب‌های پایین (به ترتیب از راست):
 *   · جزئیات — سه ردیف (تیک ← مبلغ مانده ← وضعیت بدهکار/بستانکار) برای
 *     تامین کننده / مشتری / واسط فروش؛ تا تیک نخورد مبلغ غیرفعال؛
 *     مبلغ ماندهٔ غیر صفر ⇔ انتخاب وضعیت همان نقش الزامی (دولایه).
 *   · افراد مرتبط — جدول نام/نام خانوادگی/نسبت/کد ملی/تلفن/توضیحات؛
 *     با افزودن ردیف، نام و نام خانوادگی الزامی می‌شود.
 *   · نشانی — جدول نوع آدرس (۸ نوع، الزامی) / شهر (متصل به جدول شهرها:
 *     کد/عنوان/عنوان لاتین/استان/کشور، الزامی) / آدرس کامل (الزامی) /
 *     کد پستی / طول و عرض جغرافیایی.
 *   · تلفن — جدول نوع تلفن (۷ نوع) / شماره / داخلی / توضیحات.
 *   · سایر اطلاعات — گذرنامه (فقط حقیقی) / وبسایت / ایمیل /
 *     تاریخ ازدواج و تولد (فقط حقیقی) — تاریخ‌ها میلادی ذخیره (Task 77)
 *     و در تقویم زبان انتخابی نمایش داده می‌شوند.
 *
 * قراردادهای پنجره: dirty هشت‌سطحی (Task 82)، رخ‌داد erp:records-changed،
 * عنوان زندهٔ برگه («عمومی — طرف حساب جدید»)، remount تب‌ها با formKey.
 */

type Nature = "natural" | "legal";
type Side = "" | "debtor" | "creditor";

interface RoleState {
  checked: boolean;
  balance: string;
  side: Side;
}

interface OtherState {
  passportNo: string;
  website: string;
  email: string;
  marriageDate: string; // نمایش در تقویم زبان
  birthDate: string;
}

interface FormValues {
  nature: Nature;
  subtype: string;
  name: string;
  lastName: string;
  latinName2: string;
  latinLastName2: string;
  latinName: string;
  tafsiliCode: string; // فقط-نمایش
  economicCode: string;
  nationalId: string;
  legalIdentity: string;
  registrationNo: string;
  active: boolean;
}

interface PartyDto {
  id: number;
  nature: Nature;
  tafsiliType: number;
  subtype: string;
  name: string;
  lastName: string;
  latinName2: string;
  latinLastName2: string;
  latinName: string;
  tafsiliCode: number;
  economicCode: string;
  nationalId: string;
  legalIdentity: string;
  registrationNo: string;
  isActive: boolean;
  details: {
    isSupplier: boolean;
    supplierBalance: number | null;
    supplierSide: string;
    isCustomer: boolean;
    customerBalance: number | null;
    customerSide: string;
    isSalesAgent: boolean;
    salesAgentBalance: number | null;
    salesAgentSide: string;
  };
  other: {
    passportNo: string;
    website: string;
    email: string;
    marriageDate: string;
    birthDate: string;
  };
  persons: { firstName: string; lastName: string; relation: string; nationalId: string; phone: string; notes: string }[];
  addresses: { addrType: string; cityRef: number | null; cityTitle: string; fullAddress: string; postalCode: string; longitude: number | null; latitude: number | null }[];
  phones: { phoneType: string; number: string; extension: string; notes: string }[];
}

interface CityDto {
  id: number;
  code: string;
  title: string;
  titleLatin: string;
  provinceName: string;
  countryName: string;
}

const BLANK_VALUES: FormValues = {
  nature: "natural",
  subtype: "",
  name: "",
  lastName: "",
  latinName2: "",
  latinLastName2: "",
  latinName: "",
  tafsiliCode: "",
  economicCode: "",
  nationalId: "",
  legalIdentity: "",
  registrationNo: "",
  active: true,
};

const BLANK_OTHER: OtherState = { passportNo: "", website: "", email: "", marriageDate: "", birthDate: "" };
const BLANK_ROLE: RoleState = { checked: false, balance: "", side: "" };

const TAB_PEOPLE = "people";
const TAB_ADDRESS = "address";
const TAB_PHONE = "phone";
const GRID_TABS = [TAB_PEOPLE, TAB_ADDRESS, TAB_PHONE] as const;

type Row = Record<string, string>;

const n2 = (v: number | null | undefined): string => (v == null ? "" : String(v));

export function PartyForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const activeLocales = useSettings((s) => s.activeLocales);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "app" && w.appKey === "general")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<PartyDto[]>([]);
  const [cities, setCities] = React.useState<CityDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK_VALUES);
  const [details, setDetails] = React.useState<Record<"supplier" | "customer" | "salesAgent", RoleState>>({
    supplier: { ...BLANK_ROLE },
    customer: { ...BLANK_ROLE },
    salesAgent: { ...BLANK_ROLE },
  });
  const [other, setOther] = React.useState<OtherState>({ ...BLANK_OTHER });
  const [rows, setRows] = React.useState<Record<string, Row[]>>({});
  /* Task 82 — unsaved-data flag of the tab */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);
  /* remount the shell so its internal grid rows re-seed on record change */
  const [formKey, setFormKey] = React.useState(0);
  const [nextTafsili, setNextTafsili] = React.useState<number | null>(null);

  /* -------- Task 93 (گزارش مالک: «اطلاعات داخل اینپوت ترجمه گردد») --------
     نمایشِ ترجمهٔ داده در فیلدهای اصلی — هم‌قرارداد Task 70 فرم‌ساز:
     در زبان غیر-fa، اگر رکورد ذخیره‌شده باز باشد و فیلد هنوز فوکوس/ویرایش
     نشده باشد، ترجمهٔ زبان فعلی از انبار DataTranslation به‌جای مقدار پایه
     در اینپوت دیده می‌شود؛ فوکوس = نمایان‌شدن مقدار پایه، ویرایش = مقدار واقعی. */
  const [trMap, setTrMap] = React.useState<Record<string, Record<string, string>>>({});
  const [revealed, setRevealed] = React.useState<ReadonlySet<string>>(new Set());
  /** Task 93 — عکس رکورد باز (برای تشخیص ویرایش زیر overlay) — state است چون در رندر خوانده می‌شود */
  const [baseValues, setBaseValues] = React.useState<FormValues>(BLANK_VALUES);

  /* Task 93 — نقشهٔ ترجمهٔ رکورد باز (همهٔ زبان‌ها) از انبار DataTranslation */
  const loadTr = React.useCallback(async (id: number): Promise<void> => {
    try {
      const res = await api.get<{
        items?: Array<{ fieldKey: string; locale: string; value: string }>;
      }>(`data-translations?entityType=Party&entityId=${id}`);
      const next: Record<string, Record<string, string>> = {};
      for (const it of res.items ?? []) {
        if (!it?.fieldKey || !it?.locale || !it?.value) continue;
        (next[it.fieldKey] ??= {})[it.locale] = it.value;
      }
      setTrMap(next);
    } catch {
      /* واکشی ناموفق — نقشهٔ پیشین می‌ماند و مقادیر پایه دیده می‌شوند */
    }
  }, []);

  /* Task 93 — فوکوس روی فیلد = نمایان‌شدن مقدار پایه زیر overlay (عین Task 70) */
  const revealField = React.useCallback((key: string) => {
    setRevealed((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const fetchRecords = React.useCallback(async (): Promise<PartyDto[]> => {
    const res = await api.get<{ items?: PartyDto[] }>("party");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rs: PartyDto[]) => {
    setRecords(rs);
    setListLoading(false);
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rs) => alive && applyRecords(rs),
      () => alive && applyRecords([]),
    );
    api
      .get<{ items?: CityDto[] }>("party/cities")
      .then((res) => {
        if (alive) setCities(res.items ?? []);
      })
      .catch(() => {
        /* شهرها ناپیدا — دراپ‌داون خالی می‌ماند */
      });
    api
      .get<{ nextTafsili?: number }>("party/next-tafsili")
      .then((res) => {
        if (alive) setNextTafsili(res.nextTafsili ?? null);
      })
      .catch(() => {
        /* شماره‌گذاری در سرور انجام می‌شود */
      });
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  /* شمارهٔ بعدی تفصیلی پس از هر تغییر فهرست تازه می‌شود */
  React.useEffect(() => {
    if (currentId != null) return;
    api
      .get<{ nextTafsili?: number }>("party/next-tafsili")
      .then((res) => setNextTafsili(res.nextTafsili ?? null))
      .catch(() => {});
  }, [records, currentId]);

  const isLegal = values.nature === "legal";

  const touch = React.useCallback(() => setDirty(true), []);

  const applyRecord = React.useCallback(
    (r: PartyDto) => {
      setCurrentId(r.id);
      setDirty(false);
      const nextValues: FormValues = {
        nature: r.nature,
        subtype: r.subtype,
        name: r.name,
        lastName: r.lastName,
        latinName2: r.latinName2,
        latinLastName2: r.latinLastName2,
        latinName: r.latinName,
        tafsiliCode: String(r.tafsiliCode),
        economicCode: r.economicCode,
        nationalId: r.nationalId,
        legalIdentity: r.legalIdentity,
        registrationNo: r.registrationNo,
        active: r.isActive,
      };
      setBaseValues(nextValues); // Task 93 — پایهٔ مقایسهٔ overlay
      setValues(nextValues);
      setRevealed(new Set()); // Task 93 — overlay از نو
      setTrMap({}); // Task 93 — نقشهٔ رکورد قبلی اعتبار ندارد
      void loadTr(r.id); // Task 93 — نقشهٔ ترجمهٔ رکورد تازه
      setDetails({
        supplier: {
          checked: r.details.isSupplier,
          balance: n2(r.details.supplierBalance),
          side: (r.details.supplierSide || "") as Side,
        },
        customer: {
          checked: r.details.isCustomer,
          balance: n2(r.details.customerBalance),
          side: (r.details.customerSide || "") as Side,
        },
        salesAgent: {
          checked: r.details.isSalesAgent,
          balance: n2(r.details.salesAgentBalance),
          side: (r.details.salesAgentSide || "") as Side,
        },
      });
      setOther({
        passportNo: r.other.passportNo,
        website: r.other.website,
        email: r.other.email,
        marriageDate: storedToDisplayDate(r.other.marriageDate, locale),
        birthDate: storedToDisplayDate(r.other.birthDate, locale),
      });
      setRows({
        [TAB_PEOPLE]: r.persons.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          relation: p.relation,
          nationalId: p.nationalId,
          phone: p.phone,
          notes: p.notes,
        })),
        [TAB_ADDRESS]: r.addresses.map((a) => ({
          addrType: a.addrType,
          city: a.cityRef == null ? "" : String(a.cityRef),
          fullAddress: a.fullAddress,
          postalCode: a.postalCode,
          longitude: n2(a.longitude),
          latitude: n2(a.latitude),
        })),
        [TAB_PHONE]: r.phones.map((p) => ({
          phoneType: p.phoneType,
          number: p.number,
          extension: p.extension,
          notes: p.notes,
        })),
      });
      setFormKey((k) => k + 1); // remount — ردیف‌های داخلی دوباره seed شوند
    },
    [locale, loadTr],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false);
    setBaseValues(BLANK_VALUES); // Task 93 — overlay خاموش
    setValues(BLANK_VALUES);
    setRevealed(new Set()); // Task 93
    setTrMap({}); // Task 93
    setDetails({ supplier: { ...BLANK_ROLE }, customer: { ...BLANK_ROLE }, salesAgent: { ...BLANK_ROLE } });
    setOther({ ...BLANK_OTHER });
    setRows(Object.fromEntries(GRID_TABS.map((k) => [k, []])));
    setFormKey((k) => k + 1);
  }, []);

  /* ---------------------------- field wiring ---------------------------- */

  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      touch();
      /* فیلدهای تب جزئیات */
      if (id.startsWith("d_")) {
        const [, role, prop] = id.split("_"); // d_supplier_checked ...
        const key = role as "supplier" | "customer" | "salesAgent";
        setDetails((prev) => {
          const cur = { ...prev[key] };
          if (prop === "checked") {
            const on = value === true;
            return { ...prev, [key]: on ? { ...cur, checked: true } : { ...BLANK_ROLE } };
          }
          if (prop === "balance") {
            const raw = normalizeDigits(String(value)).replace(/[^0-9.\-]/g, "");
            return { ...prev, [key]: { ...cur, balance: raw } };
          }
          return { ...prev, [key]: { ...cur, side: String(value) as Side } };
        });
        return;
      }
      /* فیلدهای تب سایر اطلاعات */
      if (id.startsWith("o_")) {
        const prop = id.slice(2) as keyof OtherState;
        setOther((prev) => ({ ...prev, [prop]: String(value) }));
        return;
      }
      /* فیلدهای اصلی */
      if (id === "nature") {
        const nature = String(value) as Nature;
        setValues((v) => ({
          ...v,
          nature,
          /* تغییر ماهیت ⇔ پاک‌شدن فیلدهای حالت دیگر (عین عبارت مالک) */
          subtype: nature === "legal" ? v.subtype : "",
          latinName2: nature === "legal" ? "" : v.latinName2,
          latinLastName2: nature === "legal" ? "" : v.latinLastName2,
          latinName: nature === "legal" ? v.latinName : "",
          nationalId: nature === "legal" ? "" : v.nationalId,
          legalIdentity: nature === "legal" ? v.legalIdentity : "",
          registrationNo: nature === "legal" ? v.registrationNo : "",
        }));
        setOther((o) =>
          nature === "legal"
            ? { ...o, passportNo: "", marriageDate: "", birthDate: "" }
            : o,
        );
        return;
      }
      setValues((v) => ({ ...v, [id]: value }));
    },
    [touch],
  );

  const onTabRowsChange = React.useCallback(
    (tabId: string, next: Row[]) => {
      touch();
      setRows((prev) => ({ ...prev, [tabId]: next }));
    },
    [touch],
  );

  /* ------------------------------ validation ----------------------------- */

  const validate = (): string | null => {
    if (values.name.trim() === "") return t("party.errNameRequired");
    if (!isLegal && values.lastName.trim() === "") return t("party.errLastNameRequired");
    /* مبلغ ماندهٔ غیر صفر ⇔ وضعیت همان نقش اجباری */
    for (const [role, labelKey] of [
      ["supplier", "party.supplier"],
      ["customer", "party.customer"],
      ["salesAgent", "party.salesAgent"],
    ] as const) {
      const r = details[role];
      if (!r.checked) continue;
      const b = Number(normalizeDigits(r.balance));
      if (Number.isFinite(b) && b !== 0 && r.side === "") {
        return t("party.errStatusRequired").replace("{role}", t(labelKey));
      }
    }
    /* ردیف‌های جدولی */
    const peopleRows = rows[TAB_PEOPLE] ?? [];
    for (let i = 0; i < peopleRows.length; i++) {
      if (peopleRows[i].firstName.trim() === "" || peopleRows[i].lastName.trim() === "") {
        return t("party.errRowRequired").replace("{tab}", t("party.tabPeople")).replace("{n}", String(i + 1));
      }
    }
    const addrRows = rows[TAB_ADDRESS] ?? [];
    for (let i = 0; i < addrRows.length; i++) {
      const a = addrRows[i];
      if (a.addrType === "" || a.city === "" || a.fullAddress.trim() === "") {
        return t("party.errRowRequired").replace("{tab}", t("party.tabAddress")).replace("{n}", String(i + 1));
      }
    }
    return null;
  };

  /* -------------------------------- save --------------------------------- */

  const buildBody = () => {
    const num = (s: string): number | null => {
      const v = Number(normalizeDigits(s));
      return s.trim() === "" || !Number.isFinite(v) ? null : v;
    };
    const role = (r: RoleState) =>
      r.checked
        ? { checked: true, balance: num(r.balance), side: r.side === "" ? null : r.side }
        : { checked: false, balance: null, side: null };
    const sup = role(details.supplier);
    const cus = role(details.customer);
    const ag = role(details.salesAgent);
    return {
      nature: values.nature,
      subtype: isLegal && values.subtype !== "" ? values.subtype : null,
      name: values.name.trim(),
      lastName: isLegal ? null : values.lastName.trim(),
      latinName2: isLegal ? null : values.latinName2.trim(),
      latinLastName2: isLegal ? null : values.latinLastName2.trim(),
      latinName: isLegal ? values.latinName.trim() : null,
      economicCode: values.economicCode.trim() === "" ? null : values.economicCode.trim(),
      nationalId: isLegal ? null : values.nationalId.trim(),
      legalIdentity: isLegal ? values.legalIdentity.trim() : null,
      registrationNo: isLegal ? values.registrationNo.trim() : null,
      isActive: values.active,
      details: {
        isSupplier: sup.checked,
        supplierBalance: sup.balance,
        supplierSide: sup.side,
        isCustomer: cus.checked,
        customerBalance: cus.balance,
        customerSide: cus.side,
        isSalesAgent: ag.checked,
        salesAgentBalance: ag.balance,
        salesAgentSide: ag.side,
      },
      other: {
        passportNo: isLegal ? null : other.passportNo.trim(),
        website: other.website.trim() === "" ? null : other.website.trim(),
        email: other.email.trim() === "" ? null : other.email.trim(),
        marriageDate: isLegal ? null : displayToStoredDate(other.marriageDate, locale, normalizeDigits),
        birthDate: isLegal ? null : displayToStoredDate(other.birthDate, locale, normalizeDigits),
      },
      persons: (rows[TAB_PEOPLE] ?? []).map((p) => ({
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
        relation: p.relation.trim() || null,
        nationalId: p.nationalId.trim() || null,
        phone: p.phone.trim() || null,
        notes: p.notes.trim() || null,
      })),
      addresses: (rows[TAB_ADDRESS] ?? []).map((a) => ({
        addrType: a.addrType,
        cityRef: a.city === "" ? null : Number(a.city),
        fullAddress: a.fullAddress.trim(),
        postalCode: a.postalCode.trim() || null,
        longitude: a.longitude.trim() === "" ? null : Number(normalizeDigits(a.longitude)),
        latitude: a.latitude.trim() === "" ? null : Number(normalizeDigits(a.latitude)),
      })),
      phones: (rows[TAB_PHONE] ?? []).map((p) => ({
        phoneType: p.phoneType || "other",
        number: p.number.trim() || null,
        extension: p.extension.trim() || null,
        notes: p.notes.trim() || null,
      })),
    };
  };

  const doSave = async (): Promise<boolean> => {
    const err = validate();
    if (err) {
      toast.error(err);
      return false;
    }
    try {
      const body = buildBody();
      const res =
        currentId == null
          ? await api.post<PartyDto>("party", body)
          : await api.put<PartyDto>(`party/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rs = await fetchRecords().catch(() => [] as PartyDto[]);
      applyRecords(rs);
      applyRecord(res);
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "party" } }),
      );
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
      await api.del(`party/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rs = await fetchRecords().catch(() => [] as PartyDto[]);
      applyRecords(rs);
      newRecord();
      window.dispatchEvent(
        new CustomEvent("erp:records-changed", { detail: { entity: "party" } }),
      );
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ناوبری رکوردها */
  const currentIndex = records.findIndex((r) => r.id === currentId);
  const nav = (i: number) => {
    const r = records[i];
    if (r) applyRecord(r);
  };

  /* -------- Task 92 (تأیید مالک) — ترجمهٔ دادهٔ رکورد باز --------
     فیلدهای متنیِ معنادارِ رکورد (نام/نام خانوادگی، نشانی‌ها، افراد مرتبط) —
     کلیدهای پایدار برای انبار DataTranslation (مسیر ردیف جدولی مجاز است). */
  const translatableFields = React.useCallback((): DataTranslationField[] => {
    const out: DataTranslationField[] = [];
    const push = (key: string, label: string, value: string) => {
      const v = value.trim();
      if (v) out.push({ key, label, value: v });
    };
    push("name", t("party.name"), values.name);
    if (!isLegal) push("lastName", t("party.lastName"), values.lastName);
    (rows[TAB_ADDRESS] ?? []).forEach((a, i) => {
      push(`address.${i}.fullAddress`, `${t("party.fullAddress")} ${i + 1}`, a.fullAddress);
    });
    (rows[TAB_PEOPLE] ?? []).forEach((p, i) => {
      push(`persons.${i}.firstName`, `${t("party.name")} ${i + 1}`, p.firstName);
      push(`persons.${i}.lastName`, `${t("party.lastName")} ${i + 1}`, p.lastName);
      push(`persons.${i}.notes`, `${t("common.description")} ${i + 1}`, p.notes);
    });
    return out;
  }, [t, values, rows, isLegal]);

  const translateOnline = React.useCallback(async () => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    const fields = translatableFields();
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
        body: JSON.stringify({ entityType: "Party", entityId: currentId, langs, fields }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || t("common.error"));
      }
      /* Task 93 — نقشهٔ تازه + ریست reveal تا فیلدهای اصلی همان لحظه
         ترجمه را نشان دهند (بدون بستن/بازکردن رکورد) */
      setRevealed(new Set());
      await loadTr(currentId);
      toast.success(t("dfb.list.translateDone"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    }
  }, [currentId, activeLocales, translatableFields, t, loadTr]);

  const [offlineOpen, setOfflineOpen] = React.useState(false);
  const openTranslateOffline = React.useCallback(() => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    setOfflineOpen(true);
  }, [currentId, t]);

  /* ------------------------------ rendering ------------------------------ */

  const natureOptions = [
    { value: "natural", label: t("party.natureNatural") },
    { value: "legal", label: t("party.natureLegal") },
  ];
  const subtypeOptions = [
    { value: "other", label: t("party.subtypeOther") },
    { value: "ministry", label: t("party.subtypeMinistry") },
    { value: "govAgency", label: t("party.subtypeGovAgency") },
    { value: "govCompany", label: t("party.subtypeGovCompany") },
    { value: "govOther", label: t("party.subtypeGovOther") },
    { value: "publicNonGov", label: t("party.subtypePublic") },
    { value: "private", label: t("party.subtypePrivate") },
  ];

  /* Task 93 — مقدار overlay فیلدهای اصلی: ترجمهٔ زبان فعلی فقط وقتی که
     رکورد باز است، زبان ≠ fa، فیلد فوکوس/ویرایش نشده و ترجمه موجود است
     (زنجیرهٔ جایگزینی: بدون ترجمه = مقدار اصلی — عین Task 70) */
  const mainOverlay = (key: "name" | "lastName"): string | undefined => {
    if (locale === "fa" || currentId == null) return undefined;
    if (revealed.has(key)) return undefined; // فوکوس ⇒ مقدار پایه
    if (values[key] !== baseValues[key]) return undefined; // ویرایش‌شده ⇒ مقدار واقعی
    const tr = trMap[key]?.[locale];
    return tr && tr.trim() ? tr : undefined;
  };

  const fields = React.useMemo<SimpleFormField[]>(() => {
    const base: SimpleFormField[] = [
      { id: "nature", label: t("party.nature"), type: "select", required: true, options: natureOptions, value: values.nature },
      {
        id: "subtype",
        label: t("party.subtype"),
        type: "select",
        options: subtypeOptions,
        value: values.subtype,
        disabled: !isLegal,
      },
      {
        id: "name",
        label: t("party.name"),
        required: true,
        value: mainOverlay("name") ?? values.name,
        onRevealFocus: () => revealField("name"), // Task 93
      },
    ];
    if (isLegal) {
      base.push({ id: "latinName", label: t("party.latinName"), ltr: true, value: values.latinName });
    } else {
      base.push(
        {
          id: "lastName",
          label: t("party.lastName"),
          required: true,
          value: mainOverlay("lastName") ?? values.lastName,
          onRevealFocus: () => revealField("lastName"), // Task 93
        },
        { id: "latinName2", label: t("party.nameLatin"), ltr: true, value: values.latinName2 },
        { id: "latinLastName2", label: t("party.lastNameLatin"), ltr: true, value: values.latinLastName2 },
      );
    }
    base.push(
      {
        id: "tafsiliCode",
        label: t("party.tafsiliCode"),
        required: true,
        value: currentId == null && values.tafsiliCode === "" && nextTafsili != null
          ? String(nextTafsili)
          : values.tafsiliCode,
        readOnly: true,
        suffixChip: t(isLegal ? "party.tafsiliType7" : "party.tafsiliType6"),
        placeholder: t("party.tafsiliAuto"),
      },
      { id: "economicCode", label: t("party.economicCode"), value: values.economicCode },
    );
    if (isLegal) {
      base.push(
        { id: "legalIdentity", label: t("party.legalIdentity"), value: values.legalIdentity },
        { id: "registrationNo", label: t("party.registrationNo"), value: values.registrationNo },
      );
    } else {
      base.push({ id: "nationalId", label: t("party.nationalId"), value: values.nationalId });
    }
    base.push({ id: "active", label: t("fy.active"), type: "checkbox", checked: values.active });
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, values, isLegal, currentId, nextTafsili, locale, trMap, revealed, baseValues, revealField]);

  const roleFields = (role: "supplier" | "customer" | "salesAgent", label: string): SimpleFormField[] => {
    const r = details[role];
    return [
      { id: `d_${role}_checked`, label, type: "checkbox", checked: r.checked },
      {
        id: `d_${role}_balance`,
        label: t("party.balanceAmount"),
        type: "number",
        value: r.balance,
        disabled: !r.checked,
        ltr: true,
      },
      {
        id: `d_${role}_side`,
        label: t("party.balanceStatus"),
        type: "radio",
        value: r.side,
        disabled: !r.checked,
        options: [
          { value: "debtor", label: t("party.debtor") },
          { value: "creditor", label: t("party.creditor") },
        ],
      },
    ];
  };

  const cityOptions = React.useMemo(
    () =>
      cities.map((c) => ({
        value: String(c.id),
        /* دراپ‌داون چندستونه: کد / عنوان / استان / کشور در یک گزینه */
        label: `${c.code} - ${c.title} (${c.provinceName} — ${c.countryName})`,
      })),
    [cities],
  );

  const tabs = React.useMemo<SimpleFormTab[]>(() => {
    const addrTypeOptions = [
      { value: "official", label: t("party.addrOfficial") },
      { value: "workplace", label: t("party.addrWorkplace") },
      { value: "invoice", label: t("party.addrInvoice") },
      { value: "goods", label: t("party.addrGoods") },
      { value: "warehouse", label: t("party.addrWarehouse") },
      { value: "home", label: t("party.addrHome") },
      { value: "postal", label: t("party.addrPostal") },
      { value: "other", label: t("party.addrOther") },
    ];
    const phoneTypeOptions = [
      { value: "office", label: t("party.phoneOffice") },
      { value: "mobile", label: t("party.phoneMobile") },
      { value: "home", label: t("party.phoneHome") },
      { value: "other", label: t("party.phoneOther") },
      { value: "faxOffice", label: t("party.faxOffice") },
      { value: "faxHome", label: t("party.faxHome") },
      { value: "faxOther", label: t("party.faxOther") },
    ];
    return [
      {
        id: "details",
        label: t("party.tabDetails"),
        kind: "fields",
        columns: [],
        fields: [
          ...roleFields("supplier", t("party.supplier")),
          ...roleFields("customer", t("party.customer")),
          ...roleFields("salesAgent", t("party.salesAgent")),
        ],
      },
      {
        id: TAB_PEOPLE,
        label: t("party.tabPeople"),
        columns: [
          { id: "firstName", label: t("party.name"), required: true, minWidth: "min-w-28" },
          { id: "lastName", label: t("party.lastName"), required: true, minWidth: "min-w-28" },
          { id: "relation", label: t("party.relation"), minWidth: "min-w-24" },
          { id: "nationalId", label: t("party.nationalId"), minWidth: "min-w-28" },
          { id: "phone", label: t("party.phoneNo"), minWidth: "min-w-32" },
          { id: "notes", label: t("common.description"), minWidth: "min-w-40" },
        ],
        rows: rows[TAB_PEOPLE] ?? [],
      },
      {
        id: TAB_ADDRESS,
        label: t("party.tabAddress"),
        columns: [
          { id: "addrType", label: t("party.addrType"), required: true, type: "select", options: addrTypeOptions, minWidth: "min-w-32" },
          { id: "city", label: t("party.city"), required: true, type: "select", options: cityOptions, minWidth: "min-w-48" },
          { id: "fullAddress", label: t("party.fullAddress"), required: true, minWidth: "min-w-56" },
          { id: "postalCode", label: t("party.postalCode"), minWidth: "min-w-28" },
          { id: "longitude", label: t("party.longitude"), type: "number", minWidth: "min-w-28" },
          { id: "latitude", label: t("party.latitude"), type: "number", minWidth: "min-w-28" },
        ],
        rows: rows[TAB_ADDRESS] ?? [],
      },
      {
        id: TAB_PHONE,
        label: t("party.tabPhone"),
        columns: [
          { id: "phoneType", label: t("party.phoneType"), type: "select", options: phoneTypeOptions, minWidth: "min-w-36" },
          { id: "number", label: t("party.phoneNo"), minWidth: "min-w-32" },
          { id: "extension", label: t("party.extension"), minWidth: "min-w-20" },
          { id: "notes", label: t("common.description"), minWidth: "min-w-40" },
        ],
        rows: rows[TAB_PHONE] ?? [],
      },
      {
        id: "other",
        label: t("party.tabOther"),
        kind: "fields",
        columns: [],
        fields: [
          { id: "o_passportNo", label: t("party.passportNo"), value: other.passportNo, disabled: isLegal },
          { id: "o_website", label: t("party.website"), ltr: true, value: other.website },
          { id: "o_email", label: t("party.email"), ltr: true, value: other.email },
          { id: "o_marriageDate", label: t("party.marriageDate"), type: "date", value: other.marriageDate, disabled: isLegal },
          { id: "o_birthDate", label: t("party.birthDate"), type: "date", value: other.birthDate, disabled: isLegal },
        ],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, rows, cities, other, details, isLegal, locale]);

  return (
    <>
    <SimpleFormTwoRowTabbed
      key={formKey}
      title={t("party.formTitle")}
      badge={t("app.general")}
      icon={<UserRoundPlus className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      tabs={tabs}
      onTabRowsChange={onTabRowsChange}
      hint={t("party.formHint")}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
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
        /* ثبت جدید با همان مقادیر — شناسه/کد تفصیلی پاک می‌شود تا رکورد نو ساخته شود */
        setCurrentId(null);
        setValues((v) => ({ ...v, tafsiliCode: "" }));
        setDirty(true);
        toast.success(t("abar.copyToast"));
      }}
      onDelete={doDelete}
      onTranslateOnline={translateOnline}
      onTranslateOffline={openTranslateOffline}
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
        title: `${r.tafsiliCode} - ${r.name}${r.lastName ? " " + r.lastName : ""}`,
        subtitle:
          [
            r.nature === "legal" ? t("party.natureLegal") : t("party.natureNatural"),
            r.isActive ? "" : t("party.inactive"),
          ]
            .filter(Boolean)
            .join(" — ") || undefined,
        /* Task 86 — مینی‌گرید دراپ‌داون لیست: کد تفصیلی / نام / ماهیت / فعال */
        cells: [
          { label: t("party.tafsiliCode"), value: String(r.tafsiliCode ?? "") },
          { label: t("party.name"), value: `${r.name}${r.lastName ? " " + r.lastName : ""}` },
          {
            label: t("party.nature"),
            value: r.nature === "legal" ? t("party.natureLegal") : t("party.natureNatural"),
          },
          { label: t("fy.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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
    {/* Task 92/93 — ورود دستی (آفلاین) ترجمهٔ دادهٔ رکورد باز؛ پس از بستنِ
        دیالوگ نقشهٔ overlay تازه می‌شود تا ترجمه‌های ذخیره‌شده همان لحظه
        در فیلدها دیده شوند */}
    <DataTranslationsDialog
      open={offlineOpen}
      onOpenChange={(v) => {
        setOfflineOpen(v);
        if (!v && currentId != null) void loadTr(currentId);
      }}
      entityType="Party"
      entityId={currentId}
      fields={translatableFields()}
    />
    </>
  );
}
