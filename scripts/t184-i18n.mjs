/**
 * Task t184 — i18n: فرمان مالک — «در فرم سمت‌های گردش کار، در تب تخصیص کاربر،
 * در ستون نام کاربر با کامپوننت دراپ‌دان لیست کاربران تعریف‌شده در فرم
 * کاربران نمایش داده شود؛ هر کاربر به هر سمت یکبار».
 * فقط ۲ کلید تازه: placeholder دراپ‌دان کاربر + پیام خالی‌بودن لیست کاربران.
 * الگو: اسکریپت t183 — درج پس از خط لنگرِ «wf.formTitle»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"wf.formTitle":';

const KEYS = {
  "wf.pickUser": [
    "انتخاب کاربر…",
    "Select a user…",
    "Kullanıcı seçin…",
    "اختر مستخدماً…",
    "उपयोगकर्ता चुनें…",
    "کاروونکی وټاړئ…",
    "بەکارهێنەر هەڵبژێرە…",
    "Selecionar utilizador…",
    "사용자 선택…",
    "Sélectionner un utilisateur…",
    "选择用户…",
    "Benutzer auswählen…",
    "Выберите пользователя…",
  ],
  "wf.noUsersDefined": [
    "کاربری در فرم کاربران تعریف نشده است",
    "No users defined in the Users form",
    "Kullanıcılar formunda tanımlı kullanıcı yok",
    "لا يوجد مستخدمون معرّفون في نموذج المستخدمين",
    "उपयोगकर्ता फ़ॉर्म में कोई उपयोगकर्ता परिभाषित नहीं है",
    "په کاروونکو فورم کې هېڅ کاروونکی تعریف شوی نه دی",
    "هیچ بەکارهێنەرێک لە فۆرمی بەکارهێنەران پێناسە نەکراوە",
    "Não há utilizadores definidos no formulário de utilizadores",
    "사용자 양식에 정의된 사용자가 없습니다",
    "Aucun utilisateur défini dans le formulaire des utilisateurs",
    "用户表单中尚未定义任何用户",
    "Keine Benutzer im Benutzerformular definiert",
    "В форме пользователей нет ни одного пользователя",
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
  if (n !== 13) {
    console.error(`${k}: ×${n} ✗`);
    ok = false;
  }
}
if (!ok) {
  console.error("FAIL: some keys are not exactly ×13");
  process.exit(1);
}
console.log(`OK — all ${Object.keys(KEYS).length} keys ×13 (${Object.keys(KEYS).length * 13} lines added)`);
