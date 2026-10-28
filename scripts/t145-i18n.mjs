#!/usr/bin/env node
/* Task 145 — زیرمنوی «اطلاعات تفصیلی ها» (هم‌تراز «اطلاعات پایه»):
   فرم «ایجاد تفصیلی ها» از زیرمنوی اطلاعات پایه به این زیرمنوی تازه منتقل
   می‌شود؛ فرم‌های بعدی به‌مرور اعلان خواهند شد.
   درج ۲ کلید تازهٔ acc.menuDetailInfo / acc.menuDetailInfoDesc بعد از Anchor
   خط "acc.menuBasicInfoDesc" در هر ۱۳ بلاک زبانی — واژگان = عین واژگان
   acc.menuBasicInfo همان زبان (Bilgiler، معلومات، जानकारी، Informationen، …).
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"acc.menuDetailInfo": "اطلاعات تفصیلی ها"',
    '"acc.menuDetailInfoDesc": "فرم‌های اطلاعات تفصیلی ها"',
  ],
  en: [
    '"acc.menuDetailInfo": "Details Information"',
    '"acc.menuDetailInfoDesc": "Accounting details information forms"',
  ],
  tr: [
    '"acc.menuDetailInfo": "Detay Bilgileri"',
    '"acc.menuDetailInfoDesc": "Muhasebe detay bilgi formları"',
  ],
  ar: [
    '"acc.menuDetailInfo": "معلومات التفصيليات"',
    '"acc.menuDetailInfoDesc": "نماذج معلومات التفصيليات للمحاسبة"',
  ],
  hi: [
    '"acc.menuDetailInfo": "विवरण जानकारी"',
    '"acc.menuDetailInfoDesc": "लेखांकन की विवरण जानकारी के फ़ॉर्म"',
  ],
  ps: [
    '"acc.menuDetailInfo": "تفصیلي معلومات"',
    '"acc.menuDetailInfoDesc": "د محاسبې د تفصیلي معلوماتو فورمې"',
  ],
  ckb: [
    '"acc.menuDetailInfo": "زانیاری وردەکارییەکان"',
    '"acc.menuDetailInfoDesc": "فۆرمەکانی زانیاری وردەکاری ژمێریاری"',
  ],
  pt: [
    '"acc.menuDetailInfo": "Informações de Detalhes"',
    '"acc.menuDetailInfoDesc": "Formulários de informações de detalhes da contabilidade"',
  ],
  ko: [
    '"acc.menuDetailInfo": "상세 정보"',
    '"acc.menuDetailInfoDesc": "회계 상세 정보 양식"',
  ],
  fr: [
    '"acc.menuDetailInfo": "Informations des détails"',
    '"acc.menuDetailInfoDesc": "Formulaires d’informations des détails de la comptabilité"',
  ],
  zh: [
    '"acc.menuDetailInfo": "明细信息"',
    '"acc.menuDetailInfoDesc": "会计明细信息表单"',
  ],
  de: [
    '"acc.menuDetailInfo": "Detailinformationen"',
    '"acc.menuDetailInfoDesc": "Detailinformationsformulare der Buchhaltung"',
  ],
  ru: [
    '"acc.menuDetailInfo": "Данные аналитик"',
    '"acc.menuDetailInfoDesc": "Формы данных аналитик бухгалтерии"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = ["acc.menuDetailInfo", "acc.menuDetailInfoDesc"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۲ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"acc.menuBasicInfoDesc"')) anchors.push(i);
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
for (const key of KEYS) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    process.exit(1);
  }
  console.log(`ok: ${key} ×${n}`);
}
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
