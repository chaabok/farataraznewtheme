"use client";

import * as React from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileStack,
  Gavel,
  Hourglass,
  Inbox,
  Loader2,
  RefreshCw,
  Timer,
  AlarmClockOff,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appApi } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * WorkflowReports — گزارش‌ها و داشبورد گردش سازمان (t181 — فاز ۵ نقشهٔ راه).
 *
 * سه بلوک روی دیتای موتور (BFF /api/workflow/workflow-reports/**):
 *  · کارت‌های KPI — نمونه‌ها per وضعیت، میانگین زمان طی‌شدن، نقض SLA باز،
 *    تفویض‌های فعال و تفکیک چرخش per فرم (فعلاً سند حسابداری).
 *  · نقاط گلوگاه — میانگین/بیشینهٔ توقف per گره (اقدام) با نوار افقی مقایسه‌ای،
 *    گره‌های هم‌اکنون منتظر و نقض SLA باز — راهنمای بهینه‌سازی فرآیند.
 *  · نمونه‌های اخیر — جدول با فیلتر وضعیت/فرم، گام جاری، ساعت انتظار و SLA.
 */

interface Overview {
  counts: { total: number; running: number; approved: number; rejected: number; cancelled: number };
  avgCompletionHours: number | null;
  slaBreachedNow: number;
  activeDelegations: number;
  runningOnActionNode: number;
  perEntityType: {
    entityType: string;
    total: number;
    running: number;
    approved: number;
    rejected: number;
    cancelled: number;
  }[];
}

interface BottleneckItem {
  definitionCode: string;
  definitionName: string;
  processVersion: number;
  entityType: string;
  nodeCode: string;
  nodeTitle: string;
  nodeType: string;
  roleCode: string;
  roleTitle: string;
  slaHours: number | null;
  entered: number;
  avgHours: number;
  maxHours: number;
  openCount: number;
  openBreach: number;
  openMaxHours: number;
}

interface InstanceItem {
  id: string;
  entityType: string;
  entityLabel: string;
  currentState: string;
  processVersion: number;
  currentNodeTitle: string;
  nodeType: string;
  startedByName: string;
  startedAt: string;
  finishedAt: string | null;
  waitingHours: number | null;
  slaState: string;
  hoursLeft: number | null;
}

export function WorkflowReports() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const wf = React.useMemo(() => appApi("workflow"), []);
  const [loading, setLoading] = React.useState(true);
  const [overview, setOverview] = React.useState<Overview | null>(null);
  const [bottlenecks, setBottlenecks] = React.useState<BottleneckItem[]>([]);
  const [instances, setInstances] = React.useState<InstanceItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [entityFilter, setEntityFilter] = React.useState("all");
  const [error, setError] = React.useState(false);

  const load = React.useCallback(
    async (status: string, entity: string) => {
      setLoading(true);
      setError(false);
      try {
        const q = new URLSearchParams();
        if (status !== "all") q.set("status", status);
        if (entity !== "all") q.set("entityType", entity);
        q.set("limit", "60");
        const qs = q.toString();
        const [ov, bn, inst] = await Promise.all([
          wf.get<Overview>("workflow-reports/overview"),
          wf.get<{ items: BottleneckItem[] }>("workflow-reports/bottlenecks"),
          wf.get<{ total: number; items: InstanceItem[] }>(
            `workflow-reports/instances${qs ? `?${qs}` : ""}`,
          ),
        ]);
        setOverview(ov);
        setBottlenecks(bn?.items ?? []);
        setInstances(inst?.items ?? []);
        setTotal(inst?.total ?? 0);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [wf],
  );

  React.useEffect(() => {
    void load(statusFilter, entityFilter);
  }, [load, statusFilter, entityFilter]);

  const fmtNum = React.useCallback(
    (n: number, digits = 0): string => {
      try {
        return n.toLocaleString(locale === "fa" ? "fa-IR" : locale, {
          maximumFractionDigits: digits,
        });
      } catch {
        return String(n);
      }
    },
    [locale],
  );

  const fmtDate = React.useCallback(
    (iso: string | null): string => {
      if (!iso) return "—";
      try {
        return new Date(iso).toLocaleString(locale === "fa" ? "fa-IR" : locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return iso;
      }
    },
    [locale],
  );

  const stateChip = (state: string) => {
    const map: Record<string, string> = {
      running: "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
      approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      rejected: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      cancelled: "border-border/70 bg-muted/60 text-muted-foreground",
    };
    const key: Record<string, string> = {
      running: "wf.stateRunning",
      approved: "wf.stateApproved",
      rejected: "wf.stateRejected",
      cancelled: "wf.stateCancelled",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium",
          map[state] ?? map.cancelled,
        )}
      >
        {t((key[state] ?? "wf.stateCancelled") as never)}
      </span>
    );
  };

  const slaChip = (item: InstanceItem) => {
    if (item.slaState === "none" || item.currentState !== "running") {
      return (
        <span className="text-[10px] text-muted-foreground">
          {item.waitingHours != null ? `${fmtNum(item.waitingHours, 1)} ${t("wf.sla.hours")}` : "—"}
        </span>
      );
    }
    if (item.slaState === "breach") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-700 dark:text-rose-300">
          <Timer className="h-3 w-3" aria-hidden />
          {t("wf.sla.breached")} · {fmtNum(Math.abs(item.hoursLeft ?? 0), 1)} {t("wf.sla.hours")}
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
          item.slaState === "warning"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
        )}
      >
        <Clock3 className="h-3 w-3" aria-hidden />
        {t("wf.sla.left")} · {fmtNum(Math.max(item.hoursLeft ?? 0, 0), 1)} {t("wf.sla.hours")}
      </span>
    );
  };

  const entityChip = (entityType: string) => (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
      {entityType === "voucher" ? t("wf.entityVoucher") : entityType}
    </span>
  );

  const kpis = React.useMemo(() => {
    if (!overview) return [];
    const c = overview.counts;
    return [
      {
        id: "total",
        label: t("wf.rep.kpiTotal"),
        value: fmtNum(c.total),
        icon: <FileStack className="h-4 w-4" aria-hidden />,
        ring: "from-teal-500 to-teal-700",
      },
      {
        id: "running",
        label: t("wf.rep.kpiRunning"),
        value: fmtNum(c.running),
        icon: <Activity className="h-4 w-4" aria-hidden />,
        ring: "from-amber-500 to-orange-600",
      },
      {
        id: "approved",
        label: t("wf.rep.kpiApproved"),
        value: fmtNum(c.approved),
        icon: <CheckCircle2 className="h-4 w-4" aria-hidden />,
        ring: "from-emerald-500 to-teal-700",
      },
      {
        id: "rejected",
        label: t("wf.rep.kpiRejected"),
        value: fmtNum(c.rejected),
        icon: <XCircle className="h-4 w-4" aria-hidden />,
        ring: "from-rose-500 to-rose-700",
      },
      {
        id: "cancelled",
        label: t("wf.rep.kpiCancelled"),
        value: fmtNum(c.cancelled),
        icon: <Gavel className="h-4 w-4" aria-hidden />,
        ring: "from-zinc-500 to-zinc-700",
      },
      {
        id: "avg",
        label: t("wf.rep.kpiAvgCompletion"),
        value:
          overview.avgCompletionHours != null
            ? `${fmtNum(overview.avgCompletionHours, 1)} ${t("wf.sla.hours")}`
            : "—",
        icon: <Hourglass className="h-4 w-4" aria-hidden />,
        ring: "from-teal-600 to-emerald-700",
      },
      {
        id: "sla",
        label: t("wf.rep.kpiSlaBreached"),
        value: fmtNum(overview.slaBreachedNow),
        icon: <AlarmClockOff className="h-4 w-4" aria-hidden />,
        ring: "from-rose-600 to-red-700",
      },
      {
        id: "del",
        label: t("wf.rep.kpiDelegations"),
        value: fmtNum(overview.activeDelegations),
        icon: <Inbox className="h-4 w-4" aria-hidden />,
        ring: "from-cyan-600 to-teal-700",
      },
    ];
  }, [overview, t, fmtNum]);

  const maxAvg = React.useMemo(
    () => Math.max(0.1, ...bottlenecks.map((b) => b.avgHours)),
    [bottlenecks],
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-slim" dir="auto" data-testid="wf-reports">
      {/* سربرگ */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-md">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold">{t("wf.rep.title")}</h2>
            <p className="truncate text-xs text-muted-foreground">{t("wf.rep.subtitle")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            data-testid="wf-reports-refresh"
            onClick={() => void load(statusFilter, entityFilter)}
            disabled={loading}
            className="shrink-0 cursor-pointer gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="hidden sm:inline">{t("wf.rep.refresh")}</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 p-4">
        {error && (
          <div
            data-testid="wf-reports-error"
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"
          >
            {t("common.error")}
          </div>
        )}

        {/* کارت‌های KPI */}
        <section
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          data-testid="wf-reports-kpis"
        >
          {kpis.map((k) => (
            <div
              key={k.id}
              data-testid={`wf-reports-kpi-${k.id}`}
              className="rounded-xl border border-border/70 bg-card/60 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                    k.ring,
                  )}
                >
                  {k.icon}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">{k.label}</span>
              </div>
              <p className="mt-2 text-xl font-bold tabular-nums tracking-tight">{k.value}</p>
            </div>
          ))}
        </section>

        {/* تفکیک per فرم */}
        {overview && overview.perEntityType.length > 0 && (
          <section className="rounded-xl border border-border/70 bg-card/60 p-4">
            <h3 className="mb-3 text-xs font-semibold text-muted-foreground">
              {t("wf.rep.perEntity")}
            </h3>
            <div className="flex flex-wrap gap-2" data-testid="wf-reports-entities">
              {overview.perEntityType.map((e) => (
                <span
                  key={e.entityType}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-xs"
                >
                  {entityChip(e.entityType)}
                  <span className="font-semibold tabular-nums">{fmtNum(e.total)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({t("wf.stateRunning")}: {fmtNum(e.running)} · {t("wf.stateApproved")}:{" "}
                    {fmtNum(e.approved)})
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* نقاط گلوگاه */}
        <section className="rounded-xl border border-border/70 bg-card/60 p-4" data-testid="wf-reports-bottlenecks">
          <div className="mb-1 flex items-center gap-2">
            <Hourglass className="h-4 w-4 text-amber-600" aria-hidden />
            <h3 className="text-sm font-semibold">{t("wf.rep.bottleneckTitle")}</h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{t("wf.rep.bottleneckDesc")}</p>
          {bottlenecks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
              {t("wf.rep.bEmpty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {bottlenecks.map((b) => (
                <li
                  key={`${b.definitionCode}-${b.processVersion}-${b.nodeCode}`}
                  className="rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold">{b.nodeTitle}</span>
                    {b.roleTitle && (
                      <span className="inline-flex items-center rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-700 dark:text-teal-300">
                        {b.roleTitle}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {b.definitionCode} · v{fmtNum(b.processVersion)}
                    </span>
                    {b.openBreach > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-700 dark:text-rose-300">
                        <Timer className="h-3 w-3" aria-hidden />
                        {t("wf.rep.bBreach")}: {fmtNum(b.openBreach)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        b.openBreach > 0
                          ? "bg-gradient-to-l from-rose-500 to-rose-400"
                          : b.avgHours > maxAvg * 0.6
                            ? "bg-gradient-to-l from-amber-500 to-amber-400"
                            : "bg-gradient-to-l from-teal-500 to-emerald-400",
                      )}
                      style={{ width: `${Math.max(4, Math.round((b.avgHours / maxAvg) * 100))}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                    <span>
                      {t("wf.rep.bAvg")}:{" "}
                      <b className="tabular-nums text-foreground/90">
                        {fmtNum(b.avgHours, 1)} {t("wf.sla.hours")}
                      </b>
                    </span>
                    <span>
                      {t("wf.rep.bMax")}: {fmtNum(b.maxHours, 1)} {t("wf.sla.hours")}
                    </span>
                    <span>
                      {t("wf.rep.bEntered")}: {fmtNum(b.entered)}
                    </span>
                    {b.openCount > 0 && (
                      <span className="text-amber-700 dark:text-amber-300">
                        {t("wf.rep.bWaiting")}: {fmtNum(b.openCount)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* نمونه‌های اخیر */}
        <section className="rounded-xl border border-border/70 bg-card/60 p-4" data-testid="wf-reports-instances">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <FileStack className="h-4 w-4 text-teal-700 dark:text-teal-300" aria-hidden />
            <h3 className="text-sm font-semibold">
              {t("wf.rep.instancesTitle")}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({fmtNum(total)})
              </span>
            </h3>
            <div className="ms-auto flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger size="sm" className="h-8 w-36 text-xs" data-testid="wf-reports-status-filter" aria-label={t("wf.rep.filterStatus")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("wf.rep.fAll")}</SelectItem>
                  <SelectItem value="running">{t("wf.stateRunning")}</SelectItem>
                  <SelectItem value="approved">{t("wf.stateApproved")}</SelectItem>
                  <SelectItem value="rejected">{t("wf.stateRejected")}</SelectItem>
                  <SelectItem value="cancelled">{t("wf.stateCancelled")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger size="sm" className="h-8 w-40 text-xs" data-testid="wf-reports-entity-filter" aria-label={t("wf.rep.filterEntity")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("wf.rep.fAllForms")}</SelectItem>
                  {(overview?.perEntityType ?? []).map((e) => (
                    <SelectItem key={e.entityType} value={e.entityType}>
                      {e.entityType === "voucher" ? t("wf.entityVoucher") : e.entityType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {instances.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
              {t("wf.rep.empty")}
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-slim rounded-lg border border-border/60">
              <table className="w-full text-xs" data-testid="wf-reports-table">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="text-start text-[10px] text-muted-foreground">
                    <th className="p-2 text-start font-medium">{t("wf.rep.thLabel")}</th>
                    <th className="p-2 text-start font-medium">{t("wf.rep.thStatus")}</th>
                    <th className="p-2 text-start font-medium">{t("wf.rep.thStep")}</th>
                    <th className="p-2 text-start font-medium">{t("wf.rep.thStarter")}</th>
                    <th className="p-2 text-start font-medium">{t("wf.rep.thStarted")}</th>
                    <th className="p-2 text-start font-medium">{t("wf.rep.thSla")}</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((it) => (
                    <tr
                      key={it.id}
                      className="border-t border-border/50 transition-colors hover:bg-accent/40"
                    >
                      <td className="p-2">
                        <span className="font-medium">{it.entityLabel || it.id}</span>
                        <span className="ms-1.5">{entityChip(it.entityType)}</span>
                      </td>
                      <td className="p-2">{stateChip(it.currentState)}</td>
                      <td className="p-2">{it.currentNodeTitle || "—"}</td>
                      <td className="p-2 text-muted-foreground">{it.startedByName || "—"}</td>
                      <td className="p-2 text-muted-foreground">{fmtDate(it.startedAt)}</td>
                      <td className="p-2">{slaChip(it)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
