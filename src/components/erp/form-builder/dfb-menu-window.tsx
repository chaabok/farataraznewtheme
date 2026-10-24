"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, FileText, Folder } from "lucide-react";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDfb, findMenuNode, type DfbFormSummary, type DfbMenuNode } from "@/stores/dfb-store";
import { DfbGlyph } from "./dfb-dialogs";

/**
 * DfbMenuWindow (Task 45) — the desktop window of a USER-CREATED main icon:
 * navigates its submenus (tiles) and lists its forms; clicking a form opens
 * the form runtime window. Light title bar (hosted by AppWindow).
 */
export function DfbMenuWindow({ menuId }: { menuId: number }) {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const tree = useDfb((s) => s.tree);
  const loaded = useDfb((s) => s.loaded);
  const load = useDfb((s) => s.load);
  const openWindow = useDesktop((s) => s.openWindow);

  React.useEffect(() => {
    void load();
  }, [load]);

  const [path, setPath] = React.useState<number[]>([]);

  const root = React.useMemo(() => findMenuNode(tree, menuId), [tree, menuId]);
  const current = React.useMemo(() => {
    if (!root) return null;
    let node: DfbMenuNode = root;
    for (const id of path) {
      const next = node.children.find((c) => c.id === id);
      if (!next) break;
      node = next;
    }
    return node;
  }, [root, path]);

  const openForm = React.useCallback(
    (form: DfbFormSummary) => openWindow("dfb-form", String(form.id)),
    [openWindow],
  );

  if (!loaded) {
    return <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }
  if (!root) {
    return <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">{t("dfb.menuNotFound")}</div>;
  }

  const submenus = current?.children ?? [];
  const forms = current?.forms ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* breadcrumb path for nested submenus */}
      {path.length > 0 && (
        <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-foreground/5"
            onClick={() => setPath([])}
          >
            <DfbGlyph iconKey={root.iconKey} className="h-4 w-4 rounded" iconClass="h-2.5 w-2.5" />
            {root.title}
          </button>
          {path.map((pid, i) => {
            const node = (() => {
              let n: DfbMenuNode = root;
              for (const id of path.slice(0, i + 1)) {
                const nx = n.children.find((c) => c.id === id);
                if (!nx) return n;
                n = nx;
              }
              return n;
            })();
            return (
              <span key={pid} className="flex items-center gap-1">
                {dir === "rtl" ? <ChevronLeft className="h-3 w-3" aria-hidden /> : <ChevronRight className="h-3 w-3" aria-hidden />}
                <button
                  type="button"
                  className="rounded-md px-1.5 py-0.5 hover:bg-foreground/5"
                  onClick={() => setPath(path.slice(0, i + 1))}
                >
                  {node.title}
                </button>
              </span>
            );
          })}
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 p-4 sm:p-5">
          {submenus.length > 0 && (
            <section aria-label={t("dfb.submenusSection")}>
              <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{t("dfb.submenusSection")}</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {submenus.map((sm) => (
                  <button
                    key={sm.id}
                    type="button"
                    onClick={() => setPath([...path, sm.id])}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 transition-all hover:border-foreground/25 hover:shadow-md"
                  >
                    <DfbGlyph iconKey={sm.iconKey} className="h-10 w-10" iconClass="h-5 w-5" />
                    <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">{sm.title}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section aria-label={t("dfb.formsSection")}>
            <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{t("dfb.formsSection")}</h2>
            {forms.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                {t("dfb.noFormsHere")}
              </p>
            ) : (
              <ul className="grid gap-2">
                {forms.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => openForm(f)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-start transition-all hover:border-foreground/25 hover:shadow-md"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                        <FileText className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{f.title}</span>
                        <span className="block truncate text-[11px] text-muted-foreground" dir="ltr">
                          {f.code}
                        </span>
                      </span>
                      {f.isSystem && <Badge variant="secondary" className="shrink-0 text-[10px]">{t("dfb.systemForm")}</Badge>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {submenus.length === 0 && forms.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 p-8 text-center">
              <Folder className="h-8 w-8 text-muted-foreground/50" aria-hidden />
              <p className="text-xs text-muted-foreground">{t("dfb.emptyMenu")}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
