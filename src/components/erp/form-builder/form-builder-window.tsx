"use client";

import * as React from "react";
import { FileText, ListTree, Network, Palette, Plus, Sigma, Table2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SimpleTreeForm,
  type SimpleTreeFormNode,
} from "@/components/forms/simple-tree-form";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";
import type { FormAction } from "@/components/forms/action-bar";
import { ConfirmDeleteDialog } from "@/components/forms/action-bar";
import { useWindowChrome } from "@/components/desktop/app-window";
import {
  useDfb, findMenuNode, fetchFormDetail, dfbNodeTitle, dfbFormTitle,
  type DfbMenuNode, type DfbFormDetail, type DfbFormSummary,
} from "@/stores/dfb-store";
import {
  DfbGlyph, DfbMenuDialog, DfbFormWizard, DfbQueryDialog, DfbFieldsOverview,
} from "./dfb-dialogs";
import { dfbApi } from "@/stores/dfb-store";

/**
 * FormBuilderWindow (Task 45) — «ابزارهای پیشرفته» window: the professional
 * form builder (فرمساز) as a TREE form (owner request). Left pane = the whole
 * builder tree (system icons → submenus → forms, incl. system forms); right
 * pane = the editor. Toolbar: add main icon / manage queries. The create-form
 * wizard opens from any selected menu node (main icon or submenu).
 */
export function FormBuilderWindow() {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "dfb-builder")?.maximized ?? false,
  );
  const closeThisWindow = React.useCallback(() => {
    const win = useDesktop.getState().windows.find((w) => w.kind === "dfb-builder");
    if (win) useDesktop.getState().closeWindow(win.id);
  }, []);

  const tree = useDfb((s) => s.tree);
  const loaded = useDfb((s) => s.loaded);
  const load = useDfb((s) => s.load);

  React.useEffect(() => {
    void load();
  }, [load]);

  /* ---------------- dialogs ---------------- */
  const [menuDialog, setMenuDialog] = React.useState<{ open: boolean; parent: DfbMenuNode | null }>({ open: false, parent: null });
  const [wizard, setWizard] = React.useState<{ open: boolean; parent: DfbMenuNode | null }>({ open: false, parent: null });
  const [queryDialogOpen, setQueryDialogOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<{ open: boolean; kind: "menu" | "form"; id: number; title: string } | null>(null);

  /* ---------------- selection ---------------- */
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = React.useMemo(() => {
    if (!selectedId) return null;
    if (selectedId.startsWith("m")) {
      const menu = findMenuNode(tree, Number(selectedId.slice(1)));
      return menu ? { kind: "menu" as const, menu } : null;
    }
    if (selectedId.startsWith("f")) {
      const id = Number(selectedId.slice(1));
      const findOwner = (nodes: DfbMenuNode[]): DfbMenuNode | null => {
        for (const n of nodes) {
          if (n.forms.some((f) => f.id === id)) return n;
          const hit = findOwner(n.children ?? []);
          if (hit) return hit;
        }
        return null;
      };
      const owner = findOwner(tree);
      if (owner) {
        return { kind: "form" as const, form: owner.forms.find((f) => f.id === id)! };
      }
    }
    return null;
  }, [selectedId, tree]);

  const reload = React.useCallback(() => {
    void load();
  }, [load]);

  /* ---------------- pending edits (no setState-in-effect: values are
     keyed by the selected id, so switching nodes needs no reset) -------- */
  const [edits, setEdits] = React.useState<Record<string, { title?: string; titleEn?: string }>>({});
  const editOf = (field: "title" | "titleEn"): string => {
    if (!selected) return "";
    const pending = edits[selectedId!];
    if (pending && pending[field] !== undefined) return pending[field]!;
    if (selected.kind === "menu") return field === "title" ? selected.menu.title : (selected.menu.titleEn ?? "");
    return field === "title" ? selected.form.title : (selected.form.titleEn ?? "");
  };
  const setEdit = (field: "title" | "titleEn", value: string) => {
    if (!selectedId) return;
    setEdits((e) => ({ ...e, [selectedId]: { ...e[selectedId], [field]: value } }));
  };

  /* ---------------- tree nodes ---------------- */
  const nodes = React.useMemo<SimpleTreeFormNode[]>(() => {
    const mapMenu = (n: DfbMenuNode): SimpleTreeFormNode => ({
      id: `m${n.id}`,
      label: dfbNodeTitle(n, t, locale),
      icon: (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <DfbGlyph iconKey={n.iconKey} className="h-4 w-4 rounded-md" iconClass="h-2.5 w-2.5" />
        </span>
      ),
      children: [
        ...n.children.map(mapMenu),
        ...n.forms.map<SimpleTreeFormNode>((f) => ({
          id: `f${f.id}`,
          label: dfbFormTitle(f, locale),
          icon: (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
              <FileText
                className={f.isSystem ? "h-3.5 w-3.5 text-sky-600 dark:text-sky-400" : "h-3.5 w-3.5 text-teal-600 dark:text-teal-400"}
                aria-hidden
              />
            </span>
          ),
        })),
      ],
    });
    return tree.map(mapMenu);
  }, [tree, t, locale]);

  /* ---------------- detail fields ---------------- */
  const fields = React.useMemo<SimpleFormField[]>(() => {
    if (!selected) return [];
    if (selected.kind === "menu") {
      const m = selected.menu;
      return [
        { id: "title", label: t("fdf.name"), required: true, value: editOf("title") },
        { id: "titleEn", label: t("stf.latinTitle"), value: editOf("titleEn"), ltr: true },
        { id: "code", label: t("fdf.code"), value: m.code, readOnly: true, ltr: true },
        { id: "kind", label: t("dfb.menuKind"), type: "select" as const, value: m.nodeType === 1 ? "icon" : "submenu", disabled: true, options: [
          { value: "icon", label: t("dfb.kindIcon") },
          { value: "submenu", label: t("dfb.kindSubmenu") },
        ] },
        { id: "system", label: t("dfb.systemEntry"), type: "checkbox" as const, checked: m.isSystem, readOnly: true },
      ];
    }
    const f = selected.form;
    return [
      { id: "title", label: t("dfb.formTitle"), required: true, value: editOf("title") },
      { id: "titleEn", label: t("stf.latinTitle"), value: editOf("titleEn"), ltr: true },
      { id: "code", label: t("fdf.code"), value: f.code, readOnly: true, ltr: true },
      { id: "component", label: t("dfb.templateLabel"), type: "select" as const, value: f.componentKey, disabled: true, options: [
        { value: "simpleTwoRowTabbed", label: t("dfb.template.simple") },
        { value: "treeForm", label: t("dfb.template.tree") },
      ] },
      { id: "status", label: t("dfb.statusLabel"), type: "select" as const, value: String(f.status), disabled: f.isSystem, options: [
        { value: "1", label: t("dfb.statusDraft") },
        { value: "2", label: t("dfb.statusPublished") },
      ] },
      { id: "system", label: t("dfb.systemEntry"), type: "checkbox" as const, checked: f.isSystem, readOnly: true },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, t, edits, selectedId]);

  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    if (id === "title") setEdit("title", String(value));
    if (id === "titleEn") setEdit("titleEn", String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  /* ---------------- actions ---------------- */
  const dirty = React.useMemo(() => {
    if (!selected || !selectedId) return false;
    const pending = edits[selectedId];
    if (!pending) return false;
    const baseTitle = selected.kind === "menu" ? selected.menu.title : selected.form.title;
    const baseTitleEn = selected.kind === "menu" ? (selected.menu.titleEn ?? "") : (selected.form.titleEn ?? "");
    return (pending.title !== undefined && pending.title !== baseTitle) ||
      (pending.titleEn !== undefined && pending.titleEn !== baseTitleEn);
  }, [selected, selectedId, edits]);

  const onSave = React.useCallback(async () => {
    if (!selected || !selectedId) return;
    const pending = edits[selectedId] ?? {};
    const title = pending.title ?? (selected.kind === "menu" ? selected.menu.title : selected.form.title);
    if (!title.trim()) return;
    try {
      if (selected.kind === "menu") {
        if (selected.menu.isSystem) {
          toast.info(t("dfb.systemEntryToast"));
          return;
        }
        await dfbApi.put(`menus/${selected.menu.id}`, {
          title: title.trim(),
          titleEn: pending.titleEn ?? selected.menu.titleEn ?? undefined,
        });
      } else {
        await dfbApi.put(`forms/${selected.form.id}`, {
          title: title.trim(),
          titleEn: pending.titleEn ?? selected.form.titleEn ?? undefined,
        });
      }
      setEdits((e) => ({ ...e, [selectedId]: {} }));
      toast.success(t("abar.savedToast"));
      reload();
    } catch {
      toast.error(t("common.error"));
    }
  }, [selected, selectedId, edits, t, reload]);

  const doDelete = React.useCallback(async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.kind === "menu") await dfbApi.del(`menus/${confirmDelete.id}`);
      else await dfbApi.del(`forms/${confirmDelete.id}`);
      toast.success(t("abar.deletedToast"));
      setSelectedId(null);
      reload();
    } catch {
      toast.error(t("common.error"));
    }
  }, [confirmDelete, t, reload]);

  const onAddBranch = React.useCallback(
    (node: SimpleTreeFormNode) => {
      if (!node.id.startsWith("m")) return;
      const menu = findMenuNode(tree, Number(node.id.slice(1)));
      if (menu) setMenuDialog({ open: true, parent: menu });
    },
    [tree],
  );

  const onDeleteBranch = React.useCallback(
    (node: SimpleTreeFormNode) => {
      if (!node.id.startsWith("m")) return;
      const menu = findMenuNode(tree, Number(node.id.slice(1)));
      if (!menu || menu.isSystem) return;
      setConfirmDelete({ open: true, kind: "menu", id: menu.id, title: menu.title });
    },
    [tree],
  );

  const canAddBranch = React.useCallback(
    (node: SimpleTreeFormNode) => node.id.startsWith("m") && (findMenuNode(tree, Number(node.id.slice(1)))?.children.length ?? 0) < 6,
    [tree],
  );

  const canDeleteBranch = React.useCallback(
    (node: SimpleTreeFormNode) => {
      if (!node.id.startsWith("m")) return false;
      const menu = findMenuNode(tree, Number(node.id.slice(1)));
      return Boolean(menu && !menu.isSystem);
    },
    [tree],
  );

  /* detailExtra — per selection; the form panel is a keyed child that owns
     its fetch state (remount per form = no setState-in-effect) */
  const detailExtra = React.useMemo(() => {
    if (!selected) return null;
    if (selected.kind === "menu") {
      return (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" size="sm" onClick={() => setWizard({ open: true, parent: selected.menu })}>
            <Plus className="h-4 w-4" /> {t("dfb.createForm")}
          </Button>
          <Button
            type="button" size="sm" variant="outline"
            onClick={() => setMenuDialog({ open: true, parent: selected.menu })}
          >
            <Network className="h-4 w-4" /> {t("dfb.addSubMenu")}
          </Button>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {selected.menu.forms.length} {t("dfb.formsCount")}
          </Badge>
        </div>
      );
    }
    return (
      <FormDetailPanel
        key={selected.form.id}
        form={selected.form}
        onDeleted={() => {
          setSelectedId(null);
          reload();
        }}
      />
    );
  }, [selected, t, reload]);

  const onSaveAction = React.useCallback<FormAction>(() => onSave(), [onSave]);

  const detailTitleOverride = React.useMemo(() => {
    if (!selected) return null;
    return selected.kind === "menu"
      ? dfbNodeTitle(selected.menu, t, locale)
      : `${t("dfb.formEntry")}: ${dfbFormTitle(selected.form, locale)}`;
  }, [selected, t, locale]);

  return (
    <div className="flex h-full flex-col">
      {/* builder ribbon — the two top-level owner actions */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-background/70 px-3 py-1.5 backdrop-blur-sm">
        <Button type="button" size="sm" variant="outline" onClick={() => setMenuDialog({ open: true, parent: null })}>
          <Plus className="h-4 w-4" /> {t("dfb.addMainIcon")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setQueryDialogOpen(true)}>
          <Sigma className="h-4 w-4" /> {t("dfb.manageQueries")}
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <SimpleTreeForm
          treeTitle={t("dfb.treeTitle")}
          treeEmptyText={loaded && tree.length === 0 ? t("dfb.emptyTree") : t("common.loading")}
          nodes={nodes}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node?.id ?? null)}
          icon={<Wrench className="h-3.5 w-3.5" aria-hidden />}
          fields={fields}
          onFieldChange={onFieldChange}
          detailTitleOverride={detailTitleOverride}
          detailExtra={detailExtra}
          onSave={onSaveAction}
          canSave={Boolean(selected) && dirty}
          onDelete={async () => {
            if (!selected) return;
            if (selected.kind === "menu") {
              if (selected.menu.isSystem) {
                toast.info(t("dfb.systemEntryToast"));
                return;
              }
              setConfirmDelete({ open: true, kind: "menu", id: selected.menu.id, title: selected.menu.title });
            } else {
              if (selected.form.isSystem) {
                toast.info(t("dfb.systemEntryToast"));
                return;
              }
              setConfirmDelete({ open: true, kind: "form", id: selected.form.id, title: selected.form.title });
            }
          }}
          canDelete={Boolean(selected)}
          onClose={closeThisWindow}
          onHeaderClose={closeThisWindow}
          onHeaderMinimize={chrome?.onMinimize}
          onHeaderMaximize={chrome?.onToggleMaximize}
          headerMaximized={headerMaximized}
          onHeaderDragStart={chrome?.onDragStart}
          onHeaderDragMove={chrome?.onDragMove}
          onHeaderDragEnd={chrome?.onDragEnd}
          onHeaderDoubleClick={chrome?.onDoubleClick}
          onHelp={() => { toast.info(t("dfb.builderNote")); }}
          onAddBranch={onAddBranch}
          canAddBranch={canAddBranch}
          onDeleteBranch={onDeleteBranch}
          canDeleteBranch={canDeleteBranch}
          addBranchLabel={t("dfb.addSubMenu")}
        />
      </div>

      {/* dialogs */}
      <DfbMenuDialog
        open={menuDialog.open}
        onOpenChange={(v) => setMenuDialog((s) => ({ ...s, open: v }))}
        parent={menuDialog.parent}
        onSaved={reload}
      />
      {wizard.parent && (
        <DfbFormWizard
          open={wizard.open}
          onOpenChange={(v) => setWizard((s) => ({ ...s, open: v }))}
          parentMenu={wizard.parent}
          onSaved={(formId) => {
            reload();
            setSelectedId(`f${formId}`);
            /* Task 47 — the design studio opens right after the basic info */
            useDesktop.getState().openWindow("dfb-studio", String(formId));
          }}
        />
      )}
      <DfbQueryDialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen} onSaved={reload} />
      {confirmDelete && (
        <ConfirmDeleteDialog
          open={confirmDelete.open}
          onOpenChange={(v) => setConfirmDelete((s) => (s ? { ...s, open: v } : s))}
          body={`${t("dfb.confirmDeleteBody")} «${confirmDelete.title}»`}
          onConfirm={doDelete}
        />
      )}
    </div>
  );
}

/**
 * FormDetailPanel — fetches the full definition of the selected form and
 * renders its actions (add field / open / delete) + the fields overview.
 * Keyed by form id: switching forms remounts this panel, so the fetch
 * effect never needs synchronous resets.
 */
function FormDetailPanel({
  form, onDeleted,
}: {
  form: DfbFormSummary;
  onDeleted: () => void;
}) {
  const t = useT();
  const [detail, setDetail] = React.useState<DfbFormDetail | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetchFormDetail(form.id)
      .then((d) => {
        if (alive) setDetail(d);
      })
      .catch(() => {
        if (alive) setDetail(null);
      });
    return () => {
      alive = false;
    };
  }, [form.id]);

  return (
    <div className="grid gap-2 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        {!form.isSystem && (
          <Button
            type="button" size="sm" variant="outline"
            onClick={() => useDesktop.getState().openWindow("dfb-studio", String(form.id))}
          >
            <Palette className="h-4 w-4" /> {t("dfb.studio.open")}
          </Button>
        )}
        {!form.isSystem && (
          <Button
            type="button" size="sm" variant="outline"
            onClick={() => useDesktop.getState().openWindow("dfb-form", String(form.id))}
          >
            <ListTree className="h-4 w-4" /> {t("dfb.openForm")}
          </Button>
        )}
        {/* Task 64 — the form's master list (فهرست کلّی) — MainDataGrid */}
        <Button
          type="button" size="sm" variant="outline"
          onClick={() => useDesktop.getState().openWindow("dfb-list", String(form.id))}
        >
          <Table2 className="h-4 w-4" /> {t("dfb.list.open")}
        </Button>
        {!form.isSystem && (
          <Button
            type="button" size="sm" variant="outline" className="text-rose-600 hover:text-rose-700"
            onClick={async () => {
              try {
                await dfbApi.del(`forms/${form.id}`);
                toast.success(t("abar.deletedToast"));
                onDeleted();
              } catch {
                toast.error(t("common.error"));
              }
            }}
          >
            {t("common.delete")}
          </Button>
        )}
        {form.isSystem && <Badge variant="secondary" className="text-[10px]">{t("dfb.systemForm")}</Badge>}
      </div>
      {detail ? <DfbFieldsOverview fields={detail.fields} /> : null}
    </div>
  );
}
