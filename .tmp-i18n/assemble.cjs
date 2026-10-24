/**
 * Task 71 — مونتاژ واژه‌نامهٔ ۱۳زبانهٔ dictionaries.ts
 * ① حذف ۱۲۱ خط تکراری کلیدهای یتیم Task 70 از بلوک fa (باگ درج بعد از اولین لنگر)
 * ② توزیع مقادیر درست همین کلیدها به ۱۰ بلوک زبان دیگر (بعد از لنگر همتا)
 * ③ افزودن بلوک‌های کامل de و ru (۴۵۹ کلید، ساختار خطی یکسان با fa)
 * ④ به‌روزرسانی DICTS + کامنت سربرگ
 */
const fs = require("fs");

const SRC = "/home/z/my-project/src/i18n/dictionaries.ts";
const src = fs.readFileSync(SRC, "utf8");
const lines = src.split("\n");

const faKeys = require("/home/z/my-project/.tmp-i18n/fa-keys.json");
const faOrder = require("/home/z/my-project/.tmp-i18n/fa-order.json");
const de = require("/home/z/my-project/.tmp-i18n/de.json");
const ru = require("/home/z/my-project/.tmp-i18n/ru.json");

/* بلوک‌ها: [نام، خط شروع const، خط پایان } ;] (۱-based — مطابق ساختار واقعی: fa با `} as const;` و بقیه با `};`) */
const BLOCKS = [
  ["fa", 7, 594], ["en", 599, 1065], ["tr", 1067, 1523], ["ar", 1525, 1980],
  ["hi", 1982, 2437], ["ps", 2439, 2894], ["ckb", 2896, 3351], ["pt", 3353, 3809],
  ["ko", 3811, 4266], ["fr", 4268, 4724], ["zh", 4726, 5181],
];

const ORPHANS = [
  "settings.activeLangs", "settings.activeLangsDesc",
  "dfb.i18n.valueTitle",
  "dfb.list.translate", "dfb.list.translateOnline", "dfb.list.translateLangsHint",
  "dfb.list.translateOffline", "dfb.list.translateOfflineHint", "dfb.list.translateDone",
  "dfb.list.translateManualTitle", "dfb.list.translateNoTextFields",
];
/* ترتیب درج تکراری‌ها در بلوک fa (معکوسِ ترتیب زبان‌ها به‌دلیل insert-after-anchor) */
const DUP_LANG_ORDER = ["zh", "fr", "ko", "pt", "ckb", "ps", "hi", "ar", "tr", "en", "fa"];

/* ① استخراج مقادیر یتیم per-language از بلوک fa */
const orphans = {}; // orphanKey -> {lang: value}
{
  const seq = {}; // key -> values in file order
  for (let l = 8; l <= 593; l++) {
    const m = lines[l - 1].match(/^  "([^"]+)": "(.*)",?$/);
    if (m && ORPHANS.includes(m[1])) (seq[m[1]] ||= []).push(m[2]);
  }
  for (const k of ORPHANS) {
    const vs = seq[k] ?? [];
    if (vs.length !== 11) throw new Error(`orphan ${k}: expected 11 dup values, got ${vs.length}`);
    orphans[k] = Object.fromEntries(DUP_LANG_ORDER.map((lang, i) => [lang, vs[i]]));
  }
}
/* صحت‌سنجی نمونه: مقدار fa و en */
if (orphans["settings.activeLangs"].fa !== "زبان‌های فعال") throw new Error("fa anchor mismatch");
if (orphans["settings.activeLangs"].en !== "Active languages") throw new Error("en anchor mismatch");
if (orphans["dfb.i18n.valueTitle"].ru !== undefined) throw new Error("ru must not exist yet");
console.log("✓ orphan values extracted per-language (11 keys × 11 values)");

/* ② پارس هر بلوک به آیتم‌ها: key | blank | raw(حفظ) */
const tsEscape = (v) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

function parseBlock(start, end) {
  const items = [];
  for (let l = start + 1; l <= end - 1; l++) { // بین const ... = { و } as const;
    const line = lines[l - 1];
    const m = line.match(/^  "([^"]+)": "(.*)",?$/);
    if (m) { items.push({ type: "key", key: m[1], value: m[2] }); continue; }
    const k2 = line.match(/^  "([^"]+)":\s*$/); // کلید چندخطی (unionWarning)
    if (k2) {
      const vline = (lines[l] ?? "").trim().replace(/^"/, "").replace(/",?\s*$/, "");
      items.push({ type: "key", key: k2[1], value: vline });
      l++; // مصرف خط مقدار تا دوباره ساطع نشود
      continue;
    }
    if (line.trim() === "") { items.push({ type: "blank" }); continue; }
    items.push({ type: "raw", line });
  }
  return items;
}

/* ③ پاک‌سازی یتیم‌ها از آیتم‌ها + درج پس از لنگر */
const ANCHOR_GROUPS = [
  { anchor: "settings.umPending", keys: ["settings.activeLangs", "settings.activeLangsDesc"] },
  { anchor: "dfb.i18n.optionTitle", keys: ["dfb.i18n.valueTitle"] },
  {
    anchor: "dfb.list.refresh",
    keys: [
      "dfb.list.translate", "dfb.list.translateOnline", "dfb.list.translateLangsHint",
      "dfb.list.translateOffline", "dfb.list.translateOfflineHint", "dfb.list.translateDone",
      "dfb.list.translateManualTitle", "dfb.list.translateNoTextFields",
    ],
  },
];

function rebuildItems(items, lang, dict) {
  // حذف همهٔ ردیف‌های کلیدهای یتیم
  let out = items.filter((it) => !(it.type === "key" && ORPHANS.includes(it.key)));
  // درج پس از هر لنگر
  for (const g of ANCHOR_GROUPS) {
    const idx = out.findIndex((it) => it.type === "key" && it.key === g.anchor);
    if (idx < 0) throw new Error(`anchor ${g.anchor} not found for ${lang}`);
    const ins = g.keys.map((k) => ({ type: "key", key: k, value: orphans[k][lang] }));
    out = [...out.slice(0, idx + 1), ...ins, ...out.slice(idx + 1)];
  }
  return out;
}

function emitItems(items, dict, header, closer) {
  const outLines = [header];
  let lastWasBlank = true; // blank ابتدای بدنه حذف
  for (const it of items) {
    if (it.type === "blank") {
      if (!lastWasBlank) { outLines.push(""); lastWasBlank = true; }
      continue;
    }
    lastWasBlank = false;
    if (it.type === "raw") { outLines.push(it.line); continue; }
    let v;
    if (dict) { v = dict[it.key]; if (v === undefined) throw new Error(`missing ${it.key} for dict`); }
    else v = it.value;
    outLines.push(`  "${it.key}": "${tsEscape(v)}",`);
  }
  // حذف blank انتهایی زائد و کامای آخرین کلید
  while (outLines.length > 1 && outLines[outLines.length - 1].trim() === "") outLines.pop();
  outLines.push(closer);
  for (let i = outLines.length - 1; i >= 0; i--) {
    if (outLines[i].trim() !== "" && outLines[i] !== closer) { outLines[i] = outLines[i].replace(/,$/, ""); break; }
  }
  return outLines;
}

/* بلوک fa: بدون دیکشنری بیرونی (مقادیر خودش، + یتیم‌های fa) */
const faItems = rebuildItems(parseBlock(7, 594), "fa", null);
const faOut = emitItems(faItems, null, "const fa = {", "} as const;");

const newBlocks = [faOut.join("\n")];
/* اعلان نوع DictKey/Dict (خطوط 596-597 اصلی) بین fa و en حفظ شود */
const typeBlock = lines.slice(595, 597).join("\n");
if (!typeBlock.includes("export type Dict =")) throw new Error("type block not found at expected lines");
newBlocks.push(typeBlock);
for (const [lang, start, end] of BLOCKS.slice(1)) {
  const items = rebuildItems(parseBlock(start, end), lang, null);
  newBlocks.push(emitItems(items, null, `const ${lang}: Dict = {`, "};").join("\n"));
}
/* بلوک‌های de/ru از ساختار fa + دیکشنری بیرونی (قرارداد بستن هم‌سان بقیهٔ بلوک‌های Dict) */
newBlocks.push(emitItems(faItems, de, "const de: Dict = {", "};").join("\n"));
newBlocks.push(emitItems(faItems, ru, "const ru: Dict = {", "};").join("\n"));

/* ④ سربرگ + DICTS */
const head = lines.slice(0, 6).join("\n").replace("All 11 locales", "All 13 locales");
const dictsLine = "const DICTS: Record<Locale, Dict> = { fa, en, tr, ar, hi, ps, ckb, pt, ko, fr, zh, de, ru };";
const tail = lines.slice(5182).join("\n").replace(
  /^const DICTS: Record<Locale, Dict> = \{[^}]*\};/,
  () => dictsLine,
);
if (!tail.includes(dictsLine)) throw new Error("DICTS line replace failed");

const result = head + "\n" + newBlocks.join("\n\n") + "\n" + tail;
fs.writeFileSync(SRC, result);
console.log("✓ dictionaries.ts rebuilt:", result.split("\n").length, "lines");
