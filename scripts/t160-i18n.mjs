/**
 * Task 160 — i18n: ۶ کلید تازهٔ نوار وضعیت (زوم داخلی + ذره‌بین) در هر ۱۳ زبان.
 * الگو: اسکریپت t155 — درج پس از خط لنگرِ «taskbar.unpinnedToast» در هر بلوک
 * زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"taskbar.unpinnedToast":';

const KEYS = {
  "taskbar.zoom": [
    "زوم داخلی",
    "Internal zoom",
    "Dahili yakınlaştırma",
    "التكبير الداخلي",
    "आंतरिक ज़ूम",
    "داخلی زوم",
    "زوومی ناوخۆیی",
    "Zoom interno",
    "내부 확대",
    "Zoom interne",
    "内部缩放",
    "Interne Zoomstufe",
    "Внутренний масштаб",
  ],
  "taskbar.zoomIn": [
    "بزرگ‌نمایی",
    "Zoom in",
    "Yakınlaştır",
    "تكبير",
    "ज़ूम इन",
    "لویول",
    "گەورەکردن",
    "Ampliar",
    "확대",
    "Zoom avant",
    "放大",
    "Vergrößern",
    "Увеличить",
  ],
  "taskbar.zoomOut": [
    "کوچک‌نمایی",
    "Zoom out",
    "Uzaklaştır",
    "تصغير",
    "ज़ूम आउट",
    "کمول",
    "بچووککردن",
    "Reducir",
    "축소",
    "Zoom arrière",
    "缩小",
    "Verkleinern",
    "Уменьшить",
  ],
  "taskbar.zoomReset": [
    "بازنشانی زوم",
    "Reset zoom",
    "Yakınlaştırmayı sıfırla",
    "إعادة ضبط التكبير",
    "ज़ूम रीसेट करें",
    "د زوم بیا تنظیم",
    "ڕێکخستنەوەی زووم",
    "Redefinir zoom",
    "확대/축소 초기화",
    "Réinitialiser le zoom",
    "重置缩放",
    "Zoom zurücksetzen",
    "Сбросить масштаб",
  ],
  "taskbar.loupe": [
    "ذره‌بین",
    "Magnifier",
    "Büyüteç",
    "المكبّر",
    "आवर्धक",
    "ذره بین",
    "شیشەی گەورەکردن",
    "Lupa",
    "돋보기",
    "Loupe",
    "放大镜",
    "Lupe",
    "Лупа",
  ],
  "taskbar.loupeHint": [
    "نشانگر را روی هر عنصر نگه دارید تا بزرگ شود — خروج: Esc",
    "Hover any element to magnify it — press Esc to exit",
    "Büyütmek için imleci bir öğenin üzerinde tutun — çıkmak için Esc",
    "ثبّت المؤشر على أي عنصر لتكبيره — للخروج اضغط Esc",
    "किसी तत्व को बड़ा करने के लिए कर्सर उस पर रखें — बाहर निकलने के लिए Esc दबाएँ",
    "د لویولو لپاره کرسر پر هر عنصر ونۍ کړئ — وتل: Esc",
    "بۆ گەورەکردن نیشاندەر لەسەر هەر توخمێک ڕابگرە — دەرچوون: Esc",
    "Passe o cursor sobre um elemento para ampliá-lo — Esc para sair",
    "요소 위에 커서를 올리면 확대됩니다 — Esc로 종료",
    "Survolez un élément pour l'agrandir — Échap pour quitter",
    "将光标悬停在任意元素上即可放大 — 按 Esc 退出",
    "Element zum Vergrößern überfahren — Esc zum Beenden",
    "Наведите курсор на элемент, чтобы увеличить его — Esc для выхода",
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
  console.log(`inserted 6 keys after line ${lineIdx + 1} (${lang})`);
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
console.log("OK — all 6 keys ×13 (78 lines added)");
