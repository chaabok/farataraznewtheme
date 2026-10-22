# AGENTS.md — قانون‌نامه پروژه برای هوش مصنوعی
# AI Governance Rules — this file is MANDATORY for every AI assistant (Claude Code, Cursor, Codex, Gemini CLI, Z.ai Code, ...)

> **برای مالک پروژه:** این فایل «قانون اساسی» پروژه است. هر هوش مصنوعی باید **قبل از هر تغییر کد** این فایل را بخواند، قوانین مرتبط را رعایت کند و در پاسخ‌هایش به شناسه قوانین (مثل §2.1) استناد کند.
> این فایل را آزادانه ویرایش کنید؛ هر تغییر در همین فایل بلافاصله برای همه عامل‌ها الزام‌آور می‌شود.
> **For AI agents:** English quick-reference is at the end (§8). When in doubt, the Persian text is the source of truth.

---

## §0 — پروتکل اجباری «قبل از تغییر، قانون را چک کن»

این بخش هسته قانون‌نامه است و تخطی از آن ممنوع است.

- **§0.1 قبل از هر تغییر کد:** فایل‌های `AGENTS.md` (همین فایل) و `worklog.md` را بخوان تا با قراردادهای پروژه و کار عامل‌های قبلی هم‌رواست.
- **§0.2 اعلام تطبیق:** برای هر مأموریت غیرجزئی، در ابتدای پاسخ به زبان کاربر بگو کدام قوانین این فایل بر کار جاری تأثیر دارند (مثال: «طبق §2.2 و §3.4...»).
- **§0.3 برنامه‌ریزی:** کارهای ۳ مرحله‌ای و بیشتر با TodoWrite مدیریت شوند؛ برای هر زیرعامل (subagent) یک **Task ID** سراسری تعیین شود و هم worklog و هم قوانین به او ارجاع داده شود.
- **§0.4 اولویت‌بندی:** درخواست صریح کاربر > این قانون‌نامه > برداشت شخصی عامل. اگر درخواست کاربر با قوانین تعارض دارد، **ابتدا تعارض را اعلام و تأیید کاربر را بگیر** (مگر اینکه خود کاربر صریحاً همان قانون را override کند).
- **§0.5 ممنوعیت‌های مطلق بدون تأیید کاربر:**
  - شکستن قراردادهای قفل‌شده §5
  - حذف یا بازنویسی فیچرهای موجود که کاربر درخواستش را نداده (تغییرها باید حداقلی و هدفمند باشند؛ Edit نه Rewrite)
  - نوشتن کد تست (test code) — کاربر تست نمی‌خواهد
  - اجرای `bun run build` یا افزودن وابستگی سنگین جدید
  - استفاده از رنگ indigo/blue در UI (مگر درخواست صریح کاربر)
- **§0.6 اطلاعات گم‌شده:** اگر ارجاع کاربر به تصویر/فایل/مشخصه‌ای ناموجود یا مبهم است، **هرگز حدس بحرانی نزن**؛ فرض معقول خود را پیاده و در پاسخ صریح اعلام کن که چطور قابل اصلاح است.
- **§0.7 بعد از هر تغییر کد:** طبق §7 (تعریف «انجام‌شده») تأیید کن و طبق §6 در worklog ثبت کن.

## §1 — زبان، ارتباط و چندزبانی

- **§1.1 پاسخ‌ها همیشه به زبان کاربر داده شود (فعلاً فارسی).** برچسب‌ها و پیام‌های داخل برنامه از دیکشنری i18n می‌آیند، نه از عامل.
- **§1.2 پروژه ۱۱ زبان دارد:** fa / en / tr / ar / hi / ps / ckb / pt / ko / fr / zh
  - RTL: `fa`, `ar`, `ps`, `ckb` — LTR: بقیه (مرجع: `src/i18n/config.ts` → `DIR_BY_LOCALE`)
- **§1.3 هر رشته کاربر-مواجه جدید باید در همان مأموریت به هر ۱۱ دیکشنری اضافه شود:** ۴ زبان اصلی در `src/i18n/dictionaries.ts` و ۷ زبان دیگر در `src/i18n/locales/{hi,ps,ckb,pt,ko,fr,zh}.ts`. رشته هاردکد‌شده UI ممنوع است — از `useTranslation()` استفاده کن.
- **§1.4 برای هر چیزی که جهت دارد (padding، margin، text-align، ترتیب flex) فقط کلاس‌های منطقی Tailwind استفاده شود:** `ps-/pe-/ms-/me-/start-/end-/text-start/text-end` — استفاده از `pl-/pr-/left-/right-` برای مقاصد جهت‌دار ممنوع.
- **§1.5 منطقه زمانی کاربر:** Asia/Tehran (تاریخ/ساعت از `src/i18n/calendar.ts` و Intl استفاده کنند).

## §2 — استک فناوری (غیرقابل مذاکره)

- **§2.1** Next.js 16 App Router + TypeScript 5 strict. تغییر فریم‌ورک ممنوع.
- **§2.2** Tailwind CSS 4 + shadcn/ui (سبک New York) + آیکون‌های Lucide. قبل از ساخت کامپوننت جدید، حتماً `src/components/ui/` را چک کن — همه اجزای استاندارد از قبل موجودند.
- **§2.3** Prisma ORM روی SQLite؛ هر schema باید **۱۰۰٪ سازگار PostgreSQL** باشد (برای مهاجرت آینده فقط `provider` و `DATABASE_URL` عوض شود). `List` primitive در Prisma ممنوع — از relation استفاده کن.
- **§2.4** State: Zustand برای state کلاینت، TanStack Query برای state سرور.
- **§2.5** بک‌اند: میکروسرویس‌های NestJS با bun در `mini-services/<name>-service/` (هر کدام package.json، prisma و دیتابیس مجزا). ۱۳ سرویس روی پورت‌های 3001–3013.
- **§2.6** `z-ai-web-dev-sdk` فقط در کد بک‌اند؛ ایمپورت در کد کلاینت ممنوع.

## §3 — قواعد اجرا در سندباکس

- **§3.1** سرور توسعه فقط پورت 3000 (`bun run dev` در پس‌زمینه، لاگ: `/home/z/my-project/dev.log`). **هرگز `bun run build` اجرا نشود.**
- **§3.2** میکروسرویس‌ها باید «یتیم» (orphan) اجرا شوند وگرنه با پایان دستور کشته می‌شوند:
  `( cd <service-dir> && setsid nohup bun --hot src/main.ts > <log-file> 2>&1 < /dev/null & )`
- **§3.3** گیت‌وی فقط یک پورت بیرونی دارد. درخواست‌های API به سرویس‌های دیگر **فقط مسیر نسبی + `?XTransformPort=<port>`**؛ URL مطلق (`http://localhost:...`) و نوشتن پورت در مسیر/وب‌سوکت ممنوع. socket.io همیشه: `io("/?XTransformPort={port}")` با path `/`.
- **§3.4** بک‌اند Next فقط با **API Route** کار شود؛ Server Action ممنوع.
- **§3.5** مسیر عمومی قابل مشاهده فقط `src/app/page.tsx` است (پارادایم دسکتاپ). روت عمومی جدید ممنوع — فیچر جدید = پنجره/کامپوننت داخل دسکتاپ.
- **§3.6** فقط یک پورت بیرونی قابل expose است؛ سرویس‌های اضافی (مثل websocket) داخل `mini-services/` با پورت خودشان اجرا شوند.

## §4 — دیتابیس

- **§4.1** schema در `prisma/` هر سرویس، فایل دیتابیس در `db/`. اعمال تغییرات: `bun run db:push`.
- **§4.2** کلاینت دیتابیس Next: `import { db } from '@/lib/db'`.
- **§4.3** الگوی معماری: database-per-service؛ سرویس‌ها مستقل‌اند و کلاینت فقط از طریق گیت‌وی BFF به آن‌ها وصل می‌شود.
- **§4.4** `orderBy` فقط روی فیلدهای موجود (قرارداد جاری پروژه: `createdAt`).

## §5 — قراردادهای قفل‌شده (Break ممنوع؛ فقط توسعه سازگار با گذشته)

- **§5.1** `src/types/forms.ts`: شکل `FormDef` و `FormFieldDef` فریز است. توسعه فقط به‌صورت backward-compatible (فیلد اختیاری جدید) مجاز است.
- **§5.2** مسیرهای BFF ثابت‌اند: `/api/auth/*`، `/api/desktop/*`، `/api/modules/[module]`، `/api/modules/[module]/stats`، `/api/modules/[module]/forms/*` (+ `/api/setup/*`). پروکسی ماژول‌ها whitelist ماژول دارند (ضد SSRF) — ماژول جدید باید به whitelist اضافه شود.
- **§5.3** امنیت میکروسرویس‌ها از کیت `mini-services/shared/` (`@erp/shared`) می‌آید. سرویس‌ها **هرگز مستقیم `@nestjs/*` یا `class-validator` import نکنند** — فقط از re-export کیت (جلوگیری از باگ dual-instance). گاردها: JWT کاربر + `x-api-key` سمت سرور (کلیدها در root `.env`).
- **§5.4** سیستم فرم DB-driven است: هر فرم از `FormDef` رندر می‌شود (`form-window.tsx` برای simple/tabbed، `tree-form.tsx` برای type='tree'، `data-list-window.tsx` برای فهرست رکوردها). فرم سخت‌کد جدید ممنوع — فرم جدید = seed در `settings-service`.
- **§5.5** چیدمان فیلدهای فرم افقی و قفل است: ردیف flex با label با عرض ثابت `w-36 shrink-0` + ستون کنترل `min-w-0 flex-1`؛ آینه‌سازی RTL/LTR خودکار با کلاس‌های منطقی (§1.4).
- **§5.6** ارتباط فرم↔فهرست از طریق رویداد `erp:records-changed` (`src/lib/app-events.ts`) است؛ تب‌ها دو نوع دارند: `form` و `list` (پیشوند formKey: `list:<formKey>`).
- **§5.7** قالب ثبت worklog (§6) و خود `worklog.md` قابل rewrite نیست — فقط append.
- **§5.8** الگوی رندر آیکون داینامیک از `icon-registry.ts`؛ برای رندر شرطی کامپوننت‌ها از createElement استفاده شود (قانون lint پروژه).

## §6 — پروتکل worklog

مسیر: `/home/z/my-project/worklog.md` — قبل از کار بخوان (§0.1)، بعد از کار append کن (هرگز overwrite نکن):

```markdown
---
Task ID: <شماره سراسری بعدی>
Agent: <نام عامل>
Task: <خلاصه مأموریت>

Work Log:
- <گام مشخص ۱>
- <گام مشخص ۲>

Stage Summary:
- <نتایج / تصمیم‌ها / فایل‌های تولیدی>
```

شماره Task ID سراسری و صعودی است؛ تسک‌های موازی پسوند دارند (مثل `2-a`, `2-b`).

## §7 — تعریف «انجام‌شده» (Definition of Done)

یک تسک کد فقط وقتی «تمام» است که همه موارد برقرار باشد — «کامپایل می‌شود» یا «سرور بالا آمده» هرگز کافی نیست:

- [ ] `bun run lint` پاس است
- [ ] `/home/z/my-project/dev.log` (بخش جدید) بدون خطای runtime
- [ ] با Agent Browser صفحه واقعاً رندر می‌شود (نه صفحه سفید/خطای hydration)
- [ ] مسیر طلایی کاربر end-to-end در مرورگر تست شده (کلیک، فرم، دیتای واقعی بک‌اند نمایش داده شود، نه اسکلتون معلق)
- [ ] هم RTL (fa) و هم LTR (en) چک شده و آینه‌ای درست است
- [ ] responsive (دسکتاپ + ~390px موبایل) و فوتر sticky برقرار است
- [ ] رشته‌های جدید در هر ۱۱ زبان اضافه شده‌اند (§1.3)
- [ ] worklog.md به‌روز شده

## §8 — قوانین UI/UX

- **§8.1** فوتر (تسک‌بار) با الگوی sticky: ریشه `min-h-screen flex flex-col` و فوتر `mt-auto` — در صفحات کوتاه به ته viewport بچسبد و در صفحات بلند به‌طور طبیعی پایین برود، هرگز روی محتوا نیفتد.
- **§8.2** لیست‌های بلند: `max-h-96 overflow-y-auto` + اسکرول‌بار سفارشی.
- **§8.3** طراحی mobile-first با بریک‌پوینت‌های استاندارد (`sm:/md:/lg:/xl:`)؛ حداقل هدف لمسی 44px.
- **§8.4** هر عمل async باید حالت loading، پیام خطای actionable و toast feedback داشته باشد.
- **§8.5** HTML معنایی (`main/header/nav/section`) + ARIA + alt برای همه تصاویر؛ ناوبری با کیبورد کار کند.
- **§8.6** انیمیشن‌ها ظریف (framer-motion)؛ رنگ‌بندی از متغیرهای پروژه (`bg-primary`، `text-primary-foreground`، ...)؛ پالت اکشن‌بار جاری: sky/emerald/rose/slate.
- **§8.7** پس‌زمینه رندر سفید است؛ اگر رنگ پس‌زمینه دیگری لازم است با wrapper داشته باش.

---

# §9 — English Quick Reference (for any AI tool)

1. **Before ANY change:** read `AGENTS.md` + `worklog.md`; state which rules (§id) apply; get user approval when a request conflicts with rules.
2. **Never** break locked contracts: `src/types/forms.ts` (FormDef/FormFieldDef), BFF paths, `@erp/shared` re-export pattern, worklog append-only format.
3. **Never** hardcode UI strings — all 11 locales (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh) must be updated in the same task. RTL = fa/ar/ps/ckb; use logical Tailwind classes only (`ps/pe/ms/me/start/end/text-start`).
4. **Stack is frozen:** Next.js 16 App Router, TypeScript 5, Tailwind 4, shadcn/ui, Prisma+SQLite (PostgreSQL-compatible, no List primitives), Zustand, NestJS mini-services on ports 3001–3013.
5. **Sandbox:** never `bun run build`; dev server = port 3000; orphan-start services with `( cd dir && setsid nohup bun --hot src/main.ts > log 2>&1 < /dev/null & )`; API calls = relative URLs only with `?XTransformPort=<port>`; no ports/absolute URLs anywhere in the frontend.
6. **Backend:** API Routes (never Server Actions); `z-ai-web-dev-sdk` backend-only; single visible route `src/app/page.tsx`; forms are DB-driven (new form = seed in settings-service, never hardcode).
7. **Database:** schema in `prisma/`, db file in `db/`, sync with `bun run db:push`, client via `@/lib/db`.
8. **UI laws:** sticky footer (`min-h-screen flex flex-col` + `mt-auto`), no indigo/blue, horizontal form field layout (label `w-36` + control `flex-1`), long lists `max-h-96 overflow-y-auto`, responsive mobile-first, loading/error/toast on every async action.
9. **Done = lint pass + clean dev.log + Agent Browser E2E (render + golden path + RTL & LTR + mobile) + worklog updated.** A build passing alone is never "done".
10. **After finishing:** append the standard section to `worklog.md` (Task ID / Agent / Task / Work Log / Stage Summary). Missing info → state your assumption explicitly instead of silently guessing.
