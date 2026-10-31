/**
 * t178 — E2E test of workflow Phase 2 (آداپتور مشترک روی سند حسابداری).
 * پوشش: وضعیت ۵ قابل صدور · منبع حقیقت گلوگاه (D-3) · قفل نرم ۴۲۳ (FR-06) ·
 * write-back وضعیت پایانی هر دو شاخهٔ شرط (D-4) · واگرد مشروط (D-5 + دفتر وابستگی) ·
 * رد ⇒ ثبت اولیه · ابطال ⇒ بازگشت به گلوگاه · گارد فقط-موتور (ENGINE_API_KEY).
 * Run: cd /home/z/my-project && bun .zscripts/tests/t178-phase2-test.mjs
 */
import { createHmac } from "node:crypto";

const WF = "http://127.0.0.1:3004";
const ST = "http://127.0.0.1:3001";
const KEY = "farataraz-internal-dev-key-2026";
const EKEY = "farataraz-engine-dev-key-2026";
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

async function call(base, method, path, body, extra = {}) {
  const [pathname] = path.split("?");
  const res = await fetch(`${base}${path}`, {
    method,
    headers: headers(method, pathname, extra),
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

console.log("۰) منابع سند:");
const meta = await call(ST, "GET", "/vouchers/meta");
check("meta واکشی شد", ok(meta));
const moein = meta.json.moeinAccounts?.[0];
const docType = meta.json.docTypes?.[0];
check("متعین و نوع سند موجود", !!moein && !!docType, `(moein=${moein?.id} type=${docType?.id})`);
const today = new Date().toISOString().slice(0, 10);
const mkVoucher = (status) => ({
  voucherTypeRef: docType.id,
  nature: 1,
  status,
  date: today,
  description: `تست گردش کار فاز ۲ — ${RUN}`,
  items: [{ moeinRef: moein.id, description: "ردیف تست", debit: "50000000" }],
});

console.log("۱) وضعیت ۵ قابل صدور:");
const c5 = await call(ST, "POST", "/vouchers", mkVoucher(5));
check("ثبت سند با وضعیت ۵ (تایید کاربر)", ok(c5), c5.json?.message ?? "");
const vid = c5.json?.id;
check("شناسهٔ سند", !!vid, `#${vid}`);
const st5 = await call(ST, "GET", `/vouchers/${vid}/status`);
check("منبع حقیقت: وضعیت واقعی = ۵", ok(st5) && st5.json.status === 5, JSON.stringify(st5.json));

console.log("۲) گلوگاه ورود با منبع حقیقت (D-3):");
const forge = await call(ST, "POST", "/vouchers", mkVoucher(2));
check("سند یادداشت ثبت شد", ok(forge));
const forgeId = forge.json?.id;
const forgedStart = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(forgeId),
  startedBy: "A1",
  startedByName: "علی حسابدار",
  formStatus: 5,
  amount: 50_000_000,
});
check(
  "جعل وضعیت ۵ برای سند یادداشت رد شد",
  forgedStart.status === 400,
  `(real=2 excluded — ${forgedStart.json?.message?.slice(0, 40) ?? ""})`,
);

const start1 = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vid),
  startedBy: "A1",
  startedByName: "علی حسابدار",
  formStatus: 5,
  amount: 50_000_000,
});
check("ارسال به رسیدگی (مبلغ ۵۰م < آستانه)", ok(start1), start1.json?.message ?? "");
const iid = start1.json?.id;
check("نمونه running و گام دوم رسیدگی", start1.json?.currentState === "running" && start1.json?.currentNode?.nodeCode === "N2");

console.log("۳) قفل نرم در جریان (FR-06):");
const lock = await call(WF, "GET", `/workflow-instances/lock?entityType=voucher&entityId=${vid}`);
check("lock=true", lock.json?.locked === true && lock.json.instanceId === Number(iid), JSON.stringify(lock.json));
const putLocked = await call(ST, "PUT", `/vouchers/${vid}`, { ...mkVoucher(5), voucherNo: c5.json.voucherNo, serialNo: c5.json.serialNo });
check("PUT سند در جریان ⇒ ۴۲۳", putLocked.status === 423, `(${putLocked.status})`);
const delLocked = await call(ST, "DELETE", `/vouchers/${vid}`);
check("DELETE سند در جریان ⇒ ۴۲۳", delLocked.status === 423, `(${delLocked.status})`);

console.log("۴) شاخهٔ «خیر» شرط آستانه + write-back وضعیت ۴ (D-4):");
const ap1 = await call(WF, "POST", `/workflow-instances/${iid}/act`, {
  action: "تایید",
  actorId: "A1",
  actorName: "علی حسابدار",
  amount: 50_000_000,
});
check("تایید حسابدار", ok(ap1) && ap1.json.currentNode?.nodeCode === "N3", ap1.json?.message ?? "");
const ap2 = await call(WF, "POST", `/workflow-instances/${iid}/act`, {
  action: "تایید",
  actorId: "S1",
  actorName: "زهرا سرپرست",
  amount: 50_000_000,
});
check("تایید سرپرست → شرط خیر → پایان", ok(ap2) && ap2.json.currentState === "approved", ap2.json?.message ?? "");
check("finalStatus نمونه = ۴", ap2.json?.finalStatus === 4);
await new Promise((r) => setTimeout(r, 300));
const stAfter = await call(ST, "GET", `/vouchers/${vid}/status`);
check("سند وضعیت ۴ گرفت (write-back D-4)", stAfter.status === 200 && stAfter.json.status === 4, JSON.stringify(stAfter.json));

console.log("۵) واگرد تایید نهایی (D-5):");
const undoNoReason = await call(WF, "POST", `/workflow-instances/${iid}/undo-final`, { actorId: "A1", comment: "" });
check("واگرد بدون دلیل رد شد", undoNoReason.status === 400);
const undo = await call(WF, "POST", `/workflow-instances/${iid}/undo-final`, {
  actorId: "M1",
  actorName: "حسن مدیر",
  comment: "اصلاح مبلغ ردیف دوم",
});
check("واگرد انجام شد → undone", ok(undo) && undo.json.currentState === "undone", undo.json?.message ?? "");
await new Promise((r) => setTimeout(r, 300));
const stUndo = await call(ST, "GET", `/vouchers/${vid}/status`);
check("سند به گلوگاه ورود (۵) برگشت", stUndo.json?.status === 5, JSON.stringify(stUndo.json));
check("واگرد در تاریخچه", (undo.json.logs ?? []).some((l) => l.action === "واگرد" && l.comment === "اصلاح مبلغ ردیف دوم"));

console.log("۶) شاخهٔ «بله» شرط + دفتر وابستگی:");
const start2 = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vid),
  startedBy: "A1",
  startedByName: "علی حسابدار",
  amount: 150_000_000,
});
check("ارسال مجدد (پس از واگرد)", ok(start2), start2.json?.message ?? "");
const iid2 = start2.json?.id;
await call(WF, "POST", `/workflow-instances/${iid2}/act`, { action: "تایید", actorId: "A1", actorName: "علی حسابدار", amount: 150_000_000 });
await call(WF, "POST", `/workflow-instances/${iid2}/act`, { action: "تایید", actorId: "S1", actorName: "زهرا سرپرست", amount: 150_000_000 });
const depEarly = await call(WF, "POST", `/workflow-instances/${iid2}/dependencies`, {
  dependentEntityType: "payment",
  dependentEntityId: `P-${RUN}`,
}, { "x-engine-key": EKEY });
check("ثبت وابستگی روی نمونهٔ running رد شد", depEarly.status === 400);
const apM2 = await call(WF, "POST", `/workflow-instances/${iid2}/act`, { action: "تایید", actorId: "M1", actorName: "حسن مدیر" });
check("تایید مدیر → پایان", ok(apM2) && apM2.json.currentState === "approved", apM2.json?.message ?? "");
const stFinal2 = await call(ST, "GET", `/vouchers/${vid}/status`);
check("سند دوباره ۴ شد", stFinal2.json?.status === 4, JSON.stringify(stFinal2.json));
const dep = await call(WF, "POST", `/workflow-instances/${iid2}/dependencies`, {
  dependentEntityType: "payment",
  dependentEntityId: `P-${RUN}`,
  dependentEntityLabel: "پرداخت بر اساس سند",
  registeredBy: "test",
}, { "x-engine-key": EKEY });
check("ثبت اقدام آتی در دفتر وابستگی (فقط-موتور)", ok(dep) && dep.json.duplicate === false, JSON.stringify(dep.json));
const depDup = await call(WF, "POST", `/workflow-instances/${iid2}/dependencies`, {
  dependentEntityType: "payment",
  dependentEntityId: `P-${RUN}`,
}, { "x-engine-key": EKEY });
check("ثبت تکراری idempotent", ok(depDup) && depDup.json.duplicate === true);
const depNoKey = await call(WF, "POST", `/workflow-instances/${iid2}/dependencies`, {
  dependentEntityType: "payment",
  dependentEntityId: "X",
});
check("بدون کلید موتور ⇒ ۴۰۱", depNoKey.status === 401, `(${depNoKey.status})`);
const undoBlocked = await call(WF, "POST", `/workflow-instances/${iid2}/undo-final`, {
  actorId: "M1",
  comment: "تست واگرد با وابستگی",
});
check("واگرد با اقدام آتی ⇒ ۴۰۹ (D-5)", undoBlocked.status === 409, `(${undoBlocked.status} ${undoBlocked.json?.message?.slice(0, 50) ?? ""})`);
const putFinal = await call(ST, "PUT", `/vouchers/${vid}`, { ...mkVoucher(5), voucherNo: c5.json.voucherNo, serialNo: c5.json.serialNo });
check("PUT سند قطعی (وضعیت ۴) ⇒ ۴۲۳", putFinal.status === 423, `(${putFinal.status})`);

console.log("۷) رد ⇒ ثبت اولیه (سند جدا):");
const vB = await call(ST, "POST", "/vouchers", mkVoucher(5));
const vid2 = vB.json?.id;
check("سند B با وضعیت ۵", ok(vB), vB.json?.message ?? "");
const start3 = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vid2),
  startedBy: "A1",
  startedByName: "علی حسابدار",
});
check("ارسال سند B به رسیدگی", ok(start3), start3.json?.message ?? "");
const iid3 = start3.json?.id;
const rej = await call(WF, "POST", `/workflow-instances/${iid3}/act`, {
  action: "رد",
  actorId: "A1",
  actorName: "علی حسابدار",
  comment: `عدم تطابق مدرک — ${RUN}`,
});
check("رد با دلیل → rejected", ok(rej) && rej.json.currentState === "rejected");
await new Promise((r) => setTimeout(r, 300));
const stRej = await call(ST, "GET", `/vouchers/${vid2}/status`);
check("سند B به ثبت اولیه (۱) برگشت (D-4)", stRej.json?.status === 1, JSON.stringify(stRej.json));
const reEntry = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vid2),
  startedBy: "A1",
  formStatus: 5,
});
check("ورود مجدد سند ثبت‌اولیه رد شد (D-3)", reEntry.status === 400, reEntry.json?.message?.slice(0, 50) ?? "");

console.log("۸) ابطال توسط آغازگر ⇒ بازگشت به گلوگاه (سند جدا):");
const vC = await call(ST, "POST", "/vouchers", mkVoucher(5));
const vid3 = vC.json?.id;
check("سند C با وضعیت ۵", ok(vC), vC.json?.message ?? "");
const start4 = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vid3),
  startedBy: "A1",
  startedByName: "علی حسابدار",
});
check("ارسال سند C به رسیدگی", ok(start4), start4.json?.message ?? "");
const iid4 = start4.json?.id;
const cancelOther = await call(WF, "POST", `/workflow-instances/${iid4}/act`, {
  action: "ابطال",
  actorId: "S1",
  comment: "غیر آغازگر",
});
check("ابطال توسط غیر آغازگر رد شد", cancelOther.status === 403, `(${cancelOther.status})`);
const cancel = await call(WF, "POST", `/workflow-instances/${iid4}/act`, {
  action: "ابطال",
  actorId: "A1",
  actorName: "علی حسابدار",
  comment: "تغییر مبلغ قبل از رسیدگی",
});
check("ابطال توسط آغازگر → cancelled", ok(cancel) && cancel.json.currentState === "cancelled");
await new Promise((r) => setTimeout(r, 300));
const stCxl = await call(ST, "GET", `/vouchers/${vid3}/status`);
check("سند C به وضعیت ۵ برگشت", stCxl.json?.status === 5, JSON.stringify(stCxl.json));

console.log("۹) مسیر BFF:3000 (امضای سروری):");
const bff = await fetch(`http://127.0.0.1:3000/api/workflow/workflow-instances?entityType=voucher&entityId=${vid}`);
const bffJson = await bff.json().catch(() => null);
check("BFF پروکسی امضاشده کار می‌کند", bff.status === 200 && (bffJson?.items?.length ?? 0) >= 2, `(instances=${bffJson?.items?.length})`);

console.log("۱۰) پاک‌سازی دادهٔ تست:");
const delFinal = await call(ST, "DELETE", `/vouchers/${vid}`);
check("حذف سند قطعی (۴) ممنوع ⇒ ۴۲۳", delFinal.status === 423, `(${delFinal.status})`);
for (const v of [vid2, vid3]) {
  const del = await call(ST, "DELETE", `/vouchers/${v}`);
  check(`حذف سند #${v}`, ok(del), `(${del.status})`);
}

console.log(`\nنتیجه: ${pass}✓ / ${fail}✗`);
process.exit(fail > 0 ? 1 : 0);
