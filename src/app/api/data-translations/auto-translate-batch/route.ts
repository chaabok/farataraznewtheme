import type { NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { signedInternalHeaders } from "@/lib/internal-sign";

/**
 * Task 108 (درخواست مالک) — «ترجمهٔ آنلاینِ» زنجیره‌ای روی فرم‌های درختی
 * (SimpleTreeForm): کاربر روی سرشاخه کلیک می‌کند و «ترجمهٔ آنلاین» می‌زند —
 * «تمامی زیرشاخه‌های» همان سرشاخه هم باید ترجمه شوند؛ نباید لازم باشد روی
 * تک‌تک زیرشاخه‌ها کلیک کند.
 *
 * قرارداد: فرانت (قلاب useRecordTranslation) شاخهٔ انتخابی + همهٔ زیرشاخه‌هایش
 * را در دسته‌های ≤ MAX_RECORDS رکورد می‌فرستد؛ این endpoint برای «هر دسته»
 * فقط «یک» فراخوانی LLM می‌زند (عناوین درخت کوتاه‌اند — برخلاف رکورد کامل
 * Task 92 که تک‌فیلدی می‌رفت) و نتیجه را با /data-translations/save-many
 * (Task 108 در settings-service) یک‌جا upsert می‌کند. پیشرفت = توست
 * شمارش‌دار سمت فرانت (حکم Task 98 — بدون هیچ مودالی).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE_URL ?? "http://127.0.0.1:3001";
/** ۱۲ زبان غیر-fa — هم‌راستا با auto-translate و data-translations.dto.ts */
const TRANSLATION_LANGS = ["en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const MAX_RECORDS = 25; // سقف رکورد در هر دسته (عناوین کوتاه → یک LLM کافی است)
const MAX_FIELDS_PER_RECORD = 3; // فرم درختی معمولاً فقط «عنوان» دارد
const MAX_VALUE_CHARS = 300; // سقف هر مقدار ورودی (عنوان گرهٔ درخت)
const OUT_VALUE_CHARS = 1000; // سقف Value در DataTranslation (§DTO)
/** Task 109 — سقف زمان هر فراخوانی LLM: فراخوانی hang‌شده دیگر نمی‌تواند
 * دسته را برای همیشه معلق کند (توست «0/total» ابدی مالک)؛ تایم‌اوت
 * = خطای قابل‌تلاش‌مجدد (همین attempt-loop + صف تلاش‌مجدد قلاب). */
const LLM_TIMEOUT_MS = 75_000;

/** race با تایمر — تایم‌اوت = Error با پیام «timed out» (قابل تلاش‌مجدد) */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`LLM request timed out after ${ms}ms`)),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

interface InputField {
  key: string;
  label: string;
  value: string;
}

interface InputRecord {
  entityId: number;
  fields: InputField[];
}

/** fetch امضاشده به settings-service (همان قرارداد BFF §4) */
async function settingsFetch<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${SETTINGS_SERVICE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...signedInternalHeaders(method, path),
    },
    cache: "no-store",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON upstream error */
  }
  if (!res.ok) {
    const msg = (json as { message?: string } | null)?.message ?? `settings-service ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

/** JSON سختیاب — حذف حصار markdown و استخراج اولین شیء */
function parseLooseJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      entityType?: unknown;
      langs?: unknown;
      records?: unknown;
    } | null;

    const entityType = String(body?.entityType ?? "").trim();
    const langs = (Array.isArray(body?.langs) ? body?.langs : [])
      .map((l) => String(l))
      .filter((l) => (TRANSLATION_LANGS as readonly string[]).includes(l));
    if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(entityType)) {
      return Response.json({ ok: false, message: "نوع موجودیت نامعتبر است" }, { status: 400 });
    }
    if (langs.length === 0) {
      return Response.json(
        { ok: false, message: "هیچ زبان فعالی برای ترجمه وجود ندارد (تنظیمات ← زبان‌های فعال)" },
        { status: 400 },
      );
    }

    /* ① رکوردهای دسته از فرانت (شاخهٔ انتخابی + زیرشاخه‌هایش) */
    const rawRecords = Array.isArray(body?.records) ? body?.records : [];
    const records: InputRecord[] = [];
    for (const r of rawRecords.slice(0, MAX_RECORDS)) {
      const entityId = Number((r as InputRecord)?.entityId);
      if (!Number.isInteger(entityId) || entityId <= 0) continue;
      const fields: InputField[] = [];
      const rawFields = Array.isArray((r as InputRecord)?.fields) ? (r as InputRecord).fields : [];
      for (const f of rawFields.slice(0, MAX_FIELDS_PER_RECORD)) {
        const key = String(f?.key ?? "").trim();
        const label = String(f?.label ?? "").trim();
        const value = String(f?.value ?? "").trim();
        if (!/^[A-Za-z][A-Za-z0-9._]{0,119}$/.test(key) || !value) continue;
        fields.push({ key, label: label.slice(0, 120), value: value.slice(0, MAX_VALUE_CHARS) });
      }
      if (fields.length > 0) records.push({ entityId, fields });
    }
    if (records.length === 0) {
      return Response.json(
        { ok: false, message: "این دسته هیچ فیلد متنی قابل ترجمه‌ای ندارد" },
        { status: 400 },
      );
    }

    /* ② یک فراخوانی LLM برای کل دسته — خروجی JSON سخت با یک تلاش مجدد.
       ورودی: [{id, <fieldKey>: value}, …] — خروجی:
       {"translations":{"<id>":{"<fieldKey>":{"<lang>":"…"}}}} */
    const items = records.map((r) => {
      const o: Record<string, string | number> = { id: r.entityId };
      for (const f of r.fields) o[f.key] = f.value;
      return o;
    });
    const zai = await ZAI.create();
    let tr: Record<string, Record<string, Record<string, string>>> | null = null;
    for (let attempt = 0; attempt < 2 && !tr; attempt++) {
      /* Task 108 (تجربهٔ زنده) — سرویس LLM زیر فشار دسته‌های موازی 429
         «Too many requests» می‌دهد؛ پیش از اعلام شکست، با انتظار تدریجی
         (۴s) دوباره تلاش می‌کنیم — مکمل صف تلاش‌مجدد سمت قلاب.
         Task 109 — هر تلاش با تایم‌اوت ۷۵s محصور شده است. */
      if (attempt > 0) await new Promise((r) => setTimeout(r, 4000));
      try {
        const completion = await withTimeout(
          zai.chat.completions.create({
            messages: [
              {
                role: "assistant",
                content:
                  "You are a professional translator for business/ERP records. Translate faithfully and naturally, keeping numbers, codes and proper nouns intact. Respond with STRICT JSON only — no markdown fences, no commentary.",
              },
              {
                role: "user",
                content: `Translate EVERY text field of EVERY item below into EACH target language.\nInput JSON:\n${JSON.stringify(
                  { source_language: "fa", target_languages: langs, items },
                )}\n\nRespond with exactly this JSON shape (keep item ids and field keys unchanged):\n{"translations":{"<id>":{"<fieldKey>":{"<lang>":"<translation>"}}}}`,
              },
            ],
            thinking: { type: "disabled" },
          }),
          LLM_TIMEOUT_MS,
        );
        const raw = completion.choices[0]?.message?.content ?? "";
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "[auto-translate-batch] attempt", attempt + 1,
            "records:", records.length, "raw len:", raw.length,
          );
        }
        const parsed = parseLooseJson(raw) as {
          translations?: Record<string, Record<string, Record<string, string>>>;
        } | null;
        if (parsed?.translations && typeof parsed.translations === "object") {
          tr = parsed.translations;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        /* 429 / تایم‌اوت = قابل‌تلاش‌مجدد (attempt بعدی)؛ خطای دیگر = همان
           لحظه به‌عنوان شکست این دسته اعلام می‌شود */
        if (!/429|too many requests|timeout|timed out|aborted/i.test(msg)) throw e;
      }
    }
    /* دستهٔ نخوانا پس از دو تلاش = خطا برای همین دسته — فرانت ادامه می‌دهد
       و در توست پایانی تعداد دسته‌های ناموفق را گزارش می‌کند */
    if (!tr) {
      return Response.json(
        { ok: false, message: "پاسخ ترجمهٔ این دسته خوانا نبود — دوباره تلاش کنید" },
        { status: 502 },
      );
    }

    /* ③ upsert یک‌جای دسته به DataTranslation (save-many — Task 108) */
    const saveRecords: Array<{
      entityId: number;
      items: Array<{ fieldKey: string; locale: string; value: string }>;
    }> = [];
    let translated = 0;
    for (const r of records) {
      const perRecord = tr[String(r.entityId)];
      if (!perRecord || typeof perRecord !== "object") continue;
      const itemsOut: Array<{ fieldKey: string; locale: string; value: string }> = [];
      for (const f of r.fields) {
        const perLang = perRecord[f.key];
        if (!perLang || typeof perLang !== "object") continue;
        for (const lang of langs) {
          const v = String(perLang[lang] ?? "").trim().slice(0, OUT_VALUE_CHARS);
          if (!v) continue;
          itemsOut.push({ fieldKey: f.key, locale: lang, value: v });
        }
      }
      if (itemsOut.length > 0) {
        saveRecords.push({ entityId: r.entityId, items: itemsOut });
        translated += 1;
      }
    }
    let saved = 0;
    if (saveRecords.length > 0) {
      const res = await settingsFetch<{ ok: boolean; created: number }>(
        "/data-translations/save-many",
        "POST",
        { entityType, records: saveRecords },
      );
      saved = res.created;
    }
    return Response.json({ ok: true, records: records.length, translated, saved, langs });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auto-translate-batch] ERR:", err);
    }
    const message = err instanceof Error ? err.message : "خطای ترجمهٔ آنلاین دسته‌ای";
    return Response.json({ ok: false, message }, { status: 500 });
  }
}
