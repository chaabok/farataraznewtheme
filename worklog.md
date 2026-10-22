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
