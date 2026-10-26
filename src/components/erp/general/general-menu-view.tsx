"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Boxes,
  CalendarPlus,
  ChevronsDownUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Coins,
  Columns2,
  Earth,
  FolderOpen,
  LayoutGrid,
  List,
  UserRoundPlus,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings, useT } from "@/stores/settings-store";
import type { GeneralSubPage } from "@/stores/general-nav-store";
import { DfbAppFormsSection } from "@/components/erp/form-builder/dfb-app-forms";

/**
 * GeneralMenuHome — Task 117 (درخواست مالک): بدنهٔ «home» پنجرهٔ عمومی با
 * «حالت‌های نمایش زیرمنو». مالک: «توی منوی عمومی، زیرمنوها را بتوان به چند شکل
 * به کاربر نمایش بدهید مثلاً بصورت کشویی، یا بصورت کنار هم یا بصورت لیست …
 * دکمه‌ها کنار منو قرار داشته باشد و کاربر هر کدام را انتخاب کرد نحوهٔ نمایش
 * زیرمنوها تغییر کند. فقط کاربرپسند باشد و UX/UI را مدنظر قرار دهید.»
 *
 * ۴ مدل نمایش (پیشنهاد تجربهٔ ما + سه نمونهٔ مالک):
 *  ۱) accordion «کشویی» — کارت‌های گروهِ جمع‌شونده (رفتار کلاسیک ERP؛ پیش‌فرض)
 *  ۲) columns  «کنار هم» — گروه‌ها دوستونه هم‌زمان دیده می‌شوند؛ بدون جمع‌شدن
 *  ۳) list     «لیستی» — یک فهرست فشردهٔ تک‌کارت با سرگروه‌های کوچک (اسکن سریع)
 *  ۴) tiles    «کاشی» — کاشی‌های آیکونیِ شبکه‌ای (الگوی سنجاق‌شدهٔ وین ۱۱؛ لمسی)
 *
 * سوییچر حالت در نوار عنوانِ پنجره و «کنار منو» است؛ انتخاب کاربر در
 * localStorage ماندگار می‌شود (hydration-safe: رندر اولیه همیشه accordion).
 * تک‌منبع داده (MENU_GROUPS) ⇒ هر ۴ چیدمان از یک مدل رندر می‌شوند و افزودن
 * فرم/گروه جدید فقط یک مدخل است (قرارداد پنجره‌های اعلامی Task 75).
 */

type MenuView = "accordion" | "columns" | "list" | "tiles";

const MENU_VIEW_STORAGE_KEY = "general.menuView";

const MENU_VIEW_ORDER: readonly MenuView[] = ["accordion", "columns", "list", "tiles"];

const MENU_VIEW_ICON: Record<MenuView, LucideIcon> = {
  accordion: ChevronsDownUp,
  columns: Columns2,
  list: List,
  tiles: LayoutGrid,
};

const MENU_VIEW_TITLE_KEY: Record<MenuView, string> = {
  accordion: "menuView.accordion",
  columns: "menuView.columns",
  list: "menuView.list",
  tiles: "menuView.tiles",
};

/** استور خارجی کوچک حالت نمایش — localStorage + شنونده‌ها (useSyncExternalStore) */
const menuViewStore = {
  listeners: new Set<() => void>(),
  subscribe(fn: () => void): () => void {
    menuViewStore.listeners.add(fn);
    return () => {
      menuViewStore.listeners.delete(fn);
    };
  },
  read(): MenuView {
    try {
      const saved = window.localStorage.getItem(MENU_VIEW_STORAGE_KEY);
      if (saved && (MENU_VIEW_ORDER as readonly string[]).includes(saved)) {
        return saved as MenuView;
      }
    } catch {
      /* localStorage در دسترس نیست — پیش‌فرض */
    }
    return "accordion";
  },
  write(v: MenuView): void {
    try {
      window.localStorage.setItem(MENU_VIEW_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
    for (const fn of menuViewStore.listeners) fn();
  },
};

/** یک فرم قابل بازکردن در زیرمنو */
interface MenuItemDef {
  page: Exclude<GeneralSubPage, "home">;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  gradient: string;
}

/** یک زیرمنو (گروه) منوی عمومی */
interface MenuGroupDef {
  id: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  gradient: string;
  items: MenuItemDef[];
}

/** تک‌منبع دادهٔ منوی عمومی — هر ۴ حالت نمایش از همین مدل رندر می‌شوند */
const MENU_GROUPS: MenuGroupDef[] = [
  {
    id: "basicInfo",
    titleKey: "fy.menuBasicInfo",
    descKey: "fy.menuBasicInfoDesc",
    icon: FolderOpen,
    gradient: "from-amber-500 to-orange-600",
    items: [
      {
        page: "fiscal-year",
        titleKey: "fy.formTitle",
        descKey: "fy.formDesc",
        icon: CalendarPlus,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        page: "party",
        titleKey: "party.formTitle",
        descKey: "party.formDesc",
        icon: UserRoundPlus,
        gradient: "from-sky-500 to-cyan-600",
      },
      {
        page: "geo-location",
        titleKey: "geo.formTitle",
        descKey: "geo.formDesc",
        icon: Earth,
        gradient: "from-teal-500 to-emerald-600",
      },
      {
        page: "currency-type",
        titleKey: "currency.formTitle",
        descKey: "currency.formDesc",
        icon: Coins,
        gradient: "from-amber-500 to-yellow-600",
      },
    ],
  },
  {
    id: "operations",
    titleKey: "rate.menuGroup",
    descKey: "rate.menuGroupDesc",
    icon: Workflow,
    gradient: "from-rose-500 to-red-600",
    items: [
      {
        page: "exchange-rate",
        titleKey: "rate.formTitle",
        descKey: "rate.formDesc",
        icon: ArrowLeftRight,
        gradient: "from-teal-500 to-emerald-600",
      },
    ],
  },
];

/** سوییچر «کنار منو» — segmented control با ۴ دکمهٔ حالت نمایش */
function MenuViewSwitcher({
  view,
  onChange,
}: {
  view: MenuView;
  onChange: (v: MenuView) => void;
}) {
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t("menuView.label")}
      className="flex shrink-0 items-center gap-1 rounded-xl border border-border/70 bg-background/70 p-1 shadow-sm"
    >
      <span className="me-1 hidden select-none text-[11px] font-medium text-muted-foreground sm:inline">
        {t("menuView.label")}
      </span>
      {MENU_VIEW_ORDER.map((v) => {
        const Icon = MENU_VIEW_ICON[v];
        const active = view === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={active}
            title={t(MENU_VIEW_TITLE_KEY[v] as never)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="sr-only">{t(MENU_VIEW_TITLE_KEY[v] as never)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** سرگروه مشترک (کشویی/کنار‌هم) */
function GroupHeader({
  group,
  open,
  onToggle,
  collapsible,
}: {
  group: MenuGroupDef;
  open: boolean;
  onToggle?: () => void;
  collapsible?: boolean;
}) {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const Icon = group.icon;
  const header = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
          group.gradient,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{t(group.titleKey as never)}</span>
        <span className="block text-xs text-muted-foreground">{t(group.descKey as never)}</span>
      </span>
      {collapsible && (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            !open && (dir === "rtl" ? "rotate-90" : "-rotate-90"),
          )}
          aria-hidden
        />
      )}
    </>
  );

  if (collapsible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring cursor-pointer"
      >
        {header}
      </button>
    );
  }
  return (
    <div className="flex w-full items-center gap-3 p-4 text-start">
      {header}
    </div>
  );
}

/** سطر فرم مشترک — full (کشویی/کنارهم با توضیح) یا compact (لیستی تک‌خطی) */
function MenuRow({
  item,
  onClick,
  compact,
}: {
  item: MenuItemDef;
  onClick: () => void;
  compact?: boolean;
}) {
  const t = useT();
  const dir = useSettings((s) => s.dir());
  const Icon = item.icon;
  const ForwardIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      title={compact ? t(item.descKey as never) : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        compact ? "p-2" : "p-3 pe-6",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
          item.gradient,
          compact ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-medium", compact ? "text-[13px]" : "text-sm")}>
          {t(item.titleKey as never)}
        </span>
        {!compact && (
          <span className="block text-xs text-muted-foreground">{t(item.descKey as never)}</span>
        )}
      </span>
      <ForwardIcon
        className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:text-foreground"
        aria-hidden
      />
    </button>
  );
}

/** placeholder «فرم‌های بعدی به‌مرور اعلان می‌شوند» در همهٔ حالت‌ها */
function PendingNote({ asTile }: { asTile?: boolean }) {
  const t = useT();
  if (asTile) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border/80 p-3 text-center">
        <span className="text-xs leading-relaxed text-muted-foreground/80">
          {t("fy.menuPending")}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/80 px-3 py-2.5">
      <span className="text-xs leading-relaxed text-muted-foreground/80">{t("fy.menuPending")}</span>
    </div>
  );
}

export function GeneralMenuHome({ go }: { go: (p: GeneralSubPage) => void }) {
  const t = useT();

  /* Task 117 — حالت نمایش انتخابی کاربر: استور خارجی کوچک روی localStorage
     خوانده می‌شود با useSyncExternalStore (الگوی رسمی React؛ هم hydration-safe
     است — رندر سروری/آبی «accordion» — هم بدون setState-in-effect). */
  const view = React.useSyncExternalStore(
    menuViewStore.subscribe,
    menuViewStore.read,
    () => "accordion" as MenuView,
  );
  const changeView = React.useCallback((v: MenuView) => menuViewStore.write(v), []);

  /* وضعیت باز/بستهٔ گروه‌ها — فقط در حالت «کشویی» معنا دارد */
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    basicInfo: true,
    operations: true,
  });
  const toggleGroup = React.useCallback(
    (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  const openPage = React.useCallback((p: GeneralSubPage) => go(p), [go]);

  return (
    <div className="h-full overflow-y-auto scrollbar-slim">
      {/* window header + سوییچر «کنار منو» (Task 117) */}
      <div className="border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md">
              <Boxes className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold">{t("app.general")}</h2>
              <p className="truncate text-xs text-muted-foreground">{t("app.name")}</p>
            </div>
          </div>
          <MenuViewSwitcher view={view} onChange={changeView} />
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-4 p-4" dir="auto">
        {/* Task 111/113 — فقط فرم‌های ساختهٔ کاربر در فرمساز؛ فرم‌های سیستمی
            بدنهٔ بومی خودشان را دارند (بدون دوبل). */}
        <DfbAppFormsSection appKey="general" hideSystem />

        {/* بدنهٔ منو — با هر تغییر حالت، fade-in ملایم (کارتیف UX) */}
        <div key={view} className="fade-in space-y-4">
          {/* ─── حالت ۱: کشویی (رفتار کلاسیک) ─── */}
          {view === "accordion" &&
            MENU_GROUPS.map((group) => {
              const open = openGroups[group.id] ?? false;
              return (
                <section
                  key={group.id}
                  className="overflow-hidden rounded-xl border border-border/70 bg-card/60"
                >
                  <GroupHeader
                    group={group}
                    open={open}
                    onToggle={() => toggleGroup(group.id)}
                    collapsible
                  />
                  {open && (
                    <div className="space-y-1 border-t border-border/60 p-2">
                      {group.items.map((item) => (
                        <MenuRow key={item.page} item={item} onClick={() => openPage(item.page)} />
                      ))}
                      <PendingNote />
                    </div>
                  )}
                </section>
              );
            })}

          {/* ─── حالت ۲: کنار هم (دوستونه، همه‌چیز هم‌زمان دیده می‌شود) ─── */}
          {view === "columns" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {MENU_GROUPS.map((group) => (
                <section
                  key={group.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60"
                >
                  <GroupHeader group={group} open />
                  <div className="flex-1 space-y-1 border-t border-border/60 p-2">
                    {group.items.map((item) => (
                      <MenuRow key={item.page} item={item} onClick={() => openPage(item.page)} />
                    ))}
                    <PendingNote />
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* ─── حالت ۳: لیستی (یک فهرست فشرده با سرگروه کوچک) ─── */}
          {view === "list" && (
            <section className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card/60">
              {MENU_GROUPS.map((group) => (
                <div key={group.id} className="p-2">
                  <div className="flex items-center gap-2 px-2 pb-1.5 pt-1.5">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white",
                        group.gradient,
                      )}
                    >
                      <group.icon className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t(group.titleKey as never)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <MenuRow
                        key={item.page}
                        item={item}
                        compact
                        onClick={() => openPage(item.page)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ─── حالت ۴: کاشی (شبکهٔ آیکونی، الگوی وین ۱۱) ─── */}
          {view === "tiles" && (
            <div className="space-y-4">
              {MENU_GROUPS.map((group) => (
                <section key={group.id}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                        group.gradient,
                      )}
                    >
                      <group.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold">{t(group.titleKey as never)}</span>
                    <span className="text-xs text-muted-foreground">{t(group.descKey as never)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.page}
                          type="button"
                          onClick={() => openPage(item.page)}
                          title={t(item.descKey as never)}
                          className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/60 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-border hover:bg-accent/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
                              item.gradient,
                            )}
                          >
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <span className="line-clamp-2 text-xs font-medium leading-5">
                            {t(item.titleKey as never)}
                          </span>
                        </button>
                      );
                    })}
                    <PendingNote asTile />
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
