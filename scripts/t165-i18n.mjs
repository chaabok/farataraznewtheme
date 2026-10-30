/**
 * Task 165 — i18n: ۴ کلید تازهٔ مدل نمایش حساب‌های فوتر سند (افقی/عمودی) در هر ۱۳ زبان.
 * الگو: اسکریپت t160 — درج پس از خط لنگرِ «vc.footerAccounts» در هر بلوک زبانی
 * (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"vc.footerAccounts":';

const KEYS = {
  "vc.acctViewLabel": [
    "مدل نمایش حسابها",
    "Account view mode",
    "Hesap görünüm modu",
    "نمط عرض الحسابات",
    "खाता दृश्य मोड",
    "د حسابونو د ښودلو نمونه",
    "شێوازی پیشاندانی حیسابەکان",
    "Modo de exibição das contas",
    "계정 보기 모드",
    "Mode d'affichage des comptes",
    "账户显示模式",
    "Kontenansichts-Modus",
    "Режим отображения счетов",
  ],
  "vc.acctViewVertical": [
    "عمودی",
    "Vertical",
    "Dikey",
    "عمودي",
    "लंबवत",
    "عمودي",
    "ئەستوونی",
    "Vertical",
    "세로",
    "Vertical",
    "垂直",
    "Vertikal",
    "Вертикально",
  ],
  "vc.acctViewHorizontal": [
    "افقی",
    "Horizontal",
    "Yatay",
    "أفقي",
    "क्षैतिज",
    "افقي",
    "ئاسۆیی",
    "Horizontal",
    "가로",
    "Horizontal",
    "水平",
    "Horizontal",
    "Горизонтально",
  ],
  "vc.footerAccountsAll": [
    "حسابهای ردیفهای سند",
    "Accounts of voucher rows",
    "Fiş satırlarının hesapları",
    "حسابات صفوف السند",
    "वाउचर पंक्तियों के खाते",
    "د سند د کتارونو حسابونه",
    "حیسابەکانی ڕیزەکانی سند",
    "Contas das linhas do lançamento",
    "전표 행들의 계정",
    "Comptes des lignes de la pièce",
    "凭证各行的账户",
    "Konten der Belegzeilen",
    "Счета строк проводки",
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
  console.log(`inserted 4 keys after line ${lineIdx + 1} (${lang})`);
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
console.log("OK — all 4 keys ×13 (52 lines added)");
