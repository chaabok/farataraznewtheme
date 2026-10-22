# Project Worklog

---
Task ID: 1
Agent: main (Z.ai Code)
Task: پیاده‌سازی صفحه داشبورد به سبک دسکتاپ ویندوز ۱۱ — آیکون‌های دسکتاپ + فوتر تسک‌بار دقیقاً شبیه تصویر مرجع، با معماری کامپوننت‌بیس و میکروسرویس (Next.js 16 + NestJS + Zustand + Prisma)

Work Log:
- بررسی تصاویر مرجع کاربر (دسکتاپ ویندوز ۱۱) و استخراج الزامات: گرید آیکون چپ‌چین، تسک‌بار با آیکون‌های وسط‌چین، سینی سیستم + ساعت شمسی در راست
- تولید والپیپر با skill تصویرساز (public/wallpaper.jpg - سبک bloom آبی ویندوز ۱۱، اندازه 1344x768)
- ساخت میکروسرویس NestJS در `mini-services/desktop-service/` (پورت 3001، bun --hot):
  - ماژول‌ها: PrismaModule (global)، IconsModule، HealthModule
  - دی‌پندنسی اینجکشن با @Inject() صریح برای سازگاری تضمینی با bun
  - Endpoints: GET /api/icons، GET /api/icons/:id، POST /api/icons، GET /api/health
  - ValidationPipe با class-validator (DTO با whitelist)
- اسکیمای Prisma سرویس: مدل DesktopIcon (uuid, name, iconKey, color, sortOrder) — کاملاً سازگار با PostgreSQL برای مهاجرت آینده (فقط provider و DATABASE_URL تغییر می‌کند)
- دیتابیس: db/desktop.db ساخته و ۸ آیکون پیش‌فرض seed شد
- فرانت‌اند Next.js:
  - `src/types/desktop.ts` — تایپ‌های مشترک
  - `src/store/desktop-store.ts` — Zustand store (icons, selectedIconId, isStartMenuOpen, pinnedApps, fetchIcons)
  - `src/components/desktop/icon-registry.ts` — مپ iconKey → Lucide
  - کامپوننت‌ها: DesktopShell، DesktopIcons (گرید ستونی شبیه ویندوز)، DesktopIcon (انتخاب با کلیک، toast با دبل‌کلیک)
  - تسک‌بار: Taskbar (footer sticky با backdrop-blur)، TaskbarCenter (Start/Search/TaskView/اپ‌های پین‌شده وسط‌چین absolute)، WindowsLogo، TaskbarButton (اندیکاتور زیرین اکتیو)، SystemTray (chevron/فا/wifi/volume/battery)، TaskbarClock (ساعت زنده + تاریخ شمسی با Intl fa-IR)، StartMenu (انیمیشن framer-motion)
  - Gateway: `src/app/api/desktop/icons/route.ts` → پروکسی به 127.0.0.1:3001 (مرورگر فقط مسیر نسبی)
  - layout.tsx: فونت Vazirmatn + متادیتای فارسی؛ globals.css: --font-sans → وزیرمتن
  - next.config.ts: devIndicators: false
- رفع خطاهای lint: createElement برای آیکون داینامیک (react-hooks/static-components)، rAF برای setState اولیه ساعت (react-hooks/set-state-in-effect)
- رفع باگ همپوشانی سینی سیستم با آیکون‌های وسط در موبایل (مخفی‌سازی chevron/فا زیر 640px)
- تست کامل با Agent Browser: دسکتاپ 1440x900 و موبایل 390x844 — انتخاب آیکون، دبل‌کلیک→toast، منوی شارت (باز/بسته با Escape و کلیک بیرون)، ساعت زنده، POST/خطای 400 سرویس؛ بدون خطای کنسول
- حذف آیکون تست از دیتابیس (۸ آیکون اصلی باقی است) و پاکسازی اسکرین‌شات‌های موقت

Stage Summary:
- داشبورد دسکتاپ ویندوزی-استایل کاملاً functional و responsive تحویل شد (فوتر sticky همیشه پایین، ساعت شمسی زنده، منوی شارت)
- معماری: Next.js 16 (فرانت + BFF gateway) → NestJS microservice (پورت 3001) → Prisma/SQLite (PostgreSQL-ready)
- نکته برای سفارش‌های بعدی: افزودن آیکون جدید = INSERT در جدول DesktopIcon + ثبت iconKey در icon-registry.ts؛ رفتار دبل‌کلیک آیکون‌ها فعلاً toast placeholder است تا مشخصات پنجره‌ها/اپ‌ها داده شود
- سرویس در حال اجرا: desktop-service (بون --hot، لاگ: /home/z/my-project/desktop-service.log)

---
Task ID: 2
Agent: main (Z.ai Code)
Task: افزودن ۱۰ ماژول سازمانی ERP (تنظیمات، حسابداری، دریافت و پرداخت، انبار، فروش، دارایی ثابت، تدارکات، سفارشات، بهای تمام شده، صورتهای مالی) — هر ماژول میکروسرویس NestJS مجزا + دیتابیس مجزا + امنیت کامل API + پنجره ماژول در فرانت

Work Log:
- ساخت Shared Security Kit در `mini-services/shared/` (@erp/shared):
  - JWT با jose (HS256، issuer-locked، انقضای 8h) — sign/verify
  - JwtAuthGuard + ApiKeyGuard (global APP_GUARD، بدون وابستگی DI؛ timing-safe compare برای API key)
  - Decorators: @PublicJwt() / @PublicApiKey()
  - bootstrapSecureService: helmet + rate-limiter middleware (بدون DI، 120/min پیش‌فرض، 10/min برای login، X-Forwarded-For aware) + CORS سخت‌گیرانه + ValidationPipe (whitelist+forbidNonWhitelisted) + bind روی 127.0.0.1 فقط
  - Re-export یکجا‌ی @nestjs/common/core(APP_GUARD)/class-validator → جلوگیری از باگ dual-instance instanceof (استثنای کد سرویس 500 نمی‌شود)
- ساخت auth-service (پورت 3002): مدل User، bcrypt(12)، seed کاربران admin/Admin@12345 و user/User@12345، POST /api/auth/login (PublicJwt فقط)، GET /api/auth/verify
- اسکریپت `scripts/scaffold-module-services.ts`: تولید خودکار ۱۰ میکروسرویس از config (برای افزودن ماژول جدید فقط یک entry + اجرای مجدد). هر سرویس: پورت اختصاصی 3003-3012، db اختصاصی db/<name>.db (database-per-service)، API key اختصاصی، schema پرisma سازگار PostgreSQL، ماژول items با GET/POST/GET stats + seed دامنه‌محور + آمار تجمیعی واقعی
- مهاجرت desktop-service به کیت امنیتی: GET آیکون‌ها @PublicJwt (بدون JWT ولی با API key)، POST محافظت‌شده، seed بازنشانی به ۱۰ ماژول
- اصلاحات مهم حین کار:
  - DATABASE_URL محیطی بین bun/prisma آلوده می‌شد → url دیتابیس به‌صورت absolute در schema هر سرویس hardcode شد (مهاجرت PG فقط provider+url)
  - `@default('x')` پرisma باید دابل‌کوتیشن باشد
  - orderBy به فیلدهای ناموجود → یکدست به createdAt
  - باگ 500 لاگین: دو نسخه @nestjs/common روی دیسک → یک‌جهانی‌سازی از طریق re-export در @erp/shared (سرویس‌ها دیگر مستقیم @nestjs/* و class-validator import نمی‌کنند)
  - فرم فرانت اعداد را string می‌فرستاد → تبدیل Number برای فیلدهای number
- Gateway (BFF) در Next.js: /api/auth/login، /api/auth/verify، /api/modules/[module] (GET/POST)، /api/modules/[module]/stats + تزریق x-api-key سمت سرور از root .env (تولیدشده توسط scaffolder)؛ whitelist ماژول (ضد SSRF)
- فرانت: auth-store (sessionStorage persist)، Lock Screen ویندوزی، WindowFrame کشیدنی (drag با pointer events، focus/z-index، close)، WindowLayer، ModuleWindow عمومی (کارت‌های آمار + فرم داینامیک از modules-registry + جدول با فرمت فارسی/تومان + badge وضعیت)، تسک‌بار پویا (اپ‌های در حال اجرا با اندیکاتور)، Start Menu با ۱۰ ماژول + نام کاربر واقعی + Power=خروج
- تست‌های امنیتی (curl): بدون API key=401، با key بدون JWT=401، JWT+key=200، DTO نامعتبر=400 پیام فارسی، کلید تکراری=409 فارسی، لاگین رمز غلط=401 پیام فارسی — همه پاس
- تست مرورگر (Agent Browser): صفحه قفل → رمز غلط=خطا → ورود admin → ۱۰ آیکون → دبل‌کلیک فروش → پنجره با آمار زنده (۵ فاکتور/۲۳۹.۳م) → ثبت رکورد جدید → آپدیت آنی آمار → پنجره دوم حسابداری (کشوی صحیح، ۲ اپ در تسک‌بار) → بستن پنجره → خروج از Power → صفحه قفل
- محدودیت sandbox: حافظه 4GB با ۱۲ سرویس + Next؛ برای اجرای مرورگر موقتاً ۳ سرویس متوقف و پس از تست دوباره اجرا شدند (همه ۱۲ پورت نهایی: 200)

Stage Summary:
- ۱۲ میکروسرویس NestJS فعال: desktop(3001) + auth(3002) + ۱۰ ماژول(3003-3012) هر کدام با DB و API key مجزا
- امنیت لایه‌ای: helmet + rate-limit + CORS + JWT(HS256/8h) + API key داخلی + validation whitelist + bind 127.0.0.1 + gateway whitelist (ضد SSRF) + secrets فقط در .env
- افزودن ماژول #۱۱: یک entry در scripts/scaffold-module-services.ts + یک entry در src/lib/modules-registry.ts + db:push/seed → خودکار سرویس و پنجره
- مهاجرت PostgreSQL: provider هر schema + url → env (کامنت راهنما بالای هر schema)
- تمام سرویس‌ها: `bun run dev` در پس‌زمینه (bun --hot)، لاگ‌ها: logs-<service>.log

---
Task ID: 3-0
Agent: main (Z.ai Code)
Task: چندزبانی کردن داشبورد — ۴ زبان (فارسی/انگلیسی/ترکی استانبولی/عربی) با انتخاب توسط کاربر + چیدمان RTL برای fa/ar و LTR برای en/tr (قراردادها و فایل‌های پایه)

Work Log:
- بررسی وضعیت: فاز ۲ (۱۲ میکروسرویس + امنیت + پنجره‌ها) قبلاً کامل است؛ این تسک فقط i18n است
- `src/types/desktop.ts`: افزودن تایپ‌های Locale ('fa'|'en'|'tr'|'ar') و Direction ('rtl'|'ltr')
- `src/i18n/config.ts`: LOCALES، DEFAULT_LOCALE='fa'، LOCALE_COOKIE='erp.locale'، DIR_BY_LOCALE (fa/ar→rtl، en/tr→ltr)، LOCALE_TAGS (fa-IR/en-US/tr-TR/ar-EG)، LOCALE_SHORT (فا/EN/TR/ع) برای دکمه تسک‌بار
- `src/i18n/dictionaries.ts`: دیکشنری کامل ۴ زبانه (≈۱۷۰ کلید در هر زبان): کلی، صفحه ورود، منوی شروع، تسک‌بار/سینی، منوی زبان، chrome پنجره، متن‌های ماژول و برچسب همه فیلدها/آمار/وضعیت‌های ۱۰ ماژول
- `src/i18n/index.ts`: translate (fallback locale→fa→key)، formatTemplate با {var}، optionKey (وضعیت‌ها→کلید)، getLocalizedModuleMeta(id, locale) — ساختار از modules-registry و متن از دیکشنری، useTranslation() (t/tf/formatNumber/formatMoney/formatDate با localeTag)
- `src/lib/modules-registry.ts`: بازسازی به «فقط ساختار» — حذف تمام متن‌های فارسی؛ فیلدها unitKey ('toman'|'percent') گرفتن به‌جای رشته واحد؛ گزینه‌ها فقط value
- `src/store/desktop-store.ts`: افزودن locale/direction/isLanguageMenuOpen + setLocale (کوکی + <html> lang/dir + refetch آیکون‌ها با ?locale=) + initLocaleFromDocument + toggleLanguageMenu؛ fetchIcons حالا locale-aware و پیام خطا localized؛ pinnedApps.label حالا کلید ترجمه (pin.*)
- `src/app/layout.tsx`: خواندن کوکی erp.locale سمت سرور (cookies) → html lang/dir درست در اولین paint (بدون flash جهت) + مونت <LocaleSync />
- `src/components/desktop/locale-sync.tsx` (جدید): بعد از hydration استور را با زبان سرور همگام می‌کند
- قرارداد برای زیرعامل‌ها: هیچ رشته UI نباید هاردکد باشد؛ از useTranslation/getLocalizedModuleMeta استفاده شود

Stage Summary:
- زیرساخت i18n کامل است: زبان پیش‌فرض fa (RTL)؛ en/tr به‌صورت LTR با اعداد لاتین، ar با اعداد عربی (ar-EG)، fa با اعداد/تاریخ شمسی
- افزودن زبان جدید = یک entry در config + دیکشنری؛ افزودن متن جدید = یک کلید در هر ۴ دیکشنری
- باقی کار: بک‌اند (تسک 3-a) و فرانت (تسک 3-b) موازی در حال اجرا

---
Task ID: 3-a
Agent: backend-i18n-agent
Task: بومی‌سازی سمت بک‌اند نام آیکون‌های دسکتاپ برای ۴ زبان (fa/en/tr/ar) با زنجیره fallback و whitelist دوسطحی (میکروسرویس + گیت‌وی)

Work Log:
- `mini-services/desktop-service/prisma/schema.prisma`: افزودن مدل DesktopIconTranslation (iconId/locale/name، @@unique([iconId,locale])، @@index([locale])، onDelete: Cascade — بدون فیچر خاص SQLite، سازگار PostgreSQL) + relation `translations` روی DesktopIcon؛ ستون name قبلی حفظ شد (پیش‌فرض فارسی برای سازگاری به عقب)
- اجرای `bunx prisma db push` + `bunx prisma generate` در پوشه سرویس (کلاینت v6.19.3)
- `src/icons/icons.service.ts`: findAll(locale?) → include translations با orderBy locale + whitelist locale (fa|en|tr|ar، پیش‌فرض fa) + زنجیره fallback: requested → fa → en → اولین ترجمه موجود (قطعیت با orderBy برای PG) → ستون name پایه؛ خروجی flat {id,name,iconKey,color,sortOrder} با orderBy sortOrder asc (مثل قبل)؛ findOne هم locale-aware و flat؛ create بدون تغییر رفتار (name پایه می‌نویسد، خروجی flat)
- `src/icons/icons.controller.ts`: @Query('locale') از @erp/shared (در re-export لیست موجود بود — بدون import مستقیم @nestjs/common) روی GET / و GET /:id؛ @PublicJwt حفظ شد
- `scripts/seed.ts`: بازنویسی — ۱۰ آیکون × ۴ ترجمه = ۴۰ ردیف، همان رنگ‌ها/sortOrder قبلی (هماهنگ با modules-registry.ts)، name پایه = نام فارسی، nested create در حلقه (createMany از nested پشتیبانی نمی‌کند)؛ اجرای `bun run db:seed`
- Gateway `src/app/api/desktop/icons/route.ts`: خواندن ?locale= از request و whitelist سمت سرور (fa|en|tr|ar، پیش‌فرض fa) سپس forwarding با new URL('/api/icons', DESKTOP_SERVICE.baseUrl) + searchParams.set('locale', safeLocale)؛ تزریق x-api-key و پیام‌های خطای قبلی دست‌نخورده
- ری‌استارت desktop-service: kill پردازه‌ی پورت 3001 → از پوشه سرویس: `nohup bun run dev > /home/z/my-project/logs-desktop-service.log 2>&1 &` (همان قرارداد لاگ tasks قبل)
- تست curl مستقیم (با x-api-key از root .env): بدون key=401؛ locale=fa/en/tr/ar هرکدام ۱۰ نام صحیح مطابق جدول تسک؛ بدون locale=fa؛ locale نامعتبر/خطرناک → fa
- تست واقعی fallback با bun:sqlite: حذف ترجمه fa → en برمی‌گردد؛ حذف fa+en → اولین ترجمه باقی‌مانده (ar؛ ترتیب locale asc)؛ حذف همه ترجمه‌ها → ستون name پایه فارسی؛ سپس seed مجدد برای بازگردانی ۴۰ ردیف
- تست Gateway Next (پورت 3000): fa/en/tr/ar + بدون locale + locale نامعتبر — همه 200 با نام‌های localized صحیح (روت BFF بدون خطا compile و اجرا شد)
- انحراف کوچک: Next dev server (پورت 3000) در شروع کار down بود (dev.log آخرین فعالیت 04:43)؛ برای تست گیت‌وی طبق وضعیت مستند worklog دوباره در پس‌زمینه اجرا شد (bun run dev → dev.log) و روشن ماند

Stage Summary:
- GET /api/icons?locale=<fa|en|tr|ar> (مستقیم) و GET /api/desktop/icons?locale=... (از طریق BFF) نام‌های بومی‌شده برمی‌گردانند؛ fallback: requested → fa → en → اولین ترجمه → name پایه
- whitelist دوسطحی locale (سرویس + gateway): رشته دلخواه هرگز به سرویس داخلی forwarding نمی‌شود
- دیتابیس: جدول DesktopIconTranslation + ۴۰ ردیف ترجمه؛ افزودن زبان جدید = افزودن locale در SUPPORTED_LOCALES سرویس + whitelist gateway + ردیف‌های seed
- امنیت بدون تغییر: ApiKeyGuard (بدون key=401)، @PublicJwt روی GET، POST همچنان JWT+key؛ shape خروجی GET حالا flat بدون timestamp است (فرانت فقط id/name/iconKey/color/sortOrder می‌خواند)
- وضعیت اجرا: هر ۱۲ میکروسرویس + Next dev (3000) در حال اجرا؛ لاگ دسکتاپ: /home/z/my-project/logs-desktop-service.log

---
Task ID: 3-b
Agent: frontend-i18n-agent
Task: Replace all hardcoded Persian UI strings in the desktop frontend with dictionary lookups, add the Win11-style taskbar language picker, and make the layout fully mirror RTL (fa/ar) vs LTR (en/tr)

Work Log:
- NEW src/components/desktop/taskbar/language-menu.tsx: Win11 glass popup (bg-[#25272c]/95 backdrop-blur-2xl, 260px, absolute bottom-[calc(100%+8px)] end-0 z-40), title row (Languages icon + language.title), one item per LOCALES with native name t(`language.${locale}`) + dirRtl/dirLtr subtitle from DIR_BY_LOCALE + sky-400 Check for active; click → setLocale + changeToast; framer-motion fade + y 8→0; own Escape effect while open; click-away via window pointerdown (panel ref + [data-language-toggle] exclusion)
- system-tray.tsx: static «فا» → LOCALE_SHORT[locale] button (title/aria t('language.aria'), aria-haspopup/expanded, data-language-toggle, toggles menu) + renders <LanguageMenu/>; ALL titles/aria/toasts → t(): taskbar.hiddenIcons/network/networkSettings/sound/soundSettings/battery/batteryStatus, placeholder desc t('toast.comingSoon')
- taskbar-clock.tsx: formatters in useMemo keyed on store locale (LOCALE_TAGS[locale]; hour12 true except tr), title t('taskbar.clock'); rAF pattern + suppressHydrationWarning + '--:--'/'----/--/--' placeholders kept
- taskbar-center.tsx: t('taskbar.start'/'taskbar.search'/'taskbar.taskView'); pinned labels are translation keys → t(app.label) for tooltip AND toast; running-window tooltips now localized via getLocalizedModuleMeta(win.moduleId, locale)?.name ?? moduleId; centering transform untouched (direction-neutral); FIXED pre-existing crash: selectors s.activeTaskbarAppId / s.setActiveTaskbarApp never existed in desktop-store → pinned-app clicks threw TypeError; replaced with local useState<string|null> (store untouched per rules)
- taskbar-button.tsx reviewed: no hardcoded strings, only centering left-1/2 indicator → no change needed
- start-menu.tsx: t() for startMenu.aria/search/sectionTitle/guest/account/logoutTitle + toast.comingSoon + toast.loggedOut.*; module grid maps MODULE_LIST → getLocalizedModuleMeta(module.id, locale) skipping nulls (keeps module.color + getIcon(module.id))
- login-overlay.tsx: t() for login.aria/title/subtitle/username/password/submit + demo hint composed from login.demoAccount + login.username + login.password; error box renders t(`login.error.${errorKey}`) falling back to raw error; form text-right → text-start (fa RTL identical, LTR correct); dir="ltr" inputs + rAF mounted pattern kept
- src/store/auth-store.ts (spec-mandated minimal change): added errorKey: AuthErrorKey ('invalidCredentials'|'network'|'generic') | null derived from HTTP status (401→invalidCredentials, fetch/parse failure→network, else generic); raw `error` kept for debugging; errorKey excluded from persistence automatically (partialize persists only token/user); logout/login reset it
- desktop-icon.tsx: toast.loginRequired.title/.desc + toast.comingSoon (aria stays icon.name); desktop-icons.tsx: desktopIcons.aria + desktopIcons.errorTitle; verified grid (grid-flow-col + justify-start, no left/right classes) flows right→left automatically under dir=rtl
- desktop-shell.tsx: desktop.aria + alt t('app.name'); Escape now closes BOTH start menu and language menu (toggleLanguageMenu(false) added)
- window-frame.tsx: getLocalizedModuleMeta(moduleId, locale) for name; aria-label = `${t('window.ariaPrefix')} ${meta.name}`; window.serviceBadge/minimize/minimizeToast.title/.desc/close; ml-auto → ms-auto; physical left/top drag positioning kept (works both directions)
- module-window.tsx: removed module-level fixed fa-IR formatters → useTranslation() formatNumber/formatMoney; getLocalizedModuleMeta for meta/recordLabel/field labels/option labels/stat labels; formatValue appends localized unit via unitLabel(field.unitKey, t) and localized option label by value; keys: common.selectOption, module.newRecord/submit/submitSuccess/submitFailed/loadError.title/tableLoading/emptyState (tf with {recordLabel}/{name}), common.retry; money stats → formatMoney, percent → formatNumber + ' ' + common.percent; table text-right → text-start; '—' kept for empty values; catch-all error uses raw err.message
- window-layer.tsx checked — no hardcoded strings, no change; use-toast.ts untouched (styling preserved)
- src/i18n/index.ts (DEVIATION, one line): useTranslation() did not return the `direction` field its own Translation interface declares → added `direction: DIR_BY_LOCALE[locale]`; contract-preserving fix for a pre-existing tsc error, no dictionary/behavior change
- Verified: bun run lint = clean; bunx tsc --noEmit = zero errors in src/ (remaining errors only in examples/ + mini-services/, pre-existing, separate tsconfigs); dev.log hot-reload: all "✓ Compiled", no compile/hydration errors; rg confirms zero Persian literals left in src/components (remaining: BFF route messages = task 3-a scope, layout.tsx metadata = frozen)

Stage Summary:
- Entire desktop UI is now dictionary-driven; default fa renders byte-identical strings to before; en/tr LTR + ar/fa RTL mirror via logical utilities (end-0, ms-auto, text-start) and <html dir> from the erp.locale cookie
- Language flow: tray button (LOCALE_SHORT[locale]) → Win11 popup → setLocale (cookie + <html> lang/dir + icons refetch with ?locale= + toast); closes on Escape, outside click, or selection
- NO new dictionary keys were required — every key used was verified to exist in all 4 locales (each key greps 4× in dictionaries.ts)
- Bug fixed for main agent: pinned taskbar app clicks used to crash (nonexistent store selectors) — now local component state; suggest browser-testing language switch fa/en/tr/ar, RTL icon column flow, wrong-password error text, and module window numbers/units in en (latin digits)
- Deviations from spec: (1) click-away implemented with window pointerdown listener instead of fixed inset-0 overlay because the taskbar footer's backdrop-filter creates a containing block for fixed descendants (overlay would only cover the footer strip); (2) taskbar-center broken store selectors replaced with local state; (3) i18n/index.ts one-line `direction` fix; (4) text-right → text-start in login form + module table for proper LTR mirroring (fa appearance unchanged)

---
Task ID: 3-c
Agent: main (Z.ai Code)
Task: ادغام و راستی‌آزمایی نهایی چندزبانی — تست مرورگری ۴ زبان × RTL/LTR، رفع ایرادها، تحویل

Work Log:
- lint کل پروژه: پاس (0 خطا/0 هشدار)؛ بررسی dev.log: بدون خطای کامپایل/hydration
- بررسی سلامت: هر ۱۲ پورت میکروسرویس (3001-3012) پاسخ می‌دهند؛ سرویس‌های ماژول روی /api/items بدون کلید → 401 (امنیت فعال)؛ gateway آیکون‌ها 200
- تست مرورگری (Agent Browser, 1440×900):
  - fa پیش‌فرض: dir=rtl، آیکون‌ها از راست (تنظیمات اول)، ساعت شمسی، صفحه ورود RTL؛ رمز غلط → «نام کاربری یا رمز عبور اشتباه است.»
  - منوی زبان از سینی: ۴ زبان با نشانگر جهت و تیک آیتم فعال؛ Escape/کلیک بیرون می‌بندد
  - en: dir=ltr، آیکون‌ها از چپ، نام‌های انگلیسی از بک‌اند (?locale=en)، ساعت لاتین 10/22/2026، کوکی erp.locale=en
  - tr: dir=ltr، Ayarlar/Muhasebe/...، توست ترکی
  - ar: dir=rtl، آیکون‌ها از راست با نام‌های عربی، ساعت ar-EG (٢٢/١٠/٢٠٢٦ ارقام عربی-هندی)
  - ورود → پنجره Sales در انگلیسی: عنوان/بج/آمار/فرم/جدول/وضعیت‌ها بومی‌سازی + دیتای زنده از میکروسرویس (5 فاکتور، 239,300,000 Toman)
  - موبایل 390px: RTL پنجره فارسی و تسک‌بار آینه درست
- رفع ایراد ۱: توست تغییر زبان با زبان قبلی نمایش می‌یافت → language-menu حالا از translate(next, ...) با زبان جدید استفاده می‌کند
- رفع ایراد ۲: سوییچر زبان در صفحه قفل در دسترس نبود → دکمه گرد Languages در گوشه پایین login-overlay + همان LanguageMenu (مثل Windows) — تغییر زبان قبل از ورود ممکن شد؛ تست شد (صفحه ورود انگلیسی قبل از لاگین)
- مدیریت OOM: next-server یک‌بار توسط OOM killer کشته شد (حافظه 4GB با ۱۲ سرویس+Next+مرورگر) → restart؛ در صورت تنگی حافظه می‌توان چند سرویس ماژول را موقتاً متوقف کرد (سابقه Task 2)

Stage Summary:
- هر ۴ زبان (fa/en/tr/ar) قابل انتخاب از سینی تسک‌بار و صفحه قفل؛ جهت چیدمان آیکون‌ها خودکار: fa/ar → راست‌به‌چپ، en/tr → چپ‌به‌راست
- زبان در کوکی erp.locale ذخیره می‌شود و سمت سرور در اولین paint اعمال می‌شود (بدون فلش جهت)؛ آیکون‌ها و کل UI و اعداد/تاریخ‌ها locale-aware
- افزودن زبان جدید: entry در src/i18n/config.ts + بلوک دیکشنری — بدون تغییر کامپوننت‌ها

---
Task ID: 4
Agent: main (Z.ai Code)
Task: منوی شیشه‌ای ماژول (Module Flyout Menu) — با کلیک روی هر آیکون دسکتاپ، منوی زیبا و خلاقانه هماهنگ با تم ویندوز ۱۱ باز شود؛ کاربر از میان منوها و فرم‌های هر ماژول فرم مورد نظر خود را انتخاب کند (داده‌محور از میکروسرویس + بومی‌سازی ۴ زبانه)

Work Log:
- بک‌اند (desktop-service، پورت 3001):
  - prisma/schema.prisma: ۴ مدل جدید ModuleMenu / ModuleMenuTranslation / ModuleMenuForm / ModuleMenuFormTranslation (moduleKey + iconKey + sortOrder، ستون name پایه = فارسی، ترجمه fa/en/tr/ar با @@unique([*,locale]) و onDelete: Cascade — بدون فیچر خاص SQLite، سازگار PostgreSQL) + db:push
  - scripts/seed.ts: سید ساختار یافته ۳۰ منو / ۸۸ فرم برای ۱۰ ماژول (هر منو ۲-۴ فرم) × ۴ زبان = ۴۷۲ ردیف ترجمه؛ helper های n()/m()/f() برای خوانایی؛ بازنشانی امن با deleteMany و nested create
  - src/menus/: MenusService (findByModule با include تو در تو و همان زنجیره fallback آیکون‌ها: requested → fa → en → اولین → پایه)، MenusController (GET /api/menus/:moduleKey — whitelist ماژول با regex ^[a-z][a-zA-Z0-9]{0,49}$ → 400، ماژول ناشناس → 404، @PublicJwt مثل GET /icons)، MenusModule ثبت در app.module
  - ری‌استارت سرویس (setsid nohup bun run dev → logs-desktop-service.log)
- تست‌های curl مستقیم سرویس: بدون key=401، key غلط=401، ماژول خطرناک (..%2Fetc)=400، ماژول ناشناس=404، fa/en نام‌های صحیح ✓
- گیت‌وی BFF جدید src/app/api/desktop/menus/[moduleKey]/route.ts: whitelist دوسطحی moduleKey (ضد SSRF/traversal) + locale (fa|en|tr|ar)، تزریق x-api-key سمت سرور، نگاشت 404/خطاها با پیام فارسی؛ تست: traversal=400، unknown=404، sales?locale=fa و inventory?locale=en ✓
- فرانت‌اند:
  - types/desktop.ts: ModuleFormItem / ModuleMenuItem / ModuleMenusPayload
  - desktop-store.ts: openMenuModuleKey، menusCache (کلید `${locale}:${moduleKey}`)، isMenusLoading، menusError، activeMenuId + اکشن‌های openModuleMenu/closeModuleMenu/selectMenu/loadModuleMenus؛ toggleStartMenu(true) و openWindow حالا منوی ماژول را می‌بندند (mutual exclusion)
  - dictionaries.ts: ۷ کلید جدید moduleMenu.* در هر ۴ زبان (aria/stats/formCount/empty/loadError/closeHint/formOpened)
  - icon-registry.ts: ۲۳ آیکون جدید برای منوها و فرم‌ها (cog, shield, database, fileText, bookOpen, barChart, banknote, send, landmark, package, boxes, receipt, users, trendingUp, trendingDown, clipboardList, clipboardCheck, pieChart, calculator, building, calendar, lock, arrowLeftRight, fileSpreadsheet)
  - module-menu/module-menu.tsx (جدید): فلایاوت مرکزی Windows 11 — بک‌دراپ مات (فقط دسکتاپ؛ تسک‌بار روشن و تعاملی می‌ماند)، پنل شیشه‌ای تیره با هاله رنگ ماژول (boxShadow رنگی)، هدر با کاشی گرادیانی آیکون + «N فرم در M منو» + دکمه بستن، بدن master-detail (ریل منوها با نشانگر رنگی start-0 + شمارنده فرم + شِوران جهت‌دار / گرید کارت‌های فرم با انیمیشن stagger و آیکون رنگ ماژول + فلش جهت‌آگاه rtl/ltr)، فوتر راهنمای Escape؛ حالت‌های skeleton/error+retry/empty؛ فریم‌ورک انیمیشن spring + AnimatePresence + اسلاید منوها مطابق direction
  - desktop-icon.tsx: کلیک تکی حالا selectIcon + openModuleMenu (منو جایگزین رفتار قبلی دبل‌کلیک شد) + aria-haspopup=dialog
  - desktop-shell.tsx: رندر ModuleMenu داخل main + Escape و کلیک روی دسکتاپ آن را می‌بندد
  - login-overlay.tsx: z-40 → z-[600] تا صفحه قفل همیشه بالاتر از منو باشد؛ منو z-[500] بالاتر از پنجره‌ها و پایین‌تر از تسک‌بار (z-20 در کانتکست خودش) قرار می‌گیرد
- تست مرورگری (Agent Browser، 1440×900):
  - لاگین admin → کلیک «حسابداری» → منوی شیشه‌ای با هاله سبز: «۹ فرم در ۳ منو»، ریل RTL سمت راست، کارت‌های فرم (ثبت سند جدید/فهرست اسناد/سند افتتاحیه) ✓
  - تعویض منو → «گزارش‌های مالی» با اسلاید و نشانگر رنگی ✓
  - کلیک «سود و زیان» → منو بسته، پنجره ماژول با آمار زنده باز + توست «سود و زیان — پنجره ماژول «حسابداری» برای فرم انتخاب‌شده باز شد» ✓
  - Escape بستن + منوی فروش روی پنجره باز (z صحیح) ✓
  - سوییچ به English: منوی Sales کاملاً LTR با نام‌های انگلیسی از بک‌اند (Sales Documents/Customers/Sales Reports — Proforma Invoice/Sales Invoice/Sales Return)، انتخاب فرم → پنجره Sales انگلیسی با آمار و توست صحیح ✓
  - موبایل 390px: پنل 94vw، ریل منوها به چیپ‌های افقی اسکرول‌شو، فرم‌ها تک‌ستونه ✓
  - بازگشت به فارسی → منوی سفارشات با هاله آبی ✓؛ کنسول بدون خطا؛ dev.log همه 200
- رفع در حین تست: عرض ریل 236px → 252px (truncate عنوان‌های بلند انگلیسی مثل "Sales Docu...")
- حوادث عملیاتی: OOM سندباکس (4GB) یک‌بار next-server و یک‌بار desktop-service را کشت → هر دو با setsid nohup دوباره بالا آمدند؛ در پایان هر ۱۳ پورت (3000-3012) فعال

Stage Summary:
- هر ۱۰ ماژول حالا «منوی راه‌انداز» دارد: کلیک آیکون → فلایاوت شیشه‌ای هماهنگ با تم (شیشه تیره تسک‌بار + رنگ اختصاصی ماژول) → انتخاب منو → انتخاب فرم → پنجره ماژول باز می‌شود
- ساختار منو/فرم ۱۰۰٪ داده‌محور از میکروسرویس است: افزودن منو/فرم جدید بدون تغییر فرانت = INSERT در ModuleMenu/ModuleMenuForm (+ ترجمه‌های ۴گانه)؛ آیکون‌ها با iconKey از رجیستری
- امنیت همان لایه‌های قبلی: API key داخلی + JWT برای mutations + whitelist دوگانه moduleKey/locale در گیت‌وی (تست 401/400/404 پاس)
- بومی‌سازی کامل: نام منوها/فرم‌ها از دیتابیس با fallback، متن‌های UI از دیکشنری، چیدمان و جهت انیمیشن با dir هماهنگ (fa/ar=RTL، en/tr=LTR)
- فاز بعدی (پیشنهاد): اتصال formKey های انتخابی به فرم‌های واقعی اختصاصی (به‌جای پنجره عمومی ماژول) — بستر آن (formKey در DB + استور) آماده است

---
Task ID: 2
Agent: Z.ai Code (main)
Task: حذف کامل آیکون‌های باطری / صدا / وای‌فای از سینی سیستم تسک‌بار (مطابق فلش‌های قرمز تصویر کاربر)

Work Log:
- فایل src/components/desktop/taskbar/system-tray.tsx خوانده شد
- سه دکمه Wifi / Volume2 / BatteryMedium حذف شدند
- import بلااستفاده lucide-react پاک‌سازی شد (فقط ChevronUp باقی ماند)
- Comment مستند کامپوننت به‌روزرسانی شد
- bun run lint → بدون خطا
- تأیید با Agent Browser (login admin → دسکتاپ): سینی سیستم اکنون فقط شامل فلش آیکون‌های مخفی، نشانگر زبان «فا» و ساعت زنده است؛ بدون خطای کنسول؛ GET / 200 و POST /api/auth/login 200

Stage Summary:
- آیکون‌های network / sound / battery به‌طور کامل از SystemTray حذف شدند
- عناصر باقی‌مانده سینی: ChevronUp (آیکون‌های مخفی)، LanguageMenu + نشانگر زبان، TaskbarClock
- هیچ تغییر دیگری در تسک‌بار یا دسکتاپ اعمال نشد

---
Task ID: 5
Agent: Z.ai Code (main)
Task: تنظیمات نصب برنامه — سرویس‌های انتخاب‌شده در بانک اصلی، سایر سرویس‌ها در بانک ثانویه؛ تبادل داده بین دو بانک فقط از طریق API

Work Log:
- میکروسرویس جدید mini-services/setup-service (پورت 3013، الگوی settings-service + @erp/shared):
  - prisma/schema.prisma (رجیستری db/setup.db → مدل ServiceInstall: moduleKey@unique/name/selected/sortOrder)
  - prisma/data.prisma (اسکیمای مشترک دو بانک داده → مدل AppRecord؛ کلاینت generated در src/generated/data-client)
  - دو PrismaClient هم‌زمان با datasourceUrl متفاوت: main.db (بانک اصلی) و secondary.db (بانک ثانویه) — DataDatabasesService
  - SetupService: overview (دو کارت بانک + ۱۰ سرویس با recordCount)، setInstalled (تغییر وضعیت + مهاجرت رکوردها read→createMany→deleteMany با dedupe بر اساس id = تبادل API)، addRecord (ثبت در بانکِ مقصد)، listRecords، exchange (POST /api/setup/exchange با moduleKey یا all، جهت toMain/toSecondary، حالت move/copy)
  - امنیت: APP_GUARDهای JwtAuthGuard + ApiKeyGuard مثل بقیه سرویس‌ها؛ DTO با class-validator؛ bootstrapSecureService (helmet + rate-limit + CORS محدود + bind روی 127.0.0.1)؛ whitelist moduleKey با regex (traversal→400)
  - seed: ۱۰ ماژول (settings+accounting→main، ۸ مورد→secondary) + ۲ رکورد نمونه در بانک مقصد هر کدام
- تست curl مستقیم 3013: بدون key=401، overview بدون JWT=401، PUT sales selected=true → movedRecords=2 (secondary→main)، POST records→main، POST exchange toSecondary→transferred=3، traversal=400، body نامعتبر=400
- گیت‌وی BFF: src/app/api/desktop/setup/[[...path]]/route.ts با whitelist ساختاری مسیر (فقط overview/health/exchange/services[/:key][/records])، تزریق x-api-key، فوروارد Authorization، فیلتر database فقط روی records؛ SETUP_SERVICE در services-registry + دو متغیر در root .env
- فرانت:
  - types/desktop.ts: SetupDatabaseKey/SetupServiceItem/SetupDatabaseItem/SetupOverview
  - src/store/setup-store.ts: isSetupWindowOpen/overview/pendingKey + fetchOverview/toggleService/addDemoRecord با توست‌های بومی‌شده (formatTemplate + getLocalizedModuleMeta)
  - src/components/desktop/setup/setup-window.tsx: پنجره شیشه‌ای Win11 (z-501، spring + AnimatePresence)، هدر گرادیانی sky→emerald، دو کارت بانک با شمارنده سرویس/رکورد، لیست ۱۰ سرویس (آیکون رنگ ماژول + وضعیت نصب + تعداد رکورد + دکمه + رکورد آزمایشی + Switch نصب)، فوتر راهنما + refresh، skeleton/error+retry
  - module-menu.tsx: فرم formKey==='installation' در ماژول settings → openSetupWindow (به‌جای پنجره عمومی)
  - desktop-shell.tsx: رندر SetupWindow + Escape آن را می‌بندد
  - api-client.ts: متد PUT به apiFetch اضافه شد
- desktop-service/scripts/seed.ts: فرم 'تنظیمات نصب برنامه' (formKey=installation) به منوی «پیکربندی سیستمی» settings اضافه شد → reseed: ۳۰ منو/۸۹ فرم (۴۷۶ ترجمه)
- dictionaries.ts: ۱۷ کلید setup.* × ۴ زبان = ۶۸ ردیف
- باگ حین تست: overview سرویس {data} wrapper نداشت → اصلاح کنترلر؛ توست عنوان moduleKey خام نشان می‌داد → نام بومی‌شده
- تست مرورگری (Agent Browser): fa/RTL → مسیر منو تا پنجره، کارت‌ها (اصلی ۲ سرویس/۴ رکورد)، toggle دریافت‌وپرداخت→اصلی (۲ رکورد منتقل + توست)، + رکورد (۲→۳)، toggle برگشت→ثانویه (Escape بست)، en/LTR کامل (App Installation Settings/Main database/Secondary database/...با اعداد صحیح)، موبایل ۳۹۰px (تک‌ستونه مرتب)
- حوادث: سرور Next پایین بود → restart؛ فشار حافظه (4GB) دو بار CDP مرورگر را مختل کرد → دو سرویس ماژول (costing/financial-statement) موقتاً متوقف و در پایان دوباره بالا آمدند؛ eslint: mini-services/** به ignores اضافه شد (کلاینت generated پرisma)
- lint نهایی: پاس؛ دیکشنری: ۶۸ ردیف setup.*؛ هر ۱۴ پورت (3000-3013) پاسخ می‌دهند

Stage Summary:
- الزام کاربر محقق شد: تنظیمات نصب برنامه = پنجره اختصاصی از منوی تنظیمات؛ هر سرویس با Switch بین «بانک اصلی» (انتخاب‌شده) و «بانک ثانویه» (انتخاب‌نشده) جابه‌جا می‌شود و رکوردهایش به‌صورت API-محور مهاجرت می‌کنند (بدون لینک مستقیم SQL بین دو بانک)
- POST /api/setup/exchange نقطه تبادل صریح بین دو بانک است (move/copy، تک‌سرویسی یا all) — آماده برای سرویس‌های آینده
- مهاجرت PostgreSQL آینده: فقط provider دو اسکیمای prisma + URLها؛ معماری دو-بانکی مستقل حفظ می‌شود
- امنیت: JWT + API key + whitelist ساختاری گیت‌وی + ValidationPipe + rate-limit + bind داخلی (تست 401/400 پاس)

---
Task ID: 3
Agent: Z.ai Code (main)
Task: رفع مشکل خالی بودن صفحه پیش‌نمایش (502) — راه‌اندازی مجدد سرور Next.js و کشف الگوی بقا در سندباکس

Work Log:
- بررسی dev.log و شبکه: درخواست document با 502 → پورت 3000 بدون listener بود
- کشف OOM: dmesg نشان داد next-server قبلی با ~1GB RSS توسط oom-killer کشته شده (RAM کل 4.1GB، 45 پروسه bun/next)
- پاک‌سازی: ۹ نمونه تکراری/کهنه سرویس‌ها (پروسه‌های bun بدون پورت) kill شد → حافظه آزاد از 2.4GB به 1.2GB
- مشکل دوم: هر بار که دستور shell تمام می‌شد، سرور مجدداً کشته می‌شد (حتی با setsid + nohup)
- آزمایش تجربی: سرور حین اجرای دستور زنده است (polling 48s همه 200) ولی بلافاصله بعد از پایان دستور می‌میرد
- تست‌های کنترل‌شده: dummy server روی 3050 (cwd=/tmp) مرد؛ probe در mini-services هم مرد → نه پورت مهم است نه مسیر
- یافته نهایی: الگوی بقا = یتیم‌سازی فوری؛ subprocess باید قبل از پایان دستور به pid=1 منتقل شود
- راه‌حل نهایی: `( cd /home/z/my-project && setsid nohup bun run dev > /dev/null 2>&1 < /dev/null & )` — subshell که فوراً خارج می‌شود
- تأیید پایداری: سرور در دستورهای بعدی هم زنده ماند (GET / 200، icons 200، menus 200)
- راستی‌آزمایی با Agent Browser: صفحه لودینگ → لاگین (admin) → دسکتاپ کامل با ۱۰ آیکون RTL → منوی حسابداری باز شد → 0 خطای کنسول

Stage Summary:
- علت 502 برای کاربر: OOM-kill سرور قبلی + قاعده پنهان سندباکس (کشتن درخت پروسه‌ی دستور پس از پایان هر دستور)
- الگوی استاندارد جدید برای اجرای همیشگی پروسه‌ها در این سندباکس: subshell `( setsid nohup <cmd> & )` — ثبت شد تا در جلسات بعدی استفاده شود
- وضعیت نهایی: پورت 3000 LISTEN (pid 24485)، ۱۳ میکروسرویس (3001-3013) سالم، حافظه 2.0GB/4.1GB، بدون خطای کنسول
- تصاویر راستی‌آزمایی: upload/verify-1-initial.png (لاگین)، verify-3-after-login.png (دسکتاپ)، verify-4-icon-menu.png (منوی ماژول)

---
Task ID: 4-a
Agent: general-purpose (backend)
Task: سیستم فرم داده‌محور بک‌اند — ۴ مدل Prisma (FormDefinition/FormFieldDefinition/FormLookupOption/FormDataRecord) + ماژول forms در settings-service + گیت‌وی Next.js + فرم نمونه «طبقه حساب معین جدید» (formKey=account-class)

Work Log:
- shared/src/index.ts: افزودن re-export کلاس‌ولیدیتور IsObject (برای DTO ثبت رکورد — قاعده «فقط از @erp/shared» حفظ شد)
- settings-service/prisma/schema.prisma: ۴ مدل جدید دقیقاً طبق اسپک (SQLite بدون Json → String برای dataJson؛ unique/moduleKey+formKey و formId+fieldKey؛ cascade حذف فیلدها/رکوردها با فرم) + `bunx prisma db push` + `prisma generate`
- ماژول src/forms/ (الگوی items): forms.module.ts / forms.controller.ts (@Controller('forms')، @Inject() در همه DIها) / forms.service.ts / dto/save-record.dto.ts (@IsObject) / forms.types.ts (آینه قرارداد قفل‌شده src/types/forms.ts چون میکروسرویس از درخت src جدا است) + ثبت FormsModule در app.module
- روت‌ها: GET :moduleKey/:formKey?locale= (تعریف + فیلدهای sortOrder-مرتب + بومی‌سازی name/label/tabName با fallback به fa)، GET/POST records، PUT/DELETE records/:recordId (مالکیت رکورد→404)، GET lookups/:lookupKey؛ whitelist regex /^[a-z][a-zA-Z0-9-]{0,49}$/ روی هر سه کلید→400؛ بررسی isActive فرم در همه روت‌ها→404؛ فیلتر کلیدهای ناشناس data قبل از stringify؛ رکوردها createdAt-صعودی
- scripts/seed-forms.ts (idempotent): upsert فرم (settings/account-class، tabbed، layers، #0ea5e9، sortOrder 10)؛ حذف+بازسازی ۱۵ فیلد در ۳ سکشن (null/اطلاعات اصلی، accounting-info/اطلاعات حسابداری، goods-info/کالا)؛ ۹ گروه lookup (account-effect، account-parent درختی ۹ گزینه‌ای با parentId، ۶ گروه معین، unit)؛ ۲ رکورد نمونه فقط وقتی رکوردی وجود ندارد — اجرا و re-run موفق (رکوردها حفظ شدند)
- desktop-service/scripts/seed-account-class-menu.ts: upsert idempotent یک ModuleMenuForm (formKey=account-class، iconKey=layers، sortOrder=3) زیر اولین منوی settings («عمومی»، کمترین sortOrder=۱ در دیتابیس) + ۴ ترجمه fa/en/tr/ar؛ بدون حذف هیچ منو/آیکونی — اجرا و re-run (update) موفق
- گیت‌وی: src/app/api/modules/[module]/forms/[...path]/route.ts — پروکسی GET/POST/PUT/DELETE به <service>/api/forms/<module>/<...path> با getModuleService، فوروارد Authorization + تزریق x-api-key، cache no-store، whitelist مسیر (400)، 404 ماژول ناشناس، 503 غیرقابل‌دسترس (سبک [module]/route.ts)
- باگ حین تست: DELETE → 503 «Response constructor: Invalid response status code 204» چون new Response('', {status:204}) در runtime مجاز نیست → بازگشت new Response(null) برای 204/304 در گیت‌وی؛ پس از آن DELETE=204
- ری‌استارت سرویس با الگوی subshell: پیدا کردن pid با cwd (12008/12023 قدیمی kill) → `( cd settings-service && setsid nohup bun --hot src/main.ts > /tmp/settings-service.log ... & )` → همه روت‌های forms در لاگ مپ شدند
- راستی‌آزمایی از مسیر گیت‌وی 3000 با JWT (لاگین admin): GET تعریف=200 (۱۵ فیلد، ۳ سکشن)، ?locale=en → نام/برچسب/تب انگلیسی، records=200 (۲ رکورد)، lookups/account-parent=200 (۹ گزینه درختی با parentId)، lookups/account-effect?locale=en، POST=201 (کلید ناشناس داخل data فیلتر شد)، PUT=200 (جایگزینی کامل data)، DELETE=204، DELETE دوباره=404، بدون توکن=401، ماژول ناشناس=404، formKey با حرف بزرگ=400 (whitelist)، formKey ناشناس=404، POST بدون data=400 (پیام کلاس-ولیدیتور)، فراخوانی مستقیم 3003 بدون key=401، ماژول accounting از همان گیت‌وی=404 تمیز (سرویس فاقد forms)، traversal --path-as-is=404 کنترل‌شده
- منو: GET /api/desktop/menus/settings?locale=en → فرم "New Subsidiary Account Class" در منوی General (iconKey layers، sortOrder 3) ✓
- lint کل پروژه (`bun run lint`) = پاس؛ tsc سرویس: صفر خطا در کدهای خودم (۲ خطای قدیمی و بی‌ربط در ../shared bootstrap/rate-limit — pre-existing)؛ tsc اپ: بدون خطا در فایل گیت‌وی جدید؛ رکورد نهایی: ۲ (نمونه‌ها دست‌نخورده)

Stage Summary:
- تمام اجزای فرم (تعریف + فیلدها + آپشن‌های lookup + رکوردهای ذخیره‌شده) اکنون ۱۰۰٪ دیتابیسی‌اند؛ افزودن فرم جدید فقط INSERT در ۴ مدل settings-service است، بدون تغییر فرانت یا بک‌اند
- API پایدار برای فرانت (قرارداد src/types/forms.ts): { data: FormDef | FormRecord[] | FormRecord | LookupOption[] }؛ DELETE=204 بدون بدنه؛ 404 فرم/رکورد ناموجود یا غیرفعال؛ 400 کلید نامعتبر؛ بومی‌سازی با ?locale= روی تعریف و lookupها (labelEn خام همیشه در پاسخ برای fallback سمت کلاینت)
- نکته برای فرانت: «tabName» در پاسخ بومی‌شده است (قرارداد فیلد tabNameEn ندارد)؛ account-parent ۹ گزینه دارد (بلوک «۸ گزینه» متن تسک با داده اسپک ۹تایی نمی‌خواند؛ داده اسپک مبنا بود)؛ منو زیر اولین منوی settings قرار گرفت که در desktop.db sortOrder=۱ دارد (نه 0)
- Deviation جزء: افزودن یک خط export IsObject به shared/src/index.ts (لازم برای DTO با قاعده import فقط از @erp/shared)

---
Task ID: 4-b
Agent: general-purpose (frontend)
Task: فریم‌ورک کامپوننت‌بیس فرم‌های دیتابیسی در src/components/forms + پنجره فرم نمونه «طبقه حساب معین جدید» از منوی تنظیمات (ادامه/تکمیل اجرای قبلیِ نیمه‌کاره + اکشن حذف با تأیید درون‌خطی طبق اسپک)

Work Log:
- حال‌ موجودی: فایل‌های src/components/forms و اتصال‌های store/layer/frame/menu/dictionary از اجرای قبلی (بدون رکورد worklog) روی دیسک بود؛ کل کد سطر‌به‌سطر بازخوانی و با قرارداد src/types/forms.ts و اسپک تسک تطبیق داده شد
- خواندن قرارداد و بک‌اند زنده: FormDef (۱۵ فیلد، ۳ سکشن null/accounting-info/goods-info، tabbed، layers، #0ea5e9)، رکوردها (۲ نمونه؛ مقادیر lookup = code گزینه)، lookupها (account-effect و …) — همه از مسیر گیت‌وی 3000 با JWT
- تکمیل ناقصه اسپک: «Delete: inline confirm» قبلاً با window.confirm بود → حذف اکنون دومرحله‌ای درون‌خطی است: کلیک Trash2 فقط نوار تأیید شیشه‌ای رزگلوه (TriangleAlert + پیام deleteConfirm + دکمه «حذف/انصراف») را زیر اکشن‌بار با انیمیشن height باز می‌کند؛ Loader2 حین DELETE؛ disarm خودکار با هر جابه‌جایی رکورد/رکورد جدید/Escape؛ دکمه حذف در حالت مسلح pressed رزگلوه
- dictionary: افزودن formWindow.deleteYes/deleteNo × ۴ زبان (fa/en/tr/ar) — مجموع کلیدهای formWindow اکنون ۵۲ × ۴
- راستی‌آزمایی API با curl (بدون مرورگر): login→200، def/records/lookups=200، چرخه کامل CRUD: POST=201، PUT=200، DELETE=204 با size_download=0 (بدون parse)، شمارش نهایی رکوردها = ۲ (رکورد تست حذف شد)، منو: settings→عمومی→«طبقه حساب معین جدید» (iconKey layers) حاضر است، GET / = 200
- lint نهایی `bun run lint` = پاس (صفر خطا/هشدار)؛ tsc -p tsconfig.json: صفر خطا در src/** (خطاهای decorator در mini-services/examples قدیمی و خارج از scope این تسک است — همان وضعیت ثبت‌شده در 4-a)
- رعایت قواعد lint: آیکون‌های داینامیک با createElement(getIcon(key), {...})، هیچ setState مستقیم در بدنه useEffect (disarm در callbackهای applyRecord/startNew)، کلاس‌های منطقی ms/me/ps/pe/start/end در همه اجزای جدید

Stage Summary:
- فریم‌ورک فرم کامپوننت‌بیس کامل و بارگذاری‌شده از تعریف DB: form-window (ماشین حالت view/new/edit + dirty + CRUD + ناوبری + Ctrl+S + drawer رکوردها)، form-shell (هدر گرادیانی accent + چیپ آیکون + پاپ‌اور راهنما)، action-bar (دو کلاستر justify-between با ورود پله‌ای و تینت‌های رنگی)، form-tabs (layoutId pill + اسلاید جهت‌آگاه)، field-renderer + ۶ فیلد (text/number با جداکننده هزارگان/date شمسی بدون کتابخانه/checkbox/textarea/lookup با پاپ‌اور جستجو + کش ماژول‌سطح + کیبورد)، tree-panel (برای type=tree)، form-footer (pill وضعیت + موقعیت + updatedAt + hint) و barrel
- اتصال‌ها: DesktopWindow.form + openFormWindow (بازاستفاده منطق slot/z از openWindow)، window-layer → DataFormWindow برای win.form، window-frame با fallback title/iconKey/accentColor برای فرم‌های بدون meta، module-menu → case settings+account-class → openFormWindow + توست، icon-registry.layers موجود
- نقشه کلیدهای دیکشنری نسبت به اسپک: saveFailed→saveError، copyHint→copyToast، helpToast→helpTitle (پاپ‌اور راهنما با hintهای واقعی به‌جای توست)، retry→common.retry (بازاستفاده) — بقیه ۱:۱
- فرض قرارداد: مقدار lookup ذخیره‌شده در رکورد = code گزینه (با داده seed منطبق است؛ lookup با id||code هم resolve می‌کند)؛ locale ?locale= را بک‌اند برای def/lookup بومی‌سازی می‌کند و فرانت fallback labelEn/nameEn را هم دارد
- تست E2E مرورگری به اپراتور یکپارچه‌ساز واگذار شد (طبق دستور مرورگر باز نشد)

---
Task ID: 4
Agent: Z.ai Code (main, integration + E2E)
Task: یکپارچه‌سازی و راستی‌آزمایی E2E سیستم فرم‌ساز کامپوننت-بیس + رفع دو باگ

Work Log:
- قرارداد API در src/types/forms.ts قفل شد؛ دو ساب‌ایجنت موازی اجرا شدند (4-a بک‌اند، 4-b فرانت‌اند) و هر دو گزارش/ورک‌لاگ دادند
- راستی‌آزمایی E2E با Agent Browser: لاگین → آیکون تنظیمات → منوی ماژول → فرم «طبقه حساب معین جدید» باز شد
- باگ ۱ (فرانت): isEmptyRequiredValue در form-utils.ts فیلد isRequired را چک نمی‌کرد → هر فیلد خالی خطای الزامی می‌داد؛ با گارد field.isRequired رفع شد
- باگ ۲ (فرانت): URLهای رکورد در form-window.tsx سگمنت /records را نداشتند (POST/PUT/DELETE به /forms/account-class/<id>) → گیت‌وی 400 می‌داد؛ هر سه مسیر به /records/... اصلاح شد
- کشف باگ‌ها با هوک fetch در مرورگر (بدنه و URL واقعی درخواست PUT استخراج شد)
- تست کامل: ویرایش+ذخیره (PUT 200)، رکورد جدید (POST 201)، اعتبارسنجی فیلد الزامی «اثر»، حذف با تأیید درون‌خطی (DELETE 204)، پنل فهرست رکوردها، ناوبری اول/قبلی/بعدی/آخرین با غیرفعال‌سازی مرزی، لوکاپ با جستجو
- ریسپانسیو: بازکردن فرم در ویوپورت 390px تایید شد (چیدمان تک‌ستونه)
- lint پاس؛ کنسول مرورگر 0 خطا؛ dev.log بدون خطای غیرمنتظره

Stage Summary:
- سیستم فرم دیتابیس‌محور کامل است: تعریف فرم/فیلدها/گزینه‌های لوکاپ/رکوردها همگی در DB (settings-service) و رندر از طریق کامپوننت‌های عمومی src/components/forms/
- افزودن فرم جدید = فقط رکورد در DB (بدون تغییر کد)
- سه نوع فرم پشتیبانی می‌شود: simple / tabbed / tree (نمونه tabbed سرو شد)
- برای جلسات بعدی: URL رکوردها حتماً با سگمنت /records باشد؛ اعتبارسنجی فقط فیلدهای isRequired

---
Task ID: 5
Agent: Z.ai Code (main)
Task: هدر همیشگی داشبورد + تب‌بار ۲۰۲۶ زیر هدر؛ فرم‌ها به‌صورت برگه (تب) و باز ماندن منوی ماژول

Work Log:
- desktop-store: نوع DesktopTab (home|form|module) + tabs/activeTabId/isTabBarActive + addFormTab/addModuleTab/activateTab/closeTab؛ openModuleMenu حالا isTabBarActive=true می‌گذارد (تب‌بار با اولین باز شدن منو ظاهر می‌شود و برای همیشه می‌ماند)
- کامپوننت جدید DashboardHeader (src/components/desktop/header/): همیشه بالای صفحه مثل فوتر؛ برند گرادیانی + نشان ERP + زیرعنوان، زنگ اعلان، چیپ کاربر با منوی کشویی و «خروج از حساب» واقعی (authStore.logout)
- کامپوننت جدید TabBar (src/components/desktop/tabs/): تب اول «صفحه اصلی» (نمایش زنده دسکتاپ)، هر فرم/ماژول بازشده یک تب با آیکون و دکمه بستن (کلیک وسط ماوس هم می‌بندد)، pill متحرک فعال + زیرخط رنگی با layoutId فریمر-موشن، ماسک محو لبه‌ها + فلش‌های پیمایش در سرریز، ورود فنری و stagger
- desktop-shell: چیدمان ستونی h-screen (هدر / تب‌بار / محتوا flex-1 / تسک‌بار)؛ پنل Home همیشه mount می‌ماند (دسکتاپ + منوها + پنجره‌های شناور) و پنل هر تب keep-alive است (وضعیت فرم‌ها هنگام جابه‌جایی تب حفظ می‌شود)
- module-menu: باز کردن فرم دیگر closeModuleMenu نمی‌کند — منو به تب Home چسبیده است و با برگشتن به Home دوباره ظاهر می‌شود؛ فرم دیتابیس‌محور → addFormTab، بقیه آیتم‌ها → addModuleTab
- i18n: ۱۳ کلید جدید header.* و tabs.* در هر ۴ زبان (fa/en/tr/ar)
- lint پاس؛ تست کامل مرورگر: ظاهر شدن تب‌بار با کلیک آیکون، باز شدن فرم به‌عنوان تب، بازگشت به Home با منوی همچنان باز، تب ماژول عمومی، بستن تب و فعال شدن تب مجاور، منوی کاربر، موبایل 390px — بدون هیچ خطای کنسول

Stage Summary:
- معماری جدید: هدر + تب‌بار + محتوا + فوتر (هر دو هدر و فوتر همیشگی‌اند)
- تب Home = دسکتاپ زنده؛ فرم‌ها/ماژول‌ها = تب‌های keep-alive با آیکون و بستن
- منوی ماژول هرگز به‌خاطر باز شدن فرم بسته نمی‌شود (الزام کاربر)
- وضعیت فرم‌ها بین تب‌ها حفظ می‌شود (unmount نمی‌شوند)

---
Task ID: 6
Agent: Z.ai Code (main)
Task: چهار دکمه ترکیبی جدید در اکشن‌بار فرم‌ها (ذخیره و جدید / ذخیره و بستن / حذف و جدید / حذف و بستن) + دیالوگ تأیید حذف «از حذف اطلاعات مورد نظر اطمینان دارید؟» با بلی/خیر

Work Log:
- action-bar.tsx: کامپوننت BadgeIcon (آیکون پایه + نشان دایره‌ای گوشه ＋/× با bg-current و سایه رنگی) — خانواده ذخیره هر ۳ دکمه با پایه Save و تینت زمردی، خانواده حذف هر ۳ دکمه با پایه Trash2 و تینت رزی؛ سنخیت درون‌خانوادگی با نشان متمایزکننده؛ props جدید onSaveNew/onSaveClose/onDeleteNew/onDeleteClose و حذف isDeleteArmed؛ کلاسترها flex-wrap برای موبایل
- form-window.tsx: بازآرایی ذخیره به پایپ‌لاین مشترک performSave({keepRecord}) با خروجی 'saved'|'clean'|'invalid'|'error' — اعتبارسنجی فیلدهای الزامی مشترک بین هر ۳ عملیات ذخیره؛ handleSaveNew (ذخیره → startNew + توست saveNewSuccess)، handleSaveClose (ذخیره → onClose + توست saveCloseSuccess؛ حالت clean بستن بدون ذخیره)؛ حذف inline strip → دیالوگ واحد AlertDialog شیکا با deleteIntent ('current'|'new'|'close')، دکمه بلی با event.preventDefault تا دیالوگ حین DELETE باز بماند (Loader2 + disabled)؛ onClose prop جدید به DataFormWindowProps
- desktop-shell.tsx: پنل تب فرم اکنون onClose={() => closeTab(tab.id)} می‌دهد (معماری تب‌محور Task 5) — «ذخیره و بستن»/«حذف و بستن» تب را می‌بندند و به تب قبلی برمی‌گردند؛ window-layer هم برای پنجره شناور legacy همان prop را با closeWindow می‌دهد
- ui/alert-dialog.tsx: z-50 → z-[9998]/z-[9999] (z پنجره‌ها با هر فوکوس بالا می‌رود و دیالوگ همیشه رو می‌ماند)
- باگ جانبی i18n (کشف در E2E): نام تب‌های فرم در en/tr/ar فارسی می‌ماند → types/forms.ts فیلد tabNameEn? + form-utils.deriveTabs fallback (locale==='fa' ? tabName : tabNameEn ?? tabName) + form-window درخواست def با ?locale= (سرور pickLocalized دارد) — تب‌های فرم اکنون «Main Information/Accounting Information/Goods» می‌شوند
- dictionaries.ts: ۱۲ کلید جدید × ۴ زبان (actionSaveNew/actionSaveClose/actionDeleteNew/actionDeleteClose/deleteDialogTitle/deleteDialogMessage/confirmYes=بلی/confirmNo=خیر/ saveNewSuccess/saveCloseSuccess/deleteNewSuccess/deleteCloseSuccess)
- E2E مرورگر کامل: بازکردن فرم از منو → ۴ دکمه جدید با نشان‌ها حاضرند (fa و en)؛ اعتبارسنجی «اثر» جلوی ذخیره و جدید را گرفت (توست destructive)؛ ذخیره و جدید → POST 201 + ریست کامل فرم + توست؛ ذخیره و بستن → POST 201 + بستن تب + توست؛ حذف و جدید → دیالوگ → «خیر» لغو سالم → «بلی» → DELETE 204 + ریست + توست؛ حذف و بستن → دیالوگ → «بلی» → DELETE 204 + بستن تب + توست؛ دکمه‌های حذف در حالت new غیرفعال
- ریسپانسیو: 390px اکشن‌بار ۱۴ دکمه‌ای تمیز در ۳ ردیف wrap می‌شود؛ LTR انگلیسی آینه‌ای درست (نشان‌ها سمت end)؛ برگشت موفق به فارسی با ?locale=fa
- حاشیه: سرور next وسط تست مرد (پس از reload/کامپایل مجدد) → راه‌اندازی مجدد با الگوی orphan (setsid nohup) و ادامه تست
- lint نهایی پاس؛ کنسول مرورگر ۰ خطا؛ dev.log سالم (POST 201 / DELETE 204)
- رکوردهای تست پاک‌سازی شدند (۱۰۳/۱۰۴ حذف شدند؛ DB به حالت seed ۱۰۱/۱۰۲ برگشت)

Stage Summary:
- ۴ عملیات ترکیبی استاندارد ERP فرم‌ها فعال است؛ هر سه مسیر ذخیره از یک پایپ‌لاین اعتبارسنجی/نوشتن/رفرش مشترک عبور می‌کنند و هر سه مسیر حذف از یک دیالوگ تأیید واحد
- بستن فرم در معماری تب‌محور = closeTab (اتصال desktop-shell → closeTab(tab.id))
- پیگیری جزئی برای جلسات بعد: عنوان تب Workspace هنگام ایجاد اسنپ‌شات می‌ماند و پس از تغییر زبان تا بستن/بازکردن تب قدیمی می‌ماند (نیاز به nameEn در ModuleFormItem + derive زنده در TabBar)

---
Task ID: 6
Agent: main (Z.ai Code)
Task: بازطراحی DataFormWindow طبق تصویر کاربر — حذف کامل نوار تب بالای فرم، تقسیم فرم به دو بخش (هدر = فیلدهای اصلی، بدنه = تب‌ها)، کاهش ۴۰٪ ارتفاع فیلدها + فونت ۱۲px ورودی‌ها، چسبیدن فوتر فرم به فوتر داشبورد (تسک‌بار)

Work Log:
- form-window.tsx: بخش «نوار تب بالای فرم» (که با فلش قرمز مشخص شده بود) حذف شد؛ برای فرم‌های tabbed حالا «هدر» (گروه اول deriveTabs) بدون هیچ تب‌ chooser همیشه بالای فرم رندر می‌شود (section با aria-label نام تب اصلی، bg ملایم + border-b) و «بدنه» (گروه‌های دوم به بعد) همان FormTabs سابق را زیر هدر می‌گیرد؛ اگر فرم فقط یک تب داشته باشد بدنه/نوار تب کلاً رندر نمی‌شود؛ activeTabKey حالا فقط تب‌های بدنه را کنترل می‌کند (مقدار اولیه = تب دوم) و state ویو/رکورد دست‌نخورده ماند
- فرم‌های simple/tree بدون تغییر رفتاری؛ اسکلت لودینگ هم h-10→h-6
- کاهش ۴۰٪ ارتفاع فیلدها: form-styles.ts controlClasses از h-10 (40px) به h-6 (24px) دقیقاً −۴۰٪، radius lg→md، px-3→px-2.5؛ فونت ورودی‌ها text-sm→text-[12px] طبق درخواست
- هم‌خوانی اجزا: FieldCheckbox ردیف h-10→h-6 + چک‌باکس ۱۸→۱۶px + لیبل ۱۳→۱۲px؛ دکمه «+» LookupField از h-9 w-9 به h-6 w-6 (آیکون 3.5)؛ فاصله لیبل فیلد mb-1.5→mb-1 (لیبل‌ها ۱۳px ماندند چون کاربر فقط فونت «فیلدهای ورودی» را خواسته بود)
- چسبیدن فوتر فرم به فوتر داشبورد: (الف) مسیر تب — desktop-shell پنل تب‌های فرم به flex flex-col تبدیل شد تا FormShell (flex-1) کل ارتفاع main را پر کند؛ (ب) مسیر پنجره شناور legacy — WindowFrame prop جدید dockBottom (style bottom:0، گوشه‌های بالا گرد، محدودیت maxY درگ برای حداقل ارتفاع مفید) + window-layer FORM_BODY_CLASS از max-h-[80vh] به flex-1 و pass dockBottom برای فرم‌ها؛ اندازه‌گیری E2E: فاصله فوتر فرم تا تسک‌بار = 0px در هر دو مسیر
- E2E کامل با agent-browser: بازکردن فرم از منو → بدون نوار تب بالایی؛ هدر «اطلاعات اصلی» ثابت + بدنه با تب‌های «اطلاعات حسابداری/کالا» (سوییچ تب بدنه سالم)؛ input height=24px، font=12px، gap فوتر=0؛ ذخیره و جدید → پیام الزامی «اثر» (اعتبارسنجی سر جای خودش) → بعد از پر کردن lookup: POST 201 + ریست کامل فرم؛ حذف و جدید → دیالوگ «از حذف اطلاعات مورد نظر اطمینان دارید؟» با بلی/خیر → بلی → DELETE 204 + ریست؛ حالت LTR انگلیسی (آینه‌سازی + ترجمه تب‌ها) و ریسپانسیو 390px سالم؛ کنسول ۰ خطا
- نکته کشف‌شده در تست: فیلد «کد» از نوع number است (FieldNumber) و مقدار غیرعددی را روی blur بی‌صدا می‌اندازد — رفتار درست، فقط تست اولیه با «T-77» ناموفق بود؛ تست واقعی با 103 موفق
- دیتابیس تمیز ماند (رکورد تستی ۱۰۳ حذف شد؛ فقط ۱۰۱/۱۰۲)؛ lint پاس

Stage Summary:
- DataFormWindow اکنون دو بخشی است: هدر همیشه‌نمایان (فیلدهای اصلی، بدون تب) + بدنه تب‌دار؛ نوار تب بالای فرم کاملاً حذف شد
- کنترل‌های فرم فشرده شدند (۲۴px، فونت ۱۲px) و فوتر وضعیت فرم در هر دو معماری (تب و پنجره شناور) بدون فاصله به تسک‌بار می‌چسبد
- WindowFrame prop عمومی dockBottom گرفت؛ هیچ تغییر schema/API/i18n لازم نشد (کلیدهای دیکشنری موجود کفایت کرد)
---
Task ID: 7-g
Agent: general-purpose (zh dictionary)
Task: Simplified Chinese (zh) UI dictionary translation

Work Log:
- Read dictionaries.ts fully and extracted the canonical fa key list programmatically (262 keys, verified via bun against all 4 locales) — note: task brief estimated ~200 keys
- Wrote src/i18n/locales/zh.ts: full Simplified Chinese translation, export `zhDictionary`, flat keys identical to fa plus the 11 mandated new keys (7 verbatim native language names + 4 calendar hint keys with digit samples preserved exactly); all {placeholder} tokens preserved; 'common.toman'='托曼', confirmYes/No=是/否
- Verified with bun: parses clean, 273 keys (262 fa + 11 new), zero missing/extra keys vs fa∪new, zero placeholder mismatches, verbatim language names OK, eslint clean

Stage Summary:
- src/i18n/locales/zh.ts written, 273 keys
---
Task ID: 7-f
Agent: general-purpose (fr dictionary)
Task: French (fr) UI dictionary translation

Work Log:
- Read worklog.md and the full fa canonical section of src/i18n/dictionaries.ts (lines 10-318); extracted the exact key list programmatically (262 fa keys — note: more than the ~200 estimated in the task spec)
- Wrote src/i18n/locales/fr.ts: export frDictionary, flat keys 1:1 with fa plus the 11 new keys (7 language names verbatim + 4 formWindow.hint* calendar keys with exact digit samples); typographic apostrophes (’) used throughout to avoid escaping issues; all {placeholder} tokens preserved
- Verified with bun: parses cleanly; strict diff vs fa + new keys shows 273 keys, 0 missing, 0 extra, 0 duplicates, 0 empty values; {forms} {menus} {count} {module} {recordLabel} {name} {n} {total} {db} {time} all match fa usage counts

Stage Summary:
- src/i18n/locales/fr.ts written, 273 keys (262 fa + 11 new) — no other file touched
---
Task ID: 7-a
Agent: general-purpose (hi dictionary)
Task: Hindi (hi) UI dictionary translation

Work Log:
- Read worklog.md + full dictionaries.ts (fa section lines 10-318 = canonical key list; extracted mechanically and diffed). Note: fa section contains 262 keys (not ~200 as the task brief estimated), so the "211 expected" figure was stale — coverage rule (every fa key + 11 new) was followed instead.
- Wrote src/i18n/locales/hi.ts: full Hindi (Devanagari) translation, export hiDictionary, flat keys mirroring fa order with section comments; 11 new keys added = 7 verbatim native language names (hi/ps/ckb/pt/ko/fr/zh; fa/en/tr/ar already in fa) + 4 calendar hints (hintJalali/hintKurdish/hintHijri/hintGregory) with digit samples kept byte-exact (۱۴۰۵/۰۷/۳۰ / ۲۷۲۶/۰۷/۳۰ / ١٤٤٧/٠٥/١٢ / 2026/10/22). Spec pins honored: common.toman=टोमान, common.percent=٪, confirmYes=हाँ, confirmNo=नहीं, deleteDialogMessage=क्या आप वाकई जानकारी हटाना चाहते हैं?, actionSave=सहेजें (Ctrl+S), tabs.home=होम, login.submit=लॉग इन, header.logout=लॉग आउट.
- Verified via bun import (parses clean): count 273; automated diff vs fa → missing NONE, extra = exactly the 11 mandated keys, 0 duplicate keys, 0 empty values, 0 placeholder-token mismatches ({forms} {menus} {count} {module} {recordLabel} {name} {n} {total} {db} {time} all preserved). No other file touched (dictionaries.ts / config.ts / types untouched — locale registration is the main Task 7's job).

Stage Summary:
- src/i18n/locales/hi.ts written, 273 keys (262 fa keys + 11 new)

---
Task ID: 7-b
Agent: general-purpose (ps dictionary)
Task: Pashto (ps) UI dictionary translation

Work Log:
- خواندن کامل `src/i18n/dictionaries.ts` (بخش fa خطوط 10-318 به‌عنوان لیست مرجع کلیدها) و کارلاگ؛ استخراج برنامه‌نویسی‌شده کلیدهای fa با bun: ۲۶۲ کلید (نه ۲۰۰ که در متن تسک تخمین زده شده بود)
- نوشتن `src/i18n/locales/ps.ts` با export دقیق `psDictionary`: ترجمه کامل ۲۶۲ کلید fa به پشتو استاندارد (فورم/ریکارډ/خوندي کول/ړنګول/بندول) + ۱۱ کلید جدید (۷ نام زبان verbatim: hi/ps/ckb/pt/ko/fr/zh + ۴ کلید راهنمای تقویم با عین نمونه ارقام ۱۴۰۵/۰۷/۳۰، ۲۷۲۶/۰۷/۳۰، ١٤٤٧/٠٥/١٢، 2026/10/22)؛ توکن‌های {forms} {menus} {count} {module} {recordLabel} {name} {n} {total} {db} {time} و مقادیر الزامی (تومان، ٪، هو/نه، ښي-تر-کیڼ/کیڼ-تر-ښي) عیناً حفظ شد
- راستی‌آزمایی با bun: import سالم، count=273 (262 fa + 11 جدید)، ۰ کلید جاافتاده/اضافه نسبت به fa، تطابق کامل placeholderها، هیچ آپاستروف ASCII داخل مقادیر (parse بدون خطا)

Stage Summary:
- src/i18n/locales/ps.ts written, 273 keys (262 canonical fa keys + 11 new) — count 273 به‌جای 211 تخمینی تسک است چون fa واقعاً ۲۶۲ کلید دارد؛ پوشش کامل و بدون کلید اضافه/ناقص
---
Task ID: 7-e
Agent: general-purpose (ko dictionary)
Task: Korean (ko) UI dictionary translation

Work Log:
- Read worklog + dictionaries.ts fully; extracted the canonical fa key list (lines 10-318) — actual count is 262 keys, not ~200 as the task estimated, so all 262 were translated (coverage rule "no missing keys" prioritized over the stale 211 estimate; sibling locale files fr/hi/ps/zh each have 273 keys, confirming this)
- Wrote src/i18n/locales/ko.ts (export koDictionary, LTR): 262 fa keys + 7 new language names (hi/ps/ckb/pt/ko/fr/zh, all 11 language.* entries verbatim) + 4 calendar hint keys (hintJalali/hintKurdish/hintHijri/hintGregory per spec, digit samples preserved) = 273 keys
- Verified with bun: import OK, count 273, fa↔ko key parity (0 missing, extras = exactly the 11 new keys), placeholder tokens identical on all keys, toman/percent/confirmYes/confirmNo/deleteDialogMessage per spec; FLAG: hintJalali uses the dictated wording '셀러리 히즈라(잘랄리) 달력' — '셀러리' is a literal transliteration of "Solar" that reads as "celery" in Korean; recommended replacement: '히즈라 태양력(잘랄리) 달력' (kept as dictated for spec compliance)

Stage Summary:
- src/i18n/locales/ko.ts written, 273 keys
---
Task ID: 7-d
Agent: general-purpose (pt dictionary)
Task: Portuguese (pt) UI dictionary translation

Work Log:
- Read worklog.md + dictionaries.ts; fa section (lines 10–318) actually contains 262 canonical keys (task estimated ~200), so full coverage = 262 + 11 new keys = 273 (consistent with fr/hi/zh locale files)
- Wrote src/i18n/locales/pt.ts (pt-BR, LTR): all 273 keys, single quotes, {placeholder} tokens preserved, 11 native language names verbatim, 4 calendar hints with exact digit samples, gender-neutral phrasings for {recordLabel} templates (e.g. 'Novo registro: {recordLabel}')
- Verified with bun: parses cleanly, count 273, zero missing/extra/duplicate keys, all placeholder tokens and mandated strings (Sim/Não, toman, ٪, hint texts) match

Stage Summary:
- src/i18n/locales/pt.ts written, 273 keys
---
Task ID: 7-c
Agent: general-purpose (ckb dictionary)
Task: Sorani Kurdish (ckb) UI dictionary translation

Work Log:
- Read worklog.md + full dictionaries.ts; extracted the canonical fa key list from lines 10–318 (262 keys, verified programmatically via regex extraction)
- Wrote src/i18n/locales/ckb.ts: full Sorani Kurdish (ckb, RTL, Arabic script) translation — export `ckbDictionary`, flat keys identical to fa, all {placeholder} tokens preserved, verbatim native language names (11 language.* keys) and 4 calendar hint keys (hintJalali/hintKurdish/hintHijri/hintGregory) with digit samples kept exactly as given
- Verified: bun import OK, tsc --strict OK, key-set diff vs fa = 0 missing / 0 extra, placeholder tokens match fa 1:1 → 273 keys (262 fa + 11 new)

Stage Summary:
- src/i18n/locales/ckb.ts written, 273 keys

---
Task ID: 5
Agent: main (Z.ai Code)
Task: ساخت کامپوننت فرم درختی (Tree Form) بر اساس تصویر مرجع — فرمی با دو باکس: یک باکس درختواره و یک باکس فیلدهای ورودی — به‌صورت کامپوننت قابل‌استفاده‌ی مجدد در پوشه forms

Work Log:
- بررسی وضعیت کد: تسک‌های قبلی (۴ آیکون اکشن‌بار، هدر/بدنه فرم، تب‌بار + هدر داشبورد) قبلاً پیاده‌سازی شده بودند؛ TreePanel قدیمی فقط یک پیش‌نمایش read-only بود
- ساخت کامپوننت جدید `TreeForm` در `src/components/forms/tree-form.tsx` با چیدمان دو-باکسی مطابق تصویر مرجع:
  - باکس درختواره: عنوان «درختواره» + شمارنده، تولبار «جدید / تغییر / حذف»، جستجوی زنده در درخت (فیلتر خود-یا-فرزندان + حفظ اجداد)، درخت باز/بسته‌شونده با chevron راست‌به‌چپ، آیکون پوشه/فایل برای والد/برگ، badge کد، آیکون کپی روی هر نود، انتخاب با هایلایت آبی
  - باکس جزئیات: فیلدهای اصلی (tabKey=null) + تب‌های بدنه از تعریف فرم (کالاهای مرتبط / فیلدهای اضافی) با همان FieldRenderer/FormTabs مشترک
  - ParentPicker جدید برای فیلد «تودرتوها»: دراپ‌داون خود-ارجاع که رکوردهای خود فرم را سلسله‌مراتبی (با تورفتگی) لیست می‌کند، خود نود و descendants را حذف می‌کند (جلوگیری از حلقه)، جستجو + پاک‌کردن دارد و مقدار parentId رکورد والد را ذخیره می‌کند
- helper جدید `pickParentField` در form-utils.ts (تشخیص فیلد والد با fieldKey=parentId یا lookup با کلید parent)
- اتصال به DataFormWindow: شاخه‌ی type==='tree' حالا TreeForm را رندر می‌کند (TreePanel قدیمی حذف شد)؛ کل ماشین وضعیت CRUD (ذخیره/حذف/کپی/تأیید حذف/فوتر/اکشن‌بار) مشترک باقی ماند؛ دکمه‌های پیمایش خطی first/prev/next/last برای فرم‌های درختی با prop جدید `hideNav` در FormActionBar مخفی می‌شوند
- تب‌بار ماژول: شرط هاردکد `formKey === 'account-class'` حذف شد — حالا هر آیتم منو با formKey به‌عنوان تب فرمِ مستقل باز می‌شود (باگ «باز شدن تب فرم به‌صورت پنجره ماژول» رفع شد)
- i18n: ۶ کلید جدید (treePanel/treeSearch/nodeNew/nodeEdit/nodeDelete/treeSelectHint) به هر ۱۱ زبان (fa/en/tr/ar + hi/fr/ps/ckb/pt/ko/zh) اضافه شد
- Seed «گروه کالا-خدمت» در settings-service (`scripts/seed-tree-form.ts`): FormDefinition با type='tree'، ۱۱ فیلد (هدر: کد/کد نمایشی/عنوان/عنوان(۲)/تودرتوها/فعال + دو تب) و ۶ نود نمونه مطابق تصویر (کالا ۱۰ → مواد اولیه ۱۰۰۱ → ۱۰۰۱۰۱/۱۰۰۱۰۲، خدمت ۲۰ → مشاوره ۲۰۰۱) با لینک parentId واقعی بین رکوردها
- Seed منو در desktop-service (`scripts/seed-product-service-group-menu.ts`): آیتم منو با ترجمه fa/en/tr/ar در منوی «عمومی» ماژول تنظیمات
- اعتبارسنجی E2E با agent-browser: ورود → تنظیمات → گروه کالا-خدمت؛ انتخاب نود، جستجو، «جدید» (پیش‌فرض والد)، ذخیره (نود جدید زیر کالا)، حذف با دیالوگ تأیید «از حذف اطلاعات مورد نظر اطمینان دارید؟ / بلی / خیر»، تغییر والد از طریق ParentPicker با ذخیره و بازسازی درخت، فهرست رکوردها، رگرسیون فرم تب‌دی account-class، لایه‌بندی موبایل (390px) و حالت LTR انگلیسی — همه موفق؛ dev.log بدون خطا، lint پاس

Stage Summary:
- کامپوننت `TreeForm` (src/components/forms/tree-form.tsx) آماده استفاده‌ی مجدد است: هر FormDef با type='tree' به‌طور خودکار از طریق DataFormWindow با همین کامپوننت رندر می‌شود؛ سلسله‌مراتب از data.parentId رکوردها ساخته می‌شود
- معماری: TreeForm صرفاً presentation است و ماشین وضعیت CRUD را از DataFormWindow به ارث می‌برد؛ بنابراین اکشن‌بار، دیالوگ تأیید حذف، فوتر وضعیت و Ctrl+S بدون تکرار کد در فرم درختی هم کار می‌کنند
- فرم نمونه «گروه کالا-خدمت» با داده درختواره‌ای در منوی عمومی تنظیمات در دسترس است (formKey=product-service-group)
- فایل‌های کلیدی: tree-form.tsx (جدید)، form-window.tsx، action-bar.tsx (hideNav)، form-utils.ts (pickParentField)، module-menu.tsx (رفع باگ تب فرم)، dictionaries.ts + ۷ locale (۶ کلید ×۱۱ زبان)، seed-tree-form.ts، seed-product-service-group-menu.ts

---
Task ID: 8
Agent: main (Z.ai Code)
Task: اصلاح کامپوننت TreeForm — حذف دکمه‌های «جدید / تغییر / حذف» از تولبار درختواره (به‌دلیل وجود معادل‌ها در اکشن‌بار) + افزودن منوی راست‌کلیک روی نودها: «زیرشاخه جدید» و «حذف شاخه» (فقط برای برگ بدون زیرشاخه)

Work Log:
- حذف کامل تولبار سه‌دکمه‌ای (جدید/تغییر/حذف) از هدر باکس درختواره در tree-form.tsx — هدر حالا فقط عنوان «درختواره» + شمارنده + جستجو را دارد؛ ایمپورت‌های بلااستفاده (Plus/Pencil) حذف و FolderPlus اضافه شد
- تغییر قرارداد props کامپوننت: حذف onEditNode و تبدیل onDeleteNode به onDeleteNode(recordId) که شناسه نودِ راست‌کلیک‌شده را صریح پاس می‌دهد
- منوی راست‌کلیک (context menu) روی هر treeitem: منوی شناور fixed-position با انیمیشن framer-motion (AnimatePresence)، موقعیت‌دهی clamp‌شده داخل viewport، بستن با کلیک بیرون/Escape (useDismiss) و بستن خودکار روی scroll/resize
  - «زیرشاخه جدید» (FolderPlus، سبز): startNew با preset والد = نود راست‌کلیک‌شده؛ در DataFormWindow با تأیید discard برای پیش‌نویس کثیف محافظت شد
  - «حذف شاخه» (Trash2، قرمز): فقط برای نود بدون فرزند فعال است؛ روی والد غیرفعال با tooltip «این شاخه دارای زیرشاخه است»؛ در حالت new و isBusy هم غیرفعال
- DataFormWindow: requestDelete حالا targetId اختیاری می‌گیرد؛ state جدید deleteTargetId + helper cancelDelete (پاک‌سازی intent و target با هم)؛ confirmDelete رکورد هدف را با deleteTargetId ?? current.id حذف می‌کند — دیالوگ تأیید مشترک «بلی/خیر» بدون تغییر برای هر دو مسیر اکشن‌بار و راست‌کلیک کار می‌کند
- i18n: ۳ کلید جدید formWindow.treeContextNewSub / treeContextDelete / treeContextDeleteDisabled به هر ۱۱ زبان (dictionaries.ts: fa/en/tr/ar + locales/: hi/ps/ckb/pt/ko/fr/zh)
- E2E با agent-browser (فرم گروه کالا-خدمت): راست‌کلیک روی «کالا» (والد) → «حذف شاخه» disabled ✓؛ راست‌کلیک روی «مشاوره» (برگ) → enabled ✓؛ «زیرشاخه جدید» روی کالا → حالت جدید با ParentPicker پیش‌فرض «10 — کالا» ✓؛ ذخیره → نود سطح ۲ در درخت ✓؛ حذف همان نود: خیر → لغو ✓، بلی → حذف و بازسازی درخت ✓؛ تست locale انگلیسی → "New sub-branch / Delete branch" با چیدمان LTR ✓؛ بدون خطای کنسول، dev.log پاک، lint پاس

Stage Summary:
- تولبار درختواره حذف شد؛ CRUD فرم درختی فقط از اکشن‌بار + منوی راست‌کلیک مدیریت می‌شود
- منوی راست‌کلیک نودها: «زیرشاخه جدید» همیشه فعال، «حذف شاخه» مشروط به برگ‌بودن (بدون زیرشاخه) — نما به همان دیالوگ تأیید حذف مشترک وصل است
- deleteTargetId در DataFormWindow امکان حذف رکورد هدف مستقل از رکورد جاری را می‌دهد (بدون شکستن مسیرهای action-bar)
- فایل‌ها: tree-form.tsx، form-window.tsx، dictionaries.ts، locales/{hi,ps,ckb,pt,ko,fr,zh}.ts

---
Task ID: 9
Agent: main (Z.ai Code)
Task: چیدمان افقی فیلدها در tree-form.tsx و form-window.tsx — برچسب در سمت راست و فیلد ورودی در سمت چپِ برچسب (RTL)؛ در زبان‌های LTR آینه‌ای (برچسب چپ، ورودی راستِ برچسب)

Work Log:
- تست تجربی RTL flex در مرورر: اولین فرزند DOM در flex-row با dir=rtl در «راست» رندر می‌شود → راه‌حل بدون هیچ rtl: override: DOM [label, control] در یک flex row، جهت‌ها خودکار آینه می‌شوند
- field-renderer.tsx (پوشش همه انواع فیلد در هر دو فایل هدف): ردیف عمودی «برچسب-بالا/ورودی-پایین» به ردیف افقی تبدیل شد — label با عرض ثابت w-36 shrink-0 (راست در RTL / چپ در LTR)، ستون کنترل min-w-0 flex-1، items-start + leading-6 برای تراز بودن خط اول برچسب با کنترل h-6؛ ستاره اجباری داخل label با ms-1
- fields/field-checkbox.tsx: چیدمان معکوس قبلی (باکس اول) به الگوی یکسان تبدیل شد — برچسب w-36 در سمت شروع (راست در RTL)، Checkbox بعد از آن (چپِ برچسب در RTL) — دقیقاً مطابق نمونه ERP کاربر
- tree-form.tsx / ParentPicker: برچسب به سمت شروع رفت و کمبوباکس + دراپ‌داون (AnimatePresence) داخل ستون کنترل نسبی (relative min-w-0 flex-1) قرار گرفت تا پنل با عرض خود کامبوباکس تراز بماند
- FieldDate: راهنمای تقویم زیر ورودی داخل ستون کنترل می‌ماند؛ FieldTextarea و LookupField بدون تغییر کد، خودکار با ردیف افقی هم‌راستا شدند
- E2E با agent-browser در دو جهت: fa/RTL (فرم طبقه حساب معین + گروه کالا-خدمت): برچسب راست / ورودی چپ برای همه انواع (text/lookup/checkbox/parent-picker/date) ✓؛ en/LTR: برچسب چپ / ورودی راست ✓؛ لود تازه: بدون هیچ خطای کنسول؛ lint پاس؛ سرور یک‌بار OOM/kill شد و با الگوی setsid nohup دوباره بالا آمد

Stage Summary:
- چیدمان فیلدهای هر دو فرم (ساده/تب‌دی و درختی) حالا افقی و direction-محور است: برچسب همیشه در سمت راست (RTL) یا چپ (LTR) و ورودی در سمت مقابلِ برچسب — با کلاس‌های منطقی و بدون کد مخصوص جهت
- عرض ستون برچسب w-36 ثابت است تا ورودی‌های هر دو ستون گرید ۲تایی تراز بمانند؛ برچسب‌های بلند در همان ستون می‌شکنند
- فایل‌ها: field-renderer.tsx، fields/field-checkbox.tsx، tree-form.tsx (ParentPicker) — form-window.tsx خودکار از طریق FieldRenderer تغییر کرد

---
Task ID: 9
Agent: main (Z.ai Code)
Task: کامپوننت جدید «فهرست اطلاعات ثبت‌شده» (DataListWindow) — لیست رکوردهای ذخیره‌شده هر فرم، منوی «فهرست‌های اطلاعات» در منوی ماژول‌ها، و نوار آیکون‌های فوتر مطابق تصویر مرجع

Work Log:
- settings-service: endpoint جدید `GET /api/forms/:moduleKey` (listDefinitions) — خلاصه فرم‌های فعال ماژول با نام localized (forms.types.ts: FormSummary؛ controller/service به‌روزرسانی شد؛ با curl و JWT تست شد)
- BFF مسیر `/api/desktop/menus/[moduleKey]`: تابع withDataListsMenu که پس از دریافت منوهای desktop-service، فرم‌های فعال ماژول را از سرویس خود ماژول (با ارسال x-api-key + JWT کاربر) می‌گیرد و منوی مجازی «فهرست‌های اطلاعات» (id=virtual:data-lists، icon=clipboardList) را با یک آیتم «فهرست {نام فرم}» به ازای هر فرم و formKey قراردادی `list:<formKey>` به انتهای منوها اضافه می‌کند؛ در نبود سرویس فرم/خطا، منوی اصلی دست‌نخورده برمی‌گردد (graceful)
- BFF مسیر جدید `/api/modules/[module]/forms/route.ts` — پروکسی لیست فرم‌های ماژول (مستند در قرارداد types/forms.ts)
- desktop-store: ListWindowInfo، kind جدید `'list'` برای تب‌ها، اکشن `addListTab` (id=`list:<formKey>`)، و فیلدهای اختیاری recordId/startInNew/nonce روی FormWindowInfo
- کامپوننت جدید `src/components/forms/data-list-window.tsx` (~1080 خط): جدول کامل فیلدهای فرم + ستون چک‌باکس، هدر sticky، اسکرول افقی، ردیف فیلتر با placeholder «نمای...» و قیف هر ستون + قیف پاک‌کردن همه فیلترها، فیلتر زنده با نرمال‌سازی (ی/ک عربی↔فارسی، ارقام فارسی/عربی→لاتین)، انتخاب رکورد (کلیک/ctrl+کلیک/چک‌باکس/انتخاب همه)، عنوان «فهرست {name} (N)» با شمارش زنده، حالت خالی «اطلاعاتی برای نمایش وجود ندارد»
- فوتر آیکونی مطابق تصویر مرجع (راست در RTL، چپ در LTR): بازخوانی، چاپ، خروجی اکسل (CSV با BOM)، مشاهده، اصلاح، حذف، جدید + جداکننده + انتخاب ستون‌ها (Popover نمایش/پنهان ستون‌ها با badge تعداد) و نوار فیلتر (toggle)؛ رنگ‌بندی sky/emerald/rose/slate مثل اکشن‌بار فرم‌ها
- حذف با دیالوگ «تأیید حذف» بلی/خیر (هم‌سو با فرم‌ها) و پشتیبانی حذف چند رکورد
- هماهنگی فرم↔لیست: دبل‌کلیک ردیف → تب فرم با recordId همان رکورد (رکورد N از M)؛ «جدید» → تب فرم در حالت جدید؛ رفرش خودکار لیست پس از ذخیره/حذف در فرم از طریق CustomEvent `erp:records-changed` (src/lib/app-events.ts)؛ form-window.tsx به recordId/startInNew/nonce در load و dispatch رویداد مجهز شد
- module-menu.tsx: مسیریابی formKeyهای با پیشوند `list:` به addListTab
- desktop-shell.tsx: رندر DataListWindow برای تب‌های kind=list
- i18n: ۲۸ کلید جدید `dataList.*` به fa/en/tr/ar (داخل dictionaries.ts) و hi/ps/ckb/pt/ko/fr/zh اضافه شد
- باگ‌فیکس در حین E2E: ۱) loadModuleMenus از fetch ساده به apiFetch (ارسال JWT برای enrich شدن منو) ۲) ترتیب شاخه‌های cellText — ستون والد فرم‌های درختی (parentId با fieldType=lookup) قبل از شاخه lookup پردازش شود تا به‌جای UUID عنوان رکورد والد نمایش یابد

Stage Summary:
- هر فرم DB-driven به‌صورت خودکار یک «فهرست» دارد: منوی مجازی «فهرست‌های اطلاعات» در منوی هر ماژول (فعلاً settings با ۲ فرم) بدون نیاز به seed
- DataListWindow عمومی و direction-محور: RTL/LTR آینه‌ای، ۱۱ زبان، جدول/فیلتر/انتخاب/حذف/خروجی CSV/انتخاب ستون/بازخوانی
- فایل‌های جدید: data-list-window.tsx، app-events.ts، api/modules/[module]/forms/route.ts — فایل‌های تغییر یافته: forms.service/controller/types (settings-service)، menus/[moduleKey]/route.ts، desktop-store.ts، form-window.tsx، module-menu.tsx، desktop-shell.tsx، index.ts (forms barrel)، dictionaries.ts + ۷ فایل locale
- E2E با agent-browser تأیید شد: fa/RTL و en/LTR، فیلتر زنده، حذف با بلی/خیر، دبل‌کلیک→فرم با رکورد درست، جدید→حالت جدید، انتخاب ستون، بازخوانی، موبایل — بدون خطای کنسول؛ lint و tsc (src) پاک

---
Task ID: 10
Agent: main (Z.ai Code)
Task: ایجاد فایل قانون‌گذاری برای هوش مصنوعی (AI governance) — هوش مصنوعی باید قبل از هر تغییر، قوانین را چک و کنترل کند و بر اساس آن پاسخ دهد

Work Log:
- بررسی worklog و ریشه پروژه: Task 9 (چیدمان افقی فیلدها) و Task 9 دوم (DataListWindow + منوی فهرست‌ها) هر دو تکمیل و E2E تأیید شده‌اند؛ پروژه فایل قوانین (AGENTS.md/CLAUDE.md) نداشت؛ شمارش زبان‌ها از src/i18n/config.ts به‌روز شد (۱۱ زبان، RTL: fa/ar/ps/ckb)
- ایجاد `AGENTS.md` در ریشه پروژه به‌عنوان «قانون اساسی» پروژه (استاندارد باز AGENTS.md که اکثر ابزارهای AI به‌طور خودکار می‌خوانند) با ۱۰ بخش شماره‌دار برای استناد در پاسخ‌ها:
  - §0 پروتکل اجباری «قبل از تغییر، قانون را چک کن»: خواندن AGENTS.md + worklog قبل از هر تغییر، اعلام قوانین مرتبط (با شناسه §)، اولویت درخواست کاربر > قوانین، ممنوعیت‌های مطلق (شکستن قراردادهای قفل‌شده / حذف فیچر / کد تست / bun run build / رنگ indigo-blue)، اعلام فرض برای اطلاعات گم‌شده
  - §1 زبان و چندزبانی (۱۱ زبان، کلاس‌های منطقی RTL/LTR)؛ §2 استک غیرقابل تغییر؛ §3 قواعد سندباکس (پورت 3000، الگوی setsid orphan، XTransformPort، ممنوعیت build و Server Action و روت جدید)؛ §4 دیتابیس؛ §5 قراردادهای قفل‌شده (types/forms.ts، مسیرهای BFF، @erp/shared، فرم DB-driven، چیدمان w-36، رویداد erp:records-changed، پیشوند list:)؛ §6 پروتکل worklog؛ §7 تعریف «انجام‌شده» (چک‌لیست ۸ موردی شامل lint/dev.log/Agent Browser/RTL+LTR/موکایل/۱۱ زبان)؛ §8 قوانین UI/UX (فوتر sticky، max-h-96، بدون indigo/blue، 44px، ARIA)
  - §9 English Quick Reference — خلاصه ۱۰ بندی انگلیسی برای پیروی مطمئن‌تر ابزارهای دیگر
- ایجاد `CLAUDE.md` به‌صورت اشاره‌گر (@AGENTS.md) تا ابزارهایی که فقط CLAUDE.md را می‌خوانند (مثل Claude Code) هم به قانون‌نامه برسند
- تغییر فقط داکیومنتی است (md)؛ به کد دست نخورده و نیازی به lint/E2E ندارد

Stage Summary:
- قانون‌نامه هوش مصنوعی فعال شد: AGENTS.md (مرجع اصلی، فارسی + خلاصه انگلیسی §9) + CLAUDE.md (اشاره‌گر)
- مکانیزم اجرا: ابزارهای سازگار با AGENTS.md خودکار آن را می‌خوانند؛ در این محیط، عامل موظف است قبل از هر تغییر آن + worklog را بخواند، قوانین مرتبط را با شناسه § اعلام کند و «انجام‌شده» را فقط با چک‌لیست §7 اعلام کند
- مالک می‌تواند AGENTS.md را مستقیم ویرایش کند؛ قوانین قفل‌شده فنی: §5 (قراردادها)، §3 (سندباکس)، §2 (استک)

---
Task ID: 11
Agent: main (Z.ai Code)
Task: فیلتر ستونی سرورساید در DataListWindow — با کلیک روی قیف هر ستون، منوی زیبای عملگرها (تمام/دارای مقدار/بدون مقدار/شروع با/پایان با/برابر با/حاوی نباشد/حاوی تایپ‌شده مطابق تصویر مرجع) باز شود و فیلتر بر اساس عملگر انتخابی در سرویس مالک داده (settings-service) اجرا شود

Work Log:
- قرارداد (§5.1 سازگار با گذشته): ListFilterOp (8 عملگر) و ListColumnFilter به src/types/forms.ts و آینه آن در mini-services/settings-service/src/forms/forms.types.ts اضافه شد
- settings-service: forms.service.ts — parseColumnFilters (JSON ?filters= با whitelist فیلد KEY_PATTERN + عملگر + سقف ۸ فیلتر + مقدار ≤200 کاراکتر؛ payload خراب هرگز 500 نمی‌شود)، normalizeSearchText (آینه کلاینت: ی/ک عربی↔فارسی، ارقام فارسی/عربی→لاتین، ZWNJ، lowercase)، matchesFilter (معناشناسی ۷ عملگر روی متن نمایشی نرمال‌شده)، buildSearchTextResolver (resolve متن نمایشی سمت سرویس: ستون والد درخت = عنوان رکورد والد، lookup = لیبل localized گزینه از FormLookupOption، checkbox = بلی/خیر + Yes/No + raw) — سازگار PostgreSQL (فیلتر در JS، نه SQL خاص SQLite)
- forms.controller.ts: listRecords حالا locale و filters را از @Query می‌گیرد؛ BFF catch-all از قبل query string را forward می‌کرد (بدون تغییر)
- data-list-window.tsx: فیلتر کلاینت‌ساید حذف شد؛ حالت جدید ColumnFilterState {op,value} به‌ازای هر ستون + allRecords (مجموعه کامل برای عنوان والد/شمارش کل) و records (برش سرور-فیلترشده)؛ debounce 250ms روی تغییر فیلترها با گارد seq برای ریسپانس‌های کهنه؛ refreshRecords و رویداد erp:records-changed هم برش فیلترشده را نگه می‌دارند؛ قیف هر ستون به دکمه بازکننده منو تبدیل شد (active=آبی sky) + اینپوت برای عملگرهای بدون مقدار disabled؛ منوی عملگرها fixed-position با framer-motion AnimatePresence، clamp داخل viewport (باز شدن رو به بالا در نبود جا)، بستن با Escape/کلیک بیرون/scroll/resize، آیتم انتخابی با highlight آبی + Check، role=menu/menuitemradio + aria-checked؛ هشدار لود فیلتر با toast؛ dim کردن جدول حین fetch (isFiltering)؛ شمارش عنوان = رکوردهای فیلترشده و subtitle = کل رکوردها
- i18n: ۹ کلید جدید dataList.filterMenuAria + dataList.filterOp{All,HasValue,NoValue,StartsWith,EndsWith,Equals,NotContains,Contains} به هر ۱۱ زبان (dictionaries.ts: fa/en/tr/ar + locales/: hi/ps/ckb/pt/ko/fr/zh)
- تست سرورساید با curl (از طریق BFF با JWT): startsWith/equals/hasValue/noValue/notContains دقیق، عملگر نامعتبر نادیده گرفته شد (بدون 500) — همه پاس
- E2E با agent-browser: fa/RTL — منوی ۸ گزینه‌ای مطابق تصویر (تمام انتخاب‌شده با تیک)؛ شروع با «مشتر» روی عنوان → درخواست GET records?filters=[{field:title,op:startsWith,value:مشتر}] 200 و فقط ۱ رکورد؛ دارای مقدار روی عنوان(۲) → اینپوت disabled و AND دو فیلتر؛ پاک‌کردن همه → بازگشت به کل؛ فهرست درختی گروه کالا-خدمت: شروع با «مواد» روی ستون تودرتوها → filters=[{field:parentId,...}] 200 → فقط ۱۰۰۱۰۱ (والد سمت سرویس به عنوان والد resolve شد)؛ en/LTR — لیبل‌های انگلیسی منو و آینه‌سازی؛ Contains "Pack" + شروع با «مواد» هم‌زمان → ۱ رکورد؛ موبایل 390px — منو clamp داخل viewport؛ بدون خطای کنسول/صفحه، dev.log پاک، lint پاس، tsc (src و forms.* سرویس) پاک

Stage Summary:
- فیلتر ستونی فهرست‌های اطلاعات حالا سرورساید است: عملگر انتخابی کاربر در settings-service روی متن نمایشیِ نرمال‌شده سلول‌ها اجرا می‌شود (لیبل lookup، عنوان والد درخت و بلی/خیر چک‌باکس سمت سرویس resolve می‌شوند تا فیلتر با آنچه کاربر می‌بیند یکی باشد)
- منوی عملگرها مطابق تصویر مرجع: تمام / دارای مقدار / بدون مقدار / شروع با / پایان با / برابر با / حاوی نباشد / حاوی تایپ‌شده — در هر ۱۱ زبان و RTL/LTR آینه‌ای
- قرارداد جدید: GET /api/modules/:module/forms/:formKey/records?filters=[{field,op,value}] (JSON) — بدون فیلتر رفتار قبلی
- فایل‌ها: types/forms.ts، forms.types/service/controller (settings-service)، data-list-window.tsx، dictionaries.ts + ۷ locale

---
Task ID: 12
Agent: main (Z.ai Code)
Task: چهار اصلاح فهرست اطلاعات و تب‌بار — ۱) فیلدهای فیلتر غیرفعال بودند و تایپ نمی‌شدند ۲) فونت فرم‌های بازشو در تب‌بار ۱۲px + کاهش ۴۰٪ ارتفاع تب‌بار ۳) فونت ردیف‌های فهرست ۲px کوچک‌تر ۴) تغییر عرض ستون‌ها با موس (ستون‌های دیگر ثابت + اسکرول افقی)

Work Log:
- باگ فیلتر (۱): علت — اینپوت فیلتر هر ستون وقتی هنوز عملگری انتخاب نشده بود (یا عملگر دارای مقدار/بدون مقدار بود) disabled می‌شد؛ setFilterValue حالا همیشه ورودی فعال می‌گذارد و تایپِ اولین حرف به‌طور خودکار عملگر را به «حاوی تایپ‌شده» (contains) سوئیچ می‌کند (شامل ورودی‌هایی که op قبلی hasValue/noValue بوده)؛ دکمه قیف منوی ۸ عملگری سر جایش است و مسیر سرورساید ?filters= قبلی دست‌نخورده ماند
- placeholder فیلتر fa از «نمای...» به «فیلتر...» (مطابق تصویر مرجع کاربر) و ar/ps/ckb هم به معادل درست «تصفية/فلټر/فلتەر...» اصلاح شد (ترجمه‌های قبلی به معنی «نما/دید» بود نه فیلتر)
- تب‌بار (۲): ارتفاع nav از h-11 (۴۴px) به h-[26px] — دقیقاً ۴۰٪ کاهش — و فونت تب‌ها به text-[12px] یکدست شد (حالت sm: با 12.5px حذف شد)؛ چیپ آیکون ۲۴→۲۰px، آیکون ۱۳٫۵→۱۲px، دکمه بستن ۲۰→۱۶px، زیرخط فعال ۲٫۵→۲px، پیل فعال و پدینگ‌ها و فلش‌های اسکرول متناسب کوچک شدند
- فونت فرم‌ها (۲-ادامه): برچسب فیلدها ۱۲٫۵→۱۲px (field-renderer + field-checkbox + ParentPicker و منوهای tree-form و ردیف‌های drawer فرم)؛ ستاره اجباری ۱۳→۱۲px؛ بدنه section در FormShell پایه text-[12px] گرفت تا هر متن ارث‌بری ۱۲px باشد؛ controlClasses از قبل ۱۲px بود
- فونت ردیف‌های فهرست (۳): سلول‌های tbody از ارث‌بری ۱۲px جدول به text-[10px] صریح (کاهش دقیق ۲px)
- تغییر عرض ستون‌ها (۴): ستون کدنویسی data-col روی thهای هدر؛ دکمه دسته resize با عرض ۸px در لبه inline-end هر ستون (آینه‌ای RTL/LTR خودکار)، cursor-col-resize + خط راهنما hover (group/th)؛ اولین درگ: عرض همه ستون‌ها از DOM اندازه‌گیری و «منجمد» می‌شود (measureColumns) سپس جدول به table-fixed + colgroup با عرض px دقیق سوئیچ می‌شود — بنابراین عرض ستون‌های قبل/بعد هرگز تغییر نمی‌کند؛ درگ فقط ستون گرفته‌شده را تغییر می‌دهد (دلتا در RTL علامت معکوس)؛ کلیدهای ±۲۴px + تغییر جهت آگاه از RTL؛ دوبارکلیک روی دسته = بازنشانی به چیدمان خودکار پرکننده؛ clamp بین ۶۴ و ۱۲۰۰px؛ عبور مجموع عرض از پنجره = اسکرول افقی داخل فرم (overflow-auto موجود)؛ حین درگ select-none + cursor روی بدنه؛ aria-label با کلید جدید i18n
- i18n: کلید dataList.columnResizeHint به هر ۱۱ زبان (fa/en/tr/ar در dictionaries.ts + hi/ps/ckb/pt/ko/fr/zh) اضافه شد
- E2E با agent-browser (اندازه‌گیری واقعی DOM): nav=26px، فونت تب=12px، فونت ردیف=10px، فیلتر disabled=false؛ تایپ «مشتر» در فیلتر عنوان → درخواست GET records?filters=[{field:title,op:contains,value:مشتر}] 200 و فقط ۲ رکورد (مشتریان عمده/پیش‌دریافت مشتریان)؛ درگ RTL: عنوان ۲۰۳→۳۸۱px با ثابت‌ماندن همسایه‌ها (۲۰۳) و ظهور اسکرول افقی (scrollWidth 3267 > 1440)؛ درگ برگشتی ۳۸۱→۲۶۱؛ دوبارکلیک → بازگشت به layout خودکار بدون colgroup؛ en/LTR: درگ Title ۲۰۳→۳۲۱px، همسایه‌ها ثابت، اسکرول افقی، آینه‌سازی درست؛ موبایل ۳۹۰px: جدول اسکرول افقی سالم، تب‌بار فشرده؛ کنسول بدون خطا، dev.log بدون خطای runtime، lint و tsc(src) پاک

Stage Summary:
- فیلترهای ستونی فهرست حالا همیشه قابل تایپ‌اند: تایپ = فیلتر سرورساید «حاوی» بدون نیاز به انتخاب عملگر از منو؛ منوی عملگرها برای فیلترهای پیشرفته حفظ شد
- تب‌بار ۲۶px با فونت ۱۲px و فرم‌ها با فونت پایه ۱۲px؛ ردیف‌های فهرست ۱۰px — نمای فشرده ERP
- گرید فهرست تغییر عرض ستون با موس دارد:.freeze اندازه‌گیری هنگام اولین درگ تضمین می‌کند فقط ستون مقصد تغییر کند و سرریز به اسکرول افقی داخل پنجره می‌رود (هر دو جهت RTL/LTR + کیبورد + دوبارکلیک بازنشانی)
- فایل‌ها: data-list-window.tsx، tab-bar.tsx، field-renderer.tsx، field-checkbox.tsx، form-window.tsx، tree-form.tsx، form-shell.tsx، dictionaries.ts، locales/{hi,ps,ckb,pt,ko,fr,zh}.ts

---
Task ID: 13
Agent: main (Z.ai Code)
Task: کامپوننت جدید «دراپ‌داون مقادیر فیلتر» (FilterValuesDropdown) — کلیک روی فیلد فیلتر هر ستون، لیست زیبای مقادیر متمایز همان ستون (با تعداد رکورد) را باز کند؛ کاربر بتواند یک آیتم یا چند آیتم را انتخاب کند (تک/چند انتخابی به‌ازای هر فرم/فیلد کانفیگ‌پذیر) و فیلتر به‌صورت سرورساید اعمال شود

Work Log:
- قرارداد (§5.1 سازگار با گذشته): ListFilterOp + عملگر 'in'، ListColumnFilter + values?: string[]، FormFieldDef + filterMode?: 'single' | 'multi' و تایپ جدید FieldValueOption {value,count} — هم در src/types/forms.ts و هم آینه آن در mini-services/settings-service/src/forms/forms.types.ts
- settings-service: ستون filterMode (nullable TEXT) به FormFieldDefinition اضافه و db:push شد؛ mapField آن را برمی‌گرداند (null → undefined → پیش‌فرض multi در UI)
- endpoint جدید: GET forms/:moduleKey/:formKey/fields/:fieldKey/values?locale=&yesLabel=&noLabel= → مقادیر متمایز «متن نمایشی» ستون با تعداد رکورد، مرتب‌شده، سقف ۱۰۰۰؛ سلول‌های خالی مستثنا (عملگرهای دارای مقدار/بدون مقدار منوی قیف پوشش می‌دهند)
- رزولور متن سلول به {display, search} تفکیک شد (buildCellTextResolver): display = متن خالص گرید (لیبل lookup، عنوان والد درخت، بلی/خیر localized با پارامتر yesLabel/noLabel) برای equals/in؛ search = display + اضافات cross-locale چک‌باکس (بلی/Yes/true) برای عملگرهای متنی — معناشناسی Task 11 حفظ شد و equals/in روی چک‌باکس هم حالا دقیق کار می‌کند
- parseColumnFilters: پذیرش values آرایه‌ای برای op 'in' (≤20 مقدار × ≤200 کاراکتر، payload خراب هرگز 500 نمی‌شود)؛ listRecords هم yesLabel/noLabel می‌گیرد
- BFF gateway (§5.2): SUB_PATH_PATTERN با شاخه جدید /fields/<fieldKey>/values توسعه یافت (کلیدها با همان KEY_PATTERN محدودند)
- کامپوننت جدید src/components/forms/filter-values-dropdown.tsx: پنل شیشه‌ای تیره هم‌سبک منوی عملگرها با framer-motion؛ هدر (قیف + لیبل فیلد + بج حالت «چند انتخابی» آبی sky / «تک‌انتخابی» سبز emerald)؛ باکس جستجو با نرمال‌سازی فارسی (ارقام/ی/ک/ZWNJ)؛ لیست مقادیر با چک‌باکس (multi) یا رادیو (single) + بج تعداد رکورد هر مقدار؛ فوتر با شمارش انتخاب، «انتخاب موارد پیداشده»، «پاک‌کردن» و دکمه «اعمال فیلتر» (فقط multi؛ single با کلیک روی ردیف فوراً اعمال و بسته می‌شود)؛ حالت‌های loading (اسکلتون)/خطا (دکمه تلاش مجدد)/خالی/بدون‌نتیجه؛ cache ماژول‌سطح per column+locale؛ بستن با Escape/کلیک بیرون/resize/اسکرول بیرونی (اسکرول داخلی لیست نمی‌بندد)؛ ناوبری کیبورد ArrowUp/Down بین ردیف‌ها؛ role=dialog + aria-label + role=menuitemcheckbox/menuitemradio + aria-checked؛ کلاس‌های منطقی ps/pe/start/end (§1.4) — RTL/LTR آینه‌ای؛ پالت sky/emerald مطابق §8.6
- data-list-window.tsx: سلول فیلتر حالا دومرحله‌ای است — عملگرهای متنی (contains/startsWith/…) اینپوت تایپی قبلی را دارند؛ بقیه حالت‌ها (بدون فیلتر/دارای مقدار/بدون مقدار/مقادیر انتخابی) دکمه تریگر «فیلتر...» با ChevronDown نمایش می‌دهند که دراپ‌داون مقادیر را باز می‌کند؛ فیلتر فعال = حاشیه sky + بج +N برای مقادیر اضافه + دکمه × پاک‌کردن ستون؛ applyColumnValues فیلتر را به {op:'in', values} تبدیل و مسیر سرورساید قبلی (debounce 250ms + ?filters=) را طی می‌کند؛ دو پاپ‌اور mutually exclusive؛ fetchRecordsPage حالا yesLabel/noLabel دیکشنری locale فعلی را هم می‌فرستد
- seed-forms.ts: FieldSeed + filterMode (اسکریپت یک‌باره scripts/set-filter-modes.ts روی دیتابیس زنده اجرا شد: lookup→single (۱۱ فیلد)، بقیه→multi (۱۵ فیلد)) — پیش‌فرض UI برای undefined = multi
- i18n (§1.3): ۱۲ کلید جدید dataList.filterValues{Aria,MultiHint,SingleHint,Search,Empty,NoMatch,SelectShown,Clear,Apply,SelectedCount,Count,LoadError} به هر ۱۱ زبان (fa/en/tr/ar در dictionaries.ts + hi/ps/ckb/pt/ko/fr/zh)
- تست سرورساید با curl: values اثر (fa/en لیبل localized)، in روی effect=بدهکار → دقیقاً ۱ رکورد، values چک‌باکس با لیبل‌های locale، in خیر → ۰ رکورد، payload خراب → بدون 500
- E2E با agent-browser: fa/RTL — کلیک تریگر عنوان → پنل با ۲ مقدار و تعداد؛ انتخاب هر دو + اعمال → GET records?filters=[{field:title,op:'in',values:[پیش‌دریافت مشتریان,مشتریان عمده]}] 200 → (۲)؛ حالت تک‌مقدار → (۱)؛ تریگر فعال با متن مقدار + بج +۱ + دکمه ×؛ ستون اثر (lookup) → رادیو، کلیک فوری اعمال و ترکیب AND با فیلتر قبلی؛ جستجوی «عمده» داخل پنل → فقط مشتریان عمده؛ Escape می‌بندد؛ منوی ۸ عملگری قیف سالم + اینپوت تایپی برای عملگر متنی؛ en/LTR — پنل آینه‌ای، لیبل انگلیسی، in با Bedehkar → (۱)؛ موبایل 390px — پنل clamp داخل viewport (left:110,right:382)؛ فهرست درختی گروه کالا-خدمت — دراپ‌داون تودرتوها عناوین والد resolve‌شده (خدمت/کالا/مواد اولیه) و in کالا → رکورد ۱۰۰۱؛ کنسول و dev.log بدون خطا، lint پاس، tsc (src) پاک

Stage Summary:
- فیلدهای فیلتر فهرست اطلاعات حالا با کلیک، «دراپ‌داون زیبای مقادیر» را باز می‌کنند: کاربر مقادیر واقعی فیلد را با تعداد رکورد می‌بیند و یک یا چند مورد را برمی‌گزیند؛ انتخاب‌ها به‌صورت سرورساید (op:'in' روی متن نمایشی نرمال‌شده در سرویس مالک داده) اعمال می‌شوند — هیچ فیلتری در کلاینت اجرا نمی‌شود
- تک/چند انتخابی per form/field کانفیگ‌پذیر است (FormFieldDefinition.filterMode؛ lookup=single، بقیه=multi به‌عنوان سید پیش‌فرض؛ undefined=multi) و از سیدهای آینده هم قابل تغییر است
- قراردادهای جدید (سازگار با گذشته): GET …/fields/:fieldKey/values + op:'in' با values[] در ?filters=؛ BFF whitelist توسعه یافت
- فایل‌ها: types/forms.ts، forms.types/service/controller/schema (settings-service)، scripts/set-filter-modes.ts، scripts/seed-forms.ts، BFF route، filter-values-dropdown.tsx (جدید)، data-list-window.tsx، dictionaries.ts، locales/{hi,ps,ckb,pt,ko,fr,zh}.ts
