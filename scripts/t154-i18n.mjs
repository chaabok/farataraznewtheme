#!/usr/bin/env node
/* Task 154 — فرم «تفصیلی سایر» در زیرمنوی «اطلاعات تفصیلی ها» (درخواست مالک):
   «یک فرم جدید در زیرمنوی اطلاعات تفصیلی ها در نرم افزار حسابداری اضافه کنید
   بنام تفصیلی سایر و فیلدهای زیر را در آن قرار دهید: 1-کدتفصیل 2-عنوان
   3-فعال که بصورت پیش فرض تیک داشته باشد.»
   درج ۱۱ کلید تازهٔ do.* بعد از Anchor خط "vt.errTitleRequired" در هر ۱۳
   بلاک زبانی — واژگان = سبک واژگان di.* همان زبان (تفصیل/detail/detay/
   التفصيل/विवरण/تفصیل/وردەکاری/detalhe/상세/détail/明细/Detail/аналитика).
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"do.formTitle": "تفصیلی سایر"',
    '"do.formDesc": "ثبت تفصیلی‌های نوع سایر با کد تفصیل، عنوان و فعال"',
    '"do.listTitle": "فهرست تفصیلی‌های سایر"',
    '"do.code": "کد تفصیل"',
    '"do.title": "عنوان"',
    '"do.active": "فعال"',
    '"do.autoCodeHint": "کد تفصیل به‌صورت خودکار از بازهٔ شماره‌گذاری نوع «سایر» پیشنهاد می‌شود؛ سرور مرجع نهایی تخصیص است."',
    '"do.manualCodeHint": "شماره‌گذاری نوع «سایر» دستی است؛ کد تفصیل را در بازهٔ تعیین‌شده وارد کنید."',
    '"do.typeMissing": "نوع تفصیل «سایر» در دسترس نیست؛ پس از بازخوانی دوباره تلاش کنید."',
    '"do.errCodeRequired": "ثبت کد تفصیل الزامی است؛ کد نمی‌تواند خالی باشد."',
    '"do.errTitleRequired": "ثبت عنوان تفصیلی الزامی است؛ عنوان نمی‌تواند خالی باشد."',
  ],
  en: [
    '"do.formTitle": "Other Detail"',
    '"do.formDesc": "Record Other-type details with detail code, title and active flag"',
    '"do.listTitle": "Other Details List"',
    '"do.code": "Detail Code"',
    '"do.title": "Title"',
    '"do.active": "Active"',
    '"do.autoCodeHint": "The detail code is suggested automatically from the numbering range of the Other type; the server is the final authority for assignment."',
    '"do.manualCodeHint": "Numbering of the Other type is manual; enter the detail code within the defined range."',
    '"do.typeMissing": "The Other detail type is unavailable; please try again after a refresh."',
    '"do.errCodeRequired": "Detail code is required; the code cannot be empty."',
    '"do.errTitleRequired": "Detail title is required; the title cannot be empty."',
  ],
  tr: [
    '"do.formTitle": "Diğer Detay"',
    '"do.formDesc": "Diğer tür detayları detay kodu, başlık ve aktif durumuyla kaydedin"',
    '"do.listTitle": "Diğer Detaylar Listesi"',
    '"do.code": "Detay Kodu"',
    '"do.title": "Başlık"',
    '"do.active": "Aktif"',
    '"do.autoCodeHint": "Detay kodu, Diğer türünün numara aralığından otomatik önerilir; atamanın nihai mercii sunucudur."',
    '"do.manualCodeHint": "Diğer türünün numaralandırması elle yapılır; detay kodunu tanımlı aralıkta girin."',
    '"do.typeMissing": "Diğer detay türü kullanılamıyor; lütfen yeniledikten sonra tekrar deneyin."',
    '"do.errCodeRequired": "Detay kodu zorunludur; kod boş olamaz."',
    '"do.errTitleRequired": "Detay başlığı zorunludur; başlık boş olamaz."',
  ],
  ar: [
    '"do.formTitle": "تفصيلي أخرى"',
    '"do.formDesc": "تسجيل التفصيليات من نوع «أخرى» برمز التفصيل والعنوان وحالة التنشيط"',
    '"do.listTitle": "قائمة التفصيليات الأخرى"',
    '"do.code": "رمز التفصيل"',
    '"do.title": "العنوان"',
    '"do.active": "نشط"',
    '"do.autoCodeHint": "يُقترح رمز التفصيل تلقائياً من مدى ترقيم نوع «أخرى»؛ الخادم هو المرجع النهائي للتخصيص."',
    '"do.manualCodeHint": "ترقيم نوع «أخرى» يدوي؛ أدخل رمز التفصيل ضمن المدى المحدد."',
    '"do.typeMissing": "نوع التفصيل «أخرى» غير متاح؛ يُرجى المحاولة بعد التحديث."',
    '"do.errCodeRequired": "رمز التفصيل إلزامي؛ لا يمكن أن يكون فارغاً."',
    '"do.errTitleRequired": "عنوان التفصيل إلزامي؛ لا يمكن أن يكون فارغاً."',
  ],
  hi: [
    '"do.formTitle": "अन्य विवरण"',
    '"do.formDesc": "अन्य प्रकार के विवरण विवरण कोड, शीर्षक और सक्रिय स्थिति के साथ दर्ज करें"',
    '"do.listTitle": "अन्य विवरण सूची"',
    '"do.code": "विवरण कोड"',
    '"do.title": "शीर्षक"',
    '"do.active": "सक्रिय"',
    '"do.autoCodeHint": "विवरण कोड «अन्य» प्रकार की नंबरिंग सीमा से स्वतः सुझाया जाता है; आवंटन का अंतिम निर्णायक सर्वर है।"',
    '"do.manualCodeHint": "«अन्य» प्रकार की नंबरिंग मैन्युअल है; विवरण कोड निर्धारित सीमा में दर्ज करें।"',
    '"do.typeMissing": "«अन्य» विवरण प्रकार उपलब्ध नहीं है; कृपया रिफ्रेश के बाद पुनः प्रयास करें।"',
    '"do.errCodeRequired": "विवरण कोड आवश्यक है; कोड खाली नहीं हो सकता।"',
    '"do.errTitleRequired": "विवरण शीर्षक आवश्यक है; शीर्षक खाली नहीं हो सकता।"',
  ],
  ps: [
    '"do.formTitle": "نور تفصیل"',
    '"do.formDesc": "د «نور» ډول تفصیلونه د تفصیل کوډ، سرلیک او فعال حالت سره ثبتول"',
    '"do.listTitle": "د نورو تفصیلونو لیست"',
    '"do.code": "د تفصیل کوډ"',
    '"do.title": "سرلیک"',
    '"do.active": "فعال"',
    '"do.autoCodeHint": "د تفصیل کوډ د «نور» ډول له شمېرېږ بریده اتوماتيک وړاندیز کېږي؛ نهایي پرېکړه کوونکی سرور دی."',
    '"do.manualCodeHint": "د «نور» ډول شمېرېږ لاسي دی؛ د تفصیل کوډ په ټاکلې بریده وليکئ."',
    '"do.typeMissing": "د «نور» تفصیل ډول نه لرل کېږي؛ له تازه کولو وروسته بیا هڅه وکړئ."',
    '"do.errCodeRequired": "د تفصیل کوډ لازم دی؛ کوډ نه شي تش وي."',
    '"do.errTitleRequired": "د تفصیل سرلیک لازم دی؛ سرلیک نه شي تش وي."',
  ],
  ckb: [
    '"do.formTitle": "وردەکاری تر"',
    '"do.formDesc": "تۆمارکردنی وردەکارییەکانی جۆری «تر» بە کۆدی وردەکاری، ناونیشان و چالاک"',
    '"do.listTitle": "لیستی وردەکارییەکانی تر"',
    '"do.code": "کۆدی وردەکاری"',
    '"do.title": "ناونیشان"',
    '"do.active": "چالاک"',
    '"do.autoCodeHint": "کۆدی وردەکاری بە شێوەی خۆکار لە مەرجی ژمارەبەندی جۆری «تر» پێشنیار دەکرێت؛ دەسەڵاتی کۆتایی سێرڤەرە."',
    '"do.manualCodeHint": "ژمارەبەندی جۆری «تر» دەستکردە؛ کۆدی وردەکاری لە مەرجە دیاریکراوەکە بنووسە."',
    '"do.typeMissing": "جۆری وردەکاری «تر» بەردەست نییە؛ تکایە دوای نوێکردنەوە دووبارە هەوڵ بدە."',
    '"do.errCodeRequired": "کۆدی وردەکاری پێویستە؛ ناتوانێت بەتاڵ بێت."',
    '"do.errTitleRequired": "ناونیشانی وردەکاری پێویستە؛ ناتوانێت بەتاڵ بێت."',
  ],
  pt: [
    '"do.formTitle": "Detalhe Outro"',
    '"do.formDesc": "Registrar detalhes do tipo Outro com código do detalhe, título e estado ativo"',
    '"do.listTitle": "Lista de Detalhes Outro"',
    '"do.code": "Código do Detalhe"',
    '"do.title": "Título"',
    '"do.active": "Ativo"',
    '"do.autoCodeHint": "O código do detalhe é sugerido automaticamente a partir da faixa de numeração do tipo Outro; o servidor é a autoridade final de atribuição."',
    '"do.manualCodeHint": "A numeração do tipo Outro é manual; insira o código do detalhe dentro da faixa definida."',
    '"do.typeMissing": "O tipo de detalhe Outro está indisponível; tente novamente após atualizar."',
    '"do.errCodeRequired": "O código do detalhe é obrigatório; não pode ficar vazio."',
    '"do.errTitleRequired": "O título do detalhe é obrigatório; não pode ficar vazio."',
  ],
  ko: [
    '"do.formTitle": "기타 상세"',
    '"do.formDesc": "기타 유형의 상세를 상세 코드, 제목, 활성 상태로 기록합니다"',
    '"do.listTitle": "기타 상세 목록"',
    '"do.code": "상세 코드"',
    '"do.title": "제목"',
    '"do.active": "활성"',
    '"do.autoCodeHint": "상세 코드는 기타 유형의 번호 범위에서 자동으로 제안됩니다; 최종 할당 권한은 서버에 있습니다."',
    '"do.manualCodeHint": "기타 유형의 번호 지정은 수동입니다; 정의된 범위 내에서 상세 코드를 입력하세요."',
    '"do.typeMissing": "기타 상세 유형을 사용할 수 없습니다; 새로 고침 후 다시 시도하세요."',
    '"do.errCodeRequired": "상세 코드는 필수입니다; 비워둘 수 없습니다."',
    '"do.errTitleRequired": "상세 제목은 필수입니다; 비워둘 수 없습니다."',
  ],
  fr: [
    '"do.formTitle": "Détail Autre"',
    '"do.formDesc": "Enregistrer les détails de type Autre avec code, titre et état actif"',
    '"do.listTitle": "Liste des détails Autre"',
    '"do.code": "Code du détail"',
    '"do.title": "Titre"',
    '"do.active": "Actif"',
    '"do.autoCodeHint": "Le code du détail est proposé automatiquement à partir de la plage de numérotation du type Autre ; le serveur est l\'autorité finale d\'attribution."',
    '"do.manualCodeHint": "La numérotation du type Autre est manuelle ; saisissez le code du détail dans la plage définie."',
    '"do.typeMissing": "Le type de détail Autre est indisponible ; réessayez après actualisation."',
    '"do.errCodeRequired": "Le code du détail est requis ; il ne peut pas être vide."',
    '"do.errTitleRequired": "Le titre du détail est requis ; il ne peut pas être vide."',
  ],
  zh: [
    '"do.formTitle": "其他明细"',
    '"do.formDesc": "通过明细代码、标题和启用状态登记其他类型的明细"',
    '"do.listTitle": "其他明细列表"',
    '"do.code": "明细代码"',
    '"do.title": "标题"',
    '"do.active": "启用"',
    '"do.autoCodeHint": "明细代码将自动从「其他」类型的编号区间中建议；最终分配以服务器为准。"',
    '"do.manualCodeHint": "「其他」类型的编号为手动；请在定义的区间内输入明细代码。"',
    '"do.typeMissing": "「其他」明细类型不可用；刷新后请重试。"',
    '"do.errCodeRequired": "明细代码必填；不能为空。"',
    '"do.errTitleRequired": "明细标题必填；不能为空。"',
  ],
  de: [
    '"do.formTitle": "Sonstiges Detail"',
    '"do.formDesc": "Details des Typs Sonstiges mit Detail-Code, Titel und Aktiv-Status erfassen"',
    '"do.listTitle": "Liste der Sonstigen Details"',
    '"do.code": "Detail-Code"',
    '"do.title": "Titel"',
    '"do.active": "Aktiv"',
    '"do.autoCodeHint": "Der Detail-Code wird automatisch aus dem Nummerierungsbereich des Typs Sonstiges vorgeschlagen; die endgültige Zuweisung erfolgt durch den Server."',
    '"do.manualCodeHint": "Die Nummerierung des Typs Sonstiges ist manuell; geben Sie den Detail-Code innerhalb des definierten Bereichs ein."',
    '"do.typeMissing": "Der Detailtyp Sonstiges ist nicht verfügbar; bitte nach dem Aktualisieren erneut versuchen."',
    '"do.errCodeRequired": "Der Detail-Code ist erforderlich; er darf nicht leer sein."',
    '"do.errTitleRequired": "Der Detail-Titel ist erforderlich; er darf nicht leer sein."',
  ],
  ru: [
    '"do.formTitle": "Прочая аналитика"',
    '"do.formDesc": "Регистрация аналитик типа «Прочее» с кодом, названием и флагом активности"',
    '"do.listTitle": "Список прочих аналитик"',
    '"do.code": "Код аналитики"',
    '"do.title": "Название"',
    '"do.active": "Активен"',
    '"do.autoCodeHint": "Код аналитики предлагается автоматически из диапазона нумерации типа «Прочее»; окончательное присвоение — за сервером."',
    '"do.manualCodeHint": "Нумерация типа «Прочее» ручная; введите код аналитики в заданном диапазоне."',
    '"do.typeMissing": "Тип аналитики «Прочее» недоступен; повторите попытку после обновления."',
    '"do.errCodeRequired": "Код аналитики обязателен; он не может быть пустым."',
    '"do.errTitleRequired": "Название аналитики обязательно; оно не может быть пустым."',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = [
  "do.formTitle",
  "do.formDesc",
  "do.listTitle",
  "do.code",
  "do.title",
  "do.active",
  "do.autoCodeHint",
  "do.manualCodeHint",
  "do.typeMissing",
  "do.errCodeRequired",
  "do.errTitleRequired",
];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۱۱ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"vt.errTitleRequired"')) anchors.push(i);
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
