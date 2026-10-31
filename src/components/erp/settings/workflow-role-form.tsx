"use client";

import * as React from "react";
import { Workflow } from "lucide-react";
import { toast } from "sonner";
import { appApi } from "@/lib/api";
import { useT } from "@/stores/settings-store";
import { useDesktop } from "@/stores/desktop-store";
import { useOrgScope } from "@/stores/org-context-store";
import { useTabDirty, useWindowChrome } from "@/components/desktop/app-window";
import {
  SimpleFormTwoRowTabbed,
  type SimpleFormField,
  type SimpleFormFieldOption,
  type SimpleFormTab,
} from "@/components/forms/simple-form-two-row-tabbed";

/**
 * WorkflowRoleForm — t177 (فاز ۱ زیرسیستم گردش کار): فرم مدیریتی «سمت‌های
 * گردش کار». تصمیم مالک D-1: سمت‌ها و نقش‌های «جدید» تعریف می‌شوند (نه
 * نقش‌های فعلی auth) و گره‌های فرآیند به کد سمت ارجاع می‌دهند. ۴ سمت
 * سیستمیِ پیش‌فرض (ثبت‌کننده/حسابدار/سرپرست/مدیر رسیدگی) از بوت seed
 * شده‌اند و حذف‌شدنی نیستند.
 *
 * تب «تخصیص کاربران» — گرید ردیفی با ذخیرهٔ REPLACE دسته‌ای (یک تراکنش در
 * workflow-service): شناسهٔ کاربر، نام، بازهٔ اعتبار. موتور فقط به دارندهٔ
 * سمتِ گرهٔ جاری اجازهٔ اقدام می‌دهد (FR-06).
 *
 * t184 (فرمان مالک): در ستون «نام کاربر» یک دراپ‌دان (Select) است که
 * کاربران تعریف‌شده در «فرم کاربران» (settings-service GET user) را
 * فهرست می‌کند تا انتخاب از لیست انجام شود — نه تایپ آزاد. انتخاب، سلول
 * «شناسهٔ کاربر» را خودکار پر می‌کند (pickFill) و کاربرانی که در ردیف‌های
 * دیگر همین گرید انتخاب شده‌اند از لیست حذف می‌شوند (optionsFor) — قاعدهٔ
 * «هر کاربر به هر سمت یکبار می‌تواند تخصیص یابد»؛ سنگرهای بعدی: چکِ تکراری
 * هنگام ذخیره + قید UNIQUE(RoleCode,UserID) در دیتابیس. سلول نام، شناسهٔ
 * کاربر را نگه می‌دارد (قرارداد سلولِ select، Task 58) و نام نمایشی هنگام
 * ذخیره از همان لیست کاربران resolve می‌شود؛ ردیف‌های قدیمیِ پیش از t184
 * با snapshot نام (userNameSnap) حفظ می‌شوند.
 *
 * t185 (فرمان مالک): «کاربران چندین بار تکرار شده‌اند که نباید تکراری
 * باشند و فقط کاربران همین ساختار کسب و کار باید نمایش داده شوند» —
 * علت: کاربر یک ردیف به ازای «هر» گرهٔ ساختار دارد (Task 126: دفتر مرکزی
 * + هر شاخهٔ غیرمشترک) و واکشیِ سراسریِ بدون پارامترِ t184 همهٔ گره‌ها
 * را می‌آورد ⇒ هر کاربر چندبار (و کاربران ساختارهای دیگر هم). اصلاح:
 * ① قرارداد خواندن Task 122 — GET user?structureId=<گرهٔ انتخابی هدر>
 * &headOfficeShares=<تیک دادهٔ مشترک ریشه>؛ «دقیقاً همان لیستی که خودِ
 * فرم کاربران برای ساختار جاری نشان می‌دهد» و با تغییر کسکاد سازمانیِ
 * هدر بازخوانی می‌شود. ② یکتاسازی بر کلید نام کاربری (نام‌های نمایشی
 * می‌توانند تکراری باشند؛ نام کاربری در همهٔ گره‌های ثبت یکتاست) با
 * تقدمِ ردیفِ «همین ساختار» بر ردیف دفتر مرکزی — کاربر حتی با تیک
 * اشتراکِ دفتر مرکزی (دو ردیف در محدوده) یکبار در دراپ‌دان می‌آید.
 * نگارهٔ label از «همهٔ» ردیف‌های واکشی‌شده ساخته می‌شود تا تخصیص‌های
 * قدیمی (شناسهٔ ردیف دفتر مرکزی پیش از t185) هم برچسب و ذخیرهٔ مجدد
 * درست داشته باشند (optionsFor ردیفِ خودِ سطر را اگر در لیست یکتا نیست
 * دوباره تزریق می‌کند).
 */

const wf = appApi("workflow");
const settingsApi = appApi("settings"); // t184 — کاربرانِ «فرم کاربران»

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

/** t184 — کاربرِ «فرم کاربران» (settings-service /user) برای دراپ‌دان تخصیص؛
 *  t185 — businessStructureRef برای یکتاسازی (تقدم ردیفِ همین ساختار) */
interface WfUserDto {
  id: number;
  fullName: string;
  username: string;
  isActive: boolean;
  businessStructureRef: number;
}

const BLANK: FormValues = { code: "", title: "", description: "", active: true };

/** t185 — لیستِ خالیِ پایدار (هویت ثابت برای memoهای پایین‌دستی). */
const EMPTY_USERS: WfUserDto[] = [];

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

  /* t184 — کاربرانِ تعریف‌شده در «فرم کاربران»: منبعِ دراپ‌دان ستون «نام کاربر».
     t185 — واکشی با قرارداد خواندن Task 122 (structureId + headOfficeShares از
     کسکاد سازمانی هدر) — دقیقاً همان لیستی که خودِ «فرم کاربران» برای ساختار
     جاری نشان می‌دهد؛ فهرستِ سراسریِ بدون پارامتر، ردیفِ هر گره را می‌آورد و
     کاربر تکراری/خارج از ساختار می‌داد. با تغییر کسکاد، بازخوانی می‌شود.
     کلیدِ scope همراه ردیف‌ها نگه داشته می‌شود و «users» مشتقِ تطابقِ کلید است
     تا پس از تغییر ساختار، لیستِ کهنه هرگز نمایش داده نشود (بدون setState
     همگام در افکت). */
  const [usersState, setUsersState] = React.useState<{
    key: string;
    rows: WfUserDto[];
  }>({ key: "", rows: [] });
  const { scope, scopeKey, loaded: orgLoaded } = useOrgScope();

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

  /* t185 — واکشی کاربران «فرم کاربران» در محدودهٔ ساختار جاری (Task 122).
     درخت سازمانی هنوز نیامده/شرکتی انتخاب نیست ⇒ هیچ واکشی و لیستِ مشتق خالی
     (پیامِ داخل دراپ‌دان)؛ پس از رسیدن درخت با ساختارِ انتخابی هدر واکشی می‌شود.
     شمارهٔ ردِ درخواست: فقط پاسخِ آخرین واکشی نوشته می‌شود (پاسخِ دیرِ قدیمیِ
     ساختارِ قبلی دور ریخته می‌شود — امن در برابر رقابتِ ترتیب پاسخ‌ها). */
  const usersReq = React.useRef(0);
  React.useEffect(() => {
    if (!orgLoaded || scope.businessStructureRef == null) return;
    const seq = ++usersReq.current;
    const key = scopeKey;
    const qs = new URLSearchParams({
      structureId: String(scope.businessStructureRef),
      headOfficeShares: scope.shared ? "true" : "false",
    });
    settingsApi
      .get<{ items?: WfUserDto[] }>(`user?${qs.toString()}`)
      .then((res) => {
        if (seq === usersReq.current) setUsersState({ key, rows: res.items ?? [] });
      })
      .catch(() => {
        // خطای واکشی = لیست خالی + پیامِ داخل دراپ‌دان
        if (seq === usersReq.current) setUsersState({ key, rows: [] });
      });
  }, [orgLoaded, scopeKey, scope.businessStructureRef, scope.shared]);

  /* لیستِ فعال فقط وقتی که کلیدِ ذخیره‌شده با کسکادِ جاری یکی است — تغییر
     ساختار، بی‌درنگ لیستِ خالی می‌دهد تا ردیف‌های کهنهٔ ساختارِ قبلی نبینیم. */
  const users = React.useMemo(
    () => (usersState.key === scopeKey ? usersState.rows : EMPTY_USERS),
    [usersState, scopeKey],
  );

  /** t184 — برچسب نمایشی کاربر در دراپ‌دان و snapshot ذخیره‌شده:
      «نام و نام خانوادگی (نام کاربری)» — با fallback برای فیلدهای خالی. */
  const userLabel = React.useCallback((u: WfUserDto) => {
    const name = (u.fullName ?? "").trim();
    const uname = (u.username ?? "").trim();
    if (name && uname) return `${name} (${uname})`;
    return name || uname || `#${u.id}`;
  }, []);

  /* t185 — یکتاسازی: کلید = نام کاربری (در همهٔ گره‌های ثبت یکتاست؛ نام‌های
     نمایشی می‌توانند تکراری باشند). سرور به ازای هر گره یک ردیف می‌سازد
     (Task 126) و با تیک اشتراک دفتر مرکزی دو ردیفِ یک کاربر در محدوده
     می‌آید — ردیفِ «همین ساختار» مقدم بر ردیف دفتر مرکزی نگه داشته می‌شود
     تا شناسهٔ ذخیره‌شده در تخصیص، کاربرِ همین ساختار باشد. ترتیبِ سرور
     (نام، نام کاربری) با حفظ اولین رخداد می‌ماند. */
  const usersUnique = React.useMemo(() => {
    const scopeRef = scope.businessStructureRef;
    const rank = (u: WfUserDto) =>
      u.businessStructureRef === scopeRef ? 0 : u.businessStructureRef === 1 ? 1 : 2;
    const byKey = new Map<string, WfUserDto>();
    for (const u of users) {
      const key = (u.username ?? "").trim().toLowerCase() || `#row:${u.id}`;
      const prev = byKey.get(key);
      if (!prev || rank(u) < rank(prev)) byKey.set(key, u);
    }
    return [...byKey.values()];
  }, [users, scope.businessStructureRef]);

  /* t185 — نگارهٔ برچسب از «همهٔ» ردیف‌های واکشی‌شده (نه فقط لیست یکتا):
     تخصیص‌های قدیمی که شناسهٔ ردیف دفتر مرکزی را نگه داشته‌اند هم برچسب
     درست دارند و هنگام ذخیرهٔ بعدی نامشان resolve می‌شود. */
  const labelById = React.useMemo(
    () => new Map(users.map((u) => [String(u.id), userLabel(u)])),
    [users, userLabel],
  );

  /* t184 — گزینه‌های دراپ‌دان از لیست یکتاسازی‌شده: value = شناسهٔ یکتای
     کاربر، label = نام نمایشی. */
  const userOptions = React.useMemo<SimpleFormFieldOption[]>(
    () => usersUnique.map((u) => ({ value: String(u.id), label: userLabel(u) })),
    [usersUnique, userLabel],
  );

  /** ردیف‌های گرید از تخصیص‌های سرور — رکورد فقط پس از رسیدن ردیف‌ها باز می‌شود.
   *  t184: سلولِ «userName» (انتخابِ دراپ‌دان) شناسهٔ کاربر را نگه می‌دارد
   *  (قرارداد سلولِ select — Task 58) تا Select با options مقدار بخواند؛
   *  نام نمایشیِ ذخیره‌شدهٔ سرور در سلول پنهانِ userNameSnap می‌ماند تا
   *  ردیف‌های قدیمی (پیش از t184) هنگام ذخیرهٔ بعدی گم نشوند. */
  const rowsToCells = React.useCallback(
    (items: Array<{ userId: string; userName: string; validFrom: string; validTo: string }>) =>
      items.map((a) => ({
        userId: a.userId,
        userName: a.userId,
        userNameSnap: a.userName,
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

  /* ذخیرهٔ دسته‌ای تخصیص‌ها (REPLACE در یک تراکنش سرویس).
     t184 — نام نمایشی از لیست کاربرانِ «فرم کاربران» resolve می‌شود
     (منبع دراپ‌دان)؛ ردیف‌های قدیمیِ بدون تطابق، snapshot قبلی‌شان حفظ
     می‌شود؛ قید یکتایی «هر کاربر به هر سمت یکبار»: چکِ تکراری + UNIQUE دیتابیس. */
  const saveAssignments = async (
    _tabId: string,
    rows: Record<string, string>[],
  ): Promise<void> => {
    if (currentId == null || !values.code.trim()) {
      toast.info(t("wf.saveRoleFirst"));
      return;
    }
    const payloadRows = rows
      .map((r) => {
        const uid = (r.userId ?? "").trim();
        return {
          userId: uid,
          userName:
            uid !== ""
              ? (labelById.get(uid) ?? (r.userNameSnap ?? "").trim())
              : (r.userName ?? "").trim(),
          validFrom: cellToIso(r.validFrom ?? ""),
          validTo: cellToIso(r.validTo ?? ""),
        };
      })
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
          /* t184 — شناسهٔ کاربر دیگر تایپ نمی‌شود؛ با انتخاب از دراپ‌دانِ
             «نام کاربر» خودکار پر می‌شود (pickFill) و فقط-خواندنی است. */
          {
            id: "userId",
            label: t("wf.userId"),
            required: true,
            readOnly: true,
            minWidth: "min-w-28",
          },
          /* t184 (فرمان مالک) — دراپ‌دانِ کاربرانِ «فرم کاربران»: انتخاب از
             لیست، نه تایپ آزاد. کاربرانِ ردیف‌های دیگرِ گرید از لیست حذف
             می‌شوند تا «هر کاربر به هر سمت یکبار» در UI هم برقرار باشد؛
             سلول، شناسهٔ کاربر را نگه می‌دارد (قرارداد select — Task 58). */
          {
            id: "userName",
            label: t("wf.userName"),
            type: "select",
            minWidth: "min-w-44",
            placeholder: t("wf.pickUser"),
            emptyText: t("wf.noUsersDefined"),
            pickFill: { userId: "value" },
            optionsFor: (rows, ri) => {
              const taken = new Set<string>();
              rows.forEach((r, i) => {
                if (i === ri) return; // انتخابِ خودِ ردیف در لیستش می‌ماند
                const v = (r.userName ?? "").trim();
                if (v !== "") taken.add(v);
              });
              const list = userOptions.filter((o) => !taken.has(o.value));
              /* t185 — تخصیصِ قدیمی که شناسه‌اش در لیستِ محدودهٔ جاری نیست
                 (مثلاً ردیفِ دفتر مرکزی/ساختارِ دیگر از پیش از t185) برچسبش
                 را از نگارهٔ کامل و در نبودِ آن از snapshotِ نامِ ذخیره‌شده
                 می‌گیرد تا سطر خالی/بی‌نام دیده نشود */
              const own = (rows[ri]?.userName ?? "").trim();
              if (own !== "" && !list.some((o) => o.value === own)) {
                const lbl =
                  labelById.get(own) ?? (rows[ri]?.userNameSnap ?? "").trim();
                if (lbl) list.unshift({ value: own, label: lbl });
              }
              return list;
            },
          },
          { id: "validFrom", label: t("wf.validFrom"), type: "date", minWidth: "min-w-36" },
          { id: "validTo", label: t("wf.validTo"), type: "date", minWidth: "min-w-36" },
        ],
        rows: assignmentRows,
      },
    ],
    [t, assignmentRows, userOptions, labelById],
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
