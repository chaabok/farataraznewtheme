"use client";

import * as React from "react";
import { ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT, useSettings } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty } from "@/components/desktop/app-window";
import { useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";
import type { BsNode, BsListResponse } from "@/types/business-structure";

/**
 * UserRoleForm — Task 100 (درخواست مالک): فرم «نقش کاربری جدید» در پنجرهٔ
 * تنظیمات ← مدیریت کاربران. کاربر نقش‌های سازمان خودش را تعریف می‌کند و
 * «محدودهٔ دسترسی» هر نقش را در تب مخصوص آن تعیین می‌کند.
 *
 * فیلدها:
 *   ۱. کد نقش — اجباری؛ یکتا در ساختار سازمانی (سرور 409 برای تکراری).
 *   ۲. عنوان نقش — اجباری؛ یکتا در ساختار سازمانی.
 *   ۳. توضیحات — اختیاری.   ۴. فعال — چک‌باکس (پیش‌فرض تیک).
 *
 * تب «محدوده دسترسی» — دو بُعد مستقل:
 *   · محدودهٔ نرم‌افزارها: «همهٔ نرم‌افزارها» یا «نرم‌افزارهای برگزیده»
 *     (چک‌باکس هر نرم‌افزار از جدول Systems — عنوان‌ها با کلید دیکشنری،
 *     پس با تعویض زبان نرم‌افزار هم تازه می‌شوند؛ قرارداد Task 99).
 *   · محدودهٔ ساختار سازمانی: «کل ساختار سازمانی» یا «سطوح برگزیده»
 *     (چک‌باکسی هر گرهٔ ساختار کسب‌وکار با برچسب مسیر کامل؛ معنای هر گره
 *     شامل زیرمجموعه‌هایش است).
 *   · بدون انتخاب در هر بخش = دسترسی کامل همان بُعد (قرارداد انبارش در
 *     UserRoleScope: نبودِ ردیف = بدون محدودیت).
 *
 * نقش سیستمی «مدیر سیستم» (seed بوت، IsSystem) حذف‌شدنی نیست — دکمهٔ حذف
 * برای آن غیرفعال است و سرور هم 403 می‌دهد.
 */

interface UserRoleDto {
  id: number;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  softwareKeys: string[];
  structureIds: string[];
  version: number;
}

interface SystemDto {
  id: number;
  code: string;
  titleFa: string;
  titleKey: string | null;
  isActive: boolean;
}

interface FormValues {
  code: string;
  title: string;
  description: string;
  active: boolean;
}

const BLANK: FormValues = { code: "", title: "", description: "", active: true };

/** گره تخت‌شدهٔ ساختار سازمانی با برچسب مسیر کامل («دفتر مرکزی / شرکت / شعبه»). */
interface ScopeNode {
  id: string;
  path: string;
}

/** DFS از ریشه (ParentRef=0) — فقط گره‌های فعال؛ برچسب = عنوان در زبان جاری
 *  از انبار DataTranslation (Task 110؛ نبودِ ترجمه = عنوان پایهٔ fa). */
function flattenTree(
  tree: BsNode[],
  locale: string,
  tr?: Record<string, Record<string, string>>,
): ScopeNode[] {
  const byParent = new Map<number, BsNode[]>();
  for (const n of tree) {
    const key = Number(n.parentRef);
    const list = byParent.get(key) ?? [];
    list.push(n);
    byParent.set(key, list);
  }
  const label = (n: BsNode) =>
    locale === "fa" ? n.title : tr?.[String(n.id)]?.[locale] || n.title;
  const out: ScopeNode[] = [];
  const walk = (parentId: number, prefix: string) => {
    for (const n of (byParent.get(parentId) ?? []).sort((a, b) => Number(a.id) - Number(b.id))) {
      if (!n.isActive) continue;
      const path = prefix ? `${prefix} / ${label(n)}` : label(n);
      out.push({ id: String(n.id), path });
      walk(Number(n.id), path);
    }
  };
  walk(0, "");
  return out;
}

/** خلاصهٔ فهرست برای سلول‌های لیست: تا ۲ مورد، بعد «+n». */
function shortList(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length <= 2) return labels.join(" ، ");
  return `${labels[0]} ، ${labels[1]} +${labels.length - 2}`;
}

export function UserRoleForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "settings")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<UserRoleDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [systems, setSystems] = React.useState<SystemDto[]>([]);
  /* Task 110 — درخت خام + نقشهٔ ترجمه؛ مسیرها با useMemo بر زبان جاری بازمشق می‌شوند */
  const [bsItems, setBsItems] = React.useState<BsNode[]>([]);
  const [bsTr, setBsTr] = React.useState<Record<string, Record<string, string>>>({});
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  const [swMode, setSwMode] = React.useState<"all" | "selected">("all");
  const [swKeys, setSwKeys] = React.useState<string[]>([]);
  const [stMode, setStMode] = React.useState<"all" | "selected">("all");
  const [stIds, setStIds] = React.useState<string[]>([]);
  /* Task 82 — unsaved-data flag of the tab */
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  const fetchRecords = React.useCallback(async (): Promise<UserRoleDto[]> => {
    const res = await api.get<{ items?: UserRoleDto[] }>("user-role");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: UserRoleDto[]) => {
    setRecords(rows);
    setListLoading(false);
  }, []);

  /* واکشی نقش‌ها + نرم‌افزارها — setState فقط داخل then */
  React.useEffect(() => {
    let alive = true;
    fetchRecords().then(
      (rows) => alive && applyRecords(rows),
      () => alive && applyRecords([]),
    );
    api
      .get<{ items?: SystemDto[] }>("systems")
      .then((res) => {
        if (alive) setSystems((res.items ?? []).filter((s) => s.isActive));
      })
      .catch(() => {
        /* لیست نرم‌افزارها می‌ماند خالی — چک‌باکس‌ها فقط نمایش می‌دهند */
      });
    return () => {
      alive = false;
    };
  }, [fetchRecords, applyRecords]);

  /* درخت ساختار سازمانی — واکشی اولیه (بدون وابستگی زبان)؛ Task 110 —
     نقشهٔ ترجمهٔ عناوین هم از انبار DataTranslation می‌آید */
  React.useEffect(() => {
    let alive = true;
    api
      .get<BsListResponse>("business-structure")
      .then((res) => {
        if (!alive) return;
        const items = res.items ?? [];
        setBsItems(items);
        if (items.length === 0) return;
        api
          .get<{
            items?: Array<{
              entityId: number;
              fieldKey: string;
              locale: string;
              value: string;
            }>;
          }>(
            `data-translations?entityType=BusinessStructure&entityIds=${items
              .map((n) => n.id)
              .join(",")}&fieldKeys=title`,
          )
          .then((trRes) => {
            if (!alive) return;
            const next: Record<string, Record<string, string>> = {};
            for (const it of trRes.items ?? []) {
              if (!it?.entityId || it.fieldKey !== "title" || !it?.locale || !it?.value) continue;
              (next[String(it.entityId)] ??= {})[it.locale] = it.value;
            }
            setBsTr(next);
          })
          .catch(() => {
            /* خطا = برچسب‌ها با عنوان پایهٔ fa می‌مانند */
          });
      })
      .catch(() => {
        /* درخت خالی — چک‌باکس‌های ساختار سازمانی خالی می‌ماند */
      });
    return () => {
      alive = false;
    };
  }, []);

  /* مسیرهای ساختار سازمانی — با useMemo بر زبان جاری/نقشهٔ ترجمه بازمشق می‌شوند */
  const nodes = React.useMemo<ScopeNode[]>(
    () => flattenTree(bsItems, locale, bsTr),
    [bsItems, bsTr, locale],
  );

  const applyRecord = React.useCallback((r: UserRoleDto) => {
    setCurrentId(r.id);
    setDirty(false); // رکورد ذخیره‌شده باز شد
    setValues({
      code: r.code,
      title: r.title,
      description: r.description,
      active: r.isActive,
    });
    setSwKeys(r.softwareKeys);
    setSwMode(r.softwareKeys.length > 0 ? "selected" : "all");
    setStIds(r.structureIds);
    setStMode(r.structureIds.length > 0 ? "selected" : "all");
  }, []);

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    setSwKeys([]);
    setSwMode("all");
    setStIds([]);
    setStMode("all");
  }, []);

  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      setDirty(true); // هر ویرایش = اطلاعات ذخیره‌نشده
      if (id === "swMode") {
        setSwMode(value === "selected" ? "selected" : "all");
        return;
      }
      if (id === "stMode") {
        setStMode(value === "selected" ? "selected" : "all");
        return;
      }
      if (id.startsWith("sw_")) {
        const code = id.slice(3);
        setSwKeys((prev) =>
          value === true ? (prev.includes(code) ? prev : [...prev, code]) : prev.filter((c) => c !== code),
        );
        return;
      }
      if (id.startsWith("st_")) {
        const sid = id.slice(3);
        setStIds((prev) =>
          value === true ? (prev.includes(sid) ? prev : [...prev, sid]) : prev.filter((c) => c !== sid),
        );
        return;
      }
      if (id === "active") {
        setValues((v) => ({ ...v, active: value === true }));
        return;
      }
      setValues((v) => ({ ...v, [id]: String(value ?? "") }));
    },
    [],
  );

  /* زنجیرهٔ اعتبارسنجی فرانت — همان قوانین سرور برای بازخورد فوری */
  const validate = (): string | null => {
    if (values.code.trim() === "") return t("um.errCodeRequired");
    if (values.title.trim() === "") return t("um.errTitleRequired");
    if (swMode === "selected" && swKeys.length === 0) return t("um.errSwEmpty");
    if (stMode === "selected" && stIds.length === 0) return t("um.errStEmpty");
    return null;
  };

  /* ذخیره: ثبت جدید (POST) یا ویرایش رکورد جاری (PUT) — true = موفق */
  const doSave = async (): Promise<boolean> => {
    const err = validate();
    if (err) {
      toast.error(err);
      return false;
    }
    const body = {
      code: values.code.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      isActive: values.active,
      softwareKeys: swMode === "selected" ? swKeys : [],
      structureIds: stMode === "selected" ? stIds : [],
    };
    try {
      const res =
        currentId == null
          ? await api.post<UserRoleDto>("user-role", body)
          : await api.put<UserRoleDto>(`user-role/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as UserRoleDto[]);
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
      await api.del(`user-role/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as UserRoleDto[]);
      applyRecords(rows);
      newRecord();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ناوبری رکوردها «|< < > >|» */
  const currentIndex = records.findIndex((r) => r.id === currentId);
  const nav = (i: number) => {
    const r = records[i];
    if (r) applyRecord(r);
  };

  /* برچسب نرم‌افزار با کلید دیکشنری — زنده با تغییر زبان (قرارداد Task 99) */
  const swLabel = React.useCallback(
    (code: string) => {
      const s = systems.find((x) => x.code === code);
      if (!s) return code;
      return s.titleKey ? t(s.titleKey as never) : s.titleFa;
    },
    [systems, t],
  );

  const nodePathById = React.useMemo(
    () => new Map(nodes.map((n) => [n.id, n.path])),
    [nodes],
  );

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      { id: "code", label: t("um.roleCode"), required: true, value: values.code },
      { id: "title", label: t("um.roleTitle"), required: true, value: values.title },
      {
        id: "description",
        label: t("common.description"),
        type: "textarea",
        value: values.description,
      },
      { id: "active", label: t("fy.active"), type: "checkbox", checked: values.active },
    ],
    [t, values],
  );

  const tabs = React.useMemo<SimpleFormTab[]>(() => {
    const scopeFields: SimpleFormField[] = [
      {
        id: "swMode",
        label: t("um.swScope"),
        type: "radio",
        required: true,
        value: swMode,
        widthPct: 100, // Task 102 — header row stands alone above its items
        options: [
          { value: "all", label: t("um.swAll") },
          { value: "selected", label: t("um.swSelected") },
        ],
      },
      /* Task 102 — فاصلهٔ هدر تا آیتم‌ها (درخواست مالک) */
      { id: "swGap", label: "", type: "spacer", widthPct: 100 },
    ];
    if (swMode === "selected") {
      for (const s of systems) {
        scopeFields.push({
          id: `sw_${s.code}`,
          label: s.titleKey ? t(s.titleKey as never) : s.titleFa,
          type: "checkbox",
          checked: swKeys.includes(s.code),
          place: "start", // Task 102 — جهت خواندن (RTL راست‌به‌چپ / LTR چپ‌به‌راست)
        });
      }
    }
    scopeFields.push({ id: "stDivider", label: "", type: "line" });
    scopeFields.push({
      id: "stMode",
      label: t("um.stScope"),
      type: "radio",
      required: true,
      value: stMode,
      widthPct: 100, // Task 102 — header row stands alone above its items
      options: [
        { value: "all", label: t("um.stAll") },
        { value: "selected", label: t("um.stSelected") },
      ],
    });
    /* Task 102 — فاصلهٔ هدر تا آیتم‌ها (درخواست مالک) */
    scopeFields.push({ id: "stGap", label: "", type: "spacer", widthPct: 100 });
    if (stMode === "selected") {
      for (const n of nodes) {
        scopeFields.push({
          id: `st_${n.id}`,
          label: n.path,
          type: "checkbox",
          checked: stIds.includes(n.id),
          place: "start", // Task 102 — جهت خواندن (RTL راست‌به‌چپ / LTR چپ‌به‌راست)
        });
      }
    }
    return [{ id: "scope", label: t("um.scopeTab"), kind: "fields", columns: [], fields: scopeFields }];
  }, [t, systems, nodes, swMode, swKeys, stMode, stIds]);

  /* خلاصهٔ محدودهٔ هر رکورد برای لیست */
  const scopeSummary = React.useCallback(
    (r: UserRoleDto) => {
      const sw = r.softwareKeys.length === 0 ? t("um.swAll") : shortList(r.softwareKeys.map(swLabel));
      const st =
        r.structureIds.length === 0
          ? t("um.stAll")
          : shortList(r.structureIds.map((id) => nodePathById.get(id) ?? `#${id}`));
      return `${t("um.swScope")}: ${sw} — ${t("um.stScope")}: ${st}`;
    },
    [t, swLabel, nodePathById],
  );

  const current = records.find((r) => r.id === currentId) ?? null;

  return (
    <SimpleFormTwoRowTabbed
      title={t("um.roleFormTitle")}
      badge={t("settings.title")}
      icon={<ShieldPlus className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      tabs={tabs}
      hint={t("um.scopeHint")}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ نقش جدید: فرم خالی می‌شود */
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
        /* ثبت نقش جدید با همان مقادیر — شناسه پاک می‌شود تا رکورد نو ساخته شود */
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
        title: `${r.code} - ${r.title}`,
        subtitle: scopeSummary(r),
        cells: [
          { label: t("um.roleCode"), value: r.code },
          {
            label: t("um.roleTitle"),
            value: r.isSystem ? `${r.title} — ${t("um.systemRole")}` : r.title,
          },
          {
            label: t("um.swScope"),
            value: r.softwareKeys.length === 0 ? t("um.swAll") : shortList(r.softwareKeys.map(swLabel)),
          },
          {
            label: t("um.stScope"),
            value:
              r.structureIds.length === 0
                ? t("um.stAll")
                : shortList(r.structureIds.map((id) => nodePathById.get(id) ?? `#${id}`)),
          },
          { label: t("fy.active"), value: r.isActive ? t("abar.listYes") : t("abar.listNo") },
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
      canDelete={current?.isSystem ? false : true}
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
