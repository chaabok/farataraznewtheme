"use client";

import * as React from "react";
import { FilePlus2, ListTree, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useT, useSettings } from "@/stores/settings-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getIconKeyGlyph } from "@/lib/app-catalog";
import {
  dfbApi, type DfbMenuNode, type DfbTabDef, type DfbFieldDef,
} from "@/stores/dfb-store";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared glyph by iconKey                                             */
/* ------------------------------------------------------------------ */

export function DfbGlyph({ iconKey, className, iconClass, style }: {
  iconKey: string; className?: string; iconClass?: string; style?: React.CSSProperties;
}) {
  const glyph = getIconKeyGlyph(iconKey);
  const Icon = glyph.Icon;
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
        glyph.tile,
        className ?? "h-9 w-9",
      )}
    >
      <Icon className={iconClass ?? "h-5 w-5"} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* icon picker (menu dialog)                                           */
/* ------------------------------------------------------------------ */

const PICKER_ICON_KEYS = [
  "settings", "calculator", "receiptsPayment", "warehouse", "cart", "landmark", "packageSearch",
  "globe", "sigma", "truckCheck", "factory", "handCoins", "users", "fileStack", "heartHandshake",
  "wrench", "userCog", "workflow", "messageSquare", "store", "megaphone", "snowflake", "flame",
  "fileBarChart", "barChart", "hammer", "boxes", "folder", "listTree", "clipboardList", "notebookPen",
];

function IconPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  return (
    <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border/60 p-2 scrollbar-slim sm:grid-cols-11">
      {PICKER_ICON_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          aria-label={k}
          onClick={() => onChange(k)}
          className={cn(
            "flex items-center justify-center rounded-lg p-1 transition-all",
            value === k ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : "hover:bg-foreground/5",
          )}
        >
          <DfbGlyph iconKey={k} className="h-7 w-7" iconClass="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1) menu dialog — create main icon / submenu                         */
/*    Bodies are conditionally mounted ({open && …}) so their local     */
/*    state resets by remount — no setState-in-effect (react-hooks).    */
/* ------------------------------------------------------------------ */

export function DfbMenuDialog({
  open, onOpenChange, parent, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** null = main icon (NodeType 1); otherwise submenu under this node */
  parent: DfbMenuNode | null;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <MenuDialogBody
          isIcon={!parent}
          parentTitle={parent?.title ?? ""}
          parentRef={parent ? parent.id : 0}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function MenuDialogBody({
  isIcon, parentTitle, parentRef, onClose, onSaved,
}: {
  isIcon: boolean;
  parentTitle: string;
  parentRef: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const [title, setTitle] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [iconKey, setIconKey] = React.useState(isIcon ? "boxes" : "folder");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await dfbApi.post("menus", {
        parentRef,
        nodeType: isIcon ? 1 : 2,
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        iconKey,
      });
      toast.success(t("dfb.savedToast"));
      onSaved();
      onClose();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-md" dir="auto">
      <DialogHeader>
        <DialogTitle>
          {isIcon ? t("dfb.addMainIcon") : `${t("dfb.addSubMenu")} — ${parentTitle}`}
        </DialogTitle>
        <DialogDescription>{t("dfb.menuDialogDesc")}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="dfb-menu-title">{t("dfb.menuTitle")}</Label>
          <Input id="dfb-menu-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dfb-menu-title-en">{t("dfb.menuTitleEn")}</Label>
          <Input id="dfb-menu-title-en" dir="ltr" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("dfb.iconKey")}</Label>
          <IconPicker value={iconKey} onChange={setIconKey} />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={submit} disabled={busy || !title.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("common.save")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ------------------------------------------------------------------ */
/* 2) query dialog — create a whitelisted query                        */
/* ------------------------------------------------------------------ */

export interface QueryTableMeta {
  key: string;
  labelFa: string;
  labelEn: string;
  columns: Array<{ name: string; labelFa: string; labelEn: string }>;
}

export function DfbQueryDialog({
  open, onOpenChange, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <QueryDialogBody onClose={() => onOpenChange(false)} onSaved={onSaved} />}
    </Dialog>
  );
}

function QueryDialogBody({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const t = useT();
  const isLtr = useSettings((s) => s.dir()) === "ltr";
  const [tables, setTables] = React.useState<QueryTableMeta[]>([]);
  const [title, setTitle] = React.useState("");
  const [tableKey, setTableKey] = React.useState("");
  const [columns, setColumns] = React.useState<string[]>([]);
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    dfbApi.get<{ items: QueryTableMeta[] }>("queries/tables")
      .then((res) => {
        if (alive) setTables(res.items ?? []);
      })
      .catch(() => { /* host unavailable */ });
    return () => {
      alive = false;
    };
  }, []);

  const table = tables.find((x) => x.key === tableKey);

  const submit = async () => {
    if (!title.trim() || !tableKey || columns.length === 0) return;
    setBusy(true);
    try {
      await dfbApi.post("queries", {
        title: title.trim(),
        sourceTable: tableKey,
        filterColumn: filterColumn && filterColumn !== "-" ? filterColumn : undefined,
        filterValue: filterValue || undefined,
        fields: columns.map((c) => ({ fieldName: c })),
      });
      toast.success(t("dfb.savedToast"));
      onSaved();
      onClose();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-lg" dir="auto">
      <DialogHeader>
        <DialogTitle>{t("dfb.createQuery")}</DialogTitle>
        <DialogDescription>{t("dfb.queryDialogDesc")}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="dfb-query-title">{t("dfb.queryTitle")}</Label>
          <Input id="dfb-query-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("dfb.queryTable")}</Label>
          <Select value={tableKey} onValueChange={(v) => { setTableKey(v); setColumns([]); setFilterColumn(""); }}>
            <SelectTrigger aria-label={t("dfb.queryTable")}><SelectValue /></SelectTrigger>
            <SelectContent>
              {tables.map((m) => (
                <SelectItem key={m.key} value={m.key}>{isLtr ? m.labelEn : m.labelFa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {table && (
          <div className="grid gap-1.5">
            <Label>{t("dfb.queryColumns")}</Label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 p-2.5">
              {table.columns.map((c) => (
                <label
                  key={c.name}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs hover:bg-foreground/5"
                >
                  <Checkbox
                    checked={columns.includes(c.name)}
                    onCheckedChange={(v) =>
                      setColumns((cols) => (v ? [...cols, c.name] : cols.filter((x) => x !== c.name)))
                    }
                    aria-label={c.name}
                  />
                  {isLtr ? c.labelEn : c.labelFa}
                  <span dir="ltr" className="font-mono text-[10px] text-muted-foreground">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {table && (
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label>{t("dfb.filterColumn")}</Label>
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger aria-label={t("dfb.filterColumn")}><SelectValue placeholder={t("dfb.none")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">{t("dfb.none")}</SelectItem>
                  {table.columns.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dfb-query-filter">{t("dfb.filterValue")}</Label>
              <Input
                id="dfb-query-filter" value={filterValue} disabled={!filterColumn || filterColumn === "-"}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={submit} disabled={busy || !title.trim() || !tableKey || columns.length === 0}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("dfb.createQuery")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ------------------------------------------------------------------ */
/* 3) form wizard — template → identity/header/footer → fields         */
/* ------------------------------------------------------------------ */

interface WizardField {
  key: string; // local uuid
  label: string;
  fieldType: string;
  required: boolean;
  widthSpan: number;
  queryId: number | null;
  queryFieldKey: string | null;
}

interface WizardTab {
  localId: string;
  title: string;
}

const FIELD_TYPE_OPTIONS = ["text", "number", "select", "lookup", "checkbox", "date", "textarea"] as const;

const FOOTER_BUTTONS = ["save", "saveNew", "saveClose", "reset", "delete", "print"] as const;

export function DfbFormWizard({
  open, onOpenChange, parentMenu, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parentMenu: DfbMenuNode;
  onSaved: (formId: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <WizardBody
          parentMenu={parentMenu}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function WizardBody({
  parentMenu, onClose, onSaved,
}: {
  parentMenu: DfbMenuNode;
  onClose: () => void;
  onSaved: (formId: number) => void;
}) {
  const t = useT();
  const [step, setStep] = React.useState(1);
  const [componentKey, setComponentKey] = React.useState<"simpleTwoRowTabbed" | "treeForm">("simpleTwoRowTabbed");
  const [title, setTitle] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [badge, setBadge] = React.useState("");
  const [footerButtons, setFooterButtons] = React.useState<string[]>(["save", "reset", "delete"]);
  const [tabs, setTabs] = React.useState<WizardTab[]>([]);
  const [newTabTitle, setNewTabTitle] = React.useState("");
  const [fields, setFields] = React.useState<WizardField[]>([]);
  const [queries, setQueries] = React.useState<Array<{ id: number; title: string; fields: Array<{ fieldName: string }> }>>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    dfbApi.get<{ items: Array<{ id: number; title: string; fields: Array<{ fieldName: string }> }> }>("queries")
      .then((res) => {
        if (alive) setQueries(res.items ?? []);
      })
      .catch(() => { /* query list optional */ });
    return () => {
      alive = false;
    };
  }, [step]);

  const addField = () =>
    setFields((f) => [
      ...f,
      {
        key: `fld-${Date.now()}-${f.length}`,
        label: "", fieldType: "text", required: false, widthSpan: 1,
        queryId: null, queryFieldKey: null,
      },
    ]);

  const submit = async () => {
    if (!title.trim() || fields.length === 0 || fields.some((f) => !f.label.trim())) return;
    setBusy(true);
    try {
      const payload = {
        menuRef: parentMenu.id,
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        componentKey,
        header: badge.trim() ? { badge: badge.trim() } : undefined,
        footer: { buttons: footerButtons },
        status: 2,
        tabs: componentKey === "simpleTwoRowTabbed"
          ? tabs.map((tb, i) => ({ title: tb.title, orderIndex: i }))
          : undefined,
        fields: fields.map((f, i) => ({
          fieldKey: `f${i + 1}_${f.fieldType}`,
          label: f.label.trim(),
          fieldType: f.fieldType,
          required: f.required,
          widthSpan: f.widthSpan,
          orderIndex: i,
          queryRef: f.queryId ?? undefined,
          queryFieldKey: f.queryFieldKey ?? undefined,
        })),
      };
      /* dfb-service forms.create returns the created row itself (not {item}) */
      const res = await dfbApi.post<{ id: number }>("forms", payload);
      toast.success(t("dfb.savedToast"));
      onSaved(res.id);
      onClose();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl" dir="auto">
      <DialogHeader>
        <DialogTitle>
          {t("dfb.createForm")} — {parentMenu.title}
        </DialogTitle>
        <DialogDescription>
          {step === 1 ? t("dfb.wizard.step1") : step === 2 ? t("dfb.wizard.step2") : t("dfb.wizard.step3")}
        </DialogDescription>
      </DialogHeader>

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => { setComponentKey("simpleTwoRowTabbed"); setStep(2); }}
            aria-pressed={componentKey === "simpleTwoRowTabbed"}
            className="group rounded-2xl border border-border/70 p-4 text-start transition-all hover:border-foreground/30 hover:shadow-md"
          >
            <span className="mb-3 flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-inner">
              <FilePlus2 className="h-7 w-7" aria-hidden />
            </span>
            <span className="block text-sm font-semibold">{t("dfb.template.simple")}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {t("dfb.template.simpleDesc")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setComponentKey("treeForm"); setStep(2); }}
            aria-pressed={componentKey === "treeForm"}
            className="group rounded-2xl border border-border/70 p-4 text-start transition-all hover:border-foreground/30 hover:shadow-md"
          >
            <span className="mb-3 flex h-16 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-inner">
              <ListTree className="h-7 w-7" aria-hidden />
            </span>
            <span className="block text-sm font-semibold">{t("dfb.template.tree")}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {t("dfb.template.treeDesc")}
            </span>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pe-1 scrollbar-slim">
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-form-title">{t("dfb.formTitle")}</Label>
            <Input id="dfb-form-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="dfb-form-title-en">{t("dfb.formTitleEn")}</Label>
              <Input id="dfb-form-title-en" dir="ltr" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dfb-form-badge">{t("dfb.badgeLabel")}</Label>
              <Input id="dfb-form-badge" value={badge} onChange={(e) => setBadge(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>{t("dfb.footerButtons")}</Label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 p-2.5">
              {FOOTER_BUTTONS.map((b) => (
                <label key={b} className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs hover:bg-foreground/5">
                  <Checkbox
                    checked={footerButtons.includes(b)}
                    onCheckedChange={(v) =>
                      setFooterButtons((btns) => (v ? [...btns, b] : btns.filter((x) => x !== b)))
                    }
                    aria-label={t(`dfb.btn.${b}` as never)}
                  />
                  {t(`dfb.btn.${b}` as never)}
                </label>
              ))}
            </div>
          </div>
          {componentKey === "simpleTwoRowTabbed" && (
            <div className="grid gap-1.5">
              <Label>{t("dfb.tabsSection")}</Label>
              <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tb) => (
                  <Badge key={tb.localId} variant="secondary" className="gap-1">
                    {tb.title}
                    <button
                      type="button" aria-label={t("common.delete")}
                      onClick={() => setTabs((ts) => ts.filter((x) => x.localId !== tb.localId))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Input
                  value={newTabTitle}
                  onChange={(e) => setNewTabTitle(e.target.value)}
                  placeholder={t("dfb.tabTitle")}
                  className="h-8 w-40"
                />
                <Button
                  type="button" variant="outline" size="sm" className="h-8"
                  disabled={!newTabTitle.trim()}
                  onClick={() => {
                    setTabs((ts) => [...ts, { localId: `tab-${Date.now()}`, title: newTabTitle.trim() }]);
                    setNewTabTitle("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> {t("dfb.addTab")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pe-1 scrollbar-slim">
          <div className="flex items-center justify-between">
            <Label>{t("dfb.fieldsSection")}</Label>
            <Button type="button" variant="outline" size="sm" onClick={addField}>
              <Plus className="h-3.5 w-3.5" /> {t("dfb.newField")}
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
              {t("dfb.noFieldsYet")}
            </p>
          )}
          <div className="grid gap-2">
            {fields.map((f) => (
              <div key={f.key} className="grid gap-2 rounded-xl border border-border/60 p-3 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <Label className="text-[11px] text-muted-foreground">{t("dfb.fieldLabel")}</Label>
                  <Input
                    value={f.label}
                    onChange={(e) =>
                      setFields((fs) => fs.map((x) => (x.key === f.key ? { ...x, label: e.target.value } : x)))
                    }
                    className="h-8"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-muted-foreground">{t("dfb.fieldType")}</Label>
                  <Select
                    value={f.fieldType}
                    onValueChange={(v) =>
                      setFields((fs) => fs.map((x) => (x.key === f.key ? { ...x, fieldType: v } : x)))
                    }
                  >
                    <SelectTrigger className="h-8" aria-label={t("dfb.fieldType")}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((ft) => (
                        <SelectItem key={ft} value={ft}>{t(`dfb.type.${ft}` as never)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] text-muted-foreground">{t("dfb.width")}</Label>
                  <Select
                    value={String(f.widthSpan)}
                    onValueChange={(v) =>
                      setFields((fs) => fs.map((x) => (x.key === f.key ? { ...x, widthSpan: Number(v) } : x)))
                    }
                  >
                    <SelectTrigger className="h-8" aria-label={t("dfb.width")}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t("dfb.widthHalf")}</SelectItem>
                      <SelectItem value="2">{t("dfb.widthFull")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-[11px] text-muted-foreground">{t("dfb.queryBind")}</Label>
                  <Select
                    value={f.queryId != null ? String(f.queryId) : "-"}
                    onValueChange={(v) =>
                      setFields((fs) =>
                        fs.map((x) =>
                          x.key === f.key
                            ? { ...x, queryId: v === "-" ? null : Number(v), queryFieldKey: null }
                            : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="h-8" aria-label={t("dfb.queryBind")}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">{t("dfb.noQuery")}</SelectItem>
                      {queries.map((q) => (
                        <SelectItem key={q.id} value={String(q.id)}>{q.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end justify-between gap-1 sm:col-span-1">
                  <label className="flex h-8 cursor-pointer items-center gap-1 text-xs" title={t("dfb.required")}>
                    <Checkbox
                      checked={f.required}
                      onCheckedChange={(v) =>
                        setFields((fs) => fs.map((x) => (x.key === f.key ? { ...x, required: Boolean(v) } : x)))
                      }
                      aria-label={t("dfb.required")}
                    />
                  </label>
                  <Button
                    type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                    aria-label={t("common.delete")}
                    onClick={() => setFields((fs) => fs.filter((x) => x.key !== f.key))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {(f.fieldType === "select" || f.fieldType === "lookup") && f.queryId != null && (
                  <div className="sm:col-span-12">
                    <Label className="text-[11px] text-muted-foreground">{t("dfb.queryValueColumn")}</Label>
                    <Select
                      value={f.queryFieldKey ?? "-"}
                      onValueChange={(v) =>
                        setFields((fs) => fs.map((x) => (x.key === f.key ? { ...x, queryFieldKey: v === "-" ? null : v } : x)))
                      }
                    >
                      <SelectTrigger className="h-8" aria-label={t("dfb.queryValueColumn")}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">{t("dfb.none")}</SelectItem>
                        {(queries.find((q) => q.id === f.queryId)?.fields ?? []).map((qf) => (
                          <SelectItem key={qf.fieldName} value={qf.fieldName}>{qf.fieldName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <DialogFooter className="gap-2">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>{t("dfb.prev")}</Button>
        )}
        {step < 3 ? (
          <Button variant="outline" onClick={() => setStep(step + 1)}>
            {t("dfb.next")}
          </Button>
        ) : (
          <Button onClick={submit} disabled={busy || !title.trim() || fields.length === 0 || fields.some((f) => !f.label.trim())}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t("dfb.createForm")}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}

/* ------------------------------------------------------------------ */
/* 4) add-field dialog — works on system forms too (IsCustom)          */
/* ------------------------------------------------------------------ */

export function DfbAddFieldDialog({
  open, onOpenChange, form, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { id: number; title: string; isSystem: boolean; tabs: DfbTabDef[]; fields: DfbFieldDef[] };
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <AddFieldBody
          form={form}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function AddFieldBody({
  form, onClose, onSaved,
}: {
  form: { id: number; title: string; isSystem: boolean; tabs: DfbTabDef[]; fields: DfbFieldDef[] };
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const [label, setLabel] = React.useState("");
  const [labelEn, setLabelEn] = React.useState("");
  const [fieldType, setFieldType] = React.useState("text");
  const [required, setRequired] = React.useState(false);
  const [widthSpan, setWidthSpan] = React.useState(1);
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!label.trim()) return;
    setBusy(true);
    try {
      await dfbApi.post(`forms/${form.id}/fields`, {
        fieldKey: `custom_${Date.now()}`,
        label: label.trim(),
        labelEn: labelEn.trim() || undefined,
        fieldType,
        required,
        widthSpan,
        orderIndex: form.fields.length,
      });
      toast.success(t("dfb.savedToast"));
      onSaved();
      onClose();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-md" dir="auto">
      <DialogHeader>
        <DialogTitle>
          {t("dfb.addField")} — {form.title}
        </DialogTitle>
        <DialogDescription>
          {form.isSystem ? t("dfb.addFieldSystemDesc") : t("dfb.addFieldDesc")}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="dfb-field-label">{t("dfb.fieldLabel")}</Label>
          <Input id="dfb-field-label" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="dfb-field-label-en">{t("dfb.fieldLabelEn")}</Label>
            <Input id="dfb-field-label-en" dir="ltr" value={labelEn} onChange={(e) => setLabelEn(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>{t("dfb.fieldType")}</Label>
            <Select value={fieldType} onValueChange={setFieldType}>
              <SelectTrigger aria-label={t("dfb.fieldType")}><SelectValue /></SelectTrigger>
              <SelectContent>
                {FIELD_TYPE_OPTIONS.map((ft) => (
                  <SelectItem key={ft} value={ft}>{t(`dfb.type.${ft}` as never)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={required} onCheckedChange={(v) => setRequired(Boolean(v))} aria-label={t("dfb.required")} />
            {t("dfb.required")}
          </label>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("dfb.width")}:</span>
            <Select value={String(widthSpan)} onValueChange={(v) => setWidthSpan(Number(v))}>
              <SelectTrigger className="h-8 w-32" aria-label={t("dfb.width")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("dfb.widthHalf")}</SelectItem>
                <SelectItem value="2">{t("dfb.widthFull")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={submit} disabled={busy || !label.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {t("common.save")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ------------------------------------------------------------------ */
/* 5) fields overview (detailExtra of the builder for a selected form)  */
/* ------------------------------------------------------------------ */

export function DfbFieldsOverview({ fields }: { fields: DfbFieldDef[] }) {
  const t = useT();
  if (fields.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("dfb.noFieldsYet")}</p>;
  }
  return (
    <ScrollArea className="max-h-56">
      <ul className="grid gap-1.5 pe-2">
        {fields.map((f) => (
          <li key={f.id} className="flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1.5 text-xs">
            <Badge variant="outline" className="shrink-0 font-mono text-[10px]">{f.fieldType}</Badge>
            <span className="min-w-0 flex-1 truncate font-medium">{f.label}</span>
            {f.required && <Badge variant="secondary" className="shrink-0 text-[10px]">{t("dfb.required")}</Badge>}
            {f.queryRef != null && <Badge variant="secondary" className="shrink-0 text-[10px]">{t("dfb.queryBound")}</Badge>}
            {f.isCustom && <Badge variant="secondary" className="shrink-0 text-[10px]">{t("dfb.customField")}</Badge>}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
