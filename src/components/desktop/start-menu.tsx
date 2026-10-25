"use client";

import * as React from "react";
import { Search, Settings as SettingsIcon, Pin } from "lucide-react";
import { useT, useSettings } from "@/stores/settings-store";
import { useDfbTrMap } from "@/stores/dfb-translations";
import { dfbNodeTitle } from "@/stores/dfb-store";
import { useDesktop, type WindowKind } from "@/stores/desktop-store";
import { useAppRegistry } from "@/stores/app-registry-store";
import { useDfb } from "@/stores/dfb-store";
import { DfbGlyph } from "@/components/erp/form-builder/dfb-dialogs";
import { AppTile } from "./app-tile";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChromeMetrics } from "./chrome-metrics";

interface Tile {
  id: string;
  kind: WindowKind;
  appKey?: string;
  icon: React.ReactNode;
  titleKey: string;
}

export function StartMenu() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const trMap = useDfbTrMap(); // Task 68 — ترجمهٔ آیکون‌های کاربر
  const { setStartOpen, openWindow } = useDesktop();
  /* Task 81 — ride above the auto-shrinking footer */
  const tabbarOpen = useChromeMetrics().tabbarOpen;
  const { apps, load } = useAppRegistry();
  /* Task 45 — user-created main icons join the start-menu grid */
  const dfbUserIcons = useDfb((s) => s.userIcons);
  const dfbLoad = useDfb((s) => s.load);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    void dfbLoad();
  }, [dfbLoad]);

  const close = () => setStartOpen(false);
  const q = query.trim().toLowerCase();

  /* the catalog apps, searchable (§1.3 titles via i18n).
     Task 35 — the BusinessStructure launcher tile was retired: the form now
     lives as a sub-page inside the Settings window (owner request).
     Task 37 — userManagement moved into Settings the same way: no standalone
     tile; it lives on the Settings home as a launcher card. */
  const tiles: Tile[] = [
    ...apps
      .filter((a) => a.appKey !== "userManagement")
      .map((a) => ({
        id: a.appKey,
        kind: "app" as WindowKind,
        appKey: a.appKey,
        icon: <AppTile appKey={a.appKey} />,
        titleKey: a.titleKey,
      })),
    /* Task 45 — user-created main icons (فرمساز); Task 68 — translated label */
    ...dfbUserIcons.map((n) => ({
      id: `dfb-menu-${n.id}`,
      kind: "dfb-menu" as WindowKind,
      appKey: String(n.id),
      icon: <DfbGlyph iconKey={n.iconKey} />,
      titleKey: n.title, // raw DB title (fa) — kept for search
      label: dfbNodeTitle(n, t, locale, trMap),
    })),
  ];
  const filtered = tiles.filter((a) => {
    const label = "label" in a && a.label ? a.label : t(a.titleKey as never);
    return !q || label.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="fixed inset-0 z-[9400]" onClick={close} onContextMenu={(e) => e.preventDefault()} />
      <div
        className={cn(
          "menu-in acrylic-strong fixed left-1/2 z-[9500] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl win-shadow transition-[bottom] duration-300",
          /* Task 81 — ride above the auto-shrinking footer */
          tabbarOpen ? "bottom-[46px]" : "bottom-[60px]",
        )}
        dir="auto"
      >
        <div className="relative mb-4">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("startmenu.searchPlaceholder")}
            className="h-10 rounded-xl ps-9"
          />
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Pin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            {t("startmenu.pinned")}
          </span>
        </div>
        <div className="grid max-h-[300px] grid-cols-4 gap-2 overflow-y-auto scrollbar-slim sm:grid-cols-6">
          {filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                openWindow(app.kind, app.appKey);
                close();
              }}
              className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors hover:bg-foreground/8 cursor-pointer"
            >
              {app.icon}
              {/* Task 94 — same wrap rules as the desktop grid: long words
                  must break inside the cell instead of overlapping. */}
              <span className="line-clamp-2 w-full min-w-0 text-center text-[11px] leading-tight text-foreground/90 [overflow-wrap:anywhere]">
                {"label" in app && app.label ? app.label : t(app.titleKey as never)}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-2 mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("startmenu.recommended")}
          </span>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => {
              openWindow("settings");
              close();
            }}
            className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-foreground/8 cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-white">
              <SettingsIcon className="h-4 w-4" />
            </span>
            <span className="text-start">
              <span className="block text-xs font-medium">{t("settings.title")}</span>
              <span className="block text-[10px] text-muted-foreground">
                {LOCALES_COUNT} {t("common.language")}
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

const LOCALES_COUNT = 11;
void LOCALES_COUNT;
