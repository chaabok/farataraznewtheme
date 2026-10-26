/**
 * Next.js instrumentation — Task 105 (زیرساخت).
 *
 * در سندباکسِ توسعه، سرویس‌های جانبی (mini-services) فقط هنگام بوت محیط با
 * dev.sh/.zscripts بالا می‌آیند؛ اگر سرویس تنظیمات (:3001) می‌میرد، هیچ
 * ناظری دوباره بالا نمی‌آوردش و کل ناحیهٔ تنظیمات نرم‌افزار (طرف حساب،
 * ساختار کسب‌وکار، محل های جغرافیایی، نقش‌های کاربری و…) از کار می‌افتد.
 *
 * این هوک هنگام بوت سرور Next، اگر /health سرویس تنظیمات پاسخ ندهد، آن را
 * به‌عنوان فرزندِ خودِ سرور (که زیر نظر ناظر محیط است) اجرا می‌کند.
 * گاردِ سلامت باعث می‌شود در استقرار واقعی که سرویس با process manager
 * خودش بالا آمده، این کد عملاً no-op باشد؛ خطاها هم هرگز Next را نمی‌اندازند.
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { spawn } = await import("node:child_process");
  const http = await import("node:http");

  const BASE = "http://127.0.0.1:3001";
  const SERVICE_DIR = `${process.cwd()}/mini-services/settings-service`;
  const LOG_PATH = `${process.cwd()}/.zscripts/mini-service-settings-service.log`;

  const isHealthy = () =>
    new Promise<boolean>((resolve) => {
      const req = http.get(`${BASE}/health`, { timeout: 1500 }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.on("error", () => resolve(false));
    });

  try {
    // کمی صبر: در بوتِ کامل محیط، سرویس‌ها ممکن است هنوز در حال بالا آمدن باشند
    await new Promise((r) => setTimeout(r, 3000));
    if (await isHealthy()) {
      console.log("[instrumentation] settings-service :3001 سالم است — نیازی به اجرا نیست");
      return;
    }
    console.log("[instrumentation] سرویس تنظیمات پاسخ نمی‌دهد — اجرای settings-service…");
    const out = await import("node:fs").then((fs) => fs.openSync(LOG_PATH, "a"));
    const child = spawn("bun", ["run", "dev"], {
      cwd: SERVICE_DIR,
      stdio: ["ignore", out, out],
      detached: false, // فرزند سرور Next — با ناظرِ محیط زنده می‌ماند
      env: { ...process.env, NODE_ENV: "development" },
    });
    child.on("error", (e) => console.error("[instrumentation] spawn settings-service خطا:", e));
    // سلامت را بی‌نهایت چک نمی‌کنیم؛ لاگ سرویس خودش گویاست
    console.log(`[instrumentation] settings-service spawn شد (pid=${child.pid})`);
  } catch (e) {
    console.error("[instrumentation] راه‌اندازی settings-service ناموفق بود (بی‌خطر برای Next):", e);
  }
}
