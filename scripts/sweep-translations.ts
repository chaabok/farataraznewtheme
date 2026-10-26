/**
 * Task 110 — یک‌بارِ داده‌ای: «همهٔ فیلدهایی که ترجمه نشده‌اند ترجمه شوند».
 *  ① بذرِ en از ستون‌های لاتین legacy (GeoLocation.TitleLatin / BusinessStructure.TitleEn)
 *    — هر رکوردی که ترجمهٔ en ندارد ولی لاتین دارد، بدون LLM بذر می‌شود؛
 *  ② ترجمهٔ همهٔ زبان‌های جاماندهٔ همهٔ رکوردهای GeoLocation + BusinessStructure
 *    از راه endpoint دسته‌ای موجود (/api/data-translations/auto-translate-batch)
 *    با هم‌زمانی ۲ + صف تلاش‌مجدد (قرارداد Task 108/109).
 * اجرا: bun scripts/sweep-translations.ts  (سرور توسعه روی 3000 باید بالا باشد)
 */

const BASE = "http://127.0.0.1:3000";
const LANGS = ["en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];

async function get(path: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/api/settings/${path}`);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

async function postRaw(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok || !json?.ok) {
    throw new Error(`POST ${path} -> ${res.status} ${(json?.message as string) ?? ""}`);
  }
  return json ?? {};
}

interface Rec {
  id: number;
  title: string;
  latin?: string | null;
}

async function sweep(entityType: string, items: Rec[]): Promise<void> {
  console.log(`=== sweep ${entityType}: ${items.length} records ===`);

  /* انبارشناسی پوشش */
  const cov = new Map<string, Set<string>>();
  for (let i = 0; i < items.length; i += 500) {
    const chunk = items.slice(i, i + 500);
    const res = await get(
      `data-translations?entityType=${entityType}&entityIds=${chunk
        .map((r) => r.id)
        .join(",")}&fieldKeys=title`,
    );
    for (const it of (res.items as Array<{ entityId: number; locale: string }> | undefined) ?? []) {
      const set = cov.get(String(it.entityId)) ?? new Set<string>();
      set.add(it.locale);
      cov.set(String(it.entityId), set);
    }
  }

  /* ① بذر en از ستون لاتین legacy */
  const seed = items.filter(
    (r) => r.latin && r.latin.trim() && !cov.get(String(r.id))?.has("en"),
  );
  for (let i = 0; i < seed.length; i += 50) {
    await postRaw("/api/settings/data-translations/save-many", {
      entityType,
      records: seed.slice(i, i + 50).map((r) => ({
        entityId: r.id,
        items: [{ fieldKey: "title", locale: "en", value: (r.latin as string).trim() }],
      })),
    });
  }
  console.log(`[1] seeded en from Latin column: ${seed.length}`);
  for (const r of seed) {
    const set = cov.get(String(r.id)) ?? new Set<string>();
    set.add("en");
    cov.set(String(r.id), set);
  }

  /* ② زبان‌های جامانده → دسته‌های ≤۲۵ رکورد با امضای یکسان */
  const pending = items.filter((r) => {
    const have = cov.get(String(r.id)) ?? new Set<string>();
    return r.title?.trim() && LANGS.some((l) => !have.has(l));
  });
  console.log(`[2] records with missing langs: ${pending.length}`);

  const bySig = new Map<string, Rec[]>();
  for (const r of pending) {
    const have = cov.get(String(r.id)) ?? new Set<string>();
    const missing = LANGS.filter((l) => !have.has(l));
    const sig = missing.join(",");
    const arr = bySig.get(sig);
    if (arr) arr.push(r);
    else bySig.set(sig, [r]);
  }
  /* دستهٔ کوچک‌تر (۱۰ رکورد) — تجربهٔ زنده: دسته‌های ۲۵×۱۲ گاهی JSON ناقص
     از LLM برمی‌گردانند (۵۰۲)؛ دستهٔ کوچک‌تر = خروجی کوتاه‌تر = تفسیرپذیر */
  const jobs: Array<{ records: Rec[]; langs: string[] }> = [];
  for (const [sig, group] of bySig) {
    for (let i = 0; i < group.length; i += 10) {
      jobs.push({ records: group.slice(i, i + 10), langs: sig.split(",") });
    }
  }
  console.log(`[2] jobs: ${jobs.length} (concurrency 2)`);

  let idx = 0;
  let done = 0;
  let failed = 0;
  const worker = async (): Promise<void> => {
    for (;;) {
      const my = idx++;
      if (my >= jobs.length) return;
      const job = jobs[my];
      let ok = false;
      for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
        try {
          await postRaw("/api/data-translations/auto-translate-batch", {
            entityType,
            langs: job.langs,
            records: job.records.map((r) => ({
              entityId: r.id,
              fields: [{ key: "title", label: "عنوان", value: r.title.trim().slice(0, 300) }],
            })),
          });
          ok = true;
        } catch (e) {
          console.log(
            `  job ${my + 1}/${jobs.length} attempt ${attempt} failed: ${(e as Error).message}`,
          );
          await new Promise((r) => setTimeout(r, 4000 * attempt));
        }
      }
      if (ok) done += job.records.length;
      else failed += job.records.length;
      console.log(
        `[2] progress ${done + failed}/${pending.length} — ok ${done}, failed ${failed}`,
      );
    }
  };
  await Promise.all(Array.from({ length: 2 }, worker));
  console.log(`=== ${entityType} DONE — translated ${done}, failed ${failed} ===`);
}

const bs = (await get("business-structure")) as { items?: Array<Record<string, unknown>> };
await sweep(
  "BusinessStructure",
  (bs.items ?? []).map((n) => ({
    id: Number(n.id),
    title: String(n.title ?? ""),
    latin: (n.titleEn as string | null) ?? null,
  })),
);

const geo = (await get("geo-location")) as { items?: Array<Record<string, unknown>> };
await sweep(
  "GeoLocation",
  (geo.items ?? []).map((n) => ({
    id: Number(n.id),
    title: String(n.title ?? ""),
    latin: (n.titleLatin as string | null) ?? null,
  })),
);

console.log("SWEEP COMPLETE");
