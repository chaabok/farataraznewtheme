#!/usr/bin/env node
/* Task 150 — زیرمنوی «سند حسابداری» در منوی حسابداری (درخواست مالک):
   «در منوی حسابداری یک زیرمنو ایجاد کنید بنام سند حسابداری. این زیرمنو هست
   و فرم های آن به مرور اضافه خواهند شد.» — هم‌تراز «اطلاعات پایه» و
   «اطلاعات تفصیلی ها»؛ در حال حاضر بدون فرم (گروه خالی با یادداشت
   «فرم‌های بعدی این بخش به‌مرور اعلان و اضافه می‌شوند» — fy.menuPending) و
   فرم‌های اسناد به‌مرور فقط با یک مدخل در همین گروه اعلان می‌شوند.
   درج ۲ کلید تازهٔ acc.menuDocuments* بعد از Anchor خط "acc.menuDetailInfoDesc"
   در هر ۱۳ بلاک زبانی — واژگان = سبک واژگان acc.menu* همان زبان.
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"acc.menuDocuments": "سند حسابداری"',
    '"acc.menuDocumentsDesc": "فرم‌های سند حسابداری"',
  ],
  en: [
    '"acc.menuDocuments": "Accounting Vouchers"',
    '"acc.menuDocumentsDesc": "Accounting voucher forms"',
  ],
  tr: [
    '"acc.menuDocuments": "Muhasebe Fişleri"',
    '"acc.menuDocumentsDesc": "Muhasebe fişi formları"',
  ],
  ar: [
    '"acc.menuDocuments": "السندات المحاسبية"',
    '"acc.menuDocumentsDesc": "نماذج السندات المحاسبية"',
  ],
  hi: [
    '"acc.menuDocuments": "लेखा वाउचर"',
    '"acc.menuDocumentsDesc": "लेखा वाउचर फ़ॉर्म"',
  ],
  ps: [
    '"acc.menuDocuments": "محاسباتي سندونه"',
    '"acc.menuDocumentsDesc": "د محاسباتي سندونو فورمونه"',
  ],
  ckb: [
    '"acc.menuDocuments": "سندی ژمێریاری"',
    '"acc.menuDocumentsDesc": "فۆرمەکانی سندی ژمێریاری"',
  ],
  pt: [
    '"acc.menuDocuments": "Documentos Contábeis"',
    '"acc.menuDocumentsDesc": "Formulários de documentos contábeis"',
  ],
  ko: [
    '"acc.menuDocuments": "회계 전표"',
    '"acc.menuDocumentsDesc": "회계 전표 양식"',
  ],
  fr: [
    '"acc.menuDocuments": "Pièces comptables"',
    '"acc.menuDocumentsDesc": "Formulaires de pièces comptables"',
  ],
  zh: [
    '"acc.menuDocuments": "会计凭证"',
    '"acc.menuDocumentsDesc": "会计凭证表单"',
  ],
  de: [
    '"acc.menuDocuments": "Buchungsbelege"',
    '"acc.menuDocumentsDesc": "Formulare für Buchungsbelege"',
  ],
  ru: [
    '"acc.menuDocuments": "Бухгалтерские документы"',
    '"acc.menuDocumentsDesc": "Формы бухгалтерских документов"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = ["acc.menuDocuments", "acc.menuDocumentsDesc"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۲ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"acc.menuDetailInfoDesc"')) anchors.push(i);
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
