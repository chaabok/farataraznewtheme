/* Task 75 — insert 16 fy.* keys ×13 locales after the settings.swIntError anchor. */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "/home/z/my-project/src/i18n/dictionaries.ts";

const KEYS = [
  // fa
  {
    "fy.menuBasicInfo": "اطلاعات پایه",
    "fy.menuBasicInfoDesc": "فرم‌های اطلاعات پایه",
    "fy.formTitle": "سال مالی جدید",
    "fy.formDesc": "تعریف سال مالی جدید با کد، عنوان، بازهٔ شروع و پایان",
    "fy.menuPending": "فرم‌های بعدی این بخش به‌مرور اعلان و اضافه می‌شوند",
    "fy.code": "کد",
    "fy.title": "عنوان",
    "fy.startDate": "تاریخ شروع",
    "fy.endDate": "تاریخ پایان",
    "fy.active": "فعال",
    "fy.errCodeRequired": "ثبت کد الزامی است؛ کد نمی‌تواند خالی باشد.",
    "fy.errTitleRequired": "ثبت عنوان الزامی است؛ عنوان نمی‌تواند خالی باشد.",
    "fy.errTitleDigits": "عنوان فقط عدد قابل قبول است و باید دقیقاً ۴ کاراکتر باشد.",
    "fy.errDateInvalid": "قالب تاریخ باید YYYY/MM/DD باشد.",
    "fy.errDateOrder": "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.",
    "fy.errMonths": "طول بازهٔ سال مالی نمی‌تواند بیشتر از {max} ماه باشد.",
  },
  // en
  {
    "fy.menuBasicInfo": "Basic Information",
    "fy.menuBasicInfoDesc": "Basic information forms",
    "fy.formTitle": "New Fiscal Year",
    "fy.formDesc": "Define a new fiscal year with code, title and start/end range",
    "fy.menuPending": "Future forms of this section will be announced and added gradually",
    "fy.code": "Code",
    "fy.title": "Title",
    "fy.startDate": "Start date",
    "fy.endDate": "End date",
    "fy.active": "Active",
    "fy.errCodeRequired": "Code is required; it cannot be empty.",
    "fy.errTitleRequired": "Title is required; it cannot be empty.",
    "fy.errTitleDigits": "Title accepts digits only and must be exactly 4 characters.",
    "fy.errDateInvalid": "Date format must be YYYY/MM/DD.",
    "fy.errDateOrder": "End date cannot be before the start date.",
    "fy.errMonths": "The fiscal-year range cannot exceed {max} months.",
  },
  // tr
  {
    "fy.menuBasicInfo": "Temel Bilgiler",
    "fy.menuBasicInfoDesc": "Temel bilgi formları",
    "fy.formTitle": "Yeni Mali Yıl",
    "fy.formDesc": "Kod, başlık ve başlangıç-bitiş aralığı ile yeni mali yıl tanımlayın",
    "fy.menuPending": "Bu bölümün gelecek formları kademeli olarak bildirilecek ve eklenecek",
    "fy.code": "Kod",
    "fy.title": "Başlık",
    "fy.startDate": "Başlangıç tarihi",
    "fy.endDate": "Bitiş tarihi",
    "fy.active": "Aktif",
    "fy.errCodeRequired": "Kod zorunludur; boş bırakılamaz.",
    "fy.errTitleRequired": "Başlık zorunludur; boş bırakılamaz.",
    "fy.errTitleDigits": "Başlık yalnızca rakam kabul eder ve tam olarak 4 karakter olmalıdır.",
    "fy.errDateInvalid": "Tarih biçimi YYYY/MM/DD olmalıdır.",
    "fy.errDateOrder": "Bitiş tarihi başlangıç tarihinden önce olamaz.",
    "fy.errMonths": "Mali yıl aralığı {max} aydan fazla olamaz.",
  },
  // ar
  {
    "fy.menuBasicInfo": "المعلومات الأساسية",
    "fy.menuBasicInfoDesc": "نماذج المعلومات الأساسية",
    "fy.formTitle": "سنة مالية جديدة",
    "fy.formDesc": "تعريف سنة مالية جديدة بالرمز والعنوان ومدة البداية والنهاية",
    "fy.menuPending": "ستُعلن نماذج هذا القسم وتُضاف تدريجياً",
    "fy.code": "الرمز",
    "fy.title": "العنوان",
    "fy.startDate": "تاريخ البداية",
    "fy.endDate": "تاريخ النهاية",
    "fy.active": "نشط",
    "fy.errCodeRequired": "إدخال الرمز إلزامي؛ لا يمكن أن يكون فارغاً.",
    "fy.errTitleRequired": "إدخال العنوان إلزامي؛ لا يمكن أن يكون فارغاً.",
    "fy.errTitleDigits": "يقبل العنوان الأرقام فقط ويجب أن يكون 4 أحرف بالضبط.",
    "fy.errDateInvalid": "يجب أن يكون تنسيق التاريخ YYYY/MM/DD.",
    "fy.errDateOrder": "لا يمكن أن يكون تاريخ النهاية قبل تاريخ البداية.",
    "fy.errMonths": "لا يمكن أن تتجاوز مدة السنة المالية {max} شهراً.",
  },
  // hi
  {
    "fy.menuBasicInfo": "मूल जानकारी",
    "fy.menuBasicInfoDesc": "मूल जानकारी के फ़ॉर्म",
    "fy.formTitle": "नया वित्तीय वर्ष",
    "fy.formDesc": "कोड, शीर्षक और प्रारंभ-अंत अवधि के साथ नया वित्तीय वर्ष परिभाषित करें",
    "fy.menuPending": "इस अनुभाग के भावी फ़ॉर्म चरणबद्ध रूप से घोषित और जोड़े जाएंगे",
    "fy.code": "कोड",
    "fy.title": "शीर्षक",
    "fy.startDate": "प्रारंभ तिथि",
    "fy.endDate": "अंतिम तिथि",
    "fy.active": "सक्रिय",
    "fy.errCodeRequired": "कोड आवश्यक है; यह खाली नहीं हो सकता।",
    "fy.errTitleRequired": "शीर्षक आवश्यक है; यह खाली नहीं हो सकता।",
    "fy.errTitleDigits": "शीर्षक में केवल अंक स्वीकार्य हैं और यह ठीक 4 अक्षरों का होना चाहिए।",
    "fy.errDateInvalid": "तिथि का प्रारूप YYYY/MM/DD होना चाहिए।",
    "fy.errDateOrder": "अंतिम तिथि प्रारंभ तिथि से पहले नहीं हो सकती।",
    "fy.errMonths": "वित्तीय वर्ष की अवधि {max} महीनों से अधिक नहीं हो सकती।",
  },
  // ps
  {
    "fy.menuBasicInfo": "بنسټیز معلومات",
    "fy.menuBasicInfoDesc": "د بنسټیزو معلوماتو فورمې",
    "fy.formTitle": "نوی مالي کال",
    "fy.formDesc": "د کوډ، سرلیک او د پیل-پای نېټې د دورې سره نوی مالي کال تعریف کړئ",
    "fy.menuPending": "د دې برخې راتلونکې فورمې په تدریجي ډول اعلان او اضافه کیږي",
    "fy.code": "کوډ",
    "fy.title": "سرلیک",
    "fy.startDate": "د پیل نېټه",
    "fy.endDate": "د پای نېټه",
    "fy.active": "فعال",
    "fy.errCodeRequired": "کوډ لیکل لازمي دي؛ نشي کولی تش وي.",
    "fy.errTitleRequired": "سرلیک لیکل لازمي دی؛ نشي کولی تش وي.",
    "fy.errTitleDigits": "سرلیک یوازې عددي مني او باید دقیقاً ۴ توري وي.",
    "fy.errDateInvalid": "د نېټې بڼه باید YYYY/MM/DD وي.",
    "fy.errDateOrder": "د پای نېټه نشي کولی له د پیل نېټې څخه وړاندې وي.",
    "fy.errMonths": "د مالي کال دوره نشي کولی له {max} میاشتو څخه زیاته وي.",
  },
  // ckb
  {
    "fy.menuBasicInfo": "زانیاری بنەڕەتی",
    "fy.menuBasicInfoDesc": "فۆرمەکانی زانیاری بنەڕەتی",
    "fy.formTitle": "ساڵی دارایی نوێ",
    "fy.formDesc": "پێناسەی ساڵی دارایی نوێ بە کۆد، ناونیشان و مەودای دەستپێک-کۆتایی",
    "fy.menuPending": "فۆرمەکانی داهاتووی ئەم بەشە بە شێوەی هەنگاو بە هەنگاو ڕادەگەیەنرێن و زیاد دەکرێن",
    "fy.code": "کۆد",
    "fy.title": "ناونیشان",
    "fy.startDate": "بەرواری دەستپێک",
    "fy.endDate": "بەرواری کۆتایی",
    "fy.active": "چالاک",
    "fy.errCodeRequired": "نووسینی کۆد پێویستە؛ ناتوانێت بەتاڵ بێت.",
    "fy.errTitleRequired": "نووسینی ناونیشان پێویستە؛ ناتوانێت بەتاڵ بێت.",
    "fy.errTitleDigits": "ناونیشان تەنها ژمارە قبوڵ دەکات و دەبێت بە تەواوی ٤ پیت بێت.",
    "fy.errDateInvalid": "شێوازی بەروار دەبێت YYYY/MM/DD بێت.",
    "fy.errDateOrder": "بەرواری کۆتایی ناتوانێت پێش بەرواری دەستپێک بێت.",
    "fy.errMonths": "مەودای ساڵی دارایی ناتوانێت لە {max} مانگ زیاتر بێت.",
  },
  // pt
  {
    "fy.menuBasicInfo": "Informações Básicas",
    "fy.menuBasicInfoDesc": "Formulários de informações básicas",
    "fy.formTitle": "Novo Ano Fiscal",
    "fy.formDesc": "Definir um novo ano fiscal com código, título e intervalo de início/fim",
    "fy.menuPending": "Os próximos formulários desta seção serão anunciados e adicionados gradualmente",
    "fy.code": "Código",
    "fy.title": "Título",
    "fy.startDate": "Data de início",
    "fy.endDate": "Data de término",
    "fy.active": "Ativo",
    "fy.errCodeRequired": "O código é obrigatório; não pode ficar vazio.",
    "fy.errTitleRequired": "O título é obrigatório; não pode ficar vazio.",
    "fy.errTitleDigits": "O título aceita apenas dígitos e deve ter exatamente 4 caracteres.",
    "fy.errDateInvalid": "O formato da data deve ser YYYY/MM/DD.",
    "fy.errDateOrder": "A data de término não pode ser anterior à data de início.",
    "fy.errMonths": "O intervalo do ano fiscal não pode exceder {max} meses.",
  },
  // ko
  {
    "fy.menuBasicInfo": "기본 정보",
    "fy.menuBasicInfoDesc": "기본 정보 양식",
    "fy.formTitle": "새 회계연도",
    "fy.formDesc": "코드, 제목, 시작/종료 기간으로 새 회계연도를 정의합니다",
    "fy.menuPending": "이 섹션의 향후 양식은 단계적으로 공지되어 추가됩니다",
    "fy.code": "코드",
    "fy.title": "제목",
    "fy.startDate": "시작일",
    "fy.endDate": "종료일",
    "fy.active": "활성",
    "fy.errCodeRequired": "코드는 필수이며 비워 둘 수 없습니다.",
    "fy.errTitleRequired": "제목은 필수이며 비워 둘 수 없습니다.",
    "fy.errTitleDigits": "제목은 숫자만 입력할 수 있으며 정확히 4자여야 합니다.",
    "fy.errDateInvalid": "날짜 형식은 YYYY/MM/DD여야 합니다.",
    "fy.errDateOrder": "종료일은 시작일보다 이전일 수 없습니다.",
    "fy.errMonths": "회계연도 기간은 {max}개월을 초과할 수 없습니다.",
  },
  // fr
  {
    "fy.menuBasicInfo": "Informations de base",
    "fy.menuBasicInfoDesc": "Formulaires d'informations de base",
    "fy.formTitle": "Nouvel exercice financier",
    "fy.formDesc": "Définir un nouvel exercice financier avec code, titre et période de début/fin",
    "fy.menuPending": "Les prochains formulaires de cette section seront annoncés et ajoutés progressivement",
    "fy.code": "Code",
    "fy.title": "Titre",
    "fy.startDate": "Date de début",
    "fy.endDate": "Date de fin",
    "fy.active": "Actif",
    "fy.errCodeRequired": "Le code est obligatoire ; il ne peut pas être vide.",
    "fy.errTitleRequired": "Le titre est obligatoire ; il ne peut pas être vide.",
    "fy.errTitleDigits": "Le titre n'accepte que des chiffres et doit comporter exactement 4 caractères.",
    "fy.errDateInvalid": "Le format de la date doit être YYYY/MM/DD.",
    "fy.errDateOrder": "La date de fin ne peut pas être antérieure à la date de début.",
    "fy.errMonths": "La durée de l'exercice financier ne peut pas dépasser {max} mois.",
  },
  // zh
  {
    "fy.menuBasicInfo": "基本信息",
    "fy.menuBasicInfoDesc": "基本信息表单",
    "fy.formTitle": "新会计年度",
    "fy.formDesc": "通过代码、标题及起止期间定义新的会计年度",
    "fy.menuPending": "本节后续表单将逐步公布并添加",
    "fy.code": "代码",
    "fy.title": "标题",
    "fy.startDate": "开始日期",
    "fy.endDate": "结束日期",
    "fy.active": "启用",
    "fy.errCodeRequired": "代码为必填项，不能为空。",
    "fy.errTitleRequired": "标题为必填项，不能为空。",
    "fy.errTitleDigits": "标题仅接受数字，且必须恰好为 4 个字符。",
    "fy.errDateInvalid": "日期格式必须为 YYYY/MM/DD。",
    "fy.errDateOrder": "结束日期不能早于开始日期。",
    "fy.errMonths": "会计年度期间不能超过 {max} 个月。",
  },
  // de
  {
    "fy.menuBasicInfo": "Basisinformationen",
    "fy.menuBasicInfoDesc": "Formulare der Basisinformationen",
    "fy.formTitle": "Neues Geschäftsjahr",
    "fy.formDesc": "Neues Geschäftsjahr mit Code, Titel und Zeitraum von/bis definieren",
    "fy.menuPending": "Weitere Formulare dieses Bereichs werden nach und nach angekündigt und ergänzt",
    "fy.code": "Code",
    "fy.title": "Titel",
    "fy.startDate": "Startdatum",
    "fy.endDate": "Enddatum",
    "fy.active": "Aktiv",
    "fy.errCodeRequired": "Der Code ist erforderlich und darf nicht leer sein.",
    "fy.errTitleRequired": "Der Titel ist erforderlich und darf nicht leer sein.",
    "fy.errTitleDigits": "Der Titel akzeptiert nur Ziffern und muss genau 4 Zeichen lang sein.",
    "fy.errDateInvalid": "Das Datumsformat muss YYYY/MM/DD sein.",
    "fy.errDateOrder": "Das Enddatum darf nicht vor dem Startdatum liegen.",
    "fy.errMonths": "Der Zeitraum des Geschäftsjahres darf {max} Monate nicht überschreiten.",
  },
  // ru
  {
    "fy.menuBasicInfo": "Основные данные",
    "fy.menuBasicInfoDesc": "Формы основных данных",
    "fy.formTitle": "Новый финансовый год",
    "fy.formDesc": "Определение нового финансового года с кодом, названием и периодом начала/окончания",
    "fy.menuPending": "Будущие формы этого раздела будут объявляться и добавляться постепенно",
    "fy.code": "Код",
    "fy.title": "Название",
    "fy.startDate": "Дата начала",
    "fy.endDate": "Дата окончания",
    "fy.active": "Активен",
    "fy.errCodeRequired": "Код обязателен; не может быть пустым.",
    "fy.errTitleRequired": "Название обязательно; не может быть пустым.",
    "fy.errTitleDigits": "Название допускает только цифры и должно состоять ровно из 4 символов.",
    "fy.errDateInvalid": "Формат даты должен быть YYYY/MM/DD.",
    "fy.errDateOrder": "Дата окончания не может быть раньше даты начала.",
    "fy.errMonths": "Продолжительность финансового года не может превышать {max} месяцев.",
  },
];

const src = readFileSync(FILE, "utf8");
const lines = src.split("\n");

const ANCHOR = '"settings.swIntError":';
const anchors = lines.map((l, i) => (l.includes(ANCHOR) ? i : -1)).filter((i) => i >= 0);
if (anchors.length !== 13) {
  console.error(`FATAL: expected 13 anchors, found ${anchors.length}`);
  process.exit(1);
}
if (KEYS.length !== 13) {
  console.error("FATAL: KEYS must have 13 locale blocks");
  process.exit(1);
}

const inserts = new Map();
anchors.forEach((lineIdx, block) => {
  const dict = KEYS[block];
  const blockLines = Object.entries(dict).map(([k, v]) => `  "${k}": ${JSON.stringify(v)},`);
  inserts.set(lineIdx, blockLines);
});

const out = [];
for (let i = 0; i < lines.length; i++) {
  out.push(lines[i]);
  const ins = inserts.get(i);
  if (ins) out.push(...ins);
}

writeFileSync(FILE, out.join("\n"));
console.log("inserted 13 blocks x", Object.keys(KEYS[0]).length, "keys");

const after = readFileSync(FILE, "utf8");
let fail = false;
for (const k of Object.keys(KEYS[0])) {
  const re = new RegExp(`"${k}":`, "g");
  const n = (after.match(re) ?? []).length;
  if (n !== 13) {
    console.error(`VERIFY FAIL: ${k} appears ${n}x (expected 13)`);
    fail = true;
  }
}
if (fail) process.exit(1);
console.log("verify OK: every fy.* key appears exactly 13x");
