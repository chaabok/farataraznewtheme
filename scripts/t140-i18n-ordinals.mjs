#!/usr/bin/env node
/* Task 140 — افزودن ۲۰ کلید ordinal سطوح تفصیلی به ۱۲ زبان غیر fa
   (fa منبع حقیقت است و Dict به کلیدهای کامل در همهٔ زبان‌ها نیاز دارد). */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const LEVEL_WORD = {
  en: "Level", tr: "Düzey", ar: "المستوى", hi: "स्तर", ps: "سطحې", ckb: "ئاستی",
  pt: "Nível", ko: (n) => `${n} 단계`, fr: "Niveau", zh: (n) => `第 ${n} 层`, de: "Ebene", ru: "Уровень",
};
const ANCHOR_VALUE = {
  en: "Number of detail levels", tr: "Detay seviyesi sayısı", ar: "عدد المستويات التفصيلية",
  hi: "विस्तृत स्तरों की संख्या", ps: "د تفصیلي سطحو شمېر", ckb: "ژمارەی ئاستەکانی وردەکاری",
  pt: "Número de níveis de detalhes", ko: "상세 단계 수", fr: "Nombre de niveaux de détails",
  zh: "辅助核算层级数", de: "Anzahl der Detailebenen", ru: "Количество аналитических уровней",
};

let src = readFileSync(PATH, "utf8");
let total = 0;
for (const loc of Object.keys(ANCHOR_VALUE)) {
  const anchor = `  "settings.swAccDetailLevels": "${ANCHOR_VALUE[loc]}",`;
  if (!src.includes(anchor)) {
    console.error(`ANCHOR NOT FOUND for ${loc}`);
    process.exit(1);
  }
  const word = LEVEL_WORD[loc];
  const lines = [];
  for (let i = 1; i <= 20; i++) {
    const label = typeof word === "function" ? word(i) : `${word} ${i}`;
    lines.push(`  "atr.levels.ord.${i}": ${JSON.stringify(label)},`);
  }
  src = src.replace(anchor, anchor + "\n" + lines.join("\n"));
  total += lines.length;
  console.log(`${loc}: +${lines.length}`);
}
writeFileSync(PATH, src);
console.log(`TOTAL inserted: ${total}`);
