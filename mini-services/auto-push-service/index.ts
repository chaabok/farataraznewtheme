/**
 * auto-push-service — پوش خودکار آخرین تغییرات سورس/دیتابیس به GitHub
 * ------------------------------------------------------------------
 * درخواست مالک (Task 66): «بصورت خودکار آخرین تغییرات در سورس یا دیتابیس
 * اتفاق افتاده را به گیت‌هاب پوش کنید».
 *
 * چرخهٔ هر تیک:
 *   ۱) تشخیص تغییر: git status (سورس) + sha256 زندهٔ db/*.db (دیتابیس)
 *   ۲) اگر تغییری نبود → بی‌کار (هیچ بک‌آپی ساخته نمی‌شود)
 *   ۳) اجرای scripts/db-backup.sh  — قانون §0.9: پیش از هر پوش، بک‌آپ زمان‌دار تهران
 *   ۴) ذخیرهٔ hash تازهٔ db‌ها در db-state.json (داخل کامیت می‌رود)
 *   ۵) git add -A → commit پیام‌دار (زمان تهران + آمار تغییر)
 *   ۶) هم‌گام‌سازی با origin/main (fetch + rebase در صورت عقب‌ماندگی) → push
 *
 * HTTP وضعیت روی پورت 3010:
 *   GET  /           → وضعیت سرویس + لاگ آخرین چرخه‌ها
 *   POST /run-now    → اجرای فوری یک چرخه (برای تست/اجرای دستی)
 *
 * فاصلهٔ پیش‌فرض: ۱۰ دقیقه (متغیر محیطی AUTO_PUSH_INTERVAL_MS).
 */

import { join, resolve } from "node:path";
import { readdirSync, openSync } from "node:fs";
import { spawn as nodeSpawn } from "node:child_process";

const ROOT = resolve(import.meta.dir, "..", "..");
const SERVICE_PORT = 3010;
const INTERVAL_MS = Number(process.env.AUTO_PUSH_INTERVAL_MS ?? 600_000);
const FIRST_DELAY_MS = 20_000;
const STATE_FILE = join(import.meta.dir, "db-state.json");
const CMD_TIMEOUT_MS = 120_000;

/* ---------------------------- logging ---------------------------- */

type LogLine = { at: string; msg: string };
const logs: LogLine[] = [];

function tehranNow(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Tehran", hour12: false }).replace("T", " ");
}

function log(msg: string): void {
  const at = tehranNow();
  logs.push({ at, msg });
  if (logs.length > 80) logs.splice(0, logs.length - 80);
  console.log(`[auto-push ${at}] ${msg}`);
}

/* ---------------------------- process helpers ---------------------------- */

type RunResult = { code: number; out: string; err: string };

async function run(cmd: string[]): Promise<RunResult> {
  const proc = Bun.spawn(cmd, { cwd: ROOT, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const timer = setTimeout(() => {
    try {
      proc.kill(9);
    } catch {
      /* already exited */
    }
  }, CMD_TIMEOUT_MS);
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  await proc.exited;
  clearTimeout(timer);
  return { code: proc.exitCode ?? 0, out: out.trim(), err: err.trim() };
}

const git = (args: string[]) => run(["git", ...args]);

/* ---------------------------- db change detection ---------------------------- */

type DbState = Record<string, string>; // filename → sha256

async function sha256File(path: string): Promise<string | null> {
  try {
    const buf = await Bun.file(path).arrayBuffer();
    return new Bun.CryptoHasher("sha256").update(buf).digest("hex");
  } catch {
    return null;
  }
}

function liveDbFiles(): string[] {
  try {
    return readdirSync(join(ROOT, "db"))
      .filter((f) => f.endsWith(".db"))
      .sort();
  } catch {
    return [];
  }
}

async function currentDbState(): Promise<DbState> {
  const state: DbState = {};
  for (const f of liveDbFiles()) {
    const h = await sha256File(join(ROOT, "db", f));
    if (h) state[f] = h;
  }
  return state;
}

async function readState(): Promise<DbState | null> {
  try {
    return (await Bun.file(STATE_FILE).json()) as DbState;
  } catch {
    return null;
  }
}

const writeState = (state: DbState): Promise<number> => Bun.write(STATE_FILE, JSON.stringify(state, null, 2) + "\n");

function statesDiffer(prev: DbState | null, curr: DbState): boolean {
  if (!prev) return true;
  const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
  for (const k of keys) if (prev[k] !== curr[k]) return true;
  return false;
}

/* ---------------------------- status ---------------------------- */

type Status = {
  ok: boolean;
  service: string;
  port: number;
  intervalMs: number;
  busy: boolean;
  lastTickAt: string | null;
  lastPushAt: string | null;
  lastPushSha: string | null;
  lastError: string | null;
  logs: LogLine[];
};

let busy = false;
let lastTickAt: string | null = null;
let lastPushAt: string | null = null;
let lastPushSha: string | null = null;
let lastError: string | null = null;

function status(): Status {
  return {
    ok: true,
    service: "auto-push-service",
    port: SERVICE_PORT,
    intervalMs: INTERVAL_MS,
    busy,
    lastTickAt,
    lastPushAt,
    lastPushSha,
    lastError,
    logs: logs.slice(-30),
  };
}

/* ---------------------------- main cycle ---------------------------- */

async function doCycle(trigger: "timer" | "manual"): Promise<void> {
  if (busy) {
    log(`skip (${trigger}): چرخهٔ قبلی هنوز در جریان است`);
    return;
  }
  busy = true;
  try {
    lastTickAt = new Date().toISOString();

    // ۱) تشخیص تغییر سورس
    const st = await git(["status", "--porcelain=v1"]);
    if (st.code !== 0) {
      lastError = `git status failed: ${st.err}`;
      log(lastError);
      return;
    }
    const srcLines = st.out ? st.out.split("\n").filter((l) => l.trim().length > 0) : [];

    // ۲) تشخیص تغییر دیتابیس (محتوایی، نه فقط mtime)
    const currDb = await currentDbState();
    const prevDb = await readState();
    const dbChanged = statesDiffer(prevDb, currDb);

    if (srcLines.length === 0 && !dbChanged) {
      log(`idle (${trigger}): تغییری در سورس یا دیتابیس نیست`);
      return;
    }
    log(`تغییر شناسایی شد (${trigger}): ${srcLines.length} مسیر سورس، دیتابیس ${dbChanged ? "تغییر کرده" : "بدون تغییر"} → بک‌آپ §0.9 → کامیت → پوش`);

    // ۳) بک‌آپ زمان‌دار تهران — قانون §0.9: پیش از هر پوش الزامی
    const bk = await run(["bash", "scripts/db-backup.sh"]);
    if (bk.code !== 0) {
      lastError = `db-backup failed: ${bk.err || bk.out}`;
      log(lastError);
      return;
    }
    const backupCount = bk.out.split("\n").filter((l) => l.startsWith("backup:")).length;
    log(`بک‌آپ §0.9: ${backupCount} فایل (${bk.out.split("TS=")[1] ?? "؟"})`);

    // ۴) به‌روزرسانی وضعیت hash دیتابیس (داخل کامیت ذخیره می‌شود)
    await writeState(currDb);

    // ۵) کامیت
    const add = await git(["add", "-A"]);
    if (add.code !== 0) {
      lastError = `git add failed: ${add.err}`;
      log(lastError);
      return;
    }

    const msg = `Auto-sync (پوش خودکار): ${tehranNow()} تهران — سورس: ${srcLines.length} فایل، دیتابیس: ${dbChanged ? "به‌روزرسانی" : "بدون تغییر"} — بک‌آپ §0.9 ضمیمه شد`;
    const cm = await git(["commit", "-m", msg]);
    if (cm.code !== 0) {
      const combined = `${cm.out} ${cm.err}`;
      if (combined.includes("nothing to commit")) {
        log("چیزی برای کامیت نبود (فقط hash دیتابیس تازه شده بود) — پوش لغو شد");
        return;
      }
      lastError = `git commit failed: ${combined}`;
      log(lastError);
      return;
    }
    log(`کامیت شد: ${(cm.out.split("\n")[0] ?? "").replace(/^\[.*?\]\s*/, "")}`);

    // ۶) هم‌گام‌سازی ریموت و پوش
    const fh = await git(["fetch", "origin", "main"]);
    if (fh.code !== 0) {
      lastError = `git fetch failed: ${fh.err}`;
      log(lastError);
      return;
    }
    const behind = await git(["rev-list", "--count", "HEAD..origin/main"]);
    if (behind.code === 0 && Number(behind.out) > 0) {
      log(`ریموت ${behind.out} کامیت جلوتر است — rebase`);
      const rb = await git(["rebase", "origin/main"]);
      if (rb.code !== 0) {
        await git(["rebase", "--abort"]);
        lastError = "rebase conflict — لغو شد، تیک بعدی دوباره تلاش می‌کند";
        log(lastError);
        return;
      }
    }

    const push = await git(["push", "origin", "main"]);
    if (push.code !== 0) {
      lastError = `push failed: ${push.err}`;
      log(lastError);
      return;
    }

    lastPushAt = new Date().toISOString();
    const sha = await git(["rev-parse", "--short", "HEAD"]);
    lastPushSha = sha.out || lastPushSha;
    lastError = null;
    log(`✅ پوش شد → origin/main (${lastPushSha})`);
  } catch (e) {
    lastError = String(e);
    log(`خطای چرخه: ${lastError}`);
  } finally {
    busy = false;
  }
}

/* ---------------------------- HTTP status endpoint ---------------------------- */

function startServer(): void {
  const g = globalThis as typeof globalThis & { __autoPushServer?: Bun.Server };
  if (g.__autoPushServer) {
    try {
      g.__autoPushServer.stop(true);
    } catch {
      /* not listening */
    }
  }
  g.__autoPushServer = Bun.serve({
    port: SERVICE_PORT,
    fetch(req) {
      const url = new URL(req.url);
      if (req.method === "POST" && url.pathname === "/run-now") {
        void doCycle("manual");
        return Response.json({ ok: true, started: true });
      }
      return Response.json(status());
    },
  });
  log(`HTTP وضعیت روی :${SERVICE_PORT} فعال شد (GET / → وضعیت، POST /run-now → چرخهٔ فوری)`);
}

/* ---------------------------- scheduler ---------------------------- */

function startScheduler(): void {
  const g = globalThis as typeof globalThis & {
    __autoPushTimer?: ReturnType<typeof setTimeout>;
    __autoPushInterval?: ReturnType<typeof setInterval>;
  };
  // گارد bun --hot: در بارگذاری مجدد، تایمر/اینترول نسخهٔ قبلی پاک شود تا چرخهٔ موازی شکل نگیرد
  if (g.__autoPushTimer) clearTimeout(g.__autoPushTimer);
  if (g.__autoPushInterval) clearInterval(g.__autoPushInterval);

  log(`زمان‌بند فعال شد — اولین بررسی تا ${Math.round(FIRST_DELAY_MS / 1000)} ثانیهٔ دیگر، سپس هر ${Math.round(INTERVAL_MS / 60000)} دقیقه`);
  g.__autoPushTimer = setTimeout(() => {
    void doCycle("timer");
    g.__autoPushInterval = setInterval(() => void doCycle("timer"), INTERVAL_MS);
  }, FIRST_DELAY_MS);
}

/* ---------------------------- boot ---------------------------- */

log(`سرویس پوش خودکار راه‌اندازی شد — ریشهٔ پروژه: ${ROOT}`);
startServer();
startScheduler();

/* ---------------------------- Task 112 — نگهبان سلامت سرویس‌ها ----------------------------
 * تجربهٔ Task 111/112: dfb-service (فرمساز) می‌تواند «میانهٔ جلسه» بمیرد (جابه‌جایی
 * inode دیتابیس، کرش، …) و تا بوت بعدی محیط هیچ ناظری آن را بالا نمی‌آورد —
 * درختوارهٔ فرمساز و منوها 502 می‌دهند. instrumentation سرور Next همین گارد را
 * دارد (Task 112: دوره‌ای شد)، اما برای پوششِ میانهٔ جلسه در همین سندباکس، این
 * سرویسِ ماندگار هم نگهبان است: هر ۳۰ ثانیه /health سرویس‌های محافظت‌شده بررسی
 * و سرویسِ مرده به‌عنوان فرزندِ همین پروسهٔ ماندگار بالا آورده می‌شود
 * (health-check + cooldown ضدطوفان؛ در استقرار واقعی که process manager خودش
 * هست، عملاً no-op می‌ماند).
 */

const GUARDED_SERVICES = [
  {
    name: "settings-service",
    base: "http://127.0.0.1:3001",
    dir: join(ROOT, "mini-services", "settings-service"),
    log: join(ROOT, ".zscripts", "mini-service-settings-service.log"),
  },
  {
    name: "dfb-service",
    base: "http://127.0.0.1:3003",
    dir: join(ROOT, "mini-services", "dfb-service"),
    log: join(ROOT, ".zscripts", "mini-service-dfb-service.log"),
  },
  // t187 — زیرسیستم گردش کار هم همین سرنوشت را داشت: میانهٔ جلسه می‌میرد و
  // تا بوت بعدی هیچ ناظری آن را بالا نمی‌آورد (خطای ۵۰۰/۵۰۲ در تب تخصیص کاربر).
  {
    name: "workflow-service",
    base: "http://127.0.0.1:3004",
    dir: join(ROOT, "mini-services", "workflow-service"),
    log: join(ROOT, ".zscripts", "mini-service-workflow-service.log"),
  },
] as const;

const GUARD_INTERVAL_MS = 30_000;
const GUARD_RESPAWN_COOLDOWN_MS = 60_000;

async function serviceHealthy(base: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1_500) });
    return res.ok;
  } catch {
    return false;
  }
}

function startServiceGuard(): void {
  const g = globalThis as typeof globalThis & {
    __svcGuardTimer?: ReturnType<typeof setInterval>;
    __svcGuardEpoch?: number;
  };
  // گارد bun --hot: اینترول نسخهٔ قبلی پاک شود تا پاس‌های موازی شکل نگیرد
  if (g.__svcGuardTimer) clearInterval(g.__svcGuardTimer);
  // نسخهٔ حلقهٔ نگهبان — بارگذاری مجدد (hot reload) حلقهٔ قبلی را بازنشسته می‌کند
  g.__svcGuardEpoch = (g.__svcGuardEpoch ?? 0) + 1;
  const myEpoch = g.__svcGuardEpoch;
  const lastSpawnAt = new Map<string, number>(GUARDED_SERVICES.map((s) => [s.name, 0]));
  const pass = async () => {
    for (const svc of GUARDED_SERVICES) {
      try {
        if (await serviceHealthy(svc.base)) continue;
        if (Date.now() - (lastSpawnAt.get(svc.name) ?? 0) < GUARD_RESPAWN_COOLDOWN_MS) continue;
        log(`نگهبان: ${svc.name} پاسخ نمی‌دهد — اجرا…`);
        const out = openSync(svc.log, "a");
        const child = nodeSpawn("bun", ["run", "dev"], {
          cwd: svc.dir,
          stdio: ["ignore", out, out],
          detached: false, // فرزند این سرویسِ ماندگار — با او زنده می‌ماند
          env: { ...process.env, NODE_ENV: "development" },
        });
        child.on("error", (e) => log(`نگهبان: spawn ${svc.name} خطا: ${String(e)}`));
        lastSpawnAt.set(svc.name, Date.now());
        log(`نگهبان: ${svc.name} spawn شد (pid=${child.pid})`);
      } catch (e) {
        log(`نگهبان: گارد ${svc.name} خطا داد (بی‌خطر): ${String(e)}`);
      }
    }
  };
  /* پاس اول بی‌درنگ — نه با تایمر: در بارگذاریِ مجددِ bun --hot تایمرهای
     تازهٔ ماژول ورودی آتش نمی‌گیرند (مشاهدهٔ Task 112)؛ پس اولین بررسی باید
     همگام با خودِ بارگذاری اجرا شود. */
  void pass();
  /* دوره‌ای — برای بوتِ سردِ پروسه (در hot reload تایمرها معتبر نمی‌مانند) */
  g.__svcGuardTimer = setInterval(() => {
    if (g.__svcGuardEpoch !== myEpoch) return; // نسخهٔ قدیمی حلقه — بی‌اثر
    void pass();
  }, GUARD_INTERVAL_MS);
  log(`نگهبان سلامت سرویس‌ها فعال شد (پاس اول فوری، سپس هر ${GUARD_INTERVAL_MS / 1000} ثانیه: ${GUARDED_SERVICES.map((s) => s.name).join("، ")})`);
}

startServiceGuard();

// guard tick marker v2
