"use client";

/**
 * Task 112 — راه‌انداز واقعی فرم‌های سیستمیِ درختوارهٔ فرمساز (درخواست مالک:
 * «فرم هایی که در زیرمنوی اطلاعات پایه منوی عمومی ایجاد شده اند مثل طرف حساب
 * در درختواره فرمساز و منوی عمومی دیده نمی شود»).
 *
 * دو نیمهٔ قرارداد:
 *  · ثبت — فرم‌های واقعی زیرمنوی «اطلاعات پایه»ٔ عمومی + ساختار کسب و کار از
 *    بوت سرویس dfb در درخت DfbMenu/DfbForm ثبت می‌شوند (SYSTEM_SUBMENUS/
 *    SYSTEM_FORMS در seed.service) ⇒ در درختوارهٔ فرمساز، پنجرهٔ منوی dfb و
 *    بخش «فرم‌های فرم‌ساز» همه‌جا دیده می‌شوند.
 *  · باز کردن — این فرم‌های سیستمی «تعریف EAV» ندارند (بدنهٔ واقعی‌شان
 *    صفحه‌های React اختصاصی است)؛ پس کلیک روی مدخلشان باید همان فرم واقعی را
 *    باز کند، نه ران‌تایم عمومی EAV را:
 *      gnr.businessStructure → پنجرهٔ «ساختار کسب و کار»
 *      gnr.fiscalYear / gnr.party / gnr.geoLocations → پنجرهٔ «عمومی» +
 *      درخواست ناوبری زیرصفحه (قرارداد یک‌بارهٔ Task 85؛ پنجرهٔ بسته اول
 *      باز می‌شود و درخواستِ در انتظار را هنگام mount مصرف می‌کند)
 *      dfb-builder (لانچر فرمساز) → پنجرهٔ سازنده (قرارداد Task 46)
 *    بقیهٔ فرم‌ها (ساختهٔ کاربر) = ران‌تایم عمومی dfb-form مثل قبل.
 */

import { useDesktop } from "@/stores/desktop-store";
import { useGeneralNav, type GeneralSubPage } from "@/stores/general-nav-store";

/** SystemKey فرم‌های سیستمیِ زیرمنوی «اطلاعات پایه»ٔ عمومی → زیرصفحهٔ پنجرهٔ عمومی */
const SYSTEM_GENERAL_PAGES: Record<string, GeneralSubPage> = {
  "gnr.fiscalYear": "fiscal-year",
  "gnr.party": "party",
  "gnr.geoLocations": "geo-location",
  "gnr.currencyType": "currency-type", // Task 114 — نوع ارز
  "gnr.exchangeRate": "exchange-rate", // Task 116 — نرخ برابری (عملیات)
};

/** آیا این فرم سیستمی «فرم واقعی» جداگانه‌ای دارد (برای نمایش دکمهٔ باز کردن)؟ */
export function dfbFormHasRealWindow(systemKey: string | null): boolean {
  if (!systemKey) return false;
  return systemKey === "gnr.businessStructure" || systemKey in SYSTEM_GENERAL_PAGES;
}

export function openDfbFormReal(f: {
  id: number;
  componentKey: string;
  systemKey: string | null;
}): void {
  const open = useDesktop.getState().openWindow;
  /* لانچر «فرمساز» — پنجرهٔ خود سازنده (قرارداد Task 46) */
  if (f.componentKey === "dfb-builder") {
    open("dfb-builder");
    return;
  }
  /* ساختار کسب و کار — پنجرهٔ واقعی خودش */
  if (f.systemKey === "gnr.businessStructure") {
    open("business-structure");
    return;
  }
  /* فرم‌های اطلاعات پایهٔ عمومی — پنجرهٔ عمومی + زیرصفحهٔ خواسته‌شده */
  const page = f.systemKey ? SYSTEM_GENERAL_PAGES[f.systemKey] : undefined;
  if (page) {
    open("app", "general");
    useGeneralNav.getState().requestGeneralPage(page);
    return;
  }
  /* بقیهٔ فرم‌ها — ران‌تایم عمومی تعریف فرم (رفتار همیشگی) */
  open("dfb-form", String(f.id));
}
