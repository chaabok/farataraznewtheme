/**
 * Task 168 — i18n: کلید تازهٔ دکمهٔ «+ ایجاد» فوتر دراپ‌داون‌های فرم سند
 * (فرمان مالک: پلاس = ایجاد موجودیت با باز کردن فرم مرجع، نه انتخاب)
 * در هر ۱۳ زبان. الگو: اسکریپت t167 — درج پس از خط لنگرِ «vc.pickerClearChecked»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"vc.pickerClearChecked":';

const KEYS = {
  "vc.pickerCreate": [
    "ایجاد جدید",
    "Create new",
    "Yeni oluştur",
    "إنشاء جديد",
    "नया बनाएँ",
    "نوی جوړول",
    "دروستکردنی نوێ",
    "Criar novo",
    "새로 만들기",
    "Créer un nouvel élément",
    "新建",
    "Neu anlegen",
    "Создать",
  ],
};

const ORDER = [
  "fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru",
];

let src = readFileSync(FILE, "utf8");
const lines = src.split("\n");

const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(ANCHOR)) anchors.push(i);
}
if (anchors.length !== 13) {
  console.error(`FAIL: anchor ${ANCHOR} found ${anchors.length}× (expected 13)`);
  process.exit(1);
}

/* هر بلوک زبانی به ترتیب ORDER (از بالا به پایین در فایل) */
const insertions = anchors.map((lineIdx, li) => {
  const lang = ORDER[li];
  const block = Object.entries(KEYS).map(
    ([k, vals]) => `  "${k}": ${JSON.stringify(vals[li])},`,
  );
  return { lineIdx, lang, block };
});

/* از پایین به بالا درج تا شمارهٔ سطرها جابه‌جا نشود */
for (const { lineIdx, lang, block } of insertions.reverse()) {
  lines.splice(lineIdx + 1, 0, ...block);
  console.log(`inserted 1 key after line ${lineIdx + 1} (${lang})`);
}

src = lines.join("\n");
writeFileSync(FILE, src);

/* ---------- خودآزما: هر کلید دقیقاً ×۱۳ ---------- */
const out = readFileSync(FILE, "utf8");
let ok = true;
for (const k of Object.keys(KEYS)) {
  const n = out.split(`"${k}":`).length - 1;
  console.log(`${k}: ×${n}`);
  if (n !== 13) ok = false;
}
if (!ok) {
  console.error("FAIL: some keys are not exactly ×13");
  process.exit(1);
}
console.log("OK — all 1 keys ×13 (13 lines added)");
