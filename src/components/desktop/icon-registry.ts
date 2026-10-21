import {
  BarChart3,
  Cctv,
  FileText,
  Folder,
  Globe,
  Monitor,
  Send,
  Settings,
  Terminal,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

/**
 * Registry that maps an `iconKey` coming from the desktop-service API
 * to a Lucide icon component used by the UI.
 *
 * To support a new icon, add it here and seed it with the matching key.
 */
export const iconRegistry: Record<string, LucideIcon> = {
  monitor: Monitor,
  trash: Trash2,
  folder: Folder,
  fileText: FileText,
  cctv: Cctv,
  barChart: BarChart3,
  send: Send,
  settings: Settings,
  globe: Globe,
  terminal: Terminal,
};

/** Fallback icon for unknown keys coming from the database. */
export const fallbackIcon: LucideIcon = Monitor;

export function getIcon(key: string): LucideIcon {
  return iconRegistry[key] ?? fallbackIcon;
}
