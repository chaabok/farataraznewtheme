"use client";

import { AccountingMenuHome } from "./accounting-menu-home";

/**
 * AccountingWindow — Task 119 (درخواست مالک): پنجرهٔ نرم‌افزار «حسابداری»
 * (appKey "accounting"). تا امروز placeholder بود؛ اکنون بدنهٔ واقعی با
 * زیرمنوی «اطلاعات پایه» دارد (اطلاعات پایهٔ حسابداری).
 *
 * ساختار پنجره الگوی عمومی (Task 75/117) است: home = منوی اعلامی با ۴ حالت
 * نمایش؛ فرم‌های بعدی به‌صورت زیرصفحهٔ نوار-باریک (بازگشت + breadcrumb) در
 * همین پنجره باز می‌شوند — هر فرم اعلامی یک زیرصفحه به این switch اضافه می‌کند.
 */
export function AccountingWindow() {
  return <AccountingMenuHome />;
}
