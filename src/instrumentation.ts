/**
 * Next.js instrumentation — Task 105 (زیرساخت).
 * فقط در ران‌تایم Node.js منطقِ واقعی اجرا می‌شود (instrumentation-node.ts)
 * تا باندل Edge از ماژول‌های node: دور بماند (بدون هشدار Turbopack).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
