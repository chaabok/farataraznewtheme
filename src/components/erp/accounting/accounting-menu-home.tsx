"use client";

import { Briefcase, Boxes, Building2, Calculator, Database, FileSignature, FileText, FilePlus2, Layers, ListOrdered, ListTree, ScrollText, Tags } from "lucide-react";
import { AppMenuHome, type AppMenuGroupDef } from "@/components/erp/shared/app-menu-home";

/**
 * AccountingMenuHome — Task 119/120/131 (درخواست مالک): «یک زیرمنو در منو
 * حسابداری ایجاد کنید بنام اطلاعات پایه» + فرم‌های اعلامیِ زیر آن.
 *
 * پنجرهٔ نرم‌افزار «حسابداری» (appKey "accounting") از حالت placeholder خارج
 * و به منوی اعلامیِ واقعی تبدیل شد — دقیقاً با همان موتور و همان ۴ حالت نمایش
 * پنجرهٔ عمومی (AppMenuHome — Task 117/119): کشویی/کنار‌هم/لیستی/کاشی + سوییچر
 * کنار منو + ماندگاری انتخاب کاربر (کلید مستقل accounting.menuView).
 *
 * زیرمنوی «اطلاعات پایه» — فرم‌های اعلامی:
 *   · Task 140: «درختواره حسابها» (SimpleTreeForm) — تنها فرم این گروه پس از
 *     Task 174 (فرمان مالک: نوع تفصیل جدید و شماره گذاری تفصیلی ها به
 *     «اطلاعات تفصیلی ها» منتقل شدند). فرم‌های بعدی فقط یک مدخل در همین
 *     آرایه + یک زیرصفحه در accounting-window می‌گیرند.
 *   · همان زیرمنو در درختوارهٔ فرمساز هم ثبت است (SYSTEM_SUBMENUS — dfb seed،
 *     کد "accBasicInfo") تا قرارداد Task 112 در هر دو منو برقرار بماند.
 *
 * زیرمنوی «اطلاعات تفصیلی ها» — Task 145 (درخواست مالک: «ایجاد تفصیلی ها
 * باید یک زیرمنو باشد چون دارای فرم های متعددی است و نباید یک فرم باشد؛
 * همانند اطلاعات پایه یک زیرمنو بنام اطلاعات تفصیلی ها ایجاد کنید و فرم های
 * آن به مرور تکمیل خواهد شد»):
 *   · Task 174 (فرمان مالک): «نوع تفصیل جدید» (Task 120) و «شماره گذاری
 *     تفصیلی ها» (Task 131) از «اطلاعات پایه» به این زیرمنو منتقل شدند؛
 *     فرم عمومی «ایجاد تفصیلی ها» (Task 144) بطور کامل حذف شد — رکورد
 *     تفصیلی از فرم‌های تخصصی (مرکز هزینه/پروژه/قرارداد/سایر) ساخته می‌شود.
 *   · Task 146: «مرکز هزینه جدید» — با کد تفصیل لایو (متد اختصاصی تخصیص کد
 *     تفصیل) و Enum نوع مرکز هزینه.
 *   · Task 147: «تعریف پروژه» — کد سریالی لایو (پشت سرهم) + کد تفصیل لایو
 *     از نوع تفصیل «پروژه» (کد مرجع ۸).
 *   · Task 148: «قرارداد جدید» — کد تفصیلی لایو از نوع تفصیل «قرارداد»
 *     (کد مرجع ۹ — دقیقاً همانند پروژه) + دراپ‌داون ستون‌دار پروژه/طرف
 *     قرارداد با کاشی «+» فرم پایه.
 *   · Task 154: «تفصیلی سایر» — دقیقاً ۳ فیلد فرمان مالک (کد تفصیل و عنوان
 *     اجباری + فعال تیک پیش‌فرض) روی نوع ثابت «سایر» (تضمین سمت سرور).
 *
 * زیرمنوی «سند حسابداری» — Task 150 (درخواست مالک: «در منوی حسابداری یک
 * زیرمنو ایجاد کنید بنام سند حسابداری. این زیرمنو هست و فرم های آن به مرور
 * اضافه خواهند شد»):
 *   · هم‌تراز «اطلاعات پایه» و «اطلاعات تفصیلی ها».
 *   · Task 153: «نوع سند جدید» (بدنهٔ واقعی voucher-type-form) — نخستین فرم
 *     این زیرمنو؛ فرم‌های بعدی اسناد (ثبت سند، فهرست اسناد، دفاتر و …) به‌مرور
 *     فقط یک مدخل در همین گروه + یک زیرصفحه در accounting-window می‌گیرند.
 */

/** تک‌منبع دادهٔ منوی حسابداری — هر ۴ حالت نمایش از همین مدل رندر می‌شوند */
const ACCOUNTING_MENU_GROUPS: AppMenuGroupDef[] = [
  {
    id: "basicInfo",
    titleKey: "acc.menuBasicInfo",
    descKey: "acc.menuBasicInfoDesc",
    icon: Database,
    gradient: "from-violet-500 to-purple-600",
    items: [
      {
        /* Task 140 — درختواره حسابها (SimpleTreeForm) — تنها فرم این گروه پس از Task 174 */
        page: "account-tree",
        titleKey: "atr.formTitle",
        descKey: "atr.formDesc",
        icon: ListTree,
        gradient: "from-teal-500 to-cyan-600",
      },
    ],
  },
  {
    /* Task 145 — زیرمنوی «اطلاعات تفصیلی ها» — هم‌تراز «اطلاعات پایه»؛
       فرم‌های تفصیلی به‌مرور به همین گروه اعلان می‌شوند */
    id: "detailInfo",
    titleKey: "acc.menuDetailInfo",
    descKey: "acc.menuDetailInfoDesc",
    icon: Layers,
    gradient: "from-fuchsia-500 to-pink-600",
    items: [
      {
        /* Task 174 (فرمان مالک) — «نوع تفصیل جدید» (Task 120) از اطلاعات پایه به این زیرمنو منتقل شد */
        page: "detail-type",
        titleKey: "dt.formTitle",
        descKey: "dt.formDesc",
        icon: Tags,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        /* Task 174 (فرمان مالک) — «شماره گذاری تفصیلی ها» (Task 131) از اطلاعات پایه به این زیرمنو منتقل شد */
        page: "detail-type-numbering",
        titleKey: "dtn.formTitle",
        descKey: "dtn.formDesc",
        icon: ListOrdered,
        gradient: "from-amber-500 to-orange-600",
      },
      {
        /* Task 146 — مرکز هزینه جدید (کد تفصیل لایو از متد اختصاصی + Enum نوع) */
        page: "cost-center",
        titleKey: "cc.formTitle",
        descKey: "cc.formDesc",
        icon: Building2,
        gradient: "from-amber-500 to-rose-600",
      },
      {
        /* Task 147 — تعریف پروژه (کد سریالی لایو + کد تفصیل لایو از نوع «پروژه») */
        page: "project",
        titleKey: "pj.formTitle",
        descKey: "pj.formDesc",
        icon: Briefcase,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        /* Task 148 — قرارداد جدید (کد تفصیلی لایو از نوع «قرارداد» + دراپ‌داون ستون‌دار) */
        page: "contract",
        titleKey: "ct.formTitle",
        descKey: "ct.formDesc",
        icon: FileSignature,
        gradient: "from-orange-500 to-amber-600",
      },
      {
        /* Task 154 — تفصیلی سایر (۳ فیلد مالک: کد تفصیل/عنوان/فعال تیک پیش‌فرض) */
        page: "detail-other",
        titleKey: "do.formTitle",
        descKey: "do.formDesc",
        icon: Boxes,
        gradient: "from-purple-500 to-fuchsia-600",
      },
    ],
  },
  {
    /* Task 150/153 — زیرمنوی «سند حسابداری» — هم‌تراز «اطلاعات پایه» و
       «اطلاعات تفصیلی ها»؛ نخستین فرم: «نوع سند جدید» (Task 153) */
    id: "documents",
    titleKey: "acc.menuDocuments",
    descKey: "acc.menuDocumentsDesc",
    icon: FileText,
    gradient: "from-emerald-500 to-green-600",
    items: [
      {
        /* Task 153 — نوع سند جدید (۹ نوع پیش‌فرض مالک در بدو ورود) */
        page: "voucher-type",
        titleKey: "vt.formTitle",
        descKey: "vt.formDesc",
        icon: ScrollText,
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        /* Task 158 — سند حسابداری جدید (هدر/اقلام/فوتر — فرم صدور سند) */
        page: "voucher-new",
        titleKey: "vc.formTitle",
        descKey: "vc.formDesc",
        icon: FilePlus2,
        gradient: "from-green-500 to-emerald-600",
      },
    ],
  },
];

export function AccountingMenuHome({
  go,
}: {
  go: (page: "detail-type" | "detail-type-numbering" | "cost-center" | "project" | "contract" | "account-tree" | "voucher-type" | "voucher-new" | "detail-other") => void;
}) {
  return (
    <AppMenuHome
      appKey="accounting"
      titleKey="app.accounting"
      appIcon={Calculator}
      headerGradient="from-violet-500 to-violet-700"
      storageKey="accounting.menuView"
      groups={ACCOUNTING_MENU_GROUPS}
      go={(page) => go(page as "detail-type" | "detail-type-numbering" | "cost-center" | "project" | "contract" | "account-tree" | "voucher-type" | "voucher-new" | "detail-other")}
    />
  );
}
