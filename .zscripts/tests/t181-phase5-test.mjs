/**
 * t181 — E2E test of workflow Phase 5 (گزارش گردش/گلوگاه + داشبورد گردش سازمان).
 * پوشش: overview (KPI — جمع وضعیت‌ها، تفکیک per فرم، میانگین زمان، نقض SLA باز،
 * تفویض فعال) · گلوگاه‌ها (per گرهٔ اقدام: ورود/میانگین/بیشینه/انتظارِ باز) ·
 * فهرست نمونه‌ها (فیلتر وضعیت/فرم + limit + گام جاری + SLA) · انعکاس لحظه‌ایِ
 * چرخش تازه در هر سه گزارش (دلتای پیش/پس از اقدام‌ها) — Run:
 * bun .zscripts/tests/t181-phase5-test.mjs
 */
import { createHmac } from "node:crypto";

const WF = "http://127.0.0.1:3004";
const ST = "http://127.0.0.1:3001";
const KEY = "farataraz-internal-dev-key-2026";
const RUN = Date.now().toString().slice(-6);
const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

function headers(method, path, extra = {}) {
  const ts = Date.now().toString();
  const canonical = `${method.toUpperCase()}:${norm(path)}:${ts}`;
  return {
    "content-type": "application/json",
    "x-internal-key": KEY,
    "x-internal-timestamp": ts,
    "x-internal-signature": createHmac("sha256", KEY).update(canonical).digest("hex"),
    ...extra,
  };
}

async function call(base, method, path, body) {
  const [pathname] = path.split("?");
  const res = await fetch(`${base}${path}`, {
    method,
    headers: headers(method, pathname),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

let pass = 0;
let fail = 0;
function check(name, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name} ${extra}`);
  } else {
    fail++;
    console.log(`  ✗ FAIL: ${name} ${extra}`);
  }
}
const ok = (r) => r.status >= 200 && r.status < 300;

const iso = (d) => d.toISOString();
const day = 24 * 3600 * 1000;
const now = Date.now();
const STARTER = `S0-${RUN}`;

async function ensureAssignment(roleCode, userId, name) {
  const cur = await call(WF, "GET", `/workflow-roles/assignments/${roleCode}`);
  const rows = (cur.json?.items ?? []).map((x) => ({
    userId: x.userId,
    userName: x.userName,
    validFrom: x.validFrom,
    validTo: x.validTo,
  }));
  if (!rows.some((r) => r.userId === userId)) {
    rows.push({ userId, userName: name, validFrom: iso(new Date(now - day)), validTo: null });
    const put = await call(WF, "PUT", "/workflow-roles/assignments", {
      mode: "replace",
      roleCode,
      rows,
    });
    return ok(put);
  }
  return true;
}

console.log("۰) منابع پایه:");
check("تخصیص A1/S1 آماده",
  (await ensureAssignment("RS-ACCOUNTANT", "A1", "حسابدار تست")) &&
  (await ensureAssignment("RS-SUPERVISOR", "S1", "سرپرست تست")));

const meta = await call(ST, "GET", "/vouchers/meta");
const docType = meta.json?.docTypes?.[0];
const moein = meta.json?.moeinAccounts?.[0];
check("متای سند موجود", !!docType && !!moein);
const today = new Date().toISOString().slice(0, 10);
const mkVoucher = (status, debit) => ({
  voucherTypeRef: docType.id,
  nature: 1,
  status,
  date: today,
  description: `تست گزارش گردش کار فاز ۵ — ${RUN}`,
  items: [{ moeinRef: moein.id, description: "ردیف تست", debit }],
});

console.log("۱) شکل و سازگاری گزارش‌ها (پیش از چرخش تازه):");
const ov1 = await call(WF, "GET", "/workflow-reports/overview");
check("overview ۲۰۰", ok(ov1));
const c1 = ov1.json?.counts ?? {};
check("جمع وضعیت‌ها = کل (شامل واگردشده)",
  (c1.total ?? -1) ===
  (c1.running ?? -9) + (c1.approved ?? -9) + (c1.rejected ?? -9) +
  (c1.cancelled ?? -9) + (c1.undone ?? -9),
  JSON.stringify(c1));
check("تفکیک per فرم: سند موجود", (ov1.json?.perEntityType ?? []).some((e) => e.entityType === "voucher"));
check("میانگین زمان طی‌شدن عددی", typeof ov1.json?.avgCompletionHours === "number", `${ov1.json?.avgCompletionHours}`);

const bn1 = await call(WF, "GET", "/workflow-reports/bottlenecks");
check("bottlenecks ۲۰۰ و فقط گرهٔ اقدام", ok(bn1) && (bn1.json?.items ?? []).every((b) => b.nodeType === "action"));
const bnKey = (b) => `${b.definitionCode}#${b.processVersion}#${b.nodeCode}`;
const bnBefore = new Map((bn1.json?.items ?? []).map((b) => [bnKey(b), b]));
check("حداقل یک گرهٔ اقدام با ورود ثبت‌شده", [...bnBefore.values()].some((b) => b.entered > 0));
check("فیلدهای عددی گلوگاه معتبر", [...bnBefore.values()].every(
  (b) => typeof b.avgHours === "number" && typeof b.maxHours === "number" && b.entered >= 1 && b.openCount >= 0,
));

console.log("۲) چرخش تازه و رصد لحظه‌ای در گزارش‌ها:");
const vN = await call(ST, "POST", "/vouchers", mkVoucher(5, "25000"));
check("سند تازه ثبت شد", ok(vN), `#${vN.json?.id}`);
const startN = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vN.json?.id),
  startedBy: STARTER,
  startedByName: "آغازگر فاز ۵",
  formStatus: 5,
});
check("نمونهٔ تازه آغاز شد", ok(startN), startN.json?.message ?? "");
const iN = startN.json?.id;

const ov2 = await call(WF, "GET", "/workflow-reports/overview");
check("running پس از آغاز +۱", (ov2.json?.counts?.running ?? 0) === (c1.running ?? 0) + 1);
check("total پس از آغاز +۱", (ov2.json?.counts?.total ?? 0) === (c1.total ?? 0) + 1);
check("runningOnActionNode ≥ ۱ (پارک روی گرهٔ حسابدار)", (ov2.json?.runningOnActionNode ?? 0) >= 1);

const instRunning = await call(WF, "GET", `/workflow-reports/instances?status=running&limit=100`);
const mine = (instRunning.json?.items ?? []).find((x) => x.id === String(iN));
check("نمونهٔ تازه در فیلتر running", !!mine);
check("گام جاری و ساعت انتظار پر است",
  !!mine && typeof mine.currentNodeTitle === "string" && mine.currentNodeTitle.length > 0 &&
  typeof mine.waitingHours === "number" && mine.waitingHours >= 0,
  mine ? `node=${mine.currentNodeTitle} wait=${mine.waitingHours}h` : "");
check("وضعیت SLA نمونهٔ تازه ok/none", !!mine && ["ok", "none"].includes(mine.slaState), mine?.slaState);

const lim = await call(WF, "GET", "/workflow-reports/instances?limit=2");
check("limit=2 رعایت شد", (lim.json?.items ?? []).length <= 2 && lim.json?.total >= (lim.json?.items ?? []).length);
const approvedList = await call(WF, "GET", "/workflow-reports/instances?status=approved&limit=100");
check("فیلتر approved نمونهٔ running را نمی‌آورد", !(approvedList.json?.items ?? []).some((x) => x.id === String(iN)));
const bogus = await call(WF, "GET", "/workflow-reports/instances?status=bogus");
check("فیلتر نامعتبر نادیده گرفته شد (۲۰۰)", ok(bogus));

const bn2 = await call(WF, "GET", "/workflow-reports/bottlenecks");
const bnAfterStart = new Map((bn2.json?.items ?? []).map((b) => [bnKey(b), b]));
const myNode = mine?.currentNodeTitle ?? "";
const openEntry = [...bnAfterStart.values()].find((b) => b.nodeTitle === myNode && b.openCount >= 1);
check("انتظارِ باز نمونهٔ تازه در گلوگاه ثبت شد", !!openEntry, openEntry ? `${openEntry.definitionCode} v${openEntry.processVersion} ${openEntry.nodeCode}` : "");

console.log("۳) تکمیل چرخه و انعکاس نهایی:");
const appr1 = await call(WF, "POST", `/workflow-instances/${iN}/act`, { action: "تایید", actorId: "A1", actorName: "حسابدار تست" });
check("تایید حسابدار موفق", ok(appr1), appr1.json?.message ?? "");
const appr2 = await call(WF, "POST", `/workflow-instances/${iN}/act`, { action: "تایید", actorId: "S1", actorName: "سرپرست تست" });
check("تایید سرپرست → پایان موفق (آستانهٔ ۲۵هزار < ۱۰۰م ⇒ خیر)", ok(appr2) && appr2.json?.currentState === "approved", appr2.json?.message ?? "");
check("وضعیت پایانی D-4 = ۴", appr2.json?.finalStatus === 4);
const vStatus = await call(ST, "GET", `/vouchers/${vN.json?.id}/status`);
check("write-back سند = ۴", vStatus.json?.status === 4, `status=${vStatus.json?.status}`);

const ov3 = await call(WF, "GET", "/workflow-reports/overview");
check("approved پس از پایان +۱", (ov3.json?.counts?.approved ?? 0) === (ov2.json?.counts?.approved ?? 0) + 1);
check("running پس از پایان −۱", (ov3.json?.counts?.running ?? 0) === (c1.running ?? 0));
check("میانگین زمان طی‌شدن هنوز عددی", typeof ov3.json?.avgCompletionHours === "number");

const instAll = await call(WF, "GET", `/workflow-reports/instances?status=approved&entityType=voucher&limit=100`);
const mineDone = (instAll.json?.items ?? []).find((x) => x.id === String(iN));
check("نمونهٔ تکمیل‌شده در فیلتر approved+voucher", !!mineDone);
check("finishedAt ثبت و انتظار null", !!mineDone && typeof mineDone.finishedAt === "string" && mineDone.waitingHours === null);

const bn3 = await call(WF, "GET", "/workflow-reports/bottlenecks");
const bnAfterEnd = new Map((bn3.json?.items ?? []).map((b) => [bnKey(b), b]));
const deltaOk = openEntry
  ? (bnAfterEnd.get(bnKey(openEntry))?.closedCount ?? -1) >= openEntry.closedCount + 1
  : true;
check("توقفِ بسته‌شدهٔ گرهٔ اقدام در گلوگاه ثبت شد (closedCount +۱)", deltaOk,
  openEntry
    ? `closed ${openEntry.closedCount}→${bnAfterEnd.get(bnKey(openEntry))?.closedCount}`
    : "");
check("انتظارِ باز نمونهٔ تکمیل‌شده بسته شد (openCount کاهش یا ثبات نسبت به پارک)",
  openEntry
    ? (bnAfterEnd.get(bnKey(openEntry))?.openCount ?? 0) <= openEntry.openCount
    : true);

console.log("۴) پایداری:");
const ov4 = await call(WF, "GET", "/workflow-reports/overview");
check("فراخوانی مجدد overview همان نتیجه (idempotent)",
  JSON.stringify(ov3.json?.counts) === JSON.stringify(ov4.json?.counts));

console.log(`\nنتیجه: ${pass} ✓ / ${fail} ✗`);
process.exit(fail === 0 ? 0 : 1);
