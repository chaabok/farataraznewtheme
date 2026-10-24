/**
 * APP_CATALOG — single source of truth for the ERP app mesh (Task 18).
 * Owner's desktop list numbering skips #13 intentionally (28 apps total —
 * #29 "عمومی/general" added by owner request).
 * `port` = port IF/WHEN promoted to a standalone service; settings-service (3001)
 * hosts the settings app, dfb-service (3003) hosts the form builder
 * (advancedTools — first promoted standalone app, owner-confirmed Task 45), and
 * the remaining non-settings apps are hosted by the composite `apps-service`
 * (3002) — promotion path stays open because each entry is self-describing
 * (D8 decision, see AGENTS.md).
 * `dbMode`: "shared" = one database for all apps (default), "dedicated" = app gets
 * its own database when its analysis document demands it. Integrity is guaranteed
 * by the IDGeneration contract (§2.4) + cross-service reference rules (§4).
 */
export type DbMode = "shared" | "dedicated";

export type CatalogHost = "apps-service" | "settings-service" | "dfb-service";

export interface AppCatalogEntry {
  appKey: string;
  order: number;
  titleFa: string;
  titleKey: string; // i18n dictionary key (src/i18n/dictionaries.ts)
  iconKey: string;  // frontend lucide mapping key (src/lib/app-catalog.ts)
  appGroup: "platform" | "financial" | "logistics" | "sales" | "production" | "hr" | "distribution" | "analytics";
  port: number;
  dbMode: DbMode;
  host: CatalogHost;
}

export const SETTINGS_SERVICE_PORT = 3001;
export const APPS_SERVICE_PORT = 3002;
export const DFB_SERVICE_PORT = 3003;

export const APP_CATALOG: AppCatalogEntry[] = [
  { appKey: "settings",              order: 1,  titleFa: "تنظیمات",                     titleKey: "app.settings",              iconKey: "settings",        appGroup: "platform",     port: 3001, dbMode: "shared", host: "settings-service" },
  { appKey: "accounting",            order: 2,  titleFa: "حسابداری",                    titleKey: "app.accounting",            iconKey: "calculator",      appGroup: "financial",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "receiptsPayment",       order: 3,  titleFa: "دریافت و پرداخت",             titleKey: "app.receiptsPayment",       iconKey: "receiptsPayment", appGroup: "financial",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "inventory",             order: 4,  titleFa: "انبار",                       titleKey: "app.inventory",             iconKey: "warehouse",       appGroup: "logistics",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "sales",                 order: 5,  titleFa: "فروش",                        titleKey: "app.sales",                 iconKey: "cart",            appGroup: "sales",        port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "fixedAssets",           order: 6,  titleFa: "دارایی ثابت",                 titleKey: "app.fixedAssets",           iconKey: "landmark",        appGroup: "financial",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "procurement",           order: 7,  titleFa: "تدارکات",                     titleKey: "app.procurement",           iconKey: "packageSearch",   appGroup: "logistics",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "foreignOrders",         order: 8,  titleFa: "سفارشات خارجی",               titleKey: "app.foreignOrders",         iconKey: "globe",           appGroup: "sales",        port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "costing",               order: 9,  titleFa: "بهای تمام شده",               titleKey: "app.costing",               iconKey: "sigma",           appGroup: "financial",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "materialDelivery",      order: 10, titleFa: "کنترل تحویل مواد",            titleKey: "app.materialDelivery",      iconKey: "truckCheck",      appGroup: "logistics",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "productionPlanning",    order: 11, titleFa: "برنامه ریزی تولید",           titleKey: "app.productionPlanning",    iconKey: "factory",         appGroup: "production",   port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "payroll",               order: 12, titleFa: "حقوق و دستمزد",               titleKey: "app.payroll",               iconKey: "handCoins",       appGroup: "hr",           port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "hr",                    order: 14, titleFa: "منابع انسانی",                titleKey: "app.hr",                    iconKey: "users",           appGroup: "hr",           port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "officeAutomation",      order: 15, titleFa: "اتوماسیون اداری",             titleKey: "app.officeAutomation",      iconKey: "fileStack",       appGroup: "platform",     port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "crm",                   order: 16, titleFa: "مدیریت ارتباط با مشتریان",    titleKey: "app.crm",                   iconKey: "heartHandshake",  appGroup: "sales",        port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "advancedTools",         order: 17, titleFa: "ابزارهای پیشرفته",            titleKey: "app.advancedTools",         iconKey: "wrench",          appGroup: "platform",     port: 3003, dbMode: "dedicated", host: "dfb-service" },
  { appKey: "userManagement",        order: 18, titleFa: "مدیریت کاربران",              titleKey: "app.userManagement",        iconKey: "userCog",         appGroup: "platform",     port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "workflow",              order: 19, titleFa: "گردش کار",                    titleKey: "app.workflow",              iconKey: "workflow",        appGroup: "platform",     port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "smsCenter",             order: 20, titleFa: "پیامک رسان",                  titleKey: "app.smsCenter",             iconKey: "messageSquare",   appGroup: "platform",     port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "retailSales",           order: 21, titleFa: "فروش فروشگاهی",               titleKey: "app.retailSales",           iconKey: "store",           appGroup: "sales",        port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "marketingSales",        order: 22, titleFa: "بازاریابی و فروش",            titleKey: "app.marketingSales",        iconKey: "megaphone",       appGroup: "sales",        port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "coldDistribution",      order: 23, titleFa: "پخش سرد",                     titleKey: "app.coldDistribution",      iconKey: "snowflake",       appGroup: "distribution", port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "hotDistribution",       order: 24, titleFa: "پخش گرم",                     titleKey: "app.hotDistribution",       iconKey: "flame",           appGroup: "distribution", port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "financialStatements",   order: 25, titleFa: "صورت های مالی",               titleKey: "app.financialStatements",   iconKey: "fileBarChart",    appGroup: "financial",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "businessIntelligence",  order: 26, titleFa: "هوش تجاری",                   titleKey: "app.businessIntelligence",  iconKey: "barChart",        appGroup: "analytics",    port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "maintenance",           order: 27, titleFa: "تعمیرات و نگهداری",           titleKey: "app.maintenance",           iconKey: "hammer",          appGroup: "production",   port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "onlineWebsite",         order: 28, titleFa: "وبسایت آنلاین",               titleKey: "app.onlineWebsite",         iconKey: "globe",           appGroup: "platform",     port: 3002, dbMode: "shared", host: "apps-service" },
  { appKey: "general",               order: 29, titleFa: "عمومی",                       titleKey: "app.general",               iconKey: "boxes",           appGroup: "platform",     port: 3002, dbMode: "shared", host: "apps-service" },
];

export function findApp(appKey: string): AppCatalogEntry | undefined {
  return APP_CATALOG.find((a) => a.appKey === appKey);
}
