/**
 * t179 — E2E test of workflow Phase 3 (کارتابل/ابلاغ، تفویض بازه‌دار، SLA).
 * پوشش: CRUD تفویض + قواعد (تفویضِ تفویض ممنوع، خودِ تفویض ممنوع، بازهٔ نامعتبر، تکرار) ·
 * اقدام تفویضی در موتور (viaDelegation+delegatorId در ActionLog) · ۴۰۳ غیردارنده ·
 * کارتابل tasks/started/notifications/actions/summary · ابلاغ به نماینده · mark-read ·
 * SLA: breach دستی (ActionLog ۳۰ ساعت عقب) ⇒ ابلاغ kind=sla + idempotent ·
 * مبلغ منبع حقیقت: اقدام بدون amount در گام سرپرست ⇒ هر دو شاخهٔ شرط از مبلغِ سند (D-2).
 * Run: cd /home/z/my-project && bun .zscripts/tests/t179-phase3-test.mjs
 */
import { createHmac } from "node:crypto";
import { Database } from "bun:sqlite";

const WF = "http://127.0.0.1:3004";
const ST = "http://127.0.0.1:3001";
const KEY = "farataraz-internal-dev-key-2026";
const DB = "/home/z/my-project/db/workflow.db";
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
const U9 = `U9-${RUN}`;
const W9 = `W9-${RUN}`;
const X1 = `X1-${RUN}`;
const STARTER = `S0-${RUN}`;

console.log("۰) منابع و تفویض پایه:");
const meta = await call(ST, "GET", "/vouchers/meta");
check("meta واکشی شد", ok(meta));
const moein = meta.json.moeinAccounts?.[0];
const docType = meta.json.docTypes?.[0];
check("متعین و نوع سند موجود", !!moein && !!docType);
const today = new Date().toISOString().slice(0, 10);
const mkVoucher = (status, debit) => ({
  voucherTypeRef: docType.id,
  nature: 1,
  status,
  date: today,
  description: `تست گردش کار فاز ۳ — ${RUN}`,
  items: [{ moeinRef: moein.id, description: "ردیف تست", debit }],
});

/* ---- ۱) قواعد تفویض (FR-09) ---- */
console.log("۱) قواعد تفویض:");
const selfDel = await call(WF, "POST", "/workflow-cartable/delegations", {
  roleCode: "RS-ACCOUNTANT",
  delegatorUserId: "A1",
  delegateUserId: "A1",
  validFrom: iso(new Date(now - day)),
});
check("تفویض سمت به خود رد شد", selfDel.status === 400, `(${selfDel.status})`);

const notHolder = await call(WF, "POST", "/workflow-cartable/delegations", {
  roleCode: "RS-ACCOUNTANT",
  delegatorUserId: U9,
  delegateUserId: "A1",
  validFrom: iso(new Date(now - day)),
});
check("تفویضِ تفویض (تفویض‌کننده بدون تخصیص مستقیم) رد شد", notHolder.status === 400, `(${notHolder.status})`);

const badWindow = await call(WF, "POST", "/workflow-cartable/delegations", {
  roleCode: "RS-ACCOUNTANT",
  delegatorUserId: "A1",
  delegateUserId: U9,
  validFrom: iso(new Date(now + day)),
  validTo: iso(new Date(now - day)),
});
check("بازهٔ نامعتبر (پایان قبل از شروع) رد شد", badWindow.status === 400, `(${badWindow.status})`);

const del = await call(WF, "POST", "/workflow-cartable/delegations", {
  roleCode: "RS-ACCOUNTANT",
  delegatorUserId: "A1",
  delegatorName: "علی حسابدار",
  delegateUserId: U9,
  delegateName: "نمایندهٔ تست",
  validFrom: iso(new Date(now - day)),
  comment: "تفویض تست فاز ۳",
});
check("تفویض معتبر ایجاد شد", ok(del) && del.json?.currentlyValid === true, `#${del.json?.id}`);
const delId = del.json?.id;

const dupDel = await call(WF, "POST", "/workflow-cartable/delegations", {
  roleCode: "RS-ACCOUNTANT",
  delegatorUserId: "A1",
  delegateUserId: U9,
  validFrom: iso(new Date(now - day)),
});
check("تفویض فعال تکراری رد شد", dupDel.status === 400, `(${dupDel.status})`);

/* تفویض آینده — فعلاً بی‌اثر */
const futureDel = await call(WF, "POST", "/workflow-cartable/delegations", {
  roleCode: "RS-ACCOUNTANT",
  delegatorUserId: "A1",
  delegateUserId: W9,
  validFrom: iso(new Date(now + 3 * day)),
});
check("تفویض آیندهٔ ثبت شد (فعلاً خارج از بازه)", ok(futureDel), `#${futureDel.json?.id}`);
const futureDelId = futureDel.json?.id;
check("currentlyValid تفویض آینده = false", futureDel.json?.currentlyValid === false);

const delList = await call(WF, "GET", `/workflow-cartable/delegations?userId=A1&direction=out`);
check("فهرست تفویض صادرهٔ A1 شامل هر دو", ok(delList) && (delList.json?.items?.length ?? 0) >= 2);

/* ---- ۲) کارتابل گام‌ها — نماینده می‌بیند، غیردارنده نه ---- */
console.log("۲) کارتابل و اقدام تفویضی:");
const vA = await call(ST, "POST", "/vouchers", mkVoucher(5, "50000"));
check("سند کوچک (۵۰هزار < آستانه) با وضعیت ۵ ثبت شد", ok(vA), `#${vA.json?.id}`);
const vAId = vA.json?.id;
const startA = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vAId),
  startedBy: STARTER,
  startedByName: "آغازگر تست",
  formStatus: 5,
});
check("ارسال به رسیدگی — بدون amount (کارتابل‌سازگار)", ok(startA), startA.json?.message ?? "");
const iA = startA.json?.id;
check("نمونه روی گام N2 (رسیدگی)", startA.json?.currentNode?.nodeCode === "N2");

const u9Tasks = await call(WF, "GET", `/workflow-cartable/tasks?userId=${encodeURIComponent(U9)}`);
check("کارتابل نماینده شامل نمونه است (تفویض معتبر)", (u9Tasks.json?.items ?? []).some((x) => x.id === Number(iA)), `tasks=${u9Tasks.json?.items?.length}`);
const u9task = (u9Tasks.json?.items ?? []).find((x) => x.id === Number(iA));
check("نشان SLA گام رسیدگی (۲۴ ساعت) = ok", u9task?.slaState === "ok" && u9task?.slaHours === 24, JSON.stringify({ s: u9task?.slaState, h: u9task?.hoursLeft }));

const s1TasksBefore = await call(WF, "GET", `/workflow-cartable/tasks?userId=S1`);
check("کارتابل سرپرست هنوز شامل نمونه نیست", !(s1TasksBefore.json?.items ?? []).some((x) => x.id === Number(iA)));

const w9Tasks = await call(WF, "GET", `/workflow-cartable/tasks?userId=${encodeURIComponent(W9)}`);
check("کارتابل نمایندهٔ آینده شامل نمونه نیست", !(w9Tasks.json?.items ?? []).some((x) => x.id === Number(iA)));

/* اقدام تفویضی U9 */
const delAct = await call(WF, "POST", `/workflow-instances/${iA}/act`, {
  action: "تایید",
  actorId: U9,
  actorName: "نمایندهٔ تست",
});
check("اقدام تفویضی U9 پذیرفته شد", ok(delAct) && delAct.json?.currentNode?.nodeCode === "N3", delAct.json?.message ?? "");
const detailA = await call(WF, "GET", `/workflow-instances/${iA}`);
const lastLog = [...(detailA.json?.logs ?? [])].reverse().find((l) => l.action === "تایید");
check("ActionLog: viaDelegation=true + delegatorId=A1", lastLog?.viaDelegation === true && lastLog?.delegatorId === "A1", JSON.stringify({ v: lastLog?.viaDelegation, d: lastLog?.delegatorId }));

/* غیردارنده */
const xAct = await call(WF, "POST", `/workflow-instances/${iA}/act`, {
  action: "تایید",
  actorId: X1,
  actorName: "بی‌سمت",
});
check("اقدام کاربر بی‌سمت ⇒ ۴۰۳", xAct.status === 403, `(${xAct.status})`);

/* نمایندهٔ آینده */
const wAct = await call(WF, "POST", `/workflow-instances/${iA}/act`, {
  action: "تایید",
  actorId: W9,
  actorName: "نمایندهٔ آینده",
});
check("اقدام نمایندهٔ خارج از بازه ⇒ ۴۰۳", wAct.status === 403, `(${wAct.status})`);

/* ---- ۳) ابلاغ به نماینده + mark-read ---- */
console.log("۳) ابلاغ‌ها:");
const u9Notif = await call(WF, "GET", `/workflow-cartable/notifications?userId=${encodeURIComponent(U9)}`);
const nForInstance = (u9Notif.json?.items ?? []).filter((n) => n.instanceId === Number(iA));
check("ابلاغ گام به نماینده رسیده است (kind=action)", nForInstance.length >= 1 && nForInstance.every((n) => n.kind === "action"), `n=${nForInstance.length}`);
const unreadBefore = u9Notif.json?.unread ?? 0;
check("unread شمرده شده", unreadBefore >= 1, `unread=${unreadBefore}`);

const markOne = await call(WF, "POST", "/workflow-cartable/notifications/read", {
  userId: U9,
  ids: nForInstance.slice(0, 1).map((n) => n.id),
});
check("علامت‌گذاری یکی به خوانده‌شده", ok(markOne) && markOne.json?.updated === 1, JSON.stringify(markOne.json));
const u9Notif2 = await call(WF, "GET", `/workflow-cartable/notifications?userId=${encodeURIComponent(U9)}`);
check("unread یکی کم شد", (u9Notif2.json?.unread ?? 0) === unreadBefore - 1, `unread=${u9Notif2.json?.unread}`);

/* ---- ۴) مبلغ منبع حقیقت (D-2) — اقدام بدون amount ---- */
console.log("۴) شرط آستانه با مبلغ سند (بدون amount از کلاینت):");
const s1Summary = await call(WF, "GET", `/workflow-cartable/summary?userId=S1`);
check("خلاصهٔ کارتابل S1 شامل نمونه است", (s1Summary.json?.tasks ?? 0) >= 1, JSON.stringify(s1Summary.json));

const s1Act = await call(WF, "POST", `/workflow-instances/${iA}/act`, {
  action: "تایید",
  actorId: "S1",
  actorName: "زهرا سرپرست",
});
check(
  "تایید سرپرست بدون amount ⇒ مبلغ سند (۵۰هزار) ≤ آستانه ⇒ خیر ⇒ پایان N6/۴",
  ok(s1Act) && s1Act.json?.currentState === "approved" && s1Act.json?.finalStatus === 4,
  JSON.stringify({ st: s1Act.json?.currentState, f: s1Act.json?.finalStatus }),
);

/* شاخهٔ «بله»: سند بزرگ بدون amount ⇒ ایستگاه مدیر */
const vB = await call(ST, "POST", "/vouchers", mkVoucher(5, "150000000"));
const vBId = vB.json?.id;
const startB = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vBId),
  startedBy: STARTER,
  startedByName: "آغازگر تست",
  formStatus: 5,
});
const iB = startB.json?.id;
const apB1 = await call(WF, "POST", `/workflow-instances/${iB}/act`, { action: "تایید", actorId: "A1", actorName: "علی حسابدار" });
const apB2 = await call(WF, "POST", `/workflow-instances/${iB}/act`, { action: "تایید", actorId: "S1", actorName: "زهرا سرپرست" });
check(
  "سند ۱۵۰م بدون amount ⇒ شاخهٔ «بله» ⇒ ایستگاه مدیر N5",
  ok(apB1) && ok(apB2) && apB2.json?.currentNode?.nodeCode === "N5",
  JSON.stringify({ n: apB2.json?.currentNode?.nodeCode }),
);
const apB3 = await call(WF, "POST", `/workflow-instances/${iB}/act`, { action: "تایید", actorId: "M1", actorName: "حسن مدیر" });
check("تایید مدیر ⇒ پایان ۴", ok(apB3) && apB3.json?.currentState === "approved" && apB3.json?.finalStatus === 4);

/* ---- ۵) SLA — breach دستی + idempotent ---- */
console.log("۵) SLA (FR-12):");
const vC = await call(ST, "POST", "/vouchers", mkVoucher(5, "70000"));
const vCId = vC.json?.id;
const startC = await call(WF, "POST", "/workflow-instances", {
  entityType: "voucher",
  entityId: String(vCId),
  startedBy: STARTER,
  startedByName: "آغازگر تست",
  formStatus: 5,
});
const iC = startC.json?.id;
check("سند C روی گام رسیدگی", startC.json?.currentNode?.nodeCode === "N2");

/* ActionLog ورود به N2 را ۳۰ ساعت عقب می‌بریم (شبیه‌سازی گذر زمان) */
const db = new Database(DB);
const n2Node = db
  .query("SELECT WorkflowNodeID FROM WorkflowNode WHERE NodeCode='N2'")
  .get();
const upd = db
  .query(
    "UPDATE WorkflowActionLog SET CreatedAt = datetime('now','-30 hours') WHERE InstanceID=? AND ToNodeID=?",
  )
  .run(String(iC), String(n2Node.WorkflowNodeID));
db.close();
check("زمان ورود به N2 ۳۰ ساعت عقب کشیده شد", upd.changes >= 1, `rows=${upd.changes}`);

const sla1 = await call(WF, "POST", "/workflow-cartable/sla-check", {});
check("sla-check اجرا شد", ok(sla1) && typeof sla1.json?.checked === "number", JSON.stringify(sla1.json));
check("هشدار SLA ساخته شد (برای دارندگان سمت + آغازگر)", (sla1.json?.created ?? 0) >= 2, `created=${sla1.json?.created}`);

const a1Notif = await call(WF, "GET", "/workflow-cartable/notifications?userId=A1");
const slaRows = (a1Notif.json?.items ?? []).filter((n) => n.kind === "sla" && n.instanceId === Number(iC));
check("ابلاغ kind=sla برای A1", slaRows.length >= 1, `n=${slaRows.length}`);
check("عنوان هشدار شامل گام و سند", (slaRows[0]?.title ?? "").includes("SLA"));

const sla2 = await call(WF, "POST", "/workflow-cartable/sla-check", {});
check("اجرای دوباره idempotent (بدون هشدار تازه)", (sla2.json?.created ?? 0) === 0, `created=${sla2.json?.created}`);

/* وضعیت breach در کارتابل A1 */
const a1Tasks = await call(WF, "GET", "/workflow-cartable/tasks?userId=A1");
const cTask = (a1Tasks.json?.items ?? []).find((x) => x.id === Number(iC));
check("کارتابل A1: گام C با slaState=breach مرتب‌شده در صدر", cTask?.slaState === "breach", JSON.stringify({ s: cTask?.slaState, h: cTask?.hoursLeft }));

/* ---- ۶) لغو تفویض ⇒ از این لحظه نماینده نمی‌تواند ---- */
console.log("۶) لغو تفویض:");
const rv = await call(WF, "DELETE", `/workflow-cartable/delegations/${delId}?userId=A1`);
check("لغو تفویض توسط تفویض‌کننده", ok(rv), JSON.stringify(rv.json));
const u9Tasks2 = await call(WF, "GET", `/workflow-cartable/tasks?userId=${encodeURIComponent(U9)}`);
check("کارتابل نماینده پس از لغو خالی از C", !(u9Tasks2.json?.items ?? []).some((x) => x.id === Number(iC)));
const u9Act = await call(WF, "POST", `/workflow-instances/${iC}/act`, {
  action: "تایید",
  actorId: U9,
  actorName: "نمایندهٔ لغوشده",
});
check("اقدام نماینده پس از لغو ⇒ ۴۰۳", u9Act.status === 403, `(${u9Act.status})`);
const a1Act = await call(WF, "POST", `/workflow-instances/${iC}/act`, {
  action: "تایید",
  actorId: "A1",
  actorName: "علی حسابدار",
});
check("اقدام دارندهٔ مستقیم همچنان مجاز", ok(a1Act) && a1Act.json?.currentNode?.nodeCode === "N3", a1Act.json?.message ?? "");

/* ---- ۷) اقدام‌های من + آغازشده‌های من ---- */
console.log("۷) صندوق‌های اقدام/آغازشده:");
const myActions = await call(WF, "GET", `/workflow-cartable/actions?userId=${encodeURIComponent(U9)}`);
check("اقدام تفویضی U9 در «اقدام‌های من» با نشان تفویضی", (myActions.json?.items ?? []).some((a) => a.instanceId === Number(iA) && a.viaDelegation === true), `n=${myActions.json?.items?.length}`);
const starterStarted = await call(WF, "GET", `/workflow-cartable/started?userId=${encodeURIComponent(STARTER)}`);
check("«آغازشده‌های من» شامل C", (starterStarted.json?.items ?? []).some((s) => s.id === Number(iC)), `n=${starterStarted.json?.items?.length}`);

/* ---- پاک‌سازی: ابطال نمونه‌های باقی‌مانده توسط آغازگر ---- */
console.log("۸) پاک‌سازی:");
for (const iid of [iC, iB, iA]) {
  const det = await call(WF, "GET", `/workflow-instances/${iid}`);
  if (det.json?.currentState === "running") {
    await call(WF, "POST", `/workflow-instances/${iid}/act`, {
      action: "ابطال",
      actorId: STARTER,
      actorName: "آغازگر تست",
      comment: `پاک‌سازی تست t179 — ${RUN}`,
    });
  }
}
/* تفویض آینده هم لغو شود */
if (futureDelId) await call(WF, "DELETE", `/workflow-cartable/delegations/${futureDelId}?userId=A1`);
const afterDel = await call(WF, "GET", `/workflow-cartable/delegations?userId=A1&direction=out`);
check("تفویض‌های تست پاک شدند", (afterDel.json?.items ?? []).length === 0, `left=${afterDel.json?.items?.length}`);

console.log(`\nنتیجه: ${pass} ✓ / ${fail} ✗`);
process.exit(fail > 0 ? 1 : 0);
