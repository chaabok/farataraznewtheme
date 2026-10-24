import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Calculator,
  ClipboardList,
  Factory,
  FileBarChart,
  FileStack,
  Flame,
  Folder,
  Globe,
  HandCoins,
  Hammer,
  HeartHandshake,
  Landmark,
  ListTree,
  Megaphone,
  MessageSquare,
  NotebookPen,
  PackageSearch,
  Settings,
  ShoppingCart,
  Sigma,
  Snowflake,
  Store,
  UserCog,
  Users,
  Warehouse,
  Wrench,
  Truck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * Frontend mirror of mini-services/_shared/app-catalog.ts (Task 18).
 * The DB-driven AppRegistry (settings-service) wins at runtime; this list is the
 * offline fallback so the desktop never goes blank (§5.4 + resilience).
 * Owner's numbering skips #13 intentionally — 28 apps total (order 29 = عمومی).
 */
export interface AppDescriptor {
  appKey: string;
  order: number;
  titleKey: string;
  iconKey: string;
  appGroup: string;
  port: number;
  dbMode: string;
}

export const FRONTEND_APPS: AppDescriptor[] = [
  { appKey: "settings",             order: 1,  titleKey: "app.settings",             iconKey: "settings",        appGroup: "platform",     port: 3001, dbMode: "shared" },
  { appKey: "accounting",           order: 2,  titleKey: "app.accounting",           iconKey: "calculator",      appGroup: "financial",    port: 3002, dbMode: "shared" },
  { appKey: "receiptsPayment",      order: 3,  titleKey: "app.receiptsPayment",      iconKey: "receiptsPayment", appGroup: "financial",    port: 3002, dbMode: "shared" },
  { appKey: "inventory",            order: 4,  titleKey: "app.inventory",            iconKey: "warehouse",       appGroup: "logistics",    port: 3002, dbMode: "shared" },
  { appKey: "sales",                order: 5,  titleKey: "app.sales",                iconKey: "cart",            appGroup: "sales",        port: 3002, dbMode: "shared" },
  { appKey: "fixedAssets",          order: 6,  titleKey: "app.fixedAssets",          iconKey: "landmark",        appGroup: "financial",    port: 3002, dbMode: "shared" },
  { appKey: "procurement",          order: 7,  titleKey: "app.procurement",          iconKey: "packageSearch",   appGroup: "logistics",    port: 3002, dbMode: "shared" },
  { appKey: "foreignOrders",        order: 8,  titleKey: "app.foreignOrders",        iconKey: "globe",           appGroup: "sales",        port: 3002, dbMode: "shared" },
  { appKey: "costing",              order: 9,  titleKey: "app.costing",              iconKey: "sigma",           appGroup: "financial",    port: 3002, dbMode: "shared" },
  { appKey: "materialDelivery",     order: 10, titleKey: "app.materialDelivery",     iconKey: "truckCheck",      appGroup: "logistics",    port: 3002, dbMode: "shared" },
  { appKey: "productionPlanning",   order: 11, titleKey: "app.productionPlanning",   iconKey: "factory",         appGroup: "production",   port: 3002, dbMode: "shared" },
  { appKey: "payroll",              order: 12, titleKey: "app.payroll",              iconKey: "handCoins",       appGroup: "hr",           port: 3002, dbMode: "shared" },
  { appKey: "hr",                   order: 14, titleKey: "app.hr",                   iconKey: "users",           appGroup: "hr",           port: 3002, dbMode: "shared" },
  { appKey: "officeAutomation",     order: 15, titleKey: "app.officeAutomation",     iconKey: "fileStack",       appGroup: "platform",     port: 3002, dbMode: "shared" },
  { appKey: "crm",                  order: 16, titleKey: "app.crm",                  iconKey: "heartHandshake",  appGroup: "sales",        port: 3002, dbMode: "shared" },
  { appKey: "advancedTools",        order: 17, titleKey: "app.advancedTools",        iconKey: "wrench",          appGroup: "platform",     port: 3003, dbMode: "dedicated" },
  { appKey: "userManagement",       order: 18, titleKey: "app.userManagement",       iconKey: "userCog",         appGroup: "platform",     port: 3002, dbMode: "shared" },
  { appKey: "workflow",             order: 19, titleKey: "app.workflow",             iconKey: "workflow",        appGroup: "platform",     port: 3002, dbMode: "shared" },
  { appKey: "smsCenter",            order: 20, titleKey: "app.smsCenter",            iconKey: "messageSquare",   appGroup: "platform",     port: 3002, dbMode: "shared" },
  { appKey: "retailSales",          order: 21, titleKey: "app.retailSales",          iconKey: "store",           appGroup: "sales",        port: 3002, dbMode: "shared" },
  { appKey: "marketingSales",       order: 22, titleKey: "app.marketingSales",       iconKey: "megaphone",       appGroup: "sales",        port: 3002, dbMode: "shared" },
  { appKey: "coldDistribution",     order: 23, titleKey: "app.coldDistribution",     iconKey: "snowflake",       appGroup: "distribution", port: 3002, dbMode: "shared" },
  { appKey: "hotDistribution",      order: 24, titleKey: "app.hotDistribution",      iconKey: "flame",           appGroup: "distribution", port: 3002, dbMode: "shared" },
  { appKey: "financialStatements",  order: 25, titleKey: "app.financialStatements",  iconKey: "fileBarChart",    appGroup: "financial",    port: 3002, dbMode: "shared" },
  { appKey: "businessIntelligence", order: 26, titleKey: "app.businessIntelligence", iconKey: "barChart",        appGroup: "analytics",    port: 3002, dbMode: "shared" },
  { appKey: "maintenance",          order: 27, titleKey: "app.maintenance",          iconKey: "hammer",          appGroup: "production",   port: 3002, dbMode: "shared" },
  { appKey: "onlineWebsite",        order: 28, titleKey: "app.onlineWebsite",        iconKey: "globe",           appGroup: "platform",     port: 3002, dbMode: "shared" },
  { appKey: "general",              order: 29, titleKey: "app.general",              iconKey: "boxes",           appGroup: "platform",     port: 3002, dbMode: "shared" },
];

export const APP_ICONS: Record<string, { Icon: LucideIcon; tile: string }> = {
  settings:         { Icon: Settings,        tile: "from-slate-400 to-slate-600" },
  accounting:       { Icon: Calculator,      tile: "from-violet-500 to-violet-700" },
  receiptsPayment:  { Icon: ArrowLeftRight,  tile: "from-emerald-500 to-emerald-700" },
  inventory:        { Icon: Warehouse,       tile: "from-amber-500 to-amber-600" },
  sales:            { Icon: ShoppingCart,    tile: "from-rose-500 to-rose-700" },
  fixedAssets:      { Icon: Landmark,        tile: "from-teal-500 to-teal-700" },
  procurement:      { Icon: PackageSearch,   tile: "from-orange-500 to-orange-600" },
  foreignOrders:    { Icon: Globe,           tile: "from-cyan-500 to-cyan-700" },
  costing:          { Icon: Sigma,           tile: "from-lime-600 to-lime-700" },
  materialDelivery: { Icon: Truck,             tile: "from-sky-500 to-sky-700" },
  productionPlanning: { Icon: Factory,       tile: "from-fuchsia-500 to-fuchsia-700" },
  payroll:          { Icon: HandCoins,       tile: "from-green-500 to-green-700" },
  hr:               { Icon: Users,           tile: "from-purple-500 to-purple-700" },
  officeAutomation: { Icon: FileStack,       tile: "from-stone-500 to-stone-700" },
  crm:              { Icon: HeartHandshake,  tile: "from-pink-500 to-pink-700" },
  advancedTools:    { Icon: Wrench,          tile: "from-amber-600 to-amber-800" },
  userManagement:   { Icon: UserCog,         tile: "from-violet-600 to-violet-800" },
  workflow:         { Icon: Workflow,        tile: "from-cyan-600 to-cyan-800" },
  smsCenter:        { Icon: MessageSquare,   tile: "from-emerald-600 to-emerald-800" },
  retailSales:      { Icon: Store,           tile: "from-rose-600 to-rose-800" },
  marketingSales:   { Icon: Megaphone,       tile: "from-orange-600 to-orange-800" },
  coldDistribution: { Icon: Snowflake,       tile: "from-sky-400 to-sky-600" },
  hotDistribution:  { Icon: Flame,           tile: "from-red-500 to-red-700" },
  financialStatements: { Icon: FileBarChart, tile: "from-teal-600 to-teal-800" },
  businessIntelligence: { Icon: BarChart3,   tile: "from-fuchsia-600 to-fuchsia-800" },
  maintenance:      { Icon: Hammer,          tile: "from-yellow-500 to-yellow-600" },
  onlineWebsite:    { Icon: Globe,           tile: "from-cyan-500 to-cyan-700" },
  general:          { Icon: Boxes,           tile: "from-fuchsia-600 to-rose-700" },
};

export function getAppIcon(appKey: string): { Icon: LucideIcon; tile: string } | undefined {
  return APP_ICONS[appKey];
}

/* Task 45 (فرمساز) — glyph by ICON KEY: user-created menus/icons store an
   iconKey (the same keys as the catalog iconKey column); resolve through the
   catalog, then a small extra set, then a neutral folder fallback. */
const ICON_KEY_EXTRA: Record<string, { Icon: LucideIcon; tile: string }> = {
  folder: { Icon: Folder, tile: "from-emerald-500 to-emerald-700" },
  listTree: { Icon: ListTree, tile: "from-amber-500 to-orange-600" },
  clipboardList: { Icon: ClipboardList, tile: "from-sky-500 to-sky-700" },
  notebookPen: { Icon: NotebookPen, tile: "from-rose-500 to-rose-700" },
};

export function getIconKeyGlyph(iconKey: string): { Icon: LucideIcon; tile: string } {
  const direct = APP_ICONS[iconKey];
  if (direct) return direct;
  const desc = FRONTEND_APPS.find((a) => a.iconKey === iconKey);
  if (desc && APP_ICONS[desc.appKey]) return APP_ICONS[desc.appKey];
  return ICON_KEY_EXTRA[iconKey] ?? { Icon: Folder, tile: "from-slate-400 to-slate-600" };
}

export function getAppDescriptor(appKey: string): AppDescriptor | undefined {
  return FRONTEND_APPS.find((a) => a.appKey === appKey);
}
