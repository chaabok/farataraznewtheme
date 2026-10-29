"use client";

import { Briefcase, Building2, Calculator, Database, FolderPlus, Layers, ListOrdered, ListTree, Tags } from "lucide-react";
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
 *   · Task 120: «نوع تفصیل جدید» (بدنهٔ واقعی detail-type-form؛ بدون عنوان
 *     لاتین به فرمان مالک). فرم‌های بعدی (حساب‌ها، دفاتر، اسناد و …) فقط یک
 *     مدخل در همین آرایه + یک زیرصفحه در accounting-window می‌گیرند.
 *   · Task 131: «شماره گذاری تفصیلی ها» (بدنهٔ واقعی detail-type-numbering-form
 *     با کامپوننت MainDataGrid — بازهٔ خودکار هر تفصیل).
 *   · همان زیرمنو در درختوارهٔ فرمساز هم ثبت است (SYSTEM_SUBMENUS — dfb seed،
 *     کد "accBasicInfo"؛ SYSTEM_FORMS با anchorSubmenuCode همان) تا قرارداد
 *     Task 112 در هر دو منو برقرار بماند.
 *
 * زیرمنوی «اطلاعات تفصیلی ها» — Task 145 (درخواست مالک: «ایجاد تفصیلی ها
 * باید یک زیرمنو باشد چون دارای فرم های متعددی است و نباید یک فرم باشد؛
 * همانند اطلاعات پایه یک زیرمنو بنام اطلاعات تفصیلی ها ایجاد کنید و فرم های
 * آن به مرور تکمیل خواهد شد»):
 *   · Task 144: «ایجاد تفصیلی ها» — از زیرمنوی اطلاعات پایه به همین زیرمنو
 *     منتقل شد؛ فرم‌های بعدی تفصیلی نیز به‌مرور فقط یک مدخل در همین گروه
 *     + یک زیرصفحه در accounting-window می‌گیرند.
 *   · Task 146: «مرکز هزینه جدید» — با کد تفصیل لایو (متد اختصاصی تخصیص کد
 *     تفصیل) و Enum نوع مرکز هزینه.
 *   · Task 147: «تعریف پروژه» — کد سریالی لایو (پشت سرهم) + کد تفصیل لایو
 *     از نوع تفصیل «پروژه» (کد مرجع ۸).
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
        /* Task 120 — نخستین فرم سیستمیِ زیرمنوی اطلاعات پایهٔ حسابداری */
        page: "detail-type",
        titleKey: "dt.formTitle",
        descKey: "dt.formDesc",
        icon: Tags,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        /* Task 131 — شماره گذاری تفصیلی ها (MainDataGrid) */
        page: "detail-type-numbering",
        titleKey: "dtn.formTitle",
        descKey: "dtn.formDesc",
        icon: ListOrdered,
        gradient: "from-amber-500 to-orange-600",
      },
      {
        /* Task 140 — درختواره حسابها (SimpleTreeForm) */
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
        /* Task 144 — ایجاد تفصیلی ها (رکورد تفصیلی با کد خودکار از شماره‌گذاری) */
        page: "detail-items",
        titleKey: "di.formTitle",
        descKey: "di.formDesc",
        icon: FolderPlus,
        gradient: "from-rose-500 to-pink-600",
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
    ],
  },
];

export function AccountingMenuHome({
  go,
}: {
  go: (page: "detail-type" | "detail-type-numbering" | "detail-items" | "cost-center" | "project" | "account-tree") => void;
}) {
  return (
    <AppMenuHome
      appKey="accounting"
      titleKey="app.accounting"
      appIcon={Calculator}
      headerGradient="from-violet-500 to-violet-700"
      storageKey="accounting.menuView"
      groups={ACCOUNTING_MENU_GROUPS}
      go={(page) => go(page as "detail-type" | "detail-type-numbering" | "detail-items" | "cost-center" | "project" | "account-tree")}
    />
  );
}
