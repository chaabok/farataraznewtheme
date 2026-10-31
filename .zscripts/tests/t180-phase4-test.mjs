/**
 * t180 — E2E test of workflow Phase 4 (طراح بصری فرآیند + انتخاب فرم‌های مشارکت‌کننده).
 * پوشش: کاتالوگ فرم‌ها (۵ فرم؛ فقط سند مشارکت دارد) · گارد آداپتور در انتخاب ·
 * گارد خروج با نمونهٔ running (۴۰۹) · گارد مشارکت در start موتور ·
 * نسخه‌بندی FR-01: PUT graph روی نسخهٔ در استفاده ⇒ ۴۰۹ · نسخهٔ جدید (کپی کامل) ·
 * اعتبارسنجی دیاگرام (۶ قاعدهٔ رد) · ذخیرهٔ معتبر · فعال‌سازی (تک نسخهٔ فعال) ·
 * حذف (۴۰۹ با نمونه / ۴۰۰ تنها نسخهٔ فعال) · create برای فرم غیرمشارکت ⇒ ۴۰۰ ·
 * layout روی نسخهٔ در استفاده مجاز · اجرای موتور روی دیاگرامِ ذخیره‌شدهٔ طراح
 * (مسیر تایید کامل + مسیر رد با وضعیت‌های D-4) — Run: bun .zscripts/tests/t180-phase4-test.mjs
 */
import { createHmac } from "node:crypto";
import { Database } from "bun:sqlite";

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

/* تضمین تخصیص‌های A1/S1/M1 به سمت‌های سیستمی (برای اجرای موتور) */
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
/* پاک‌سازی نمونه‌های running جامانده از تست‌های قبلی (دیتابیس تست — هم‌الگوی t179 در SLA) */
{
  const db = new Database("/home/z/my-project/db/workflow.db");
  const stale = db.query("SELECT COUNT(*) c FROM WorkflowInstance WHERE CurrentState='running'").get();
  if (stale.c > 0) {
    db.run("UPDATE WorkflowInstance SET CurrentState='cancelled', FinishedAt=datetime('now') WHERE CurrentState='running'");
    console.log(`  · ${stale.c} نمونهٔ running جاماندهٔ تست‌های قبل منقضی شد (پاک‌سازی تست)`);
  }
  db.close();
}
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
  description: `تست طراح گردش کار فاز ۴ — ${RUN}`,
  items: [{ moeinRef: moein.id, description: "ردیف تست", debit }],
});
check("تخصیص A1/S1/M1 آماده",
  (await ensureAssignment("RS-ACCOUNTANT", "A1", "حسابدار تست")) &&
  (await ensureAssignment("RS-SUPERVISOR", "S1", "سرپرست تست")) &&
  (await ensureAssignment("RS-MANAGER", "M1", "مدیر تست")));

/* ---- ۱) کاتالوگ فرم‌ها — انتخاب کاربر ---- */
console.log("۱) کاتالوگ فرم‌های مشارکت‌کننده:");
const cat = await call(WF, "GET", "/workflow-catalog");
check("کاتالوگ ۵ فرم دارای وضعیت", ok(cat) && cat.json?.items?.length === 5, `n=${cat.json?.items?.length}`);
const voucherRow = cat.json?.items?.find((x) => x.entityType === "voucher");
const contractRow = cat.json?.items?.find((x) => x.entityType === "contract");
check("سند حسابداری مشارکت فعال + آداپتور متصل", voucherRow?.participates === true && voucherRow?.adapterReady === true);
check("قرارداد: مشارکت خاموش + آداپتور متصل نیست", contractRow?.participates === false && contractRow?.adapterReady === false);
check("فرآیند فعال سند = WF-VOUCHER", voucherRow?.activeDefinition?.code === "WF-VOUCHER", JSON.stringify(voucherRow?.activeDefinition));

const pickContract = await call(WF, "PUT", "/workflow-catalog/contract", { participates: true });
check("انتخاب فرمِ بدون آداپتور رد شد", pickContract.status === 400, `(${pickContract.status})`);

/* ---- ۲) گارد مشارکت در موتور + خروج با نمونهٔ running ---- */
console.log("۲) گارد مشارکت در start و خروج با نمونهٔ جاری:");
const vG = await call(ST, "POST", "/vouchers", mkVoucher(5, "40000"));
check("سند گلوگاه ثبت شد", ok(vG), `#${vG.json?.id}`);
const startG = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vG.json?.id),
  startedBy: STARTER,
  startedByName: "آغازگر فاز ۴",
  formStatus: 5,
});
check("نمونهٔ جاری آغاز شد", ok(startG), startG.json?.message ?? "");
const iG = startG.json?.id;

const unenrollRunning = await call(WF, "PUT", "/workflow-catalog/voucher", { participates: false });
check("خروج فرم با نمونهٔ running رد شد (۴۰۹)", unenrollRunning.status === 409, `(${unenrollRunning.status})`);

/* سند گلوگاه → ابطال → خروج فرم → start رد → بازگشت فرم */
const cancelG = await call(WF, "POST", `/workflow-instances/${iG}/act`, {
  action: "ابطال",
  actorId: STARTER,
  comment: "ابطال برای تست گارد مشارکت",
});
check("ابطال توسط آغازگر موفق", ok(cancelG), cancelG.json?.message ?? "");
const unenroll2 = await call(WF, "PUT", "/workflow-catalog/voucher", { participates: false });
check("خروج فرم بدون نمونهٔ جاری ممکن شد", ok(unenroll2), unenroll2.json?.message ?? "");

const vG2 = await call(ST, "POST", "/vouchers", mkVoucher(5, "45000"));
const startBlocked = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vG2.json?.id),
  startedBy: STARTER,
  formStatus: 5,
});
check("start برای فرمِ غیرمشارکت رد شد (۴۰۰)", startBlocked.status === 400, `(${startBlocked.status}) ${startBlocked.json?.message ?? ""}`);

const enrollBack = await call(WF, "PUT", "/workflow-catalog/voucher", { participates: true });
check("بازگشت فرم به مشارکت", ok(enrollBack) && enrollBack.json?.participates === true);

/* ---- ۳) نسخه‌بندی و طراح دیاگرام — نسخه‌محور (idempotent در اجراهای تکراری) ---- */
console.log("۳) نسخه‌بندی FR-01 و ویرایش دیاگرام:");
/* نسخهٔ مبنا = نسخهٔ فعال فعلی سند — نمونهٔ iG در بخش ۲ روی همین نسخه اجرا شد ⇒ «در استفاده» */
const iGDetail = await call(WF, "GET", `/workflow-instances/${iG}`);
const baseId = iGDetail.json?.definition?.id;
const defList = await call(WF, "GET", "/workflow-definitions");
const base = defList.json?.items?.find((d) => d.id === baseId);
check("نسخهٔ مبنای فعال شناسایی شد", !!base && base.isActive === true, `id=${base?.id} v${base?.processVersion}`);
check("نسخهٔ مبنا «در استفاده» است", base?.usedByInstances === true && base?.instanceCount > 0, `count=${base?.instanceCount}`);

const baseFull = await call(WF, "GET", `/workflow-definitions/${base.id}`);
check("مختصات بوم نسخهٔ مبنا ترمیم شده", baseFull.json?.nodes?.every((n) => n.posX > 0 || n.posY > 0), JSON.stringify(baseFull.json?.nodes?.[0]));

const badGraph = await call(WF, "PUT", `/workflow-definitions/${base.id}/graph`, {
  nodes: baseFull.json.nodes,
  transitions: baseFull.json.transitions,
});
check("PUT graph روی نسخهٔ در استفاده ⇒ ۴۰۹", badGraph.status === 409, `(${badGraph.status})`);

/* نسخهٔ جدید = کپی کامل */
const v2Res = await call(WF, "POST", `/workflow-definitions/${base.id}/versions`, {});
const v2 = v2Res.json;
check("نسخهٔ جدید ساخته شد (کپی کامل ۷ گره/۷ گذار)", ok(v2Res) && v2?.processVersion === base.processVersion + 1 && v2?.nodes?.length === 7 && v2?.transitions?.length === 7, `v${v2?.processVersion} nodes=${v2?.nodes?.length}`);
check("نسخهٔ جدید غیرفعال و بدون نمونه", v2?.isActive === false && v2?.usedByInstances === false);

/* گذارهای getOne با ID می‌آیند — برای طراح به کد گره نگاشت می‌شود */
const codeOf = (nid) => v2.nodes.find((n) => n.id === nid)?.nodeCode ?? "";
v2.transitions = v2.transitions.map((t) => ({
  fromCode: codeOf(t.fromNodeId),
  toCode: codeOf(t.toNodeId),
  action: t.action,
  conditionExpr: t.conditionExpr,
  isDefault: t.isDefault,
}));
check("نگاشت گذارها به کد گره سالم", v2.transitions.every((t) => t.fromCode && t.toCode));

/* اعتبارسنجی‌ها — دیاگرام نامعتبر ذخیره نمی‌شود */
const node = (code) => v2.nodes.find((n) => n.nodeCode === code);
const tr = (f, to, action, expr = "", isDefault = false) => ({ fromCode: f, toCode: to, action, conditionExpr: expr, isDefault });

const inv1 = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: v2.nodes.concat([{ ...node("N1"), nodeCode: "N91", title: "شروع دوم" }]),
  transitions: v2.transitions.map((t) => t),
});
check("دو گرهٔ شروع ⇒ ۴۰۰", inv1.status === 400, `(${inv1.status}) ${inv1.json?.message ?? ""}`);

const nodesNoDefault = v2.nodes;
const transNoDefault = v2.transitions.map((t) => ({ ...t, isDefault: false }));
const inv2 = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: nodesNoDefault,
  transitions: transNoDefault,
});
check("شرط بدون شاخهٔ پیش‌فرض ⇒ ۴۰۰", inv2.status === 400, `(${inv2.status}) ${inv2.json?.message ?? ""}`);

const inv3 = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: nodesNoDefault,
  transitions: v2.transitions.map((t) =>
    t.conditionExpr ? { ...t, conditionExpr: "salary > threshold" } : t,
  ),
});
check("عبارت شرط نامعتبر ⇒ ۴۰۰", inv3.status === 400, `(${inv3.status}) ${inv3.json?.message ?? ""}`);

const inv4 = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: nodesNoDefault,
  transitions: v2.transitions.filter((t) => !(t.fromCode === node("N2").nodeCode && t.action === "تایید")),
});
check("گرهٔ اقدام بدون گذار تایید ⇒ ۴۰۰", inv4.status === 400, `(${inv4.status}) ${inv4.json?.message ?? ""}`);

const inv5 = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: nodesNoDefault.map((n) => (n.nodeType === "end" && n.instanceState === "approved" ? { ...n, finalStatus: null } : n)),
  transitions: v2.transitions,
});
check("گرهٔ پایان بدون وضعیت پایانی (D-4) ⇒ ۴۰۰", inv5.status === 400, `(${inv5.status}) ${inv5.json?.message ?? ""}`);

const inv6 = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: nodesNoDefault.concat([{ ...node("N4"), nodeCode: "N92", title: "گرهٔ معلق شرط" }]),
  transitions: v2.transitions,
});
check("گرهٔ غیرقابل‌دسترس ⇒ ۴۰۰", inv6.status === 400, `(${inv6.status}) ${inv6.json?.message ?? ""}`);

const countAfter = await call(WF, "GET", `/workflow-definitions/${v2.id}`);
check("هیچ‌کدام ذخیره نشد (۷ گره دست‌نخورده)", countAfter.json?.nodes?.length === 7);

/* ذخیرهٔ معتبر — ویرایش عنوان/SLA و آستانهٔ فرم (D-2) روی v2 */
const editedNodes = v2.nodes.map((n) =>
  n.nodeCode === "N2" ? { ...n, title: "رسیدگی حسابدار (ویرایش طراح — فاز ۴)", slaHours: 30 } : n,
);
const saveOk = await call(WF, "PUT", `/workflow-definitions/${v2.id}/graph`, {
  nodes: editedNodes,
  transitions: v2.transitions,
});
check("ذخیرهٔ دیاگرام معتبر روی v2 ⇒ ۲۰۰ با IDهای تازه", ok(saveOk) && saveOk.json?.nodes?.length === 7 && saveOk.json?.nodes?.every((n) => n.id > 0), saveOk.json?.message ?? "");
const savedN2 = saveOk.json?.nodes?.find((n) => n.nodeCode === "N2");
check("ویرایش عنوان و SLA اعمال شد", savedN2?.title?.includes("ویرایش طراح") && savedN2?.slaHours === 30);

const meta2 = await call(WF, "PUT", `/workflow-definitions/${v2.id}`, { name: "گردش رسیدگی سند (نسخهٔ طراح)", thresholdAmount: 100000000 });
check("متای نسخه (نام/آستانه) به‌روز شد", ok(meta2) && meta2.json?.thresholdAmount === 100000000);

/* فعال‌سازی نسخهٔ جدید — تک نسخهٔ فعال per فرم */
const act2 = await call(WF, "POST", `/workflow-definitions/${v2.id}/activate`, {});
check("فعال‌سازی نسخهٔ طراح موفق", ok(act2) && act2.json?.isActive === true, act2.json?.message ?? "");
const listAfterAct = await call(WF, "GET", "/workflow-definitions?entityType=voucher");
const baseAfter = listAfterAct.json?.items?.find((d) => d.id === base.id);
check("نسخهٔ مبنا پس از فعال‌سازی خاموش شد", baseAfter?.isActive === false);
const catAfter = await call(WF, "GET", "/workflow-catalog");
check("کاتالوگ: فرآیند فعال سند اکنون نسخهٔ طراح", catAfter.json?.items?.find((x) => x.entityType === "voucher")?.activeDefinition?.processVersion === v2.processVersion);

/* ---- ۴) اجرای موتور روی دیاگرام ذخیره‌شدهٔ طراح ---- */
console.log("۴) موتور روی دیاگرام طراح (مسیر تایید و رد):");
const vF = await call(ST, "POST", "/vouchers", mkVoucher(5, "60000"));
const startF = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vF.json?.id),
  startedBy: STARTER,
  formStatus: 5,
});
check("نمونهٔ تازه با نسخهٔ فعال جدید", ok(startF) && startF.json?.processVersion === v2.processVersion, `pv=${startF.json?.processVersion} ${startF.json?.message ?? ""}`);
const iF = startF.json?.id;
const appr1 = await call(WF, "POST", `/workflow-instances/${iF}/act`, { action: "تایید", actorId: "A1", actorName: "حسابدار تست" });
check("تایید حسابدار → رسیدگی سرپرست", ok(appr1) && appr1.json?.currentNode?.nodeCode === "N3", appr1.json?.message ?? "");
const appr2 = await call(WF, "POST", `/workflow-instances/${iF}/act`, { action: "تایید", actorId: "S1", actorName: "سرپرست تست" });
check("تایید سرپرست → شرط آستانه (۶۰هزار < ۱۰۰م ⇒ خیر → پایان موفق)", ok(appr2) && appr2.json?.currentState === "approved", appr2.json?.message ?? "");
check("وضعیت پایانی D-4 از گرهٔ پایان = ۴", appr2.json?.finalStatus === 4);
const vFStatus = await call(ST, "GET", `/vouchers/${vF.json?.id}/status`);
check("write-back سند = ۴ (دائمی)", vFStatus.json?.status === 4, `status=${vFStatus.json?.status}`);

const vR = await call(ST, "POST", "/vouchers", mkVoucher(5, "70000"));
const startR = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vR.json?.id),
  startedBy: STARTER,
  formStatus: 5,
});
const rej = await call(WF, "POST", `/workflow-instances/${startR.json?.id}/act`, {
  action: "رد",
  actorId: "A1",
  comment: "مدرک پشتیبان ناقص است",
});
check("مسیر رد روی دیاگرام طراح → rejected", ok(rej) && rej.json?.currentState === "rejected", rej.json?.message ?? "");
check("وضعیت پایانی گرهٔ رد = ۱ (ثبت اولیه)", rej.json?.finalStatus === 1);
const vRStatus = await call(ST, "GET", `/vouchers/${vR.json?.id}/status`);
check("write-back سند ردشده = ۱", vRStatus.json?.status === 1);

/* ---- ۵) layout روی نسخهٔ در استفاده + قواعد حذف/ساخت ---- */
console.log("۵) layout و قواعد حذف/ساخت:");
const layoutSave = await call(WF, "PUT", `/workflow-definitions/${base.id}/layout`, {
  positions: [{ nodeId: baseFull.json.nodes[0].id, posX: 400, posY: 50 }],
});
check("layout روی نسخهٔ در استفاده مجاز (نمایشی)", ok(layoutSave) && layoutSave.json?.count === 1);

const delBase = await call(WF, "DELETE", `/workflow-definitions/${base.id}`);
check("حذف نسخهٔ در استفاده ⇒ ۴۰۹", delBase.status === 409, `(${delBase.status})`);

const createContract = await call(WF, "POST", "/workflow-definitions", {
  code: `WF-CONTRACT-${RUN}`,
  name: "تست فرم غیرمشارکت",
  entityType: "contract",
});
check("ساخت فرآیند برای فرم غیرمشارکت ⇒ ۴۰۰", createContract.status === 400, `(${createContract.status})`);

const testDef = await call(WF, "POST", "/workflow-definitions", {
  code: `WF-T180-${RUN}`,
  name: "فرآیند تست فاز ۴",
  entityType: "voucher",
  thresholdAmount: 50000000,
});
check("ساخت فرآیند جدید با دیاگرام آغازین (۴ گره/۳ گذار)", ok(testDef) && testDef.json?.nodes?.length === 4 && testDef.json?.transitions?.length === 3, `(${testDef.status}) ${testDef.json?.message ?? ""}`);
const activateTest = await call(WF, "POST", `/workflow-definitions/${testDef.json?.id}/activate`, {});
check("فعال‌سازی فرآیند تست (دیاگرام آغازین معتبر)", ok(activateTest), activateTest.json?.message ?? "");
const delOnlyActive = await call(WF, "DELETE", `/workflow-definitions/${testDef.json?.id}`);
check("حذف تنها نسخهٔ فعال ⇒ ۴۰۰", delOnlyActive.status === 400, `(${delOnlyActive.status})`);
const reactivateV2 = await call(WF, "POST", `/workflow-definitions/${v2.id}/activate`, {});
check("بازگرداندن v2 به فعال", ok(reactivateV2));
const delTest = await call(WF, "DELETE", `/workflow-definitions/${testDef.json?.id}`);
check("حذف فرآیند تست بدون نمونه ⇒ ۲۰۰", ok(delTest), `(${delTest.status}) ${delTest.json?.message ?? ""}`);

console.log(`\nنتیجه: ${pass} ✓ / ${fail} ✗`);
if (fail > 0) process.exit(1);
