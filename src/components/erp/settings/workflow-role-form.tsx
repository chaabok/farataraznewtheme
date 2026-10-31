"use client";

import * as React from "react";
import { Workflow } from "lucide-react";
import { toast } from "sonner";
import { appApi } from "@/lib/api";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";

/**
 * WorkflowRoleForm — t177 (فاز ۱ زیرسیستم گردش کار): فرم مدیریتی «سمت‌های
 * گردش کار» در پنجرهٔ تنظیمات. تصمیم مالک D-1: سمت‌ها و نقش‌های «جدید»
 * تعریف می‌شوند (نه نقش‌های فعلی auth) و گره‌های فرآیند به کد سمت ارجاع
 * می‌دهند. ۴ سمت سیستمیِ پیش‌فرض (ثبت‌کننده/حسابدار/سرپرست/مدیر رسیدگی)
 * از بوت seed شده‌اند و حذف‌شدنی نیستند.
 *
 * تب «تخصیص کاربران» — گرید ردیفی با ذخیرهٔ REPLACE دسته‌ای (یک تراکنش در
 * workflow-service): شناسهٔ کاربر (ارجاع سبک به auth)، نام، بازهٔ اعتبار.
 * موتور فقط به دارندهٔ سمتِ گرهٔ جاری اجازهٔ اقدام می‌دهد (FR-06).
 */

const wf = appApi("workflow");

interface WfRoleDto {
  id: number;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  assignmentCount: number;
  version: number;
}

interface FormValues {
  code: string;
  title: string;
  description: string;
  active: boolean;
}

const BLANK: FormValues = { code: "", title: "", description: "", active: true };

/** ISO → YYYY/MM/DD برای سلول date گرید (خالی = بدون بازه). */
const isoToCell = (v: string) => (v ? v.replaceAll("-", "/") : "");
/** YYYY/MM/DD → YYYY-MM-DD برای سرور (خالی = بدون بازه). */
const cellToIso = (v: string) => (v ? v.trim().replaceAll("/", "-") : "");

export function WorkflowRoleForm({ onBack }: { onBack?: () => void }) {
  const t = useT();
  const chrome = useWindowChrome();
  const headerMaximized = useDesktop(
    (s) => s.windows.find((w) => w.kind === "settings")?.maximized ?? false,
  );

  const [records, setRecords] = React.useState<WfRoleDto[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [values, setValues] = React.useState<FormValues>(BLANK);
  const [dirty, setDirty] = React.useState(false);
  useTabDirty(dirty);

  /* ردیف‌های تب تخصیص — آخرین نسخه از طریق onTabRowsChange نگه داشته می‌شود؛
     loadedKey کلید remount شل است: فقط پس از رسیدن ردیف‌های تازه عوض می‌شود
     تا گرید هیچ‌وقت با ردیف‌های کهنهٔ رکورد قبلی mount نشود. */
  const [assignmentRows, setAssignmentRows] = React.useState<
    Record<string, string>[]
  >([]);
  const [loadedKey, setLoadedKey] = React.useState<string>("new");

  const fetchRecords = React.useCallback(async (): Promise<WfRoleDto[]> => {
    const res = await wf.get<{ items?: WfRoleDto[] }>("workflow-roles");
    return res.items ?? [];
  }, []);

  const applyRecords = React.useCallback((rows: WfRoleDto[]) => {
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

  /** ردیف‌های گرید از تخصیص‌های سرور — رکورد فقط پس از رسیدن ردیف‌ها باز می‌شود. */
  const rowsToCells = React.useCallback(
    (items: Array<{ userId: string; userName: string; validFrom: string; validTo: string }>) =>
      items.map((a) => ({
        userId: a.userId,
        userName: a.userName,
        validFrom: isoToCell(a.validFrom),
        validTo: isoToCell(a.validTo),
      })),
    [],
  );

  const applyRecord = React.useCallback(
    async (r: WfRoleDto) => {
      let rows: Record<string, string>[] = [];
      try {
        const res = await wf.get<{
          items?: Array<{
            userId: string;
            userName: string;
            validFrom: string;
            validTo: string;
          }>;
        }>(`workflow-roles/assignments/${encodeURIComponent(r.code)}`);
        rows = rowsToCells(res.items ?? []);
      } catch {
        rows = []; // خطای واکشی تخصیص‌ها = گرید خالی
      }
      setAssignmentRows(rows);
      setCurrentId(r.id);
      setDirty(false); // رکورد ذخیره‌شده باز شد
      setValues({
        code: r.code,
        title: r.title,
        description: r.description,
        active: r.isActive,
      });
      setLoadedKey(r.code); // remount با ردیف‌های تازه
    },
    [rowsToCells],
  );

  const newRecord = React.useCallback(() => {
    setCurrentId(null);
    setDirty(false); // فرم خالی، هیچ ویرایش ذخیره‌نشده‌ای نیست
    setValues(BLANK);
    setAssignmentRows([]);
    setLoadedKey("new");
  }, []);

  const onFieldChange = React.useCallback(
    (id: string, value: string | boolean) => {
      setDirty(true); // هر ویرایش = اطلاعات ذخیره‌نشده
      if (id === "active") {
        setValues((v) => ({ ...v, active: value === true }));
        return;
      }
      setValues((v) => ({ ...v, [id]: String(value ?? "") }));
    },
    [],
  );

  const validate = (): string | null => {
    if (values.code.trim() === "") return t("wf.errCodeRequired");
    if (values.title.trim() === "") return t("wf.errTitleRequired");
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
    };
    try {
      const res =
        currentId == null
          ? await wf.post<WfRoleDto>("workflow-roles", body)
          : await wf.put<WfRoleDto>(`workflow-roles/${currentId}`, body);
      toast.success(t("abar.savedToast"));
      const rows = await fetchRecords().catch(() => [] as WfRoleDto[]);
      applyRecords(rows);
      /* code روی ثبت جدید قفل می‌شود — رکورد ذخیره‌شده با تخصیص‌هایش باز می‌شود */
      await applyRecord(res);
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
      await wf.del(`workflow-roles/${currentId}`);
      toast.success(t("abar.deletedToast"));
      const rows = await fetchRecords().catch(() => [] as WfRoleDto[]);
      applyRecords(rows);
      newRecord();
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : t("common.error");
      toast.error(msg);
    }
  };

  /* ذخیرهٔ دسته‌ای تخصیص‌ها (REPLACE در یک تراکنش سرویس) */
  const saveAssignments = async (
    _tabId: string,
    rows: Record<string, string>[],
  ): Promise<void> => {
    if (currentId == null || !values.code.trim()) {
      toast.info(t("wf.saveRoleFirst"));
      return;
    }
    const payloadRows = rows
      .map((r) => ({
        userId: (r.userId ?? "").trim(),
        userName: (r.userName ?? "").trim(),
        validFrom: cellToIso(r.validFrom ?? ""),
        validTo: cellToIso(r.validTo ?? ""),
      }))
      .filter((r) => r.userId !== "");
    const seen = new Set<string>();
    for (const r of payloadRows) {
      if (seen.has(r.userId)) {
        toast.error(`${t("wf.dupUser")}: ${r.userId}`);
        return;
      }
      seen.add(r.userId);
    }
    try {
      await wf.put("workflow-roles/assignments", {
        mode: "replace",
        roleCode: values.code.trim(),
        rows: payloadRows,
      });
      toast.success(t("wf.assignmentsSaved"));
      const fresh = await fetchRecords().catch(() => [] as WfRoleDto[]);
      applyRecords(fresh);
      setDirty(false);
      /* remount با ردیف‌های نرمال‌شدهٔ سرور — loadedKey تازه */
      try {
        const res = await wf.get<{
          items?: Array<{
            userId: string;
            userName: string;
            validFrom: string;
            validTo: string;
          }>;
        }>(`workflow-roles/assignments/${encodeURIComponent(values.code.trim())}`);
        setAssignmentRows(rowsToCells(res.items ?? []));
      } catch {
        /* گرید با ردیف‌های کاربر می‌ماند */
      }
      setLoadedKey(`${values.code.trim()}:${Date.now()}`);
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

  const fields = React.useMemo<SimpleFormField[]>(
    () => [
      {
        id: "code",
        label: t("wf.roleCode"),
        required: true,
        value: values.code,
        ltr: true,
        disabled: currentId != null, // کد پس از ایجاد تغییر نمی‌کند (مرجع گره‌ها)
      },
      { id: "title", label: t("wf.roleTitle"), required: true, value: values.title },
      {
        id: "description",
        label: t("common.description"),
        type: "textarea",
        value: values.description,
      },
      { id: "active", label: t("fy.active"), type: "checkbox", checked: values.active },
    ],
    [t, values, currentId],
  );

  const tabs = React.useMemo<SimpleFormTab[]>(
    () => [
      {
        id: "assignments",
        label: t("wf.assignmentsTab"),
        kind: "grid",
        columns: [
          { id: "userId", label: t("wf.userId"), required: true, minWidth: "min-w-32" },
          { id: "userName", label: t("wf.userName"), minWidth: "min-w-40" },
          { id: "validFrom", label: t("wf.validFrom"), type: "date", minWidth: "min-w-36" },
          { id: "validTo", label: t("wf.validTo"), type: "date", minWidth: "min-w-36" },
        ],
        rows: assignmentRows,
      },
    ],
    [t, assignmentRows],
  );

  const current = records.find((r) => r.id === currentId) ?? null;

  return (
    <SimpleFormTwoRowTabbed
      /* remount فقط هنگام باز شدن رکورد/ذخیرهٔ تخصیص‌ها — ردیف‌های گرید همیشه تازه */
      key={loadedKey}
      title={t("wf.formTitle")}
      badge={t("wf.badge")}
      icon={<Workflow className="h-3.5 w-3.5" aria-hidden />}
      fields={fields}
      onFieldChange={onFieldChange}
      tabs={tabs}
      hint={t("wf.hint")}
      onFirst={() => nav(0)}
      onPrev={() => nav(Math.max(0, currentIndex - 1))}
      onNext={() => nav(Math.min(records.length - 1, currentIndex + 1))}
      onLast={() => nav(records.length - 1)}
      onReset={() => {
        /* آیکون + = شروع ثبتِ سمت جدید: فرم خالی می‌شود */
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
        /* ثبت سمت جدید با همان مقادیر — کد/شناسه پاک می‌شود */
        setCurrentId(null);
        setValues((v) => ({ ...v, code: "" }));
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
      onTabRowsChange={(tabId, rows) => setAssignmentRows(rows)}
      onSaveRows={saveAssignments}
      listItems={records.map((r) => ({
        id: String(r.id),
        title: `${r.code} - ${r.title}`,
        subtitle:
          r.description ||
          `${r.assignmentCount} ${t("wf.assignedUsers")}`,
        cells: [
          { label: t("wf.roleCode"), value: r.code },
          {
            label: t("wf.roleTitle"),
            value: r.isSystem ? `${r.title} — ${t("wf.systemRole")}` : r.title,
          },
          { label: t("wf.assignmentsTab"), value: String(r.assignmentCount) },
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
          void applyRecord(r);
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
