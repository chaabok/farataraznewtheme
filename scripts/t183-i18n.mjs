/**
 * Task t183 — i18n: فرمان مالک — «هر کدام از تب‌های فرم گردش کار را یک فرم
 * کنید و در منوی گردش کار قرار دهید» — هاب t181 به منوی فرم‌ها تبدیل شد و
 * هر تب (کارتابل/سمت‌ها/طراح/گزارش‌ها) فرم مستقلِ خود را گرفت.
 * فقط ۲ کلید تازه: برچسب بخش فرم‌های منو + توضیح فرم سمت‌ها (بقیه از
 * subtitleهای موجود wf.cartable.subtitle/wf.des.subtitle/wf.rep.subtitle
 * بازاستفاده شد).
 * الگو: اسکریپت t181 — درج پس از خط لنگرِ «wf.cartable.title»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"wf.cartable.title":';

const KEYS = {
  "wf.menu.formsLabel": [
    "فرم‌های گردش کار",
    "Workflow forms",
    "İş akışı formları",
    "نماذج سير العمل",
    "वर्कफ़्लो फ़ॉर्म",
    "فورمونهٔ کاري بهیر",
    "فۆرمەکانی ڕەوتی کار",
    "Formulários de fluxo de trabalho",
    "워크플로 양식",
    "Formulaires de workflow",
    "工作流表单",
    "Workflow-Formulare",
    "Формы рабочих процессов",
  ],
  "wf.rolesSubtitle": [
    "تعریف سمت‌ها، تخصیص کاربران و بازهٔ اعتبار",
    "Define positions, assign users and validity ranges",
    "Pozisyonları tanımlayın, kullanıcı ve geçerlilik aralığı atayın",
    "تعريف السمات وإسناد المستخدمين ونطاق الصلاحية",
    "पद परिभाषित करें, उपयोगकर्ता और वैधता अवधि असाइन करें",
    "دندې تعریف کړئ، کاروونکي او د اعتبار موده وګمارئ",
    "پۆستەکان پێناسە بکە، بەکارهێنەر و ماوەی دروستی دابنێ",
    "Defina cargos, atribua usuários e períodos de validade",
    "직책을 정의하고 사용자 및 유효 기간을 할당합니다",
    "Définir les postes, affecter utilisateurs et périodes de validité",
    "定义岗位、分配用户与有效期",
    "Positionen definieren, Benutzer und Gültigkeitszeiträume zuweisen",
    "Определите должности, назначьте пользователей и сроки действия",
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
