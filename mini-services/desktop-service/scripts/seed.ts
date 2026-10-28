import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCALES = ['fa', 'en', 'tr', 'ar'] as const;
type LocaleCode = (typeof LOCALES)[number];

/** Localized name tuple helper (fa, en, tr, ar). */
const n = (
  fa: string,
  en: string,
  tr: string,
  ar: string,
): Record<LocaleCode, string> => ({ fa, en, tr, ar });

/**
 * The 10 business modules of the ERP desktop.
 * `iconKey` doubles as the module id used by the frontend window manager.
 * Colors/sortOrder must stay in sync with `src/lib/modules-registry.ts`.
 */
const MODULE_ICONS = [
  { name: 'تنظیمات', iconKey: 'settings', color: '#64748b', sortOrder: 1 },
  { name: 'حسابداری', iconKey: 'accounting', color: '#10b981', sortOrder: 2 },
  { name: 'دریافت و پرداخت', iconKey: 'payment', color: '#f59e0b', sortOrder: 3 },
  { name: 'انبار', iconKey: 'inventory', color: '#8b5cf6', sortOrder: 4 },
  { name: 'فروش', iconKey: 'sales', color: '#22c55e', sortOrder: 5 },
  { name: 'دارایی ثابت', iconKey: 'fixedAsset', color: '#0ea5e9', sortOrder: 6 },
  { name: 'تدارکات', iconKey: 'procurement', color: '#f97316', sortOrder: 7 },
  { name: 'سفارشات', iconKey: 'order', color: '#3b82f6', sortOrder: 8 },
  { name: 'بهای تمام شده', iconKey: 'costing', color: '#ef4444', sortOrder: 9 },
  { name: 'صورتهای مالی', iconKey: 'financialStatement', color: '#14b8a6', sortOrder: 10 },
] as const;

/** Localized display names per iconKey (fa, en, tr, ar). */
const TRANSLATIONS: Record<string, Record<LocaleCode, string>> = {
  settings: { fa: 'تنظیمات', en: 'Settings', tr: 'Ayarlar', ar: 'الإعدادات' },
  accounting: { fa: 'حسابداری', en: 'Accounting', tr: 'Muhasebe', ar: 'المحاسبة' },
  payment: {
    fa: 'دریافت و پرداخت',
    en: 'Receivables & Payables',
    tr: 'Tahsilat ve Ödemeler',
    ar: 'المقبوضات والمدفوعات',
  },
  inventory: { fa: 'انبار', en: 'Warehouse', tr: 'Depo', ar: 'المستودع' },
  sales: { fa: 'فروش', en: 'Sales', tr: 'Satış', ar: 'المبيعات' },
  fixedAsset: {
    fa: 'دارایی ثابت',
    en: 'Fixed Assets',
    tr: 'Sabit Varlıklar',
    ar: 'الأصول الثابتة',
  },
  procurement: { fa: 'تدارکات', en: 'Procurement', tr: 'Satın Alma', ar: 'المشتريات' },
  order: { fa: 'سفارشات', en: 'Orders', tr: 'Siparişler', ar: 'الطلبيات' },
  costing: {
    fa: 'بهای تمام شده',
    en: 'Cost Accounting',
    tr: 'Maliyet Muhasebesi',
    ar: 'تكاليف الإنتاج',
  },
  financialStatement: {
    fa: 'صورتهای مالی',
    en: 'Financial Statements',
    tr: 'Mali Tablolar',
    ar: 'القوائم المالية',
  },
};

// ---------------------------------------------------------------------------
// Module menus & forms (seeded per locale, shown in the module flyout menu)
// ---------------------------------------------------------------------------

interface MenuFormSeed {
  formKey: string;
  iconKey: string;
  name: Record<LocaleCode, string>;
}

interface MenuSeed {
  iconKey: string;
  name: Record<LocaleCode, string>;
  forms: MenuFormSeed[];
}

const f = (
  formKey: string,
  iconKey: string,
  name: Record<LocaleCode, string>,
): MenuFormSeed => ({ formKey, iconKey, name });

const m = (
  iconKey: string,
  name: Record<LocaleCode, string>,
  forms: MenuFormSeed[],
): MenuSeed => ({ iconKey, name, forms });

const MODULE_MENUS: Record<string, MenuSeed[]> = {
  // ── تنظیمات ─────────────────────────────────────────────────────
  settings: [
    m('cog', n('عمومی', 'General', 'Genel', 'عام'), [
      f('org-profile', 'building', n('پروفایل سازمان', 'Organization Profile', 'Organizasyon Profili', 'ملف المؤسسة')),
      f('org-units', 'boxes', n('واحدهای سازمانی', 'Organizational Units', 'Organizasyon Birimleri', 'الوحدات التنظيمية')),
      f('calendar-currency', 'calendar', n('تقویم و واحد پول', 'Calendar & Currency', 'Takvim ve Para Birimi', 'التقويم والعملة')),
    ]),
    m('shield', n('امنیت و دسترسی', 'Security & Access', 'Güvenlik ve Erişim', 'الأمن والوصول'), [
      f('users', 'users', n('مدیریت کاربران', 'User Management', 'Kullanıcı Yönetimi', 'إدارة المستخدمين')),
      f('roles', 'shield', n('نقش‌ها و مجوزها', 'Roles & Permissions', 'Roller ve İzinler', 'الأدوار والصلاحيات')),
      f('login-policy', 'lock', n('سیاست‌های ورود', 'Login Policies', 'Oturum Açma İlkeleri', 'سياسات تسجيل الدخول')),
    ]),
    m('database', n('پیکربندی سیستمی', 'System Configuration', 'Sistem Yapılandırması', 'إعداد النظام'), [
      f('installation', 'database', n('تنظیمات نصب برنامه', 'App Installation', 'Uygulama Kurulumu', 'إعدادات تثبيت التطبيق')),
      f('system-params', 'cog', n('پارامترهای سیستم', 'System Parameters', 'Sistem Parametreleri', 'معلمات النظام')),
      f('backup-restore', 'database', n('پشتیبان‌گیری و بازیابی', 'Backup & Restore', 'Yedekleme ve Geri Yükleme', 'النسخ الاحتياطي والاستعادة')),
      f('audit-log', 'fileText', n('گزارش رخدادها', 'Audit Log', 'Denetim Günlüğü', 'سجل التدقيق')),
    ]),
  ],

  // ── حسابداری ────────────────────────────────────────────────────
  accounting: [
    m('fileText', n('اسناد حسابداری', 'Accounting Documents', 'Muhasebe Belgeleri', 'المستندات المحاسبية'), [
      f('new-journal', 'fileText', n('ثبت سند جدید', 'New Journal Entry', 'Yeni Yevmiye Kaydı', 'قيد يومية جديد')),
      f('document-list', 'clipboardList', n('فهرست اسناد', 'Document List', 'Belge Listesi', 'قائمة المستندات')),
      f('opening-entry', 'bookOpen', n('سند افتتاحیه', 'Opening Entry', 'Açılış Kaydı', 'قيد الافتتاح')),
    ]),
    m('bookOpen', n('دفاتر قانونی', 'Legal Ledgers', 'Yasal Defterler', 'الدفاتر القانونية'), [
      f('journal', 'fileText', n('دفتر روزنامه', 'Journal', 'Yevmiye Defteri', 'دفتر اليومية')),
      f('general-ledger', 'bookOpen', n('دفتر کل', 'General Ledger', 'Büyük Defter', 'دفتر الأستاذ')),
      f('subsidiary-ledger', 'bookOpen', n('دفتر معین', 'Subsidiary Ledger', 'Yardımcı Defter', 'دفتر الأستاذ المساعد')),
    ]),
    m('barChart', n('گزارش‌های مالی', 'Financial Reports', 'Mali Raporlar', 'التقارير المالية'), [
      f('trial-balance', 'barChart', n('تراز آزمایشی', 'Trial Balance', 'Mizan', 'ميزان المراجعة')),
      f('detail-turnover', 'trendingUp', n('گردش تفصیلی', 'Detail Turnover', 'Ayrıntılı Hareket', 'حركة التفاصيل')),
      f('profit-loss', 'pieChart', n('سود و زیان', 'Profit & Loss', 'Kâr ve Zarar', 'الأرباح والخسائر')),
    ]),
  ],

  // ── دریافت و پرداخت ─────────────────────────────────────────────
  payment: [
    m('banknote', n('دریافت‌ها', 'Receipts', 'Tahsilatlar', 'المقبوضات'), [
      f('cash-receipt', 'banknote', n('دریافت نقدی', 'Cash Receipt', 'Nakit Tahsilat', 'قبض نقدي')),
      f('cheque-receipt', 'landmark', n('دریافت چک', 'Cheque Receipt', 'Çek Tahsilatı', 'قبض شيك')),
      f('customer-settlement', 'users', n('تسویه مشتری', 'Customer Settlement', 'Müşteri Mutabakatı', 'تسوية العميل')),
    ]),
    m('send', n('پرداخت‌ها', 'Payments', 'Ödemeler', 'المدفوعات'), [
      f('cash-payment', 'banknote', n('پرداخت نقدی', 'Cash Payment', 'Nakit Ödeme', 'دفع نقدي')),
      f('cheque-payment', 'landmark', n('پرداخت چک', 'Cheque Payment', 'Çek Ödemesi', 'دفع شيك')),
      f('supplier-settlement', 'truck', n('تسویه تأمین‌کننده', 'Supplier Settlement', 'Tedarikçi Mutabakatı', 'تسوية المورّد')),
    ]),
    m('landmark', n('امور بانکی', 'Banking', 'Bankacılık', 'الأعمال المصرفية'), [
      f('bank-transactions', 'landmark', n('گردش حساب بانک', 'Bank Transactions', 'Banka Hareketleri', 'حركات الحساب البنكي')),
      f('bank-reconciliation', 'clipboardCheck', n('مغایرت بانکی', 'Bank Reconciliation', 'Banka Mutabakatı', 'التسوية البنكية')),
    ]),
  ],

  // ── انبار ───────────────────────────────────────────────────────
  inventory: [
    m('package', n('کالا و موجودی', 'Items & Stock', 'Ürün ve Stok', 'الأصناف والمخزون'), [
      f('new-item', 'package', n('تعریف کالا', 'New Item', 'Yeni Ürün', 'تعريف صنف')),
      f('item-groups', 'boxes', n('گروه‌های کالایی', 'Item Groups', 'Ürün Grupları', 'مجموعات الأصناف')),
      f('units', 'cog', n('واحدهای اندازه‌گیری', 'Units of Measure', 'Ölçü Birimleri', 'وحدات القياس')),
    ]),
    m('boxes', n('عملیات انبار', 'Warehouse Operations', 'Depo İşlemleri', 'عمليات المستودع'), [
      f('goods-receipt', 'package', n('رسید ورود کالا', 'Goods Receipt', 'Mal Kabul', 'إيصال استلام البضائع')),
      f('goods-issue', 'send', n('حواله خروج', 'Goods Issue', 'Mal Çıkışı', 'إذن صرف')),
      f('transfer', 'truck', n('انتقال بین انبارها', 'Inter-Warehouse Transfer', 'Depolar Arası Transfer', 'التحويل بين المستودعات')),
      f('stock-count', 'clipboardCheck', n('انبارگردانی', 'Stock Counting', 'Stok Sayımı', 'الجرد')),
    ]),
    m('barChart', n('گزارش‌های انبار', 'Inventory Reports', 'Envanter Raporları', 'تقارير المخزون'), [
      f('item-card', 'fileText', n('کارت کالا', 'Item Card', 'Ürün Kartı', 'كرت الصنف')),
      f('current-stock', 'package', n('موجودی انبار', 'Current Stock', 'Mevcut Stok', 'المخزون الحالي')),
      f('low-stock', 'trendingDown', n('کالاهای کم‌موجود', 'Low Stock Items', 'Düşük Stoklu Ürünler', 'الأصناف منخفضة المخزون')),
    ]),
  ],

  // ── فروش ────────────────────────────────────────────────────────
  sales: [
    m('receipt', n('اسناد فروش', 'Sales Documents', 'Satış Belgeleri', 'مستندات المبيعات'), [
      f('proforma', 'receipt', n('پیش‌فاکتور', 'Proforma Invoice', 'Proforma Fatura', 'فاتورة أولية')),
      f('sales-invoice', 'fileText', n('فاکتور فروش', 'Sales Invoice', 'Satış Faturası', 'فاتورة مبيعات')),
      f('sales-return', 'arrowLeftRight', n('برگشت از فروش', 'Sales Return', 'Satış İadesi', 'مرتجع المبيعات')),
    ]),
    m('users', n('مشتریان', 'Customers', 'Müşteriler', 'العملاء'), [
      f('new-customer', 'users', n('تعریف مشتری', 'New Customer', 'Yeni Müşteri', 'تعريف عميل')),
      f('customer-groups', 'boxes', n('گروه‌های مشتریان', 'Customer Groups', 'Müşteri Grupları', 'مجموعات العملاء')),
      f('customer-ledger', 'bookOpen', n('کارت حساب مشتری', 'Customer Ledger', 'Müşteri Cari Kartı', 'كرت حساب العميل')),
    ]),
    m('trendingUp', n('گزارش‌های فروش', 'Sales Reports', 'Satış Raporları', 'تقارير المبيعات'), [
      f('period-sales', 'trendingUp', n('فروش دوره', 'Period Sales', 'Dönem Satışları', 'مبيعات الفترة')),
      f('sales-by-item', 'package', n('فروش به تفکیک کالا', 'Sales by Item', 'Ürüne Göre Satış', 'المبيعات حسب الصنف')),
      f('salesperson-performance', 'barChart', n('عملکرد فروشندگان', 'Salesperson Performance', 'Satış Temsilcisi Performansı', 'أداء مندوبي البيع')),
    ]),
  ],

  // ── دارایی ثابت ─────────────────────────────────────────────────
  fixedAsset: [
    m('building', n('ثبت دارایی', 'Asset Registration', 'Varlık Kaydı', 'تسجيل الأصول'), [
      f('new-asset', 'building', n('تعریف دارایی', 'New Asset', 'Yeni Varlık', 'تعريف أصل')),
      f('asset-groups', 'boxes', n('گروه‌های دارایی', 'Asset Groups', 'Varlık Grupları', 'مجموعات الأصول')),
      f('locations', 'globe', n('محل استقرار', 'Locations', 'Konumlar', 'مواقع الاستقرار')),
    ]),
    m('trendingDown', n('استهلاک', 'Depreciation', 'Amortisman', 'الإهلاك'), [
      f('depreciation-calc', 'trendingDown', n('محاسبه استهلاک', 'Depreciation Calculation', 'Amortisman Hesaplama', 'حساب الإهلاك')),
      f('asset-changes', 'cog', n('تغییرات دارایی', 'Asset Changes', 'Varlık Değişiklikleri', 'تغييرات الأصول')),
      f('disposal', 'banknote', n('فروش و اسقاط', 'Sale & Disposal', 'Satış ve Tasfiye', 'البيع والإتلاف')),
    ]),
    m('barChart', n('گزارش‌های دارایی', 'Asset Reports', 'Varlık Raporları', 'تقارير الأصول'), [
      f('asset-list', 'fileText', n('فهرست دارایی‌ها', 'Asset List', 'Varlık Listesi', 'قائمة الأصول')),
      f('depreciation-schedule', 'calendar', n('جدول استهلاک', 'Depreciation Schedule', 'Amortisman Tablosu', 'جدول الإهلاك')),
      f('book-value', 'pieChart', n('ارزش دفتری', 'Book Value', 'Defter Değeri', 'القيمة الدفترية')),
    ]),
  ],

  // ── تدارکات ─────────────────────────────────────────────────────
  procurement: [
    m('truck', n('تأمین‌کنندگان', 'Suppliers', 'Tedarikçiler', 'المورّدون'), [
      f('new-supplier', 'users', n('تعریف تأمین‌کننده', 'New Supplier', 'Yeni Tedarikçi', 'تعريف مورّد')),
      f('supplier-ledger', 'bookOpen', n('کارت تأمین‌کننده', 'Supplier Ledger', 'Tedarikçi Cari Kartı', 'كرت المورّد')),
      f('supplier-evaluation', 'clipboardCheck', n('ارزیابی تأمین‌کننده', 'Supplier Evaluation', 'Tedarikçi Değerlendirmesi', 'تقييم المورّد')),
    ]),
    m('clipboardList', n('فرایند خرید', 'Purchasing', 'Satın Alma Süreci', 'عملية الشراء'), [
      f('purchase-request', 'clipboardList', n('درخواست خرید', 'Purchase Request', 'Satın Alma Talebi', 'طلب شراء')),
      f('price-inquiry', 'calculator', n('استعلام قیمت', 'Price Inquiry', 'Fiyat Soruşturması', 'استقصاء السعر')),
      f('purchase-order', 'send', n('سفارش خرید', 'Purchase Order', 'Satın Alma Siparişi', 'أمر شراء')),
      f('purchase-invoice', 'receipt', n('فاکتور خرید', 'Purchase Invoice', 'Satın Alma Faturası', 'فاتورة شراء')),
    ]),
    m('barChart', n('گزارش‌های خرید', 'Purchase Reports', 'Satın Alma Raporları', 'تقارير الشراء'), [
      f('period-purchases', 'barChart', n('خرید دوره', 'Period Purchases', 'Dönem Satın Almaları', 'مشتريات الفترة')),
      f('price-analysis', 'trendingUp', n('تحلیل قیمت‌ها', 'Price Analysis', 'Fiyat Analizi', 'تحليل الأسعار')),
    ]),
  ],

  // ── سفارشات ─────────────────────────────────────────────────────
  order: [
    m('send', n('ثبت سفارش', 'Order Entry', 'Sipariş Girişi', 'إدخال الطلبات'), [
      f('new-order', 'send', n('سفارش جدید', 'New Order', 'Yeni Sipariş', 'طلب جديد')),
      f('order-tracking', 'clipboardCheck', n('پیگیری سفارش', 'Order Tracking', 'Sipariş Takibi', 'تتبع الطلب')),
      f('cancel-order', 'trash', n('لغو سفارش', 'Cancel Order', 'Sipariş İptali', 'إلغاء الطلب')),
    ]),
    m('clipboardCheck', n('گردش تأیید', 'Approval Flow', 'Onay Akışı', 'دورة الموافقة'), [
      f('approve-order', 'clipboardCheck', n('تأیید سفارش', 'Approve Order', 'Sipariş Onayı', 'الموافقة على الطلب')),
      f('change-status', 'cog', n('تغییر وضعیت', 'Change Status', 'Durum Değişikliği', 'تغيير الحالة')),
      f('allocation', 'boxes', n('تخصیص انبار', 'Warehouse Allocation', 'Depo Tahsisi', 'تخصيص المستودع')),
    ]),
    m('barChart', n('گزارش سفارشات', 'Order Reports', 'Sipariş Raporları', 'تقارير الطلبات'), [
      f('open-orders', 'barChart', n('سفارش‌های جاری', 'Open Orders', 'Açık Siparişler', 'الطلبات المفتوحة')),
      f('pending-orders', 'clipboardList', n('سفارش‌های معوق', 'Pending Orders', 'Bekleyen Siparişler', 'الطلبات المعلقة')),
      f('order-history', 'fileText', n('تاریخچه سفارشات', 'Order History', 'Sipariş Geçmişi', 'سجل الطلبات')),
    ]),
  ],

  // ── بهای تمام شده ───────────────────────────────────────────────
  costing: [
    m('pieChart', n('مراکز هزینه', 'Cost Centers', 'Maliyet Merkezleri', 'مراكز التكلفة'), [
      f('new-cost-center', 'pieChart', n('تعریف مرکز هزینه', 'New Cost Center', 'Yeni Maliyet Merkezi', 'تعريف مركز تكلفة')),
      f('cost-allocation', 'calculator', n('تخصیص هزینه', 'Cost Allocation', 'Maliyet Dağıtımı', 'تخصيص التكلفة')),
      f('cost-categories', 'clipboardList', n('سرفصل‌های هزینه', 'Cost Categories', 'Maliyet Kalemleri', 'بنود التكلفة')),
    ]),
    m('calculator', n('محاسبه بهای تمام شده', 'Cost Calculation', 'Maliyet Hesaplama', 'حساب التكلفة'), [
      f('product-cost', 'calculator', n('بهای تمام شده محصول', 'Product Cost', 'Ürün Maliyeti', 'تكلفة المنتج')),
      f('overhead-distribution', 'pieChart', n('توزیع سربار', 'Overhead Distribution', 'Genel Gider Dağıtımı', 'توزيع التكاليف غير المباشرة')),
      f('job-costing', 'clipboardList', n('حسابداری سفارش کار', 'Job Order Costing', 'İş Siparişi Maliyeti', 'تكلفة أمر العمل')),
    ]),
    m('barChart', n('تحلیل‌ها', 'Analysis', 'Analizler', 'التحليلات'), [
      f('variance-analysis', 'barChart', n('تحلیل واریانس', 'Variance Analysis', 'Sapma Analizi', 'تحليل الانحرافات')),
      f('period-cost', 'trendingUp', n('بهای تمام شده دوره', 'Period Cost', 'Dönem Maliyeti', 'تكلفة الفترة')),
    ]),
  ],

  // ── صورت‌های مالی ───────────────────────────────────────────────
  financialStatement: [
    m('fileText', n('صورت‌های اصلی', 'Primary Statements', 'Temel Tablolar', 'القوائم الأساسية'), [
      f('balance-sheet', 'fileSpreadsheet', n('ترازنامه', 'Balance Sheet', 'Bilanço', 'الميزانية العمومية')),
      f('income-statement', 'trendingUp', n('سود و زیان', 'Income Statement', 'Gelir Tablosu', 'قائمة الدخل')),
      f('cash-flow', 'banknote', n('جریان وجوه نقد', 'Cash Flow Statement', 'Nakit Akış Tablosu', 'قائمة التدفقات النقدية')),
    ]),
    m('cog', n('تنظیمات گزارشگری', 'Reporting Setup', 'Raporlama Ayarları', 'إعداد التقارير'), [
      f('account-mapping', 'clipboardList', n('سرفصل‌های حساب‌ها', 'Account Mappings', 'Hesap Eşleştirmeleri', 'ربط الحسابات')),
      f('reporting-levels', 'database', n('سطوح گزارشگری', 'Reporting Levels', 'Raporlama Düzeyleri', 'مستويات التقارير')),
      f('fiscal-periods', 'calendar', n('دوره‌های مالی', 'Fiscal Periods', 'Mali Dönemler', 'الفترات المالية')),
    ]),
    m('barChart', n('گزارش‌های ترکیبی', 'Combined Reports', 'Birleşik Raporlar', 'التقارير المجمعة'), [
      f('interim-statements', 'fileText', n('صورت‌های میان‌دوره‌ای', 'Interim Statements', 'Ara Dönem Tabloları', 'القوائم بينية')),
      f('management-report', 'barChart', n('گزارش مدیریت', 'Management Report', 'Yönetim Raporu', 'تقرير الإدارة')),
    ]),
  ],
};

async function main(): Promise<void> {
  // ── 1) Reset the desktop icons (10 ERP modules × 4 translations) ──
  await prisma.desktopIconTranslation.deleteMany({});
  await prisma.desktopIcon.deleteMany({});

  // createMany does not support nested writes → create each icon with its
  // 4 translations in one nested `create`.
  for (const icon of MODULE_ICONS) {
    await prisma.desktopIcon.create({
      data: {
        name: icon.name, // base name = Persian default
        iconKey: icon.iconKey,
        color: icon.color,
        sortOrder: icon.sortOrder,
        translations: {
          create: LOCALES.map((locale) => ({
            locale,
            name: TRANSLATIONS[icon.iconKey][locale],
          })),
        },
      },
    });
  }

  // ── 2) Reset the module menus & forms (4 translations each) ──
  await prisma.moduleMenuFormTranslation.deleteMany({});
  await prisma.moduleMenuForm.deleteMany({});
  await prisma.moduleMenuTranslation.deleteMany({});
  await prisma.moduleMenu.deleteMany({});

  let menuCount = 0;
  let formCount = 0;

  for (const [moduleKey, menus] of Object.entries(MODULE_MENUS)) {
    let menuOrder = 0;
    for (const menu of menus) {
      menuOrder += 1;
      menuCount += 1;
      await prisma.moduleMenu.create({
        data: {
          moduleKey,
          name: menu.name.fa, // base name = Persian default
          iconKey: menu.iconKey,
          sortOrder: menuOrder,
          translations: {
            create: LOCALES.map((locale) => ({
              locale,
              name: menu.name[locale],
            })),
          },
          forms: {
            create: menu.forms.map((form, index) => {
              formCount += 1;
              return {
                name: form.name.fa, // base name = Persian default
                formKey: form.formKey,
                iconKey: form.iconKey,
                sortOrder: index + 1,
                translations: {
                  create: LOCALES.map((locale) => ({
                    locale,
                    name: form.name[locale],
                  })),
                },
              };
            }),
          },
        },
      });
    }
  }

  console.log(
    `Desktop icons reset to ${MODULE_ICONS.length} ERP modules ` +
      `(${MODULE_ICONS.length * LOCALES.length} translation rows); ` +
      `menus seeded: ${menuCount} menus / ${formCount} forms ` +
      `(${(menuCount + formCount) * LOCALES.length} translation rows).`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
