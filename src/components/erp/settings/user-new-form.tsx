"use client";

import * as React from "react";
import {
  AlignJustify,
  CheckSquare,
  CircleHelp,
  Copy,
  FileMinus2,
  FilePlus2,
  Languages,
  LogOut,
  Printer,
  RotateCcw,
  Save,
  SaveAll,
  Square,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useDfb, type DfbMenuNode } from "@/stores/dfb-store";
import { useOrgScope } from "@/stores/org-context-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import { SimpleTreeForm, type SimpleTreeFormNode } from "@/components/forms/simple-tree-form";
import type { SimpleFormField } from "@/components/forms/simple-form-two-row-tabbed";
import type { BsNode, BsListResponse } from "@/types/business-structure";
import { cn } from "@/lib/utils";

/**
 * UserNewForm — Task 126 (درخواست مالک): فرم «کاربر جدید» در تنظیمات ←
 * مدیریت کاربران، ساخته‌شده روی پوستهٔ SimpleTreeForm.
 *
 * پنل درخت = «درختوارهٔ دسترسی‌ها»: همهٔ منوها ← زیرمنوها ← فرم‌های هر
 * زیرمنو ← «تمامی» آیکون‌های اکشن بارِ هر فرم؛ کلیک روی هر شاخه/آیکون
 * دسترسی را فعال/غیرفعال می‌کند (کل زیرمجموعهٔ گره هم‌راه آن می‌چرخد) و
 * دکمهٔ «دسترسی به همه» در سرستونِ درخت همه را یکجا به کاربر می‌دهد.
 *
 * پنل جزئیات = فیلدهای مالک:
 *   ۱. نام و نام خانوادگی — «کامپوننت لیست» با ستون‌های نام/نام خانوادگی
 *      از فرم تعریف طرف حساب (انتخاب یک گزینه)؛
 *   ۲. نام کاربری — اجباری، بیشتر از ۵ نویسه؛
 *   ۳. کلمه عبور — با دکمهٔ مشاهده؛ ۴. تکرار کلمه عبور — با دکمهٔ مشاهده؛
 *   ۵. نقش کاربری — «کامپوننت لیست» نقش‌های کاربری (کد/عنوان).
 *
 * قاعدهٔ سازمانی مالک (Task 126): «این فرم به ازای هر شرکت و هلدینگ می‌باشد»
 * ⇒ ثبت ⇒ دفتر مرکزی + یک ردیف برای «هر» شاخهٔ فعال هلدینگ/شرکتِ بدون تیکِ
 * «استفاده از داده‌های مشترک دفتر مرکزی»؛ شاخهٔ دارای تیک = کاربران مشترک
 * (ردیف مجزا نمی‌گیرد — قرارداد baseDataScopeWhere). منطق در سرور است؛
 * پاسخ ثبت = ردیف اصلی (دفتر مرکزی).
 */

interface UserDto {
  id: number;
  partyRef: number | null;
  fullName: string;
  username: string;
  userRoleRef: number;
  roleCode: string;
  roleTitle: string;
  isActive: boolean;
  accesses: Array<{ nodeType: string; refKey: string }>;
  version: number;
  businessStructureRef: number;
}

interface PartyLite {
  id: number;
  name: string;
  lastName: string;
}

interface RoleLite {
  id: number;
  code: string;
  title: string;
}

interface FormValues {
  partyRef: number | null;
  fullName: string;
  username: string;
  password: string;
  password2: string;
  roleRef: number | null;
  roleTitle: string;
}

const BLANK: FormValues = {
  partyRef: null,
  fullName: "",
  username: "",
  password: "",
  password2: "",
  roleRef: null,
  roleTitle: "",
};

/** آیکون‌های اکشن بار هر فرم — عین ACTION_BAR_KEYS + ترجمه/راهنما (Task 28). */
const ACTION_ITEMS: Array<{ key: string; labelKey: string; Icon: LucideIcon }> = [
  { key: "reset", labelKey: "abar.reset", Icon: RotateCcw },
  { key: "save", labelKey: "abar.save", Icon: Save },
  { key: "saveNew", labelKey: "abar.saveNew", Icon: FilePlus2 },
  { key: "saveClose", labelKey: "abar.saveClose", Icon: SaveAll },
  { key: "copy", labelKey: "abar.copy", Icon: Copy },
  { key: "delete", labelKey: "abar.delete", Icon: Trash2 },
  { key: "deleteNew", labelKey: "abar.deleteNew", Icon: FileMinus2 },
  { key: "deleteClose", labelKey: "abar.deleteClose", Icon: LogOut },
  { key: "print", labelKey: "abar.print", Icon: Printer },
  { key: "list", labelKey: "abar.list", Icon: AlignJustify },
  { key: "translate", labelKey: "dfb.list.translate", Icon: Languages },
  { key: "help", labelKey: "sft.help", Icon: CircleHelp },
];

/**
 * Task 127 — تیک «فعال» روی هر گرهٔ درخت دسترسی (درخواست مالک):
 * چک‌باکس واقعی با برچسب «فعال» در انتهای سطر؛ پیش‌فرضِ فرم = همه فعال.
 * کلیک روی خودِ تیک فقط همین تیک را می‌چرخاند (توقف انتشار — بدون چرخشِ
 * دوباره از سطر والد)؛ کلیک روی سطر همچنان کل زیرمجموعه را می‌چرخاند.
 */
function ActiveTick({
  granted,
  label,
  onToggle,
}: {
  granted: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={granted}
      title={label}
      data-access-tick={granted ? "on" : "off"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn(
        "flex h-5 shrink-0 cursor-pointer items-center gap-1 rounded-md border px-1.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        granted
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted/40 text-muted-foreground/80",
      )}
    >
      {granted ? (
        <CheckSquare className="h-3 w-3" aria-hidden />
      ) : (
        <Square className="h-3 w-3" aria-hidden />
      )}
      <span>{label}</span>
    </button>
  );
}

/** گره + همهٔ زیرمجموعه‌هایش — برای چرخش کلیک (فعال/غیرفعال دسته‌جمعی). */
function collectIds(node: SimpleTreeFormNode): string[] {
  const out = [node.id];
  for (const c of node.children ?? []) out.push(...collectIds(c));
  return out;
}

/**
 * تبدیل درخت dfb (منو ← زیرمنو ← فرم) به گره‌های درخت دسترسی — Task 127:
 * هر گره یک تیک «فعال» در انتهای سطر دارد (نشانگرِ شروع فقط شکلِ خنثی است)؛
 * کلیک روی سطر یا تیک، دسترسی همان شاخه و کل زیرمجموعه‌اش را می‌چرخاند.
 */
function buildAccessTree(
  menus: DfbMenuNode[],
  locale: string,
  t: (k: never) => string,
  granted: (id: string) => boolean,
  toggle: (node: SimpleTreeFormNode) => void,
  tickLabel: string,
): SimpleTreeFormNode[] {
  const labelOf = (title: string, titleEn: string | null) =>
    locale === "fa" || !titleEn ? title : titleEn;
  const walk = (list: DfbMenuNode[]): SimpleTreeFormNode[] =>
    list.map((m) => {
      const prefix = m.nodeType === 1 ? "m:" : "s:";
      const id = `${prefix}${m.id}`;
      const formNodes: SimpleTreeFormNode[] = (m.forms ?? []).map((f) => {
        const fid = `f:${f.id}`;
        const formNode: SimpleTreeFormNode = {
          id: fid,
          label: labelOf(f.title, f.titleEn),
          children: ACTION_ITEMS.map((a) => {
            const aid = `a:${f.id}:${a.key}`;
            const actionNode: SimpleTreeFormNode = {
              id: aid,
              label: t(a.labelKey as never),
            };
            actionNode.endAdornment = (
              <ActiveTick
                granted={granted(aid)}
                label={tickLabel}
                onToggle={() => toggle(actionNode)}
              />
            );
            return actionNode;
          }),
        };
        formNode.endAdornment = (
          <ActiveTick granted={granted(fid)} label={tickLabel} onToggle={() => toggle(formNode)} />
        );
        return formNode;
      });
      const menuNode: SimpleTreeFormNode = {
        id,
        label: labelOf(m.title, m.titleEn),
        icon: "folder",
        children: [...walk(m.children ?? []), ...formNodes],
      };
      menuNode.endAdornment = (
        <ActiveTick granted={granted(id)} label={tickLabel} onToggle={() => toggle(menuNode)} />
      );
      return menuNode;
    });
  return walk(menus);
}

/** Set دسترسی → ردیف‌های API (NodeType/RefKey قرارداد UserAccess). */
function accessToRows(set: Set<string>): Array<{ nodeType: string; refKey: string }> {
  const rows: Array<{ nodeType: string; refKey: string }> = [];
  for (const id of set) {
    if (id.startsWith("m:")) rows.push({ nodeType: "menu", refKey: id.slice(2) });
    else if (id.startsWith("s:")) rows.push({ nodeType: "submenu", refKey: id.slice(2) });
    else if (id.startsWith("f:")) rows.push({ nodeType: "form", refKey: id.slice(2) });
    else if (id.startsWith("a:")) rows.push({ nodeType: "action", refKey: id.slice(2) });
  }
  return rows;
}

/** ردیف‌های API → Set دسترسی (بازکردن رکورد ذخیره‌شده). */
function rowsToAccess(rows: UserDto["accesses"]): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.nodeType === "menu") set.add(`m:${r.refKey}`);
    else if (r.nodeType === "submenu") set.add(`s:${r.refKey}`);
    else if (r.nodeType === "form") set.add(`f:${r.refKey}`);
    else if (r.nodeType === "action") set.add(`a:${r.refKey}`);
  }
  return set;
}

export function UserNewForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "settings")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<UserDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [parties, setParties] = React.useState<PartyLite[]>([]);
  const [partiesLoading, setPartiesLoading] = React.useState(true);
  const [roles, setRoles] = React.useState<RoleLite[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [bsTitleById, setBsTitleById] = React.useState<Map<number, string>>(new Map());
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  const [accessSet, setAccessSet] = React.useState<Set<string>>(new Set());
  /* Task 82 — unsaved-data flag of the tab */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  /* درختوارهٔ فرمساز (منو ← زیرمنو ← فرم) — منبع درخت دسترسی */
  const dfbTree = useDfb((s) => s.tree);
  const dfbLoadIfStale = useDfb((s) => s.loadIfStale);
  React.useEffect(() => {
    dfbLoadIfStale().catch(() => {
      /* درخت خالی می‌ماند — پنل دسترسی با پیام خالی رندر می‌شود */
    });
  }, [dfbLoadIfStale]);

  /* محدودهٔ سازمانی — قرارداد خواندن Task 122 (structureId + headOfficeShares) */
  const { scope, loaded: orgLoaded } = useOrgScope();

  const fetchRecords = React.useCallback(async (): Promise<UserDto[]> => {
    if (!orgLoaded || scope.businessStructureRef == null) return [];
    const qs = new URLSearchParams();
    qs.set("structureId", String(scope.businessStructureRef));
    qs.set("headOfficeShares", scope.shared ? "true" : "false");
    const res = await api.get<{ items?: UserDto[] }>(`user?${qs.toString()}`);
    return res.items ?? [];
  }, [orgLoaded, scope.businessStructureRef, scope.shared]);

  const applyRecords = React.useCallback((rows: UserDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  /* طرف حساب‌ها — ستون‌های نام/نام خانوادگی از فرم تعریف طرف حساب */
  React.useEffect(() => {
    let alive = true;
    api
      .get<{ items?: Array<{ id: number; name: string; lastName?: string }> }>("party")
      .then((res) => {
        if (!alive) return;
        setParties(
          (res.items ?? []).map((p) => ({
            id: Number(p.id),
            name: String(p.name ?? ""),
            lastName: String(p.lastName ?? ""),
          })),
        );
        setPartiesLoading(false);
      })
      .catch(() => {
        if (alive) setPartiesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* نقش‌های کاربری فعال — از فرم «نقش کاربری جدید» (Task 100) */
  React.useEffect(() => {
    let alive = true;
    api
      .get<{ items?: Array<{ id: number; code: string; title: string; isActive: boolean }> }>(
        "user-role",
      )
      .then((res) => {
        if (!alive) return;
        setRoles(
          (res.items ?? [])
            .filter((r) => r.isActive)
            .map((r) => ({ id: Number(r.id), code: String(r.code), title: String(r.title) })),
        );
        setRolesLoading(false);
      })
      .catch(() => {
        if (alive) setRolesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* عناوین گره‌های ساختار — ستون «ساختار سازمانی» فهرست رکوردها */
  React.useEffect(() => {
    let alive = true;
    api
      .get<BsListResponse>("business-structure")
      .then((res) => {
        if (!alive) return;
        const map = new Map<number, string>();
        for (const n of (res.items ?? []) as BsNode[]) map.set(Number(n.id), n.title);
        setBsTitleById(map);
      })
      .catch(() => {
        /* فهرست بدون ستون ساختار می‌ماند */
      });
    return () => {
      alive = false;
    };
  }, []);

  /* Task 127 — پیش‌فرضِ مالک: «بصورت پیش فرض تیک فعال باشد» — اعمالِ پیش‌فرض
     بعد از تعریف allAccessIds (پایین‌تر) انجام می‌شود. */

  const toggleAccess = React.useCallback((node: SimpleTreeFormNode) => {
    setDirty(true); // هر تغییر دسترسی = اطلاعات ذخیره‌نشده
    setAccessSet((prev) => {
      const next = new Set(prev);
      const ids = collectIds(node);
      const willGrant = !prev.has(node.id);
      for (const id of ids) {
        if (willGrant) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  /* Task 127 — آیتم‌های کلیک راست: «همه موارد فعال / همه موارد غیرفعال»
     روی شاخهٔ راست‌کلیک‌شده + کل زیرمجموعه‌اش (تفسیر اعلامی §0.6؛ دکمهٔ
     «دسترسی به همه» سرستون همچنان کل درخت را پوشش می‌دهد). */
  const activateAllFrom = React.useCallback((node: SimpleTreeFormNode) => {
    setDirty(true);
    setAccessSet((prev) => {
      const next = new Set(prev);
      for (const id of collectIds(node)) next.add(id);
      return next;
    });
  }, []);

  const deactivateAllFrom = React.useCallback((node: SimpleTreeFormNode) => {
    setDirty(true);
    setAccessSet((prev) => {
      const next = new Set(prev);
      for (const id of collectIds(node)) next.delete(id);
      return next;
    });
  }, []);

  /* درخت دسترسی — با تغییر زبان/وضعیت دسترسی بازمشق می‌شود */
  const treeNodes = React.useMemo<SimpleTreeFormNode[]>(
    () =>
      buildAccessTree(
        dfbTree,
        locale,
        t as unknown as (k: never) => string,
        (id) => accessSet.has(id),
        toggleAccess,
        t("un.activeTick" as never),
      ),
    [dfbTree, locale, t, accessSet, toggleAccess],
  );

  /* شناسه‌های دسترسی، مستقیم از درخت dfb — مستقل از زبان/وضعیت تیک‌ها
     (بازمشقِ تیک‌ها نباید این فهرست را عوض کند وگرنه پیش‌فرضِ فعال
     روی هر کلیک دوباره اعمال می‌شد). */
  const allAccessIds = React.useMemo(() => {
    const out: string[] = [];
    const walk = (list: DfbMenuNode[]) => {
      for (const m of list) {
        out.push(`${m.nodeType === 1 ? "m:" : "s:"}${m.id}`);
        walk(m.children ?? []);
        for (const f of m.forms ?? []) {
          out.push(`f:${f.id}`);
          for (const a of ACTION_ITEMS) out.push(`a:${f.id}:${a.key}`);
        }
      }
    };
    walk(dfbTree);
    return out;
  }, [dfbTree]);

  /* Task 127 — پیش‌فرضِ مالک: «بصورت پیش فرض تیک فعال باشد» ⇒ با اولین
     رسیدن درخت (و بعد از هر «فرم خالی»)، همهٔ گره‌ها فعال‌اند. یک‌بار
     اعمال می‌شود تا چرخش‌های دستی کاربر بی‌جهت بازنویسی نشود؛ بازکردن
     رکورد ذخیره‌شده (currentId) هم از این پیش‌فرض مستثناست. */
  const defaultAppliedRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (defaultAppliedRef.current || currentId != null || allAccessIds.length === 0) return;
    defaultAppliedRef.current = true;
    setAccessSet(new Set(allAccessIds));
  }, [allAccessIds, currentId]);

  const grantAll = React.useCallback(() => {
    setDirty(true);
    setAccessSet(new Set(allAccessIds));
    toast.success(t("un.grantAllToast"));
  }, [allAccessIds, t]);

  const applyRecord = React.useCallback((r: UserDto) => {
    setCurrentId(r.id);
    setDirty(false); // رکورد ذخیره‌شده باز شد
    setValues({
      partyRef: r.partyRef,
      fullName: r.fullName,
      username: r.username,
      password: "", // هش هرگز به مرورگر نمی‌آید — خالی = بدون تغییر
      password2: "",
      roleRef: r.userRoleRef,
      roleTitle: r.roleTitle || r.roleCode,
    });
    setAccessSet(rowsToAccess(r.accesses));
  }, []);

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    /* Task 127 — پیش‌فرض مالک: فرم تازه = همهٔ تیک‌های فعال */
    setAccessSet(new Set(allAccessIds));
  }, [allAccessIds]);

  const onFieldChange = React.useCallback((id: string, value: string | boolean) => {
    setDirty(true); // هر ویرایش = اطلاعات ذخیره‌نشده
    setValues((v) => ({ ...v, [id]: String(value ?? "") }));
  }, []);

  const pickParty = React.useCallback(
    (item: { id: string }) => {
      const p = parties.find((x) => String(x.id) === item.id);
      if (!p) return;
      setDirty(true);
      setValues((v) => ({
        ...v,
        partyRef: p.id,
        fullName: `${p.name} ${p.lastName}`.trim(),
      }));
    },
    [parties],
  );

  const pickRole = React.useCallback(
    (item: { id: string }) => {
      const r = roles.find((x) => String(x.id) === item.id);
      if (!r) return;
      setDirty(true);
      setValues((v) => ({ ...v, roleRef: r.id, roleTitle: `${r.code} - ${r.title}` }));
    },
    [roles],
  );

  const partyListItems = React.useMemo(
    () =>
      parties.map((p) => ({
        id: String(p.id),
        title: `${p.name} ${p.lastName}`.trim(),
        cells: [
          { label: t("un.colName"), value: p.name },
          { label: t("un.colLastName"), value: p.lastName },
        ],
      })),
    [parties, t],
  );

  const roleListItems = React.useMemo(
    () =>
      roles.map((r) => ({
        id: String(r.id),
        title: `${r.code} - ${r.title}`,
        cells: [
          { label: t("um.roleCode"), value: r.code },
          { label: t("um.roleTitle"), value: r.title },
        ],
      })),
    [roles, t],
  );

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور برای بازخورد فوری */
  const validate = (): string | null => {
    if (values.partyRef == null || values.fullName.trim() === "") return t("un.errFullNameRequired");
    if (values.username.trim().length <= 5) return t("un.errUsernameRequired");
    if (currentId == null && values.password === "") return t("un.errPasswordRequired");
    if (values.password !== "" && values.password !== values.password2)
      return t("un.errPasswordMismatch");
    if (values.roleRef == null) return t("un.errRoleRequired");
    return null;
  };

  /* ذخیره: ثبت جدید (POST — قاعدهٔ چندشرکتی سرور) یا ویرایش ردیف جاری (PUT) */
  const doSave = async (): Promise<boolean> => {
    const err = validate();
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      partyRef: values.partyRef ?? undefined,
      fullName: values.fullName.trim(),
      username: values.username.trim(),
      /* ویرایش با کلمهٔ عبور خالی = بدون تغییر (سرور هم همین قرارداد را دارد) */
      ...(values.password !== "" ? { password: values.password } : {}),
      userRoleRef: values.roleRef,
      accesses: accessToRows(accessSet),
    };
    try {
      const res =
        currentId == null
          ? await api.post<UserDto>("user", body)
          : await api.put<UserDto>(`user/${currentId}`, body);
      toast.success(
        currentId == null
          ? t("un.createdScopeToast")
          : t("abar.savedToast"),
      );
      const rows = await fetchRecords().catch(() => [] as UserDto[]);
      applyRecords(rows);
      applyRecord(res);
      return true;
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
      return false;
    }
  };

  const doDelete = async (): Promise<void> => {
    if (currentId == null) {
      toast.info(t("dfb.noRecordSelected"));
      return;
    }
    try {
      await api.del(`user/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as UserDto[]);
      applyRecords(rows);
      newRecord();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ناوبری رکوردها از فهرست «لیست» نوار عملیات — SimpleTreeForm ناوبری
     «|< < > >|» ندارد (قرارداد TwoRowTabbed)؛ بازکردن با onOpenListItem */

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      {
        id: "fullName",
        label: t("un.fullName"),
        type: "list",
        required: true,
        value: values.fullName,
        placeholder: t("un.fullNamePh"),
        listItems: partyListItems,
        listLoading: partiesLoading,
        onOpenListItem: pickParty,
      },
      {
        id: "username",
        label: t("un.username"),
        required: true,
        value: values.username,
        placeholder: t("un.usernamePh"),
      },
      {
        id: "password",
        label: t("un.password"),
        type: "password",
        required: currentId == null,
        value: values.password,
        placeholder:
          currentId == null ? undefined : t("un.passwordKeepPh"),
      },
      {
        id: "password2",
        label: t("un.passwordRepeat"),
        type: "password",
        required: currentId == null,
        value: values.password2,
      },
      {
        id: "role",
        label: t("un.userRole"),
        type: "list",
        required: true,
        value: values.roleTitle,
        placeholder: t("un.rolePh"),
        listItems: roleListItems,
        listLoading: rolesLoading,
        onOpenListItem: pickRole,
      },
    ],
    [t, values, currentId, partyListItems, roleListItems, partiesLoading, rolesLoading, pickParty, pickRole],
  );

  return (
    <SimpleTreeForm
      treeTitle={t("un.accessTree")}
      treeHeaderExtra={
        <button
          type="button"
          onClick={grantAll}
          disabled={allAccessIds.length === 0}
          className="flex h-6 items-center gap-1 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-2 text-[11px] font-semibold text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <CheckSquare className="h-3 w-3" aria-hidden />
          {t("un.grantAll")}
        </button>
      }
      treeEmptyText={t("un.treeLoading")}
      forceDetail={true}
      detailTitleOverride={t("un.formTitle")}
      badge={t("settings.title")}
      icon={<UserPlus className="h-3.5 w-3.5" aria-hidden />}
      nodes={treeNodes}
      onSelect={(node) => {
        if (node) toggleAccess(node);
      }}
      onActivateAll={activateAllFrom}
      onDeactivateAll={deactivateAllFrom}
      activateAllLabel={t("un.activateAllCtx" as never)}
      deactivateAllLabel={t("un.deactivateAllCtx" as never)}
      selectOnContextMenu={false}
      fields={fields}
      onFieldChange={onFieldChange}
      detailExtra={
        <div className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
          <p>{t("un.treeHint")}</p>
          <p>{t("un.ctxHint")}</p>
        </div>
      }
      onReset={() => {
        /* آیکون + = شروع ثبتِ کاربر جدید: فرم خالی می‌شود */
        newRecord();
        toast.success(t("abar.resetToast"));
      }}
      onSave={async () => {
        await doSave();
      }}
      onSaveNew={async () => {
        if (await doSave()) newRecord();
      }}
      onCopy={() => {
        /* ثبت کاربر جدید با همان مقادیر — شناسه پاک می‌شود تا رکورد نو ساخته شود */
        setCurrentId(null);
        toast.success(t("abar.copyToast"));
      }}
      onDelete={doDelete}
      onDeleteNew={async () => {
        await doDelete();
        newRecord();
      }}
      onPrint={() => {
        toast.success(t("abar.printToast"));
      }}
      onClose={onBack}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: r.fullName,
        subtitle: `${r.username} — ${r.roleTitle || r.roleCode}`,
        cells: [
          { label: t("un.colFullName"), value: r.fullName },
          { label: t("un.colUsername"), value: r.username },
          { label: t("un.colRole"), value: r.roleTitle || r.roleCode },
          {
            label: t("un.colStructure"),
            value: bsTitleById.get(r.businessStructureRef) ?? `#${r.businessStructureRef}`,
          },
        ],
      }))}
      listLoading={listLoading}
      listActiveId={currentId != null ? String(currentId) : null}
      onListRefresh={async () => {
        try {
          applyRecords(await fetchRecords());
        } catch {
          applyRecords([]);
        }
      }}
      onOpenListItem={(item) => {
        const r = records.find((x) => String(x.id) === item.id);
        if (r) {
          applyRecord(r);
          toast.success(t("abar.itemOpened"));
        }
      }}
      onHeaderClose={onBack}
      onHeaderMinimize={chrome?.onMinimize}
      onHeaderMaximize={chrome?.onToggleMaximize}
      headerMaximized={headerMaximized}
      onHeaderDragStart={chrome?.onDragStart}
      onHeaderDragMove={chrome?.onDragMove}
      onHeaderDragEnd={chrome?.onDragEnd}
      onHeaderDoubleClick={chrome?.onDoubleClick}
    />
  );
}
