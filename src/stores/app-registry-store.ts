"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { FRONTEND_APPS, type AppDescriptor } from "@/lib/app-catalog";

/**
 * App-mesh registry (§5.4 DB-driven): loaded once from the settings-service
 * AppRegistry; falls back to the embedded catalog when the API is unreachable.
 */
interface RegistryState {
  apps: AppDescriptor[];
  source: "idle" | "registry" | "fallback";
  loaded: boolean;
  load: () => Promise<void>;
}

function sortApps(apps: AppDescriptor[]): AppDescriptor[] {
  return [...apps].sort((a, b) => a.order - b.order);
}

export const useAppRegistry = create<RegistryState>()((set, get) => ({
  apps: [],
  source: "idle",
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const res = await api.get<{ items: Array<Record<string, unknown>> }>("app-registry");
      const apps: AppDescriptor[] = (res.items ?? []).map((r) => ({
        appKey: String(r.appKey),
        order: Number(r.order),
        titleKey: String(r.titleKey),
        iconKey: String(r.iconKey),
        appGroup: String(r.appGroup),
        port: Number(r.port),
        dbMode: String(r.dbMode),
      }));
      if (apps.length === 0) throw new Error("empty registry");
      set({ apps: sortApps(apps), source: "registry", loaded: true });
    } catch {
      set({ apps: sortApps(FRONTEND_APPS), source: "fallback", loaded: true });
    }
  },
}));
