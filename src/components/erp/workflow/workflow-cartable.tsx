"use client";

import * as React from "react";
import {
  BadgeCheck,
  BellRing,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock3,
  History,
  Inbox,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { appApi, api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * WorkflowCartable — کارتابل گردش کار (t179 — فاز ۳ نقشهٔ راه).
 *
 * پنج صندوق per کاربر جاری:
 *  · «در انتظار اقدام من» — نمونه‌های running که گرهٔ جاری‌شان سمتِ من (مستقیم
 *    یا با تفویض معتبر) را می‌خواهد؛ با نشان SLA (موعدها/تأخیر) و اقدام درجا
 *    (تایید/رد با دلیل اجباری — موتور مستقل هم راستی‌آزمایی می‌کند).
 *  · «آغازشده‌های من» — نمونه‌هایی که من ارسال به رسیدگی کرده‌ام.
 *  · «ابلاغ‌ها» — WorkflowNotification من (ابلاغ گام/اطلاع/هشدار SLA) با
 *    خواندن تکی و دسته‌جمعی.
 *  · «اقدام‌های من» — تاریخچهٔ append-only اقدام‌های من (با نشان تفویضی).
 *  · «تفویض‌ها» — تفویض بازه‌دار (FR-09): صادره/وارد + ایجاد/لغو؛ تفویضِ
 *    تفویض ممنوع و فقط دارندهٔ مستقیم سمت می‌تواند تفویض کند.
 *
 * شرط آستانهٔ per فرم (D-2) در کارتابل بدون دانستن مبلغ هم کار می‌کند —
 * موتور مبلغ را از منبع حقیقت (سند) می‌خواند.
 */

/* ------------------------------ انواع ------------------------------ */

interface CartableTask {
  id: number;
  entityType: string;
  entityId: string;
  entityLabel: string;
  processName: string;
  currentNodeCode: string;
  currentNodeTitle: string;
  roleCode: string;
  roleTitle: string;
  enteredAt: string;
  slaHours: number | null;
  slaState: string;
  dueAt: string | null;
  hoursLeft: number | null;
  startedBy: string;
  startedByName: string;
  startedAt: string;
}

interface CartableStarted {
  id: number;
  entityType: string;
  entityId: string;
  entityLabel: string;
  processName: string;
  currentState: string;
  currentNodeTitle: string;
  startedAt: string;
  finishedAt: string | null;
  finalStatus: number | null;
}

interface CartableNotification {
  id: number;
  kind: string;
  title: string;
  body: string;
  recipientRoleCode: string;
  instanceId: number;
  entityLabel: string;
  entityType: string;
  entityId: string;
  instanceState: string;
  sentAt: string;
  readAt: string | null;
}

interface CartableAction {
  id: number;
  action: string;
  fromNodeTitle: string;
  toNodeTitle: string;
  roleCode: string;
  comment: string;
  viaDelegation: boolean;
  delegatorId: string;
  instanceId: number;
  entityLabel: string;
  entityType: string;
  entityId: string;
  instanceState: string;
  createdAt: string;
}

interface CartableDelegation {
  id: number;
  roleCode: string;
  roleTitle: string;
  delegatorUserId: string;
  delegatorName: string;
  delegateUserId: string;
  delegateName: string;
  validFrom: string;
  validTo: string | null;
  comment: string;
  isActive: boolean;
  currentlyValid: boolean;
}

interface CartableSummary {
  tasks: number;
  slaBreaches: number;
  unread: number;
  startedRunning: number;
  incomingDelegations: number;
}

interface WfLog {
  id: number;
  action: string;
  actorId: string;
  actorName: string;
  fromNodeTitle: string;
  toNodeTitle: string;
  comment: string;
  viaDelegation: boolean;
  delegatorId: string;
  createdAt: string;
}

export function WorkflowCartable() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? "";
  const displayName = user?.displayName ?? "";
  const wf = React.useMemo(() => appApi("workflow"), []);

  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<CartableSummary | null>(null);
  const [tasks, setTasks] = React.useState<CartableTask[]>([]);
  const [started, setStarted] = React.useState<CartableStarted[]>([]);
  const [notifications, setNotifications] = React.useState<CartableNotification[]>([]);
  const [actions, setActions] = React.useState<CartableAction[]>([]);
  const [delegations, setDelegations] = React.useState<CartableDelegation[]>([]);
  const [myRoleCodes, setMyRoleCodes] = React.useState<Array<{ code: string; title: string }>>([]);
  const [expanded, setExpanded] = React.useState<number | null>(null);
  const [expLogs, setExpLogs] = React.useState<WfLog[] | null>(null);
  const [expLoading, setExpLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  /* دیالوگ رد با دلیل اجباری */
  const [rejectTask, setRejectTask] = React.useState<CartableTask | null>(null);
  const [reason, setReason] = React.useState("");

  /* فرم تفویض */
  const [delRole, setDelRole] = React.useState("");
  const [delUser, setDelUser] = React.useState("");
  const [delFrom, setDelFrom] = React.useState("");
  const [delTo, setDelTo] = React.useState("");
  const [delComment, setDelComment] = React.useState("");
  const [userOptions, setUserOptions] = React.useState<Array<{ username: string; fullName: string }>>([]);

  const load = React.useCallback(async () => {
    const uid = username.trim();
    if (!uid) return;
    setLoading(true);
    try {
      const [sum, tk, st, nt, ac, dg, roles, myAssigns] = await Promise.all([
        wf.get<CartableSummary>(`workflow-cartable/summary?userId=${encodeURIComponent(uid)}`),
        wf.get<{ items: CartableTask[] }>(`workflow-cartable/tasks?userId=${encodeURIComponent(uid)}`),
        wf.get<{ items: CartableStarted[] }>(`workflow-cartable/started?userId=${encodeURIComponent(uid)}`),
        wf.get<{ items: CartableNotification[] }>(`workflow-cartable/notifications?userId=${encodeURIComponent(uid)}`),
        wf.get<{ items: CartableAction[] }>(`workflow-cartable/actions?userId=${encodeURIComponent(uid)}`),
        wf.get<{ items: CartableDelegation[] }>(`workflow-cartable/delegations?userId=${encodeURIComponent(uid)}&direction=all`),
        wf.get<{ items: Array<{ code: string; title: string }> }>("workflow-roles"),
        wf.get<{ items: Array<{ roleCode: string }> }>(`workflow-roles/assignments?userId=${encodeURIComponent(uid)}`),
      ]);
      setSummary(sum);
      setTasks(tk.items ?? []);
      setStarted(st.items ?? []);
      setNotifications(nt.items ?? []);
      setActions(ac.items ?? []);
      setDelegations(dg.items ?? []);
      /* سمت‌های من: تخصیص‌های کاربر + عنوان رسمی سمت از فهرست سمت‌ها */
      const titleOf = new Map((roles.items ?? []).map((r) => [r.code, r.title]));
      setMyRoleCodes(
        [...new Set((myAssigns.items ?? []).map((a) => a.roleCode))].map((code) => ({
          code,
          title: titleOf.get(code) ?? code,
        })),
      );
    } catch {
      /* کارتابل نباید با خطای گذرا بشکند — رفرش دستی موجود است */
    } finally {
      setLoading(false);
    }
  }, [username, wf]);

  React.useEffect(() => {
    let alive = true;
    const run = async () => {
      await Promise.resolve();
      if (alive) await load();
    };
    void run();
    const iv = setInterval(() => {
      if (alive) void load();
    }, 60_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [load]);

  /* فهرست کاربران برای گزینش نماینده (settings-service) */
  React.useEffect(() => {
    let alive = true;
    api
      .get<{ items: Array<{ username: string; fullName: string; isActive: boolean }> }>("user")
      .then((r) => {
        if (!alive) return;
        setUserOptions(
          (r.items ?? [])
            .filter((u) => u.isActive !== false)
            .map((u) => ({ username: u.username, fullName: u.fullName })),
        );
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  /* ------------------------------ اقدام‌ها ------------------------------ */

  const act = React.useCallback(
    async (task: CartableTask, action: string, comment?: string) => {
      if (busy) return;
      setBusy(true);
      try {
        await wf.post(`workflow-instances/${task.id}/act`, {
          action,
          actorId: username.trim() || "guest",
          actorName: displayName,
          comment,
        });
        toast.success(t("wf.actionSaved"));
        setExpanded(null);
        setExpLogs(null);
        await load();
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      } finally {
        setBusy(false);
      }
    },
    [busy, displayName, load, t, username, wf],
  );

  const confirmReject = React.useCallback(() => {
    if (!rejectTask) return;
    const text = reason.trim();
    if (!text) {
      toast.error(t("wf.reasonRequired"));
      return;
    }
    const task = rejectTask;
    setRejectTask(null);
    setReason("");
    void act(task, "رد", text);
  }, [act, reason, rejectTask, t]);

  const toggleExpand = React.useCallback(
    async (id: number) => {
      if (expanded === id) {
        setExpanded(null);
        setExpLogs(null);
        return;
      }
      setExpanded(id);
      setExpLogs(null);
      setExpLoading(true);
      try {
        const d = await wf.get<{ logs: WfLog[] }>(`workflow-instances/${id}`);
        setExpLogs(d.logs ?? []);
      } catch {
        setExpLogs([]);
      } finally {
        setExpLoading(false);
      }
    },
    [expanded, wf],
  );

  const markRead = React.useCallback(
    async (ids?: number[]) => {
      try {
        await wf.post("workflow-cartable/notifications/read", {
          userId: username.trim(),
          ...(ids ? { ids } : {}),
        });
        await load();
      } catch {
        toast.error(t("common.error"));
      }
    },
    [load, t, username, wf],
  );

  const createDelegation = React.useCallback(async () => {
    if (busy) return;
    if (!delRole || !delUser || !delFrom) {
      toast.error(t("wf.del.missingFields"));
      return;
    }
    if (delUser === username.trim()) {
      toast.error(t("wf.del.selfForbidden"));
      return;
    }
    setBusy(true);
    try {
      const delegate = userOptions.find((u) => u.username === delUser);
      await wf.post("workflow-cartable/delegations", {
        roleCode: delRole,
        delegatorUserId: username.trim(),
        delegatorName: displayName,
        delegateUserId: delUser,
        delegateName: delegate?.fullName ?? "",
        validFrom: new Date(`${delFrom}T00:00:00`).toISOString(),
        ...(delTo ? { validTo: new Date(`${delTo}T23:59:59`).toISOString() } : {}),
        comment: delComment.trim(),
        actor: username.trim(),
      });
      toast.success(t("wf.del.createdToast"));
      setDelRole("");
      setDelUser("");
      setDelFrom("");
      setDelTo("");
      setDelComment("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }, [busy, delComment, delFrom, delRole, delTo, delUser, displayName, load, t, userOptions, username, wf]);

  const revokeDelegation = React.useCallback(
    async (id: number) => {
      if (busy) return;
      setBusy(true);
      try {
        await wf.del(
          `workflow-cartable/delegations/${id}?userId=${encodeURIComponent(username.trim())}`,
        );
        toast.success(t("wf.del.revokedToast"));
        await load();
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      } finally {
        setBusy(false);
      }
    },
    [busy, load, t, username, wf],
  );

  /* ------------------------------ نمایش ------------------------------ */

  const fmt = React.useCallback(
    (iso: string | null) => {
      if (!iso) return "—";
      try {
        return new Date(iso).toLocaleString(locale === "fa" ? "fa-IR" : locale, {
          dateStyle: "short",
          timeStyle: "short",
        });
      } catch {
        return iso;
      }
    },
    [locale],
  );

  const stateLabel = (state: string): { text: string; cls: string; dot: string } => {
    switch (state) {
      case "running":
        return {
          text: t("wf.stateRunning"),
          cls: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
          dot: "bg-amber-500",
        };
      case "approved":
        return {
          text: t("wf.stateApproved"),
          cls: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          dot: "bg-emerald-500",
        };
      case "rejected":
        return {
          text: t("wf.stateRejected"),
          cls: "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
          dot: "bg-rose-500",
        };
      case "cancelled":
        return {
          text: t("wf.stateCancelled"),
          cls: "border-slate-400/50 bg-slate-400/10 text-slate-600 dark:text-slate-300",
          dot: "bg-slate-400",
        };
      case "undone":
        return {
          text: t("wf.stateUndone"),
          cls: "border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300",
          dot: "bg-teal-500",
        };
      default:
        return {
          text: state,
          cls: "border-border bg-muted/50 text-muted-foreground",
          dot: "bg-muted-foreground",
        };
    }
  };

  const actionDot = (action: string): string => {
    if (action.includes("واگرد")) return "bg-teal-500";
    if (action.includes("رد")) return "bg-rose-500";
    if (action.includes("ابطال")) return "bg-slate-400";
    if (action.includes("تایید")) return "bg-emerald-500";
    if (action.includes("ارسال")) return "bg-teal-500";
    return "bg-slate-300 dark:bg-slate-600";
  };

  const slaBadge = (task: CartableTask) => {
    if (task.slaState === "none" || task.hoursLeft == null) return null;
    const h = Math.abs(task.hoursLeft);
    const hours = `${fmtNum(h)} ${t("wf.sla.hours")}`;
    if (task.slaState === "breach") {
      return (
        <span
          data-testid="wf-sla-badge"
          className="inline-flex items-center gap-1 rounded-full border border-rose-500/50 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300"
        >
          <BellRing className="h-3 w-3" aria-hidden />
          {t("wf.sla.breached")} · {hours}
        </span>
      );
    }
    if (task.slaState === "warning") {
      return (
        <span
          data-testid="wf-sla-badge"
          className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300"
        >
          <Clock3 className="h-3 w-3" aria-hidden />
          {t("wf.sla.dueSoon")} · {hours}
        </span>
      );
    }
    return (
      <span
        data-testid="wf-sla-badge"
        className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 text-[11px] text-teal-700 dark:text-teal-300"
      >
        <Clock3 className="h-3 w-3" aria-hidden />
        {t("wf.sla.left")} · {hours}
      </span>
    );
  };

  const fmtNum = (n: number): string => {
    try {
      return n.toLocaleString(locale === "fa" ? "fa-IR" : locale, { maximumFractionDigits: 1 });
    } catch {
      return String(n);
    }
  };

  const entityChip = (entityType: string) => (
    <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
      {entityType === "voucher" ? t("wf.entityVoucher") : entityType}
    </span>
  );

  const outgoing = delegations.filter((d) => d.delegatorUserId === username.trim());
  const incoming = delegations.filter(
    (d) => d.delegateUserId === username.trim() && d.delegatorUserId !== username.trim(),
  );
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* هدر */}
      <div className="shrink-0 border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-md">
            <Inbox className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold">{t("wf.cartable.title")}</h2>
            <p className="text-xs text-muted-foreground">{t("wf.cartable.subtitle")}</p>
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => void load()}
              data-testid="cartable-refresh"
              aria-label={t("wf.cartable.refresh")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground cursor-pointer"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
            </button>
            <span
              data-testid="cartable-chip-tasks"
              className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300"
            >
              <Inbox className="h-3 w-3" aria-hidden />
              {t("wf.tab.tasks")}: {summary ? fmtNum(summary.tasks) : "—"}
            </span>
            {summary && summary.slaBreaches > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/50 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                <BellRing className="h-3 w-3" aria-hidden />
                {t("wf.sla.breaches")}: {fmtNum(summary.slaBreaches)}
              </span>
            )}
            <span
              data-testid="cartable-chip-unread"
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
            >
              <BellRing className="h-3 w-3" aria-hidden />
              {t("wf.cartable.unread")}: {summary ? fmtNum(summary.unread) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* صندوق‌ها */}
      <Tabs
        defaultValue="tasks"
        className="flex min-h-0 flex-1 flex-col gap-0"
        dir={locale === "fa" || locale === "ar" || locale === "ps" || locale === "ckb" ? "rtl" : "ltr"}
      >
        <div className="shrink-0 border-b border-border/60 px-3 pt-2">
          <TabsList className="h-9 bg-muted/60">
            <TabsTrigger value="tasks" className="gap-1.5 text-xs" data-testid="cartable-tab-tasks">
              <Inbox className="h-3.5 w-3.5" aria-hidden />
              {t("wf.tab.tasks")}
              {tasks.length > 0 && (
                <span className="rounded-full bg-teal-600 px-1.5 text-[10px] font-semibold text-white">
                  {fmtNum(tasks.length)}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="started" className="gap-1.5 text-xs" data-testid="cartable-tab-started">
              <Send className="h-3.5 w-3.5" aria-hidden />
              {t("wf.tab.started")}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs" data-testid="cartable-tab-notifications">
              <BellRing className="h-3.5 w-3.5" aria-hidden />
              {t("wf.tab.notifications")}
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-600 px-1.5 text-[10px] font-semibold text-white">
                  {fmtNum(unreadCount)}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1.5 text-xs" data-testid="cartable-tab-actions">
              <History className="h-3.5 w-3.5" aria-hidden />
              {t("wf.tab.actions")}
            </TabsTrigger>
            <TabsTrigger value="delegations" className="gap-1.5 text-xs" data-testid="cartable-tab-delegations">
              <UserCheck className="h-3.5 w-3.5" aria-hidden />
              {t("wf.tab.delegations")}
              {incoming.length > 0 && (
                <span className="rounded-full bg-cyan-700 px-1.5 text-[10px] font-semibold text-white">
                  {fmtNum(incoming.length)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ---------- در انتظار اقدام من ---------- */}
        <TabsContent value="tasks" className="mt-0 min-h-0 flex-1 overflow-y-auto scrollbar-slim p-3">
          {tasks.length === 0 ? (
            <EmptyState text={loading ? t("common.loading") : t("wf.cartable.noTasks")} loading={loading} />
          ) : (
            <ul className="mx-auto max-w-4xl space-y-2.5">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  data-testid="cartable-task"
                  className={cn(
                    "rounded-2xl border bg-card p-3 shadow-sm",
                    task.slaState === "breach" ? "border-rose-500/40" : "border-border/70",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {task.entityLabel || `${t("wf.entityVoucher")} #${task.entityId}`}
                    </span>
                    {entityChip(task.entityType)}
                    <span className="text-[11px] text-muted-foreground">
                      {task.processName}
                    </span>
                    <span className="ms-auto flex flex-wrap items-center gap-1.5">
                      {slaBadge(task)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 text-teal-700 dark:text-teal-300">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      {t("wf.currentStep")}: <span className="font-medium">{task.currentNodeTitle}</span>
                      <span className="opacity-70">({task.roleTitle})</span>
                    </span>
                    <span>
                      {t("wf.startedBy")}: <span className="text-foreground/80">{task.startedByName || task.startedBy}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" aria-hidden />
                      {fmt(task.enteredAt)}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      data-testid="cartable-approve"
                      disabled={busy}
                      onClick={() => void act(task, "تایید")}
                      className="h-7 gap-1 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                      {t("wf.approve")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      data-testid="cartable-reject"
                      disabled={busy}
                      onClick={() => {
                        setReason("");
                        setRejectTask(task);
                      }}
                      className="h-7 gap-1 border-rose-500/40 px-3 text-xs text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.reject")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      data-testid="cartable-expand"
                      onClick={() => void toggleExpand(task.id)}
                      aria-expanded={expanded === task.id}
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                    >
                      <History className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.timeline")}
                      {expanded === task.id ? (
                        <ChevronUp className="h-3 w-3" aria-hidden />
                      ) : (
                        <ChevronDown className="h-3 w-3" aria-hidden />
                      )}
                    </Button>
                  </div>
                  {expanded === task.id && (
                    <div className="mt-2 border-t border-border/60 pt-2">
                      {expLoading ? (
                        <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          {t("common.loading")}
                        </div>
                      ) : (
                        <TaskTimeline logs={expLogs ?? []} t={t} locale={locale} />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ---------- آغازشده‌های من ---------- */}
        <TabsContent value="started" className="mt-0 min-h-0 flex-1 overflow-y-auto scrollbar-slim p-3">
          {started.length === 0 ? (
            <EmptyState text={loading ? t("common.loading") : t("wf.cartable.noStarted")} loading={loading} />
          ) : (
            <ul className="mx-auto max-w-4xl space-y-2">
              {started.map((s) => {
                const tone = stateLabel(s.currentState);
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-sm"
                  >
                    <span className="text-sm font-semibold">{s.entityLabel || `#${s.entityId}`}</span>
                    {entityChip(s.entityType)}
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs", tone.cls)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
                      {tone.text}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.currentState === "running" ? (
                        <>
                          {t("wf.currentStep")}: <span className="text-foreground/80">{s.currentNodeTitle}</span>
                        </>
                      ) : (
                        <>
                          {t("wf.cartable.finishedAt")}: <span className="text-foreground/80">{fmt(s.finishedAt)}</span>
                        </>
                      )}
                    </span>
                    <span className="ms-auto text-[11px] text-muted-foreground">
                      {t("wf.cartable.startedAt")}: {fmt(s.startedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        {/* ---------- ابلاغ‌ها ---------- */}
        <TabsContent value="notifications" className="mt-0 min-h-0 flex-1 overflow-y-auto scrollbar-slim p-3">
          <div className="mx-auto mb-2 max-w-4xl flex justify-start">
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="cartable-read-all"
              disabled={unreadCount === 0}
              onClick={() => void markRead()}
              className="h-7 text-xs"
            >
              <BellRing className="h-3.5 w-3.5" aria-hidden />
              {t("wf.cartable.markAllRead")}
            </Button>
          </div>
          {notifications.length === 0 ? (
            <EmptyState text={loading ? t("common.loading") : t("wf.cartable.noNotifications")} loading={loading} />
          ) : (
            <ul className="mx-auto max-w-4xl space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  data-testid="cartable-notification"
                  className={cn(
                    "rounded-xl border bg-card p-3 shadow-sm",
                    n.readAt ? "border-border/60 opacity-80" : "border-amber-500/40 bg-amber-500/[0.04]",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        n.kind === "sla" ? "bg-rose-500" : n.kind === "info" ? "bg-slate-400" : "bg-teal-500",
                        n.readAt && "opacity-30",
                      )}
                    />
                    <span className="text-xs font-medium text-foreground">{n.title}</span>
                    {n.kind === "sla" && (
                      <span className="rounded-full border border-rose-500/50 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300">
                        SLA
                      </span>
                    )}
                    <span className="ms-auto text-[10px] text-muted-foreground">{fmt(n.sentAt)}</span>
                  </div>
                  {n.body && <p className="mt-1 ps-4 text-[11px] text-muted-foreground">{n.body}</p>}
                  {!n.readAt && (
                    <div className="mt-1.5 ps-4">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        data-testid="cartable-mark-read"
                        onClick={() => void markRead([n.id])}
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <BadgeCheck className="h-3 w-3" aria-hidden />
                        {t("wf.cartable.markRead")}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ---------- اقدام‌های من ---------- */}
        <TabsContent value="actions" className="mt-0 min-h-0 flex-1 overflow-y-auto scrollbar-slim p-3">
          {actions.length === 0 ? (
            <EmptyState text={loading ? t("common.loading") : t("wf.cartable.noActions")} loading={loading} />
          ) : (
            <ul className="mx-auto max-w-4xl space-y-2">
              {actions.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span aria-hidden className={cn("inline-block h-2 w-2 rounded-full", actionDot(a.action))} />
                    <span className="text-xs font-semibold text-foreground">{a.action}</span>
                    {a.viaDelegation && (
                      <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-700 dark:text-cyan-300">
                        {t("wf.del.delegatedBadge")}
                        {a.delegatorId ? ` · ${a.delegatorId}` : ""}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {a.entityLabel || `#${a.entityId}`}
                    </span>
                    <span className="ms-auto text-[10px] text-muted-foreground">{fmt(a.createdAt)}</span>
                  </div>
                  {(a.fromNodeTitle || a.toNodeTitle) && (
                    <div className="mt-0.5 ps-4 text-[11px] text-muted-foreground">
                      {a.fromNodeTitle || "—"} ← {a.toNodeTitle || "—"}
                    </div>
                  )}
                  {a.comment && (
                    <div className="mt-0.5 ps-4 text-[11px] italic text-muted-foreground">«{a.comment}»</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ---------- تفویض‌ها ---------- */}
        <TabsContent value="delegations" className="mt-0 min-h-0 flex-1 overflow-y-auto scrollbar-slim p-3">
          <div className="mx-auto max-w-4xl space-y-4">
            {/* ایجاد تفویض */}
            <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold">{t("wf.del.createTitle")}</h3>
              <p className="mb-3 text-[11px] text-muted-foreground">{t("wf.del.createDesc")}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("wf.del.role")}</Label>
                  <Select value={delRole} onValueChange={setDelRole}>
                    <SelectTrigger size="sm" className="w-full" data-testid="wf-del-role">
                      <SelectValue placeholder={t("wf.del.rolePh")} />
                    </SelectTrigger>
                    <SelectContent>
                      {myRoleCodes.length === 0 ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">{t("wf.del.noRoles")}</div>
                      ) : (
                        myRoleCodes.map((r) => (
                          <SelectItem key={r.code} value={r.code} className="text-xs">
                            {r.title} ({r.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("wf.del.delegate")}</Label>
                  <Select value={delUser} onValueChange={setDelUser}>
                    <SelectTrigger size="sm" className="w-full" data-testid="wf-del-user">
                      <SelectValue placeholder={t("wf.del.delegatePh")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto scrollbar-slim">
                      {userOptions.map((u) => (
                        <SelectItem key={u.username} value={u.username} className="text-xs">
                          {u.fullName} ({u.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="wf-del-from" className="text-xs">{t("wf.del.from")}</Label>
                    <Input
                      id="wf-del-from"
                      type="date"
                      value={delFrom}
                      onChange={(e) => setDelFrom(e.target.value)}
                      className="h-8 text-xs"
                      data-testid="wf-del-from"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wf-del-to" className="text-xs">{t("wf.del.to")}</Label>
                    <Input
                      id="wf-del-to"
                      type="date"
                      value={delTo}
                      onChange={(e) => setDelTo(e.target.value)}
                      className="h-8 text-xs"
                      data-testid="wf-del-to"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="wf-del-comment" className="text-xs">{t("wf.del.comment")}</Label>
                  <Input
                    id="wf-del-comment"
                    value={delComment}
                    onChange={(e) => setDelComment(e.target.value)}
                    placeholder={t("wf.del.commentPh")}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    data-testid="wf-del-create"
                    disabled={busy || myRoleCodes.length === 0}
                    onClick={() => void createDelegation()}
                    className="h-8 gap-1 bg-teal-600 px-3 text-xs text-white hover:bg-teal-700"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <UserCheck className="h-3.5 w-3.5" aria-hidden />}
                    {t("wf.del.create")}
                  </Button>
                </div>
              </div>
            </section>

            {/* صادره */}
            <section>
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{t("wf.del.outgoing")}</h3>
              {outgoing.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground">
                  {t("wf.del.noOutgoing")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {outgoing.map((d) => (
                    <li
                      key={d.id}
                      data-testid="wf-delegation-out"
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-sm"
                    >
                      <UserCheck className="h-4 w-4 text-teal-600" aria-hidden />
                      <span className="text-xs font-semibold">{d.roleTitle}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs">{d.delegateName || d.delegateUserId}</span>
                      <span className="text-[11px] text-muted-foreground" dir="auto">
                        {d.validFrom.slice(0, 10)} → {d.validTo ? d.validTo.slice(0, 10) : "∞"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          d.currentlyValid
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {d.currentlyValid ? t("wf.del.active") : t("wf.del.inactive")}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        data-testid="wf-del-revoke"
                        disabled={busy}
                        onClick={() => void revokeDelegation(d.id)}
                        className="ms-auto h-7 gap-1 px-2 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        {t("wf.del.revoke")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* وارد */}
            <section>
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{t("wf.del.incoming")}</h3>
              {incoming.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground">
                  {t("wf.del.noIncoming")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {incoming.map((d) => (
                    <li
                      key={d.id}
                      data-testid="wf-delegation-in"
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.04] p-3"
                    >
                      <UserCheck className="h-4 w-4 text-cyan-700 dark:text-cyan-300" aria-hidden />
                      <span className="text-xs font-semibold">{d.roleTitle}</span>
                      <span className="text-xs text-muted-foreground">←</span>
                      <span className="text-xs">{d.delegatorName || d.delegatorUserId}</span>
                      <span className="text-[11px] text-muted-foreground" dir="auto">
                        {d.validFrom.slice(0, 10)} → {d.validTo ? d.validTo.slice(0, 10) : "∞"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          d.currentlyValid
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {d.currentlyValid ? t("wf.del.active") : t("wf.del.inactive")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {/* دیالوگ رد با دلیل */}
      <Dialog open={rejectTask != null} onOpenChange={(o) => !o && setRejectTask(null)}>
        <DialogContent className="max-w-sm">
          <DialogTitle>{t("wf.reject")}</DialogTitle>
          <DialogDescription>{t("wf.rejectDialogDesc")}</DialogDescription>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("wf.reasonPh")}
            rows={3}
            aria-label={t("wf.reasonLabel")}
            className="text-xs"
            autoFocus
          />
          <div className="flex items-center justify-start gap-2">
            <Button
              type="button"
              size="sm"
              data-testid="cartable-reject-confirm"
              disabled={busy}
              onClick={confirmReject}
              className="h-8 gap-1 bg-rose-600 text-xs text-white hover:bg-rose-700"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              {t("wf.confirmReject")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setRejectTask(null)}
              className="h-8 text-xs"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ اجزای کوچک ------------------------------ */

function EmptyState({ text, loading }: { text: string; loading: boolean }) {
  return (
    <div className="flex h-full min-h-32 items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="cartable-empty">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {text}
      </div>
    </div>
  );
}

function TaskTimeline({
  logs,
  t,
  locale,
}: {
  logs: WfLog[];
  t: ReturnType<typeof useT>;
  locale: string;
}) {
  if (logs.length === 0) {
    return <p className="px-1 py-1 text-xs text-muted-foreground">{t("wf.cartable.noLogs")}</p>;
  }
  const dotTone = (action: string) => {
    if (action.includes("واگرد")) return "bg-teal-500";
    if (action.includes("رد")) return "bg-rose-500";
    if (action.includes("ابطال")) return "bg-slate-400";
    if (action.includes("تایید")) return "bg-emerald-500";
    if (action.includes("ارسال")) return "bg-teal-500";
    return "bg-slate-300 dark:bg-slate-600";
  };
  return (
    <ol className="relative space-y-3 ps-5 py-1">
      <span aria-hidden className="absolute inset-y-1 start-[7px] w-px bg-border" />
      {[...logs].reverse().map((l) => (
        <li key={l.id} className="relative text-xs">
          <span
            aria-hidden
            className={cn("absolute -start-5 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card", dotTone(l.action))}
          />
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-medium text-foreground">{l.action}</span>
            {l.actorName && <span className="text-muted-foreground">— {l.actorName}</span>}
            {l.viaDelegation && (
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-700 dark:text-cyan-300">
                {t("wf.del.delegatedBadge")}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/80" dir="auto">
              {(() => {
                try {
                  return new Date(l.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : locale, {
                    dateStyle: "short",
                    timeStyle: "short",
                  });
                } catch {
                  return l.createdAt;
                }
              })()}
            </span>
          </div>
          {(l.fromNodeTitle || l.toNodeTitle) && (
            <div className="text-[11px] text-muted-foreground/90">
              {l.fromNodeTitle || "—"} ← {l.toNodeTitle || "—"}
            </div>
          )}
          {l.comment && <div className="mt-0.5 text-[11px] italic text-muted-foreground">«{l.comment}»</div>}
        </li>
      ))}
    </ol>
  );
}
