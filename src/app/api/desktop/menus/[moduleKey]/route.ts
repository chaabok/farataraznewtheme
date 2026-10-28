import { NextResponse } from 'next/server';
import { DESKTOP_SERVICE, getModuleService } from '@/lib/services-registry';
import { DICTIONARIES } from '@/i18n/dictionaries';
import type { Locale } from '@/types/desktop';

/** Locales the desktop-service can resolve menu names for. */
const SUPPORTED_LOCALES = new Set(['fa', 'en', 'tr', 'ar', 'hi', 'ps', 'ckb', 'pt', 'ko', 'fr', 'zh']);
const DEFAULT_LOCALE = 'fa';

/**
 * Module keys are the camelCase ids shared with the frontend registry.
 * Strict whitelist → nothing but a well-formed module key is ever
 * forwarded to the internal microservice (anti-SSRF / path traversal).
 */
const MODULE_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,49}$/;

/**
 * ── Virtual «فهرست‌های اطلاعات» (data lists) menu ──────────────────────
 *
 * Every database-driven form of the module automatically gets a
 * «فهرست …» entry under this synthetic menu, so the user can browse the
 * records saved through each form without any extra seeding. Entries use
 * the `list:<formKey>` formKey convention which the frontend resolves to
 * the generic DataListWindow component.
 */
const LIST_MENU_ID = 'virtual:data-lists';
const LIST_FORM_KEY_PREFIX = 'list:';

/** Titles of the synthetic menu + entry prefix per locale group. */
const LIST_MENU_LABELS: Record<string, { menu: string; entry: (name: string) => string }> = {
  fa: { menu: 'فهرست‌های اطلاعات', entry: (name) => `فهرست ${name}` },
  en: { menu: 'Data Lists', entry: (name) => `${name} List` },
  tr: { menu: 'Veri Listeleri', entry: (name) => `${name} Listesi` },
  ar: { menu: 'قوائم البيانات', entry: (name) => `قائمة ${name}` },
};

/** dictionary lookup with the same fa fallback as the client. */
function dict(locale: Locale, key: string): string {
  return DICTIONARIES[locale]?.[key] ?? DICTIONARIES.fa[key] ?? key;
}

interface UpstreamMenuForm {
  id: string;
  formKey: string;
  iconKey: string;
  name: string;
  sortOrder: number;
}

interface UpstreamMenu {
  id: string;
  iconKey: string;
  name: string;
  sortOrder: number;
  forms: UpstreamMenuForm[];
}

/**
 * Fetches the module's active form summaries from its own microservice
 * and appends the synthetic data-lists menu. Any failure degrades
 * gracefully: the original desktop-service menus are returned untouched.
 */
async function withDataListsMenu(
  moduleKey: string,
  locale: Locale,
  payload: { data: { moduleKey: string; menus: UpstreamMenu[] } },
  authorization: string,
): Promise<{ data: { moduleKey: string; menus: UpstreamMenu[] } }> {
  const service = getModuleService(moduleKey);
  const baseMenus = payload.data?.menus ?? [];
  if (!service?.apiKey) return payload;

  try {
    const formsUrl = new URL(
      `/api/forms/${encodeURIComponent(moduleKey)}`,
      service.baseUrl,
    );
    formsUrl.searchParams.set('locale', locale);

    const formsRes = await fetch(formsUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': service.apiKey,
        // The module services require the user JWT alongside the API key.
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });
    if (!formsRes.ok) return payload;

    const formsPayload = (await formsRes.json()) as {
      data?: Array<{
        moduleKey: string;
        formKey: string;
        name: string;
        type: string;
        iconKey: string;
        accentColor: string;
      }>;
    };
    const forms = formsPayload.data ?? [];
    if (!forms.length) return payload;

    const labels =
      LIST_MENU_LABELS[locale] ??
      LIST_MENU_LABELS.en ??
      LIST_MENU_LABELS.fa!;

    const nextSortOrder =
      baseMenus.reduce((max, menu) => Math.max(max, menu.sortOrder), 0) + 1;

    const listsMenu: UpstreamMenu = {
      id: LIST_MENU_ID,
      iconKey: 'clipboardList',
      name: dict(locale, 'dataList.menuName') || labels.menu,
      sortOrder: nextSortOrder,
      forms: forms.map((form, index) => ({
        id: `${LIST_MENU_ID}:${form.formKey}`,
        formKey: `${LIST_FORM_KEY_PREFIX}${form.formKey}`,
        iconKey: form.iconKey || 'fileText',
        name: labels.entry(form.name),
        sortOrder: index,
      })),
    };

    return {
      data: {
        moduleKey: payload.data?.moduleKey ?? moduleKey,
        menus: [...baseMenus, listsMenu],
      },
    };
  } catch {
    // Forms service unreachable → keep the plain menus (graceful).
    return payload;
  }
}

/**
 * BFF gateway: forwards the module flyout menu request to the NestJS
 * `desktop-service` microservice (port 3001).
 *
 * The browser only ever talks to this relative route; the internal
 * service URL and API key stay on the server side. `locale` is
 * whitelisted too (fa|en|tr|ar, default fa).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ moduleKey: string }> },
): Promise<NextResponse> {
  const { moduleKey } = await context.params;

  if (!MODULE_KEY_PATTERN.test(moduleKey)) {
    return NextResponse.json(
      { message: 'شناسه ماژول نامعتبر است.' },
      { status: 400 },
    );
  }

  if (!DESKTOP_SERVICE.apiKey) {
    console.error('[gateway] DESKTOP_SERVICE_API_KEY missing');
    return NextResponse.json(
      { message: 'سرویس دسکتاپ پیکربندی نشده است' },
      { status: 503 },
    );
  }

  const requested = new URL(request.url).searchParams.get('locale') ?? '';
  const locale = SUPPORTED_LOCALES.has(requested) ? requested : DEFAULT_LOCALE;

  try {
    const upstream = new URL(
      `/api/menus/${encodeURIComponent(moduleKey)}`,
      DESKTOP_SERVICE.baseUrl,
    );
    upstream.searchParams.set('locale', locale);

    const response = await fetch(upstream, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DESKTOP_SERVICE.apiKey,
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { message: 'منویی برای این ماژول تعریف نشده است.' },
        { status: 404 },
      );
    }

    if (!response.ok) {
      console.error(
        `[gateway] desktop-service menus responded with ${response.status}`,
      );
      return NextResponse.json(
        { message: 'سرویس دسکتاپ پاسخ معتبر نداد.' },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      data: { moduleKey: string; menus: UpstreamMenu[] };
    };
    // Append the synthetic «فهرست‌های اطلاعات» menu built from the
    // module's database-driven form definitions (list:<formKey> entries).
    const enriched = await withDataListsMenu(
      moduleKey,
      locale as Locale,
      payload,
      request.headers.get('authorization') ?? '',
    );
    return NextResponse.json(enriched, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[gateway] failed to reach desktop-service menus:', error);
    return NextResponse.json(
      { message: 'سرویس دسکتاپ در دسترس نیست. لطفاً بعداً تلاش کنید.' },
      { status: 503 },
    );
  }
}
