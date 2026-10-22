import {
  ArrowLeftRight,
  Banknote,
  BarChart3,
  BookOpen,
  Boxes,
  Building,
  Building2,
  Calculator,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Cog,
  Coins,
  Database,
  FileSpreadsheet,
  FileText,
  Folder,
  Globe,
  Landmark,
  Layers,
  Lock,
  Monitor,
  Package,
  PieChart,
  Receipt,
  Send,
  Settings,
  Shield,
  ShoppingCart,
  SquareTerminal,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

/**
 * Registry that maps an `iconKey` coming from the desktop-service API
 * to a Lucide icon component used by the UI.
 *
 * The 10 ERP module keys mirror `src/lib/modules-registry.ts` and the
 * window manager — clicking such an icon opens its module flyout menu.
 */
export const iconRegistry: Record<string, LucideIcon> = {
  // ERP modules
  settings: Settings,
  accounting: Calculator,
  payment: ArrowLeftRight,
  inventory: Warehouse,
  sales: ShoppingCart,
  fixedAsset: Building2,
  procurement: Truck,
  order: ClipboardList,
  costing: Coins,
  financialStatement: FileSpreadsheet,

  // module menu / form icons (from the desktop-service menu seed)
  cog: Cog,
  shield: Shield,
  database: Database,
  fileText: FileText,
  bookOpen: BookOpen,
  barChart: BarChart3,
  banknote: Banknote,
  send: Send,
  landmark: Landmark,
  package: Package,
  boxes: Boxes,
  receipt: Receipt,
  users: Users,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  truck: Truck,
  clipboardList: ClipboardList,
  clipboardCheck: ClipboardCheck,
  pieChart: PieChart,
  calculator: Calculator,
  building: Building,
  calendar: Calendar,
  layers: Layers,
  lock: Lock,
  arrowLeftRight: ArrowLeftRight,
  fileSpreadsheet: FileSpreadsheet,

  // generic / taskbar keys
  folder: Folder,
  globe: Globe,
  terminal: Terminal,
  squareTerminal: SquareTerminal,
  monitor: Monitor,
  trash: Trash2,
};

/** Fallback icon for unknown keys coming from the database. */
export const fallbackIcon: LucideIcon = Monitor;

export function getIcon(key: string): LucideIcon {
  return iconRegistry[key] ?? fallbackIcon;
}
