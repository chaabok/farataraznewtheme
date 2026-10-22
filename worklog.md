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
