#!/usr/bin/env node
/* Task 155 — ۴ فیلد چک‌باکس تصویر مالک در تب «حسابداری» فرم «تنظیمات و
   پیکربندی نرم افزار» (درخواست مالک):
   «فیلدهایی که در تصویر وجود دارد را در فرم تنظیمات و پیکربندی نرم افزار
   و تب حسابداری اضافه کنید»
   ۱. «سقف تاریخ و شماره پیگیری در سند نمایش داده شود» — پیش‌فرض تیک‌دار
   ۲. «ورود اطلاعات تاریخ و شماره پیگیری اجباری باشد»
   ۳. «سقف های ارزی نمایش داده شود»
   ۴. «دسترسی مجاز در سطح معین فعال باشد»
   درج ۴ کلید تازهٔ settings.* بعد از Anchor خط "settings.swAccDetailLevels"
   در هر ۱۳ بلاک زبانی — فارسی = عین واژگان مالک. خودآزما: هر کلید دقیقاً ×۱۳. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "/home/z/my-project/src/i18n/dictionaries.ts";

const NEW_KEYS_BY_LOCALE = {
  fa: [
    '"settings.swDocDateTrackCap": "سقف تاریخ و شماره پیگیری در سند نمایش داده شود"',
    '"settings.swDocDateTrackMandatory": "ورود اطلاعات تاریخ و شماره پیگیری اجباری باشد"',
    '"settings.swCurrencyCaps": "سقف های ارزی نمایش داده شود"',
    '"settings.swMoeinLevelAccess": "دسترسی مجاز در سطح معین فعال باشد"',
  ],
  en: [
    '"settings.swDocDateTrackCap": "Date and tracking-number cap displayed in the voucher"',
    '"settings.swDocDateTrackMandatory": "Entering date and tracking-number data is mandatory"',
    '"settings.swCurrencyCaps": "Currency caps displayed"',
    '"settings.swMoeinLevelAccess": "Access allowed at subsidiary (Moein) level"',
  ],
  tr: [
    '"settings.swDocDateTrackCap": "Fişte tarih ve takip numarası üst sınırı görüntülensin"',
    '"settings.swDocDateTrackMandatory": "Tarih ve takip numarası bilgisi girişi zorunlu olsun"',
    '"settings.swCurrencyCaps": "Döviz üst sınırları görüntülensin"',
    '"settings.swMoeinLevelAccess": "Yardımcı hesap (Moein) düzeyinde yetkili erişim etkin olsun"',
  ],
  ar: [
    '"settings.swDocDateTrackCap": "يُعرض سقف التاريخ ورقم المتابعة في السند"',
    '"settings.swDocDateTrackMandatory": "يكون إدخال بيانات التاريخ ورقم المتابعة إلزامياً"',
    '"settings.swCurrencyCaps": "تُعرض السقوف العملية"',
    '"settings.swMoeinLevelAccess": "يكون الوصول المصرّح به على مستوى المعين مُفعّلاً"',
  ],
  hi: [
    '"settings.swDocDateTrackCap": "वाउचर में तिथि और ट्रैकिंग संख्या सीमा दिखाई जाए"',
    '"settings.swDocDateTrackMandatory": "तिथि और ट्रैकिंग संख्या की जानकारी दर्ज करना अनिवार्य हो"',
    '"settings.swCurrencyCaps": "मुद्रा सीमाएँ दिखाई जाएँ"',
    '"settings.swMoeinLevelAccess": "सहायक (मोइन) स्तर पर अनुमत पहुँच सक्रिय हो"',
  ],
  ps: [
    '"settings.swDocDateTrackCap": "د نېټې او تعقيب شمېرې بريد په سند کې ښکاره شي"',
    '"settings.swDocDateTrackMandatory": "د نېټې او تعقيب شمېرې معلومات ننوتل لازمي وي"',
    '"settings.swCurrencyCaps": "د اسعارو بريدونه ښکاره شي"',
    '"settings.swMoeinLevelAccess": "د معين په سطحه اجازه لاسرسي فعال وي"',
  ],
  ckb: [
    '"settings.swDocDateTrackCap": "سنووری بەروار و ژمارەی بەدواداچوون لە سند پیشان بدرێت"',
    '"settings.swDocDateTrackMandatory": "تۆمارکردنی زانیاری بەروار و ژمارەی بەدواداچوون پێویست بێت"',
    '"settings.swCurrencyCaps": "سنوورە دراوییەکان پیشان بدرێن"',
    '"settings.swMoeinLevelAccess": "دەستڕاگەیشتنی ڕێپێدراو لە ئاستی مەعین چالاک بێت"',
  ],
  pt: [
    '"settings.swDocDateTrackCap": "Limite de data e número de acompanhamento exibido no lançamento"',
    '"settings.swDocDateTrackMandatory": "Inserção de dados de data e número de acompanhamento obrigatória"',
    '"settings.swCurrencyCaps": "Limites em moeda exibidos"',
    '"settings.swMoeinLevelAccess": "Acesso permitido no nível auxiliar (Moein) ativo"',
  ],
  ko: [
    '"settings.swDocDateTrackCap": "전표에 날짜 및 추적 번호 상한 표시"',
    '"settings.swDocDateTrackMandatory": "날짜 및 추적 번호 정보 입력 필수"',
    '"settings.swCurrencyCaps": "통화 상한 표시"',
    '"settings.swMoeinLevelAccess": "보조 계정(모인) 수준 접근 허용 활성화"',
  ],
  fr: [
    '"settings.swDocDateTrackCap": "Le plafond de date et le numéro de suivi sont affichés dans la pièce"',
    '"settings.swDocDateTrackMandatory": "La saisie des données de date et de numéro de suivi est obligatoire"',
    '"settings.swCurrencyCaps": "Les plafonds en devises sont affichés"',
    '"settings.swMoeinLevelAccess": "L\'accès autorisé au niveau auxiliaire (Moein) est actif"',
  ],
  zh: [
    '"settings.swDocDateTrackCap": "在凭证中显示日期与追踪号上限"',
    '"settings.swDocDateTrackMandatory": "必须录入日期与追踪号信息"',
    '"settings.swCurrencyCaps": "显示外币上限"',
    '"settings.swMoeinLevelAccess": "启用明细账级授权访问"',
  ],
  de: [
    '"settings.swDocDateTrackCap": "Datums- und Trackingnummern-Obergrenze im Beleg anzeigen"',
    '"settings.swDocDateTrackMandatory": "Eingabe von Datums- und Trackingnummern-Daten ist verpflichtend"',
    '"settings.swCurrencyCaps": "Währungsobergrenzen anzeigen"',
    '"settings.swMoeinLevelAccess": "Zugriff auf Hilfsebene (Moein) erlaubt – aktiv"',
  ],
  ru: [
    '"settings.swDocDateTrackCap": "Показывать предельную дату и номер отслеживания в проводке"',
    '"settings.swDocDateTrackMandatory": "Ввод данных даты и номера отслеживания обязателен"',
    '"settings.swCurrencyCaps": "Показывать валютные лимиты"',
    '"settings.swMoeinLevelAccess": "Разрешённый доступ на уровне субсчёта (моин) включён"',
  ],
};

const ORDER = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const KEYS = [
  "settings.swDocDateTrackCap",
  "settings.swDocDateTrackMandatory",
  "settings.swCurrencyCaps",
  "settings.swMoeinLevelAccess",
];

const src = readFileSync(PATH, "utf8");
const lines = src.split("\n");

/* درج ۴ کلید تازه بعد از anchor — از پایین به بالا */
const anchors = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"settings.swAccDetailLevels"')) anchors.push(i);
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
