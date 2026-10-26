/** @nodejs-runtime only — از instrumentation.ts لود می‌شود (بدون باندل Edge).
 *
 * Next.js instrumentation — Task 105 (زیرساخت) / Task 111 (گسترش) /
 * Task 112 (خودترمیمی دوره‌ای).
 *
 * در سندباکسِ توسعه، سرویس‌های جانبی (mini-services) فقط هنگام بوت محیط با
 * dev.sh/.zscripts بالا می‌آیند؛ اگر سرویسی بمیرد (یا اتصال db آن به‌دلیل
 * جابه‌جایی فایل زیر پایِ پروسهٔ زنده به inode قدیم بچسبد)، هیچ ناظری دوباره
 * بالا نمی‌آوردش و ناحیهٔ مربوطه از کار می‌افتد (Task 111: فرم‌ساز — «فرم‌های
 * ایجادشده ذخیره/نمایش نمی‌شوند»).
 *
 * این هوک هنگام بوت سرور Next، برای هر سرویسِ محافظت‌شده اگر /health پاسخ
 * نداد، آن را به‌عنوان فرزندِ خودِ سرور اجرا می‌کند (فرزندِ سرور = زیر نظر
 * ناظر محیط، عین settings-service). Task 112: گارد فقط یک‌باره در بوت نیست —
 * یک بازرسی دوره‌ایِ کم‌هزینه (هر ۳۰ ثانیه) هم سرویسِ مرده را دوباره بالا
 * می‌آورد؛ چون تجربهٔ Task 112 نشان داد سرویس می‌تواند «میانهٔ جلسه» هم بمیرد.
 * گاردِ سلامت باعث می‌شود در استقرار واقعی که سرویس با process manager
 * خودش بالا آمده، این کد عملاً no-op بماند؛ خطاها هم هرگز Next را نمی‌اندازند.
 */

interface GuardedService {
  name: string;
  base: string;
  dir: string;
  log: string;
}

/** فاصلهٔ بازرسی دوره‌ای (ms) — Task 112 */
const HEAL_INTERVAL_MS = 30_000;
/** حداقل فاصلهٔ بین دو spawn پیاپی برای یک سرویس (ms) — ضدطوفانِ spawn */
const RESPAWN_COOLDOWN_MS = 60_000;

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  /* register در dev ممکن است بیش از یک‌بار صدا شود — فقط یک نگهبانِ دوره‌ای */
  const g = globalThis as { __dfbServiceGuardStarted?: boolean };
  if (g.__dfbServiceGuardStarted) return;
  g.__dfbServiceGuardStarted = true;

  const { spawn } = await import("node:child_process");
  const http = await import("node:http");
  const fs = await import("node:fs");
  const cwd = process.cwd();

  const SERVICES: GuardedService[] = [
    {
      name: "settings-service",
      base: "http://127.0.0.1:3001",
      dir: `${cwd}/mini-services/settings-service`,
      log: `${cwd}/.zscripts/mini-service-settings-service.log`,
    },
    {
      /* Task 111 — فرم‌ساز (dfb-service): درخت/فرم‌ها/رکوردها؛ سالم‌بودنش
         شرط «نمایش فرم‌های جدید» در درختواره و منوهاست */
      name: "dfb-service",
      base: "http://127.0.0.1:3003",
      dir: `${cwd}/mini-services/dfb-service`,
      log: `${cwd}/.zscripts/mini-service-dfb-service.log`,
    },
  ];

  const isHealthy = (base: string) =>
    new Promise<boolean>((resolve) => {
      const req = http.get(`${base}/health`, { timeout: 1500 }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.on("error", () => resolve(false));
    });

  const lastSpawnAt = new Map<string, number>(SERVICES.map((s) => [s.name, 0]));

  const spawnService = (svc: GuardedService) => {
    try {
      console.log(`[instrumentation] ${svc.name} پاسخ نمی‌دهد — اجرا…`);
      const out = fs.openSync(svc.log, "a");
      const child = spawn("bun", ["run", "dev"], {
        cwd: svc.dir,
        stdio: ["ignore", out, out],
        detached: false, // فرزند سرور Next — با ناظرِ محیط زنده می‌ماند
        env: { ...process.env, NODE_ENV: "development" },
      });
      child.on("error", (e) =>
        console.error(`[instrumentation] spawn ${svc.name} خطا:`, e),
      );
      lastSpawnAt.set(svc.name, Date.now());
      console.log(`[instrumentation] ${svc.name} spawn شد (pid=${child.pid})`);
    } catch (e) {
      console.error(`[instrumentation] راه‌اندازی ${svc.name} ناموفق بود (بی‌خطر برای Next):`, e);
    }
  };

  const guardPass = async (label: string) => {
    for (const svc of SERVICES) {
      try {
        if (await isHealthy(svc.base)) continue;
        const last = lastSpawnAt.get(svc.name) ?? 0;
        if (Date.now() - last < RESPAWN_COOLDOWN_MS) continue;
        spawnService(svc);
      } catch (e) {
        console.error(`[instrumentation] گارد سرویس‌ها (${label}/${svc.name}) خطا داد (بی‌خطر برای Next):`, e);
      }
    }
  };

  try {
    // کمی صبر: در بوتِ کامل محیط، سرویس‌ها ممکن است هنوز در حال بالا آمدن باشند
    await new Promise((r) => setTimeout(r, 3000));
    await guardPass("boot");
    /* Task 112 — نگهبانِ دوره‌ای: سرویسِ مردهٔ میانهٔ جلسه هم دوباره بالا می‌آید */
    const timer = setInterval(() => {
      void guardPass("periodic");
    }, HEAL_INTERVAL_MS);
    // نباید نگه دارد که پروسهٔ Next خاموش شود
    timer.unref?.();
  } catch (e) {
    console.error("[instrumentation] گارد سرویس‌ها خطا داد (بی‌خطر برای Next):", e);
  }
}
