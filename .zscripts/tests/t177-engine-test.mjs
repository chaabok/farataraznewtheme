/**
 * t177 — E2E test of the workflow engine (mirrors BFF signing exactly).
 * گراف مرجع: N1شروع → N2رسیدگی → N3سرپرست → N4شرط آستانه → (بله)N5مدیر → N6پایان
 *                                                        ↘ (خیر) N6پایان
 *           N2 --رد--> N7پایان-رد (وضعیت ۱)
 * Run: cd /home/z/my-project && bun .zscripts/tests/t177-engine-test.mjs
 */
import { createHmac } from "node:crypto";

const BASE = "http://127.0.0.1:3004";
const KEY = "farataraz-internal-dev-key-2026";
const RUN = Date.now().toString().slice(-6); // شناسهٔ یکتای هر اجرا — تست قابل‌تکرار
const normalize = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
function headers(method, path) {
  const ts = Date.now().toString();
  const canonical = `${method.toUpperCase()}:${normalize(path)}:${ts}`;
  return {
    "content-type": "application/json",
    "x-internal-key": KEY,
    "x-internal-timestamp": ts,
    "x-internal-signature": createHmac("sha256", KEY).update(canonical).digest("hex"),
  };
}
async function call(method, path, body) {
  const [pathname] = path.split("?");
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(method, pathname), // امضا فقط روی path بدون query (قرارداد §4)
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
const vid = (n) => `V-${RUN}-${n}`;
const ok = (r) => r.status >= 200 && r.status < 300;

/* ۱. seed */
console.log("۱) Seed:");
const roles = await call("GET", "/workflow-roles");
check("۴ سمت seed شده", roles.status === 200 && roles.json.items.length >= 4, `(${roles.json?.items?.length})`);
check(
  "کدهای سمت پایه موجود",
  ["RS-ACCOUNTANT", "RS-MANAGER", "RS-REGISTRANT", "RS-SUPERVISOR"].every((c) =>
    roles.json.items.some((r) => r.code === c),
  ),
);
const sm = await call("GET", "/workflow-status-map?entityType=voucher");
check("۵ ردیف نگاشت وضعیت", sm.status === 200 && sm.json.items.length === 5);
check("گلوگاه ورود = وضعیت ۵", sm.json.items.some((r) => r.formStatus === 5 && r.gateType === "entry-gate"));
check("یادداشت خارج از چرخه", sm.json.items.some((r) => r.formStatus === 2 && r.gateType === "excluded"));
const defs = await call("GET", "/workflow-definitions?entityType=voucher");
/* t180 فاز ۴: طراح نسخه‌های تازه می‌سازد و فعال می‌کند — این آزمون فقط یک
   نسخهٔ فعال WF-VOUCHER لازم دارد (نسخه‌محور، نه وابسته به v1). */
check(
  "WF-VOUCHER فعال (یک نسخه)",
  defs.json.items.some((d) => d.code === "WF-VOUCHER" && d.isActive) &&
    defs.json.items.filter((d) => d.code === "WF-VOUCHER" && d.isActive).length === 1,
);
const defId = defs.json.items.find((d) => d.isActive)?.id ?? defs.json.items[0].id;
const defDetail = await call("GET", `/workflow-definitions/${defId}`);
check("۷ گره / ۷ گذار", defDetail.json.nodes.length === 7 && defDetail.json.transitions.length === 7);
check("آستانهٔ per فرم = ۱۰۰ میلیون", defDetail.json.thresholdAmount === 100000000);

/* ۲. تخصیص کاربران */
console.log("۲) تخصیص:");
for (const [role, uid, name] of [
  ["RS-ACCOUNTANT", "A1", "علی حسابدار"],
  ["RS-SUPERVISOR", "S1", "زهرا سرپرست"],
  ["RS-MANAGER", "M1", "حسن مدیر"],
]) {
  const r = await call("PUT", "/workflow-roles/assignments", {
    mode: "replace",
    roleCode: role,
    rows: [{ userId: uid, userName: name }],
  });
  check(`تخصیص ${role}→${uid}`, r.status === 200 && r.json.items.length === 1);
}
const badAssign = await call("PUT", "/workflow-roles/assignments", {
  mode: "replace",
  roleCode: "RS-ACCOUNTANT",
  rows: [
    { userId: "X1" },
    { userId: "X1" },
  ],
});
check("رد تخصیص تکراری", badAssign.status === 400);

/* ۳. ورود — گلوگاه (D-3) */
console.log("۳) ورود (D-3):");
const dup = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(1), entityLabel: "سند یادداشتی",
  startedBy: "R1", startedByName: "رضا ثبت‌کننده", formStatus: 2,
});
check("یادداشت (۲) رد می‌شود", dup.status === 400 && String(dup.json.message).includes("D-3"));
const pre = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(1), startedBy: "R1", formStatus: 1,
});
check("ثبت اولیه (۱) رد می‌شود", pre.status === 400);
const fin = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(1), startedBy: "R1", formStatus: 3,
});
check("تاییدشده (۳) رد می‌شود (فقط موتور)", fin.status === 400);
const start1 = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(1), entityLabel: "سند زیر آستانه",
  startedBy: "R1", startedByName: "رضا ثبت‌کننده", formStatus: 5, amount: 50_000_000,
});
check(
  "تایید کاربر (۵) + ارسال به رسیدگی ⇒ شروع",
  ok(start1) && start1.json.currentState === "running",
  `#${start1.json?.id}`,
);
check(
  "پارک روی گام رسیدگی حسابدار",
  start1.json.currentNode?.roleCode === "RS-ACCOUNTANT",
  start1.json?.currentNode?.title ?? "",
);
const log0 = start1.json.logs[0];
check("اقدام آغازین ثبت شد", log0.action === "ارسال به رسیدگی" && log0.actorId === "R1");
check("ابلاغ به حسابدار ساخته شد", start1.json.notifications.some((n) => n.recipientUserId === "A1"));
const dupRunning = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(1), startedBy: "R1", formStatus: 5,
});
check("نمونهٔ دوم برای همان سند رد می‌شود (FR-06)", dupRunning.status === 400);

/* ۴. قفل نقش + مسیر زیر آستانه */
console.log("۴) قفل نقش (FR-06) و مسیر زیر آستانه:");
const wrong = await call("POST", `/workflow-instances/${start1.json.id}/act`, {
  action: "تایید", actorId: "M1", actorName: "حسن مدیر",
});
check("اقدام غیردارندهٔ سمت ⇒ 403", wrong.status === 403);
const a1 = await call("POST", `/workflow-instances/${start1.json.id}/act`, {
  action: "تایید", actorId: "A1", actorName: "علی حسابدار",
});
check(
  "تایید حسابدار ⇒ پارک روی سرپرست",
  ok(a1) && a1.json.currentNode?.roleCode === "RS-SUPERVISOR",
  a1.json?.currentNode?.title ?? "",
);
const noAmount = await call("POST", `/workflow-instances/${start1.json.id}/act`, {
  action: "تایید", actorId: "S1",
});
check(
  "تایید سرپرست بدون amount هنگام عبور از شرط ⇒ 400 (کنترل مالی)",
  noAmount.status === 400 && String(noAmount.json.message).includes("amount"),
);
const a2 = await call("POST", `/workflow-instances/${start1.json.id}/act`, {
  action: "تایید", actorId: "S1", actorName: "زهرا سرپرست", amount: 50_000_000,
});
check(
  "زیر آستانه ⇒ شرط «خیر» ⇒ پایان مستقیم",
  ok(a2) && a2.json.currentState === "approved",
  a2.json?.currentState,
);
check("وضعیت پایانی = ۴ (گرهٔ پایان — D-4)", a2.json.finalStatus === 4, String(a2.json.finalStatus));
check(
  "سوابق شامل تایید سرپرست و شرط خیر",
  a2.json.logs.some((l) => l.action === "تایید") && a2.json.logs.some((l) => l.action === "خیر"),
);

/* ۵. مسیر آستانه (D-2) */
console.log("۵) شرط آستانهٔ per فرم (D-2):");
const start2 = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(2), entityLabel: "سند بالای آستانه",
  startedBy: "R1", startedByName: "رضا ثبت‌کننده", formStatus: 5, amount: 150_000_000,
});
const b1 = await call("POST", `/workflow-instances/${start2.json.id}/act`, {
  action: "تایید", actorId: "A1", actorName: "علی حسابدار", amount: 150_000_000,
});
check(
  "تایید حسابدار ⇒ پارک روی سرپرست",
  ok(b1) && b1.json.currentNode?.roleCode === "RS-SUPERVISOR",
  b1.json?.currentNode?.title ?? "",
);
const b2 = await call("POST", `/workflow-instances/${start2.json.id}/act`, {
  action: "تایید", actorId: "S1", actorName: "زهرا سرپرست", amount: 150_000_000,
});
check(
  "تایید سرپرست + شرط «بله» ⇒ پارک روی مدیر",
  ok(b2) && b2.json.currentNode?.roleCode === "RS-MANAGER",
  b2.json?.currentNode?.title ?? "",
);
check("ابلاغ به مدیر ساخته شد", b2.json.notifications.some((n) => n.recipientUserId === "M1"));
const b3 = await call("POST", `/workflow-instances/${start2.json.id}/act`, {
  action: "تایید", actorId: "M1", actorName: "حسن مدیر",
});
check(
  "تایید مدیر ⇒ پایان approved/۴",
  ok(b3) && b3.json.currentState === "approved" && b3.json.finalStatus === 4,
);
check("اطلاع پایان به آغازگر", b3.json.notifications.some((n) => n.recipientUserId === "R1"));

/* ۶. رد با دلیل اجباری (FR-05) */
console.log("۶) رد (FR-05):");
const start3 = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(3), entityLabel: "سند مردودی",
  startedBy: "R1", formStatus: 5, amount: 10,
});
const rejNoComment = await call("POST", `/workflow-instances/${start3.json.id}/act`, {
  action: "رد", actorId: "A1",
});
check("رد بدون دلیل ⇒ 400", rejNoComment.status === 400);
const rej = await call("POST", `/workflow-instances/${start3.json.id}/act`, {
  action: "رد", actorId: "A1", actorName: "علی حسابدار", comment: "مبلغ بدهکار با مدرک مطابقت ندارد",
});
check(
  "رد با دلیل ⇒ rejected و وضعیت پایانی ۱ (برگشت به ثبت اولیه)",
  ok(rej) && rej.json.currentState === "rejected" && rej.json.finalStatus === 1,
);
check("تاریخچهٔ رد ثبت شد", rej.json.logs.some((l) => l.action === "رد" && l.comment.includes("مطابقت ندارد")));
check("اطلاع برگشت به ثبت‌کننده", rej.json.notifications.some((n) => n.recipientUserId === "R1"));
const reRestart = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(3), startedBy: "R1", formStatus: 5, amount: 10,
});
check("پس از رد، شروع مجدد ممکن است (نمونهٔ تازه)", ok(reRestart));

/* ۷. ابطال (FR-13) */
console.log("۷) ابطال (FR-13):");
const cancelByOther = await call("POST", `/workflow-instances/${reRestart.json.id}/act`, {
  action: "ابطال", actorId: "A1", comment: "تست",
});
check("ابطال توسط غیرآغازگر ⇒ 403", cancelByOther.status === 403);
const cancelNoReason = await call("POST", `/workflow-instances/${reRestart.json.id}/act`, {
  action: "ابطال", actorId: "R1",
});
check("ابطال بدون دلیل ⇒ 400", cancelNoReason.status === 400);
const cancel = await call("POST", `/workflow-instances/${reRestart.json.id}/act`, {
  action: "ابطال", actorId: "R1", actorName: "رضا", comment: "سند اشتباهی بود",
});
check("ابطال توسط آغازگر ⇒ cancelled", ok(cancel) && cancel.json.currentState === "cancelled");
const afterCancel = await call("POST", "/workflow-instances", {
  entityType: "voucher", entityId: vid(3), startedBy: "R1", formStatus: 5, amount: 10,
});
check("پس از ابطال، شروع مجدد ممکن است", ok(afterCancel));

/* ۸. CRUD سمت */
console.log("۸) CRUD سمت:");
const created = await call("POST", "/workflow-roles", {
  code: `RS-AUDITOR-${RUN}`, title: "حسابرس داخلی", description: "تست t177",
});
check("ایجاد سمت جدید", ok(created) && created.json.id > 0);
const dupRole = await call("POST", "/workflow-roles", {
  code: `RS-AUDITOR-${RUN}`, title: "تکراری",
});
check("کد تکراری ⇒ 400", dupRole.status === 400);
const upd = await call("PUT", `/workflow-roles/${created.json.id}`, {
  title: "حسابرس داخلی (ویراسته)",
});
check("ویرایش سمت", ok(upd) && upd.json.title.includes("ویراسته"));
const delUsed = await call("DELETE", `/workflow-roles/${created.json.id}`);
check("حذف سمت بلااستفاده مجاز", delUsed.status === 200);
const sysRole = roles.json.items.find((r) => r.code === "RS-ACCOUNTANT");
const delSys = await call("DELETE", `/workflow-roles/${sysRole.id}`);
check("حذف سمت سیستمی/درحال‌استفاده ⇒ 400", delSys.status === 400);

console.log(`\n=== نتیجه: ${pass} ✓ / ${fail} ✗ ===`);
process.exit(fail > 0 ? 1 : 0);
