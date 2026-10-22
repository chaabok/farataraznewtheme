import {
  ArrowLeftRight,
  Building2,
  Calculator,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  Folder,
  Globe,
  Monitor,
  Settings,
  ShoppingCart,
  SquareTerminal,
  Terminal,
  Trash2,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

/**
 * Registry that maps an `iconKey` coming from the desktop-service API
 * to a Lucide icon component used by the UI.
 *
 * The 10 ERP module keys mirror `src/lib/modules-registry.ts` and the
 * window manager — double-clicking such an icon opens its module window.
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
