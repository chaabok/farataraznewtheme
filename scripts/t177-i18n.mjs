/**
 * Task t177 — i18n: فرم مدیریتی «سمت‌های گردش کار» (فاز ۱ زیرسیستم گردش کار)
 * در هر ۱۳ زبان.
 * الگو: اسکریپت t173 — درج پس از خط لنگرِ «settings.swConfigDesc»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"settings.swConfigDesc":';

const KEYS = {
  "wf.formTitle": [
    "سمت‌های گردش کار",
    "Workflow Positions",
    "İş Akışı Görevleri",
    "المسمى الوظيفية لمسار العمل",
    "वर्कफ़्लो पद",
    "د کاري بهیر موقعیتونه",
    "پۆستەکانی ڕەوتی کار",
    "Cargos do Fluxo de Trabalho",
    "워크플로 직책",
    "Postes du flux de travail",
    "工作流职位",
    "Workflow-Positionen",
    "Должности рабочего процесса",
  ],
  "wf.badge": [
    "گردش کار",
    "Workflow",
    "İş Akışı",
    "مسار العمل",
    "वर्कफ़्लो",
    "کاري بهیر",
    "ڕەوتی کار",
    "Fluxo de Trabalho",
    "워크플로",
    "Flux de travail",
    "工作流",
    "Workflow",
    "Рабочий процесс",
  ],
  "wf.roleCode": [
    "کد سمت",
    "Position Code",
    "Görev Kodu",
    "رمز المسمى",
    "पद कोड",
    "د موقعیت کوډ",
    "کۆدی پۆست",
    "Código do Cargo",
    "직책 코드",
    "Code du poste",
    "职位代码",
    "Positionsschlüssel",
    "Код должности",
  ],
  "wf.roleTitle": [
    "عنوان سمت",
    "Position Title",
    "Görev Ünvanı",
    "عنوان المسمى",
    "पद शीर्षक",
    "د موقعیت نوم",
    "ناونیشانی پۆست",
    "Título do Cargo",
    "직책명",
    "Intitulé du poste",
    "职位名称",
    "Positionsbezeichnung",
    "Название должности",
  ],
  "wf.assignmentsTab": [
    "تخصیص کاربران",
    "User Assignment",
    "Kullanıcı Ataması",
    "إسناد المستخدمين",
    "उपयोगकर्ता आवंटन",
    "کاروونکو ګمارل",
    "دەرکردنی بەکارهێنەران",
    "Atribuição de Usuários",
    "사용자 지정",
    "Affectation des utilisateurs",
    "用户分配",
    "Benutzerzuweisung",
    "Назначение пользователей",
  ],
  "wf.userId": [
    "شناسهٔ کاربر",
    "User ID",
    "Kullanıcı Kimliği",
    "معرف المستخدم",
    "उपयोगकर्ता आईडी",
    "د کاروونکی پیژند",
    "ناسنامەی بەکارهێنەر",
    "ID do Usuário",
    "사용자 ID",
    "ID utilisateur",
    "用户 ID",
    "Benutzerkennung",
    "ID пользователя",
  ],
  "wf.userName": [
    "نام کاربر",
    "User Name",
    "Kullanıcı Adı",
    "اسم المستخدم",
    "उपयोगकर्ता नाम",
    "د کاروونکی نوم",
    "ناوی بەکارهێنەر",
    "Nome do Usuário",
    "사용자 이름",
    "Nom d'utilisateur",
    "用户姓名",
    "Benutzername",
    "Имя пользователя",
  ],
  "wf.validFrom": [
    "اعتبار از",
    "Valid From",
    "Geçerlilik Başlangıcı",
    "صالح من",
    "से वैध",
    "له معتبر دی",
    " دروستکردن لە",
    "Válido de",
    "유효 시작",
    "Valable à partir du",
    "生效日期",
    "Gültig ab",
    "Действует с",
  ],
  "wf.validTo": [
    "اعتبار تا",
    "Valid To",
    "Geçerlilik Sonu",
    "صالح حتى",
    "तक वैध",
    "تر معتبر دی",
    "تا کاتی دروستی",
    "Válido até",
    "유효 종료",
    "Valable jusqu'au",
    "失效日期",
    "Gültig bis",
    "Действует до",
  ],
  "wf.errCodeRequired": [
    "کد سمت الزامی است",
    "Position code is required",
    "Görev kodu zorunludur",
    "رمز المسمى مطلوب",
    "पद कोड आवश्यक है",
    "د موقعیت کوډ اړین دی",
    "کۆدی پۆست پێویستە",
    "O código do cargo é obrigatório",
    "직책 코드는 필수입니다",
    "Le code du poste est obligatoire",
    "职位代码为必填项",
    "Positionsschlüssel ist erforderlich",
    "Код должности обязателен",
  ],
  "wf.errTitleRequired": [
    "عنوان سمت الزامی است",
    "Position title is required",
    "Görev ünvanı zorunludur",
    "عنوان المسمى مطلوب",
    "पद शीर्षक आवश्यक है",
    "د موقعیت نوم اړین دی",
    "ناونیشانی پۆست پێویستە",
    "O título do cargo é obrigatório",
    "직책명은 필수입니다",
    "L'intitulé du poste est obligatoire",
    "职位名称为必填项",
    "Positionsbezeichnung ist erforderlich",
    "Название должности обязательно",
  ],
  "wf.saveRoleFirst": [
    "برای مدیریت تخصیص‌ها ابتدا سمت را ذخیره کنید",
    "Save the position first to manage assignments",
    "Atamaları yönetmek için önce görevi kaydedin",
    "احفظ المسمى أولاً لإدارة الإسنادات",
    "असाइनमेंट प्रबंधित करने के लिए पहले पद सहेजें",
    "د ګمارنې اداره کولو لپاره لومړی موقعیت خوندي کړئ",
    "بۆ بەڕێوەبردنی دەرکردنەکان سەرەتا پۆست پاشەکەوت بکە",
    "Salve o cargo primeiro para gerenciar atribuições",
    "할당을 관리하려면 먼저 직책을 저장하세요",
    "Enregistrez d'abord le poste pour gérer les affectations",
    "请先保存职位以管理分配",
    "Speichern Sie zuerst die Position, um Zuweisungen zu verwalten",
    "Сначала сохраните должность, чтобы управлять назначениями",
  ],
  "wf.assignmentsSaved": [
    "تخصیص‌ها ذخیره شد",
    "Assignments saved",
    "Atamalar kaydedildi",
    "تم حفظ الإسنادات",
    "असाइनमेंट सहेजे गए",
    "ګمارنې خوندي شوې",
    "دەرکردنەکان پاشەکەوتکران",
    "Atribuições salvas",
    "할당이 저장되었습니다",
    "Affectations enregistrées",
    "分配已保存",
    "Zuweisungen gespeichert",
    "Назначения сохранены",
  ],
  "wf.dupUser": [
    "کاربر تکراری در ردیف‌های تخصیص",
    "Duplicate user in assignment rows",
    "Atama satırlarında yinelenen kullanıcı",
    "مستخدم مكرر في صفوف الإسناد",
    "असाइनमेंट पंक्तियों में डुप्लिकेट उपयोगकर्ता",
    "په ګمارنې کتارونو کې تکراري کاروونکی",
    "بەکارهێنەری دووبارە لە دێڕەکانی دەرکردن",
    "Usuário duplicado nas linhas de atribuição",
    "할당 행에 중복된 사용자",
    "Utilisateur en double dans les lignes d'affectation",
    "分配行中存在重复用户",
    "Doppelter Benutzer in Zuweisungszeilen",
    "Дублирующийся пользователь в строках назначения",
  ],
  "wf.assignedUsers": [
    "کاربر تخصیص‌یافته",
    "assigned users",
    "atanmış kullanıcı",
    "مستخدم مسند",
    "आवंटित उपयोगकर्ता",
    "ګمارل شوي کاروونکي",
    "بەکارهێنەری دەرکراو",
    "usuários atribuídos",
    "할당된 사용자",
    "utilisateurs affectés",
    "位已分配用户",
    "zugewiesene Benutzer",
    "назначенных пользователей",
  ],
  "wf.systemRole": [
    "سمت سیستمی",
    "System position",
    "Sistem görevi",
    "مسمى النظام",
    "सिस्टम पद",
    "سیسټمي موقعیت",
    "پۆستی سیستەم",
    "Cargo do sistema",
    "시스템 직책",
    "Poste système",
    "系统职位",
    "Systemposition",
    "Системная должность",
  ],
  "wf.hint": [
    "سمت‌های سیستمیِ پیش‌فرض (ثبت‌کننده، حسابدار، سرپرست و مدیر رسیدگی) حذف‌شدنی نیستند؛ گره‌های فرآیند به «کد سمت» ارجاع می‌دهند و موتور گردش کار فقط به دارندهٔ سمتِ گام جاری اجازهٔ اقدام می‌دهد. بازهٔ اعتبار خالی = همیشه معتبر.",
    "Default system positions (Registrant, Accountant, Supervisor and Review Manager) cannot be deleted; process nodes reference the position code and the workflow engine only lets the holder of the current step act. Empty validity period = always valid.",
    "Varsayılan sistem görevleri (Kaydeden, Muhasebeci, Denetçi ve Onay Yöneticisi) silinemez; süreç düğümleri görev koduna başvurur ve iş akışı motoru yalnızca geçerli adımın sahibinin işlem yapmasına izin verir. Boş geçerlilik = her zaman geçerli.",
    "المسمى النظامية الافتراضية (المسجل، المحاسب، المشرف ومدير المراجعة) لا يمكن حذفها؛ عقد العملية تشير إلى رمز المسمى ولا يسمح محرك مسار العمل إلا لصاحب الخطوة الحالية بالتصرف. فترة الصلاحية الفارغة = صالحة دائمًا.",
    "डिफ़ॉल्ट सिस्टम पद (पंजीकर्ता, लेखाकार, पर्यवेक्षक और समीक्षा प्रबंधक) हटाए नहीं जा सकते; प्रक्रिया नोड्स पद कोड का संदर्भ देते हैं और वर्कफ़्लो इंजन केवल वर्तमान चरण के धारक को कार्रवाई की अनुमति देता है। खाली वैधता अवधि = हमेशा वैध।",
    "د اساسي سیسټم موقعیتونه (ثبت کوونکی، محاسب، څارونکی او د بیاکتنې مدیر) نه ړنګېدلی شي؛ د پروسې نوډونه د موقعیت کوډ ته اشاره کوي او د کاري بهیر انجن یوازې د اوسني ګام خاوند ته اجازه ورکوي. تشه اعتبار موده = تل معتبر.",
    "پۆستە سیستمییە بنەڕەتییەکان (تۆمارکەر، ژمێریار، سەرپەرشتیار و بەرپرسی پێداچوونەوە) ناپێویستە بسڕدرێنەوە؛ گرێی پرۆسەسەر کۆدی پۆست ئاماژە دەکات و بزوێنەری ڕەوتی کار تەنها بە خاوەنی هەنگوی ئێستا ڕێگە دەدات. ماوەی بەتاڵ = هەمیشە دروست.",
    "Os cargos padrão do sistema (Registrante, Contador, Supervisor e Gerente de Revisão) não podem ser excluídos; os nós do processo referenciam o código do cargo e o motor do fluxo de trabalho só permite que o titular da etapa atual aja. Período de validade vazio = sempre válido.",
    "기본 시스템 직책(등록자, 회계사, 감독자, 검토 관리자)은 삭제할 수 없습니다; 프로세스 노드는 직책 코드를 참조하며 워크플로 엔진은 현재 단계의 소유자만 조치할 수 있습니다. 빈 유효 기간 = 항상 유효.",
    "Les postes système par défaut (Régistrant, Comptable, Superviseur et Responsable de la révision) ne peuvent pas être supprimés ; les nœuds du processus référencent le code du poste et le moteur de flux de travail n'autorise que le titulaire de l'étape en cours à agir. Période de validité vide = toujours valable.",
    "默认系统职位（登记人、会计、主管和复核经理）不可删除；流程节点引用职位代码，工作流引擎仅允许当前步骤的持有者执行操作。有效期为空 = 始终有效。",
    "Standard-Systempositionen (Erfasser, Buchhalter, Supervisor und Prüfungsmanager) können nicht gelöscht werden; Prozessknoten verweisen auf den Positionsschlüssel, und die Workflow-Engine erlaubt nur dem Inhaber des aktuellen Schritts zu handeln. Leere Gültigkeitsdauer = immer gültig.",
    "Системные должности по умолчанию (Регистратор, Бухгалтер, Супервизор и Руководитель проверки) не могут быть удалены; узлы процесса ссылаются на код должности, и движок рабочего процесса разрешает действие только держателю текущего шага. Пустой срок действия = всегда действителен.",
  ],
  "settings.wfDesc": [
    "تعریف سمت‌های چرخهٔ رسیدگی و تخصیص کاربران (زیرسیستم گردش کار)",
    "Define review-cycle positions and assign users (workflow subsystem)",
    "İnceleme döngüsü görevlerini tanımlayın ve kullanıcı atayın (iş akışı alt sistemi)",
    "تعريف مسمى دورة المراجعة وإسناد المستخدمين (نظام مسار العمل)",
    "समीक्षा चक्र पद परिभाषित करें और उपयोगकर्ता आवंटित करें (वर्कफ़्लो उपप्रणाली)",
    "د بیاکتنې دوران موقعیتونه تعریف او کاروونکي وګمارئ (د کاري بهیر فرعي سیسټم)",
    "پێناسەی پۆستەکانی خولی پێداچوونەوە و دەرکردنی بەکارهێنەران (ژێر سیستەمی ڕەوتی کار)",
    "Defina cargos do ciclo de revisão e atribua usuários (subsistema de fluxo de trabalho)",
    "검토 주기 직책을 정의하고 사용자를 할당합니다 (워크플로 하위 시스템)",
    "Définissez les postes du cycle de révision et affectez les utilisateurs (sous-système de flux de travail)",
    "定义审核周期职位并分配用户（工作流子系统）",
    "Positionen des Prüfzyklus definieren und Benutzer zuweisen (Workflow-Subsystem)",
    "Определите должности цикла проверки и назначьте пользователей (подсистема рабочего процесса)",
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
  console.log(`${k}: ×${n}`);
  if (n !== 13) ok = false;
}
if (!ok) {
  console.error("FAIL: some keys are not exactly ×13");
  process.exit(1);
}
console.log(`OK — all ${Object.keys(KEYS).length} keys ×13 (${Object.keys(KEYS).length * 13} lines added)`);
