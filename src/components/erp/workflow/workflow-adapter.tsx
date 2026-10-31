"use client";

import * as React from "react";
import {
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  History,
  Loader2,
  Send,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { appApi } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * WorkflowAdapter — آداپتور مشترک گردش کار (t178 — فاز ۲ نقشهٔ راه).
 *
 * هر فرم دارای فیلد وضعیت فقط entityType+entityID اعلام می‌کند (ارجاع سبک —
 * هیچ دادهٔ فرم کپی نمی‌شود) و این آداپتور بقیهٔ کار را می‌کند:
 *   · نوار وضعیت گردش کار (در جریان/تایید نهایی/رد/ابطال/واگرد)
 *   · دکمهٔ «ارسال به رسیدگی» وقتی فرم در گلوگاه ورود است (canStart — D-3)
 *   · اقدامات استاندارد گام جاری (تایید/رد/ابطال) برای دارندهٔ سمت — FR-06
 *   · واگرد تایید نهایی با دلیل اجباری (D-5 — سرور وابستگی‌ها را می‌سنجد)
 *   · خط زمانی تاریخچهٔ اقدام‌ها (append-only — FR-10)
 *
 * افزودن فرم جدید به گردش کار = یک ردیف نگاشت وضعیت (WorkflowStatusMap) +
 * رندر همین کامپوننت با entityType/entityId.
 */

/* ------------------------------ انواع ------------------------------ */

interface WfLog {
  id: number;
  action: string;
  actorId: string;
  actorName: string;
  fromNodeTitle: string;
  toNodeTitle: string;
  comment: string;
  createdAt: string;
}

interface WfDetail {
  id: number;
  entityType: string;
  entityId: string;
  entityLabel: string;
  currentState: string;
  startedBy: string;
  startedByName: string;
  startedAt: string;
  finishedAt: string | null;
  finalStatus: number | null;
  processVersion: number;
  definition: { id: number; code: string; name: string; thresholdAmount: number | null } | null;
  currentNode: {
    id: number;
    nodeCode: string;
    title: string;
    nodeType: string;
    roleCode: string;
  } | null;
  logs: WfLog[];
}

export interface WorkflowStateInfo {
  running: boolean;
  state: string | null;
  instanceId: number | null;
}

export interface WorkflowAdapterProps {
  entityType: string;
  entityId: number | null;
  entityLabel?: string;
  /** مبلغ سند برای ارزیابی شرط آستانهٔ per فرم (D-2) */
  amount?: number;
  /** گلوگاه ورود: فرم در وضعیت «تایید کاربر» است و سند ذخیره شده — دکمهٔ ارسال نمایش داده شود */
  canStart?: boolean;
  /** پیش از شروع چرخه (مثلاً ذخیرهٔ سندِ تغییرنکرده) — false یعنی صرف‌نظر */
  onBeforeStart?: () => Promise<boolean>;
  onStateChange?: (info: WorkflowStateInfo) => void;
  /** پس از هر اقدام موفق — میزبان وضعیت فرم خود را دوباره می‌خواند */
  onAfterAction?: () => void;
  className?: string;
}

type DialogKind = "reject" | "cancel" | "undo";

/* ------------------------------ کمکی ------------------------------ */

function stateTone(state: string | null): { cls: string; dot: string } {
  switch (state) {
    case "running":
      return { cls: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" };
    case "approved":
      return { cls: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" };
    case "rejected":
      return { cls: "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300", dot: "bg-rose-500" };
    case "cancelled":
      return { cls: "border-slate-400/50 bg-slate-400/10 text-slate-600 dark:text-slate-300", dot: "bg-slate-400" };
    case "undone":
      return { cls: "border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300", dot: "bg-teal-500" };
    default:
      return { cls: "border-border bg-muted/50 text-muted-foreground", dot: "bg-muted-foreground" };
  }
}

function logDotTone(action: string): string {
  if (action.includes("واگرد")) return "bg-teal-500";
  if (action.includes("رد")) return "bg-rose-500";
  if (action.includes("ابطال")) return "bg-slate-400";
  if (action.includes("تایید")) return "bg-emerald-500";
  if (action.includes("ارسال")) return "bg-teal-500";
  return "bg-slate-300 dark:bg-slate-600";
}

function formatWhen(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === "fa" ? "fa-IR" : locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/* ------------------------------ کامپوننت ------------------------------ */

export function WorkflowAdapter({
  entityType,
  entityId,
  entityLabel,
  amount,
  canStart = false,
  onBeforeStart,
  onStateChange,
  onAfterAction,
  className,
}: WorkflowAdapterProps) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? "";
  const displayName = user?.displayName ?? "";
  const wf = React.useMemo(() => appApi("workflow"), []);

  const [loading, setLoading] = React.useState(false);
  const [loadedOnce, setLoadedOnce] = React.useState(false);
  const [inst, setInst] = React.useState<WfDetail | null>(null);
  const [roleTitles, setRoleTitles] = React.useState<Record<string, string>>({});
  const [myRoles, setMyRoles] = React.useState<Set<string>>(() => new Set());
  const [busy, setBusy] = React.useState(false);
  const [showTimeline, setShowTimeline] = React.useState(false);
  const [dialog, setDialog] = React.useState<DialogKind | null>(null);
  const [reason, setReason] = React.useState("");

  /* کال‌بک‌های میزبان در ref — جلوگیری از حلقهٔ واکشی */
  const stateCb = React.useRef(onStateChange);
  stateCb.current = onStateChange;
  const afterCb = React.useRef(onAfterAction);
  afterCb.current = onAfterAction;

  const publish = React.useCallback((d: WfDetail | null) => {
    stateCb.current?.({
      running: d?.currentState === "running",
      state: d?.currentState ?? null,
      instanceId: d?.id ?? null,
    });
  }, []);

  const load = React.useCallback(async () => {
    if (entityId == null) {
      setInst(null);
      publish(null);
      return;
    }
    setLoading(true);
    try {
      const list = await wf.get<{ items: Array<{ id: number; currentState: string }> }>(
        `workflow-instances?entityType=${encodeURIComponent(entityType)}&entityId=${entityId}`,
      );
      const top = list.items?.[0];
      if (!top) {
        setInst(null);
        publish(null);
        return;
      }
      const d = await wf.get<WfDetail>(`workflow-instances/${top.id}`);
      setInst(d);
      publish(d);
    } catch {
      setInst(null);
      publish(null);
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, [entityType, entityId, publish, wf]);

  /* نگاشت کد سمت → عنوان (نمایش گام جاری) */
  React.useEffect(() => {
    let alive = true;
    wf
      .get<{ items: Array<{ code: string; title: string }> }>("workflow-roles")
      .then((r) => {
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const it of r.items ?? []) map[it.code] = it.title;
        setRoleTitles(map);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [wf]);

  /* سمت‌های فعال کاربر جاری (نمایش دکمه‌ها — موتور مستقل راستی‌آزمایی می‌کند) */
  React.useEffect(() => {
    let alive = true;
    const uid = username.trim();
    if (!uid) {
      setMyRoles(new Set());
      return;
    }
    wf
      .get<{ items: Array<{ roleCode: string }> }>(
        `workflow-roles/assignments?userId=${encodeURIComponent(uid)}`,
      )
      .then((r) => {
        if (!alive) return;
        setMyRoles(new Set((r.items ?? []).map((x) => x.roleCode)));
      })
      .catch(() => {
        if (alive) setMyRoles(new Set());
      });
    return () => {
      alive = false;
    };
  }, [username, wf]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /* ------------------------------ اقدام‌ها ------------------------------ */

  const start = React.useCallback(async () => {
    if (entityId == null || busy) return;
    if (onBeforeStart && !(await onBeforeStart())) return;
    setBusy(true);
    try {
      const d = await wf.post<WfDetail>("workflow-instances", {
        entityType,
        entityId: String(entityId),
        entityLabel,
        startedBy: username.trim() || "guest",
        startedByName: displayName,
        amount,
      });
      setInst(d);
      publish(d);
      setShowTimeline(true);
      toast.success(t("wf.startedToast"));
      afterCb.current?.();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }, [amount, busy, displayName, entityId, entityLabel, entityType, onBeforeStart, publish, t, username, wf]);

  const act = React.useCallback(
    async (action: string, comment?: string) => {
      if (!inst || busy) return;
      setBusy(true);
      try {
        const d = await wf.post<WfDetail>(`workflow-instances/${inst.id}/act`, {
          action,
          actorId: username.trim() || "guest",
          actorName: displayName,
          comment,
          amount,
        });
        setInst(d);
        publish(d);
        if (d.currentState !== "running") setShowTimeline(true);
        toast.success(t("wf.actionSaved"));
        afterCb.current?.();
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      } finally {
        setBusy(false);
      }
    },
    [amount, busy, displayName, inst, publish, t, username, wf],
  );

  const undoFinal = React.useCallback(
    async (comment: string) => {
      if (!inst || busy) return;
      setBusy(true);
      try {
        const d = await wf.post<WfDetail>(`workflow-instances/${inst.id}/undo-final`, {
          actorId: username.trim() || "guest",
          actorName: displayName,
          comment,
        });
        setInst(d);
        publish(d);
        setShowTimeline(true);
        toast.success(t("wf.undoneToast"));
        afterCb.current?.();
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      } finally {
        setBusy(false);
      }
    },
    [busy, displayName, inst, publish, t, username, wf],
  );

  const confirmDialog = React.useCallback(() => {
    const text = reason.trim();
    if (!text) {
      toast.error(t("wf.reasonRequired"));
      return;
    }
    const kind = dialog;
    setDialog(null);
    setReason("");
    if (kind === "undo") void undoFinal(text);
    else if (kind === "reject") void act("رد", text);
    else if (kind === "cancel") void act("ابطال", text);
  }, [act, dialog, reason, t, undoFinal]);

  /* ------------------------------ رندر ------------------------------ */

  if (entityId == null) return null;
  const state = inst?.currentState ?? null;
  const isRunning = state === "running";
  if (!inst && !canStart && (loading || !loadedOnce)) {
    return (
      <div
        data-testid="workflow-adapter"
        className={cn("flex items-center gap-2 px-1 py-1.5 text-xs text-muted-foreground", className)}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        <span>{t("common.loading")}</span>
      </div>
    );
  }
  if (!inst && !canStart) return null;

  const tone = stateTone(state);
  const currentRoleCode = inst?.currentNode?.roleCode ?? "";
  const canActCurrent = isRunning && currentRoleCode !== "" && myRoles.has(currentRoleCode);
  const canCancel = isRunning && username.trim() !== "" && inst?.startedBy === username.trim();
  const canUndo = state === "approved" && username.trim() !== "";

  const stateLabel = !state
    ? t("wf.notInFlow")
    : state === "running"
      ? t("wf.stateRunning")
      : state === "approved"
        ? t("wf.stateApproved")
        : state === "rejected"
          ? t("wf.stateRejected")
          : state === "cancelled"
            ? t("wf.stateCancelled")
            : t("wf.stateUndone");

  const dialogTitle =
    dialog === "reject" ? t("wf.reject") : dialog === "cancel" ? t("wf.cancelWf") : t("wf.undoFinal");
  const dialogDesc =
    dialog === "undo"
      ? t("wf.undoDialogDesc")
      : dialog === "cancel"
        ? t("wf.cancelDialogDesc")
        : t("wf.rejectDialogDesc");

  return (
    <div
      data-testid="workflow-adapter"
      className={cn("shrink-0 rounded-2xl border border-border/70 bg-card shadow-sm", className)}
    >
      {/* نوار وضعیت */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            tone.cls,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
          {stateLabel}
        </span>

        {inst && (
          <span className="text-xs text-muted-foreground">
            {t("wf.processLabel")}:{" "}
            <span className="text-foreground">{inst.definition?.name ?? inst.definition?.code}</span>
            {inst.startedByName ? (
              <>
                {" · "}
                {t("wf.startedBy")}: <span className="text-foreground">{inst.startedByName}</span>
              </>
            ) : null}
          </span>
        )}

        {isRunning && inst?.currentNode && (
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-700 dark:text-teal-300">
            {t("wf.currentStep")}: <span className="font-medium">{inst.currentNode.title}</span>
            {currentRoleCode && (
              <span className="opacity-70">({roleTitles[currentRoleCode] ?? currentRoleCode})</span>
            )}
          </span>
        )}

        <span className="ms-auto flex flex-wrap items-center gap-1.5">
          {/* اقدام‌های گام جاری — فقط دارندهٔ سمت (موتور هم راستی‌آزمایی می‌کند) */}
          {isRunning && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="wf-approve"
                disabled={!canActCurrent || busy}
                title={canActCurrent ? undefined : t("wf.notYourStep")}
                onClick={() => void act("تایید")}
                className="h-7 gap-1 border-emerald-500/40 px-2.5 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                )}
                {t("wf.approve")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="wf-reject"
                disabled={!canActCurrent || busy}
                title={canActCurrent ? undefined : t("wf.notYourStep")}
                onClick={() => {
                  setReason("");
                  setDialog("reject");
                }}
                className="h-7 gap-1 border-rose-500/40 px-2.5 text-xs text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                {t("wf.reject")}
              </Button>
              {canCancel && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid="wf-cancel"
                  disabled={busy}
                  onClick={() => {
                    setReason("");
                    setDialog("cancel");
                  }}
                  className="h-7 gap-1 px-2.5 text-xs"
                >
                  <Ban className="h-3.5 w-3.5" aria-hidden />
                  {t("wf.cancelWf")}
                </Button>
              )}
            </>
          )}

          {/* واگرد تایید نهایی (D-5) — سرور وابستگی‌ها را می‌سنجد */}
          {canUndo && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="wf-undo"
              disabled={busy}
              onClick={() => {
                setReason("");
                setDialog("undo");
              }}
              className="h-7 gap-1 border-teal-500/40 px-2.5 text-xs text-teal-700 hover:bg-teal-500/10 dark:text-teal-300"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              {t("wf.undoFinal")}
            </Button>
          )}

          {/* ارسال به رسیدگی — گلوگاه ورود (D-3) */}
          {canStart && (
            <Button
              type="button"
              size="sm"
              data-testid="wf-send"
              disabled={busy}
              onClick={() => void start()}
              className="h-7 gap-1 bg-teal-600 px-3 text-xs text-white hover:bg-teal-700"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-3.5 w-3.5" aria-hidden />
              )}
              {t("wf.sendToReview")}
            </Button>
          )}

          {inst && inst.logs.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="wf-timeline-toggle"
              onClick={() => setShowTimeline((v) => !v)}
              aria-expanded={showTimeline}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            >
              <History className="h-3.5 w-3.5" aria-hidden />
              {t("wf.timeline")}
              {showTimeline ? (
                <ChevronUp className="h-3 w-3" aria-hidden />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden />
              )}
            </Button>
          )}
        </span>
      </div>

      {/* خط زمانی تاریخچه (FR-10) */}
      {inst && showTimeline && inst.logs.length > 0 && (
        <div className="border-t border-border/60 px-4 py-3">
          <ol className="relative space-y-3 ps-5">
            <span aria-hidden className="absolute inset-y-1 start-[7px] w-px bg-border" />
            {[...inst.logs].reverse().map((l) => (
              <li key={l.id} className="relative text-xs">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -start-5 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                    logDotTone(l.action),
                  )}
                />
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-medium text-foreground">{l.action}</span>
                  {l.actorName && <span className="text-muted-foreground">— {l.actorName}</span>}
                  <span className="text-[10px] text-muted-foreground/80" dir="auto">
                    {formatWhen(l.createdAt, locale)}
                  </span>
                </div>
                {(l.fromNodeTitle || l.toNodeTitle) && (
                  <div className="text-[11px] text-muted-foreground/90">
                    {l.fromNodeTitle ? l.fromNodeTitle : "—"}
                    {" ← "}
                    {l.toNodeTitle ? l.toNodeTitle : "—"}
                  </div>
                )}
                {l.comment && (
                  <div className="mt-0.5 text-[11px] italic text-muted-foreground">«{l.comment}»</div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* دیالوگ دلیل اجباری (رد/ابطال/واگرد) */}
      <Dialog open={dialog != null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDesc}</DialogDescription>
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
              data-testid="wf-dialog-confirm"
              disabled={busy}
              onClick={confirmDialog}
              className={cn(
                "h-8 gap-1 text-xs text-white",
                dialog === "reject"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : dialog === "cancel"
                    ? "bg-slate-600 hover:bg-slate-700"
                    : "bg-teal-600 hover:bg-teal-700",
              )}
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              {dialog === "reject"
                ? t("wf.confirmReject")
                : dialog === "cancel"
                  ? t("wf.confirmCancel")
                  : t("wf.confirmUndo")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setDialog(null)}
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
