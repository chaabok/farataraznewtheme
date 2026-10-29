#!/usr/bin/env node
/* Task 157 — فیلد «ارز پایه» در تب «حسابداری» فرم «تنظیمات و پیکربندی
   نرم افزار» (درخواست مالک):
   «در پیکربندی نرم افزار و در تب حسابداری یک فیلد ایجاد کنید بنام ارز پایه
   و با استفاده از کامپوننت لیست،لیست ارزهای تعریف شده در فرم نوع ارز را به
   کاربر نمایش دهید تا کاربر یک گزینه را انتخاب نماید. بصورت پیش فرض ارز
   ریال انتخاب شده باشد»
   درج ۱ کلید تازهٔ settings.* بعد از Anchor خط "settings.swMoeinLevelAccess"
   در هر ۱۳ بلاک زبانی — فارسی = عین واژگان مالک. خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"settings.swBaseCurrency": "ارز پایه"',
  ],
  en: [
    '"settings.swBaseCurrency": "Base currency"',
  ],
  tr: [
    '"settings.swBaseCurrency": "Temel para birimi"',
  ],
  ar: [
    '"settings.swBaseCurrency": "العملة الأساسية"',
  ],
  hi: [
    '"settings.swBaseCurrency": "आधार मुद्रा"',
  ],
  ps: [
    '"settings.swBaseCurrency": "اساسي اسعاره"',
  ],
  ckb: [
    '"settings.swBaseCurrency": "دراوی بنەڕەت"',
  ],
  pt: [
    '"settings.swBaseCurrency": "Moeda base"',
  ],
  ko: [
    '"settings.swBaseCurrency": "기준 통화"',
  ],
  fr: [
    '"settings.swBaseCurrency": "Devise de base"',
  ],
  zh: [
    '"settings.swBaseCurrency": "本位币"',
  ],
  de: [
    '"settings.swBaseCurrency": "Basiswährung"',
  ],
  ru: [
    '"settings.swBaseCurrency": "Базовая валюта"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = ["settings.swBaseCurrency"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج کلید تازه بعد از anchor — از پایین به بالا */
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
  console.log(`inserted ${block.length} key after anchor#${k} (${locale})`);
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
