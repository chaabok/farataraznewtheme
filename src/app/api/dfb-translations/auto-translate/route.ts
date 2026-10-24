import type { NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { signedInternalHeaders } from "@/lib/internal-sign";

/**
 * Task 70 — «ترجمهٔ خودکار (آنلاین)» دادهٔ واردشدهٔ کاربر در فرم‌ها.
 *
 * مسیر: دکمهٔ ترجمهٔ نوار اکشن «فهرست کلّی» → POST این مسیر →
 *   ① تعریف فرم + مقادیر رکورد از dfb-service:3003 (هوک HMAC داخلی §4)
 *   ② فیلدهای متنی آزاد (text/textarea) غیرخالی جدا می‌شوند
 *   ③ یک فراخوانی LLM (z-ai-web-dev-sdk — فقط بک‌اند) برای کل رکورد
 *   ④ upsert نتایج به DfbTranslation (EntityType="Value", EntityRef=dataId)
 * زبان‌های مقصد = «زبان‌های فعال» منهای fa که فرانت می‌فرستد (تنظیم Task 70).
 * نتیجه آفلاین مصرف می‌شود (کش localStorage) — آنلاین بودن فقط در لحظهٔ تولید است.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DFB_SERVICE = process.env.DFB_SERVICE_URL ?? "http://127.0.0.1:3003";
/** ۱۲ زبان غیر-fa — هم‌راستا با mini-services/dfb-service/src/translations/translations.dto.ts (Task 71: +de/ru) */
const TRANSLATION_LANGS = ["en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const TEXT_FIELD_TYPES = new Set(["text", "textarea"]);
const MAX_VALUE_CHARS = 2000; // سقف هر مقدار ورودی LLM
const MAX_FIELDS = 30; // سقف فیلد در هر فراخوانی
const OUT_VALUE_CHARS = 1000; // سقف Value در DfbTranslation (§DTO)

/** fetch امضاشده به dfb-service (همان قرارداد BFF §4) */
async function dfbFetch<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`${DFB_SERVICE}${path}`, {
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
    const msg = (json as { message?: string } | null)?.message ?? `dfb-service ${res.status}`;
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
      formId?: unknown;
      dataId?: unknown;
      langs?: unknown;
    } | null;
    const formId = Number(body?.formId);
    const dataId = Number(body?.dataId);
    const langs = (Array.isArray(body?.langs) ? body?.langs : [])
      .map((l) => String(l))
      .filter((l) => (TRANSLATION_LANGS as readonly string[]).includes(l));
    if (!Number.isInteger(formId) || formId <= 0 || !Number.isInteger(dataId) || dataId <= 0) {
      return Response.json({ ok: false, message: "شناسهٔ فرم یا رکورد نامعتبر است" }, { status: 400 });
    }
    if (langs.length === 0) {
      return Response.json(
        { ok: false, message: "هیچ زبان فعالی برای ترجمه وجود ندارد (تنظیمات ← زبان‌های فعال)" },
        { status: 400 },
      );
    }

    /* ① تعریف فرم (فیلدها) + مقادیر رکورد */
    const detail = await dfbFetch<{
      item: { fields: Array<{ id: number; fieldKey: string; fieldType: string; label: string }> };
    }>(`/advancedTools/forms/${formId}`);
    const data = await dfbFetch<{
      items: Array<{ dataId: number; values: Array<{ fieldRef: number; value: string | null }> }>;
    }>(`/advancedTools/forms/${formId}/data`);
    const rec = (data?.items ?? []).find((it) => Number(it.dataId) === dataId);
    if (!rec) {
      return Response.json({ ok: false, message: "رکورد یافت نشد" }, { status: 404 });
    }

    /* ② فیلدهای متنی آزاد غیرخالی رکورد */
    const fieldById = new Map<number, { fieldKey: string; fieldType: string; label: string }>(
      (detail?.item?.fields ?? []).map((f) => [Number(f.id), f]),
    );
    const texts: Array<{ fieldKey: string; label: string; value: string }> = [];
    for (const v of rec.values ?? []) {
      const f = fieldById.get(Number(v.fieldRef));
      if (!f || !TEXT_FIELD_TYPES.has(f.fieldType)) continue;
      const val = String(v.value ?? "").trim();
      if (!val) continue;
      texts.push({ fieldKey: f.fieldKey, label: f.label, value: val.slice(0, MAX_VALUE_CHARS) });
      if (texts.length >= MAX_FIELDS) break;
    }
    if (texts.length === 0) {
      return Response.json({
        ok: true,
        translated: 0,
        fields: 0,
        langs,
        message: "این رکورد هیچ فیلد متنی قابل ترجمه‌ای ندارد",
      });
    }

    /* ③ یک فراخوانی LLM برای کل رکورد — خروجی JSON سخت */
    const zai = await ZAI.create();
    const payload = {
      source_language: "fa",
      target_languages: langs,
      fields: Object.fromEntries(texts.map((tx) => [tx.fieldKey, tx.value])),
    };
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a professional translator for business/ERP records. Translate faithfully and naturally, keeping numbers, codes and proper nouns intact. Respond with STRICT JSON only — no markdown fences, no commentary.",
        },
        {
          role: "user",
          content: `Translate every field value into EACH target language.\nInput JSON:\n${JSON.stringify(payload)}\n\nRespond with exactly this JSON shape:\n{"translations":{"<fieldKey>":{"<lang>":"<translation>"}}}`,
        },
      ],
      thinking: { type: "disabled" },
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = parseLooseJson(raw) as
      | { translations?: Record<string, Record<string, string>> }
      | null;
    const tr = parsed?.translations;
    if (!tr || typeof tr !== "object") {
      return Response.json({ ok: false, message: "پاسخ سرویس ترجمه قابل خواندن نبود" }, { status: 502 });
    }

    /* ④ upsert به DfbTranslation (مقدار خالی = skip، نه حذف) */
    const items: Array<{
      entityType: "Value";
      entityRef: number;
      fieldKey: string;
      lang: string;
      value: string;
    }> = [];
    for (const tx of texts) {
      const perLang = tr[tx.fieldKey];
      if (!perLang || typeof perLang !== "object") continue;
      for (const lang of langs) {
        const v = String(perLang[lang] ?? "").trim().slice(0, OUT_VALUE_CHARS);
        if (!v) continue;
        items.push({ entityType: "Value", entityRef: dataId, fieldKey: tx.fieldKey, lang, value: v });
      }
    }
    let saved = 0;
    if (items.length > 0) {
      const res = await dfbFetch<{ saved?: number }>("/advancedTools/translations", "POST", { items });
      saved = res?.saved ?? items.length;
    }
    return Response.json({ ok: true, translated: items.length, saved, fields: texts.length, langs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ترجمهٔ آنلاین";
    return Response.json({ ok: false, message }, { status: 500 });
  }
}
