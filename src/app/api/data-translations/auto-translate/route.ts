import type { NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { signedInternalHeaders } from "@/lib/internal-sign";

/**
 * Task 92 (تأیید مالک) — «ترجمهٔ خودکار (آنلاین)» برای «دادهٔ» فرم‌های سیستمی.
 *
 * قرارداد هم‌سان با /api/dfb-translations/auto-translate (فرم‌ساز — Task 70)،
 * ولی برای رکوردهای بانک اصلی (مثل Party) و انبار DataTranslation در
 * settings-service:3001:
 *   ① فرانت فیلدهای متنیِ قابل ترجمهٔ «رکورد باز» را می‌فرستد
 *      (کلید + برچسب + مقدار — فرم خودش می‌شناسد؛ مسیرهای جدولی مثل
 *      address.0.fullAddress هم مجاز است)
 *   ② یک فراخوانی LLM (z-ai-web-dev-sdk — فقط بک‌اند) برای کل رکورد
 *   ③ upsert نتایج به DataTranslation از مسیر امضاشدهٔ سرویس
 * زبان‌های مقصد = «زبان‌های فعال» منهای fa که فرانت می‌فرستد.
 * GET/ذخیرهٔ دستی از /api/settings/data-translations/** (پروکسی موجود) می‌گذرد.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE_URL ?? "http://127.0.0.1:3001";
/** ۱۲ زبان غیر-fa — هم‌راستا با dfb-service و data-translations.dto.ts */
const TRANSLATION_LANGS = ["en", "tr", "ar", "hi", "ps", "ckb", "pt", "ko", "fr", "zh", "de", "ru"];
const MAX_VALUE_CHARS = 2000; // سقف هر مقدار ورودی LLM
const MAX_FIELDS = 30; // سقف فیلد در هر فراخوانی
const OUT_VALUE_CHARS = 1000; // سقف Value در DataTranslation (§DTO)

interface InputField {
  key: string;
  label: string;
  value: string;
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
      entityId?: unknown;
      langs?: unknown;
      fields?: unknown;
    } | null;

    const entityType = String(body?.entityType ?? "").trim();
    const entityId = Number(body?.entityId);
    const langs = (Array.isArray(body?.langs) ? body?.langs : [])
      .map((l) => String(l))
      .filter((l) => (TRANSLATION_LANGS as readonly string[]).includes(l));
    if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(entityType)) {
      return Response.json({ ok: false, message: "نوع موجودیت نامعتبر است" }, { status: 400 });
    }
    if (!Number.isInteger(entityId) || entityId <= 0) {
      return Response.json({ ok: false, message: "شناسهٔ رکورد نامعتبر است" }, { status: 400 });
    }
    if (langs.length === 0) {
      return Response.json(
        { ok: false, message: "هیچ زبان فعالی برای ترجمه وجود ندارد (تنظیمات ← زبان‌های فعال)" },
        { status: 400 },
      );
    }

    /* ① فیلدهای متنی قابل ترجمه از فرانت (رکورد باز) */
    const rawFields = Array.isArray(body?.fields) ? body?.fields : [];
    const texts: InputField[] = [];
    for (const f of rawFields) {
      const key = String((f as InputField)?.key ?? "").trim();
      const label = String((f as InputField)?.label ?? "").trim();
      const value = String((f as InputField)?.value ?? "").trim();
      if (!/^[A-Za-z][A-Za-z0-9._]{0,119}$/.test(key) || !value) continue;
      texts.push({ key, label: label.slice(0, 120), value: value.slice(0, MAX_VALUE_CHARS) });
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

    /* ② یک فراخوانی LLM برای کل رکورد — خروجی JSON سخت */
    if (process.env.NODE_ENV !== "production") {
      console.error("[auto-translate] calling LLM fields:", texts.length, "langs:", langs.length);
    }
    const zai = await ZAI.create();
    const payload = {
      source_language: "fa",
      target_languages: langs,
      fields: Object.fromEntries(texts.map((tx) => [tx.key, tx.value])),
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
    if (process.env.NODE_ENV !== "production") {
      console.error("[auto-translate] RAW FULL:", JSON.stringify(raw));
    }
    const parsed = parseLooseJson(raw) as
      | { translations?: Record<string, Record<string, string>> }
      | null;
    const tr = parsed?.translations;
    if (!tr || typeof tr !== "object") {
      return Response.json({ ok: false, message: "پاسخ سرویس ترجمه قابل خواندن نبود" }, { status: 502 });
    }

    /* ③ upsert به DataTranslation (مقدار خالی = skip، نه حذف) */
    const items: Array<{ fieldKey: string; locale: string; value: string }> = [];
    for (const tx of texts) {
      const perLang = tr[tx.key];
      if (!perLang || typeof perLang !== "object") continue;
      for (const lang of langs) {
        const v = String(perLang[lang] ?? "").trim().slice(0, OUT_VALUE_CHARS);
        if (!v) continue;
        items.push({ fieldKey: tx.key, locale: lang, value: v });
      }
    }
    let saved = 0;
    if (items.length > 0) {
      await settingsFetch<{ ok: boolean }>("/data-translations/save", "POST", {
        entityType,
        entityId,
        items,
      });
      saved = items.length;
    }
    return Response.json({ ok: true, translated: items.length, saved, fields: texts.length, langs });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auto-translate] ERR:", err);
    }
    const message = err instanceof Error ? err.message : "خطای ترجمهٔ آنلاین";
    return Response.json({ ok: false, message }, { status: 500 });
  }
}
