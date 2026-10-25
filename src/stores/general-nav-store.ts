"use client";

/**
 * GeneralNavStore (Task 85 — درخواست مالک):
 * درخواست‌های ناوبری «یک‌باره» به پنجرهٔ نرم‌افزار «عمومی» از هر نقطهٔ پوسته —
 * امروز: دکمهٔ «بلی» پیغام «سال مالی وجود ندارد» (fiscal-year-missing-prompt)؛
 * فردا: هر راه‌انداز دیگری که بخواهد فرمی از اطلاعات پایه را مستقیم باز کند.
 *
 * Contract:
 *  · هر درخواست یک id یک‌نواخت جدید می‌گیرد؛ پنجرهٔ عمومی فقط به idهای
 *    دیده‌نشده واکنش نشان می‌دهد ⇒ تغییر زبان / رندرهای مجدد هرگز باعث
 *    پرش ناخواستهٔ ناوبری نمی‌شوند؛
 *  · پنجرهٔ تازه‌بازشده هم درخواستِ در انتظار را هنگام mount مصرف می‌کند
 *    (prompt اول openWindow را صدا می‌زند بعد request را ثبت می‌کند —
 *    هر دو ترتیب درست کار می‌کند)؛
 *  · if (dedupe of openWindow) پنجرهٔ عمومی از قبل باز باشد، همین شنونده
 *    آن را به زیرصفحهٔ خواسته‌شده می‌برد.
 */

import { create } from "zustand";

/** زیرصفحه‌های پنجرهٔ «عمومی» — هم‌نوع GeneralPage در general-window */
export type GeneralSubPage = "home" | "fiscal-year" | "party";

interface GeneralNavState {
  /** درخواست در انتظار (null = هیچ) */
  req: { page: GeneralSubPage; id: number } | null;
  /** پنجرهٔ عمومی را به این زیرصفحه ببر (اگر بسته است، فراخوان باید openWindow بزند) */
  requestGeneralPage: (page: GeneralSubPage) => void;
}

let reqSeq = 0;

export const useGeneralNav = create<GeneralNavState>()((set) => ({
  req: null,
  requestGeneralPage: (page) => set({ req: { page, id: ++reqSeq } }),
}));
