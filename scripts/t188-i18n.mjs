/**
 * Task t188 — i18n: فرمان مالک — «اطلاعات تب تخصیص کاربران ذخیره نمی گردد و
 * بعد از بستن و باز کردن فرم اطلاعات کاربران تخصیص داده شده پاک می شود».
 * علت ریشه‌ای: ذخیرهٔ REPLACE با payload خالی (ردیف‌های بدون شناسهٔ کاربر در
 * سمت کلاینت فیلتر می‌شدند ⇒ آرایهٔ خالی ⇒ حذف کامل تخصیص‌های سرور با توست
 * موفقیت). سه کلید تازه برای محافظت از داده‌ها:
 *  ① خطای ردیفِ بدون کاربر  ② اطلاعِ «همهٔ ردیف‌ها خالی — ذخیرهٔ تخصیص‌ها لازم نیست»
 *  ③ هشدارِ «بارگذاری تخصیص‌ها شکست خورد ⇒ این بار ذخیرهٔ تخصیص‌ها قفل شد».
 * الگو: اسکریپت t184 — درج پس از خط لنگرِ «wf.formTitle»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"wf.formTitle":';

const KEYS = {
  "wf.errRowsWithoutUser": [
    "در برخی ردیف‌ها کاربر انتخاب نشده است — ذخیرهٔ تخصیص‌ها انجام نشد",
    "Some rows have no user selected — assignments were not saved",
    "Bazı satırlarda kullanıcı seçilmedi — atamalar kaydedilmedi",
    "لم يتم اختيار مستخدم في بعض الصفوف — لم يتم حفظ التعيينات",
    "कुछ पंक्तियों में उपयोगकर्ता चयनित नहीं है — असाइनमेंट सहेजे नहीं गए",
    "ځینې قطارونه کاروونکی نه لري — ګمارنې خوندي نه شوې",
    "هەندێک ڕیز بەکارهێنەریان هەڵنەبژێرداوە — تەرخانکراوەکان پاشەکەوت نەکراون",
    "Algumas linhas não têm utilizador selecionado — as atribuições não foram guardadas",
    "일부 행에서 사용자가 선택되지 않았습니다 — 할당이 저장되지 않았습니다",
    "Certains lignes n'ont pas d'utilisateur sélectionné — les affectations n'ont pas été enregistrées",
    "部分行未选择用户——分配未保存",
    "In einigen Zeilen ist kein Benutzer ausgewählt — Zuweisungen wurden nicht gespeichert",
    "В некоторых строках не выбран пользователь — назначения не сохранены",
  ],
  "wf.assignmentsNothingToSave": [
    "همهٔ ردیف‌ها خالی‌اند — تخصیص‌های قبلی دست‌نخورده ماند",
    "All rows are empty — previous assignments were kept",
    "Tüm satırlar boş — önceki atamalar korundu",
    "جميع الصفوف فارغة — تم الحفاظ على التعيينات السابقة",
    "सभी पंक्तियाँ खाली हैं — पिछले असाइनमेंट सुरक्षित रखे गए",
    "ټول قطارونه خالي دي — پخوانۍ ګمارنې خوندي پاتې شوې",
    "هەموو ڕیزەکان بەتاڵن — تەرخانکراوەکانی پێشوو پارێزراون",
    "Todas as linhas estão vazias — as atribuições anteriores foram mantidas",
    "모든 행이 비어 있습니다 — 이전 할당이 유지되었습니다",
    "Toutes les lignes sont vides — les affectations précédentes ont été conservées",
    "所有行均为空——之前的分配已保留",
    "Alle Zeilen sind leer — frühere Zuweisungen wurden beibehalten",
    "Все строки пусты — предыдущие назначения сохранены",
  ],
  "wf.assignmentsLoadFailed": [
    "بارگذاری تخصیص‌های قبلی ناموفق بود — برای جلوگیری از پاک‌شدن داده‌ها، این بار تخصیص‌ها ذخیره نشدند",
    "Loading previous assignments failed — to protect your data, assignments were not saved this time",
    "Önceki atamalar yüklenemedi — verilerinizi korumak için bu sefer atamalar kaydedilmedi",
    "فشل تحميل التعيينات السابقة — لحماية بياناتك، لم يتم حفظ التعيينات هذه المرة",
    "पिछले असाइनमेंट लोड करने में विफल — आपके डेटा की सुरक्षा के लिए इस बार असाइनमेंट सहेजे नहीं गए",
    "پخوانۍ ګمارنې پورته نشوې — د ستاسو د معلوماتو د خونديتوب لپاره، دا ځل ګمارنې خوندي نه شوې",
    "بارکردنی تەرخانکراوەکانی پێشوو سەرکەوتوو نەبوو — بۆ پاراستنی داتاکانت، ئەم جارە تەرخانکراوەکان پاشەکەوت نەکراون",
    "Falha ao carregar atribuições anteriores — para proteger os seus dados, as atribuições não foram guardadas desta vez",
    "이전 할당을 불러오지 못했습니다 — 데이터 보호를 위해 이번에는 할당이 저장되지 않았습니다",
    "Échec du chargement des affectations précédentes — pour protéger vos données, les affectations n'ont pas été enregistrées cette fois",
    "加载之前的分配失败——为保护数据，本次未保存分配",
    "Laden der vorherigen Zuweisungen fehlgeschlagen — zum Schutz Ihrer Daten wurden die Zuweisungen diesmal nicht gespeichert",
    "Не удалось загрузить предыдущие назначения — для защиты ваших данных назначения в этот раз не сохранены",
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
