"use client";

import { Calculator, Database, type LucideIcon } from "lucide-react";
import { AppMenuHome, type AppMenuGroupDef } from "@/components/erp/shared/app-menu-home";

/**
 * AccountingMenuHome — Task 119 (درخواست مالک): «یک زیرمنو در منو حسابداری
 * ایجاد کنید بنام اطلاعات پایه».
 *
 * پنجرهٔ نرم‌افزار «حسابداری» (appKey "accounting") از حالت placeholder خارج
 * و به منوی اعلامیِ واقعی تبدیل شد — دقیقاً با همان موتور و همان ۴ حالت نمایش
 * پنجرهٔ عمومی (AppMenuHome — Task 117/119): کشویی/کنار‌هم/لیستی/کاشی + سوییچر
 * کنار منو + ماندگاری انتخاب کاربر (کلید مستقل accounting.menuView).
 *
 * زیرمنوی «اطلاعات پایه» فعلاً بدون فرم سیستمی است؛ فرم‌های حسابداری
 * (حساب‌ها، دفاتر، اسناد و …) به‌مرور اعلام می‌شوند — هر فرم جدید فقط یک مدخل
 * در ACCOUNTING_MENU_GROUPS + یک زیرصفحه در accounting-window است. همان
 * زیرمنو در درختوارهٔ فرمساز هم ثبت شده (SYSTEM_SUBMENUS — dfb seed، کد
 * "accBasicInfo") تا قرارداد Task 112 در هر دو منو برقرار بماند.
 */

/** یک فرم قابل بازکردن در زیرمنوی حسابداری (بعد از اعلام تحلیل فرم) */
interface AccountingItemDef {
  page: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  gradient: string;
}
export type { AccountingItemDef };

/** تک‌منبع دادهٔ منوی حسابداری — هر ۴ حالت نمایش از همین مدل رندر می‌شوند */
const ACCOUNTING_MENU_GROUPS: AppMenuGroupDef[] = [
  {
    id: "basicInfo",
    titleKey: "acc.menuBasicInfo",
    descKey: "acc.menuBasicInfoDesc",
    icon: Database,
    gradient: "from-violet-500 to-purple-600",
    items: [], // فرم‌های سیستمی حسابداری به‌مرور اعلام و به‌اینجا اضافه می‌شوند
  },
];

export function AccountingMenuHome() {
  return (
    <AppMenuHome
      appKey="accounting"
      titleKey="app.accounting"
      appIcon={Calculator}
      headerGradient="from-violet-500 to-violet-700"
      storageKey="accounting.menuView"
      groups={ACCOUNTING_MENU_GROUPS}
    />
  );
}
