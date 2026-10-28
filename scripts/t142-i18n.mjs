#!/usr/bin/env node
/* Task 142 — مودال «انتخاب نوع تفصیلی»:
   ① جایگزینی دو کلید pickHint/usedHint (حذف واژهٔ دابل‌کلیک ← تک‌کلیک/چندگانه)
   ② درج ۴ کلید تازه (pickSelectAll/pickConfirm/pickSelectedCount/pickSaving)
      بعد از Anchor خط "atr.levels.emptyTypes" در هر ۱۳ بلاک زبانی.
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

/* جایگزینی دو کلید موجود — ترتیب رخداد = ترتیب ORDER */
const REPLACE_BY_LOCALE = {
  fa: {
    "atr.levels.pickHint":
      '"atr.levels.pickHint": "با تک‌کلیک انتخاب/لغو انتخاب می‌شود"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "انواع استفاده‌شده در سطوح این حساب و موارد تکراری نمایش داده نمی‌شوند؛ با تک‌کلیک چند نوع را برگزینید و «انتخاب» بزنید."',
  },
  en: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "Click to select/unselect"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "Types already used in this account\'s levels (and duplicates) are hidden; single-click to pick several, then press “Select”."',
  },
  tr: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "Seçmek/kaldırmak için tek tıklayın"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "Bu hesabın düzeylerinde kullanılan türler (ve kopyalar) gizlenir; birkaç tür seçmek için tek tıklayın, ardından «Seç»e basın."',
  },
  ar: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "انقر نقرة واحدة للاختيار أو إلغائه"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "تُخفى الأنواع المستخدمة في مستويات هذا الحساب (والمكررة)؛ انقر نقرة واحدة لاختيار عدة أنواع ثم اضغط «اختيار»."',
  },
  hi: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "चुनने/हटाने के लिए एक बार क्लिक करें"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "इस लेखा के स्तरों में प्रयुक्त प्रकार (और डुप्लिकेट) छिपे रहते हैं; कई प्रकार चुनने के लिए एक क्लिक करें और फिर “चुनें” दबाएँ।"',
  },
  ps: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "د ټاکلو لپاره یو ځل کلیک وکړئ"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "پدې حساب کې کارېدلي ډوله (او تکراري) پټېږي؛ د څو ډولونو ټاکلو لپاره یو ځل کلیک وکړئ او بیا «ټاکل» کېکاږئ."',
  },
  ckb: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "بۆ هەڵبژاردن یان لابردن یەک جار کلیک بکە"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "جۆرە بەکارهاتووەکان لە ئاستەکانی ئەم حسابدا (و دووبارەکان) شاراونەتەوە؛ بۆ هەڵبژاردنی چەند جۆرێک یەک جار کلیک بکە و پاشان «هەڵبژاردن» دابگرە."',
  },
  pt: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "Clique para selecionar/desmarcar"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "Tipos já usados nos níveis desta conta (e duplicados) ficam ocultos; clique para escolher vários e pressione «Selecionar»."',
  },
  ko: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "클릭하여 선택/해제"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "이 계정의 수준에서 이미 사용된 유형(및 중복)은 숨겨집니다. 한 번 클릭으로 여러 유형을 고른 뒤 «선택»을 누르세요."',
  },
  fr: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "Cliquez pour sélectionner/désélectionner"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "Les types déjà utilisés dans les niveaux de ce compte (et les doublons) sont masqués ; cliquez pour en choisir plusieurs, puis appuyez sur « Sélectionner »."',
  },
  zh: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "单击以选择/取消选择"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "该账户各层级已使用的类型（及重复项）会被隐藏；单击选择多个类型，然后按「选择」。"',
  },
  de: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "Zum Auswählen/Abwählen klicken"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "In den Ebenen dieses Kontos bereits verwendete Typen (und Duplikate) werden ausgeblendet; klicken Sie, um mehrere zu wählen, und drücken Sie «Auswählen»."',
  },
  ru: {
    "atr.levels.pickHint": '"atr.levels.pickHint": "Нажмите, чтобы выбрать/снять выбор"',
    "atr.levels.usedHint":
      '"atr.levels.usedHint": "Типы, уже использованные на уровнях этого счёта (и дубликаты), скрыты; кликните, чтобы выбрать несколько, затем нажмите «Выбрать»."',
  },
};

/* ۴ کلید تازه — درج بعد از "atr.levels.emptyTypes" هر بلاک */
const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"atr.levels.pickSelectAll": "انتخاب همه"',
    '"atr.levels.pickConfirm": "انتخاب"',
    '"atr.levels.pickSelectedCount": "{n} نوع انتخاب شد"',
    '"atr.levels.pickSaving": "در حال ثبت انتساب…"',
  ],
  en: [
    '"atr.levels.pickSelectAll": "Select all"',
    '"atr.levels.pickConfirm": "Select"',
    '"atr.levels.pickSelectedCount": "{n} type(s) selected"',
    '"atr.levels.pickSaving": "Assigning…"',
  ],
  tr: [
    '"atr.levels.pickSelectAll": "Tümünü seç"',
    '"atr.levels.pickConfirm": "Seç"',
    '"atr.levels.pickSelectedCount": "{n} tür seçildi"',
    '"atr.levels.pickSaving": "Atanıyor…"',
  ],
  ar: [
    '"atr.levels.pickSelectAll": "اختيار الكل"',
    '"atr.levels.pickConfirm": "اختيار"',
    '"atr.levels.pickSelectedCount": "تم اختيار {n} نوعًا"',
    '"atr.levels.pickSaving": "جارٍ الإسناد…"',
  ],
  hi: [
    '"atr.levels.pickSelectAll": "सभी चुनें"',
    '"atr.levels.pickConfirm": "चुनें"',
    '"atr.levels.pickSelectedCount": "{n} प्रकार चुने गए"',
    '"atr.levels.pickSaving": "असाइन हो रहा है…"',
  ],
  ps: [
    '"atr.levels.pickSelectAll": "ټول ټاکل"',
    '"atr.levels.pickConfirm": "ټاکل"',
    '"atr.levels.pickSelectedCount": "{n} ډول ټاکل شول"',
    '"atr.levels.pickSaving": "په ګمارلو کې…"',
  ],
  ckb: [
    '"atr.levels.pickSelectAll": "هەڵبژاردنی هەموو"',
    '"atr.levels.pickConfirm": "هەڵبژاردن"',
    '"atr.levels.pickSelectedCount": "{n} جۆر هەڵبژێردران"',
    '"atr.levels.pickSaving": "لە گەماراندندا…"',
  ],
  pt: [
    '"atr.levels.pickSelectAll": "Selecionar tudo"',
    '"atr.levels.pickConfirm": "Selecionar"',
    '"atr.levels.pickSelectedCount": "{n} tipo(s) selecionado(s)"',
    '"atr.levels.pickSaving": "Atribuindo…"',
  ],
  ko: [
    '"atr.levels.pickSelectAll": "모두 선택"',
    '"atr.levels.pickConfirm": "선택"',
    '"atr.levels.pickSelectedCount": "{n}개 유형이 선택됨"',
    '"atr.levels.pickSaving": "할당 중…"',
  ],
  fr: [
    '"atr.levels.pickSelectAll": "Tout sélectionner"',
    '"atr.levels.pickConfirm": "Sélectionner"',
    '"atr.levels.pickSelectedCount": "{n} type(s) sélectionné(s)"',
    '"atr.levels.pickSaving": "Affectation…"',
  ],
  zh: [
    '"atr.levels.pickSelectAll": "全选"',
    '"atr.levels.pickConfirm": "选择"',
    '"atr.levels.pickSelectedCount": "已选择 {n} 个类型"',
    '"atr.levels.pickSaving": "正在分配…"',
  ],
  de: [
    '"atr.levels.pickSelectAll": "Alle auswählen"',
    '"atr.levels.pickConfirm": "Auswählen"',
    '"atr.levels.pickSelectedCount": "{n} Typ(en) ausgewählt"',
    '"atr.levels.pickSaving": "Zuweisen…"',
  ],
  ru: [
    '"atr.levels.pickSelectAll": "Выбрать все"',
    '"atr.levels.pickConfirm": "Выбрать"',
    '"atr.levels.pickSelectedCount": "Выбрано типов: {n}"',
    '"atr.levels.pickSaving": "Назначение…"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* ① جایگزینی دو کلید موجود — رخداد nاُم = زبان nاُم */
for (const key of ["atr.levels.pickHint", "atr.levels.usedHint"]) {
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

/* ② درج ۴ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"atr.levels.emptyTypes"')) anchors.push(i);
}
if (anchors.length !== 13) {
  console.error(`FATAL: expected 13 anchors, found ${anchors.length}`);
  process.exit(1);
}
for (let k = anchors.length - 1; k >= 0; k--) {
  const locale = ORDER[k];
  const block = NEW_KEYS_BY_LOCALE[locale].map((s) => "  " + s + ",");
  lines.splice(anchors[k] + 1, 0, ...block);
  console.log(`inserted 4 keys after anchor#${k} (${locale})`);
}

const out = lines.join("\n");
/* خودآزما — هر کلید دقیقاً ×۱۳ */
for (const key of [
  "atr.levels.pickHint",
  "atr.levels.usedHint",
  "atr.levels.pickSelectAll",
  "atr.levels.pickConfirm",
  "atr.levels.pickSelectedCount",
  "atr.levels.pickSaving",
]) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    process.exit(1);
  }
  console.log(`ok: ${key} ×${n}`);
}
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
