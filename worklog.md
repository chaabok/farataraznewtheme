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
