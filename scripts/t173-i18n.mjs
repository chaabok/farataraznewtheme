/**
 * Task 173 — i18n: تولتیپ دکمهٔ «+» درج ردیف بین ردیف‌های اقلام سند
 * (فرمان مالک: دابل‌کلیک = درج ردیف خالی؛ کلیکِ تکی = فقط انتخاب همان ردیف)
 * در هر ۱۳ زبان.
 * الگو: اسکریپت t171 — درج پس از خط لنگرِ «vc.insertRowHere»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"vc.insertRowHere":';

const KEYS = {
  "vc.insertRowDblHint": [
    "دابل‌کلیک: درج ردیف خالی در اینجا / کلیک: انتخاب ردیف",
    "Double-click: insert empty row here / Click: select row",
    "Çift tıklama: buraya boş satır ekle / Tek tıklama: satırı seç",
    "نقر مزدوج: إدراج صف فارغ هنا / نقر مفرد: تحديد الصف",
    "डबल-क्लिक: यहाँ खाली पंक्ति डालें / क्लिक: पंक्ति चुनें",
    "ډبل کلیک: دلته خالي کتار داخل کړئ / کلیک: کتار غوره کړئ",
    "دوبڵ کلیک: لێرە دێڕی بەتاڵ زیاد بکە / کلیک: دێڕ هەڵبژێرە",
    "Clique duplo: inserir linha vazia aqui / Clique: selecionar linha",
    "더블클릭: 여기에 빈 행 삽입 / 클릭: 행 선택",
    "Double-clic : insérer une ligne vide ici / Clic : sélectionner la ligne",
    "双击：在此处插入空行 / 单击：选择行",
    "Doppelklick: hier leere Zeile einfügen / Klick: Zeile auswählen",
    "Двойной щелчок: вставить пустую строку здесь / Клик: выбрать строку",
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
  console.log(`inserted ${block.length} keys after line ${lineIdx + 1} (${lang})`);
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
console.log(`OK — all ${Object.keys(KEYS).length} keys ×13 (${Object.keys(KEYS).length * 13} lines added)`);
