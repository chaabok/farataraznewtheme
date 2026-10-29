"use client";

/**
 * AccountingNavStore — Task 120 (الگوی GeneralNavStore — Task 85):
 * درخواست‌های ناوبری «یک‌باره» به پنجرهٔ نرم‌افزار «حسابداری» از هر نقطهٔ
 * پوسته (فردا: راه‌اندازهای درختوارهٔ فرمساز و پیغام‌های سیستمی).
 *
 * Contract (عین Task 85):
 *  · هر درخواست یک id یک‌نواخت جدید می‌گیرد؛ پنجرهٔ حسابداری فقط به idهای
 *    دیده‌نشده واکنش نشان می‌دهد ⇒ تغییر زبان / رندرهای مجدد هرگز باعث
 *    پرش ناخواستهٔ ناوبری نمی‌شوند؛
 *  · پنجرهٔ تازه‌بازشده هم درخواستِ در انتظار را هنگام mount مصرف می‌کند؛
 *  · اگر پنجره از قبل باز باشد، همین شنونده آن را به زیرصفحهٔ خواسته‌شده
 *    می‌برد.
 */

import { create } from "zustand";

/** زیرصفحه‌های پنجرهٔ «حسابداری» — هم‌نوع AccountingPage در accounting-window */
export type AccountingSubPage =
  | "home"
  | "detail-type" // Task 120 — نوع تفصیل جدید (اطلاعات پایهٔ حسابداری)
  | "detail-type-numbering" // Task 131 — شماره گذاری تفصیلی ها (اطلاعات پایهٔ حسابداری)
  | "detail-items" // Task 144 — ایجاد تفصیلی ها (زیرمنوی «اطلاعات تفصیلی ها» — Task 145)
  | "cost-center" // Task 146 — مرکز هزینه جدید (زیرمنوی «اطلاعات تفصیلی ها»)
  | "project" // Task 147 — تعریف پروژه (زیرمنوی «اطلاعات تفصیلی ها»)
  | "contract" // Task 148 — قرارداد جدید (زیرمنوی «اطلاعات تفصیلی ها»)
  | "account-tree" // Task 140 — درختواره حسابها (اطلاعات پایهٔ حسابداری)
  | "voucher-type"; // Task 153 — نوع سند جدید (زیرمنوی «سند حسابداری»)

interface AccountingNavState {
  /** درخواست در انتظار (null = هیچ) */
  req: { page: AccountingSubPage; id: number } | null;
  /** پنجرهٔ حسابداری را به این زیرصفحه ببر (اگر بسته است، فراخوان openWindow بزند) */
  requestAccountingPage: (page: AccountingSubPage) => void;
}

let reqSeq = 0;

export const useAccountingNav = create<AccountingNavState>()((set) => ({
  req: null,
  requestAccountingPage: (page) => set({ req: { page, id: ++reqSeq } }),
}));
