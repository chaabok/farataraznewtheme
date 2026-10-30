/**
 * Task 170 — i18n: کلیدهای تولتیپ دستگیره‌های ارتفاع‌دهی بخش‌های فرم سند
 * (فرمان مالک: دابل‌کلیک روی بوردر هر بخش ⇒ انتخاب آن بخش؛ سپس با موس
 * ارتفاع هدر/فوتر سند کم و زیاد می‌شود) در هر ۱۳ زبان.
 * الگو: اسکریپت t169 — درج پس از خط لنگرِ «vc.addRow»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"vc.addRow":';

const KEYS = {
  "vc.resizeHeaderHint": [
    "هدر سند — دابل‌کلیک: انتخاب بخش، کشیدن: تغییر ارتفاع",
    "Voucher header — double-click: select section, drag: resize height",
    "Fiş başlığı — çift tık: bölümü seç, sürükle: yüksekliği değiştir",
    "رأس السند — نقر مزدوج: تحديد القسم، سحب: تغيير الارتفاع",
    "वाउचर हेडर — डबल क्लिक: अनुभाग चुनें, खींचें: ऊँचाई बदलें",
    "د سند سر — دوه کلیک: برخه غوره کړئ، کش کړئ: لوړوالی بدل کړئ",
    "سەری سند — دوو کلیک: بەش هەڵبژێرە، ڕایبکێشە: بەرزی بگۆڕە",
    "Cabeçalho do lançamento — duplo clique: selecionar seção, arrastar: alterar altura",
    "전표 헤더 — 더블클릭: 구역 선택, 드래그: 높이 변경",
    "En-tête du document — double-clic : sélectionner, glisser : redimensionner",
    "凭证表头 — 双击：选中区块，拖动：调整高度",
    "Belegkopf — Doppelklick: Bereich wählen, Ziehen: Höhe ändern",
    "Заголовок документа — двойной клик: выбор секции, перетаскивание: изменение высоты",
  ],
  "vc.resizeFooterHint": [
    "فوتر سند — دابل‌کلیک: انتخاب بخش، کشیدن: تغییر ارتفاع",
    "Voucher footer — double-click: select section, drag: resize height",
    "Fiş alt bilgisi — çift tık: bölümü seç, sürükle: yüksekliği değiştir",
    "تذييل السند — نقر مزدوج: تحديد القسم، سحب: تغيير الارتفاع",
    "वाउचर फ़ुटर — डबल क्लिक: अनुभाग चुनें, खींचें: ऊँचाई बदलें",
    "د سند فوټر — دوه کلیک: برخه غوره کړئ، کش کړئ: لوړوالی بدل کړئ",
    "پێی سند — دوو کلیک: بەش هەڵبژێرە، ڕایبکێشە: بەرزی بگۆڕە",
    "Rodapé do lançamento — duplo clique: selecionar seção, arrastar: alterar altura",
    "전표 푸터 — 더블클릭: 구역 선택, 드래그: 높이 변경",
    "Pied du document — double-clic : sélectionner, glisser : redimensionner",
    "凭证页脚 — 双击：选中区块，拖动：调整高度",
    "Belegfuß — Doppelklick: Bereich wählen, Ziehen: Höhe ändern",
    "Итог документа — двойной клик: выбор секции, перетаскивание: изменение высоты",
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
  console.log(`inserted 2 keys after line ${lineIdx + 1} (${lang})`);
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
console.log("OK — all 2 keys ×13 (26 lines added)");
