/**
 * Task 167 — i18n: ۳ کلید تازهٔ پاپ‌آور دراپ‌داون سبک مرجع مالک (لیست فشرده +
 * نوار پایین با شمارندهٔ «{n} مورد» و تولبار آیکونی) در هر ۱۳ زبان.
 * الگو: اسکریپت t165 — درج پس از خط لنگرِ «vc.addSelected» در هر بلوک زبانی
 * (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"vc.addSelected":';

const KEYS = {
  "vc.pickerCount": [
    "{n} مورد",
    "{n} items",
    "{n} kayıt",
    "{n} عنصر",
    "{n} आइटम",
    "{n} مورد",
    "{n} بابەت",
    "{n} itens",
    "{n}개 항목",
    "{n} éléments",
    "{n} 项",
    "{n} Einträge",
    "{n} шт.",
  ],
  "vc.pickerClearFilter": [
    "پاک کردن فیلتر",
    "Clear filter",
    "Filtreyi temizle",
    "مسح الفلتر",
    "फ़िल्टर साफ़ करें",
    "فلټر پاکول",
    "سڕینەوەی پاڵاوتن",
    "Limpar filtro",
    "필터 지우기",
    "Effacer le filtre",
    "清除筛选",
    "Filter löschen",
    "Сбросить фильтр",
  ],
  "vc.pickerClearChecked": [
    "پاک کردن انتخاب‌ها",
    "Clear selection",
    "Seçimi temizle",
    "مسح التحديدات",
    "चयन साफ़ करें",
    "غورونه پاکول",
    "سڕینەوەی هەڵبژاردنەکان",
    "Limpar seleção",
    "선택 지우기",
    "Effacer la sélection",
    "清除选择",
    "Auswahl löschen",
    "Очистить выбор",
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
  console.log(`inserted 3 keys after line ${lineIdx + 1} (${lang})`);
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
console.log("OK — all 3 keys ×13 (39 lines added)");
