import { create } from 'zustand';
import type { DesktopIconItem, TaskbarApp } from '@/types/desktop';

/**
 * Pinned apps shown in the center of the taskbar (Windows 11 style).
 * These are UI-level state; desktop icons come from the desktop-service API.
 */
const PINNED_APPS: TaskbarApp[] = [
  { id: 'explorer', label: 'فایل‌های من', iconKey: 'folder', color: '#f59e0b' },
  { id: 'browser', label: 'مرورگر', iconKey: 'globe', color: '#ef4444' },
  { id: 'terminal', label: 'ترمینال', iconKey: 'terminal', color: '#e2e8f0' },
];

/** One open module window on the desktop. */
export interface DesktopWindow {
  moduleId: string;
  /** Stacking order (higher = on top). */
  z: number;
  /** Cascade position slot when the window was opened. */
  slot: number;
}

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
  /** Open module windows with stacking order. */
  windows: DesktopWindow[];
  windowZCounter: number;
  windowSlotCounter: number;

  fetchIcons: () => Promise<void>;
  selectIcon: (id: string | null) => void;
  toggleStartMenu: (open?: boolean) => void;
  openWindow: (moduleId: string) => void;
  closeWindow: (moduleId: string) => void;
  focusWindow: (moduleId: string) => void;
}

export const useDesktopStore = create<DesktopState>((set) => ({
  icons: [],
  isLoading: true,
  error: null,
  selectedIconId: null,
  isStartMenuOpen: false,
  pinnedApps: PINNED_APPS,
  windows: [],
  windowZCounter: 10,
  windowSlotCounter: 0,

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

  openWindow: (moduleId) =>
    set((state) => {
      const nextZ = state.windowZCounter + 1;
      const existing = state.windows.find((w) => w.moduleId === moduleId);
      if (existing) {
        return {
          windows: state.windows.map((w) =>
            w.moduleId === moduleId ? { ...w, z: nextZ } : w,
          ),
          windowZCounter: nextZ,
          isStartMenuOpen: false,
        };
      }
      return {
        windows: [
          ...state.windows,
          { moduleId, z: nextZ, slot: state.windowSlotCounter },
        ],
        windowZCounter: nextZ,
        windowSlotCounter: state.windowSlotCounter + 1,
        isStartMenuOpen: false,
        selectedIconId: null,
      };
    }),

  closeWindow: (moduleId) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.moduleId !== moduleId),
    })),

  focusWindow: (moduleId) =>
    set((state) => {
      const nextZ = state.windowZCounter + 1;
      const target = state.windows.find((w) => w.moduleId === moduleId);
      if (!target || target.z === state.windowZCounter) {
        return state;
      }
      return {
        windows: state.windows.map((w) =>
          w.moduleId === moduleId ? { ...w, z: nextZ } : w,
        ),
        windowZCounter: nextZ,
      };
    }),
}));
