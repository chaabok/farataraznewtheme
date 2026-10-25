/**
 * Task 84 — injects the party.* keys into ALL 13 locale blocks of
 * src/i18n/dictionaries.ts (fa is the Dict source of truth; every locale
 * must carry the same key set or TypeScript fails).
 * Locale order in DICTS: fa, en, tr, ar, hi, ps, ckb, pt, ko, fr, zh, de, ru.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/i18n/dictionaries.ts";

/** [fa, en, tr, ar, hi, ps, ckb, pt, ko, fr, zh, de, ru] */
const K: Record<string, [string, string, string, string, string, string, string, string, string, string, string, string, string]> = {
  "party.formTitle": ["طرف حساب جدید","New Party Account","Yeni Cari Hesap","حساب طرف جديد","नया पार्टी खाता","نوی حساب","هەژماری نوێ","Nova conta de parceiro","신규 거래처","Nouveau compte tiers","新建往来账户","Neues Partnerkonto","Новый контрагент"],
  "party.formDesc": ["تعریف طرف حساب با ماهیت حقیقی/حقوقی، تفصیلی، تماس و نشانی","Define a party — natural/legal, ledger code, contacts and addresses","Gerçek/tüzel kişi, muhasebe kodu, iletişim ve adresle cari tanımlayın","تعريف طرف الحساب — حقيقي/معنوي، الكود التفصيلي، التواصل والعنوان","पार्टी परिभाषित करें — व्यक्ति/संस्था, विवरण कोड, संपर्क और पता","حساب تعریف کړئ — حقیقی/حقوقی، کوډ تفصیلي، اړیکې او پته","هەژمار پێناسە بکە — کەسی ئاسایی/یاسایی، کۆدی وردەکاری، پەیوەندی و ناونیشان","Definir parceiro — pessoa física/jurídica, código contábil, contatos e endereços","거래처 정의 — 자연인/법인, 상세 코드, 연락처 및 주소","Définir un tiers — personne physique/morale, code analytique, contacts et adresses","定义往来账户 — 自然人/法人，明细代码、联系方式与地址","Partner anlegen — natürlich/juristisch, Detailcode, Kontakte und Adressen","Создание контрагента — физ./юр. лицо, аналитический код, контакты и адреса"],
  "party.formHint": ["کد تفصیلی خودکار از شماره‌گذاری پر می‌شود؛ تاریخ‌های تب «سایر اطلاعات» در تقویم زبان انتخابی نمایش و به میلادی ذخیره می‌شوند.","The ledger code is auto-assigned from numbering; dates of the “Other info” tab display in the selected language's calendar and store as Gregorian.","Detay kodu numaralandırmadan otomatik dolar; “Diğer bilgiler” sekmesindeki tarihler seçili dilin takviminde gösterilir ve Miladi saklanır.","يُملأ الكود التفصيلي تلقائياً من الترقيم؛ تواريخ تبويب «معلومات أخرى» تُعرض بتقويم اللغة المختارة وتُخزن ميلادية.","विवरण कोड क्रमांकन से स्वतः भरता है; “अन्य जानकारी” टैब की तिथियाँ चयनित भाषा के कैलेंडर में दिखती हैं और ग्रेगोरियन सहेजी जाती हैं.","کوډ تفصیلي له شمېرنې اتوماتیک ډېریږي؛ د «نور معلومات» ټب نېټې د غوره ژبې په کلیزې ښکاري او میلادي خوندي کېږي.","کۆدی وردەکاری لە ژمارەدانەوە خۆکار پڕ دەبێتەوە؛ بەروارەکانی تابی «زانیاریی تر» بە کالیزەری زمانی هەڵبژاردە دەردەکەون و میلادی هەڵدەگیرێن.","O código detalhado é preenchido automaticamente pela numeração; datas da aba “Outras informações” aparecem no calendário do idioma selecionado e são gravadas em gregoriano.","상세 코드는 채번에 따라 자동 입력됩니다. “기타 정보” 탭의 날짜는 선택한 언어의 달력으로 표시되고 그레고리력으로 저장됩니다.","Le code analytique est attribué automatiquement par la numérotation ; les dates de l'onglet « Autres informations » s'affichent dans le calendrier de la langue choisie et sont stockées en grégorien.","明细代码由编号自动生成；“其他信息”选项卡的日期按所选语言的日历显示并以公历保存。","Der Detailcode wird automatisch aus der Nummerierung vergeben; Daten des Tabs „Weitere Angaben“ erscheinen im Kalender der gewählten Sprache und werden gregorianisch gespeichert.","Аналитический код присваивается автоматически по нумерации; даты вкладки «Прочие сведения» отображаются в календаре выбранного языка и сохраняются по григорианскому календарю."],
  "party.nature": ["ماهیت","Nature","Kişi Türü","الصفة","प्रकृति","ماهیت","سروشت","Natureza","구분","Nature","性质","Art","Тип лица"],
  "party.natureNatural": ["شخص حقیقی","Natural person","Gerçek kişi","شخص حقيقي","व्यक्ति","شخص حقیقی","کەسی ئاسایی","Pessoa física","자연인","Personne physique","自然人","Natürliche Person","Физическое лицо"],
  "party.natureLegal": ["شخص حقوقی","Legal entity","Tüzel kişi","شخص معنوي","प्रतिष्ठान","شخص حقوقی","کەسی یاسایی","Pessoa jurídica","법인","Personne morale","法人","Juristische Person","Юридическое лицо"],
  "party.subtype": ["نوع فرعی","Subtype","Alt tür","النوع الفرعي","उपप्रकार","فرعي ډول","ژێرجۆر","Subtipo","하위 유형","Sous-type","子类型","Untertyp","Подтип"],
  "party.subtypeOther": ["سایر","Other","Diğer","أخرى","अन्य","نور","ئۆتر","Outro","기타","Autre","其他","Sonstige","Другое"],
  "party.subtypeMinistry": ["وزارتخانه","Ministry","Bakanlık","وزارة","मंत्रालय","وزارت","وەزارەت","Ministério","부처","Ministère","部委","Ministerium","Министерство"],
  "party.subtypeGovAgency": ["موسسه دولتی","Government agency","Devlet kurumu","مؤسسة حكومية","सरकारी संस्था","دولتي اداره","دامەزراوەی حکومی","Órgão governamental","정부 기관","Organisme public","政府机构","Staatsbehörde","Государственное учреждение"],
  "party.subtypeGovCompany": ["شرکت دولتی","State-owned company","Devlet şirketi","شركة حكومية","सरकारी कंपनी","دولتي شرکت","کۆمپانیای حکومی","Empresa estatal","국영 기업","Société publique","国有企业","Staatsunternehmen","Государственная компания"],
  "party.subtypeGovOther": ["سایر دستگاه‌های دولتی","Other government bodies","Diğer devlet organları","أجهزة حكومية أخرى","अन्य सरकारी निकाय","نور دولتي اورګانونه","ئەورگانى حکومیى تر","Outros órgãos governamentais","기타 정부 기관","Autres organismes publics","其他政府机关","Sonstige Staatsorgane","Прочие государственные органы"],
  "party.subtypePublic": ["نهادهای عمومی غیر دولتی","Non-governmental public institutions","Kamu yararına kuruluşlar","مؤسسات عامة غير حكومية","गैर-सरकारी सार्वजनिक संस्थाएँ","غیر دولتي عامه بنسټونه","دەزگا گشتییە نا حکومییەکان","Instituições públicas não governamentais","공공 비정부 기구","Établissements publics non gouvernementaux","非政府公共机构","Nichtstaatliche öffentliche Einrichtungen","Негосударственные общественные учреждения"],
  "party.subtypePrivate": ["بخش خصوصی","Private sector","Özel sektör","القطاع الخاص","निजी क्षेत्र","خصوصي سکتور","سێکتۆری تایبەت","Setor privado","민간 부문","Secteur privé","私营部门","Privater Sektor","Частный сектор"],
  "party.name": ["نام","First name","Ad","الاسم","नाम","نوم","ناو","Nome","이름","Prénom","名","Vorname","Имя"],
  "party.lastName": ["نام خانوادگی","Last name","Soyad","اسم العائلة","उपनाम","تخلص","ناوی خێزان","Sobrenome","성","Nom","姓","Nachname","Фамилия"],
  "party.nameLatin": ["نام (2) (لاتین)","First name (2) (Latin)","Ad (2) (Latin)","الاسم (2) (لاتيني)","नाम (2) (लैटिन)","نوم (2) (لاتین)","ناو (2) (لاتینی)","Nome (2) (latim)","이름 (2) (라틴)","Prénom (2) (latin)","名 (2)（拉丁）","Vorname (2) (Latein)","Имя (2) (латиница)"],
  "party.lastNameLatin": ["نام خانوادگی (2) (لاتین)","Last name (2) (Latin)","Soyad (2) (Latin)","اسم العائلة (2) (لاتيني)","उपनाम (2) (लैटिन)","تخلص (2) (لاتین)","ناوی خێزان (2) (لاتینی)","Sobrenome (2) (latim)","성 (2) (라틴)","Nom (2) (latin)","姓 (2)（拉丁）","Nachname (2) (Latein)","Фамилия (2) (латиница)"],
  "party.latinName": ["نام لاتین","Latin name","Latin adı","الاسم اللاتيني","लैटिन नाम","لاتین نوم","ناوی لاتینی","Nome em latim","라틴 이름","Nom latin","拉丁名","Lateinischer Name","Латинское наименование"],
  "party.tafsiliCode": ["کد تفصیلی","Ledger code","Detay kodu","الكود التفصيلي","विवरण कोड","کوډ تفصیلي","کۆدی وردەکاری","Código detalhado","상세 코드","Code analytique","明细代码","Detailcode","Аналитический код"],
  "party.tafsiliAuto": ["خودکار (شماره‌گذاری)","Auto (numbering)","Otomatik (numaralama)","تلقائي (ترقيم)","स्वतः (क्रमांकन)","اتوماتیک (شمېرنه)","خۆکار (ژمارەدانەوە)","Automático (numeração)","자동 (채번)","Auto (numérotation)","自动（编号）","Automatisch (Nummerierung)","Авто (нумерация)"],
  "party.tafsiliType6": ["نوع تفصیلی ۶","Ledger type 6","Detay türü 6","نوع تفصيلي 6","विवरण प्रकार 6","تفصیلي ډول 6","جۆری وردەکاری 6","Tipo detalhado 6","상세 유형 6","Type analytique 6","明细类型 6","Detailtyp 6","Тип кода 6"],
  "party.tafsiliType7": ["نوع تفصیلی ۷","Ledger type 7","Detay türü 7","نوع تفصيلي 7","विवरण प्रकार 7","تفصیلي ډول 7","جۆری وردەکاری 7","Tipo detalhado 7","상세 유형 7","Type analytique 7","明细类型 7","Detailtyp 7","Тип кода 7"],
  "party.economicCode": ["کد اقتصادی","Economic code","Ekonomik kod","الكود الاقتصادي","आर्थिक कोड","اقتصادي کوډ","کۆدی ئابووری","Código econômico","경제 코드","Code économique","经济代码","Wirtschaftscode","Экономический код"],
  "party.nationalId": ["کد ملی","National ID","Millî kimlik no","الرقم الوطني","राष्ट्रीय पहचान","ملي کوډ","کۆدی نیشتمانی","ID nacional","주민번호","Identifiant national","国民识别号","National-ID","Национальный ID"],
  "party.legalIdentity": ["شناسه ملی","Legal entity ID","Kurum kimlik no","المعرف الوطني","संस्था पहचान","ملي پېژندنه","ناسنامەی نیشتمانی","Identificação nacional","법인 번호","Identifiant national","法人识别号","Körperschafts-ID","Идентификатор юр. лица"],
  "party.registrationNo": ["شماره ثبت","Registration no.","Sicil no","رقم التسجيل","पंजीकरण संख्या","ثبت شماره","ژمارەی تۆمار","Nº de registro","등록 번호","N° d'enregistrement","注册号","Registernummer","Регистрационный номер"],
  "party.inactive": ["غیرفعال","Inactive","Etkin değil","غير نشط","निष्क्रिय","نا فعال","ناچالاک","Inativo","비활성","Inactif","停用","Inaktiv","Неактивен"],
  "party.tabDetails": ["جزئیات","Details","Detaylar","التفاصيل","विवरण","جزئیات","وردەکاری","Detalhes","상세","Détails","详情","Details","Детали"],
  "party.tabPeople": ["افراد مرتبط","Related people","İlgili kişiler","الأشخاص ذوو العلاقة","संबंधित व्यक्तियाँ","اړوند کسان","کەسە پەیوەندیدارەکان","Pessoas relacionadas","관련 인물","Personnes liées","相关人员","Verknüpfte Personen","Связанные лица"],
  "party.tabAddress": ["نشانی","Address","Adres","العنوان","पता","پته","ناونیشان","Endereço","주소","Adresse","地址","Adresse","Адрес"],
  "party.tabPhone": ["تلفن","Phone","Telefon","الهاتف","दूरभाष","تلیفون","تەلەفۆن","Telefone","전화","Téléphone","电话","Telefon","Телефон"],
  "party.tabOther": ["سایر اطلاعات","Other information","Diğer bilgiler","معلومات أخرى","अन्य जानकारी","نور معلومات","زانیاریی تر","Outras informações","기타 정보","Autres informations","其他信息","Weitere Angaben","Прочие сведения"],
  "party.supplier": ["تامین کننده","Supplier","Tedarikçi","المورد","आपूर्तिकर्ता","تأمینوونکی","دابینکەر","Fornecedor","공급자","Fournisseur","供应商","Lieferant","Поставщик"],
  "party.customer": ["مشتری","Customer","Müşteri","العميل","ग्राहक","پیرودونکی","کڕیار","Cliente","고객","Client","客户","Kunde","Клиент"],
  "party.salesAgent": ["واسط فروش","Sales intermediary","Satış aracısı","وسيط البيع","बिक्री मध्यस्थ","پلورن منځګړی","ناوبەگی فرۆشتن","Intermediário de vendas","판매 중개","Intermédiaire de vente","销售中介","Vertriebsmittler","Посредник продаж"],
  "party.balanceAmount": ["مبلغ مانده","Balance amount","Bakiye tutarı","مبلغ الرصيد","शेष राशि","پاتې مقدار","بڕی ماوە","Valor do saldo","잔액 금액","Montant du solde","余额金额","Saldobetrag","Сумма остатка"],
  "party.balanceStatus": ["وضعیت","Status","Durum","الحالة","स्थिति","حالت","دۆخ","Situação","상태","Statut","状态","Status","Статус"],
  "party.debtor": ["بدهکار","Debtor","Borçlu","مدين","देनदार","بدهکار","قەرزار","Devedor","채무자","Débiteur","借方","Schuldner","Дебитор"],
  "party.creditor": ["بستانکار","Creditor","Alacaklı","دائن","लेनदार","بستانکار","قەرزدەر","Credor","채권자","Créditeur","贷方","Gläubiger","Кредитор"],
  "party.relation": ["نسبت","Relation","Yakınlık","صلة القرابة","संबंध","تبار","پەیوەندی","Relação","관계","Lien","关系","Verwandtschaft","Родство"],
  "party.phoneNo": ["شماره تلفن","Phone number","Telefon numarası","رقم الهاتف","दूरभाष संख्या","تلیفون شماره","ژمارەی تەلەفۆن","Número de telefone","전화 번호","Numéro de téléphone","电话号码","Telefonnummer","Номер телефона"],
  "party.addrType": ["نوع آدرس","Address type","Adres türü","نوع العنوان","पता प्रकार","پته ډول","جۆری ناونیشان","Tipo de endereço","주소 유형","Type d'adresse","地址类型","Adresstyp","Тип адреса"],
  "party.addrOfficial": ["رسمی","Official","Resmî","رسمي","आधिकारिक","رسمي","فەرمی","Oficial","공식","Officiel","正式","Offiziell","Официальный"],
  "party.addrWorkplace": ["محل فعالیت","Workplace","İş yeri","محل العمل","कार्यस्थल","د کار ځای","شوێنی چالاکی","Local de trabalho","사업장","Lieu d'activité","工作地点","Arbeitsort","Место деятельности"],
  "party.addrInvoice": ["ارسال صورت","Invoice mailing","Fatura gönderimi","إرسال الفاتورة","चालान भेजना","صورت ولېږل","ناردنی فاتورە","Envio de fatura","청구서 발송","Envoi de facture","账单寄送","Rechnungsversand","Отправка счетов"],
  "party.addrGoods": ["ارسال کالا","Goods delivery","Mal gönderimi","إرسال البضاعة","माल भेजना","مال لېږل","ناردنی کاڵا","Entrega de mercadorias","물품 배송","Livraison de marchandises","货物寄送","Warenversand","Доставка товара"],
  "party.addrWarehouse": ["انبار","Warehouse","Depo","المستودع","गोदाम","ګدام","کۆگا","Armazém","창고","Entrepôt","仓库","Lager","Склад"],
  "party.addrHome": ["منزل","Home","Ev","المنزل","घर","کور","ماڵ","Residência","자택","Domicile","住宅","Wohnsitz","Домашний"],
  "party.addrPostal": ["پستی","Postal","Posta","بريدي","डाक","پوستي","پۆستی","Postal","우편","Postal","邮政","Postlich","Почтовый"],
  "party.addrOther": ["سایر","Other","Diğer","أخرى","अन्य","نور","ئۆتر","Outro","기타","Autre","其他","Sonstige","Другой"],
  "party.city": ["شهر","City","Şehir","المدينة","शहर","ښار","شار","Cidade","도시","Ville","城市","Stadt","Город"],
  "party.fullAddress": ["آدرس کامل","Full address","Tam adres","العنوان الكامل","पूरा पता","بشپړه پته","ناونیشانی تەواو","Endereço completo","전체 주소","Adresse complète","完整地址","Vollständige Adresse","Полный адрес"],
  "party.postalCode": ["کد پستی","Postal code","Posta kodu","الرمز البريدي","पिन कोड","پوستي کوډ","کۆدی پۆست","CEP","우편번호","Code postal","邮编","PLZ","Почтовый индекс"],
  "party.longitude": ["طول جغرافیایی","Longitude","Boylam","الطول الجغرافي","देशांतर","جغرافیایی اوږدوالی","درێژیی جوگرافی","Longitude","경도","Longitude","经度","Längengrad","Долгота"],
  "party.latitude": ["عرض جغرافیایی","Latitude","Enlem","العرض الجغرافي","अक्षांश","جغرافیایی عرض","پانیی جوگرافی","Latitude","위도","Latitude","纬度","Breitengrad","Широта"],
  "party.phoneType": ["نوع تلفن","Phone type","Telefon türü","نوع الهاتف","दूरभाष प्रकार","تلیفون ډول","جۆری تەلەفۆن","Tipo de telefone","전화 유형","Type de téléphone","电话类型","Telefontyp","Тип телефона"],
  "party.phoneOffice": ["تلفن دفتر","Office phone","Ofis telefonu","هاتف المكتب","कार्यालय दूरभाष","د دفتر تلیفون","تەلەفۆنی نووسینگە","Telefone do escritório","사무실 전화","Téléphone du bureau","办公电话","Bürotelefon","Офисный телефон"],
  "party.phoneMobile": ["تلفن همراه","Mobile phone","Cep telefonu","الهاتف المحمول","मोबाइल","د موبایل تلیفون","مۆبایل","Celular","휴대전화","Mobile","手机","Mobiltelefon","Мобильный телефон"],
  "party.phoneHome": ["تلفن منزل","Home phone","Ev telefonu","هاتف المنزل","घर का दूरभाष","د کور تلیفون","تەلەفۆنی ماڵ","Telefone residencial","자택 전화","Téléphone du domicile","住宅电话","Privattelefon","Домашний телефон"],
  "party.phoneOther": ["تلفن سایر","Other phone","Diğer telefon","هاتف آخر","अन्य दूरभाष","نور تلیفون","تەلەفۆنی تر","Outro telefone","기타 전화","Autre téléphone","其他电话","Sonstiges Telefon","Другой телефон"],
  "party.faxOffice": ["دورنگار دفتر","Office fax","Ofis faksı","فاكس المكتب","कार्यालय फैक्स","د دفتر فکس","فاکسی نووسینگە","Fax do escritório","사무실 팩스","Fax du bureau","办公传真","Bürofax","Офисный факс"],
  "party.faxHome": ["دورنگار منزل","Home fax","Ev faksı","فاكس المنزل","घर का फैक्स","د کور فکس","فاکسی ماڵ","Fax residencial","자택 팩스","Fax du domicile","住宅传真","Privatfax","Домашний факс"],
  "party.faxOther": ["دورنگار سایر","Other fax","Diğer faks","فاكس آخر","अन्य फैक्स","نور فکس","فاکسی تر","Outro fax","기타 팩스","Autre fax","其他传真","Sonstiges Fax","Другой факс"],
  "party.extension": ["داخلی","Extension","Dahili","التحويلة","एक्सटेंशन","داخلي","ناوخۆیی","Ramal","내선","Poste","分机","Durchwahl","Добавочный"],
  "party.passportNo": ["شماره گذرنامه","Passport no.","Pasaport no","رقم جواز السفر","पासपोर्ट संख्या","پاسپورت شماره","ژمارەی پاسپۆرت","Nº do passaporte","여권 번호","N° de passeport","护照号","Pass-Nr.","Номер паспорта"],
  "party.website": ["آدرس وبسایت","Website","Web sitesi","الموقع الإلكتروني","वेबसाइट","وېبسایټ","ماڵپەڕ","Website","웹사이트","Site web","网站","Website","Веб-сайт"],
  "party.email": ["آدرس ایمیل","Email","E-posta","البريد الإلكتروني","ईमेल","برېښنالیک","ئیمەیل","E-mail","이메일","E-mail","邮箱","E-Mail","Эл. почта"],
  "party.marriageDate": ["تاریخ ازدواج","Marriage date","Evlilik tarihi","تاريخ الزواج","विवाह तिथि","واده نېټه","بەرواری هاوسەرگیری","Data de casamento","결혼일","Date de mariage","结婚日期","Hochzeitsdatum","Дата бракосочетания"],
  "party.birthDate": ["تاریخ تولد","Birth date","Doğum tarihi","تاريخ الميلاد","जन्म तिथि","زېږون نېټه","بەرواری لەدایکبوون","Data de nascimento","생년월일","Date de naissance","出生日期","Geburtsdatum","Дата рождения"],
  "party.errNameRequired": ["ثبت نام الزامی است؛ نام نمی‌تواند خالی باشد.","Name is required; it cannot be empty.","Ad zorunludur; boş bırakılamaz.","الاسم إلزامي ولا يمكن أن يكون فارغاً.","नाम आवश्यक है; यह खाली नहीं हो सकता।","نوم لازمي دی؛ تش نه شي.","ناو پێویستە؛ نابێت بەتاڵ بێت.","O nome é obrigatório; não pode ficar vazio.","이름은 필수이며 비워 둘 수 없습니다.","Le nom est obligatoire ; il ne peut pas être vide.","姓名必填，不能为空。","Der Name ist erforderlich und darf nicht leer sein.","Имя обязательно и не может быть пустым."],
  "party.errLastNameRequired": ["در حالت شخص حقیقی، ثبت نام خانوادگی الزامی است.","In natural-person mode, the last name is required.","Gerçek kişi modunda soyad zorunludur.","في وضع الشخص الحقيقي، إدخال اسم العائلة إلزامي.","व्यक्ति मोड में उपनाम आवश्यक है।","په شخص حقیقی حالت کې تخلص لازمي دی.","لە دۆخی کەسی ئاساییدا، تۆمارکردنی ناوی خێزان پێویستە.","No modo pessoa física, o sobrenome é obrigatório.","자연인 모드에서는 성명이 필수입니다.","En mode personne physique, le nom est obligatoire.","自然人模式下，姓氏为必填项。","Im Modus natürliche Person ist der Nachname erforderlich.","В режиме физического лица фамилия обязательна."],
  "party.errStatusRequired": ["با ورود مبلغ ماندهٔ غیر صفر برای «{role}»، انتخاب وضعیت بدهکار/بستانکار الزامی است.","With a non-zero balance entered for “{role}”, selecting debtor/creditor is required.","“{role}” için sıfırdan farklı bakiye girildiğinde borçlu/alacaklı seçimi zorunludur.","عند إدخال مبلغ رصيد غير صفري لـ«{role}»، يجب اختيار مدين/دائن.","“{role}” के लिए शून्येतर शेष दर्ज करने पर देनदार/लेनदार चयन आवश्यक है।","د «{role}» لپاره د غیر صفر پاتې مقدار له مخې، بدهکار/بستانکار انتخاب لازمي دی.","بە بڕی ماوەی نا-سفر بۆ «{role}»، هەڵبژاردنی قەرزار/قەرزدەر پێویستە.","Com saldo diferente de zero para “{role}”, é obrigatório selecionar devedor/credor.","“{role}”에 0이 아닌 잔액을 입력하면 채무자/채권자 선택이 필수입니다.","Avec un solde non nul saisi pour « {role} », le choix débiteur/créditeur est obligatoire.","为“{role}”输入非零余额时，必须选择借方/贷方。","Bei einem von null verschiedenen Saldo für „{role}“ ist die Auswahl Schuldner/Gläubiger erforderlich.","При вводе ненулевого остатка для «{role}» требуется выбрать дебитор/кредитор."],
  "party.errRowRequired": ["در تب «{tab}» تکمیل ستون‌های الزامی ردیف {n} الزامی است.","In the “{tab}” tab, the required columns of row {n} must be filled.","“{tab}” sekmesinde {n}. satırın zorunlu sütunları doldurulmalıdır.","في تبويب «{tab}» يجب إكمال الأعمدة الإلزامية للصف {n}.","“{tab}” टैब में पंक्ति {n} के आवश्यक कॉलम भरना आवश्यक है।","په «{tab}» ټب کې د {n}م قطار لازمي کالمونه ډکول لازمي دي.","لە تابی «{tab}»دا پڕکردنی ستوونە پێویستەکانی ڕیز {n} پێویستە.","Na aba “{tab}”, as colunas obrigatórias da linha {n} devem ser preenchidas.","“{tab}” 탭에서 {n}번째 행의 필수 열을 입력해야 합니다.","Dans l'onglet « {tab} », les colonnes obligatoires de la ligne {n} doivent être remplies.","在“{tab}”选项卡中，必须填写第 {n} 行的必填列。","Im Tab „{tab}“ müssen die Pflichtspalten der Zeile {n} ausgefüllt werden.","Во вкладке «{tab}» необходимо заполнить обязательные столбцы строки {n}."],
};

const LOCALES = ["fa", "en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];

const src = readFileSync(PATH, "utf8");

// group keys by insertion target to keep blocks alphabetical-ish (insert as one block)
let out = src;
for (const loc of LOCALES) {
  const block = Object.entries(K)
    .map(([k, v]) => {
      const li = LOCALES.indexOf(loc);
      const val = v[li];
      return `  ${JSON.stringify(k)}: ${JSON.stringify(val)},`;
    })
    .join("\n");
  if (loc === "fa") {
    const marker = "const fa = {";
    const idx = out.indexOf(marker);
    if (idx < 0) throw new Error("fa block not found");
    const at = idx + marker.length;
    out = out.slice(0, at) + "\n" + block + out.slice(at);
    continue;
  }
  const startMarker = `const ${loc}: Dict = {`;
  const blockIdx = out.indexOf(startMarker);
  if (blockIdx < 0) throw new Error(`locale block not found: ${loc}`);
  if (loc === "en" || loc === "de" || loc === "ru") {
    /* complete blocks (no ...en fallback spread) — insert at block top */
    const at = blockIdx + startMarker.length;
    out = out.slice(0, at) + "\n" + block + out.slice(at);
    continue;
  }
  /* tr/ar/hi/ps/ckb/pt/ko/fr/zh spread `...en,` right after the block open —
     the keys must be inserted AFTER the spread or TS2783 makes the spread
     overwrite them. */
  const spreadIdx = out.indexOf("\n  ...en,", blockIdx);
  if (spreadIdx < 0) {
    throw new Error(`...en spread not found in ${loc}`);
  }
  const at = spreadIdx + "\n  ...en,".length;
  out = out.slice(0, at) + "\n" + block + out.slice(at);
}

writeFileSync(PATH, out);
const added = Object.keys(K).length;
console.log(`injected ${added} party.* keys × ${LOCALES.length} locales`);
