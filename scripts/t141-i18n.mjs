#!/usr/bin/env node
/* Task 141 — درج ۳ کلید تازهٔ atr.* (hint.codePrefix / val.codePrefix / help)
   در هر ۱۳ زبان dictionaries.ts — Anchor: خط "atr.val.natureRequired" در هر
   بلاک زبانی (دقیقاً یک‌بار per locale؛ ترتیب رخداد = ترتیب DICTS). */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const KEYS_BY_LOCALE = {
  fa: [
    '"atr.hint.codePrefix": "کد این سطح باید با کد سرشاخه «{code}» شروع شود؛ ادامهٔ کد را تکمیل کنید."',
    '"atr.val.codePrefix": "کد حساب باید با کد سرشاخه شروع شود."',
    '"atr.help": "درختواره حسابها چهار سطح دارد: گروه حساب، حساب کل، حساب معین و شاخه تفصیلی. با دکمهٔ «جدید» یا راست‌کلیک روی هر گره، زیرشاخهٔ همان سطح اضافه می‌شود؛ کد هر زیرشاخه با کد سرشاخه آغاز می‌شود و طول آن از تنظیمات حسابداری خوانده می‌شود. با آیکون «لیست» رکوردهای ثبت‌شده را ببینید، با «کپی» رکورد باز را به‌صورت ثبت تازه پیش‌پر کنید و از آیکون‌های اکسل/ورد/PDF/چاپ برای خروجی استفاده کنید."',
  ],
  en: [
    '"atr.hint.codePrefix": "This level\'s code must start with the parent code «{code}»; complete the remaining digits."',
    '"atr.val.codePrefix": "The account code must start with its parent code."',
    '"atr.help": "The accounts tree has four levels: account group, total account, subsidiary account and detail branch. Use the «New» button or right-click any node to add a child of the matching level; every child code starts with its parent code, with lengths read from accounting settings. Use the «List» icon to browse saved records, «Copy» to pre-fill a new entry from the open record, and the Excel/Word/PDF/Print icons for output."',
  ],
  tr: [
    '"atr.hint.codePrefix": "Bu seviyenin kodu «{code}» ana koduyla başlamalıdır; kalan haneleri tamamlayın."',
    '"atr.val.codePrefix": "Hesap kodu ana hesabın koduyla başlamalıdır."',
    '"atr.help": "Hesap ağacı dört seviyeden oluşur: hesap grubu, genel hesap, yardımcı hesap ve detay dalı. «Yeni» düğmesiyle veya herhangi bir düğüme sağ tıklayarak ilgili seviyenin alt dalını ekleyin; her alt dalın kodu ana koduyla başlar ve uzunluklar muhasebe ayarlarından okunur. Kayıtlı kayıtları görmek için «Liste», açık kayıttan yeni giriş doldurmak için «Kopyala», çıktı için Excel/Word/PDF/Yazdır simgelerini kullanın."',
  ],
  ar: [
    '"atr.hint.codePrefix": "يجب أن يبدأ كود هذا المستوى بكود الحساب الأصل «{code}»؛ أكمل الأرقام المتبقية."',
    '"atr.val.codePrefix": "يجب أن يبدأ كود الحساب بكود الحساب الأصل."',
    '"atr.help": "شجرة الحسابات لها أربعة مستويات: مجموعة الحسابات، الحساب الكلي، الحساب المعين وفرع التفصيل. أضف الفرع بالمستوى المناسب بزر «جديد» أو بالنقر الأيمن على أي عقدة؛ يبدأ كود كل فرع بكود الحساب الأصل وتُقرأ الأطوال من إعدادات المحاسبة. استخدم أيقونة «القائمة» لعرض السجلات المحفوظة، و«نسخ» لملء إدخال جديد من السجل المفتوح، وأيقونات Excel/Word/PDF/الطباعة للمخرجات."',
  ],
  hi: [
    '"atr.hint.codePrefix": "इस स्तर का कोड मूल कोड «{code}» से शुरू होना चाहिए; शेष अंक पूरे करें।"',
    '"atr.val.codePrefix": "खाता कोड अपने मूल खाते के कोड से शुरू होना चाहिए।"',
    '"atr.help": "खाता वृक्ष में चार स्तर हैं: खाता समूह, सामान्य खाता, सहायक खाता और विवरण शाखा। «नया» बटन या किसी भी नोड पर राइट-क्लिक से उपयुक्त स्तर की शाखा जोड़ें; हर शाखा का कोड अपने मूल कोड से शुरू होता है और लंबाई लेखा सेटिंग्स से पढ़ी जाती है। सहेजे गए रिकॉर्ड देखने के लिए «सूची», खुले रिकॉर्ड से नई प्रविष्टि भरने के लिए «कॉपी» और आउटपुट के लिए Excel/Word/PDF/प्रिंट आइकन का उपयोग करें।"',
  ],
  ps: [
    '"atr.hint.codePrefix": "د دې کچې کوډ باید د مور کوډ «{code}» سره پیل شي؛ پاتې شمېرې بشپړې کړئ."',
    '"atr.val.codePrefix": "د حساب کوډ باید د مور حساب کوډ سره پیل شي."',
    '"atr.help": "د حسابونو ونه څلور کچې لري: د حسابونو ډله، عمومي حساب، فرعي حساب او تفصیلي څانګه. د «نوی» تڼۍ یا پر هره ګوټ کې ښي کلیک سره د اړونده کچې څانګه زیاته کړئ؛ د هرې څانګې کوډ د مور کوډ سره پیلېږي او اوږدوالی له حسابداري تنظیماتو لوستل کېږي. د خوندي شویو ریکارډونو لیدو لپاره «لیست»، د خلاص ریکارډ څخه نوی ثبت ډکولو لپاره «کاپي» او د محصول لپاره Excel/Word/PDF/چاپ آیکونې وکاروئ."',
  ],
  ckb: [
    '"atr.hint.codePrefix": "کۆدی ئەم ئاستە دەبێت بە کۆدی باوک «{code}» دەست پێبکات؛ ژمارە ماوەکان تەواو بکە."',
    '"atr.val.codePrefix": "کۆدی هەژمار دەبێت بە کۆدی هەژماری باوک دەست پێبکات."',
    '"atr.help": "دارەی هەژمارەکان چوار ئاستی هەیە: کۆمەڵەی هەژمارەکان، هەژماری گشتی، هەژماری وردەکاری و لقی وردەکاری. بە دوگمەی «نوێ» یان کلیکی ڕاست لەسەر هەر گرێیەک لقی ئاستی پەیوەند زیاد بکە؛ کۆدی هەر لقێک بە کۆدی باوک دەست پێدەکات و درێژییەکان لە ڕێکخستنەکانی ژمێریارییەوە دەخوێنرێنەوە. بۆ بینینی تۆمارە پاشەکەوتکراوەکان «لیست»، بۆ پڕکردنەوەی تۆمارێکی نوێ لە تۆمارە کراوەکە «کۆپی» و بۆ دەرەنجام ئایکۆنەکانی Excel/Word/PDF/چاپ بەکاربهێنە."',
  ],
  pt: [
    '"atr.hint.codePrefix": "O código deste nível deve começar pelo código do pai «{code}»; complete os dígitos restantes."',
    '"atr.val.codePrefix": "O código da conta deve começar pelo código da conta pai."',
    '"atr.help": "A árvore de contas tem quatro níveis: grupo de contas, conta geral, conta auxiliar e ramo de detalhe. Use o botão «Novo» ou clique com o botão direito em qualquer nó para adicionar um ramo do nível correspondente; o código de cada ramo começa pelo código do pai e os comprimentos são lidos das configurações contábeis. Use o ícone «Lista» para ver os registros salvos, «Copiar» para pré-preencher um novo lançamento a partir do registro aberto e os ícones Excel/Word/PDF/Imprimir para saída."',
  ],
  ko: [
    '"atr.hint.codePrefix": "이 수준의 코드는 상위 코드 «{code}»로 시작해야 합니다. 나머지 자릿수를 완성하세요."',
    '"atr.val.codePrefix": "계정 코드는 상위 계정 코드로 시작해야 합니다."',
    '"atr.help": "계정 트리는 계정 그룹, 총계정계정, 보조계정계정, 상세 분기의 네 수준으로 구성됩니다. «새로 만들기» 버튼이나 노드를 마우스 오른쪽 버튼으로 클릭하여 해당 수준의 하위 분기를 추가하세요. 각 하위 분기의 코드는 상위 코드로 시작하며 길이는 회계 설정에서 읽어옵니다. «목록» 아이콘으로 저장된 레코드를 보고, «복사»로 열려 있는 레코드를 새 입력에 미리 채우고, Excel/Word/PDF/인쇄 아이콘으로 출력하세요."',
  ],
  fr: [
    '"atr.hint.codePrefix": "Le code de ce niveau doit commencer par le code parent «{code}» ; complétez les chiffres restants."',
    '"atr.val.codePrefix": "Le code du compte doit commencer par le code du compte parent."',
    '"atr.help": "L\'arborescence des comptes comporte quatre niveaux : groupe de comptes, compte général, compte auxiliaire et branche de détail. Utilisez le bouton «Nouveau» ou le clic droit sur un nœud pour ajouter une branche du niveau correspondant ; le code de chaque branche commence par le code parent, les longueurs étant lues dans les paramètres comptables. Utilisez l\'icône «Liste» pour consulter les enregistrements, «Copier» pour pré-remplir une nouvelle saisie à partir de l\'enregistrement ouvert, et les icônes Excel/Word/PDF/Imprimer pour la sortie."',
  ],
  zh: [
    '"atr.hint.codePrefix": "此级代码必须以上级代码「{code}」开头；请补全其余数字。"',
    '"atr.val.codePrefix": "科目代码必须以其上级科目代码开头。"',
    '"atr.help": "科目树共四级：科目组、总账科目、明细科目和辅助核算分支。用「新建」按钮或右键点击任意节点添加相应级别的下级；每个下级的代码都以上级代码开头，代码长度读取会计设置。用「列表」图标查看已保存记录，用「复制」以打开的记录预填新录入，用 Excel/Word/PDF/打印图标输出。"',
  ],
  de: [
    '"atr.hint.codePrefix": "Der Code dieser Ebene muss mit dem übergeordneten Code «{code}» beginnen; vervollständigen Sie die restlichen Ziffern."',
    '"atr.val.codePrefix": "Der Kontocode muss mit dem Code des übergeordneten Kontos beginnen."',
    '"atr.help": "Der Kontenbaum hat vier Ebenen: Kontengruppe, Sachkonto, Unterkonto und Detailzweig. Mit der Schaltfläche «Neu» oder per Rechtsklick auf einen Knoten fügen Sie einen Zweig der entsprechenden Ebene hinzu; der Code jedes Zweigs beginnt mit dem übergeordneten Code, die Längen stammen aus den Buchhaltungseinstellungen. Mit «Liste» sehen Sie gespeicherte Datensätze, mit «Kopieren» füllen Sie einen neuen Eintrag aus dem geöffneten Datensatz vor, Excel/Word/PDF/Druck liefern die Ausgabe."',
  ],
  ru: [
    '"atr.hint.codePrefix": "Код этого уровня должен начинаться с кода родителя «{code}»; дополните остальные цифры."',
    '"atr.val.codePrefix": "Код счёта должен начинаться с кода родительского счёта."',
    '"atr.help": "Дерево счетов имеет четыре уровня: группа счетов, синтетический счёт, аналитический счёт и детальная ветвь. Кнопкой «Новый» или правым кликом по узлу добавьте ветвь соответствующего уровня; код каждой ветви начинается с кода родителя, длины считываются из настроек бухгалтерии. Иконка «Список» показывает сохранённые записи, «Копировать» предварительно заполняет новую запись из открытой, Excel/Word/PDF/Печать — для вывода."',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"atr.val.natureRequired"')) anchors.push(i);
}
if (anchors.length !== 13) {
  console.error(`FATAL: expected 13 anchors, found ${anchors.length}`);
  process.exit(1);
}

/* درج از پایین به بالا تا ایندکس‌ها جابه‌جا نشوند */
for (let k = anchors.length - 1; k >= 0; k--) {
  const locale = ORDER[k];
  const block = KEYS_BY_LOCALE[locale].map((s) => "  " + s + ",");
  lines.splice(anchors[k] + 1, 0, ...block);
  console.log(`inserted 3 keys after anchor#${k} (${locale})`);
}

const out = lines.join("\n");
/* خودآزما — هر کلید دقیقاً ×۱۳ */
for (const key of ["atr.hint.codePrefix", "atr.val.codePrefix", "atr.help"]) {
  const n = out.split(`"${key}"`).length - 1;
  if (n !== 13) {
    console.error(`FATAL: key ${key} appears ${n} times (expected 13)`);
    process.exit(1);
  }
  console.log(`ok: ${key} ×${n}`);
}
writeFileSync(PATH, out, "utf8");
console.log("done — dictionaries.ts updated");
