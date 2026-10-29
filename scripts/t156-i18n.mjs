#!/usr/bin/env node
/* Task 156 — بنتوگرید فیلدهای «تنظیمات و پیکربندی نرم افزار» (درخواست مالک):
   «توی تنظیمات و پیکربندی نرم افزار در همه تب ها، برای نمایش فیلدها به کاربر
   از باکس های مختلف استفاده کنید که همه فیلدها در یک باکس نباشد. باکس ها
   باید با استایل تصویری که برات بارگذاری کردم نمایش داده شوند. چیدمان باکس
   ها دقیقا مشابه تصویر باشد. پس زمینه تیره نباشد. می خواهم بنتوگرید باشد.»
   درج ۲ کلید تازهٔ عنوان باکس بعد از Anchor خط "settings.swMoeinLevelAccess"
   در هر ۱۳ بلاک زبانی — خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"settings.swDocDateTrackGroup": "تاریخ و شماره پیگیری"',
    '"settings.swDocOtherGroup": "سایر تنظیمات سند"',
  ],
  en: [
    '"settings.swDocDateTrackGroup": "Date & Tracking Number"',
    '"settings.swDocOtherGroup": "Other Voucher Settings"',
  ],
  tr: [
    '"settings.swDocDateTrackGroup": "Tarih ve Takip Numarası"',
    '"settings.swDocOtherGroup": "Diğer Fiş Ayarları"',
  ],
  ar: [
    '"settings.swDocDateTrackGroup": "التاريخ ورقم المتابعة"',
    '"settings.swDocOtherGroup": "إعدادات السند الأخرى"',
  ],
  hi: [
    '"settings.swDocDateTrackGroup": "तिथि और ट्रैकिंग संख्या"',
    '"settings.swDocOtherGroup": "अन्य वाउचर सेटिंग्स"',
  ],
  ps: [
    '"settings.swDocDateTrackGroup": "نېټه او تعقيب شمېره"',
    '"settings.swDocOtherGroup": "د سند نورې امستنې"',
  ],
  ckb: [
    '"settings.swDocDateTrackGroup": "بەروار و ژمارەی بەدواداچوون"',
    '"settings.swDocOtherGroup": "ڕێکخستنەکانی تری سند"',
  ],
  pt: [
    '"settings.swDocDateTrackGroup": "Data e Número de Acompanhamento"',
    '"settings.swDocOtherGroup": "Outras Configurações de Lançamento"',
  ],
  ko: [
    '"settings.swDocDateTrackGroup": "날짜 및 추적 번호"',
    '"settings.swDocOtherGroup": "기타 전표 설정"',
  ],
  fr: [
    '"settings.swDocDateTrackGroup": "Date et numéro de suivi"',
    '"settings.swDocOtherGroup": "Autres paramètres de pièce"',
  ],
  zh: [
    '"settings.swDocDateTrackGroup": "日期与追踪号"',
    '"settings.swDocOtherGroup": "其他凭证设置"',
  ],
  de: [
    '"settings.swDocDateTrackGroup": "Datum & Trackingnummer"',
    '"settings.swDocOtherGroup": "Weitere Belegeinstellungen"',
  ],
  ru: [
    '"settings.swDocDateTrackGroup": "Дата и номер отслеживания"',
    '"settings.swDocOtherGroup": "Другие настройки проводки"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = ["settings.swDocDateTrackGroup", "settings.swDocOtherGroup"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۲ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"settings.swMoeinLevelAccess"')) anchors.push(i);
}
if (anchors.length !== 13) {
  console.error(`FATAL: expected 13 anchors, found ${anchors.length}`);
  process.exit(1);
}
for (let k = anchors.length - 1; k >= 0; k--) {
  const locale = ORDER[k];
  const block = NEW_KEYS_BY_LOCALE[locale].map((s) => "  " + s + ",");
  lines.splice(anchors[k] + 1, 0, ...block);
  console.log(`inserted ${block.length} keys after anchor#${k} (${locale})`);
}

const out = lines.join("\n");
/* خودآزما — هر کلید دقیقاً ×۱۳ */
let failed = false;
for (const key of KEYS) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    failed = true;
  } else {
    console.log(`ok: ${key} ×${n}`);
  }
}
if (failed) process.exit(1);
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
