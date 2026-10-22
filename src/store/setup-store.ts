import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';
import {
  formatTemplate,
  getLocalizedModuleMeta,
  translate,
} from '@/i18n';
import { apiFetch } from '@/lib/api-client';
import { useDesktopStore } from '@/store/desktop-store';
import type {
  SetupDatabaseKey,
  SetupOverview,
} from '@/types/desktop';

interface ToggleResponse {
  data: {
    service: { moduleKey: string; selected: boolean; recordCount: number };
    fromDatabase: SetupDatabaseKey;
    toDatabase: SetupDatabaseKey;
    movedRecords: number;
  };
}

interface AddRecordResponse {
  data: { databaseKey: SetupDatabaseKey };
}

function currentLocale() {
  return useDesktopStore.getState().locale;
}

/** Localized display name of a module (falls back to the DB name / key). */
function moduleName(moduleKey: string, dbName: string): string {
  const locale = currentLocale();
  return (
    getLocalizedModuleMeta(moduleKey, locale)?.name ?? dbName ?? moduleKey
  );
}

function databaseLabel(databaseKey: SetupDatabaseKey): string {
  const locale = currentLocale();
  return translate(
    locale,
    databaseKey === 'main' ? 'setup.mainDb' : 'setup.secondaryDb',
  );
}

interface SetupState {
  /** Installation settings window visibility. */
  isSetupWindowOpen: boolean;
  overview: SetupOverview | null;
  isLoading: boolean;
  error: string | null;
  /** moduleKey of the row currently being toggled / receiving a record. */
  pendingKey: string | null;

  openSetupWindow: () => void;
  closeSetupWindow: () => void;
  fetchOverview: () => Promise<void>;
  /** Installs a service into the main DB (true) or the secondary DB (false). */
  toggleService: (moduleKey: string, selected: boolean) => Promise<void>;
  /** Creates a demo record in the database the service is installed in. */
  addDemoRecord: (moduleKey: string) => Promise<void>;
}

export const useSetupStore = create<SetupState>((set, get) => ({
  isSetupWindowOpen: false,
  overview: null,
  isLoading: false,
  error: null,
  pendingKey: null,

  openSetupWindow: () => {
    set({ isSetupWindowOpen: true, error: null });
    void get().fetchOverview();
  },

  closeSetupWindow: () => set({ isSetupWindowOpen: false }),

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const payload = await apiFetch<{ data: SetupOverview }>(
        '/api/desktop/setup/overview',
      );
      set({ overview: payload.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error && error.message
            ? error.message
            : translate(currentLocale(), 'setup.loadError'),
      });
    }
  },

  toggleService: async (moduleKey, selected) => {
    const locale = currentLocale();
    set({ pendingKey: moduleKey });
    try {
      const payload = await apiFetch<ToggleResponse>(
        `/api/desktop/setup/services/${encodeURIComponent(moduleKey)}`,
        { method: 'PUT', body: { selected } },
      );
      const { service, movedRecords, toDatabase } = payload.data;
      // Refresh the full overview so both database cards stay accurate.
      await get().fetchOverview();
      set({ pendingKey: null });
      const name = moduleName(service.moduleKey, service.moduleKey);
      toast({
        title: name,
        description: formatTemplate(translate(locale, 'setup.movedToast'), {
          name,
          db: databaseLabel(toDatabase),
          count: movedRecords,
        }),
      });
    } catch (error) {
      set({ pendingKey: null });
      toast({
        title: moduleName(moduleKey, moduleKey),
        description:
          error instanceof Error && error.message
            ? error.message
            : translate(locale, 'setup.loadError'),
      });
    }
  },

  addDemoRecord: async (moduleKey) => {
    const locale = currentLocale();
    const localeTag =
      locale === 'fa' ? 'fa-IR' : locale === 'ar' ? 'ar-EG' : locale === 'tr' ? 'tr-TR' : 'en-US';
    set({ pendingKey: moduleKey });
    try {
      const payload = await apiFetch<AddRecordResponse>(
        `/api/desktop/setup/services/${encodeURIComponent(moduleKey)}/records`,
        {
          method: 'POST',
          body: {
            title: formatTemplate(
              translate(locale, 'setup.demoRecordTitle'),
              {
                time: new Intl.DateTimeFormat(localeTag, {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date()),
              },
            ),
            payload: JSON.stringify({ source: 'setup-window' }),
          },
        },
      );
      await get().fetchOverview();
      set({ pendingKey: null });
      toast({
        title: moduleName(moduleKey, moduleKey),
        description: formatTemplate(
          translate(locale, 'setup.recordAdded'),
          { db: databaseLabel(payload.data.databaseKey) },
        ),
      });
    } catch (error) {
      set({ pendingKey: null });
      toast({
        title: moduleName(moduleKey, moduleKey),
        description:
          error instanceof Error && error.message
            ? error.message
            : translate(locale, 'setup.loadError'),
      });
    }
  },
}));
