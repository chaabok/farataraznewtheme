#!/usr/bin/env node
/* Task 143 — درختواره حسابها:
   ① تغییر نام «عنوان لاتین» → «عنوان(2)» (کلید atr.field.latinTitle + سرستون خروجی atr.export.colLatin) ×۱۳ زبان
   ② درج کلید تازه atr.tabsLockedHint (تب‌ها در «افزودن شاخه معین» دیده می‌شوند ولی تا ثبت کد/عنوان قفل‌اند)
      بعد از Anchor خط "atr.tab.attachments" در هر ۱۳ بلاک زبانی.
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

/* ① جایگزینی دو کلید موجود — ترتیب رخداد = ترتیب ORDER */
const REPLACE_BY_LOCALE = {
  fa: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "عنوان(2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "عنوان(2)"',
  },
  en: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "Title (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "Title (2)"',
  },
  tr: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "Başlık (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "Başlık (2)"',
  },
  ar: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "العنوان (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "العنوان (2)"',
  },
  hi: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "शीर्षक (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "शीर्षक (2)"',
  },
  ps: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "سرلیک (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "سرلیک (2)"',
  },
  ckb: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "ناونیشان (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "ناونیشان (2)"',
  },
  pt: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "Título (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "Título (2)"',
  },
  ko: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "제목 (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "제목 (2)"',
  },
  fr: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "Titre (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "Titre (2)"',
  },
  zh: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "名称 (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "名称 (2)"',
  },
  de: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "Titel (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "Titel (2)"',
  },
  ru: {
    "atr.field.latinTitle": '"atr.field.latinTitle": "Название (2)"',
    "atr.export.colLatin": '"atr.export.colLatin": "Название (2)"',
  },
};

/* ② کلید تازه — درج بعد از "atr.tab.attachments" هر بلاک */
const NEW_KEYS_BY_LOCALE = {
  fa: ['"atr.tabsLockedHint": "تب‌ها پس از ثبت کد و عنوان فعال می‌شوند"'],
  en: ['"atr.tabsLockedHint": "Tabs become active after the code and title are saved"'],
  tr: ['"atr.tabsLockedHint": "Sekmeler, kod ve başlık kaydedildikten sonra etkinleşir"'],
  ar: ['"atr.tabsLockedHint": "تُفعَّل علامات التبويب بعد حفظ الكود والعنوان"'],
  hi: ['"atr.tabsLockedHint": "कोड और शीर्षक सहेजने के बाद टैब सक्रिय हो जाएँगे"'],
  ps: ['"atr.tabsLockedHint": "ټبونه د کوډ او سرلیک له ثبتولو وروسته فعالېږي"'],
  ckb: ['"atr.tabsLockedHint": "تابەکان دوای تۆمارکردنی کۆد و ناونیشان چالاک دەبن"'],
  pt: ['"atr.tabsLockedHint": "As guias serão ativadas após salvar o código e o título"'],
  ko: ['"atr.tabsLockedHint": "탭은 코드와 제목을 저장한 후 활성화됩니다"'],
  fr: [
    '"atr.tabsLockedHint": "Les onglets s’activent après l’enregistrement du code et du titre"',
  ],
  zh: ['"atr.tabsLockedHint": "保存代码和标题后，选项卡将被启用"'],
  de: [
    '"atr.tabsLockedHint": "Die Registerkarten werden nach dem Speichern von Code und Titel aktiviert"',
  ],
  ru: ['"atr.tabsLockedHint": "Вкладки станут активными после сохранения кода и названия"'],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* ① جایگزینی کلیدهای موجود — رخداد nاُم = زبان nاُم */
for (const key of ["atr.field.latinTitle", "atr.export.colLatin"]) {
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`"${key}"`)) hits.push(i);
  }
  if (hits.length !== 13) {
    console.error(`FATAL: ${key} found on ${hits.length} lines (expected 13)`);
    process.exit(1);
  }
  hits.forEach((lineIdx, k) => {
    const locale = ORDER[k];
    lines[lineIdx] = "  " + REPLACE_BY_LOCALE[locale][key] + ",";
  });
  console.log(`replaced ${key} ×${hits.length}`);
}

/* ② درج کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"atr.tab.attachments"')) anchors.push(i);
}
if (anchors.length !== 13) {
  console.error(`FATAL: expected 13 anchors, found ${anchors.length}`);
  process.exit(1);
}
for (let k = anchors.length - 1; k >= 0; k--) {
  const locale = ORDER[k];
  const block = NEW_KEYS_BY_LOCALE[locale].map((s) => "  " + s + ",");
  lines.splice(anchors[k] + 1, 0, ...block);
  console.log(`inserted tabsLockedHint after anchor#${k} (${locale})`);
}

const out = lines.join("\n");
/* خودآزما — هر کلید دقیقاً ×۱۳ */
for (const key of ["atr.field.latinTitle", "atr.export.colLatin", "atr.tabsLockedHint"]) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    process.exit(1);
  }
  console.log(`ok: ${key} ×${n}`);
}
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
