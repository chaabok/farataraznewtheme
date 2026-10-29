#!/usr/bin/env node
/* Task 147 — فرم «تعریف پروژه» در زیرمنوی «اطلاعات تفصیلی ها»:
   کد اجباری سریالی و پشت سرهم + عنوان اجباری + کد تفصیل اجباری (لایو ایجکس
   از متد اختصاصی تخصیص کد تفصیل با نوع تفصیل «پروژه» — کد مرجع ۸) +
   توضیحات اختیاری + فعال پیش‌فرض تیک.
   درج ۱۷ کلید تازهٔ pj.* بعد از Anchor خط "cc.listTitle" در هر ۱۳ بلاک
   زبانی — واژگان = عین واژگان cc.* همان زبان.
   پیام‌های اجباری دقیق مالک (fa): «کد الزامی است» / «عنوان الزامی است» /
   «کد تفصیل الزامی است».
   خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"pj.formTitle": "تعریف پروژه"',
    '"pj.formDesc": "ایجاد پروژه با کد سریالی و کد تفصیل لایو از شماره‌گذاری تفصیلی (نوع پروژه)"',
    '"pj.code": "کد"',
    '"pj.title": "عنوان"',
    '"pj.detailCode": "کد تفصیل"',
    '"pj.description": "توضیحات"',
    '"pj.descriptionPlaceholder": "متن توضیحات (اختیاری)"',
    '"pj.active": "فعال"',
    '"pj.errCodeRequired": "کد الزامی است"',
    '"pj.errTitleRequired": "عنوان الزامی است"',
    '"pj.errDetailCodeRequired": "کد تفصیل الزامی است"',
    '"pj.serialCodeHint": "کد پروژه به‌صورت سریالی و پشت‌سرهم تخصیص می‌یابد؛ شمارهٔ بعدی به‌صورت لایو پیش‌پر شده است."',
    '"pj.autoCodeHint": "کد تفصیل به‌صورت لایو از بازهٔ شماره‌گذاری نوع تفصیل «پروژه» (شماره شروع تا شماره پایان) تخصیص می‌یابد."',
    '"pj.manualCodeHint": "شماره‌گذاری نوع تفصیل «پروژه» دستی است؛ کد تفصیل را درون بازهٔ تعیین‌شده وارد کنید."',
    '"pj.exhaustedHint": "بازهٔ شماره‌گذاری نوع تفصیل «پروژه» تکمیل شده است؛ در فرم شماره‌گذاری تفصیلی ها بازهٔ تازه تعیین کنید."',
    '"pj.noAllocationHint": "متد تخصیص کد تفصیل در دسترس نیست؛ کد تفصیل را دستی وارد کنید."',
    '"pj.listTitle": "فهرست پروژه ها"',
  ],
  en: [
    '"pj.formTitle": "Project Definition"',
    '"pj.formDesc": "Create a project with a serial code and a live detail code from detail numbering (project type)"',
    '"pj.code": "Code"',
    '"pj.title": "Title"',
    '"pj.detailCode": "Detail Code"',
    '"pj.description": "Description"',
    '"pj.descriptionPlaceholder": "Description text (optional)"',
    '"pj.active": "Active"',
    '"pj.errCodeRequired": "Code is required"',
    '"pj.errTitleRequired": "Title is required"',
    '"pj.errDetailCodeRequired": "Detail code is required"',
    '"pj.serialCodeHint": "The project code is assigned serially and consecutively; the next number is prefilled live."',
    '"pj.autoCodeHint": "The detail code is assigned live from the numbering range of the «Project» detail type (start number to end number)."',
    '"pj.manualCodeHint": "Numbering of the «Project» detail type is manual; enter the detail code within the defined range."',
    '"pj.exhaustedHint": "The numbering range of the «Project» detail type is exhausted; define a new range in the detail numbering form."',
    '"pj.noAllocationHint": "The detail code assignment service is unavailable; enter the detail code manually."',
    '"pj.listTitle": "Projects List"',
  ],
  tr: [
    '"pj.formTitle": "Proje Tanımı"',
    '"pj.formDesc": "Sıralı kod ve (proje türü) detay numaralandırmasından canlı detay kodu ile proje oluşturma"',
    '"pj.code": "Kod"',
    '"pj.title": "Başlık"',
    '"pj.detailCode": "Detay Kodu"',
    '"pj.description": "Açıklama"',
    '"pj.descriptionPlaceholder": "Açıklama metni (isteğe bağlı)"',
    '"pj.active": "Etkin"',
    '"pj.errCodeRequired": "Kod zorunludur"',
    '"pj.errTitleRequired": "Başlık zorunludur"',
    '"pj.errDetailCodeRequired": "Detay kodu zorunludur"',
    '"pj.serialCodeHint": "Proje kodu sıralı ve art arda atanır; sonraki numara canlı olarak önceden doldurulur."',
    '"pj.autoCodeHint": "Detay kodu, «Proje» detay türünün numaralandırma aralığından (başlangıç-numaradan bitiş-numarasına) canlı olarak atanır."',
    '"pj.manualCodeHint": "«Proje» detay türünün numaralandırması manuelseldir; detay kodunu tanımlı aralık içinde girin."',
    '"pj.exhaustedHint": "«Proje» detay türünün numaralandırma aralığı tükenmiştir; detay numaralandırma formunda yeni bir aralık tanımlayın."',
    '"pj.noAllocationHint": "Detay kodu atama servisi kullanılamıyor; detay kodunu elle girin."',
    '"pj.listTitle": "Projeler Listesi"',
  ],
  ar: [
    '"pj.formTitle": "تعريف مشروع"',
    '"pj.formDesc": "إنشاء مشروع برمز تسلسلي ورمز تفصيلي حي من ترقيم التفصيليات (نوع المشروع)"',
    '"pj.code": "الرمز"',
    '"pj.title": "العنوان"',
    '"pj.detailCode": "الرمز التفصيلي"',
    '"pj.description": "الوصف"',
    '"pj.descriptionPlaceholder": "نص الوصف (اختياري)"',
    '"pj.active": "نشط"',
    '"pj.errCodeRequired": "الرمز مطلوب"',
    '"pj.errTitleRequired": "العنوان مطلوب"',
    '"pj.errDetailCodeRequired": "الرمز التفصيلي مطلوب"',
    '"pj.serialCodeHint": "يُخصص رمز المشروع بشكل تسلسلي ومتتابع؛ يُملأ الرقم التالي مسبقاً بشكل حي."',
    '"pj.autoCodeHint": "يُخصص الرمز التفصيلي بشكل حي من نطاق ترقيم نوع التفصيل «مشروع» (من رقم البداية إلى رقم النهاية)."',
    '"pj.manualCodeHint": "ترقيم نوع التفصيل «مشروع» يدوي؛ أدخل الرمز التفصيلي ضمن النطاق المحدد."',
    '"pj.exhaustedHint": "نطاق ترقيم نوع التفصيل «مشروع» قد اكتمل؛ حدد نطاقاً جديداً في نموذج ترقيم التفصيليات."',
    '"pj.noAllocationHint": "خدمة تخصيص الرمز التفصيلي غير متاحة؛ أدخل الرمز التفصيلي يدوياً."',
    '"pj.listTitle": "قائمة المشاريع"',
  ],
  hi: [
    '"pj.formTitle": "परियोजना परिभाषा"',
    '"pj.formDesc": "क्रमिक कोड और (परियोजना प्रकार) विवरण नंबरिंग से लाइव विवरण कोड के साथ परियोजना बनाएं"',
    '"pj.code": "कोड"',
    '"pj.title": "शीर्षक"',
    '"pj.detailCode": "विवरण कोड"',
    '"pj.description": "विवरण"',
    '"pj.descriptionPlaceholder": "विवरण पाठ (वैकल्पिक)"',
    '"pj.active": "सक्रिय"',
    '"pj.errCodeRequired": "कोड आवश्यक है"',
    '"pj.errTitleRequired": "शीर्षक आवश्यक है"',
    '"pj.errDetailCodeRequired": "विवरण कोड आवश्यक है"',
    '"pj.serialCodeHint": "परियोजना कोड क्रमिक और लगातार आवंटित होता है; अगला नंबर लाइव प्रीफिल होता है।"',
    '"pj.autoCodeHint": "विवरण कोड «परियोजना» विवरण प्रकार की नंबरिंग श्रेणी से (प्रारंभ संख्या से अंतिम संख्या तक) लाइव आवंटित होता है।"',
    '"pj.manualCodeHint": "«परियोजना» विवरण प्रकार की नंबरिंग मैनुअल है; विवरण कोड परिभाषित श्रेणी में दर्ज करें।"',
    '"pj.exhaustedHint": "«परियोजना» विवरण प्रकार की नंबरिंग श्रेणी समाप्त हो गई है; विवरण नंबरिंग फ़ॉर्म में नई श्रेणी परिभाषित करें।"',
    '"pj.noAllocationHint": "विवरण कोड आवंटन सेवा अनुपलब्ध है; विवरण कोड मैन्युअल रूप से दर्ज करें।"',
    '"pj.listTitle": "परियोजना सूची"',
  ],
  ps: [
    '"pj.formTitle": "د پروژې تعریف"',
    '"pj.formDesc": "د پرله پسې کوډ او د تفصیلي شمېرنې له ژوندي تفصیلي کوډ سره (د پروژې ډول) پروژه جوړول"',
    '"pj.code": "کوډ"',
    '"pj.title": "عنوان"',
    '"pj.detailCode": "تفصیلي کوډ"',
    '"pj.description": "تشریحات"',
    '"pj.descriptionPlaceholder": "د تشریحاتو متن (اختیاري)"',
    '"pj.active": "فعال"',
    '"pj.errCodeRequired": "کوډ اړین دی"',
    '"pj.errTitleRequired": "عنوان اړین دی"',
    '"pj.errDetailCodeRequired": "تفصیلي کوډ اړین دی"',
    '"pj.serialCodeHint": "د پروژې کوډ پرله پسې او په دوامداره توګه ټاکل کیږي؛ راتلونکې شمېره ژوندي ډک کیږي."',
    '"pj.autoCodeHint": "تفصیلي کوډ د «پروژه» تفصیلي ډول له شمېرنې رنج څخه (له پیل شمېرې تر پای شمېرې) ژوندي ټاکل کیږي."',
    '"pj.manualCodeHint": "د «پروژه» تفصیلي ډول شمېرنه لاسي ده؛ تفصیلي کوډ په ټاکل شوي رنج کې دننه ولیکئ."',
    '"pj.exhaustedHint": "د «پروژه» تفصیلي ډول شمېرنې رنج پای ته رسیدلی؛ په تفصیلي شمېرنې فورمه کې نوی رنج وټاکئ."',
    '"pj.noAllocationHint": "د تفصیلي کوډ ټاکلو خدمت شتون نلري؛ تفصیلي کوډ لاسي ولیکئ."',
    '"pj.listTitle": "د پروژو لیست"',
  ],
  ckb: [
    '"pj.formTitle": "پێناسەی پرۆژە"',
    '"pj.formDesc": "دروستکردنی پرۆژە بە کۆدی زنجیرەیی و کۆدی وردەکاری ژیان لە ژمارەکردنی وردەکاری (جۆری پرۆژە)"',
    '"pj.code": "کۆد"',
    '"pj.title": "ناونیشان"',
    '"pj.detailCode": "کۆدی وردەکاری"',
    '"pj.description": "وەسف"',
    '"pj.descriptionPlaceholder": "دەقی وەسف (ئارەزوومەندانە)"',
    '"pj.active": "چالاک"',
    '"pj.errCodeRequired": "کۆد پێویستە"',
    '"pj.errTitleRequired": "ناونیشان پێویستە"',
    '"pj.errDetailCodeRequired": "کۆدی وردەکاری پێویستە"',
    '"pj.serialCodeHint": "کۆدی پرۆژە بە شێوەی زنجیرەیی و یەک لەدوای یەک دەخرێت؛ ژمارەی داهاتوو بە شێوەی ژیان پڕدەکرێتەوە."',
    '"pj.autoCodeHint": "کۆدی وردەکاری بە شێوەی ژیان لە ڕەنجی ژمارەکردنی جۆری وردەکاری «پرۆژە» (لە ژمارەی سەرەتا بۆ ژمارەی کۆتایی) دەخرێت."',
    '"pj.manualCodeHint": "ژمارەکردنی جۆری وردەکاری «پرۆژە» دەستکردییە؛ کۆدی وردەکاری لەناو ڕەنجی دیاریکراودا بنووسە."',
    '"pj.exhaustedHint": "ڕەنجی ژمارەکردنی جۆری وردەکاری «پرۆژە» تەواو بووە؛ لە فۆرمی ژمارەکردنی وردەکارییەکان ڕەنجی نوێ دیاری بکە."',
    '"pj.noAllocationHint": "خزمەتگوزاری دانانی کۆدی وردەکاری بەردەست نییە؛ کۆدی وردەکاری بە دەست بنووسە."',
    '"pj.listTitle": "لیستی پرۆژەکان"',
  ],
  pt: [
    '"pj.formTitle": "Definição de Projeto"',
    '"pj.formDesc": "Criar um projeto com código serial e código de detalhe ao vivo da numeração de detalhes (tipo de projeto)"',
    '"pj.code": "Código"',
    '"pj.title": "Título"',
    '"pj.detailCode": "Código de Detalhe"',
    '"pj.description": "Descrição"',
    '"pj.descriptionPlaceholder": "Texto da descrição (opcional)"',
    '"pj.active": "Ativo"',
    '"pj.errCodeRequired": "O código é obrigatório"',
    '"pj.errTitleRequired": "O título é obrigatório"',
    '"pj.errDetailCodeRequired": "O código de detalhe é obrigatório"',
    '"pj.serialCodeHint": "O código do projeto é atribuído de forma serial e consecutiva; o próximo número é pré-preenchido ao vivo."',
    '"pj.autoCodeHint": "O código de detalhe é atribuído ao vivo a partir da faixa de numeração do tipo de detalhe «Projeto» (do número inicial ao número final)."',
    '"pj.manualCodeHint": "A numeração do tipo de detalhe «Projeto» é manual; insira o código de detalhe dentro da faixa definida."',
    '"pj.exhaustedHint": "A faixa de numeração do tipo de detalhe «Projeto» esgotou-se; defina uma nova faixa no formulário de numeração de detalhes."',
    '"pj.noAllocationHint": "O serviço de atribuição de código de detalhe está indisponível; insira o código de detalhe manualmente."',
    '"pj.listTitle": "Lista de Projetos"',
  ],
  ko: [
    '"pj.formTitle": "프로젝트 정의"',
    '"pj.formDesc": "일련 코드와 (프로젝트 유형) 상세 번호 매기기의 라이브 상세 코드로 프로젝트 생성"',
    '"pj.code": "코드"',
    '"pj.title": "제목"',
    '"pj.detailCode": "상세 코드"',
    '"pj.description": "설명"',
    '"pj.descriptionPlaceholder": "설명 텍스트 (선택 사항)"',
    '"pj.active": "활성"',
    '"pj.errCodeRequired": "코드는 필수입니다"',
    '"pj.errTitleRequired": "제목은 필수입니다"',
    '"pj.errDetailCodeRequired": "상세 코드는 필수입니다"',
    '"pj.serialCodeHint": "프로젝트 코드는 일련번호로 연속적으로 할당됩니다. 다음 번호가 라이브로 미리 채워집니다."',
    '"pj.autoCodeHint": "상세 코드는 «프로젝트» 상세 유형의 번호 범위(시작 번호부터 끝 번호까지)에서 라이브로 할당됩니다."',
    '"pj.manualCodeHint": "«프로젝트» 상세 유형의 번호 매기기는 수동입니다. 정의된 범위 내에서 상세 코드를 입력하십시오."',
    '"pj.exhaustedHint": "«프로젝트» 상세 유형의 번호 범위가 소진되었습니다. 상세 번호 매기기 양식에서 새 범위를 정의하십시오."',
    '"pj.noAllocationHint": "상세 코드 할당 서비스를 사용할 수 없습니다. 상세 코드를 수동으로 입력하십시오."',
    '"pj.listTitle": "프로젝트 목록"',
  ],
  fr: [
    '"pj.formTitle": "Définition de Projet"',
    '"pj.formDesc": "Créer un projet avec un code séquentiel et un code de détail en direct issu de la numérotation des détails (type de projet)"',
    '"pj.code": "Code"',
    '"pj.title": "Titre"',
    '"pj.detailCode": "Code de Détail"',
    '"pj.description": "Description"',
    '"pj.descriptionPlaceholder": "Texte de description (facultatif)"',
    '"pj.active": "Actif"',
    '"pj.errCodeRequired": "Le code est requis"',
    '"pj.errTitleRequired": "Le titre est requis"',
    '"pj.errDetailCodeRequired": "Le code de détail est requis"',
    '"pj.serialCodeHint": "Le code du projet est attribué de manière séquentielle et consécutive ; le numéro suivant est prérempli en direct."',
    '"pj.autoCodeHint": "Le code de détail est attribué en direct à partir de la plage de numérotation du type de détail «Projet» (du numéro de début au numéro de fin)."',
    '"pj.manualCodeHint": "La numérotation du type de détail «Projet» est manuelle ; saisissez le code de détail dans la plage définie."',
    '"pj.exhaustedHint": "La plage de numérotation du type de détail «Projet» est épuisée ; définissez une nouvelle plage dans le formulaire de numérotation des détails."',
    '"pj.noAllocationHint": "Le service d’attribution du code de détail est indisponible ; saisissez le code de détail manuellement."',
    '"pj.listTitle": "Liste des Projets"',
  ],
  zh: [
    '"pj.formTitle": "项目定义"',
    '"pj.formDesc": "使用序列代码和（项目类型）明细编号的实时明细代码创建项目"',
    '"pj.code": "代码"',
    '"pj.title": "标题"',
    '"pj.detailCode": "明细代码"',
    '"pj.description": "说明"',
    '"pj.descriptionPlaceholder": "说明文字（可选）"',
    '"pj.active": "启用"',
    '"pj.errCodeRequired": "代码是必填项"',
    '"pj.errTitleRequired": "标题是必填项"',
    '"pj.errDetailCodeRequired": "明细代码是必填项"',
    '"pj.serialCodeHint": "项目代码将按序列连续分配；下一个号码会实时预填。"',
    '"pj.autoCodeHint": "明细代码将从「项目」明细类型的编号区间（起始号至结束号）实时分配。"',
    '"pj.manualCodeHint": "「项目」明细类型的编号为手动模式；请在定义的区间内输入明细代码。"',
    '"pj.exhaustedHint": "「项目」明细类型的编号区间已用尽；请在明细编号表单中定义新区间。"',
    '"pj.noAllocationHint": "明细代码分配服务不可用；请手动输入明细代码。"',
    '"pj.listTitle": "项目列表"',
  ],
  de: [
    '"pj.formTitle": "Projektdefinition"',
    '"pj.formDesc": "Projekt mit seriellem Code und Live-Detailcode aus der Detailnummerierung (Projektart) anlegen"',
    '"pj.code": "Code"',
    '"pj.title": "Titel"',
    '"pj.detailCode": "Detailcode"',
    '"pj.description": "Beschreibung"',
    '"pj.descriptionPlaceholder": "Beschreibungstext (optional)"',
    '"pj.active": "Aktiv"',
    '"pj.errCodeRequired": "Code ist erforderlich"',
    '"pj.errTitleRequired": "Titel ist erforderlich"',
    '"pj.errDetailCodeRequired": "Detailcode ist erforderlich"',
    '"pj.serialCodeHint": "Der Projektcode wird seriell und fortlaufend zugewiesen; die nächste Nummer wird live vorausgefüllt."',
    '"pj.autoCodeHint": "Der Detailcode wird live aus dem Nummerierungsbereich des Detailtyps «Projekt» (von Startnummer bis Endnummer) zugewiesen."',
    '"pj.manualCodeHint": "Die Nummerierung des Detailtyps «Projekt» ist manuell; geben Sie den Detailcode innerhalb des definierten Bereichs ein."',
    '"pj.exhaustedHint": "Der Nummerierungsbereich des Detailtyps «Projekt» ist erschöpft; definieren Sie im Detailnummerierungsformular einen neuen Bereich."',
    '"pj.noAllocationHint": "Der Detailcode-Zuweisungsdienst ist nicht verfügbar; geben Sie den Detailcode manuell ein."',
    '"pj.listTitle": "Projektliste"',
  ],
  ru: [
    '"pj.formTitle": "Определение проекта"',
    '"pj.formDesc": "Создание проекта с последовательным кодом и живым детальным кодом из нумерации аналитик (тип проекта)"',
    '"pj.code": "Код"',
    '"pj.title": "Наименование"',
    '"pj.detailCode": "Детальный код"',
    '"pj.description": "Описание"',
    '"pj.descriptionPlaceholder": "Текст описания (необязательно)"',
    '"pj.active": "Активен"',
    '"pj.errCodeRequired": "Код обязателен"',
    '"pj.errTitleRequired": "Наименование обязательно"',
    '"pj.errDetailCodeRequired": "Детальный код обязателен"',
    '"pj.serialCodeHint": "Код проекта присваивается последовательно и непрерывно; следующий номер предварительно заполняется в реальном времени."',
    '"pj.autoCodeHint": "Детальный код динамически присваивается из диапазона нумерации типа аналитики «Проект» (от начального номера до конечного номера)."',
    '"pj.manualCodeHint": "Нумерация типа аналитики «Проект» ручная; введите детальный код в пределах заданного диапазона."',
    '"pj.exhaustedHint": "Диапазон нумерации типа аналитики «Проект» исчерпан; задайте новый диапазон в форме нумерации аналитик."',
    '"pj.noAllocationHint": "Служба присвоения детального кода недоступна; введите детальный код вручную."',
    '"pj.listTitle": "Список проектов"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = [
  "pj.formTitle", "pj.formDesc", "pj.code", "pj.title", "pj.detailCode",
  "pj.description", "pj.descriptionPlaceholder", "pj.active",
  "pj.errCodeRequired", "pj.errTitleRequired", "pj.errDetailCodeRequired",
  "pj.serialCodeHint", "pj.autoCodeHint", "pj.manualCodeHint", "pj.exhaustedHint",
  "pj.noAllocationHint", "pj.listTitle",
];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۱۷ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"cc.listTitle"')) anchors.push(i);
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
