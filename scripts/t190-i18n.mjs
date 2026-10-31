/**
 * Task t190 — i18n: فرمان مالک — «فرم طراحی فرآیند گردش کار را با فرم
 * SimpleFormTwoRow ریفکتور کنید که همه فرم های نرم افزار یکسان باشند» +
 * «با استفاده از کامپوننت دراپ دان آیکون لیست، لیست فرم ها را به کاربر
 * نمایش بدهید» + آیکون «خاتمهٔ فرآیند» (مودال تاریخ خاتمه با پیش‌فرض امروز
 * و توضیحات) و آیکون «برگشت خاتمه»؛ فرآیند خاتمه‌یافته فقط-خواندنی.
 * کلیدهای تازه: تب «فرآیندها»، ستون‌های گرید، فیلدهای نمایشی خاتمه، مودال
 * خاتمه و توست‌های آن — ۲۳ کلید × ۱۳ زبان.
 * الگو: اسکریپت t189 — درج پس از خط لنگرِ «wf.des.title» در هر بلوک زبانی
 * (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"wf.des.title":';

const KEYS = {
  "wf.des.tabDefs": [
    "فرآیندها",
    "Processes",
    "Süreçler",
    "العمليات",
    "प्रक्रियाएँ",
    "پروسیږي",
    "پرۆسەکان",
    "Processos",
    "프로세스",
    "Processus",
    "流程",
    "Prozesse",
    "Процессы",
  ],
  "wf.des.formPickHint": [
    "برای شروع، از کاشی «لیست» در نوار ابزار یک فرم را انتخاب کنید تا فرآیندهای آن نمایش یابد.",
    "To start, pick a form from the «List» tile in the toolbar to show its processes.",
    "Başlamak için araç çubuğundaki «Liste» kutusundan bir form seçin; süreçleri görüntülenir.",
    "للبدء، اختر نموذجاً من قائمة «القائمة» في شريط الأدوات لعرض عملياته.",
    "शुरू करने के लिए, टूलबार के «सूची» टाइल से एक फ़ॉर्म चुनें ताकि उसकी प्रक्रियाएँ दिखें।",
    "د پیل لپاره، له توولبار «لیست» ټایل څخه یو فورم وټاکه چې پروسیږي یې ښکاري.",
    "بۆ دەستپێکردن، لە کاشی «لیست» ی نوارامرازەکە فۆرمێک هەڵبژێرە بۆ پیشاندانی پرۆسەکانی.",
    "Para começar, escolha um formulário no mosaico «Lista» da barra de ferramentas para ver os seus processos.",
    "시작하려면 도구 모음의 «목록» 타일에서 폼을 선택하여 해당 프로세스를 표시하세요.",
    "Pour commencer, choisissez un formulaire dans la tuile « Liste » de la barre d'outils pour afficher ses processus.",
    "首先，请从工具栏的「列表」方块中选择一个表单，以显示其流程。",
    "Wählen Sie zunächst in der Kachel «Liste» der Symbolleiste ein Formular aus, um dessen Prozesse anzuzeigen.",
    "Для начала выберите форму в плитке «Список» на панели инструментов, чтобы увидеть её процессы.",
  ],
  "wf.des.versionLabel": [
    "نسخه",
    "Version",
    "Sürüm",
    "الإصدار",
    "संस्करण",
    "نسخه",
    "وەشان",
    "Versão",
    "버전",
    "Version",
    "版本",
    "Version",
    "Версия",
  ],
  "wf.des.statusLabel": [
    "وضعیت فرآیند",
    "Process status",
    "Süreç durumu",
    "حالة العملية",
    "प्रक्रिया स्थिति",
    "د پروسې حالت",
    "دۆخی پرۆسە",
    "Estado do processo",
    "프로세스 상태",
    "Statut du processus",
    "流程状态",
    "Prozessstatus",
    "Статус процесса",
  ],
  "wf.des.colSoftware": [
    "نرم‌افزار",
    "Software",
    "Yazılım",
    "البرنامج",
    "सॉफ़्टवेयर",
    "سافټویر",
    "سۆفتوەر",
    "Software",
    "소프트웨어",
    "Logiciel",
    "软件",
    "Software",
    "Программа",
  ],
  "wf.des.colUsed": [
    "در استفاده",
    "In use",
    "Kullanımda",
    "قيد الاستخدام",
    "उपयोग में",
    "په کار کې",
    "لە بەکارهێناندا",
    "Em uso",
    "사용 중",
    "En cours d'usage",
    "使用中",
    "In Verwendung",
    "Используется",
  ],
  "wf.des.colTerminated": [
    "خاتمه",
    "Terminated",
    "Sonlandırıldı",
    "منهي",
    "समाप्त",
    "پایان",
    "کۆتایی",
    "Terminado",
    "종료",
    "Résilié",
    "已终止",
    "Beendet",
    "Прекращён",
  ],
  "wf.des.colTerminatedAt": [
    "تاریخ خاتمه",
    "Termination date",
    "Sonlandırma tarihi",
    "تاريخ الإنهاء",
    "समाप्ति तिथि",
    "د پای نېټه",
    "بەرواری کۆتایی",
    "Data de término",
    "종료일",
    "Date de résiliation",
    "终止日期",
    "Beendigungsdatum",
    "Дата прекращения",
  ],
  "wf.des.colNodes": [
    "گره‌ها",
    "Nodes",
    "Düğümler",
    "العقد",
    "नोड्स",
    "نوټونه",
    "گرێەکان",
    "Nós",
    "노드",
    "Nœuds",
    "节点",
    "Knoten",
    "Узлы",
  ],
  "wf.des.terminatedBadge": [
    "خاتمه‌یافته",
    "Terminated",
    "Sonlandırılmış",
    "منهيّ",
    "समाप्त",
    "پایان شوې",
    "کۆتاییپێکهاتوو",
    "Terminado",
    "종료됨",
    "Résilié",
    "已终止",
    "Beendet",
    "Прекращён",
  ],
  "wf.des.terminatedBanner": [
    "این فرآیند خاتمه یافته است — فیلدها و دیاگرام فقط-خواندنی‌اند؛ برای ادامه «نسخهٔ جدید» بسازید یا «برگشت خاتمه» را بزنید.",
    "This process is terminated — fields and diagram are read-only; continue with a «New version» or click «Reinstate».",
    "Bu süreç sonlandırıldı — alanlar ve şema salt okunur; devam için «Yeni sürüm» oluşturun veya «Geri al» düğmesine basın.",
    "تم إنهاء هذه العملية — الحقول والمخطط للقراءة فقط؛ تابع بـ«إصدار جديد» أو اضغط «إرجاع الإنهاء».",
    "यह प्रक्रिया समाप्त हो गई है — फ़ील्ड और आरेख केवल-पढ़ने योग्य हैं; जारी रखने के लिए «नया संस्करण» बनाएँ या «समाप्ति वापस» दबाएँ।",
    "دا پروسه پای شوې — فیلډونه او ډیاګرام یوازې-لوستل کېږي؛ دوام لپاره «نوی نسخه» جوړ کړه یا «د پای بیرته‌ګرځول» کېکاږه.",
    "ئەم پرۆسە کۆتایی هاتووە — خانەکان و دیاگرام تەنها-خوێندنەوەن؛ بۆ بەردەوامبوون «وەشانی نوێ» دروست بکە یان «گەڕاندنەوەی کۆتایی» بنوسە.",
    "Este processo foi terminado — os campos e o diagrama são só de leitura; continue com «Nova versão» ou clique «Repor término».",
    "이 프로세스는 종료되었습니다 — 필드와 다이어그램은 읽기 전용입니다. 계속하려면 «새 버전»을 만들거나 «종료 되돌리기»를 누르세요.",
    "Ce processus est résilié — les champs et le diagramme sont en lecture seule ; continuez avec « Nouvelle version » ou cliquez « Annuler la résiliation ».",
    "此流程已终止——字段和图表为只读；请创建「新版本」或点击「撤销终止」以继续。",
    "Dieser Prozess wurde beendet — Felder und Diagramm sind schreibgeschützt; erstellen Sie eine «Neue Version» oder klicken Sie «Beendigung zurücknehmen».",
    "Этот процесс прекращён — поля и диаграмма доступны только для чтения; создайте «Новую версию» или нажмите «Отменить прекращение».",
  ],
  "wf.des.terminatedReadOnlyToast": [
    "این فرآیند خاتمه یافته است — فیلدها فقط-خواندنی‌اند",
    "This process is terminated — the fields are read-only",
    "Bu süreç sonlandırıldı — alanlar salt okunur",
    "تم إنهاء هذه العملية — الحقول للقراءة فقط",
    "यह प्रक्रिया समाप्त हो चुकी है — फ़ील्ड केवल-पढ़ने योग्य हैं",
    "دا پروسه پای شوې — فیلډونه یوازې-لوستل کېږي",
    "ئەم پرۆسە کۆتایی هاتووە — خانەکان تەنها-خوێندنەوەن",
    "Este processo foi terminado — os campos são só de leitura",
    "이 프로세스는 종료되었습니다 — 필드는 읽기 전용입니다",
    "Ce processus est résilié — les champs sont en lecture seule",
    "此流程已终止——字段为只读",
    "Dieser Prozess wurde beendet — die Felder sind schreibgeschützt",
    "Этот процесс прекращён — поля только для чтения",
  ],
  "wf.des.terminate": [
    "خاتمهٔ فرآیند",
    "Terminate process",
    "Süreci sonlandır",
    "إنهاء العملية",
    "प्रक्रिया समाप्त करें",
    "پروسه پای کول",
    "کۆتاییھێنانی پرۆسە",
    "Terminar processo",
    "프로세스 종료",
    "Résilier le processus",
    "终止流程",
    "Prozess beenden",
    "Прекратить процесс",
  ],
  "wf.des.reinstate": [
    "برگشت خاتمه",
    "Reinstate",
    "Sonlandırmayı geri al",
    "إرجاع الإنهاء",
    "समाप्ति वापस",
    "پایان بیرته‌ګرځول",
    "گەڕاندنەوەی کۆتایی",
    "Repor término",
    "종료 되돌리기",
    "Annuler la résiliation",
    "撤销终止",
    "Beendigung zurücknehmen",
    "Отменить прекращение",
  ],
  "wf.des.termTitle": [
    "خاتمهٔ فرآیند",
    "Terminate process",
    "Süreci sonlandır",
    "إنهاء العملية",
    "प्रक्रिया समाप्त करें",
    "پروسه پای کول",
    "کۆتاییھێنانی پرۆسە",
    "Terminar processo",
    "프로세스 종료",
    "Résilier le processus",
    "终止流程",
    "Prozess beenden",
    "Прекратить процесс",
  ],
  "wf.des.termDesc": [
    "با تأیید، فرآیند در تاریخ انتخاب‌شده خاتمه می‌یابد: فیلدها فقط-خواندنی می‌شوند، نسخه از موتور خارج می‌شود و فرآیندهای فرم از این بازهٔ تاریخی با نسخهٔ جانشین ادامه می‌یابد.",
    "On confirmation, the process terminates on the selected date: fields become read-only, the version leaves the engine, and the form's processes continue from this date with a successor version.",
    "Onaydan sonra süreç seçilen tarihte sona erer: alanlar salt okunur olur, sürüm motor dan çıkar ve formun süreçleri bu tarihten itibaren halef sürümle devam eder.",
    "عند التأكيد، تنتهي العملية في التاريخ المحدد: تصبح الحقول للقراءة فقط، ويخرج الإصدار من المحرك، وتتابع عمليات النموذج من هذا التاريخ بإصدار خلف.",
    "पुष्टि पर, प्रक्रिया चयनित तिथि पर समाप्त हो जाती है: फ़ील्ड केवल-पढ़ने योग्य हो जाते हैं, संस्करण इंजन से निकल जाता है, और फ़ॉर्म की प्रक्रियाएँ इस तिथि से उत्तराधिकारी संस्करण के साथ चलती रहती हैं।",
    "د تایید وروسته، پروسه په ټاکلې نېټه پای مومي: فیلډونه یوازې-لوستل کېږي، نسخه له انجن ویستل کېږي او د فورم پروسیږي له دې نېټې څخه د ځایناستي نسخې سره دوام کوي.",
    "بە پەسەندکردن، پرۆسە لە بەرواری هەڵبژێردراو کۆتایی دێت: خانەکان تەنها-خوێندنەوە دەبن، وەشان لە بزوێنەر دەردەچێت و پرۆسەکانی فۆرم لەم بەروارە بە وەشانی جێگرەوە بەردەوام دەبن.",
    "Após confirmação, o processo termina na data escolhida: os campos tornam-se só de leitura, a versão sai do motor e os processos do formulário continuam a partir desta data com uma versão sucessora.",
    "확인하면 프로세스가 선택한 날짜에 종료됩니다: 필드는 읽기 전용이 되고 버전은 엔진에서 제외되며, 폼의 프로세스는 이 날짜부터 후속 버전으로 계속됩니다.",
    "Après confirmation, le processus se termine à la date choisie : les champs deviennent en lecture seule, la version quitte le moteur et les processus du formulaire continuent à partir de cette date avec une version successeur.",
    "确认后，流程将在所选日期终止：字段变为只读，该版本退出引擎，表单的流程自此日期起由后续版本继续。",
    "Bei Bestätigung endet der Prozess am gewählten Datum: Felder werden schreibgeschützt, die Version verlässt die Engine, und die Prozesse des Formulars laufen ab diesem Datum mit einer Nachfolgeversion weiter.",
    "После подтверждения процесс прекращается в выбранную дату: поля становятся доступными только для чтения, версия покидает движок, а процессы формы продолжаются с этой даты в версии-преемнике.",
  ],
  "wf.des.termDate": [
    "تاریخ خاتمه",
    "Termination date",
    "Sonlandırma tarihi",
    "تاريخ الإنهاء",
    "समाप्ति तिथि",
    "د پای نېټه",
    "بەرواری کۆتایی",
    "Data de término",
    "종료일",
    "Date de résiliation",
    "终止日期",
    "Beendigungsdatum",
    "Дата прекращения",
  ],
  "wf.des.termDateInvalid": [
    "تاریخ خاتمه معتبر نیست",
    "The termination date is not valid",
    "Sonlandırma tarihi geçersiz",
    "تاريخ الإنهاء غير صالح",
    "समाप्ति तिथि मान्य नहीं है",
    "د پای نېټه سمه نه ده",
    "بەرواری کۆتایی دروست نییە",
    "A data de término não é válida",
    "종료일이 올바르지 않습니다",
    "La date de résiliation n'est pas valide",
    "终止日期无效",
    "Das Beendigungsdatum ist ungültig",
    "Дата прекращения недействительна",
  ],
  "wf.des.termConfirm": [
    "تأیید خاتمه",
    "Confirm termination",
    "Sonlandırmayı onayla",
    "تأكيد الإنهاء",
    "समाप्ति की पुष्टि करें",
    "د پای تایید",
    "پەسەندکردنی کۆتایی",
    "Confirmar término",
    "종료 확인",
    "Confirmer la résiliation",
    "确认终止",
    "Beendigung bestätigen",
    "Подтвердить прекращение",
  ],
  "wf.des.termNoteLabel": [
    "توضیحات خاتمه",
    "Termination note",
    "Sonlandırma notu",
    "ملاحظات الإنهاء",
    "समाप्ति टिप्पणी",
    "د پای یادښت",
    "تێبینی کۆتایی",
    "Nota de término",
    "종료 메모",
    "Note de résiliation",
    "终止说明",
    "Beendigungsvermerk",
    "Примечание о прекращении",
  ],
  "wf.des.terminatedToast": [
    "فرآیند خاتمه یافت — فرآیندهای فرم از این بازه با نسخهٔ جانشین ادامه می‌یابد",
    "Process terminated — the form's processes continue from this date with a successor version",
    "Süreç sonlandırıldı — formun süreçleri bu tarihten itibaren halef sürümle devam eder",
    "تم إنهاء العملية — تتابع عمليات النموذج من هذا التاريخ بإصدار خلف",
    "प्रक्रिया समाप्त हुई — फ़ॉर्म की प्रक्रियाएँ इस तिथि से उत्तराधिकारी संस्करण के साथ चलती रहती हैं",
    "پروسه پای شوې — د فورم پروسیږي له دې نېټې د ځایناستي نسخې سره دوام کوي",
    "پرۆسە کۆتایی هات — پرۆسەکانی فۆرم لەم بەروارە بە وەشانی جێگرەوە بەردەوام دەبن",
    "Processo terminado — os processos do formulário continuam a partir desta data com uma versão sucessora",
    "프로세스가 종료되었습니다 — 폼의 프로세스는 이 날짜부터 후속 버전으로 계속됩니다",
    "Processus résilié — les processus du formulaire continuent à partir de cette date avec une version successeur",
    "流程已终止——表单的流程自此日期起由后续版本继续",
    "Prozess beendet — die Prozesse des Formulars laufen ab diesem Datum mit einer Nachfolgeversion weiter",
    "Процесс прекращён — процессы формы продолжаются с этой даты в версии-преемнике",
  ],
  "wf.des.reinstatedToast": [
    "خاتمهٔ فرآیند برگشت خورده شد — برای ورود به موتور، نسخه را فعال کنید",
    "Termination reverted — activate the version to bring it back to the engine",
    "Sonlandırma geri alındı — sürümü motora dahil etmek için etkinleştirin",
    "تم إرجاع الإنهاء — فعّل الإصدار لإعادته إلى المحرك",
    "समाप्ति वापस ली गई — इंजन में वापस लाने के लिए संस्करण सक्रिय करें",
    "د پای بیرته‌ګرځول شو — انجن ته د راګرځېدو لپاره نسخه فعال کړه",
    "کۆتایی گەڕایەوە — بۆ گەڕانەوە بۆ بزوێنەر، وەشان چالاک بکە",
    "Término revertido — ative a versão para a devolver ao motor",
    "종료가 되돌려졌습니다 — 엔진으로 다시 가져오려면 버전을 활성화하세요",
    "Résiliation annulée — activez la version pour la rendre au moteur",
    "终止已撤销——请激活该版本以使其重新进入引擎",
    "Beendigung zurückgenommen — aktivieren Sie die Version, um sie in die Engine zurückzuholen",
    "Прекращение отменено — активируйте версию, чтобы вернуть её в движок",
  ],
  "wf.des.errFormPick": [
    "ابتدا از کاشی «لیست» یک فرم را انتخاب کنید",
    "First pick a form from the «List» tile",
    "Önce «Liste» kutusundan bir form seçin",
    "اختر نموذجاً أولاً من قائمة «القائمة»",
    "पहले «सूची» टाइल से एक फ़ॉर्म चुनें",
    "لومړی له «لیست» ټایل یو فورم وټاکه",
    "سەرەتا لە کاشی «لیست» فۆرمێک هەڵبژێرە",
    "Primeiro escolha um formulário no mosaico «Lista»",
    "먼저 «목록» 타일에서 폼을 선택하세요",
    "Choisissez d'abord un formulaire dans la tuile « Liste »",
    "请先从「列表」方块中选择一个表单",
    "Wählen Sie zuerst ein Formular in der Kachel «Liste» aus",
    "Сначала выберите форму в плитке «Список»",
  ],
};

const ORDER = [
  "fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru",
];

let src = readFileSync(FILE, "utf8");

/* idempotent: کلیدهایی که قبلاً ×۱۳ درج شده‌اند دوباره درج نشوند */
for (const k of Object.keys(KEYS)) {
  if ((src.split(`"${k}":`).length - 1) === 13) {
    console.log(`skip (already ×13): ${k}`);
    delete KEYS[k];
  }
}

const lines = src.split("\n");

/* anchor line indexes (top→bottom = fa→ru) */
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
