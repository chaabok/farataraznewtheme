#!/usr/bin/env node
/* Task 153 — فرم «نوع سند جدید» در زیرمنوی «سند حسابداری» (درخواست مالک):
   «در زیرمنوی سند حسابداری نرم افزار حسابداری فرم نوع سند جدید را اضافه کنید.
   فیلدهای فرم نوع سند (به ترتیب): کد اجباری، عنوان اجباری، توضیحات اختیاری،
   فعال بصورت پیش فرض تیک داشته باشد.» + ۹ نوع پیش‌فرض فهرست مالک.
   درج ۱۰ کلید تازهٔ vt.* بعد از Anchor خط "dt.errTitleRequired" در هر ۱۳
   بلاک زبانی — واژگان = سبک واژگان dt.* همان زبان (تفصیل→سند/fiş/voucher/
   سند/वाउचर/전표/pièce/凭证/Beleg/документ). خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"vt.formTitle": "نوع سند جدید"',
    '"vt.formDesc": "تعریف نوع سند با کد، عنوان، فعال و توضیحات"',
    '"vt.listTitle": "فهرست انواع سند"',
    '"vt.code": "کد"',
    '"vt.title": "عنوان"',
    '"vt.active": "فعال"',
    '"vt.description": "توضیحات"',
    '"vt.descriptionPlaceholder": "متن توضیحات (اختیاری)"',
    '"vt.errCodeRequired": "ثبت کد نوع سند الزامی است؛ کد نمی‌تواند خالی باشد."',
    '"vt.errTitleRequired": "ثبت عنوان نوع سند الزامی است؛ عنوان نمی‌تواند خالی باشد."',
  ],
  en: [
    '"vt.formTitle": "New Voucher Type"',
    '"vt.formDesc": "Define a voucher type with code, title, active flag and description"',
    '"vt.listTitle": "Voucher Types List"',
    '"vt.code": "Code"',
    '"vt.title": "Title"',
    '"vt.active": "Active"',
    '"vt.description": "Description"',
    '"vt.descriptionPlaceholder": "Description text (optional)"',
    '"vt.errCodeRequired": "Voucher type code is required; the code cannot be empty."',
    '"vt.errTitleRequired": "Voucher type title is required; the title cannot be empty."',
  ],
  tr: [
    '"vt.formTitle": "Yeni Fiş Türü"',
    '"vt.formDesc": "Kod, başlık, aktif durumu ve açıklama ile fiş türü tanımlayın"',
    '"vt.listTitle": "Fiş Türleri Listesi"',
    '"vt.code": "Kod"',
    '"vt.title": "Başlık"',
    '"vt.active": "Aktif"',
    '"vt.description": "Açıklama"',
    '"vt.descriptionPlaceholder": "Açıklama metni (isteğe bağlı)"',
    '"vt.errCodeRequired": "Fiş türü kodu zorunludur; kod boş olamaz."',
    '"vt.errTitleRequired": "Fiş türü başlığı zorunludur; başlık boş olamaz."',
  ],
  ar: [
    '"vt.formTitle": "نوع سند جديد"',
    '"vt.formDesc": "تعريف نوع السند بالرمز والعنوان وحالة التنشيط والملاحظات"',
    '"vt.listTitle": "قائمة أنواع السندات"',
    '"vt.code": "الرمز"',
    '"vt.title": "العنوان"',
    '"vt.active": "نشط"',
    '"vt.description": "الملاحظات"',
    '"vt.descriptionPlaceholder": "نص الملاحظات (اختياري)"',
    '"vt.errCodeRequired": "رمز نوع السند إلزامي؛ لا يمكن أن يكون فارغاً."',
    '"vt.errTitleRequired": "عنوان نوع السند إلزامي؛ لا يمكن أن يكون فارغاً."',
  ],
  hi: [
    '"vt.formTitle": "नया वाउचर प्रकार"',
    '"vt.formDesc": "कोड, शीर्षक, सक्रिय स्थिति और विवरण के साथ वाउचर प्रकार परिभाषित करें"',
    '"vt.listTitle": "वाउचर प्रकार सूची"',
    '"vt.code": "कोड"',
    '"vt.title": "शीर्षक"',
    '"vt.active": "सक्रिय"',
    '"vt.description": "विवरण"',
    '"vt.descriptionPlaceholder": "विवरण पाठ (वैकल्पिक)"',
    '"vt.errCodeRequired": "वाउचर प्रकार कोड आवश्यक है; कोड खाली नहीं हो सकता।"',
    '"vt.errTitleRequired": "वाउचर प्रकार शीर्षक आवश्यक है; शीर्षक खाली नहीं हो सकता।"',
  ],
  ps: [
    '"vt.formTitle": "نوی سند ډول"',
    '"vt.formDesc": "د کوډ، سرلیک، فعال حالت او توضیحاتو سره د سند ډول تعریف"',
    '"vt.listTitle": "د سند ډولونو لیست"',
    '"vt.code": "کوډ"',
    '"vt.title": "سرلیک"',
    '"vt.active": "فعال"',
    '"vt.description": "توضیحات"',
    '"vt.descriptionPlaceholder": "د توضیحاتو متن (اختیاري)"',
    '"vt.errCodeRequired": "د سند ډول کوډ لازم دی؛ کوډ نه شي تش وي."',
    '"vt.errTitleRequired": "د سند ډول سرلیک لازم دی؛ سرلیک نه شي تش وي."',
  ],
  ckb: [
    '"vt.formTitle": "جۆری سندی نوێ"',
    '"vt.formDesc": "پێناسەی جۆری سند بە کۆد، ناونیشان، دۆخی چالاک و وردەکاری"',
    '"vt.listTitle": "لیستی جۆرەکانی سند"',
    '"vt.code": "کۆد"',
    '"vt.title": "ناونیشان"',
    '"vt.active": "چالاک"',
    '"vt.description": "وردەکاری"',
    '"vt.descriptionPlaceholder": "دەقی وردەکاری (ئارەزوومەندانە)"',
    '"vt.errCodeRequired": "کۆدی جۆری سند پێویستە؛ ناتوانێت بەتاڵ بێت."',
    '"vt.errTitleRequired": "ناونیشانی جۆری سند پێویستە؛ ناتوانێت بەتاڵ بێت."',
  ],
  pt: [
    '"vt.formTitle": "Novo Tipo de Documento Contábil"',
    '"vt.formDesc": "Definir um tipo de documento contábil com código, título, estado ativo e descrição"',
    '"vt.listTitle": "Lista de Tipos de Documento Contábil"',
    '"vt.code": "Código"',
    '"vt.title": "Título"',
    '"vt.active": "Ativo"',
    '"vt.description": "Descrição"',
    '"vt.descriptionPlaceholder": "Texto da descrição (opcional)"',
    '"vt.errCodeRequired": "O código do tipo de documento contábil é obrigatório; não pode ficar vazio."',
    '"vt.errTitleRequired": "O título do tipo de documento contábil é obrigatório; não pode ficar vazio."',
  ],
  ko: [
    '"vt.formTitle": "새 전표 유형"',
    '"vt.formDesc": "코드, 제목, 활성 상태 및 설명으로 전표 유형을 정의합니다"',
    '"vt.listTitle": "전표 유형 목록"',
    '"vt.code": "코드"',
    '"vt.title": "제목"',
    '"vt.active": "활성"',
    '"vt.description": "설명"',
    '"vt.descriptionPlaceholder": "설명 텍스트 (선택 사항)"',
    '"vt.errCodeRequired": "전표 유형 코드는 필수입니다; 비워둘 수 없습니다."',
    '"vt.errTitleRequired": "전표 유형 제목은 필수입니다; 비워둘 수 없습니다."',
  ],
  fr: [
    '"vt.formTitle": "Nouveau type de pièce"',
    '"vt.formDesc": "Définir un type de pièce avec code, titre, état actif et description"',
    '"vt.listTitle": "Liste des types de pièce"',
    '"vt.code": "Code"',
    '"vt.title": "Titre"',
    '"vt.active": "Actif"',
    '"vt.description": "Description"',
    '"vt.descriptionPlaceholder": "Texte de description (facultatif)"',
    '"vt.errCodeRequired": "Le code du type de pièce est requis ; il ne peut pas être vide."',
    '"vt.errTitleRequired": "Le titre du type de pièce est requis ; il ne peut pas être vide."',
  ],
  zh: [
    '"vt.formTitle": "新建凭证类型"',
    '"vt.formDesc": "通过代码、标题、启用状态和说明定义凭证类型"',
    '"vt.listTitle": "凭证类型列表"',
    '"vt.code": "代码"',
    '"vt.title": "标题"',
    '"vt.active": "启用"',
    '"vt.description": "说明"',
    '"vt.descriptionPlaceholder": "说明文字（可选）"',
    '"vt.errCodeRequired": "凭证类型代码为必填项；不能为空。"',
    '"vt.errTitleRequired": "凭证类型标题为必填项；不能为空。"',
  ],
  de: [
    '"vt.formTitle": "Neuer Belegtyp"',
    '"vt.formDesc": "Belegtyp mit Code, Titel, Aktiv-Status und Beschreibung definieren"',
    '"vt.listTitle": "Belegtypen-Liste"',
    '"vt.code": "Code"',
    '"vt.title": "Titel"',
    '"vt.active": "Aktiv"',
    '"vt.description": "Beschreibung"',
    '"vt.descriptionPlaceholder": "Beschreibungstext (optional)"',
    '"vt.errCodeRequired": "Der Code des Belegtyps ist erforderlich; er darf nicht leer sein."',
    '"vt.errTitleRequired": "Der Titel des Belegtyps ist erforderlich; er darf nicht leer sein."',
  ],
  ru: [
    '"vt.formTitle": "Новый тип документа"',
    '"vt.formDesc": "Определение типа документа с кодом, названием, флагом активности и описанием"',
    '"vt.listTitle": "Список типов документов"',
    '"vt.code": "Код"',
    '"vt.title": "Название"',
    '"vt.active": "Активен"',
    '"vt.description": "Описание"',
    '"vt.descriptionPlaceholder": "Текст описания (необязательно)"',
    '"vt.errCodeRequired": "Код типа документа обязателен; он не может быть пустым."',
    '"vt.errTitleRequired": "Название типа документа обязательно; оно не может быть пустым."',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = [
  "vt.formTitle",
  "vt.formDesc",
  "vt.listTitle",
  "vt.code",
  "vt.title",
  "vt.active",
  "vt.description",
  "vt.descriptionPlaceholder",
  "vt.errCodeRequired",
  "vt.errTitleRequired",
];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۱۰ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"dt.errTitleRequired"')) anchors.push(i);
}
if (anchors.length !== 13) {
  console.error(`FATAL: expected 13 anchors, found ${anchors.length}`);
  process.exit(1);
}
for (let k = anchors.length - 1; k >= 0; k--) {
  const locale = ORDER[k];
  const block = NEW_KEYS_BY_LOCALE[locale].map((s) => "  " + s + ",");
  lines.splice(anchors[k] + 1, 0, ...block);
  console.log(`inserted ${block.length} keys after anchor#${k} (${locale})`);
}

const out = lines.join("\n");
/* خودآزما — هر کلید دقیقاً ×۱۳ */
let failed = false;
for (const key of KEYS) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    failed = true;
  } else {
    console.log(`ok: ${key} ×${n}`);
  }
}
if (failed) process.exit(1);
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
