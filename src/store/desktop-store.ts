import { create } from 'zustand';
import type { DesktopIconItem, TaskbarApp } from '@/types/desktop';

/**
 * Pinned apps shown in the center of the taskbar (Windows 11 style).
 * These are UI-level state; desktop icons come from the desktop-service API.
 */
const PINNED_APPS: TaskbarApp[] = [
  { id: 'explorer', label: 'فایل‌های من', iconKey: 'folder', color: '#f59e0b' },
  { id: 'browser', label: 'مرورگر', iconKey: 'globe', color: '#ef4444' },
  { id: 'messenger', label: 'پیام‌رسان', iconKey: 'send', color: '#0ea5e9' },
  { id: 'terminal', label: 'ترمینال', iconKey: 'terminal', color: '#e2e8f0' },
  { id: 'analytics', label: 'تحلیل داده', iconKey: 'barChart', color: '#a78bfa' },
  { id: 'settings', label: 'تنظیمات', iconKey: 'settings', color: '#94a3b8' },
];

interface DesktopState {
  /** Icons fetched from the desktop-service (NestJS microservice). */
  icons: DesktopIconItem[];
  isLoading: boolean;
  error: string | null;
  /** Id of the currently selected desktop icon (single click). */
  selectedIconId: string | null;
  /** Windows 11 style start menu visibility. */
  isStartMenuOpen: boolean;
  /** Apps pinned to the taskbar. */
  pinnedApps: TaskbarApp[];
  /** Id of the "running" taskbar app used for the underline indicator. */
  activeTaskbarAppId: string | null;

  fetchIcons: () => Promise<void>;
  selectIcon: (id: string | null) => void;
  toggleStartMenu: (open?: boolean) => void;
  setActiveTaskbarApp: (id: string | null) => void;
}

export const useDesktopStore = create<DesktopState>((set) => ({
  icons: [],
  isLoading: true,
  error: null,
  selectedIconId: null,
  isStartMenuOpen: false,
  pinnedApps: PINNED_APPS,
  activeTaskbarAppId: null,

  fetchIcons: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/desktop/icons', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('خطا در دریافت آیکون‌ها از سرویس دسکتاپ');
      }
      const payload = (await res.json()) as { data: DesktopIconItem[] };
      set({ icons: payload.data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'خطای ناشناخته در ارتباط با سرویس',
        isLoading: false,
      });
    }
  },

  selectIcon: (id) => set({ selectedIconId: id }),

  toggleStartMenu: (open) =>
    set((state) => ({ isStartMenuOpen: open ?? !state.isStartMenuOpen })),

  setActiveTaskbarApp: (id) => set({ activeTaskbarAppId: id }),
}));
