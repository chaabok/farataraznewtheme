#!/usr/bin/env node
/* Task 144 — فرم «ایجاد تفصیلی ها» (زیرمنوی اطلاعات پایهٔ حسابداری):
   درج ۱۵ کلید تازهٔ di.* بعد از Anchor خط "dtn.unsavedNote" در هر ۱۳ بلاک زبانی.
   واژگان = عین کلیدهای dt و dtn همان زبان (تفصیل/تفصیلی، Detail، Detay، وردەکاری، …).
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"di.formTitle": "ایجاد تفصیلی ها"',
    '"di.formDesc": "ایجاد تفصیلی برای هر نوع تفصیل با کد خودکار از شماره‌گذاری، عنوان، فعال است و توضیحات"',
    '"di.type": "نوع تفصیل"',
    '"di.code": "کد تفصیلی"',
    '"di.title": "عنوان تفصیلی"',
    '"di.active": "فعال است"',
    '"di.description": "توضیحات"',
    '"di.descriptionPlaceholder": "متن توضیحات (اختیاری)"',
    '"di.listTitle": "فهرست تفصیلی ها"',
    '"di.typeRequired": "انتخاب نوع تفصیل الزامی است."',
    '"di.errCodeRequired": "ثبت کد تفصیلی الزامی است؛ کد نمی‌تواند خالی باشد."',
    '"di.errTitleRequired": "ثبت عنوان تفصیلی الزامی است؛ عنوان نمی‌تواند خالی باشد."',
    '"di.autoCodeHint": "کد به‌صورت خودکار از بازهٔ شماره‌گذاری این نوع تفصیل تخصیص می‌یابد."',
    '"di.manualCodeHint": "شماره‌گذاری این نوع تفصیل دستی است؛ کد را در بازهٔ تعیین‌شده وارد کنید."',
    '"di.noTypeHint": "نخست با فرم «نوع تفصیل جدید» یک نوع تفصیل بسازید."',
  ],
  en: [
    '"di.formTitle": "Create Details"',
    '"di.formDesc": "Create detail entries per detail type with auto numbering code, title, active flag and description"',
    '"di.type": "Detail Type"',
    '"di.code": "Detail Code"',
    '"di.title": "Detail Title"',
    '"di.active": "Active"',
    '"di.description": "Description"',
    '"di.descriptionPlaceholder": "Description text (optional)"',
    '"di.listTitle": "Details List"',
    '"di.typeRequired": "Selecting a detail type is required."',
    '"di.errCodeRequired": "Detail code is required; the code cannot be empty."',
    '"di.errTitleRequired": "Detail title is required; the title cannot be empty."',
    '"di.autoCodeHint": "The code is assigned automatically from this detail type’s numbering range."',
    '"di.manualCodeHint": "Numbering for this detail type is manual; enter the code within the defined range."',
    '"di.noTypeHint": "First create a detail type in the “New Detail Type” form."',
  ],
  tr: [
    '"di.formTitle": "Detay Oluşturma"',
    '"di.formDesc": "Her detay türü için numaralandırmadan otomatik kod, başlık, aktif durumu ve açıklama ile detay kaydı oluşturun"',
    '"di.type": "Detay Türü"',
    '"di.code": "Detay Kodu"',
    '"di.title": "Detay Başlığı"',
    '"di.active": "Aktif"',
    '"di.description": "Açıklama"',
    '"di.descriptionPlaceholder": "Açıklama metni (isteğe bağlı)"',
    '"di.listTitle": "Detay Listesi"',
    '"di.typeRequired": "Detay türü seçmek zorunludur."',
    '"di.errCodeRequired": "Detay kodu zorunludur; kod boş olamaz."',
    '"di.errTitleRequired": "Detay başlığı zorunludur; başlık boş olamaz."',
    '"di.autoCodeHint": "Kod, bu detay türünün numara aralığından otomatik atanır."',
    '"di.manualCodeHint": "Bu detay türü için numaralandırma elle yapılır; kodu tanımlı aralıkta girin."',
    '"di.noTypeHint": "Önce “Yeni Detay Türü” formunda bir detay türü oluşturun."',
  ],
  ar: [
    '"di.formTitle": "إنشاء التفصيليات"',
    '"di.formDesc": "إنشاء تفصيل لكل نوع تفصيل برمز تلقائي من الترقيم والعنوان وحالة التنشيط والملاحظات"',
    '"di.type": "نوع التفصيل"',
    '"di.code": "رمز التفصيل"',
    '"di.title": "عنوان التفصيل"',
    '"di.active": "نشط"',
    '"di.description": "الملاحظات"',
    '"di.descriptionPlaceholder": "نص الملاحظات (اختياري)"',
    '"di.listTitle": "قائمة التفصيليات"',
    '"di.typeRequired": "اختيار نوع التفصيل إلزامي."',
    '"di.errCodeRequired": "رمز التفصيل إلزامي؛ لا يمكن أن يكون فارغاً."',
    '"di.errTitleRequired": "عنوان التفصيل إلزامي؛ لا يمكن أن يكون فارغاً."',
    '"di.autoCodeHint": "يُخصص الرمز تلقائياً من مدى ترقيم نوع التفصيل هذا."',
    '"di.manualCodeHint": "الترقيم لنوع التفصيل هذا يدوي؛ أدخل الرمز ضمن المدى المحدد."',
    '"di.noTypeHint": "أنشئ أولاً نوع تفصيل في نموذج «نوع تفصيل جديد»."',
  ],
  hi: [
    '"di.formTitle": "विवरण बनाएँ"',
    '"di.formDesc": "प्रत्येक विवरण प्रकार के लिए नंबरिंग से स्वतः कोड, शीर्षक, सक्रिय स्थिति और विवरण के साथ विवरण प्रविष्टि बनाएँ"',
    '"di.type": "विवरण प्रकार"',
    '"di.code": "विवरण कोड"',
    '"di.title": "विवरण शीर्षक"',
    '"di.active": "सक्रिय"',
    '"di.description": "विवरण"',
    '"di.descriptionPlaceholder": "विवरण पाठ (वैकल्पिक)"',
    '"di.listTitle": "विवरण सूची"',
    '"di.typeRequired": "विवरण प्रकार चुनना आवश्यक है।"',
    '"di.errCodeRequired": "विवरण कोड आवश्यक है; कोड खाली नहीं हो सकता।"',
    '"di.errTitleRequired": "विवरण शीर्षक आवश्यक है; शीर्षक खाली नहीं हो सकता।"',
    '"di.autoCodeHint": "कोड इस विवरण प्रकार की नंबरिंग सीमा से स्वतः आवंटित होता है।"',
    '"di.manualCodeHint": "इस विवरण प्रकार के लिए नंबरिंग मैनुअल है; परिभाषित सीमा में कोड दर्ज करें।"',
    '"di.noTypeHint": "पहले “नया विवरण प्रकार” फ़ॉर्म में एक विवरण प्रकार बनाएँ।"',
  ],
  ps: [
    '"di.formTitle": "تفصیلي جوړول"',
    '"di.formDesc": "د هر تفصيلي ډول لپاره د شمېرېږ نه د اتوماتيک کوډ، سرلیک، فعال حالت او توضیحاتو سره تفصیلي جوړول"',
    '"di.type": "تفصیلي ډول"',
    '"di.code": "د تفصیلي کوډ"',
    '"di.title": "د تفصيلي سرلیک"',
    '"di.active": "فعال"',
    '"di.description": "توضیحات"',
    '"di.descriptionPlaceholder": "د توضیحاتو متن (اختیاري)"',
    '"di.listTitle": "د تفصیلي لیست"',
    '"di.typeRequired": "د تفصيلي ډول ټاکل لازم دی."',
    '"di.errCodeRequired": "د تفصيلي کوډ لازم دی؛ کوډ نه شي تش وي."',
    '"di.errTitleRequired": "د تفصيلي سرلیک لازم دی؛ سرلیک نه شي تش وي."',
    '"di.autoCodeHint": "کوډ د دې تفصيلي ډول له شمېرېږ بریده اتوماتيک ټاکل کېږي."',
    '"di.manualCodeHint": "د دې تفصيلي ډول شمېرېږ لاسي دی؛ کوډ په ټاکلې برید کې ولیکئ."',
    '"di.noTypeHint": "لومړی په «نوی تفصیلي ډول» فورم کې یو تفصیلي ډول جوړ کړئ."',
  ],
  ckb: [
    '"di.formTitle": "دروستکردنی وردەکارییەکان"',
    '"di.formDesc": "دروستکردنی وردەکاری بۆ هەر جۆرێکی وردەکاری بە کۆدی خۆکار لە ژمارەبەندی، ناونیشان، دۆخی چالاک و وردەکاری"',
    '"di.type": "جۆری وردەکاری"',
    '"di.code": "کۆدی وردەکاری"',
    '"di.title": "ناونیشانی وردەکاری"',
    '"di.active": "چالاک"',
    '"di.description": "وردەکاری"',
    '"di.descriptionPlaceholder": "دەقی وردەکاری (ئارەزوومەندانە)"',
    '"di.listTitle": "لیستی وردەکارییەکان"',
    '"di.typeRequired": "هەڵبژاردنی جۆری وردەکاری پێویستە."',
    '"di.errCodeRequired": "کۆدی وردەکاری پێویستە؛ ناتوانێت بەتاڵ بێت."',
    '"di.errTitleRequired": "ناونیشانی وردەکاری پێویستە؛ ناتوانێت بەتاڵ بێت."',
    '"di.autoCodeHint": "کۆد بە شێوەی خۆکار لە مەرجی ژمارەبەندی ئەم جۆرە وردەکارییە دەخرێت."',
    '"di.manualCodeHint": "ژمارەبەندی ئەم جۆرە وردەکارییە دەستییە؛ کۆد لە مەرجی دیاریکراو دابنێ."',
    '"di.noTypeHint": "سەرەتا لە فۆرمی «جۆری وردەکاری نوێ» جۆرێکی وردەکاری دروست بکە."',
  ],
  pt: [
    '"di.formTitle": "Criar Detalhes"',
    '"di.formDesc": "Criar detalhes para cada tipo de detalhe com código automático da numeração, título, estado ativo e descrição"',
    '"di.type": "Tipo de Detalhe"',
    '"di.code": "Código do Detalhe"',
    '"di.title": "Título do Detalhe"',
    '"di.active": "Ativo"',
    '"di.description": "Descrição"',
    '"di.descriptionPlaceholder": "Texto da descrição (opcional)"',
    '"di.listTitle": "Lista de Detalhes"',
    '"di.typeRequired": "É obrigatório selecionar um tipo de detalhe."',
    '"di.errCodeRequired": "O código do detalhe é obrigatório; não pode ficar vazio."',
    '"di.errTitleRequired": "O título do detalhe é obrigatório; não pode ficar vazio."',
    '"di.autoCodeHint": "O código é atribuído automaticamente a partir da faixa de numeração deste tipo de detalhe."',
    '"di.manualCodeHint": "A numeração deste tipo de detalhe é manual; insira o código dentro da faixa definida."',
    '"di.noTypeHint": "Primeiro crie um tipo de detalhe no formulário “Novo Tipo de Detalhe”."',
  ],
  ko: [
    '"di.formTitle": "상세 생성"',
    '"di.formDesc": "자동 번호 코드, 제목, 활성 상태 및 설명으로 각 상세 유형별 상세 항목을 생성합니다"',
    '"di.type": "상세 유형"',
    '"di.code": "상세 코드"',
    '"di.title": "상세 제목"',
    '"di.active": "활성"',
    '"di.description": "설명"',
    '"di.descriptionPlaceholder": "설명 텍스트 (선택 사항)"',
    '"di.listTitle": "상세 목록"',
    '"di.typeRequired": "상세 유형을 선택해야 합니다."',
    '"di.errCodeRequired": "상세 코드는 필수입니다; 비워둘 수 없습니다."',
    '"di.errTitleRequired": "상세 제목은 필수입니다; 비워둘 수 없습니다."',
    '"di.autoCodeHint": "코드는 이 상세 유형의 번호 범위에서 자동으로 할당됩니다."',
    '"di.manualCodeHint": "이 상세 유형의 번호 지정은 수동입니다. 정의된 범위 내에서 코드를 입력하세요."',
    '"di.noTypeHint": "먼저 “새 상세 유형” 양식에서 상세 유형을 만드세요."',
  ],
  fr: [
    '"di.formTitle": "Création des détails"',
    '"di.formDesc": "Créer des détails pour chaque type de détail avec code automatique de la numérotation, titre, état actif et description"',
    '"di.type": "Type de détail"',
    '"di.code": "Code du détail"',
    '"di.title": "Titre du détail"',
    '"di.active": "Actif"',
    '"di.description": "Description"',
    '"di.descriptionPlaceholder": "Texte de description (facultatif)"',
    '"di.listTitle": "Liste des détails"',
    '"di.typeRequired": "La sélection d’un type de détail est obligatoire."',
    '"di.errCodeRequired": "Le code du détail est requis ; il ne peut pas être vide."',
    '"di.errTitleRequired": "Le titre du détail est requis ; il ne peut pas être vide."',
    '"di.autoCodeHint": "Le code est attribué automatiquement à partir de la plage de numérotation de ce type de détail."',
    '"di.manualCodeHint": "La numérotation de ce type de détail est manuelle ; saisissez le code dans la plage définie."',
    '"di.noTypeHint": "Créez d’abord un type de détail dans le formulaire « Nouveau type de détail »."',
  ],
  zh: [
    '"di.formTitle": "创建明细"',
    '"di.formDesc": "为每个明细类型创建明细，含编号自动分配的代码、标题、启用状态和说明"',
    '"di.type": "明细类型"',
    '"di.code": "明细代码"',
    '"di.title": "明细标题"',
    '"di.active": "启用"',
    '"di.description": "说明"',
    '"di.descriptionPlaceholder": "说明文本（可选）"',
    '"di.listTitle": "明细列表"',
    '"di.typeRequired": "必须选择明细类型。"',
    '"di.errCodeRequired": "明细代码必填；不能为空。"',
    '"di.errTitleRequired": "明细标题必填；不能为空。"',
    '"di.autoCodeHint": "代码将从此明细类型的编号区间自动分配。"',
    '"di.manualCodeHint": "该明细类型的编号为手动；请在定义的区间内输入代码。"',
    '"di.noTypeHint": "请先在“新建明细类型”表单中创建明细类型。"',
  ],
  de: [
    '"di.formTitle": "Details anlegen"',
    '"di.formDesc": "Details pro Detailtyp mit automatischem Code aus der Nummerierung, Titel, Aktiv-Status und Beschreibung anlegen"',
    '"di.type": "Detailtyp"',
    '"di.code": "Detail-Code"',
    '"di.title": "Detail-Titel"',
    '"di.active": "Aktiv"',
    '"di.description": "Beschreibung"',
    '"di.descriptionPlaceholder": "Beschreibungstext (optional)"',
    '"di.listTitle": "Detail-Liste"',
    '"di.typeRequired": "Die Auswahl eines Detailtyps ist erforderlich."',
    '"di.errCodeRequired": "Der Detail-Code ist erforderlich; er darf nicht leer sein."',
    '"di.errTitleRequired": "Der Detail-Titel ist erforderlich; er darf nicht leer sein."',
    '"di.autoCodeHint": "Der Code wird automatisch aus dem Nummerierungsbereich dieses Detailtyps zugewiesen."',
    '"di.manualCodeHint": "Die Nummerierung dieses Detailtyps ist manuell; geben Sie den Code im definierten Bereich ein."',
    '"di.noTypeHint": "Erstellen Sie zuerst im Formular „Neuer Detailtyp“ einen Detailtyp."',
  ],
  ru: [
    '"di.formTitle": "Создание аналитик"',
    '"di.formDesc": "Создание аналитик для каждого типа с автоматическим кодом из нумерации, названием, флагом активности и описанием"',
    '"di.type": "Тип аналитики"',
    '"di.code": "Код аналитики"',
    '"di.title": "Название аналитики"',
    '"di.active": "Активен"',
    '"di.description": "Описание"',
    '"di.descriptionPlaceholder": "Текст описания (необязательно)"',
    '"di.listTitle": "Список аналитик"',
    '"di.typeRequired": "Необходимо выбрать тип аналитики."',
    '"di.errCodeRequired": "Код аналитики обязателен; он не может быть пустым."',
    '"di.errTitleRequired": "Название аналитики обязательно; оно не может быть пустым."',
    '"di.autoCodeHint": "Код присваивается автоматически из диапазона нумерации этого типа аналитики."',
    '"di.manualCodeHint": "Нумерация для этого типа аналитики выполняется вручную; введите код в заданном диапазоне."',
    '"di.noTypeHint": "Сначала создайте тип аналитики в форме «Новый тип аналитики»."',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = [
  "di.formTitle",
  "di.formDesc",
  "di.type",
  "di.code",
  "di.title",
  "di.active",
  "di.description",
  "di.descriptionPlaceholder",
  "di.listTitle",
  "di.typeRequired",
  "di.errCodeRequired",
  "di.errTitleRequired",
  "di.autoCodeHint",
  "di.manualCodeHint",
  "di.noTypeHint",
];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۱۵ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"dtn.unsavedNote"')) anchors.push(i);
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
for (const key of KEYS) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    process.exit(1);
  }
  console.log(`ok: ${key} ×${n}`);
}
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
