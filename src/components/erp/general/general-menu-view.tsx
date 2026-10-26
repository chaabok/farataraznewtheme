"use client";

import {
  ArrowLeftRight,
  Boxes,
  CalendarPlus,
  Coins,
  Earth,
  FolderOpen,
  UserRoundPlus,
  Workflow,
} from "lucide-react";
import { AppMenuHome, type AppMenuGroupDef } from "@/components/erp/shared/app-menu-home";
import type { GeneralSubPage } from "@/stores/general-nav-store";

/**
 * GeneralMenuHome — بدنهٔ «home» پنجرهٔ عمومی.
 *
 * Task 117 (درخواست مالک): ۴ حالت نمایش زیرمنو (کشویی/کنار‌هم/لیستی/کاشی) با
 * سوییچرِ «کنار منو» و ماندگاری انتخاب کاربر.
 * Task 119 (بازآرایی systemic): چیدمان‌ها به موتور مشترک AppMenuHome منتقل شد
 * (src/components/erp/shared/app-menu-home.tsx) تا پنجرهٔ حسابداری هم بدون
 * دوبل‌نویسی همان ۴ حالت و همان رفتار را داشته باشد؛ این فایل فقط دادهٔ
 * تک‌منبع MENU_GROUPS را نگه می‌دارد — افزودن فرم/گروه بعدی فقط یک مدخل است
 * (قرارداد پنجره‌های اعلامی Task 75).
 */

/** تک‌منبع دادهٔ منوی عمومی — هر ۴ حالت نمایش از همین مدل رندر می‌شوند */
const MENU_GROUPS: AppMenuGroupDef[] = [
  {
    id: "basicInfo",
    titleKey: "fy.menuBasicInfo",
    descKey: "fy.menuBasicInfoDesc",
    icon: FolderOpen,
    gradient: "from-amber-500 to-orange-600",
    items: [
      {
        page: "fiscal-year",
        titleKey: "fy.formTitle",
        descKey: "fy.formDesc",
        icon: CalendarPlus,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        page: "party",
        titleKey: "party.formTitle",
        descKey: "party.formDesc",
        icon: UserRoundPlus,
        gradient: "from-sky-500 to-cyan-600",
      },
      {
        page: "geo-location",
        titleKey: "geo.formTitle",
        descKey: "geo.formDesc",
        icon: Earth,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        page: "currency-type",
        titleKey: "currency.formTitle",
        descKey: "currency.formDesc",
        icon: Coins,
        gradient: "from-amber-500 to-yellow-600",
      },
    ],
  },
  {
    id: "operations",
    titleKey: "rate.menuGroup",
    descKey: "rate.menuGroupDesc",
    icon: Workflow,
    gradient: "from-rose-500 to-red-600",
    items: [
      {
        page: "exchange-rate",
        titleKey: "rate.formTitle",
        descKey: "rate.formDesc",
        icon: ArrowLeftRight,
        gradient: "from-teal-500 to-emerald-600",
      },
    ],
  },
];

export function GeneralMenuHome({ go }: { go: (p: GeneralSubPage) => void }) {
  return (
    <AppMenuHome
      appKey="general"
      titleKey="app.general"
      appIcon={Boxes}
      headerGradient="from-sky-500 to-cyan-600"
      storageKey="general.menuView"
      groups={MENU_GROUPS}
      go={(page) => go(page as GeneralSubPage)}
    />
  );
}
