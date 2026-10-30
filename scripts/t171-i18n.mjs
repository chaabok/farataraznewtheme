/**
 * Task 171 — i18n: کلیدهای عملیات صفحه‌کلید و درج ردیف و شرح پرتکرارِ فرم سند
 * (فرمان مالک: F3 کپی سلول از ردیف بالا، F4 جابجایی بدهکار/بستانکار، F5 کپی
 * کامل ردیف از بالا، Ctrl+C/Ctrl+V کپی/چسباندن ردیف، درج ردیف خالی بین ردیف‌ها،
 * F6/دکمهٔ دیسکت ذخیرهٔ شرح در شرح‌های پرتکرار معین) در هر ۱۳ زبان.
 * الگو: اسکریپت t170 — درج پس از خط لنگرِ «vc.addRow»
 * در هر بلوک زبانی (از پایین به بالا برای ثابت‌ماندن شمارهٔ سطرها) + خودآزمای ×۱۳.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/i18n/dictionaries.ts";
const ANCHOR = '"vc.addRow":';

const KEYS = {
  "vc.insertRowHere": [
    "درج ردیف خالی در اینجا",
    "Insert empty row here",
    "Buraya boş satır ekle",
    "إدراج صف فارغ هنا",
    "यहाँ खाली पंक्ति डालें",
    "دلته خالي کتار داخل کړئ",
    "لێرە دێڕی بەتاڵ زیاد بکە",
    "Inserir linha vazia aqui",
    "여기에 빈 행 삽입",
    "Insérer une ligne vide ici",
    "在此处插入空行",
    "Hier leere Zeile einfügen",
    "Вставить пустую строку здесь",
  ],
  "vc.rowCopyToast": [
    "اطلاعات ردیف کپی شد — روی ردیف مقصد Ctrl+V بزنید",
    "Row copied — press Ctrl+V on the target row",
    "Satır kopyalandı — hedef satırda Ctrl+V tuşlayın",
    "تم نسخ الصف — اضغط Ctrl+V على صف الوجهة",
    "पंक्ति कॉपी हुई — लक्ष्य पंक्ति पर Ctrl+V दबाएँ",
    "کتار کاپي شو — په نښه کتار باندې Ctrl+V کېکاږئ",
    "دێڕ کۆپی کرا — لەسەر دێڕی مەبەست Ctrl+V دابگرە",
    "Linha copiada — pressione Ctrl+V na linha de destino",
    "행이 복사되었습니다 — 대상 행에서 Ctrl+V를 누르세요",
    "Ligne copiée — appuyez sur Ctrl+V sur la ligne cible",
    "已复制该行 — 在目标行按 Ctrl+V",
    "Zeile kopiert — drücken Sie Strg+V in der Zielzeile",
    "Строка скопирована — нажмите Ctrl+V в строке назначения",
  ],
  "vc.rowPasteToast": [
    "اطلاعات ردیف کپی‌شده در این ردیف چسبانده شد",
    "Copied row data pasted into this row",
    "Kopyalanan satır verisi bu satıra yapıştırıldı",
    "تم لصق بيانات الصف المنسوخ في هذا الصف",
    "कॉपी की गई पंक्ति का डेटा इस पंक्ति में चिपकाया गया",
    "د کاپي شوي کتار معلومات پدې کتار کې پورې شول",
    "داتای کۆپی کراوی دێڕ لەم دێڕەدا پەیست کرا",
    "Dados da linha copiada colados nesta linha",
    "복사된 행 데이터가 이 행에 붙여넣어졌습니다",
    "Données de la ligne copiées collées dans cette ligne",
    "已将复制的行数据粘贴到此行",
    "Kopierte Zeilendaten in diese Zeile eingefügt",
    "Данные скопированной строки вставлены в эту строку",
  ],
  "vc.rowCopiedAboveToast": [
    "اطلاعات ردیف بالایی در این ردیف کپی شد (F5)",
    "Data of the row above copied into this row (F5)",
    "Üstteki satırın verisi bu satıra kopyalandı (F5)",
    "تم نسخ بيانات الصف العلوي في هذا الصف (F5)",
    "ऊपर की पंक्ति का डेटा इस पंक्ति में कॉपी हुआ (F5)",
    "د پورته کتار معلومات پدې کتار کې کاپي شول (F5)",
    "داتای دێڕی سەرەوە لەم دێڕەدا کۆپی کرا (F5)",
    "Dados da linha de cima copiados para esta linha (F5)",
    "위 행의 데이터가 이 행에 복사되었습니다 (F5)",
    "Données de la ligne du dessus copiées dans cette ligne (F5)",
    "上一行的数据已复制到此行 (F5)",
    "Daten der oberen Zeile in diese Zeile kopiert (F5)",
    "Данные строки выше скопированы в эту строку (F5)",
  ],
  "vc.swapDoneToast": [
    "مبالغ بدهکار و بستانکار جابجا شد (F4)",
    "Debit and credit amounts swapped (F4)",
    "Borç ve alacak tutarları takas edildi (F4)",
    "تم تبديل مبالغ المدين والدائن (F4)",
    "डेबिट और क्रेडिट राशियाँ अदल-बदल हुईं (F4)",
    "د بدهکار او بستانکار مبالغ بدل شوې (F4)",
    "بڕەکانی بدهکار و بستانکار گۆڕدران (F4)",
    "Valores de débito e crédito trocados (F4)",
    "차변과 대변 금액이 교체되었습니다 (F4)",
    "Montants débit et crédit inversés (F4)",
    "借方和贷方金额已互换 (F4)",
    "Soll- und Habenbeträge getauscht (F4)",
    "Суммы дебета и кредита поменяны местами (F4)",
  ],
  "vc.swapNothingToast": [
    "مبالغ این ردیف صفر است — جابجایی انجام نشد",
    "This row has zero amounts — nothing to swap",
    "Bu satırın tutarları sıfır — takas yapılmadı",
    "مبالغ هذا الصف صفرية — لم يتم التبديل",
    "इस पंक्ति की राशियाँ शून्य हैं — अदल-बदल नहीं हुआ",
    "ددې کتار مبالغ صفر دي — بدلونه ترسره نه شو",
    "مەبالغی ئەم دێڕە سفرە — گۆڕین ئەنجام نەدرا",
    "Os valores desta linha são zero — nada para trocar",
    "이 행의 금액이 0입니다 — 교체할 내용이 없습니다",
    "Les montants de cette ligne sont nuls — rien à inverser",
    "该行金额为零 — 未进行互换",
    "Die Beträge dieser Zeile sind null — nichts zu tauschen",
    "Суммы этой строки равны нулю — менять нечего",
  ],
  "vc.freqDescSave": [
    "ذخیرهٔ شرح در شرح‌های پرتکرار معین (F6)",
    "Save description to the subledger's frequent descriptions (F6)",
    "Açıklamayı yardımcı hesabın sık açıklamalarına kaydet (F6)",
    "حفظ الوصف في الأوصاف المتكررة للحساب المعين (F6)",
    "विवरण को सहायक खाते के बारंबार विवरणों में सहेजें (F6)",
    "څرګندونه د معین په تکراري څرګندونو کې خوندي کړئ (F6)",
    "پاشکۆکردنی وەسف لە وەسفە تکرارییەکانی معین (F6)",
    "Salvar descrição nas descrições frequentes do subledger (F6)",
    "설명을 보조계정의 자주 쓰는 설명에 저장 (F6)",
    "Enregistrer la description dans les descriptions fréquentes du compte auxiliaire (F6)",
    "将说明保存到明细账的常用说明中 (F6)",
    "Beschreibung in den Häufigen Beschreibungen des Unterkontos speichern (F6)",
    "Сохранить описание в частых описаниях субсчёта (F6)",
  ],
  "vc.freqDescSavedToast": [
    "شرح به شرح‌های پرتکرار معین افزوده شد",
    "Description added to the subledger's frequent descriptions",
    "Açıklama yardımcı hesabın sık açıklamalarına eklendi",
    "تمت إضافة الوصف إلى الأوصاف المتكررة للحساب المعين",
    "विवरण सहायक खाते के बारंबार विवरणों में जोड़ा गया",
    "څرګندونه د معین تکراري څرګندونو ته اضافه شوه",
    "وەسف بۆ وەسفە تکرارییەکانی معین زیاد کرا",
    "Descrição adicionada às descrições frequentes do subledger",
    "설명이 보조계정의 자주 쓰는 설명에 추가되었습니다",
    "Description ajoutée aux descriptions fréquentes du compte auxiliaire",
    "说明已添加到明细账的常用说明中",
    "Beschreibung zu den Häufigen Beschreibungen des Unterkontos hinzugefügt",
    "Описание добавлено в частые описания субсчёта",
  ],
  "vc.freqDescDupToast": [
    "این شرح از قبل در شرح‌های پرتکرار معین موجود است",
    "This description already exists in the subledger's frequent descriptions",
    "Bu açıklama yardımcı hesabın sık açıklamalarında zaten var",
    "هذا الوصف موجود مسبقاً في الأوصاف المتكررة للحساب المعين",
    "यह विवरण सहायक खाते के बारंबार विवरणों में पहले से मौजूद है",
    "دا څرګندونه دمخه د معین په تکراري څرګندونو کې شته",
    "ئەم وەسفە پێشتر لە وەسفە تکرارییەکانی معین هەیە",
    "Esta descrição já existe nas descrições frequentes do subledger",
    "이 설명은 보조계정의 자주 쓰는 설명에 이미 있습니다",
    "Cette description existe déjà dans les descriptions fréquentes du compte auxiliaire",
    "该说明已存在于明细账的常用说明中",
    "Diese Beschreibung existiert bereits in den Häufigen Beschreibungen des Unterkontos",
    "Это описание уже есть в частых описаниях субсчёта",
  ],
  "vc.freqDescNeedMoeinDesc": [
    "برای ذخیرهٔ شرح پرتکرار، ابتدا معین و شرح را وارد کنید",
    "Enter the subledger and description first to save a frequent description",
    "Sık açıklama kaydetmek için önce yardımcı hesabı ve açıklamayı girin",
    "أدخل الحساب المعين والوصف أولاً لحفظ وصف متكرر",
    "बारंबार विवरण सहेजने के लिए पहले सहायक खाता और विवरण दर्ज करें",
    "د تکراري څرګندونې د خوندي کولو لپاره لومړی معین او څرګندونه دننه کړئ",
    "بۆ پاشکۆکردنی وەسفی تکراری، سەرەتا معین و وەسف بنووسە",
    "Insira o subledger e a descrição primeiro para salvar uma descrição frequente",
    "자주 쓰는 설명을 저장하려면 먼저 보조계정과 설명을 입력하세요",
    "Saisissez d'abord le compte auxiliaire et la description pour enregistrer une description fréquente",
    "保存常用说明前，请先输入明细账和说明",
    "Geben Sie zuerst Unterkonto und Beschreibung ein, um eine häufige Beschreibung zu speichern",
    "Сначала введите субсчёт и описание, чтобы сохранить частое описание",
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
