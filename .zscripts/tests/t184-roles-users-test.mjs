/**
 * Task t184 — راستی‌آزمایی سرویس‌سایدِ دراپ‌دان کاربرانِ تب «تخصیص کاربران»:
 * فرمان مالک: «در ستون نام کاربر با دراپ‌دان، لیست کاربران تعریف‌شده در فرم
 * کاربران نمایش داده شود؛ هر کاربر به هر سمت یکبار می‌تواند تخصیص یابد».
 * ① سلامت workflow-service ② منبع دراپ‌دان = GET user (فرم کاربران) با items≥1
 * ③ چرخهٔ کامل تخصیص دو کاربر متمایز روی سمت آزمونی + نام‌های ذخیره‌شده
 * ④ سنگر یکتایی سرویس: PUT با کاربر تکراری ⇒ 400  ⑤ پاک‌سازی سمت آزمونی.
 * اجرا: node .zscripts/tests/t184-roles-users-test.mjs
 * (فراخوانی :3004 با امضای داخلی §4 — همان قرارداد BFF)
 */
import { createHmac } from "node:crypto";

const WF = "http://127.0.0.1:3004";
const BFF = "http://127.0.0.1:3000/api/settings";
const KEY = "farataraz-internal-dev-key-2026";

const normalize = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
function signedHeaders(method, path) {
  const ts = Date.now().toString();
  const canonical = `${method.toUpperCase()}:${normalize(path)}:${ts}`;
  return {
    "content-type": "application/json",
    "x-internal-key": KEY,
    "x-internal-timestamp": ts,
    "x-internal-signature": createHmac("sha256", KEY).update(canonical).digest("hex"),
  };
}

let pass = 0, fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`  ✓ ${label}${extra ? " — " + extra : ""}`); }
  else { fail++; console.error(`  ✗ ${label}${extra ? " — " + extra : ""}`); }
};

const j = async (url, init) => {
  const res = await fetch(url, init);
  let body = null;
  try { body = await res.json(); } catch { /* — */ }
  return { status: res.status, body };
};

/** فراخوانی امضاشدهٔ سرویس گردش کار (امضا فقط روی path بدون query — §4) */
const wfCall = async (method, path, body) => {
  const [pathname] = path.split("?");
  return j(`${WF}${path}`, {
    method,
    headers: signedHeaders(method, pathname),
    body: body ? JSON.stringify(body) : undefined,
  });
};

console.log("── t184 — دراپ‌دان کاربران تخصیص سمت گردش کار ──");

/* ① سلامت سرویس */
const health = await j(`${WF}/health`);
ok(health.status === 200 && health.body?.status === "ok", "workflow-service :3004 سلامت");

/* ② منبع دراپ‌دان: کاربرانِ «فرم کاربران» */
const users = await j(`${BFF}/user`);
const items = users.body?.items ?? [];
ok(users.status === 200 && items.length >= 1, `GET user (منبع دراپ‌دان) — ${items.length} کاربر`);
ok(items.every((u) => u.id != null && (u.fullName || u.username)), "هر کاربر id/نام دارد (برچسب دراپ‌دان)");
const uniqIds = new Set(items.map((u) => String(u.id)));
ok(uniqIds.size === items.length, "شناسهٔ کاربران یکتاست (value گزینه‌ها)");

/* ③ سمت آزمونی + تخصیص دو کاربر متمایز */
const code = `RS-T184-${Date.now() % 100000}`;
const created = await wfCall("POST", "/workflow-roles", { code, title: "سمت آزمون t184", description: "تست دراپ‌دان کاربران", isActive: true });
ok(created.status === 201 || created.status === 200, `POST سمت آزمونی ${code}`, `id=${created.body?.id ?? "?"}`);
const roleId = created.body?.id ?? created.body?.workflowRoleId;

const pick = items.slice(0, 2);
const label = (u) => `${(u.fullName || "").trim()}${u.username ? ` (${u.username})` : ""}`;
const rows = pick.map((u) => ({
  userId: String(u.id),
  userName: label(u),
  validFrom: "2026/01/01",
  validTo: "",
}));
const put1 = await wfCall("PUT", "/workflow-roles/assignments", { mode: "replace", roleCode: code, rows });
ok(put1.status === 200 || put1.status === 201, "PUT دو تخصیص متمایز ⇒ ۲xx");

const got = await wfCall("GET", `/workflow-roles/assignments/${encodeURIComponent(code)}`);
const gitems = got.body?.items ?? [];
ok(got.status === 200 && gitems.length === 2, `GET تخصیص‌ها — ${gitems.length} ردیف`);
ok(gitems.every((a) => a.userName && a.userName.length <= 120), "نام‌های ذخیره‌شده resolve/موجود", gitems.map((a) => a.userName).join(" | "));
ok(new Set(gitems.map((a) => a.userId)).size === 2, "دو userId متمایز ذخیره شد");

/* ④ سنگر یکتایی: کاربر تکراری در یک PUT ⇒ 400 */
const dup = await wfCall("PUT", "/workflow-roles/assignments", {
  mode: "replace",
  roleCode: code,
  rows: [
    { userId: String(pick[0].id), userName: label(pick[0]), validFrom: "", validTo: "" },
    { userId: String(pick[0].id), userName: label(pick[0]), validFrom: "", validTo: "" },
  ],
});
ok(dup.status === 400, "PUT کاربر تکراری (یک سمت) ⇒ 400 «هر کاربر به هر سمت یکبار»", `status=${dup.status}`);

/* ⑤ پاک‌سازی سمت آزمونی */
if (roleId != null) {
  const del = await wfCall("DELETE", `/workflow-roles/${roleId}`);
  ok(del.status === 200 || del.status === 201 || del.status === 204, "DELETE سمت آزمونی (پاک‌سازی)");
} else {
  console.error("  ! سمت آزمونی بدون id — پاک‌سازی دستی لازم است:", code);
}

console.log(`\nنتیجه: ${pass} ✓ / ${fail} ✗`);
process.exit(fail === 0 ? 0 : 1);
