"use client";

import * as React from "react";
import { ClipboardList, Database, Loader2, MousePointerClick, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { appApi } from "@/lib/api";
import { getAppDescriptor } from "@/lib/app-catalog";
import { AppTile } from "@/components/desktop/app-tile";
import { FormActionBar, type ActionBarListItem } from "@/components/forms/action-bar";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* sample rows for the records-list dropdown demo — NOT business data (§4.6) */
const DEMO_ITEMS: ActionBarListItem[] = [
  { id: "1001", title: "1001" },
  { id: "1002", title: "1002" },
  { id: "1003", title: "1003" },
];

/**
 * Generic placeholder window for catalog apps whose analysis document has not
 * arrived yet (owner's instruction: NO forms, NO fields, NO business backend).
 * Shows live infrastructure status: secure signed connectivity to the mesh.
 */

type Integration =
  | { phase: "checking" }
  | { phase: "ok"; latencyMs: number }
  | { phase: "fail" };

interface Peer {
  service: string;
  status: string;
  latencyMs: number;
  signed: boolean;
}

export function AppPlaceholderWindow({ appKey }: { appKey: string }) {
  const t = useT();
  const descriptor = getAppDescriptor(appKey);
  const [integration, setIntegration] = React.useState<Integration>({ phase: "checking" });
  const [tick, setTick] = React.useState(0);
  /* demo state of the action-bar preview: the "current record" of the fake form */
  const [current, setCurrent] = React.useState<ActionBarListItem | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      /* yield a microtask first: state resets happen asynchronously, which keeps
         rapid appKey switches tear-free and satisfies react-hooks/set-state-in-effect */
      await Promise.resolve();
      if (!alive) return;
      setIntegration({ phase: "checking" });
      try {
        const res = await appApi(appKey).get<{ overall: string; peers: Peer[] }>(
          "integrations/status",
        );
        if (!alive) return;
        const peer = res.peers?.[0];
        if (res.overall === "ok" && peer?.status === "ok") {
          setIntegration({ phase: "ok", latencyMs: peer.latencyMs });
        } else {
          setIntegration({ phase: "fail" });
        }
      } catch {
        if (alive) setIntegration({ phase: "fail" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [appKey, tick]);

  const dbShared = (descriptor?.dbMode ?? "shared") === "shared";

  /* demo «بستن» — closes this placeholder window via the desktop store */
  const closeThisWindow = () => {
    const win = useDesktop
      .getState()
      .windows.find((w) => w.kind === "app" && w.appKey === appKey);
    if (win) useDesktop.getState().closeWindow(win.id);
  };

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto p-6 scrollbar-slim"
      dir="auto"
    >
      <AppTile appKey={appKey} className="h-24 w-24 rounded-3xl shadow-xl" iconClass="h-11 w-11" />

      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight">{t(`app.${appKey}` as never)}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("app.name")}</p>
      </div>

      {/* infrastructure chips — NOT form fields */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-[11px] text-muted-foreground">
          <Server className="h-3 w-3" aria-hidden />
          {t("ph.portLabel")}: {descriptor?.port ?? 3002}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-[11px] text-muted-foreground">
          <Database className="h-3 w-3" aria-hidden />
          {dbShared ? t("ph.dbShared") : t("ph.dbDedicated")}
        </span>
      </div>

      {/* awaiting-analysis banner (owner: forms come with the analysis docs) */}
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {t("ph.awaitingBadge")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("ph.awaitingBody")}
            </p>
          </div>
        </div>
      </div>

      {/* secure-mesh status card */}
      <div className="w-full max-w-md rounded-2xl border bg-background/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            {t("ph.secureApi")}
          </span>
          <button
            type="button"
            aria-label={t("common.retry")}
            onClick={() => setTick((n) => n + 1)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-background/70 px-3 py-2.5">
          <span className="inline-flex items-center gap-2 text-xs font-medium">
            <AppTile appKey="settings" className="h-6 w-6 rounded-md" iconClass="h-3.5 w-3.5" />
            settings-service
          </span>
          {integration.phase === "checking" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              {t("ph.checking")}
            </span>
          )}
          {integration.phase === "ok" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className={cn("h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500/60")} aria-hidden />
              {t("ph.linkOk")} · {integration.latencyMs}ms
            </span>
          )}
          {integration.phase === "fail" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
              {t("ph.linkFail")}
            </span>
          )}
        </div>
      </div>

      {/* Task 20 — form action-bar infrastructure preview (no fields until the
          analysis document arrives; button behavior runs on sample data) */}
      <div className="w-full max-w-lg rounded-2xl border bg-background/60 p-4">
        <div className="mb-1 flex items-center gap-2">
          <MousePointerClick className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
          <span className="text-xs font-semibold">{t("abar.demoTitle")}</span>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
          {t("abar.demoNote")}
        </p>

        {/* the "current record" line stands in for real form fields (§4.6) */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border bg-background/70 px-3 py-2 text-xs">
          <span className="shrink-0 text-muted-foreground">{t("abar.list")}</span>
          <span className="truncate font-medium">{current ? current.title : "—"}</span>
        </div>

        <div className="rounded-xl border bg-background/70 p-2">
          <FormActionBar
            onReset={() => {
              setCurrent(null);
              toast.success(t("abar.resetToast"));
            }}
            onSave={async () => {
              await delay(600);
              toast.success(t("abar.savedToast"));
            }}
            onCopy={() => {
              setCurrent(null);
              toast.success(t("abar.copyToast"));
            }}
            onDelete={async () => {
              await delay(350);
              setCurrent(null);
              toast.success(t("abar.deletedToast"));
            }}
            onPrint={() => {
              toast.success(t("abar.printToast"));
            }}
            onClose={closeThisWindow}
            listItems={DEMO_ITEMS}
            onOpenListItem={(item) => {
              setCurrent(item);
              toast.success(t("abar.itemOpened"));
            }}
          />
        </div>
      </div>
    </div>
  );
}
