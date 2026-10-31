/**
 * Task t191 — i18n: فرمان مالک — «در فرم طراح فرآیند گردش کار تغییرات زیر را
 * اعمال کنید»: ① عنوان فرم «طراحی فرآیند گردش کار» (جایگزینی مقدار
 * wf.des.title ×۱۳) ② کارت «شرط‌های ورود» — هفت فیلتر حسابداری برای فرم
 * «سند حسابداری» (نوع سند، ماهیت سند، گروه حساب، حساب کل، حساب معین،
 * نوع تفصیلی، جزئیات انواع تفصیلی) + فیلدهای عمومی (مبلغ سند، شرح/توضیحات)
 * ③ عملگرهای یکسان همهٔ فرم‌ها: شامل، بزرگتر از، کوچکتر از، برابر با،
 * شامل نباشد، خالی باشد، خالی نباشد ④ اتصال و/یا فیلترهای ترکیبی.
 * الگو: اسکریپت t190 — جایگزینی عنوان + درج پس از خط لنگرِ «wf.des.title»
 * در هر بلوک زبانی (از پایین به بالا) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"wf.des.title":';

/* ---- ① جایگزینی عنوان فرم ×۱۳ (ترتیب ORDER پایین همین فایل) ---- */
const NEW_TITLE = [
  "طراحی فرآیند گردش کار", // fa
  "Workflow Process Design", // en
  "İş akışı süreç tasarımı", // tr
  "تصميم عملية سير العمل", // ar
  "वर्कफ़्लो प्रक्रिया डिज़ाइन", // hi
  "د کار جریان بهیر ډیزاین", // ps
  "دیزاینی پرۆسەی ڕەوتی کار", // ckb
  "Desenho do processo de fluxo de trabalho", // pt
  "워크플로 프로세스 설계", // ko
  "Conception du processus de flux de travail", // fr
  "工作流流程设计", // zh
  "Workflow-Prozessdesign", // de
  "Проектирование процесса рабочего процесса", // ru
];

const KEYS = {
  "wf.des.condTitle": [
    "شرط‌های ورود به گردش کار",
    "Workflow entry conditions",
    "İş akışı giriş koşulları",
    "شروط الدخول إلى سير العمل",
    "वर्कफ़्लो प्रवेश शर्तें",
    "د کار جریان د ننوتلو شرایط",
    "مەرجەکانی چوونە ژوورەوەی ڕەوتی کار",
    "Condições de entrada do fluxo de trabalho",
    "워크플로 시작 조건",
    "Conditions d'entrée du flux de travail",
    "工作流进入条件",
    "Workflow-Eintrittsbedingungen",
    "Условия входа в рабочий процесс",
  ],
  "wf.des.condCount": [
    "تعداد شرط‌ها",
    "Condition count",
    "Koşul sayısı",
    "عدد الشروط",
    "शर्तों की संख्या",
    "د شرایطو شمېر",
    "ژمارەی مەرجەکان",
    "Número de condições",
    "조건 수",
    "Nombre de conditions",
    "条件数量",
    "Anzahl Bedingungen",
    "Количество условий",
  ],
  "wf.des.condAdd": [
    "افزودن شرط",
    "Add condition",
    "Koşul ekle",
    "إضافة شرط",
    "शर्त जोड़ें",
    "شرط ورګډول",
    "زیادکردنی مەرج",
    "Adicionar condição",
    "조건 추가",
    "Ajouter une condition",
    "添加条件",
    "Bedingung hinzufügen",
    "Добавить условие",
  ],
  "wf.des.condSave": [
    "ذخیرهٔ شرط‌ها",
    "Save conditions",
    "Koşulları kaydet",
    "حفظ الشروط",
    "शर्तें सहेजें",
    "شرطونه خوندي کول",
    "پاشەکردنی مەرجەکان",
    "Salvar condições",
    "조건 저장",
    "Enregistrer les conditions",
    "保存条件",
    "Bedingungen speichern",
    "Сохранить условия",
  ],
  "wf.des.condSavedToast": [
    "شرط‌های ورود ذخیره شد",
    "Entry conditions saved",
    "Giriş koşulları kaydedildi",
    "تم حفظ شروط الدخول",
    "प्रवेश शर्तें सहेजी गईं",
    "د ننوتلو شرایط وخوندي شول",
    "مەرجەکانی چوونەژوورەوە پاشەکرا",
    "Condições de entrada salvas",
    "시작 조건이 저장되었습니다",
    "Conditions d'entrée enregistrées",
    "进入条件已保存",
    "Eintrittsbedingungen gespeichert",
    "Условия входа сохранены",
  ],
  "wf.des.condSaveViaMainSave": [
    "برای ذخیرهٔ شرط‌ها، ابتدا فرآیند را با «ذخیره اطلاعات» ثبت کنید",
    "To save conditions, first save the process with «Save»",
    "Koşulları kaydetmek için önce süreci «Kaydet» ile kaydedin",
    "لحفظ الشروط، احفظ العملية أولاً بـ «حفظ المعلومات»",
    "शर्तें सहेजने के लिए पहले प्रक्रिया को «सहेजें» से सहेजें",
    "د شرایطو د خوندي کولو لپاره لومړی پروسه په «معلومات خوندي کول» سره ثبت کړه",
    "بۆ پاشەکردنی مەرجەکان، سەرەتا پرۆسە بە «پاشەکردنی زانیاری» تۆمار بکە",
    "Para salvar as condições, primeiro salve o processo com «Salvar»",
    "조건을 저장하려면 먼저 «저장»으로 프로세스를 저장하세요",
    "Pour enregistrer les conditions, enregistrez d'abord le processus avec « Enregistrer »",
    "要保存条件，请先使用「保存信息」保存流程",
    "Um Bedingungen zu speichern, speichern Sie den Prozess zuerst mit «Speichern»",
    "Чтобы сохранить условия, сначала сохраните процесс кнопкой «Сохранить»",
  ],
  "wf.des.condHint": [
    "هر شرط با ردیفِ قبلی خود با «و/یا» ترکیب می‌شود؛ شرطِ مبلغ می‌تواند به «آستانهٔ فرم» ارجاع دهد یا عدد مستقیم باشد.",
    "Each condition is combined with the previous row via «and/or»; the amount condition can reference the form threshold or a direct number.",
    "Her koşul önceki satırla «ve/veya» ile birleşir; tutar koşulu form eşiğine veya doğrudan sayıya başvurabilir.",
    "يُدمج كل شرط بالصف السابق عبر «و/أو»؛ ويمكن لشرط المبلغ الإشارة إلى عتبة النموذج أو رقم مباشر.",
    "प्रत्येक शर्त पिछली पंक्ति के साथ «और/या» से जुड़ती है; राशि शर्त फ़ॉर्म सीमा या सीधा नंबर हो सकता है।",
    "هر شرط له پخواني کتار سره په «او/یا» یوځای کیږي؛ د مبلغ شرط کولی شي ته درنوازي یا مستقیم عدد وي.",
    "هەر مەرجێک لەگەڵ ڕیزی پێشووی بە «و/یان» یەکدەگرێت؛ مەرجی بڕ دەتوانێت ئاماژە بە قەپازی فۆرم بێت یان ژمارەی ڕاستەوخۆ.",
    "Cada condição é combinada com a linha anterior via «e/ou»; a condição de valor pode referenciar o limite do formulário ou um número direto.",
    "각 조건은 이전 행과 «그리고/또는»으로 결합됩니다; 금액 조건은 양식 임계값 또는 직접 숫자를 참조할 수 있습니다.",
    "Chaque condition est combinée avec la ligne précédente via « et/ou » ; la condition de montant peut référencer le seuil du formulaire ou un nombre direct.",
    "每个条件通过「和/或」与上一行组合；金额条件可引用表单阈值或直接数字。",
    "Jede Bedingung wird über «und/oder» mit der vorherigen Zeile kombiniert; die Betragsbedingung kann auf den Formular-Schwellenwert oder eine direkte Zahl verweisen.",
    "Каждое условие комбинируется с предыдущей строкой через «и/или»; условие суммы может ссылаться на порог формы или прямое число.",
  ],
  "wf.des.condNonVoucherNote": [
    "فیلترهای حسابداری (نوع/ماهیت سند، گروه حساب، حساب کل، حساب معین، نوع تفصیلی و جزئیات آن) فقط برای فرم «سند حسابداری» فعال می‌شود.",
    "Accounting filters (voucher type/nature, account group, ledger, subsidiary, detail type and its items) are only enabled for the «Accounting Voucher» form.",
    "Muhasebe filtreleri (fiş türü/niteliği, hesap grubu, büyük hesap, yardımcı hesap, detay türü ve kalemleri) yalnızca «Muhasebe Fişi» formunda etkindir.",
    "فلاتر المحاسبة (نوع/طبيعة السند، مجموعة الحسابات، الحساب الرئيسي، الحساب المعين، نوع التفصيل وعناصره) متاحة فقط لنموذج «سند محاسبي».",
    "लेखा फ़िल्टर (वाउचर प्रकार/प्रकृति, खाता समूह, मुख्य खाता, सहायक खाता, विवरण प्रकार और उसकी मदें) केवल «लेखा वाउचर» फ़ॉर्म के लिए सक्रिय हैं।",
    "د حسابداري فلټرونه (د سند ډول/طبیعت، د حسابونو ډله، عمومي حساب، معین حساب، تفصیلي ډول او یې توکي) یوازې د «حسابداري سند» فورم لپاره فعال دي.",
    "فلتەرە ژمێریارییەکان (جۆر/سروشتی سند، گروپی حساب، حسابی سەرەکی، حسابی معین، جۆری وردەکاری و بڕەکانی) تەنها بۆ فۆرمی «سندی ژمێریاری» چالاکە.",
    "Os filtros contábeis (tipo/natureza do comprovante, grupo de contas, conta razão, conta auxiliar, tipo de detalhe e seus itens) só estão ativos no formulário «Comprovante Contábil».",
    "회계 필터(전표 유형/성격, 계정 그룹, 총계정, 보조계정, 세부 유형 및 항목)는 «회계 전표» 양식에서만 활성화됩니다.",
    "Les filtres comptables (type/nature de pièce, groupe de comptes, compte général, compte auxiliaire, type de détail et ses éléments) ne sont actifs que pour le formulaire « Pièce comptable ».",
    "会计筛选（凭证类型/性质、账户组、总账、明细账、明细类型及其项目）仅在「会计凭证」表单中可用。",
    "Buchhaltungfilter (Belegart/Art, Kontogruppe, Hauptkonto, Unterkonto, Detailtyp und dessen Posten) sind nur für das Formular «Buchungsbeleg» aktiv.",
    "Бухгалтерские фильтры (тип/природа документа, группа счетов, синтетический счёт, аналитический счёт, тип детализации и её элементы) доступны только для формы «Бухгалтерский документ».",
  ],
  "wf.des.condTerminatedNote": [
    "این فرآیند خاتمه یافته است — شرط‌ها فقط-خواندنی‌اند؛ برای ویرایش ابتدا «برگشت خاتمه» را بزنید.",
    "This process is terminated — conditions are read-only; use «Reinstate» to edit.",
    "Bu süreç sonlandırıldı — koşullar salt okunur; düzenlemek için «Sonlandırmayı geri al» kullanın.",
    "تم إنهاء هذه العملية — الشروط للقراءة فقط؛ استخدم «التراجع عن الإنهاء» للتعديل.",
    "यह प्रक्रिया समाप्त की गई है — शर्तें केवल-पढ़ने योग्य हैं; संपादन के लिए «समाप्ति वापस» का उपयोग करें।",
    "دا پروسه پای ته رسیدلې — شرایط یوازې د لوستلو وړ دي؛ د سمون لپاره لومړی «د پای بیرته راګرځول» وګوره.",
    "ئەم پرۆسەیە کۆتایی هاتووە — مەرجەکان تەنها بۆ خوێندنەوەیە؛ بۆ دەستکاریکردن سەرەتا «گەڕانەوەی کۆتایی» بکە.",
    "Este processo está encerrado — as condições são somente leitura; use «Restaurar encerramento» para editar.",
    "이 프로세스는 종료되었습니다 — 조건은 읽기 전용입니다; 편집하려면 «종료 취소»를 사용하세요.",
    "Ce processus est résilié — les conditions sont en lecture seule ; utilisez « Annuler la résiliation » pour modifier.",
    "此流程已终止 — 条件为只读；如需编辑请先使用「撤销终止」。",
    "Dieser Prozess wurde beendet — Bedingungen sind schreibgeschützt; zum Bearbeiten «Beendigung zurücknehmen» verwenden.",
    "Этот процесс завершён — условия доступны только для чтения; для редактирования используйте «Отменить завершение».",
  ],
  "wf.des.condEmpty": [
    "هنوز شرطی تعریف نشده است — با «افزودن شرط» شروع کنید.",
    "No conditions defined yet — start with «Add condition».",
    "Henüz koşul tanımlanmadı — «Koşul ekle» ile başlayın.",
    "لم يتم تعريف أي شرط بعد — ابدأ بـ «إضافة شرط».",
    "अभी कोई शर्त परिभाषित नहीं है — «शर्त जोड़ें» से शुरू करें।",
    "تر اوسه شرط تعریف شوې نه ده — په «شرط ورګډول» پیل وکړه.",
    "هێشتا هیچ مەرجێک دیاری نەکراوە — بە «زیادکردنی مەرج» دەست پێبکە.",
    "Nenhuma condição definida ainda — comece com «Adicionar condição».",
    "아직 조건이 정의되지 않았습니다 — «조건 추가»로 시작하세요.",
    "Aucune condition définie — commencez par « Ajouter une condition ».",
    "尚未定义任何条件 — 请从「添加条件」开始。",
    "Noch keine Bedingungen definiert — beginnen Sie mit «Bedingung hinzufügen».",
    "Условия ещё не определены — начните с «Добавить условие».",
  ],
  "wf.des.condWhere": [
    "شرط:",
    "Where:",
    "Koşul:",
    "الشرط:",
    "शर्त:",
    "شرط:",
    "مەرج:",
    "Onde:",
    "조건:",
    "Condition :",
    "条件：",
    "Bedingung:",
    "Условие:",
  ],
  "wf.des.condJoin": [
    "اتصال با شرط قبلی",
    "Join with previous condition",
    "Önceki koşulla birleşim",
    "الربط بالشرط السابق",
    "पिछली शर्त से जोड़",
    "له پخواني شرط سره اتصال",
    "گرێدان بە مەرجی پێشوو",
    "Junção com a condição anterior",
    "이전 조건과의 결합",
    "Jonction avec la condition précédente",
    "与上一条件的连接",
    "Verknüpfung mit der vorherigen Bedingung",
    "Соединение с предыдущим условием",
  ],
  "wf.des.condField": [
    "فیلد",
    "Field",
    "Alan",
    "الحقل",
    "फ़ील्ड",
    "فیلډ",
    "خانە",
    "Campo",
    "필드",
    "Champ",
    "字段",
    "Feld",
    "Поле",
  ],
  "wf.des.condOp": [
    "عملگر",
    "Operator",
    "Operatör",
    "المعامل",
    "ऑपरेटर",
    "عملګر",
    "کردەکار",
    "Operador",
    "연산자",
    "Opérateur",
    "运算符",
    "Operator",
    "Оператор",
  ],
  "wf.des.condValue": [
    "مقدار",
    "Value",
    "Değer",
    "القيمة",
    "मान",
    "ارزښت",
    "نرخ",
    "Valor",
    "값",
    "Valeur",
    "值",
    "Wert",
    "Значение",
  ],
  "wf.des.joinAnd": [
    "و",
    "AND",
    "VE",
    "و",
    "और",
    "او",
    "و",
    "E",
    "그리고",
    "ET",
    "和",
    "UND",
    "И",
  ],
  "wf.des.joinOr": [
    "یا",
    "OR",
    "VEYA",
    "أو",
    "या",
    "یا",
    "یان",
    "OU",
    "또는",
    "OU",
    "或",
    "ODER",
    "ИЛИ",
  ],
  "wf.des.condNoValue": [
    "بدون مقدار",
    "No value",
    "Değer yok",
    "بدون قيمة",
    "कोई मान नहीं",
    "بې ارزښت",
    "بێ نرخ",
    "Sem valor",
    "값 없음",
    "Sans valeur",
    "无值",
    "Kein Wert",
    "Без значения",
  ],
  "wf.des.condUseThreshold": [
    "آستانهٔ فرم",
    "Form threshold",
    "Form eşiği",
    "عتبة النموذج",
    "फ़ॉर्म सीमा",
    "فورم ته درنوازی",
    "قەپازی فۆرم",
    "Limite do formulário",
    "양식 임계값",
    "Seuil du formulaire",
    "表单阈值",
    "Formular-Schwellenwert",
    "Порог формы",
  ],
  "wf.des.condThresholdMissing": [
    "آستانهٔ مبلغ فرم خالی است — در فیلدها مقدار دهید یا مقدار مستقیم وارد کنید",
    "The form amount threshold is empty — set it in the fields or enter a direct value",
    "Formun tutar eşiği boş — alanlarda ayarlayın veya doğrudan değer girin",
    "عتبة مبلغ النموذج فارغة — عيّنها في الحقول أو أدخل قيمة مباشرة",
    "फ़ॉर्म की राशि सीमा रिक्त है — फ़ील्ड में सेट करें या सीधा मान दर्ज करें",
    "د فورم د مبلغ ته درنوازی خالي ده — په فیلډونو کې یې ټاکل یا مستقیم ارزښت ولیکه",
    "قەپازی بڕی فۆرم بەتاڵە — لە خانەکاندا دابنێ یان نرخێکی ڕاستەوخۆ بنووسە",
    "O limite de valor do formulário está vazio — defina-o nos campos ou insira um valor direto",
    "양식 금액 임계값이 비어 있습니다 — 필드에서 설정하거나 직접 값을 입력하세요",
    "Le seuil de montant du formulaire est vide — définissez-le dans les champs ou saisissez une valeur directe",
    "表单金额阈值为空 — 请在字段中设置或直接输入数值",
    "Der Betragsschwellenwert des Formulars ist leer — in den Feldern festlegen oder direkt eingeben",
    "Порог суммы формы пуст — задайте его в полях или введите прямое значение",
  ],
  "wf.des.condSavedValue": [
    "مقدار ذخیره‌شده",
    "Saved value",
    "Kayıtlı değer",
    "قيمة محفوظة",
    "सहेजा गया मान",
    "خوندي شوی ارزښت",
    "نرخی پاشەکراو",
    "Valor salvo",
    "저장된 값",
    "Valeur enregistrée",
    "已保存的值",
    "Gespeicherter Wert",
    "Сохранённое значение",
  ],
  "wf.des.errCondInvalid": [
    "یک یا چند شرط ناقص است — فیلد، عملگر و مقدار هر شرط را کامل کنید",
    "One or more conditions are incomplete — complete the field, operator and value of each condition",
    "Bir veya daha fazla koşul eksik — her koşulun alanını, operatörünü ve değerini tamamlayın",
    "شرط واحد أو أكثر غير مكتمل — أكمل الحقل والمعامل والقيمة لكل شرط",
    "एक या अधिक शर्तें अधूरी हैं — प्रत्येक शर्त का फ़ील्ड, ऑपरेटर और मान पूरा करें",
    "یو یا څو شرطونه نیمګړي دي — د هر شرط فیلډ، عملګر او ارزښت بشپړ کړه",
    "یەک یان چەند مەرجێک ناتەواوە — خانە، کردەکار و نرخی هەر مەرجێک تەواو بکە",
    "Uma ou mais condições estão incompletas — complete o campo, o operador e o valor de cada condição",
    "하나 이상의 조건이 불완전합니다 — 각 조건의 필드, 연산자, 값을 완성하세요",
    "Une ou plusieurs conditions sont incomplètes — complétez le champ, l'opérateur et la valeur de chaque condition",
    "一个或多个条件不完整 — 请补全每个条件的字段、运算符和值",
    "Eine oder mehrere Bedingungen sind unvollständig — Feld, Operator und Wert jeder Bedingung vervollständigen",
    "Одно или несколько условий неполны — заполните поле, оператор и значение каждого условия",
  ],
  "wf.des.errCondAmountNumber": [
    "مقدار شرطِ مبلغ باید عدد باشد یا از «آستانهٔ فرم» استفاده کنید",
    "The amount condition value must be a number or use the «Form threshold»",
    "Tutar koşulu değeri bir sayı olmalı veya «Form eşiği» kullanın",
    "يجب أن تكون قيمة شرط المبلغ رقماً أو استخدم «عتبة النموذج»",
    "राशि शर्त का मान एक संख्या होनी चाहिए या «फ़ॉर्म सीमा» का उपयोग करें",
    "د مبلغ شرط ارزښت باید عدد وي یا له «فورم ته درنوازی» کار واخله",
    "نرخی مەرجی بڕ دەبێت ژمارە بێت یان «قەپازی فۆرم» بەکاربهێنە",
    "O valor da condição de valor deve ser um número ou usar o «Limite do formulário»",
    "금액 조건 값은 숫자이거나 «양식 임계값»을 사용해야 합니다",
    "La valeur de la condition de montant doit être un nombre ou utiliser le « Seuil du formulaire »",
    "金额条件的值必须是数字或使用「表单阈值」",
    "Der Wert der Betragsbedingung muss eine Zahl sein oder den «Formular-Schwellenwert» verwenden",
    "Значение условия суммы должно быть числом или использовать «Порог формы»",
  ],
  "wf.des.condFieldAmount": [
    "مبلغ سند (ریال)",
    "Voucher amount (Rial)",
    "Fiş tutarı (Riyal)",
    "مبلغ السند (ريال)",
    "वाउचर राशि (रियाल)",
    "د سند مبلغ (ریال)",
    "بڕی سند (ریال)",
    "Valor do comprovante (Rial)",
    "전표 금액 (리알)",
    "Montant de la pièce (Rial)",
    "凭证金额 (里亚尔)",
    "Belegbetrag (Rial)",
    "Сумма документа (риал)",
  ],
  "wf.des.condFieldDescription": [
    "شرح / توضیحات",
    "Description",
    "Açıklama",
    "الشرح / الوصف",
    "विवरण",
    "شرح / تشریحات",
    "وردەکاری / شرح",
    "Descrição",
    "설명",
    "Description",
    "描述",
    "Beschreibung",
    "Описание",
  ],
  "wf.des.condFieldType": [
    "نوع سند",
    "Voucher type",
    "Fiş türü",
    "نوع السند",
    "वाउचर प्रकार",
    "د سند ډول",
    "جۆری سند",
    "Tipo de comprovante",
    "전표 유형",
    "Type de pièce",
    "凭证类型",
    "Belegart",
    "Тип документа",
  ],
  "wf.des.condFieldNature": [
    "ماهیت سند",
    "Voucher nature",
    "Fiş niteliği",
    "طبيعة السند",
    "वाउचर प्रकृति",
    "د سند ماهیت",
    "سروشتی سند",
    "Natureza do comprovante",
    "전표 성격",
    "Nature de la pièce",
    "凭证性质",
    "Belegart (Charakter)",
    "Природа документа",
  ],
  "wf.des.condFieldGroup": [
    "گروه حساب",
    "Account group",
    "Hesap grubu",
    "مجموعة الحسابات",
    "खाता समूह",
    "د حسابونو ډله",
    "گروپی حساب",
    "Grupo de contas",
    "계정 그룹",
    "Groupe de comptes",
    "账户组",
    "Kontogruppe",
    "Группа счетов",
  ],
  "wf.des.condFieldLedger": [
    "حساب کل",
    "Ledger account",
    "Büyük hesap",
    "الحساب الرئيسي",
    "मुख्य खाता",
    "عمومي حساب",
    "حسابی سەرەکی",
    "Conta razão",
    "총계정 계정",
    "Compte général",
    "总账账户",
    "Hauptkonto",
    "Синтетический счёт",
  ],
  "wf.des.condFieldSubsidiary": [
    "حساب معین",
    "Subsidiary account",
    "Yardımcı hesap",
    "الحساب المعين",
    "सहायक खाता",
    "معین حساب",
    "حسابی معین",
    "Conta auxiliar",
    "보조 계정",
    "Compte auxiliaire",
    "明细账户",
    "Unterkonto",
    "Аналитический счёт",
  ],
  "wf.des.condFieldDetailType": [
    "نوع تفصیلی",
    "Detail type",
    "Detay türü",
    "نوع التفصيل",
    "विवरण प्रकार",
    "تفصیلي ډول",
    "جۆری وردەکاری",
    "Tipo de detalhe",
    "세부 유형",
    "Type de détail",
    "明细类型",
    "Detailtyp",
    "Тип детализации",
  ],
  "wf.des.condFieldDetailItem": [
    "جزئیات انواع تفصیلی",
    "Detail type items",
    "Detay türü kalemleri",
    "عناصر أنواع التفصيل",
    "विवरण प्रकार की मदें",
    "د تفصیلي ډولونو توکي",
    "بڕەکانی جۆری وردەکاری",
    "Itens do tipo de detalhe",
    "세부 유형 항목",
    "Éléments du type de détail",
    "明细类型项目",
    "Detailtyp-Posten",
    "Элементы типа детализации",
  ],
  "wf.des.opContains": [
    "شامل",
    "Contains",
    "İçerir",
    "يحتوي",
    "शामिल",
    "شامل",
    "لەخۆبگرێت",
    "Contém",
    "포함",
    "Contient",
    "包含",
    "Enthält",
    "Содержит",
  ],
  "wf.des.opGt": [
    "بزرگتر از",
    "Greater than",
    "Büyüktür",
    "أكبر من",
    "से बड़ा",
    "له زیاتر",
    "گەورەتر لە",
    "Maior que",
    "보다 큼",
    "Supérieur à",
    "大于",
    "Größer als",
    "Больше чем",
  ],
  "wf.des.opLt": [
    "کوچکتر از",
    "Less than",
    "Küçüktür",
    "أصغر من",
    "से छोटा",
    "له کمتر",
    "بچووکتر لە",
    "Menor que",
    "보다 작음",
    "Inférieur à",
    "小于",
    "Kleiner als",
    "Меньше чем",
  ],
  "wf.des.opEq": [
    "برابر با",
    "Equals",
    "Eşittir",
    "يساوي",
    "बराबर",
    "برابر",
    "یەکسانە بە",
    "Igual a",
    "같음",
    "Égal à",
    "等于",
    "Gleich",
    "Равно",
  ],
  "wf.des.opNotContains": [
    "شامل نباشد",
    "Does not contain",
    "İçermez",
    "لا يحتوي",
    "शामिल न हो",
    "شامل نه وي",
    "لەخۆنەگرێت",
    "Não contém",
    "포함하지 않음",
    "Ne contient pas",
    "不包含",
    "Enthält nicht",
    "Не содержит",
  ],
  "wf.des.opEmpty": [
    "خالی باشد",
    "Is empty",
    "Boş olur",
    "فارغ",
    "खाली है",
    "خالي وي",
    "بەتاڵ بێت",
    "Está vazio",
    "비어 있음",
    "Est vide",
    "为空",
    "Ist leer",
    "Пусто",
  ],
  "wf.des.opNotEmpty": [
    "خالی نباشد",
    "Is not empty",
    "Boş olmaz",
    "غير فارغ",
    "खाली नहीं है",
    "خالي نه وي",
    "بەتاڵ نەبێت",
    "Não está vazio",
    "비어 있지 않음",
    "N'est pas vide",
    "不为空",
    "Ist nicht leer",
    "Не пусто",
  ],
  "wf.des.natureNormal": [
    "عادی",
    "Normal",
    "Normal",
    "عادي",
    "सामान्य",
    "عادي",
    "ئاسایی",
    "Normal",
    "일반",
    "Normale",
    "普通",
    "Normal",
    "Обычный",
  ],
  "wf.des.natureLegal": [
    "قانونی",
    "Statutory",
    "Yasal",
    "قانوني",
    "वैधानिक",
    "قانوني",
    "یاسایی",
    "Estatutário",
    "법정",
    "Statutaire",
    "法定",
    "Gesetzlich",
    "Законодательный",
  ],
  "wf.des.unsavedBadge": [
    "ذخیره‌نشده",
    "Unsaved",
    "Kaydedilmedi",
    "غير محفوظ",
    "असहेजित",
    "ناخوندي",
    "پاشەنەکراو",
    "Não salvo",
    "저장 안 됨",
    "Non enregistré",
    "未保存",
    "Nicht gespeichert",
    "Не сохранено",
  ],
};

const ORDER = [
  "fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru",
];

let src = readFileSync(FILE, "utf8");

/* ---- ① جایگزینی عنوان ×۱۳ (idempotent — مقدار تازه دوباره نوشته می‌شود) ---- */
const titleLines = src.split("\n");
let replaced = 0;
for (let i = 0; i < titleLines.length; i++) {
  if (titleLines[i].includes(ANCHOR)) {
    if (replaced >= NEW_TITLE.length) {
      console.error(`FAIL: anchor title found more than ${NEW_TITLE.length}×`);
      process.exit(1);
    }
    titleLines[i] = titleLines[i].replace(
      /("wf\.des\.title":\s*")[^"]*(")/,
      `$1${NEW_TITLE[replaced]}$2`,
    );
    replaced++;
  }
}
if (replaced !== NEW_TITLE.length) {
  console.error(`FAIL: anchor title found ${replaced}× (expected ${NEW_TITLE.length})`);
  process.exit(1);
}
src = titleLines.join("\n");
console.log(`replaced wf.des.title ×${replaced}`);

/* ---- ② کلیدهای تازه (idempotent: کلیدهای موجود ×۱۳ رد می‌شوند) ---- */
for (const k of Object.keys(KEYS)) {
  if ((src.split(`"${k}":`).length - 1) === 13) {
    console.log(`skip (already ×13): ${k}`);
    delete KEYS[k];
  }
}
if (Object.keys(KEYS).length === 0) {
  console.log("OK — nothing to insert");
  writeFileSync(FILE, src);
  process.exit(0);
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
/* عنوان هم باید ×۱۳ با مقدارهای تازه باشد */
let tOk = 0;
for (const v of NEW_TITLE) {
  if (out.includes(`"wf.des.title": "${v}"`)) tOk++;
}
if (tOk !== 13) {
  console.error(`title: only ${tOk}/13 new values present ✗`);
  ok = false;
}
if (!ok) {
  console.error("FAIL: self-test failed");
  process.exit(1);
}
console.log(`OK — ${Object.keys(KEYS).length} new keys + title replace ×13 (${Object.keys(KEYS).length * 13} lines added)`);
