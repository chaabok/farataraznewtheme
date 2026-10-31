"use client";

import * as React from "react";
import {
  CircleStop,
  GitBranch,
  Link2,
  Loader2,
  PencilRuler,
  Plus,
  RefreshCw,
  Save,
  Scissors,
  Shapes,
  Split,
  Trash2,
  Unplug,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { appApi } from "@/lib/api";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * WorkflowDesignerForm — طراح بصری فرآیند گردش کار (t180 — فاز ۴ نقشهٔ راه).
 *
 * تصمیم مالک: «فرم‌هایی که قرار است در گردش کار شرکت داشته باشند باید توسط
 * کاربر انتخاب شود و دیاگرام چرخش آن فرم در ابتدا مشخص گردد» — این فرم سه
 * بخش دارد:
 *  ① «فرم‌های مشارکت‌کننده» — کاتالوگ فرم‌های دارای فیلد وضعیت با کلید
 *     مشارکت (فعلاً فقط سند حسابداری آداپتورِ متصل دارد — t178).
 *  ② «فرآیندها و دیاگرام چرخش» — نسخه‌های WorkflowDefinition با فعال‌سازی
 *     (FR-01: فقط یک نسخهٔ فعال per فرم)، نسخهٔ جدید (کپی کامل) و حذف.
 *  ③ بوم طراح — گره‌های شروع/اقدام/شرط/پایان با درگ، گذارها با کلیکِ اتصال،
 *     ویرایشگر سمت/SLA/وضعیت پایانی/شرط آستانه (D-2) و ذخیرهٔ معتبر
 *     (اعتبارسنجی موتور-سازگار — دیاگرام نامعتبر هرگز ذخیره نمی‌شود).
 * نسخهٔ «در استفاده» قطعی است (۴۰۹) — ویرایش فقط با «نسخهٔ جدید»؛ جابجایی
 * گره‌ها نمایشی است و همیشه آزاد.
 */

const wf = appApi("workflow");

/* ------------------------------ انواع ------------------------------ */

interface CatalogItem {
  id: number;
  entityType: string;
  formTitle: string;
  softwareName: string;
  description: string;
  hasStatusField: boolean;
  adapterReady: boolean;
  participates: boolean;
  runningInstances: number;
  activeDefinition: { id: number; code: string; name: string; processVersion: number } | null;
}

interface DefItem {
  id: number;
  code: string;
  name: string;
  description: string;
  entityType: string;
  processVersion: number;
  thresholdAmount: number | null;
  isActive: boolean;
  usedByInstances: boolean;
  instanceCount: number;
  nodeCount: number;
}

interface GNode {
  id?: number;
  nodeCode: string;
  nodeType: "start" | "action" | "condition" | "end";
  title: string;
  roleCode: string;
  slaHours: number | null;
  orderIndex: number;
  finalStatus: number | null;
  instanceState: string;
  posX: number;
  posY: number;
}

interface GTrans {
  id?: number;
  fromCode: string;
  toCode: string;
  action: string;
  conditionExpr: string;
  isDefault: boolean;
}

interface RoleItem {
  id: number;
  code: string;
  title: string;
  isActive: boolean;
}

interface DefDetail {
  id: number;
  code: string;
  name: string;
  description: string;
  entityType: string;
  processVersion: number;
  thresholdAmount: number | null;
  isActive: boolean;
  usedByInstances: boolean;
  instanceCount: number;
  nodes: Array<Omit<GNode, "nodeType"> & { nodeType: string }>;
  transitions: GTrans[];
}

/* ------------------------------ ثابت‌ها ------------------------------ */

const NODE_W = 224;
const NODE_H = 96;
const SNAP = 10;
const CONDITION_RE = /^amount\s*(>=|<=|==|!=|>|<)\s*(threshold|\d+(?:\.\d+)?)$/;
const ACTION_OPTIONS = ["ارسال به رسیدگی", "تایید", "رد", "بله", "خیر"];

const NODE_STYLE: Record<GNode["nodeType"], { chip: string; border: string; icon: React.ReactNode }> = {
  start: {
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    border: "border-s-emerald-600",
    icon: <PlayGlyph />,
  },
  action: {
    chip: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
    border: "border-s-cyan-600",
    icon: <Workflow className="h-3 w-3" aria-hidden />,
  },
  condition: {
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    border: "border-s-amber-500",
    icon: <Split className="h-3 w-3" aria-hidden />,
  },
  end: {
    chip: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
    border: "border-s-stone-500",
    icon: <CircleStop className="h-3 w-3" aria-hidden />,
  },
};

function PlayGlyph() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden>
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

/* ------------------------------ کامپوننت ------------------------------ */

export function WorkflowDesignerForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "settings")?.maximized ?? false,
  );

  /* داده‌های پایه */
  const [catalog, setCatalog] = React.useState<CatalogItem[]>([]);
  const [defs, setDefs] = React.useState<DefItem[]>([]);
  const [roles, setRoles] = React.useState<RoleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);
  const [delArm, setDelArm] = React.useState<number | null>(null);

  /* طراح */
  const [selId, setSelId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<DefDetail | null>(null);
  const [graphLoading, setGraphLoading] = React.useState(false);
  const [nodes, setNodes] = React.useState<GNode[]>([]);
  const [transitions, setTransitions] = React.useState<GTrans[]>([]);
  const [selNode, setSelNode] = React.useState<string | null>(null);
  const [selTrans, setSelTrans] = React.useState<number | null>(null);
  const [connectMode, setConnectMode] = React.useState(false);
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  /* دیالوگ فرآیند جدید */
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [cForm, setCForm] = React.useState({ entityType: "", code: "", name: "", threshold: "" });

  useTabDirty(dirty);

  const nodesRef = React.useRef<GNode[]>(nodes);
  nodesRef.current = nodes;
  const posRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  const editable = !!detail && !detail.usedByInstances;

  /* ------------------------------ واکشی ------------------------------ */

  const fetchCatalog = React.useCallback(async () => {
    const res = await wf.get<{ items: CatalogItem[] }>("workflow-catalog");
    return res.items ?? [];
  }, []);

  const fetchDefs = React.useCallback(async () => {
    const res = await wf.get<{ items: DefItem[] }>("workflow-definitions");
    return res.items ?? [];
  }, []);

  const fetchRoles = React.useCallback(async () => {
    try {
      const res = await wf.get<{ items: RoleItem[] }>("workflow-roles");
      return res.items ?? [];
    } catch {
      return [];
    }
  }, []);

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    const [cat, dd, rr] = await Promise.all([fetchCatalog(), fetchDefs(), fetchRoles()]);
    setCatalog(cat);
    setDefs(dd);
    setRoles(rr);
    setLoading(false);
  }, [fetchCatalog, fetchDefs, fetchRoles]);

  React.useEffect(() => {
    void refreshAll().catch(() => setLoading(false));
  }, [refreshAll]);

  const applyDetail = React.useCallback((d: DefDetail) => {
    const mapped: DefDetail = {
      ...d,
      nodes: d.nodes.map((n) => ({ ...n, nodeType: n.nodeType as GNode["nodeType"] })),
    };
    setDetail({
      id: mapped.id,
      code: mapped.code,
      name: mapped.name,
      description: mapped.description,
      entityType: mapped.entityType,
      processVersion: mapped.processVersion,
      thresholdAmount: mapped.thresholdAmount,
      isActive: mapped.isActive,
      usedByInstances: mapped.usedByInstances,
      instanceCount: mapped.instanceCount,
      nodes: [],
      transitions: [],
    });
    setNodes(
      mapped.nodes.map((n) => ({
        id: n.id,
        nodeCode: n.nodeCode,
        nodeType: n.nodeType as GNode["nodeType"],
        title: n.title,
        roleCode: n.roleCode,
        slaHours: n.slaHours,
        orderIndex: n.orderIndex,
        finalStatus: n.finalStatus,
        instanceState: n.instanceState,
        posX: n.posX,
        posY: n.posY,
      })),
    );
    setTransitions(
      mapped.transitions.map((tr) => ({
        id: tr.id,
        fromCode: tr.fromCode,
        toCode: tr.toCode,
        action: tr.action,
        conditionExpr: tr.conditionExpr,
        isDefault: tr.isDefault,
      })),
    );
  }, []);

  const openDef = React.useCallback(
    async (id: number) => {
      setSelId(id);
      setGraphLoading(true);
      setSelNode(null);
      setSelTrans(null);
      setConnectMode(false);
      setConnectFrom(null);
      setErrors([]);
      setDirty(false);
      posRef.current = {};
      try {
        const d = await wf.get<DefDetail>(`workflow-definitions/${id}`);
        applyDetail(d);
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
        setSelId(null);
        setDetail(null);
      } finally {
        setGraphLoading(false);
      }
    },
    [applyDetail, t],
  );

  /* ------------------------------ مشارکت فرم‌ها ------------------------------ */

  const toggleParticipation = async (item: CatalogItem, value: boolean) => {
    setToggling(item.entityType);
    try {
      await wf.put(`workflow-catalog/${encodeURIComponent(item.entityType)}`, { participates: value });
      toast.success(value ? t("wf.des.enrolledToast") : t("wf.des.unenrolledToast"));
      const [cat, dd] = await Promise.all([fetchCatalog(), fetchDefs()]);
      setCatalog(cat);
      setDefs(dd);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setToggling(null);
    }
  };

  /* ------------------------------ درگ گره‌ها ------------------------------ */

  const beginDrag = (e: React.PointerEvent, node: GNode) => {
    if (e.button !== 0) return;
    const inner = innerRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const offX = e.clientX - rect.left - node.posX;
    const offY = e.clientY - rect.top - node.posY;
    let moved = false;
    const onMove = (ev: PointerEvent) => {
      moved = true;
      const r2 = inner.getBoundingClientRect();
      const nx = Math.max(0, Math.min(2600, Math.round((ev.clientX - r2.left - offX) / SNAP) * SNAP));
      const ny = Math.max(0, Math.min(1800, Math.round((ev.clientY - r2.top - offY) / SNAP) * SNAP));
      posRef.current[node.nodeCode] = { x: nx, y: ny };
      setNodes((prev) =>
        prev.map((n) => (n.nodeCode === node.nodeCode ? { ...n, posX: nx, posY: ny } : n)),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (moved) void persistLayout();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    e.preventDefault();
  };

  /** ذخیرهٔ ساکتِ مختصات — حتی برای نسخهٔ در استفاده (صرفاً نمایشی). */
  const persistLayout = async () => {
    if (!selId) return;
    const positions = nodesRef.current
      .filter((n) => typeof n.id === "number")
      .map((n) => ({
        nodeId: n.id as number,
        posX: posRef.current[n.nodeCode]?.x ?? n.posX,
        posY: posRef.current[n.nodeCode]?.y ?? n.posY,
      }));
    if (!positions.length) return;
    try {
      await wf.put(`workflow-definitions/${selId}/layout`, { positions });
    } catch {
      /* جابجایی نمایشی است — خطا ساکت نادیده گرفته می‌شود */
    }
  };

  /* ------------------------------ گره‌ها و گذارها ------------------------------ */

  const addNode = (type: "action" | "condition" | "end") => {
    if (!editable) return;
    const maxN = nodes.reduce((m, x) => {
      const mt = /^N(\d+)$/.exec(x.nodeCode);
      return mt ? Math.max(m, Number(mt[1])) : m;
    }, 0);
    const code = `N${maxN + 1}`;
    const maxY = nodes.reduce((m, x) => Math.max(m, x.posY), 0);
    const maxX = nodes.reduce((m, x) => Math.max(m, x.posX), 0);
    const node: GNode = {
      nodeCode: code,
      nodeType: type,
      title:
        type === "action"
          ? t("wf.des.newActionTitle")
          : type === "condition"
            ? t("wf.des.newConditionTitle")
            : t("wf.des.newEndTitle"),
      roleCode: type === "action" ? (roles.find((r) => r.isActive)?.code ?? "") : "",
      slaHours: type === "action" ? 24 : null,
      orderIndex: nodes.length + 1,
      finalStatus: type === "end" ? 3 : null,
      instanceState: type === "end" ? "approved" : "",
      posX: Math.min(1400, maxX + SNAP * 3),
      posY: Math.min(1600, maxY + 120),
    };
    setNodes((prev) => [...prev, node]);
    setSelNode(code);
    setSelTrans(null);
    setDirty(true);
  };

  const updateNode = (code: string, patch: Partial<GNode>) => {
    if (!editable) return;
    setNodes((prev) => prev.map((n) => (n.nodeCode === code ? { ...n, ...patch } : n)));
    setDirty(true);
  };

  const delNode = (code: string) => {
    if (!editable) return;
    const n = nodes.find((x) => x.nodeCode === code);
    if (!n || n.nodeType === "start") {
      toast.error(t("wf.des.errStartDelete"));
      return;
    }
    setNodes((prev) => prev.filter((x) => x.nodeCode !== code));
    setTransitions((prev) => prev.filter((tr) => tr.fromCode !== code && tr.toCode !== code));
    if (selNode === code) setSelNode(null);
    setDirty(true);
  };

  const onNodeClick = (code: string) => {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(code);
        return;
      }
      if (connectFrom === code) {
        toast.info(t("wf.des.connectSelf"));
        return;
      }
      const from = nodes.find((n) => n.nodeCode === connectFrom);
      if (!from) {
        setConnectFrom(null);
        return;
      }
      const action =
        from.nodeType === "start" ? "ارسال به رسیدگی" : from.nodeType === "condition" ? "بله" : "تایید";
      if (transitions.some((tr) => tr.fromCode === connectFrom && tr.toCode === code && tr.action === action)) {
        toast.error(t("wf.des.dupTransition"));
        return;
      }
      const nt: GTrans = {
        fromCode: connectFrom,
        toCode: code,
        action,
        conditionExpr: from.nodeType === "condition" ? "amount > threshold" : "",
        isDefault: false,
      };
      setTransitions((prev) => {
        const next = [...prev, nt];
        setSelTrans(next.length - 1);
        return next;
      });
      setSelNode(null);
      setConnectFrom(null);
      setConnectMode(false);
      setDirty(true);
      return;
    }
    setSelNode(code);
    setSelTrans(null);
  };

  const updateTrans = (idx: number, patch: Partial<GTrans>) => {
    if (!editable) return;
    setTransitions((prev) => {
      const next = prev.map((tr, i) => (i === idx ? { ...tr, ...patch } : tr));
      /* شاخهٔ پیش‌فرضِ یکتا per گرهٔ شرط */
      if (patch.isDefault === true && next[idx]) {
        const from = next[idx].fromCode;
        return next.map((tr, i) =>
          i !== idx && tr.fromCode === from ? { ...tr, isDefault: false } : tr,
        );
      }
      return next;
    });
    setDirty(true);
  };

  const delTrans = (idx: number) => {
    if (!editable) return;
    setTransitions((prev) => prev.filter((_, i) => i !== idx));
    setSelTrans(null);
    setDirty(true);
  };

  /* ------------------------------ اعتبارسنجی سمت کلاینت ------------------------------ */

  const clientValidate = (): string[] => {
    const errs: string[] = [];
    const starts = nodes.filter((n) => n.nodeType === "start");
    const ends = nodes.filter((n) => n.nodeType === "end");
    if (nodes.some((n) => !n.title.trim())) errs.push(t("wf.des.errTitles"));
    if (starts.length !== 1) errs.push(t("wf.des.errOneStart"));
    if (ends.length < 1) errs.push(t("wf.des.errNeedEnd"));
    const byCode = new Map(nodes.map((n) => [n.nodeCode, n]));
    for (const tr of transitions) {
      if (!byCode.has(tr.fromCode) || !byCode.has(tr.toCode)) errs.push(t("wf.des.errDangling"));
      if (tr.fromCode === tr.toCode) errs.push(t("wf.des.errSelfLoop"));
      if (!ACTION_OPTIONS.includes(tr.action)) errs.push(t("wf.des.errAction"));
    }
    if (starts.length === 1) {
      const outs = transitions.filter((tr) => tr.fromCode === starts[0].nodeCode);
      if (outs.length !== 1 || outs[0].action !== "ارسال به رسیدگی")
        errs.push(t("wf.des.errStartOut"));
    }
    for (const n of nodes.filter((x) => x.nodeType === "action")) {
      const outs = transitions.filter((tr) => tr.fromCode === n.nodeCode);
      if (!n.roleCode) errs.push(t("wf.des.errRoleRequired"));
      if (!outs.some((tr) => tr.action === "تایید")) errs.push(`${t("wf.des.errNoApprove")} — ${n.title}`);
      for (const tr of outs.filter((x) => x.action === "رد")) {
        const target = byCode.get(tr.toCode);
        if (!target || target.nodeType !== "end" || target.instanceState !== "rejected")
          errs.push(`${t("wf.des.errRejectTarget")} — ${n.title}`);
      }
    }
    for (const n of nodes.filter((x) => x.nodeType === "condition")) {
      const outs = transitions.filter((tr) => tr.fromCode === n.nodeCode);
      if (outs.length < 2) errs.push(`${t("wf.des.errCondBranches")} — ${n.title}`);
      if (outs.filter((tr) => tr.isDefault).length !== 1)
        errs.push(`${t("wf.des.errCondDefault")} — ${n.title}`);
      for (const tr of outs.filter((x) => !x.isDefault)) {
        if (!CONDITION_RE.test(tr.conditionExpr.trim()))
          errs.push(`${t("wf.des.errCondExpr")} — ${n.title}`);
      }
    }
    for (const n of ends) {
      if (n.finalStatus === null) errs.push(`${t("wf.des.errEndStatus")} — ${n.title}`);
      if (n.instanceState !== "approved" && n.instanceState !== "rejected")
        errs.push(`${t("wf.des.errEndState")} — ${n.title}`);
      if (
        n.instanceState === "rejected" &&
        n.finalStatus !== null &&
        Number(n.finalStatus) !== 1
      )
        errs.push(`${t("wf.des.errRejectStatus")} — ${n.title}`);
      if (transitions.some((tr) => tr.fromCode === n.nodeCode))
        errs.push(`${t("wf.des.errEndOut")} — ${n.title}`);
    }
    /* دسترس‌پذیری از شروع */
    if (starts.length === 1) {
      const adj = new Map<string, string[]>();
      for (const tr of transitions) {
        if (!adj.has(tr.fromCode)) adj.set(tr.fromCode, []);
        adj.get(tr.fromCode)!.push(tr.toCode);
      }
      const seen = new Set([starts[0].nodeCode]);
      const q = [starts[0].nodeCode];
      while (q.length) {
        const cur = q.shift()!;
        for (const nxt of adj.get(cur) ?? [])
          if (!seen.has(nxt)) {
            seen.add(nxt);
            q.push(nxt);
          }
      }
      for (const n of nodes)
        if (!seen.has(n.nodeCode)) errs.push(`${t("wf.des.errUnreachable")} — ${n.title}`);
    }
    const seenKeys = new Set<string>();
    for (const tr of transitions) {
      const key = `${tr.fromCode}|${tr.toCode}|${tr.action}`;
      if (seenKeys.has(key)) errs.push(t("wf.des.errDupTrans"));
      seenKeys.add(key);
    }
    return errs;
  };

  /* ------------------------------ ذخیره و نسخه‌ها ------------------------------ */

  const doSave = async (): Promise<boolean> => {
    if (!selId || !detail) return false;
    if (!editable) {
      toast.error(t("wf.des.readonlyToast"));
      return false;
    }
    const errs = clientValidate();
    setErrors(errs);
    if (errs.length > 0) {
      toast.error(t("wf.des.invalidToast"));
      return false;
    }
    setSaving(true);
    try {
      const res = await wf.put<DefDetail>(`workflow-definitions/${selId}/graph`, {
        nodes: nodes.map((n, i) => ({
          nodeCode: n.nodeCode,
          nodeType: n.nodeType,
          title: n.title.trim(),
          roleCode: n.roleCode,
          slaHours: n.slaHours,
          orderIndex: n.orderIndex ?? i + 1,
          finalStatus: n.finalStatus,
          instanceState: n.instanceState,
          posX: n.posX,
          posY: n.posY,
        })),
        transitions: transitions.map((tr) => ({
          fromCode: tr.fromCode,
          toCode: tr.toCode,
          action: tr.action,
          conditionExpr: tr.conditionExpr.trim(),
          isDefault: tr.isDefault,
        })),
      });
      applyDetail(res);
      setDirty(false);
      posRef.current = {};
      toast.success(t("wf.des.savedToast"));
      void fetchDefs().then(setDefs).catch(() => undefined);
      return true;
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      setErrors([msg]);
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const doNewVersion = async (d: DefItem) => {
    setBusyId(d.id);
    try {
      const res = await wf.post<DefDetail>(`workflow-definitions/${d.id}/versions`, {});
      toast.success(`${t("wf.des.versionCreatedToast")} — v${res.processVersion}`);
      const dd = await fetchDefs().catch(() => [] as DefItem[]);
      setDefs(dd);
      await openDef(res.id);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  const doActivate = async (d: DefItem) => {
    setBusyId(d.id);
    try {
      await wf.post<DefDetail>(`workflow-definitions/${d.id}/activate`, {});
      toast.success(t("wf.des.activatedToast"));
      const [dd] = await Promise.all([fetchDefs().catch(() => [] as DefItem[])]);
      setDefs(dd);
      if (selId === d.id) await openDef(d.id);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  const doDeleteDef = async (d: DefItem) => {
    setBusyId(d.id);
    try {
      await wf.del(`workflow-definitions/${d.id}`);
      toast.success(t("wf.des.deletedToast"));
      setDelArm(null);
      const dd = await fetchDefs().catch(() => [] as DefItem[]);
      setDefs(dd);
      if (selId === d.id) {
        setSelId(null);
        setDetail(null);
        setNodes([]);
        setTransitions([]);
      }
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
      setDelArm(null);
    } finally {
      setBusyId(null);
    }
  };

  const doCreate = async () => {
    if (!cForm.entityType) {
      toast.error(t("wf.des.errFormRequired"));
      return;
    }
    if (!cForm.code.trim()) {
      toast.error(t("wf.des.errCodeRequired"));
      return;
    }
    if (!cForm.name.trim()) {
      toast.error(t("wf.des.errNameRequired"));
      return;
    }
    setCreating(true);
    try {
      const res = await wf.post<DefDetail>("workflow-definitions", {
        code: cForm.code.trim().toUpperCase(),
        name: cForm.name.trim(),
        entityType: cForm.entityType,
        description: "",
        thresholdAmount: cForm.threshold.trim() ? Number(cForm.threshold) : undefined,
      });
      toast.success(`${t("wf.des.createdToast")} — ${res.code} v${res.processVersion}`);
      setCreateOpen(false);
      const dd = await fetchDefs().catch(() => [] as DefItem[]);
      setDefs(dd);
      await openDef(res.id);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t("common.error"));
    } finally {
      setCreating(false);
    }
  };

  /* ------------------------------ هندسهٔ بوم ------------------------------ */

  const edgeGeom = (a: GNode, b: GNode) => {
    if (b.posY > a.posY + 24) {
      const x1 = a.posX + NODE_W / 2;
      const y1 = a.posY + NODE_H;
      const x2 = b.posX + NODE_W / 2;
      const y2 = b.posY;
      return {
        d: `M ${x1} ${y1} C ${x1} ${y1 + 48}, ${x2} ${y2 - 48}, ${x2} ${y2}`,
        mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
      };
    }
    if (b.posX >= a.posX) {
      const x1 = a.posX + NODE_W;
      const y1 = a.posY + NODE_H / 2;
      const x2 = b.posX;
      const y2 = b.posY + NODE_H / 2;
      return {
        d: `M ${x1} ${y1} C ${x1 + 48} ${y1}, ${x2 - 48} ${y2}, ${x2} ${y2}`,
        mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
      };
    }
    const x1 = a.posX;
    const y1 = a.posY + NODE_H / 2;
    const x2 = b.posX + NODE_W;
    const y2 = b.posY + NODE_H / 2;
    return {
      d: `M ${x1} ${y1} C ${x1 - 48} ${y1}, ${x2 + 48} ${y2}, ${x2} ${y2}`,
      mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
    };
  };

  const canvasW = Math.max(1000, nodes.reduce((m, n) => Math.max(m, n.posX + NODE_W), 0) + 120);
  const canvasH = Math.max(560, nodes.reduce((m, n) => Math.max(m, n.posY + NODE_H), 0) + 100);

  const nodeByCode = React.useMemo(() => new Map(nodes.map((n) => [n.nodeCode, n])), [nodes]);
  const selNodeObj = selNode ? nodeByCode.get(selNode) ?? null : null;

  /* ------------------------------ رندر ------------------------------ */

  return (
    <div className="flex h-full min-h-0 flex-col" dir="rtl">
      {/* هدر فرم — هم‌الگوی سایر فرم‌های تنظیمات */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-teal-700 text-white shadow-sm">
          <PencilRuler className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold">{t("wf.des.title")}</h2>
          <p className="truncate text-[11px] text-muted-foreground">{t("wf.des.subtitle")}</p>
        </div>
        {dirty && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {t("wf.des.dirtyHint")}
          </span>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void refreshAll()} aria-label={t("wf.cartable.refresh")}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim">
        {/* بخش ۱ — فرم‌های مشارکت‌کننده */}
        <section className="border-b border-border/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shapes className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
            <h3 className="text-sm font-semibold">{t("wf.des.sectionForms")}</h3>
            <span className="text-[11px] text-muted-foreground">{t("wf.des.sectionFormsHint")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.map((item) => (
              <div
                key={item.entityType}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
                  item.participates ? "border-teal-500/50 bg-teal-500/5" : "border-border/70 bg-card/60",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold">{item.formTitle}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {item.softwareName}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  {item.adapterReady ? (
                    <Switch
                      checked={item.participates}
                      disabled={toggling === item.entityType}
                      onCheckedChange={(v) => void toggleParticipation(item, v)}
                      aria-label={t("wf.des.formParticipates")}
                    />
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                      <Unplug className="h-3 w-3" aria-hidden />
                      {t("wf.des.adapterNotReady")}
                    </span>
                  )}
                </div>
                {item.participates && (
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2">
                    {item.activeDefinition ? (
                      <span className="flex items-center gap-1 rounded-full bg-teal-600/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                        <Workflow className="h-3 w-3" aria-hidden />
                        {t("wf.des.activeDef")}: {item.activeDefinition.code} v{item.activeDefinition.processVersion}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-600/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                        {t("wf.des.noActiveDef")}
                      </span>
                    )}
                    {item.runningInstances > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {t("wf.des.runningCount")}: {item.runningInstances}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!loading && catalog.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("wf.des.noCatalog")}</p>
            )}
          </div>
        </section>

        {/* بخش ۲ — فرآیندها و دیاگرام چرخش */}
        <section className="border-b border-border/60 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <GitBranch className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
            <h3 className="text-sm font-semibold">{t("wf.des.sectionDefs")}</h3>
            <div className="ms-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {t("wf.des.newDef")}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {defs.map((d) => (
              <div
                key={d.id}
                className={cn(
                  "flex flex-wrap items-center gap-2 rounded-xl border p-3 transition-colors",
                  selId === d.id ? "border-teal-500/60 bg-teal-500/5" : "border-border/70 bg-card/60",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                      {d.code}
                    </span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]" dir="ltr">
                      v{d.processVersion}
                    </span>
                    <span className="truncate text-sm font-semibold">{d.name}</span>
                    {d.isActive && (
                      <span className="rounded-full bg-teal-600/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                        {t("wf.des.activeBadge")}
                      </span>
                    )}
                    {d.usedByInstances && (
                      <span className="rounded-full bg-stone-600/10 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                        {t("wf.des.usedBadge")}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t("wf.des.defMeta")
                      .replace("{n}", String(d.nodeCount))
                      .replace("{c}", String(d.instanceCount))}
                    {d.thresholdAmount != null
                      ? ` · ${t("wf.des.thresholdShort")}: ${d.thresholdAmount.toLocaleString("fa-IR")}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={selId === d.id ? "secondary" : "outline"}
                    className="h-8"
                    onClick={() => void openDef(d.id)}
                    disabled={busyId === d.id || graphLoading}
                  >
                    <PencilRuler className="h-3.5 w-3.5" aria-hidden />
                    {t("wf.des.design")}
                  </Button>
                  {!d.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => void doActivate(d)}
                      disabled={busyId === d.id}
                    >
                      {busyId === d.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <BadgeOk />
                      )}
                      {t("wf.des.activate")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => void doNewVersion(d)}
                    disabled={busyId === d.id}
                  >
                    {t("wf.des.newVersion")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={() => (delArm === d.id ? void doDeleteDef(d) : setDelArm(d.id))}
                    disabled={busyId === d.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    {delArm === d.id ? t("wf.des.delConfirm") : ""}
                  </Button>
                </div>
              </div>
            ))}
            {!loading && defs.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("wf.des.noDefs")}</p>
            )}
          </div>
        </section>

        {/* بخش ۳ — بوم طراح */}
        {selId && (
          <section className="p-4">
            {graphLoading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="me-2 h-5 w-5 animate-spin" aria-hidden />
                {t("common.loading")}
              </div>
            ) : detail ? (
              <div className="flex flex-col gap-3">
                {/* نوار بالای بوم */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/60 p-2.5">
                  <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                    {detail.code} v{detail.processVersion}
                  </span>
                  <span className="truncate text-sm font-semibold">{detail.name}</span>
                  {detail.isActive ? (
                    <span className="rounded-full bg-teal-600/10 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                      {t("wf.des.activeBadge")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-600/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                      {t("wf.des.inactiveBadge")}
                    </span>
                  )}
                  <div className="ms-auto flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={connectMode ? "secondary" : "outline"}
                      className={cn("h-8", connectMode && "ring-2 ring-teal-500/60")}
                      disabled={!editable}
                      onClick={() => {
                        setConnectMode((v) => !v);
                        setConnectFrom(null);
                      }}
                    >
                      <Link2 className="h-3.5 w-3.5" aria-hidden />
                      {connectMode ? t("wf.des.connecting") : t("wf.des.connect")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!editable}
                      onClick={() => addNode("action")}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.des.addNodeAction")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!editable}
                      onClick={() => addNode("condition")}
                    >
                      <Split className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.des.addNodeCondition")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={!editable}
                      onClick={() => addNode("end")}
                    >
                      <CircleStop className="h-3.5 w-3.5" aria-hidden />
                      {t("wf.des.addNodeEnd")}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 bg-teal-600 text-white hover:bg-teal-700"
                      disabled={!editable || saving || !dirty}
                      onClick={() => void doSave()}
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Save className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {t("wf.des.save")}
                    </Button>
                  </div>
                </div>

                {detail.usedByInstances && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {t("wf.des.usedBanner")}
                  </div>
                )}
                {connectMode && (
                  <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-2.5 text-xs text-teal-800 dark:text-teal-300">
                    {connectFrom
                      ? `${t("wf.des.connectTargetPick")}: ${nodeByCode.get(connectFrom)?.title ?? connectFrom}`
                      : t("wf.des.connectSourcePick")}
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs">
                    <p className="mb-1 font-semibold">{t("wf.des.invalidTitle")}</p>
                    <ul className="list-inside list-disc space-y-0.5 text-destructive">
                      {errors.map((er, i) => (
                        <li key={i}>{er}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* بوم — LTR برای مختصات فیزیکی پایدار؛ محتوای گره‌ها RTL */}
                <div className="overflow-x-auto rounded-xl border border-border/70 scrollbar-slim">
                  <div
                    ref={innerRef}
                    dir="ltr"
                    className="relative select-none"
                    style={{
                      width: canvasW,
                      height: canvasH,
                      backgroundImage:
                        "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  >
                    {/* گذارها */}
                    <svg
                      className="pointer-events-none absolute inset-0"
                      width={canvasW}
                      height={canvasH}
                      aria-hidden
                    >
                      <defs>
                        <marker
                          id="wf-arrow"
                          viewBox="0 0 10 10"
                          refX="9"
                          refY="5"
                          markerWidth="7"
                          markerHeight="7"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-stone-400 dark:fill-stone-500" />
                        </marker>
                      </defs>
                      {transitions.map((tr, i) => {
                        const a = nodeByCode.get(tr.fromCode);
                        const b = nodeByCode.get(tr.toCode);
                        if (!a || !b) return null;
                        const g = edgeGeom(a, b);
                        const selected = selTrans === i;
                        return (
                          <g key={`${tr.fromCode}-${tr.toCode}-${i}`} className="pointer-events-auto cursor-pointer">
                            <path
                              d={g.d}
                              fill="none"
                              stroke="transparent"
                              strokeWidth={14}
                              onClick={() => {
                                setSelTrans(i);
                                setSelNode(null);
                              }}
                            />
                            <path
                              d={g.d}
                              fill="none"
                              strokeWidth={selected ? 2.5 : 1.5}
                              strokeDasharray={tr.isDefault ? "6 4" : undefined}
                              className={
                                selected
                                  ? "stroke-teal-600 dark:stroke-teal-400"
                                  : "stroke-stone-400 dark:stroke-stone-500"
                              }
                              markerEnd="url(#wf-arrow)"
                              onClick={() => {
                                setSelTrans(i);
                                setSelNode(null);
                              }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                    {/* برچسب گذارها */}
                    {transitions.map((tr, i) => {
                      const a = nodeByCode.get(tr.fromCode);
                      const b = nodeByCode.get(tr.toCode);
                      if (!a || !b) return null;
                      const g = edgeGeom(a, b);
                      const isCond = a.nodeType === "condition";
                      const label = isCond && tr.conditionExpr ? tr.conditionExpr : tr.action;
                      return (
                        <button
                          key={`lbl-${tr.fromCode}-${tr.toCode}-${i}`}
                          type="button"
                          onClick={() => {
                            setSelTrans(i);
                            setSelNode(null);
                          }}
                          dir="rtl"
                          className={cn(
                            "absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] shadow-sm transition-colors",
                            selTrans === i
                              ? "border-teal-500 bg-teal-600 text-white"
                              : "border-border bg-card text-foreground/80 hover:bg-accent",
                          )}
                          style={{ left: g.mid.x, top: g.mid.y }}
                        >
                          {label}
                        </button>
                      );
                    })}
                    {/* گره‌ها */}
                    {nodes.map((n) => {
                      const st = NODE_STYLE[n.nodeType];
                      const selected = selNode === n.nodeCode;
                      const isConnectSource = connectMode && connectFrom === n.nodeCode;
                      return (
                        <div
                          key={n.nodeCode}
                          role="button"
                          tabIndex={0}
                          aria-label={n.title}
                          onPointerDown={(e) => beginDrag(e, n)}
                          onClick={() => onNodeClick(n.nodeCode)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onNodeClick(n.nodeCode);
                            }
                          }}
                          className={cn(
                            "absolute flex cursor-grab flex-col rounded-xl border-2 bg-card shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                            st.border,
                            selected && "ring-2 ring-teal-500 ring-offset-2 ring-offset-background",
                            isConnectSource && "ring-2 ring-amber-500",
                            connectMode && !isConnectSource && "cursor-pointer",
                          )}
                          style={{ left: n.posX, top: n.posY, width: NODE_W, height: NODE_H }}
                        >
                          <div className="flex items-center gap-1.5 border-b border-border/50 px-2 py-1.5">
                            <span
                              className={cn(
                                "flex h-4 items-center gap-1 rounded-full px-1.5 text-[9px] font-semibold",
                                st.chip,
                              )}
                            >
                              {st.icon}
                              {t(`wf.des.nodeType.${n.nodeType}`)}
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground" dir="ltr">
                              {n.nodeCode}
                            </span>
                          </div>
                          <div className="min-h-0 flex-1 overflow-hidden px-2 py-1.5" dir="rtl">
                            <p className="line-clamp-2 text-[11px] font-medium leading-snug">{n.title}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 px-2 pb-1.5" dir="rtl">
                            {n.nodeType === "action" && n.roleCode && (
                              <span className="rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">
                                {n.roleCode}
                              </span>
                            )}
                            {n.nodeType === "action" && n.slaHours != null && (
                              <span className="rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">
                                SLA {n.slaHours}h
                              </span>
                            )}
                            {n.nodeType === "end" && (
                              <span
                                className={cn(
                                  "rounded-full px-1.5 text-[9px]",
                                  n.instanceState === "rejected"
                                    ? "bg-rose-600/10 text-rose-700 dark:text-rose-300"
                                    : "bg-teal-600/10 text-teal-700 dark:text-teal-300",
                                )}
                              >
                                {n.finalStatus != null ? t("wf.des.finalStatusShort") : ""}
                                {n.finalStatus != null ? ` ${n.finalStatus}` : ""}
                                {n.instanceState === "rejected" ? ` — ${t("wf.des.stateRejected")}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{t("wf.des.canvasHint")}</p>

                {/* ویرایشگر انتخاب جاری */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                  {selNodeObj ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">
                          {t("wf.des.editingNode")} — {selNodeObj.nodeCode}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-destructive hover:text-destructive"
                          disabled={!editable || selNodeObj.nodeType === "start"}
                          onClick={() => delNode(selNodeObj.nodeCode)}
                        >
                          <Scissors className="h-3.5 w-3.5" aria-hidden />
                          {t("wf.des.delNode")}
                        </Button>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="wf-node-title" className="text-xs">
                          {t("wf.des.nodeTitle")}
                        </Label>
                        <Input
                          id="wf-node-title"
                          value={selNodeObj.title}
                          disabled={!editable}
                          onChange={(e) => updateNode(selNodeObj.nodeCode, { title: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      {selNodeObj.nodeType === "action" && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("wf.des.role")}</Label>
                            <Select
                              value={selNodeObj.roleCode}
                              disabled={!editable}
                              onValueChange={(v) => updateNode(selNodeObj.nodeCode, { roleCode: v })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder={t("wf.des.role")} />
                              </SelectTrigger>
                              <SelectContent>
                                {roles
                                  .filter((r) => r.isActive)
                                  .map((r) => (
                                    <SelectItem key={r.code} value={r.code}>
                                      {r.code} — {r.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="wf-node-sla" className="text-xs">
                              {t("wf.des.sla")}
                            </Label>
                            <Input
                              id="wf-node-sla"
                              type="number"
                              min={1}
                              value={selNodeObj.slaHours ?? ""}
                              disabled={!editable}
                              onChange={(e) =>
                                updateNode(selNodeObj.nodeCode, {
                                  slaHours: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="h-8"
                              dir="ltr"
                            />
                          </div>
                        </>
                      )}
                      {selNodeObj.nodeType === "end" && (
                        <div className="space-y-1">
                          <Label className="text-xs">{t("wf.des.finalStatus")}</Label>
                          <Select
                            value={selNodeObj.finalStatus != null ? String(selNodeObj.finalStatus) : undefined}
                            disabled={!editable}
                            onValueChange={(v) => {
                              const fs = Number(v);
                              updateNode(selNodeObj.nodeCode, {
                                finalStatus: fs,
                                instanceState: fs === 1 ? "rejected" : "approved",
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder={t("wf.des.finalStatus")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">{t("wf.des.finalStatus1")}</SelectItem>
                              <SelectItem value="3">{t("wf.des.finalStatus3")}</SelectItem>
                              <SelectItem value="4">{t("wf.des.finalStatus4")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {selNodeObj.nodeType === "condition" && (
                        <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-4">
                          {t("wf.des.conditionHint")}
                        </p>
                      )}
                      {selNodeObj.nodeType === "start" && (
                        <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-4">
                          {t("wf.des.startHint")}
                        </p>
                      )}
                    </div>
                  ) : selTrans !== null && transitions[selTrans] ? (
                    (() => {
                      const tr = transitions[selTrans];
                      const from = nodeByCode.get(tr.fromCode);
                      return (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold">
                              {t("wf.des.editingTrans")} — {from?.title ?? tr.fromCode} →{" "}
                              {nodeByCode.get(tr.toCode)?.title ?? tr.toCode}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-destructive hover:text-destructive"
                              disabled={!editable}
                              onClick={() => delTrans(selTrans)}
                            >
                              <Scissors className="h-3.5 w-3.5" aria-hidden />
                              {t("wf.des.delTrans")}
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("wf.des.transAction")}</Label>
                            <Select
                              value={tr.action}
                              disabled={!editable}
                              onValueChange={(v) => updateTrans(selTrans, { action: v })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder={t("wf.des.transAction")} />
                              </SelectTrigger>
                              <SelectContent>
                                {(from?.nodeType === "start"
                                  ? ["ارسال به رسیدگی"]
                                  : from?.nodeType === "condition"
                                    ? ["بله", "خیر"]
                                    : ["تایید", "رد"]
                                ).map((a) => (
                                  <SelectItem key={a} value={a}>
                                    {a}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {from?.nodeType === "condition" && (
                            <>
                              <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="wf-trans-expr" className="text-xs">
                                  {t("wf.des.condExpr")}
                                </Label>
                                <Input
                                  id="wf-trans-expr"
                                  value={tr.conditionExpr}
                                  disabled={!editable || tr.isDefault}
                                  onChange={(e) => updateTrans(selTrans, { conditionExpr: e.target.value })}
                                  className="h-8 font-mono"
                                  dir="ltr"
                                />
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {["amount > threshold", "amount <= threshold"].map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      disabled={!editable || tr.isDefault}
                                      onClick={() => updateTrans(selTrans, { conditionExpr: preset })}
                                      className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id="wf-trans-default"
                                  checked={tr.isDefault}
                                  disabled={!editable}
                                  onCheckedChange={(v) => updateTrans(selTrans, { isDefault: v })}
                                />
                                <Label htmlFor="wf-trans-default" className="text-xs">
                                  {t("wf.des.isDefault")}
                                </Label>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("wf.des.editPanelHint")}</p>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        )}
      </div>

      {/* دیالوگ فرآیند جدید */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("wf.des.newDef")}</DialogTitle>
            <DialogDescription>{t("wf.des.newDefHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("wf.des.chooseForm")}</Label>
              <Select
                value={cForm.entityType}
                onValueChange={(v) => {
                  const suggested = `WF-${v.toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
                  setCForm((f) => ({ ...f, entityType: v, code: f.code || suggested }));
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("wf.des.chooseForm")} />
                </SelectTrigger>
                <SelectContent>
                  {catalog
                    .filter((c) => c.participates && c.adapterReady)
                    .map((c) => (
                      <SelectItem key={c.entityType} value={c.entityType}>
                        {c.formTitle}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="wf-def-code" className="text-xs">
                {t("wf.des.defCode")}
              </Label>
              <Input
                id="wf-def-code"
                value={cForm.code}
                onChange={(e) => setCForm((f) => ({ ...f, code: e.target.value }))}
                className="h-9 font-mono"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wf-def-name" className="text-xs">
                {t("wf.des.defName")}
              </Label>
              <Input
                id="wf-def-name"
                value={cForm.name}
                onChange={(e) => setCForm((f) => ({ ...f, name: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wf-def-threshold" className="text-xs">
                {t("wf.des.threshold")}
              </Label>
              <Input
                id="wf-def-threshold"
                type="number"
                min={0}
                value={cForm.threshold}
                onChange={(e) => setCForm((f) => ({ ...f, threshold: e.target.value }))}
                className="h-9"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground">{t("wf.des.thresholdHint")}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 text-white hover:bg-teal-700"
                disabled={creating}
                onClick={() => void doCreate()}
              >
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                {t("wf.des.createBtn")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BadgeOk() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2} aria-hidden>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
