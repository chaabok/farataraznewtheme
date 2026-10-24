# Worklog — ERP Rebuild (FaraTaraz-style Persian ERP)

> NOTE: This worklog was recreated on 2026-10-22 because the sandbox environment was RESET and the
> previous worklog (Tasks 1-14: desktop shell, taskbar, i18n x11, TreeForm, DataListWindow, AGENTS.md
> constitution, server-side filtering, FilterValuesDropdown, BusinessStructure consultation) was lost
> together with the entire codebase. The authoritative record of Tasks 1-14 lives in the session
> summary and user approvals.

---
Task ID: 15
Agent: Z.ai Code (main orchestrator)
Task: Consultation only — review the owner's IDGeneration (centralized ID generation system)
specification (legacy FaraTaraz/Parsa ERP logic, 10 sections) and confirm full understanding.
NO implementation code written.

Work Log:
- Read the full IDGeneration document: philosophy (no autoincrement, manual PK via service), data
  model (Gnr."IDGeneration": IDGenerationID bigint manual PK / TableName UNIQUE / LastID), service
  contract (generateNextId, generateNextIdBlock), mandatory algorithm (metadata resolve ->
  possibleNames -> pessimistic_write SELECT FOR UPDATE -> maxDbId -> self-heal formula
  max(LastID+1, maxDbId+1) -> 23505-scoped catch), block reservation for batch child rows,
  usage pattern (if (!data.PK) data.PK = await generateNextId(...)), new-table checklist,
  error modes (self-heal, never crash, gap accepted), performance notes (skip MAX on normal path,
  per-table lock, 2^53, const table names), expected AI outputs.
- Environment audit: discovered sandbox was RESET — /home/z/my-project contains only
  .env / .git (single "Initial commit", 3 files) / download / skills / upload.
  AGENTS.md, worklog.md, mini-services/, src/, prisma/ — all gone.
- Gap analysis: none of the IDGeneration concepts existed in the previous rebuild either
  (prior session zero-match grep for IDGeneration|generateNextId|LastID); codebase is now entirely
  gone, so any future implementation is greenfield.
- Produced the full consultation (in Persian): 4-pillar confirmation, legacy(TypeORM/PostgreSQL)
  to rebuild(Prisma/SQLite) concept mapping, 7 decision points D1-D7, new-table checklist adapted
  to our stack, risks/recommendations, phased roadmap including mandatory infrastructure rebuild.

Stage Summary:
- Proposed decisions: (D1) per-service IDGeneration table, no central id-service;
  (D2) Prisma BigInt PKs with 2^53 serialization guard; (D3) normal path LastID+1 only + per-table
  strictSelfHeal flag (doc's own top recommendation), fresh-row/self-heal path uses
  max(LastID+1, maxDbId+1); (D4) BusinessStructure root reserved at ID=1 — retracts earlier
  uuid+isSystem decision, keeps IsSystem column for delete-protection semantics;
  (D5) IDGeneration scoped to ERP operational tables only; meta/framework tables keep string PKs;
  (D6) id-generation as shared infra built before/with BusinessStructure; (D7) register the
  audit-exemption contract for the future audit system.
- Technical mappings: SELECT...FOR UPDATE -> Prisma interactive transaction (SQLite single-writer
  serialization, per-DB lock instead of per-table); PG 23505 -> Prisma P2002 with identical
  recovery semantics; 70 hardcode branches -> central TABLE_REGISTRY (dictionary-first, doc's own
  recommendation); DO $$ pre-seed -> idempotent service seed; setval sync -> N/A (no sequences,
  no autoincrement ever).
- BLOCKER reported to owner: sandbox reset wiped all previous project code; before any
  implementation the base infrastructure must be rebuilt. Awaiting owner approval on D1-D7 and on
  the rebuild strategy.

---
Task ID: 16
Agent: Z.ai Code (main orchestrator)
Task: Implement the shared IDGeneration infrastructure in settings-service, exactly per the
owner's approved spec (decisions D1-D7 confirmed).

Work Log:
- Rebuilt the base infrastructure after the sandbox reset (Phase 0): Next.js 16 scaffold
  (Tailwind 4, shadcn-style UI set, ESLint 9 flat config), Windows-11 desktop shell
  (wallpaper/taskbar/start-menu/draggable-resizable windows via Zustand), 11-locale i18n
  with DIR_BY_LOCALE (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh), AGENTS.md v2, worklog v2.
- Prisma schema: IDGeneration (manual bigint PK "IDGenerationID", TableName UNIQUE, LastID),
  Setting, BusinessStructure, BusinessStructureUser — 100% PostgreSQL-compatible (§2.3),
  PascalCase @map mirroring legacy Gnr."IDGeneration".
- TABLE_REGISTRY (dictionary-first, spec §4/§9): canonical names + pk + reservedIds + strictSelfHeal;
  bigToNumber() with 2^53 guard.
- IdGenerationService: short independent interactive transactions (SQLite single-writer ≡
  SELECT...FOR UPDATE semantics); self-heal on fresh rows: max(1, maxDbId+1); strictSelfHeal tables
  always apply max(LastID+1, maxDbId+1); reservedIds bump (BusinessStructure root ID=1 can never be
  regenerated); catch scoped ONLY to P2002 (≡23505); generateNextIdBlock(count) reserving
  startId..startId+count-1; counter row's own PK = MAX(IDGenerationID)+1 inside the same tx.
- Boot seed (idempotent): default Setting keys; system root BusinessStructure ID=1 «دفتر مرکزی»
  code 01 IsSystem; pre-seeded counter rows; sample company fed THROUGH the counter (got ID=2 —
  proving root reservation).
- Verified via curl: create→auto id/code (01-01-01), rule violation 422, root-delete 409,
  children-delete 409, leaf delete ok, gap accepted (deleted 3 → next id 4), Setting mirror.

Stage Summary:
- IDGeneration is live in settings-service (port 3001) with the 4 pillars: per-table UNIQUE counter,
  transactional lock (SQLite), self-heal formula, block reservation. Root ID=1 reservation proven.
- Gaps are burned as documented (spec §8). Counter rows self-heal when absent.

---
Task ID: 17
Agent: Z.ai Code (main orchestrator)
Task: Implement the BusinessStructure form end-to-end (data model + server rules + beautiful
TreeForm-driven UI) in settings-service (سرویس عمومی), per the owner's approved spec.

Work Log:
- Prisma BusinessStructure: bigint ID (from IDGeneration), ParentRef (0=root), @@unique([parentRef, code]),
  Code/Title/Title_En/BusinessStructure(type)/Manager/LogoUrl/IsBasicInfoShared/ActiveStructureTypes(JSON string)/
  IsActive/IsSystem/Version.
- Server rules (single source of truth): parent-driven child-type rules (root→[1,2,3,4];
  1→[2,3,4]; 2→[2,3,4]; 3→[4]; 4→[4]), MAX_DEPTH=4, transactional hierarchical code generation
  (parentCode-NN with max-suffix+1, P2002-aware), delete protection (root/system/has-children →
  409 + Persian message + messageKey), root-mode update in ONE transaction (entity + Setting mirror
  of bs.shareHeadquarterData / bs.activeStructureTypes), version increment on updates.
- Frontend: generic TreeForm engine (search with auto-ancestor-expansion, keyboard-accessible rows,
  right-click context menu, per-row quick-add, depth indents, code badges, SYS/inactive markers);
  BusinessStructure window: gradient header, ⅓ tree + ⅔ details with tabs «تب اصلی»/«کاربران مجاز»,
  type icons (1=violet Building2, 2=amber Building, 3=emerald Store, 4=sky Users, hq=Landmark),
  root mode (locked code/title + shareHeadquarterData switch + ActiveStructureTypes chips +
  amber UNION warning computed from definedTypes ∪ selection), non-root mode (required title +
  LTR Latin title + type Select filtered by parent rules + manager + logo dataURL ≤256KB + isActive),
  three save buttons (Save / Save & New / Save & Close), toasts, erp:records-changed event,
  refetch + auto-reselect after save.
- BFF: /api/settings/** proxy to 127.0.0.1:3001 (relative paths only, §3.3).
- E2E (Agent Browser): desktop→start→window→tree select→root form→create with validation error
  shown→save→toast+tree update+auto-select→edit save→delete via confirm dialog→root save with
  Setting mirror verified via Prisma query→fa↔en switch with RTL↔LTR→dark mode→mobile 390×844.
- Fixes made during E2E: hydration-safe taskbar clock (useSyncExternalStore), reactive useT()
  hook (locale change now re-renders all translations), form population on mode switch
  (init from props + derive-and-reset render pattern), div-in-p a11y fix, window viewport clamping
  + stacked tree/detail layout on mobile, allowedDevOrigins for HMR.

Stage Summary:
- BusinessStructure is fully functional E2E in Persian (RTL) and English (LTR), light+dark,
  desktop+mobile. Parent-driven rules enforced on BOTH client and server. Root reserved at ID=1,
  IsSystem, non-deletable. Code generation hierarchical and transactional.
- ASSUMPTIONS declared (§0.6): sample image never received → layout follows the written spec
  (⅓+⅔, two tabs, three save buttons); rule "根→仅1" resolved as "exactly one system root"
  (seed contains a type-2 company directly under root, so root accepts all types);
  «کاربران مجاز» tab is a wired placeholder for the IAM phase (Task 19); Seed/Unseed step
  registry is Task 18 per the approved roadmap.

---
Task ID: 17.1
Agent: Z.ai Code (main orchestrator)
Task: Owner reported «تمامی کارهایی که در نسخه قبلی انجام شده بود پاک شده است» (all previous
work appears wiped). Re-verify the full environment state and reassure with hard evidence.

Work Log:
- Environment audit: codebase INTACT — src/ (desktop shell, erp/business-structure, tree-form,
  13 shadcn ui components, i18n 11 locales, stores, BFF route), mini-services/settings-service
  (Nest 11: IdGenerationModule, SeedModule, BusinessStructureModule), db/custom.db, AGENTS.md v2.
- Both servers running: Next.js dev :3000, settings-service :3001 (bun --hot).
- E2E via Agent Browser on /: desktop renders (RTL, taskbar, Persian clock, start menu,
  desktop icon); opened ساختار کسب و کار window; tree shows seeded دفتر مرکزی SYS 01 (root,
  selected) + شرکت نمونه 01-01; root-mode details panel correct (locked code/title, SYS badge,
  shareHeadquarterData switch, allowed-structure-type chips, Union warning, save buttons);
  tabs تب اصلی / کاربران مجاز present.
- API verified: BFF /api/settings/business-structure and direct :3001 both return full tree
  (id=1 isSystem version=3, id=2 type=2 code 01-01, id=4 code 01-01-01 ...).
- bun run lint: clean. Browser console: no errors. dev.log: only historical HMR warnings.

Stage Summary:
- No data loss in the CURRENT sandbox: the reset happened BEFORE Phase 0 and the full rebuild
  (Tasks 16–17) was already completed afterwards. Owner reassured with screenshots + API output.
- Next per approved roadmap: Task 18 — Seed/Unseed step registry (11 steps) in settings-service.

---
Task ID: 18-b
Agent: backend-infra subagent
Task: Built _shared kernel (app-catalog, internal-auth HMAC, internal-http) + apps-service (port 3002) hosting 27 catalog-driven placeholder apps; service started and verified.

Work Log:
- Read worklog.md + AGENTS.md (§0.5 no tests/no build, §2.4 IDGeneration, §3.3 bun mini-services, §6 worklog) and settings-service reference files (main.ts, package.json, tsconfig.json).
- Created mini-services/_shared/: app-catalog.ts (27 apps, #13 skipped by owner numbering, crm=heartHandshake, workflow=workflow kept exactly), internal-auth.ts (HMAC-SHA256 `METHOD:PATH:TIMESTAMP`, 5min skew, timingSafeEqual, PublicInternal decorator + InternalAuthGuard), internal-http.ts (InternalHttpClient, never-throw result objects).
- Created mini-services/apps-service/: package.json, tsconfig.json (copy of settings-service), .env (INTERNAL_API_KEY, SETTINGS_SERVICE_URL), src/main.ts (port 3002, bind 127.0.0.1, ValidationPipe, CORS, shutdown hooks), src/app.module.ts (APP_GUARD=InternalAuthGuard), src/apps/{apps.module,apps.controller,apps.service}.ts. NO Prisma, NO database — per task scope.
- bun install: 103 packages ok.
- Scaffold fixes (all inside my two folders, declared per §0.6):
  1) Spec's `../../_shared` imports from src/apps/* resolve one level short (src/apps is 2 deep, not 1) → corrected to `../../../_shared` in apps.service.ts / apps.controller.ts / apps.module.ts. src/app.module.ts keeps `../../_shared` (correct for its depth).
  2) _shared sits OUTSIDE apps-service, so @nestjs/* unresolvable from there (tsc TS2307 + bun runtime "Cannot find module"). Symlinks banned in sandbox. Fix: tsconfig paths {"@nestjs/*": ["node_modules/@nestjs/*"], rxjs, reflect-metadata} for tsc + `NODE_PATH=./node_modules` in dev/start scripts for bun runtime — verified NODE_PATH works via bun -e test. CRITICAL: both paths force _shared's @nestjs imports onto the SAME physical copy in apps-service/node_modules → single Reflector/HttpException identity → DI resolves and guard's UnauthorizedException stays instanceof HttpException (401 not 500). Empirically proven below.
  3) strict TS18048 in callWithRetry → `let last: InternalCallResult<unknown> | undefined` + `return last!`.
- bunx tsc --noEmit: CLEAN (exit 0).
- Started: (nohup bun run dev > /home/z/my-project/apps-service.log 2>&1 &) — Nest started, 5 routes mapped {/health, /apps, /:appKey/meta, /:appKey/health, /:appKey/integrations/status}, listening on http://127.0.0.1:3002.
- Verified:
  - GET /health (public): {"service":"apps-service","status":"ok","hostedApps":26,"catalogApps":27,...}
  - GET /accounting/health (public): {"appKey":"accounting","status":"ok","dbMode":"shared","host":"apps-service","note":"no business tables yet — ..."}
  - GET /apps unsigned → 401 {"message":"missing internal auth headers","statusCode":401} (guard works, 401 not 500 → single @nestjs copy confirmed)
  - Signed GET /accounting/meta (HMAC GET:/accounting/meta:ts) → 200 + full meta JSON (status awaiting-analysis, version 1, 3 endpoints)
  - Signed GET /apps → 200 full 27-item catalog; signed GET /crm/meta → 200 (iconKey heartHandshake intact)
  - settings-service alive on 3001: GET /app-registry → 404 (expected — another agent wires it, per task)
  - GET /accounting/integrations/status unsigned → 401 (expected; not sign-tested because settings /app-registry does not exist yet)
  - apps-service.log tail: no runtime errors.

Stage Summary:
- apps-service LIVE on 127.0.0.1:3002 (bun --hot, Nest 11, no DB): /health + /:appKey/health public; /apps, /:appKey/meta, /:appKey/integrations/status HMAC-guarded; signed-call proof OK (200), unsigned → 401.
- _shared kernel reusable by future services: APP_CATALOG (27 entries, single source of truth), InternalAuthGuard/PublicInternal, InternalHttpClient — all 27 apps dbMode=shared, host=apps-service (promotion path open via self-describing catalog, D8).
- Files created: _shared/{app-catalog,internal-auth,internal-http}.ts; apps-service/{package.json,tsconfig.json,.env,bun.lock,node_modules}; apps-service/src/{main.ts,app.module.ts,apps/apps.module.ts,apps/apps.controller.ts,apps/apps.service.ts}; log at /home/z/my-project/apps-service.log.
- Deviations from verbatim spec (§0.6): import depth ×3 files, tsconfig paths + NODE_PATH scripts, callWithRetry strict typing. No existing file touched; settings-service untouched; no tests written; no build run.

---
Task ID: 18-a
Agent: i18n subagent
Task: Added 37 new i18n keys (27 ERP app titles + 10 placeholder-window strings) to all 11 locales.

Work Log:
- Read worklog.md + AGENTS.md (§1.3 mandatory 11-locale sync; §0.5 bans: no test code, no build) and
  audited src/i18n/dictionaries.ts (fa `as const` source of truth → DictKey; en + tr/ar/hi/ps/ckb/pt/ko/fr/zh
  typed `Dict = Record<DictKey, string>`, the 9 spread-locales override every key explicitly).
- Confirmed no key collisions first (only "app.name"/"app.shortName" existed; zero "ph.*" keys).
- Appended exactly 37 keys — app.settings … app.onlineWebsite (27) + ph.awaitingBadge … ph.checking (10) —
  at the END of EACH of the 11 locale objects, right before its closing brace (fa: before `} as const;`).
  No existing key reordered/modified; fa/en got blank-line section separators (their existing grouped style),
  the 9 compact locales got contiguous lines (their existing style). Double-quoted keys + trailing commas kept.
- fa values copied verbatim from the task including ZWNJ (فرم‌ها/نرم‌افزار/نشده‌اند/پیاده‌سازی/می‌شود/
  سرویس‌ها/پایگاه‌دادهٔ ×2 — audited: exactly 8 U+200C chars in the 10 new fa ph lines); en anchored as given;
  tr/ar/hi/ps/ckb/pt/ko/fr/zh translated natively (ps in proper Pashto ښ/ږ/ټ/ډ script, ckb in proper Sorani
  ۆ/ێ/ڕ script — e.g. ps «د لګښتونو حسابداري», ckb «پەیوەندی پارێزراوی خزمەتگوزارییەکان»), app titles kept ≤~4 words.
- Verification (key sync): bun -e audit — each of the 37 keys found exactly once inside EACH of the 11 locale
  bodies (11 × OK 37/37) and exactly 11 occurrences each in the whole file (407 total). AUDIT PASSED.
- Verification (tsc): `bunx tsc --noEmit` → NO errors in dictionaries.ts. Pre-existing UNRELATED errors noted,
  NOT touched per instructions: 16× TS2307 in skills/** («Cannot find module z-ai-web-dev-sdk») and
  src/components/erp/business-structure/bs-window.tsx(128,23) TS2345 (BsNode vs TreeFormNode mismatch).
- Verification (lint): `bun run lint` (eslint src --max-warnings=0) → exit 0, clean.
- git: only src/i18n/dictionaries.ts changed (+411 lines: 407 key-value lines + 4 blank separators; 0 deletions).

Stage Summary:
- All 11 locales (fa, en, tr, ar, hi, ps, ckb, pt, ko, fr, zh) now contain all 37 new keys with identical key
  names; existing keys untouched. tsc: no dictionary errors (unrelated pre-existing errors in skills/** and
  bs-window.tsx reported, not fixed). lint: clean. Only src/i18n/dictionaries.ts modified. Ready for the
  placeholder-window/desktop-icons consumer of these keys.

---
Task ID: 18
Agent: Z.ai Code (main orchestrator) + subagents 18-a (i18n) & 18-b (backend infra)
Task: Owner requested 27 desktop apps (numbering skips #13; تنظیمات included): desktop icons +
full microservice INFRASTRUCTURE only — NO forms/fields/business backend/DB per app until each
app's analysis document arrives. Secure inter-app APIs required. Shared-DB default with
dedicated-DB capability + cross-app integrity.

Work Log:
- Decisions (declared, §0.6): (D8) composite `apps-service` :3002 hosts all 26 new apps as
  catalog-driven modules — sandbox-resource-sane today, promotion path to standalone ports/DBs
  stays open because each catalog entry is self-describing; (D9) HMAC-SHA256 internal auth v1
  (canonical `${METHOD}:${PATH}:${TS}`, ±5min skew, guard global, @PublicInternal for health;
  body-hash deferred to v2 — loopback-only threat model); (D10) AppRegistry = platform metadata
  (string PK, D5 scope), boot-synced from the shared catalog, runtime dbMode/isEnabled flips win.
- 18-a (subagent): 37 i18n keys (27 app titles + 10 placeholder strings) × 11 locales; tsc+lint
  clean; ZWNJ fidelity audited.
- 18-b (subagent): `mini-services/_shared/{app-catalog,internal-auth,internal-http}.ts` +
  `mini-services/apps-service` (NestJS 11, :3002, no Prisma) with /health, /apps,
  /:appKey/{meta,health,integrations/status}; verified: unsigned 401, signed 200.
- 18-c: settings-service — AppRegistry model (PascalCase @map, PG-compatible), app-registry
  module + GET /app-registry (guarded), HealthController, global InternalAuthGuard, seed sync
  (27 rows), NODE_PATH+paths for _shared imports, .env INTERNAL_API_KEY, db:push, restart.
- 18-d: BFF — `src/lib/internal-sign.ts` + dynamic `/api/[app]/[...path]` proxy (settings→3001,
  else→3002) + signing retro-fitted into `/api/settings/[...path]`; root .env keys.
- 18-e: frontend — app-catalog mirror (27 descriptors + lucide glyph/gradient map), AppTile,
  app-registry store (DB-driven + offline fallback), desktop-store "app" window kind + appKey,
  desktop icon grid (28 icons, RTL column flow / mobile row wrap, dblclick-open + tap-open on
  coarse pointers, selection ring), AppPlaceholderWindow (hero tile, port/db chips, amber
  awaiting-analysis banner, live signed-mesh status card), start menu = all apps + search.
- Fixed during E2E: windows-layer div swallowed desktop clicks (pointer-events-none/auto fix);
  TruckCheck→Truck (lucide 0.474); t(titleKey) casts; a11y aria-pressed role fix; latent
  bs-window bug — save-and-new lost parent context (BsNode numeric id vs string-keyed Map;
  startCreate now normalizes both) — behavior-preserving fix of a real defect.
- E2E (Agent Browser): 28 icons rendered (DOM-verified RTL column-major order); حسابداری +
  انبار placeholder windows with «متصل (امضاشده) · 3-4ms» live mesh status; start menu 28 tiles
  + search (انبار→1); EN/LTR switch full pass; FA/RTL restored; mobile 390×844 row-wrap grid;
  BusinessStructure regression: tree loads, signed POST created ID=7 (code 01-01-03 per
  parent-driven rules) then DELETE 200; rule-violation POST correctly rejected; logs clean;
  bun run lint + bunx tsc clean.

Stage Summary:
- The 27-app mesh is live: desktop icons → placeholder windows (no forms per owner), BFF-signed
  gateway, HMAC-guarded services, DB-driven AppRegistry, shared↔dedicated DB contract (§4.4),
  integrity rules registered in AGENTS.md §4 (locked).
- Per-app analysis documents (سند تحلیل) are the gate for each app's forms/tables — per §4.6
  each future document must be logged in worklog before implementation.
---
Task ID: 19-a
Agent: i18n subagent
Task: Added 8 new i18n keys (ctx.* context-menu + taskbar.* pin-dock strings) to all 11 locales.

Work Log:
- Read worklog.md + AGENTS.md (§1.3 11-locale sync; §0.5 bans: no test code, no build) and followed the
  Task 18 editing precedent in dictionaries.ts (fa `as const` source of truth; en + 9 locales typed `Dict`).
- Collision check: zero pre-existing "ctx.*" keys; "taskbar.search" already existed but no name overlap
  with the 8 new keys.
- Appended exactly 8 keys (ctx.open / ctx.pinTaskbar / ctx.unpinTaskbar / ctx.resetLayout +
  taskbar.dropHint / taskbar.pinnedToast / taskbar.unpinnedToast / taskbar.alreadyPinned) at the END of
  EACH of the 11 locale objects, right before the closing brace (fa: before `} as const;`). No existing key
  reordered/modified. fa and en got blank-line section separators (their grouped style); the 9 compact
  locales got contiguous lines. Double-quoted keys + trailing commas kept.
- fa and en values copied verbatim from the task (audited: ZERO U+200C ZWNJ chars in the 8 new fa lines);
  tr/ar/hi/ps/ckb/pt/ko/fr/zh translated natively — tr/pt/ko/fr follow Windows 11 OS glossaries (Görev
  çubuğu / Fixar-Desafixar / 작업 표시줄 고정·고정 해제 / Épingler-Désépingler), ar uses شريط المهام +
  Windows-style إلغاء التثبيت, hi uses टास्कबार पर पिन करें / से अनपिन करें, ps uses proper Pashto script
  (ټاسکبار, پرېږدئ, ډیسکټاپ, انځونکی), ckb uses proper Sorani script (تەسکبار, چەسپاندن, ڕێکخستنەوەی,
  ئایکۆنەکە with ۆ/ێ/ڕ), zh uses Windows zh-CN 固定到任务栏 / 从任务栏取消固定. All kept short UI length.
- Verification (key sync): bun -e audit — each of the 8 keys appears exactly once inside EACH of the 11
  locale bodies (11 × OK 8/8) and exactly 11 times in the whole file (88 total). DICTS line intact.
  AUDIT PASSED.
- Verification (tsc): `bunx tsc --noEmit` → ZERO errors in src/i18n/dictionaries.ts. Only the 16
  pre-existing UNRELATED skills/** TS2307 errors remain (untouched, per instructions). No errors from
  concurrently-edited desktop files at check time.
- Verification (lint): `bun run lint` (eslint src --max-warnings=0) → exit 0, clean; no mentions of
  dictionaries.ts.
- git: only src/i18n/dictionaries.ts changed (+92 lines: 88 key-value lines + 4 blank separators;
  0 deletions).

Stage Summary:
- All 11 locales (fa, en, tr, ar, hi, ps, ckb, pt, ko, fr, zh) now contain the 8 new ctx.*/taskbar.* keys
  with identical key names; existing keys untouched. tsc: dictionary clean. lint: clean. Declared
  assumptions (§0.6): taskbar rendered by each locale's idiomatic OS term (fa keeps owner's «نوار پایین»);
  ps "پین کول" borrowed verb retained (no established native equivalent); ckb "چەسپاندن" for pin. Ready
  for the consumer of these keys (context menu + pin-to-taskbar toasts/drop hint).

---
Task ID: 19
Agent: Z.ai Code (main orchestrator) + subagent 19-a (i18n)
Task: Owner requested mouse-driven desktop icon rearrangement: (1) move any desktop icon
anywhere on the desktop, (2) drag icons to the dashboard footer (taskbar) and drop them,
(3) when the footer icon count grows, footer icon sizes must shrink intelligently.

Work Log:
- Declared assumptions (§0.6): «فوتر داشبورد» = the fixed bottom taskbar (DoD §7.7); drop on
  taskbar = PIN (Windows semantics — desktop icon stays; pin removable via right-click →
  برداشتن از نوار پایین); default pins preserved (business-structure + settings); free
  positioning enabled ≥640px viewports (mouse/pen/touch with 6px drag threshold), small
  screens keep the row-wrap flow (tap-to-open unchanged); dock reorder and drag-out-of-dock
  deferred; taskbar layout moved from absolutely-centered cluster to start|dock(flex-1)|tray
  so a large dock can never collide with the tray; layout persisted in localStorage
  (UI/platform state — consistent with §4.6 no business backend for these items).
- 19-a (subagent): 8 new i18n keys (ctx.open/pinTaskbar/unpinTaskbar/resetLayout +
  taskbar.dropHint/pinnedToast/unpinnedToast/alreadyPinned) × 11 locales; audit 11×OK 8/8;
  tsc + lint clean; ZWNJ-free fa verbatim.
- desktop-store: +iconPositions, +pinned (DEFAULT_PINNED), +dragOverTaskbar (transient),
  actions setIconPos/resetIconLayout/pinToTaskbar/unpinFromTaskbar/setDragOverTaskbar;
  persist middleware (name erp.desktop.layout, partialize layout-only, skipHydration +
  explicit rehydrate after mount → SSR-safe, no hydration mismatch).
- desktop.tsx: freeMode (matchMedia ≥640px) → absolute icons with inline left/top; default
  slots = column-major grid anchored to the start edge (dir-aware: right in RTL, left in
  LTR); window-level pointermove/up/cancel drag tracking (6px threshold → ghost overlay
  z-9600, original slot dimmed, click suppressed after real drags); pointer y ≥ taskbar.top−12
  → dragOverTaskbar (dock ring+tint, «رها کنید تا...» pill, ghost scales 0.62) → drop pins
  (toast) else commits clamped position; ResizeObserver keeps icons clamped on resize;
  context menu (FloatingMenu): open / pin–unpin / reset layout.
- taskbar.tsx: dock = store-driven pinned ids; smart sizing = clamp(floor((dockW−8−(n−1)·4)/n),
  22, 40) from ResizeObserver-measured dock width; tiles + glyphs + running indicators scale
  continuously (28 pins @1280px → 27px, no overflow; <sm scrollable floor 22px); mx-auto
  inner row (centered when small, never clips when overflowing); PinnedGlyph via additive
  AppTile style/iconStyle props; tile click toggles open/focus/minimize (kind+appKey aware);
  right-click dock tile → FloatingMenu unpin + toast.
- E2E (Agent Browser, real CDP mouse): 28 icons RTL column; drag حسابداری (1222,270)→
  (640,400) committed left/top 590/350 + ghost screenshot; drag دریافت‌وپرداخت onto taskbar →
  hint pill + dock highlight + ghost shrink captured, pins 2→3, localStorage
  {iconPositions.accounting, pinned[+receiptsPayment]}; bulk-pinned all 28 → every tile
  uniformly 40→27px (glyph 24px), dock 889/889 no overflow (screenshot); context-menu unpin
  28→27 (DOM+storage); reload → 27 pins + accounting position + 28px tiles restored;
  reset-layout → icons back to default grid, pins kept; dblclick still opens
  BusinessStructure window; dock tile click opens Settings; EN/LTR → dir=ltr, default grid
  re-anchors left (first icon 8px), dock intact; back to fa/RTL; mobile 390×844 → flow mode
  (no inline positions), dock scrollable 706>219 at 22px floor, tray clock visible
  (۰۴:۳۴, Persian digits); console/page errors ZERO; dev.log clean; bun run lint exit 0;
  bunx tsc --noEmit clean (only pre-existing skills/** errors).

Stage Summary:
- Desktop icons are now fully mouse-arrangeable (free positioning, persisted), drag-to-footer
  pins apps into a smart-sizing dashboard dock (40→22px continuous), unpin/reset available,
  everything persisted per-browser and SSR-safe. All 27-app behavior unchanged (placeholders
  per §4.6). Screenshots: /tmp/dnd-mid.png, /tmp/dnd-over-taskbar.png, /tmp/dnd-28pins.png,
  /tmp/dnd-after-reload.png, /tmp/dnd-en-ltr.png, /tmp/dnd-mobile.png.

---
Task ID: 20-a
Agent: i18n subagent
Task: Added 22 new i18n keys (abar.* form action-bar strings) to all 11 locales.

Work Log:
- Read worklog.md + AGENTS.md (§1.3 11-locale sync; §0.5 bans: no test code, no bun run build) and
  followed the Task 18/19 editing precedent in dictionaries.ts (fa `as const` source of truth; en +
  9 compact locales typed `Dict`, each ending at "taskbar.alreadyPinned" + closing brace).
- Collision check: zero pre-existing "abar.*" keys in the file.
- Appended exactly 22 keys (abar.reset / save / saveNew / saveClose / copy / delete / deleteNew /
  deleteClose / print / list / listEmpty / confirmDeleteTitle / confirmDeleteBody / demoTitle /
  demoNote / resetToast / savedToast / deletedToast / itemOpened / printToast / copyToast / toolbar)
  at the END of EACH of the 11 locale objects, right before the closing brace (fa: before
  `} as const;`). No existing key reordered/modified. fa and en got a blank-line section separator
  (their grouped style); the 9 compact locales got contiguous lines. Double-quoted keys + trailing
  commas kept. git: +244 lines (242 key-value lines + 2 blank separators), 0 deletions.
- fa and en values copied verbatim from the task. ZWNJ audit: exactly 3 U+200C in the 22 new fa
  lines, one each in ثبت‌شده (abar.list), پیش‌نمایش (abar.demoTitle), انتخاب‌شده (abar.itemOpened);
  §0.6 assumption: in abar.demoNote the words «دکمهها»/«می شود» were written ZWNJ-free (ه never
  joins forward so «دکمهها» renders identically; «می شود» spaced) because the task mandates
  exactly-3 ZWNJ across the new fa lines and enumerates only keys 10/14/19.
- Translated natively for tr/ar/hi/ps/ckb/pt/ko/fr/zh, aligned with the repo's existing glossary:
  tr (Kaydet/Sil/Yazdır, analiz belgesi, altyapı), ar (حفظ/حذف/طباعة, وثيقة التحليل, البنية
  التحتية, shadda/hamza kept), hi (सहेजें/हटाएँ, विश्लेषण दस्तावेज़, अवसंरचना + danda), ps proper
  Pashto script (خوندي کول, ړنګول, کړنه, تڼۍ, چاپګر, شننې سند, زیربنا, ښ/ږ/ټ/ډ), ckb proper Sorani
  (پاشەکەوتکردن, سڕینەوە, پەڕەی کردار, پێشبینین, ژێرخان, دوگمە with ۆ/ێ/ڕ), pt-BR (Salvar/Excluir/
  Imprimir, documento de análise), ko (양식/저장/삭제/인쇄, 분석 문서, 인프라, 작업 모음 per Android-ko
  "action bar"), fr (Enregistrer/Supprimer/Imprimer, document d'analyse, ASCII apostrophe matching
  file style, « ? » spacing). Question marks follow each block's existing convention (fa/ar/ps/ckb
  ؟, zh fullwidth ？, fr « ? », en/tr/hi ?). «ذخیره و جدید» rendered as save-then-clear-for-new
  (tr Kaydet ve yeni / ar حفظ وجديد / hi सहेजें और नया / ko 저장 후 새로 만들기 / zh 保存并新建 …).
- Verification (key sync): bun -e audit — each of the 22 keys appears exactly once inside EACH of
  the 11 locale bodies (11 × OK 22/22) and exactly 11 times in the whole file. AUDIT PASSED.
- Verification (ZWNJ): exactly 3 U+200C across the 22 new fa lines (lines 150/154/159); 0 ZWNJ in
  the other 9 locales' new lines. PASSED.
- Verification (tsc): `bunx tsc --noEmit` → ZERO errors in src/i18n/dictionaries.ts. Only the 16
  pre-existing unrelated skills/** TS2307 errors remain (not mine); no action-bar/app-placeholder-
  window errors present at check time.
- Verification (lint): `bun run lint` (eslint src --max-warnings=0) → exit 0, clean; zero mentions
  of dictionaries.ts.

Stage Summary:
- All 11 locales (fa, en, tr, ar, hi, ps, ckb, pt, ko, fr, zh) now contain the 22 new abar.* form
  action-bar keys with identical key names; existing keys untouched; key-sync + ZWNJ audits passed;
  tsc clean for dictionaries.ts; lint clean. Declared §0.6 assumption: fa demoNote written ZWNJ-free
  outside the three mandated words to honor the exactly-3 audit. Keys ready for the consumer
  (src/components/forms/action-bar/**, owned by the concurrent agent).

---
Task ID: 20
Agent: Z.ai Code (main orchestrator) + subagent 20-a (i18n)
Task: Owner provided the legacy form action-bar image and spec: build each of the 10 action
icons as a SEPARATE component, then compose them all in ONE new component. Right-to-left
order: 1 reset fields, 2 save, 3 save&new (save→reset), 4 save&close (save→close), 5 copy,
6 delete (+confirm), 7 delete&new (+confirm, delete→reset), 8 delete&close (+confirm,
delete→close), 9 print, 10 records-list dropdown (main fields per row; select → open in form).

Work Log:
- Declared assumptions (§0.6): icon tints follow the OWNER'S IMAGE (sky reset / emerald save
  family / violet copy / rose delete family / amber print / teal list) — treated as the
  explicit owner spec overriding the §0.5 accent-color ban for these buttons; action #1 uses
  the image's «+» glyph for reset; record navigation («» < >) and the form-specific combo
  («گروه کلاً خدمت») are NOT part of the 10-item spec → deferred to each app's analysis
  document; the composed bar renders DOM-order 1..10 (right-most = reset in RTL, natural
  mirror in LTR); demo mounted in AppPlaceholderWindow is infrastructure-only (sample list
  rows, no form fields) per §4.6.
- 20-a (subagent): 22 i18n keys (abar.*) × 11 locales; audit 11×OK 22/22; fa ZWNJ = exactly
  3 (ثبت‌شده / پیش‌نمایش / انتخاب‌شده); tsc + lint clean; worklog appended.
- New folder src/components/forms/action-bar/ (16 files): types.ts (FormAction,
  ActionBarListItem, ActionBarButtonProps); use-action-run.ts (single-flight busy runner,
  errors contained); action-icon-button.tsx (base: 36px gradient square, white glyph, hover
  tooltip, busy Loader2, corner +/× badge for the «و جدید»/«و بستن» family, aria-disabled
  guard so tooltips stay reachable); confirm-delete-dialog.tsx (Dialog + destructive confirm
  + working spinner — MANDATORY pre-delete confirmation per spec); ten standalone button
  components: ResetFieldsButton (1), SaveButton (2), SaveNewButton (3, +badge), SaveCloseButton
  (4, ×badge), CopyRecordButton (5), DeleteRecordButton (6), DeleteNewButton (7, +badge),
  DeleteCloseButton (8, ×badge) — each delete-family button embeds ConfirmDeleteDialog,
  PrintFormButton (9, window.print() default), RecordListDropdown (10: label header, loading
  state via common.loading, empty state, rows = title+subtitle, onOpenListItem);
  form-action-bar.tsx (composes all ten with dividers, role=toolbar, capability gates
  canSave/canCopy/canDelete/canPrint, and legacy composition: sequence() builds
  save→reset / save→close / delete→reset / delete→close when granular handlers are absent);
  index.ts barrel.
- app-placeholder-window.tsx: added «نوار عملیات فرم — پیش‌نمایش زیرساخت» card (max-w-lg)
  with demo note, current-record line (stands in for fields), and FormActionBar wired to
  sample data: save 600ms + toasts, delete/confirm + toasts, copy/print/reset toasts,
  list = 1001/1002/1003, item-open sets current, onClose closes the real placeholder window
  via desktop-store (true save&close / delete&close semantics).
- TS fixes during build: toast.success return type in expression-bodied callback (void
  wrap); DropdownMenuContent has no dir prop (removed — inherits document direction).
- E2E (Agent Browser): toolbar = 10 buttons in exact RTL order (visual, /tmp/abar-1);
  reset → toast «فیلدهای فرم بازنشانی شد»; save → busy spinner → «اطلاعات با موفقیت
  ذخیره شد» (/tmp/abar-2); list dropdown via REAL pointer events (Radix ignores synthetic
  click) → 3 rows → select 1002 → toast + current line "1002" (/tmp/abar-3); delete →
  dialog «تأیید حذف» + body + انصراف/تأیید (/tmp/abar-4) → confirm → «اطلاعات حذف شد» +
  current reset; save&close → save toast → window closed 1→0; save&new → saved + reset
  toasts + line "—"; delete&new → confirm → deleted + reset; delete&close → confirm →
  deleted + window closed 1→0; print/copy toasts ✓; EN/LTR: toolbar mirrors, hover tooltip
  "Save data" (/tmp/abar-5); mobile 390×844 (window reopened at 366px): toolbar wraps to
  2 RTL-ordered rows, wrapped=true (/tmp/abar-6); fa/RTL restored; console errors ZERO;
  page errors ZERO; dev.log clean after transient mid-edit HMR blips (fresh GET / 200);
  bun run lint exit 0; bunx tsc --noEmit clean (only pre-existing skills/** errors).

Stage Summary:
- The legacy 10-action form action bar exists as reusable infrastructure: 10 standalone
  icon-button components + ConfirmDeleteDialog + composer FormActionBar, fully i18n (11
  locales), RTL/LTR-correct, mobile-wrapping, with mandatory delete confirmations and
  legacy save/delete composition semantics. Ready to be wired into real forms as each
  app's سند تحلیل arrives (§4.6 gate; callbacks receive persistence responsibility).
- Screenshots: /tmp/abar-1-toolbar.png … /tmp/abar-6-mobile.png.

---
Task ID: 21
Agent: Z.ai Code (main)
Task: Owner request — in addition to the footer, add a HEADER at the top of the dashboard
that can be MOVED WITH THE MOUSE left/right along the top edge of the desktop; its height
must be 30% LESS than the footer height; beautiful / user-friendly / chic styling.

Work Log:
- §0.6 assumptions declared: footer = 52px → header height = calc(52px*0.7) = 36.4px
  (exact 30% reduction, verified ratio 0.700 in browser); "movable left/right at top" =
  free horizontal pointer-drag with top offset fixed (top-2), position persisted;
  ≥640px = floating capsule HUD (z-[9200], under StartMenu 9400/9500, over windows),
  <640px = static full-width bar (no drag, z-[90] under windows); header content is
  COMPLEMENTARY to the footer (no duplication): grip handle + brand (app.shortName +
  header.dashboard badge, teal→emerald tile) + functional search pill (opens Start menu)
  + full weekday date (footer already owns time/lang); default icon grid base moved to
  y=52 (GRID_TOP) so fresh layouts are never hidden behind the header — persisted user
  positions untouched (additive, no §0.5 conflict); accent colors teal/emerald + theme
  primary only (no indigo/blue).
- src/stores/desktop-store.ts: + headerX: number|null (null = centered default),
  + setHeaderX(x|null), initial null, partialize now persists headerX inside the
  existing "erp.desktop.layout" payload (skipHydration kept; old payloads merge safely).
- NEW src/components/desktop/desktop-header.tsx: <header data-desktop-header> acrylic
  capsule, h-[calc(52px*0.7)] rounded-full border shadow-lg; renders only AFTER
  useDesktop.persist.rehydrate() (no SSR flash / no persisted-position jump); menu-in
  entrance; pointer-level drag with 6px threshold + click-suppression (Task-19 pattern),
  live left update while dragging, clamped [8, vw−w−8], commit → setHeaderX; drag state
  adds ring-2/scale-1.02/cursor-grabbing; dblclick → recenter (headerX=null); context
  menu (FloatingMenu) → header.resetPos; grip button shows dragHint toast; date via
  hydration-safe useSyncExternalStore clock (same pattern as taskbar); wide/compact via
  matchMedia(640px); barW measured with offsetWidth (transform/animation-immune —
  getBoundingClientRect picked up the mid-animation scale of menu-in and mis-clamped
  by ~1.7px, fixed).
- desktop.tsx: mounted <DashboardHeader/> between DesktopIcons and windows layer;
  GRID_TOP=52 for defaultPos (rows recompute), flow-mode icons layer +pt-12 (mobile
  first row cleared the compact header: headerBottom 42.4 < firstIconTop 56).
- i18n (§1.3): 4 new keys header.dashboard / header.search / header.dragHint /
  header.resetPos × 11 locales (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh) inserted after each
  locale's taskbar.search; audit script: 11 locales × 4/4 keys, whole-file counts
  11,11,11,11; fa ZWNJ = 2 (جست‌وجو، جابه‌جایی — correct orthography).
- Verification (tsc): bunx tsc --noEmit → 0 new errors (only pre-existing skills/**).
- Verification (lint): bun run lint → exit 0.
- E2E (Agent Browser, 1280×800, fa/RTL): geometry headerH=36.4 taskbarH=52 ratio=0.700
  top=8 default-centered; REAL mouse drag right 409→609 (+200 exact) and left →259;
  localStorage erp.desktop.layout.state.headerX = 609/259 and SURVIVES reload (259);
  left-edge drag clamps to exactly 8; right-edge gap = 8.3px (subpixel offsetWidth
  rounding); dblclick → 409 + headerX null; right-click → FloatingMenu shows
  «بازنشانی موقعیت هدر» → click → recenter; search pill click → Start menu opens
  (real behavior); EN switch → dir=ltr, header mirrors (grip+brand left, date right),
  aria "Drag to move the header"/"Search the dashboard…", auto re-centers with new
  width; fa restored; mobile 390×844 → static full-width bar 374=vw−16 h=36.4, no
  drag, icons start at y=56 below header bottom 42.4; desktop icon dblclick still
  opens windows (win-shadow present) under the HUD; console errors 0; page errors 0;
  dev.log clean after edits (only 200s + Compiled lines).
- Screenshots: /tmp/hdr-1-dragged.png, /tmp/hdr-2-centered.png, /tmp/hdr-3-en.png,
  /tmp/hdr-4-mobile.png, /tmp/hdr-5-mobile-fixed.png, /tmp/hdr-6-final.png.

Stage Summary:
- The dashboard now has a floating, mouse-draggable (left/right) top header that is
  exactly 30% shorter than the taskbar footer (36.4px vs 52px), persists its position,
  recenters on double-click or via its context menu, complements (not duplicates) the
  footer tray, mirrors correctly in RTL/LTR, and degrades to a static full-width bar
  on mobile. All §7 DoD items pass; 27-app placeholder ecosystem untouched.

---
Task ID: 22
Agent: Z.ai Code (main)
Task: Owner re-spec of the Task-21 header: (1) the header must span the FULL page
(تمام صفحه) when horizontal; (2) "movable" means the user can DOCK it VERTICALLY on
the RIGHT or LEFT side of the desktop, or HORIZONTALLY at the TOP, by dragging with
the mouse (Windows-taskbar-like edge docking). Keep the 30%-less-than-footer height
contract and the chic styling.

Work Log:
- §0.6 assumptions declared: the owner message supersedes Task 21's free-x capsule →
  `headerX` replaced by `headerDock: "top" | "left" | "right"` (removal approved by
  owner redefinition; old persisted `headerX` key is silently ignored on merge);
  thickness in ALL docks = 52×0.7 = 36.4px (horizontal = bar height, vertical = strip
  width); vertical strip spans full height MINUS the 52px footer so the taskbar stays
  visible and non-overlapped (§7.7); dock target from pointer x (<30% → left, >70% →
  right, else top) with a LIVE preview strip + drop hint while dragging; dblclick or
  context menu → dock top (resetPos key removed as obsolete).
- src/stores/desktop-store.ts: + `HeaderDock` type, `headerDock` (init "top"),
  `setHeaderDock`, partialize persists headerDock (Task-19/22 comment updated).
- dashboard-header.tsx REWRITTEN: docked bar is `fixed` flush to the docked edge —
  top: {top:0,left:0,right:0,h:36.4} FULL page width with bottom hairline;
  left/right: {top:0,bottom:52,w:36.4} full-height strip with inner hairline
  (border-r / border-l); while dragging the docked bar hides (opacity-0) and a ghost
  (z-9600, rounded-xl, ring-primary, Task-19 pattern) follows the pointer while a
  preview strip (z-9150, bg-primary/12 ring-inset + «رها کنید تا هدر اینجا مستقر
  شود» pill) shows the target edge; release commits headerDock; `key={dock}` replays
  the menu-in entrance on re-dock; vertical content = GripHorizontal + brand tile +
  divider + icon-search (opens Start menu) + flex spacer + VERTICAL date
  (writing-mode: vertical-rl); horizontal content = grip + tile + app.shortName +
  dashboard badge + divider + search pill + spacer + full weekday date (compact
  under 640px: icon search, no badge, short date); click-suppression + context menu
  (header.dockTop/dockLeft/dockRight with PanelTop/PanelLeft/PanelRight icons).
- desktop.tsx: HEADER_THICK=36.4 const; windows layer inset clipped per dock
  (top→top:36.4, left→left:36.4, right→right:36.4, bottom:52 always) so maximized
  windows (`inset:0` inside the layer) respect the header strip; desktop-icons layer
  insets per dock (docked side gets 36.4+8); GRID_TOP reverted to GRID_PAD (layer
  already clears the header now); flow-mode pt-12 removed (same reason); Task-19
  icon drag/drop logic untouched.
- i18n (§1.3): removed header.resetPos; added header.dockTop / header.dockLeft /
  header.dockRight / header.dropHint × 11 locales (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh);
  audit: 11 × 7/7 header.* keys, whole-file counts 11 each, resetPos gone.
- Verification: bunx tsc --noEmit → 0 new errors; bun run lint → exit 0.
- E2E (Agent Browser): top dock = full width 0→1280, top:0, h:36.4, ratio 0.7/52;
  REAL drag to left edge → preview strip appeared (36.4×747.4 + dropHint text) →
  release → dock=left persisted (strip left:0, w:36.4, h:748 = vh−52) + screenshot;
  window opened starts at x≥36 (clipped, no under-lap); drag to right edge →
  dock=right (right:1280, w:36.4, h:748) persisted; drag to middle → back to top
  full width; context menu shows the 3 dock entries (EN: "Dock at the top/left/
  right"); dblclick → top; reload → dock survives (left, w:36.4 at left:0); vertical
  search icon opens Start menu; icons layer top dock: first row 52.4 ≥ header bottom
  36.4; EN → dir=ltr, "Drag to move the header"/"Search the dashboard…"; fa
  restored; mobile 390×844: top = full-width 390×36.4, drag → vertical left strip
  36.4×792 = vh−52, icons flow beside it (screenshot); console errors 0, page
  errors 0, dev.log clean; lint exit 0.
  Note: two transient E2E obstacles were TEST-HARNESS issues, not app bugs: (1) the
  Start menu stayed open across viewport switches (its overlay closes on real click
  only — pre-existing behavior), intercepting one drag; (2) measuring the header
  rect mid `menu-in` scale animation returned the animated size.
- Screenshots: /tmp/dock-1-left.png (vertical left, desktop), /tmp/dock-2-top.png,
  /tmp/dock-3-mobile-left.png, /tmp/dock-5-mobile-left.png (vertical left, mobile),
  /tmp/dock-6-final.png (full-width top, fa/RTL).

Stage Summary:
- The dashboard header is now a full-page dockable bar: horizontal full-width at the
  top (36.4px = 30% less than the 52px footer) or vertical full-height (36.4px wide)
  on the left/right edge, movable by mouse-drag with a live edge-preview + drop hint,
  persisted, re-dockable via double-click or its context menu, fully i18n (11
  locales), RTL/LTR-correct, and mobile-safe. Windows, desktop icons and the footer
  all reflow around the docked strip. All §7 DoD items pass.

---
Task ID: 23
Agent: Z.ai Code (main)
Task: Owner request — all desktop items are our MAIN software (more may be added later);
keep ALL software in a `Systems` table whose legacy schema is Gnr; create the table and
seed it with every software whose service exists on the desktop; EVERY table (all current
and future) must carry a `Version` column that changes on each modification so changes
are detectable.

Work Log:
- §0.6 assumptions declared: SQLite has no schema catalog → per repo convention the
  physical table is `Systems` (PascalCase @@map) inside the Gnr-domain service, documented
  as legacy "Gnr"."Systems" (will live in schema Gnr on PostgreSQL/SQL Server migration,
  §2.3 — no quoted-dot names); "software on the desktop" = the 27 APP_CATALOG entries
  (§4.1 single source); PK = manual BigInt via IdGenerationService (§2.4, no autoincrement);
  read-only GET API only (no mutation API/CRUD UI requested yet, §4.6 spirit); no frontend
  change → §1.3 not triggered.
- prisma/schema.prisma: NEW `model Systems` @@map("Systems") — ID BigInt manual PK, Code
  unique, TitleFa, TitleKey? (i18n dict key; null for future non-catalog software),
  IconKey, AppGroup, SortOrder, IsActive (default true), Version, CreatedAt, UpdatedAt.
  Added `version Int @default(1) @map("Version")` to ALL 5 existing tables: IDGeneration,
  Setting, BusinessStructureUser, AppRegistry (BusinessStructure already had it) —
  6/6 tables now Version-carrying. bun run db:push → in sync + client regenerated.
- prisma.service.ts REWRITTEN (Prisma 6.19 removed the classic `$use` → boot died with
  "this.$use is not a function"): PrismaService remains the DI token/type (extends
  PrismaClient) but the instance is factory-built = base.$extends(query.$allModels.
  $allOperations) wrapped in a pass-through Proxy (Nest lifecycle hooks from closure,
  Reflect receiver bound to the extended client). The extension bumps Version (+1) on
  update/updateMany and on upsert with NON-EMPTY update payload (idempotent `update: {}`
  seeds never churn); explicit caller-set version wins (escape hatch); manual
  `version:{increment:1}` REMOVED from business-structure.service.ts (root-tx and
  non-root paths — double-bump guard).
- FIRST middleware attempt used a DMMF gate (Prisma.dmmf.datamodelMap[model]) — silently
  inert: `Prisma.dmmf.datamodelMap` is UNDEFINED in Prisma 6.19 (DMMF shape changed);
  proven by a matrix experiment (direct/tx × update/upsert all dead). Replaced with an
  explicit dictionary-driven VERSIONED_MODELS registry (TABLE_REGISTRY philosophy §2.4):
  {IDGeneration, Setting, BusinessStructure, BusinessStructureUser, AppRegistry, Systems};
  boot log prints the active set. Matrix experiment after the fix (tmp script, deleted):
  direct update 1→2, tx update 2→3, direct upsert 3→4, tx upsert 4→5, EMPTY upsert 5→5
  (no churn), both proxy styles +1 — full pass; probe rows deleted.
- table-registry.ts: + TableKey "Systems" {canonical: "Systems", pk: "ID"}.
- NEW src/systems/ (module/service/controller): boot-sync idempotent from APP_CATALOG —
  missing rows created through IdGenerationService.generateNextId("Systems") (ids came
  out 1..27 in catalog order), catalog-driven fields updated ONLY on real drift
  (Version must reflect genuine change), IsActive never overwritten (§4.5 philosophy);
  GET /systems (list, SortOrder asc) + GET /systems/:code, guarded by the global
  InternalAuthGuard (browser path /api/settings/systems via the signed BFF).
- app-registry.service.ts: boot-sync now drift-guarded (reads all rows, upserts with
  update:{} when identical) — prevents Version/UpdatedAt churn on every restart;
  runtime flips (dbMode/isEnabled) still win (§4.5). Log: "AppRegistry synced (27 apps,
  0 changed)".
- AGENTS.md: §2.5 (Version column mandatory in EVERY table + global auto-bump
  middleware + no manual increments + no-op syncs must not bump) and §2.6 (legacy
  schema recorded via comment; Gnr-domain tables = PascalCase @@map in settings-service;
  Systems master-registry contract) — appended, marked (الحاق Task 23).
- Ops note: background processes spawned by tool calls are reaped at call end — the
  double-fork orphan pattern `(setsid … &)` is REQUIRED for services to survive
  (settings-service AND apps-service restarted this way; both listening 3001/3002).
- Verification: lint exit 0; settings-service tsc --noEmit clean (after narrowing the
  extension args union type); dev.log clean (only 200s; the 6 historical
  "Unterminated regexp" overlay entries at app-placeholder-window.tsx:215 are stale
  noise from the transient 502 window during restarts — a fresh reload produces none);
  version-bump proof through the REAL signed BFF path: PUT business-structure/2 ×2 →
  Version 1→2→3 (exactly +1, no double-bump), root PUT → BusinessStructure 3→4 AND both
  Setting rows 1→2 inside the same tx; DB probe: Systems 27 rows min/max Version=1,
  IDGeneration counters intact. E2E (Agent Browser): desktop renders (header 36.39px
  dock, taskbar, 27 icon buttons incl. ساختار کسب‌وکار), double-click حسابداری opens the
  placeholder window with ActionBar + GREEN settings-service status (15ms);
  in-browser fetch /api/settings/systems → {count:27, versions:"1", first:"settings",
  last:"onlineWebsite"}; EN switch → dir=ltr ("Pinned"), FA restored → rtl; mobile
  390×844 layout intact; console errors 0; page errors 0.
- Screenshots: download/task23-desktop.png, task23-window-open.png, task23-en.png,
  task23-mobile.png, task23-final.png.

Stage Summary:
- Gnr.Systems (legacy "Gnr"."Systems") now exists as the master registry of ALL ERP
  software: 27 rows seeded from APP_CATALOG through IdGenerationService (manual BigInt
  PKs 1..27), unique Code, i18n TitleKey, SortOrder, IsActive, plus the read API
  /api/settings/systems. EVERY table in the DB carries a Version column and a single
  global $extends middleware bumps it +1 on every real write (tx-safe, no seed churn,
  no manual increments) — future tables comply by adding one registry entry (§2.5).
  Owner-visible behavior unchanged (desktop/27 placeholders intact). All §7 DoD items
  pass.

---
Task ID: 24
Agent: Z.ai Code (main)
Task: Owner request (sample screenshot of the legacy «فرم اصلی») — build the main
form as a chic / attractive / user-friendly reusable component named
SimpleFormTwoRowTabbed under src/components/forms; the tabs that may exist below
the form header must be OPTIONAL; place the Task-20 action-bar icons into the
component.

Work Log:
- §0.1: AGENTS.md re-read (v2 incl. §2.5/§2.6 from Task 23) + worklog tail read —
  Tasks 22 (docked header) and 23 (Systems/Version) were already DONE, so the only
  open request was this component (registered as Task 24).
- §0.6 assumptions declared: (1) «TwoRow» = the canonical two-row field grid — the
  component renders fields in a responsive 1/2/3-column grid, so any count flows
  naturally (2 rows × 3 cols is the default shape; the 5-row sample still fits);
  (2) fields are CONTROLLED (value/checked + onFieldChange) — the caller owns
  record state, the component owns detail-grid rows internally (initialized once
  from tab.rows, mirrored out via onTabRowsChange); (3) the sample screenshot's
  BLUE chrome is translated to the project's teal→emerald palette (§0.5 forbids
  blue accents); (4) demo hosting = NEW static window kind "form-demo" + one
  desktop icon «نمونه فرم» inserted after business-structure — purely ADDITIVE,
  the 27 catalog placeholders and their §4.6 contract are untouched, and the
  Systems catalog (Task 23) is unaffected (frontend-only icon);
  (5) header controls (help / maximize / close) are optional — rendered only when
  their handler is provided.
- NEW src/components/forms/simple-form-two-row-tabbed.tsx (~470 lines): four-zone
  shell — (1) gradient form header h-11 (teal-600→emerald-600, white text, icon
  tile, title + optional badge pill, optional ?/maximize/× controls); (2) action
  strip = the REAL Task-20 FormActionBar (all 10 standalone icon buttons with
  their tints/busy spinners/confirm-delete dialog + list dropdown, full prop
  pass-through incl. legacy save/delete composition via onClose) + OPTIONAL
  record-nav cluster (|< < > >|, ChevronFirst/Left/Right/Last, container
  rtl:-scale-x-100 for logical mirroring, ms-auto → end side); (3) scrollable body
  (scrollbar-slim): field grid (labels start-side with colon + rose asterisk,
  h-8 controls; types text/number(dec inputMode)/select(Radix)/lookup(input +
  teal [+]/checkbox(justify-end legacy «فعال» placement); suffixChip badge e.g.
  «بدهکار») + OPTIONAL Tabs section (shadcn Tabs, active trigger = primary,
  per-tab table: sticky thead with required asterisks, min-w-max + overflow-auto
  max-h-64, inline cell inputs, row click = selection, empty state = Inbox icon +
  sft.noData «اطلاعاتی وجود ندارد») — tabs absent ⇒ section absent entirely;
  (4) OPTIONAL footer strip (only when tabs exist): + add / × remove-selected /
  ⧉ copy-selected / | save (only when onSaveRows) — amber/rose/teal/emerald,
  remove+copy disabled until a row in the ACTIVE tab is selected.
- NEW src/components/erp/form-demo-window.tsx: «مشتری جدید» sample — 3 sample
  records (1001..1003) driving the record-nav and the list dropdown, 8 fields
  (کد readonly, نوع مشتری select عادی/ویژه, عنوان, گروه مشتری lookup+,
  مانده حساب number + بدهکار chip, وضعیت فرم select مستقیم/غیرمستقیم, اثر lookup+
  ریال ایران, فعال checkbox), 2 OPTIONAL tabs (آدرس‌ها ×4 cols, تماس‌ها ×3 cols)
  starting empty like the screenshot; action handlers = Task-20 semantics
  (save busy+toast, delete→confirm→reset+toast, save&close/delete&close close the
  REAL window via desktop-store, list item → applyRecord, reset re-applies the
  current record, help → abar.demoNote info toast).
- desktop-store.ts: WindowKind += "form-demo". desktop.tsx: STATIC_WINDOWS +
  form-demo entry (teal tile + FilePlus2, titleKey fdf.iconLabel), DesktopIcons
  items + form-demo after business-structure, iconGlyph + teal gradient glyph.
- i18n (§1.3): 37 new keys × 11 locales (sft.* ×10: noData/addRow/removeRow/
  copyRows/first/prev/next/last/help/selectPlaceholder; fdf.* ×27 demo strings),
  inserted after each locale's abar.toolbar; audit script: 11 × (10 sft + 27 fdf)
  exact.
- TS fix: sonner toast.success returns string|number → void-wrapped in
  expression-bodied FormAction callbacks (same as Task 20 note).
- Verification: bunx tsc --noEmit → 0 new errors; bun run lint → exit 0.
- E2E (Agent Browser 1280×800, fa/RTL): desktop shows «نمونه فرم» icon (2nd slot,
  additive); dblclick opens the window — region «مشتری جدید» + badge «نمونه»,
  help/× header, all 10 action buttons in legacy order, nav ×4, کد=1001,
  نوع مشتری=عادی, عنوان=مشتری نمونه 1, مانده=0+بدهکار chip, وضعیت=مستقیم,
  اثر=ریال ایران, فعال=checked, tabs آدرس‌ها/تماس‌ها, empty state, footer ×/⧉
  correctly DISABLED; next→1002/مشتری نمونه 2, last→1003+فعال unchecked,
  first→1001; + adds a row (remove/copy enable), 4 cells filled, ⧉ → 2 rows,
  × → 1 row; tab switch تماس‌ها → own empty state, back → row PRESERVED;
  footer 💾 → toast «اطلاعات با موفقیت ذخیره شد»; action-bar save → busy →
  toast; delete → dialog «تأیید حذف» → تأیید → record reset 1001 + toast; list
  dropdown → 3 items → 1002 opens record 1002; reset toast; help info toast;
  header × AND «ذخیره و بستن» each close the real window (count 0); EN/LTR →
  dir=ltr, header title left / controls right, action bar left / nav right,
  labels left of inputs, footer actions right — full logical mirror, labels
  measured h=16 (nowrap intact); fa restored; mobile 390×844 fresh mount →
  366px window, single-column fields, action bar wraps RTL-ordered, tabs/grid/
  footer usable; console errors ZERO; page errors ZERO; dev.log clean (200s +
  Compiled only).
- Screenshots: /tmp/sft-1-initial-fa.png … sft-3-rowsaved-toast, sft-4-save-busy,
  sft-5-list-opened, sft-6-toasts, sft-7-en-ltr, sft-8-en-form, sft-9/10-mobile,
  sft-11-final-fa.png.

Stage Summary:
- The legacy main-form shell now exists as the reusable SimpleFormTwoRowTabbed
  component: gradient header + the REAL 10-icon Task-20 action bar + record
  navigation + two-row field grid + OPTIONAL tabbed detail grids with selection,
  add/remove/copy/save row actions and an empty state — fully i18n (11 locales),
  RTL/LTR-correct, mobile-safe, with a live «مشتری جدید» sample window on the
  desktop (additive; 27 placeholders + Systems catalog untouched). Future سند
  تحلیل forms can adopt it by passing fields/tabs + persistence handlers.
  All §7 DoD items pass.
---
Task ID: 25
Agent: Z.ai Code (main)
Task: «هوک useAlignedLabels را پیاده سازی کنید» — automatic per-row label
  alignment for generated forms (user's consulting follow-up: fields in each
  form row must align with the row's widest label; inputs must be uniform).

Work Log:
- §0.1: re-read AGENTS.md (v2) + worklog tail; clauses declared: §0.5 (no
  build/no test code/no indigo-blue/no feature removal — FieldCell markup
  change is additive, props untouched per §5.1), §0.6 assumptions declared,
  §1.4 logical classes, §1.3 no new strings ⇒ dictionaries untouched,
  §6/§7 DoD.
- §0.6 assumptions: (1) hook colocated at src/components/forms/use-aligned-labels.ts
  (use-action-run.ts precedent); (2) default scope = "row" (user's literal ask
  «هر ردیف با بزرگ‌ترین برچسب همان ردیف»), optional scope = "container";
  (3) integration target = the field grid of SimpleFormTwoRowTabbed so every
  generated form inherits alignment for free (tree-form/business-structure
  intentionally untouched — §5.4 TreeForm-domain exception, can adopt later);
  (4) checkbox «فعال» excluded (end-of-row toggle, no label column); (5) the
  required-asterisk slot now ALWAYS occupies width (invisible when not
  required) so [text][colon][*] tail is uniform and inputs share one start
  edge; (6) no i18n changes needed.
- NEW src/components/forms/use-aligned-labels.ts: measures natural width of
  every [data-form-label-text] (offsetWidth — transform-immune, Task 21
  lesson), groups them per visual row by rounded getBoundingClientRect().top
  («row») or one global max («container»), publishes max as CSS var
  --label-w on each row's [data-form-cell] (or the container). Measured
  element is NEVER width-constrained ⇒ no RO feedback loop, no stale locked
  width after locale switches. ResizeObserver (labels + container) covers
  font load / fa↔en / zoom / responsive reflow; MutationObserver (childList,
  subtree) covers fields added/removed after mount; observed-set tracked in a
  WeakSet so late labels get observed inside update(). useIsomorphicLayoutEffect
  ⇒ aligns before first client paint, zero SSR warnings. Graceful no-op when
  ResizeObserver unavailable. Options: {scope, selector, cellSelector}.
- simple-form-two-row-tabbed.tsx: fieldsGridRef + useAlignedLabels(fieldsGridRef)
  on the field grid (default "row" scope); FieldCell root gains data-form-cell;
  label rebuilt as [text-box w-[var(--label-w,auto)] text-end → inner
  data-form-label-text inline-block nowrap][colon][asterisk slot always
  rendered, rose + visible when required / invisible otherwise] — text-end
  keeps glyphs glued to the colon in BOTH directions; docblock updated (Task 25).
- Verification: bun run lint → exit 0 (--max-warnings=0); bunx tsc --noEmit →
  0 src/ errors (one fix during dev: closest<HTMLElement> generic for .style;
  skills/* TS2307 are pre-existing, out of scope).
- E2E (Agent Browser): 1280×800 fa/RTL fresh → open «نمونه فرم» →
  data-form-cell rows [3,3,1] (checkbox excluded as designed), per-row
  labelVars 57/65/13 px («نوع مشتری» / «گروه مشتری» / «اثر» maxima — PER-ROW
  scope proven: 57 ≠ 65), start-indent per cell [79,79,79] and [87,87,87] ⇒
  maxDelta 0px; colons visually aligned. EN via Language menu → dir=ltr, vars
  auto-recomputed 89/97/35 px, indents [111,111,111]/[119,119,119] delta 0 ⇒
  RO locale re-measure proven; restored fa (rtl / «مشتری جدید»). Mobile
  390×844 fresh mount → 366px window, 7 single-cell rows delta 0, horizontal
  overflow 0. Tablet 760px (sm:grid-cols-2 reflow) → rows regrouped
  [2,2,2,1] with NEW maxima 57/65/63/13, delta 0 ⇒ responsive re-group
  proven. Console errors ZERO; page errors ZERO; dev.log only 200s+Compiled.
  Screenshots: /tmp/ual-1-fa-rtl.png, ual-2-en-ltr.png, ual-3-mobile-fa.png,
  ual-4-final-fa-1280.png.
- Known edge (pre-existing, out of scope): grid breakpoints are viewport-based
  (sm/lg) while the window can be narrower than the viewport (e.g. window
  sized on mobile then viewport enlarged without reload) ⇒ 3 columns in a
  366px window squeeze inputs; alignment still holds (delta 0). Future
  improvement: container queries for the field grid.

Stage Summary:
- All forms rendered through SimpleFormTwoRowTabbed now get AUTOMATIC per-row
  label alignment (each row aligns to its own widest label; inputs uniform)
  with zero configuration and zero per-form code — the exact UX the owner
  asked in consulting. The hook is generic (data-attributes contract) and can
  be adopted by tree-form or future DB-driven form renderers by adding
  data-form-cell + data-form-label-text and one hook call. 11 locales
  untouched (no new strings), all §7 DoD items pass.
---
Task ID: 25.1
Agent: Z.ai Code (main)
Task: Owner feedback on Task 25 screenshot — «فیلد اثر الان همتراز با فیلدهای
  ورودی بالای خودش نیست». The per-row scope aligned labels within each row,
  but the «اثر» input (short label, 13px) did not form a vertical line with
  the inputs above it in the same grid column («گروه مشتری» 65px / «کد» 57px).
  Owner's real expectation: column-continuous vertical alignment.

Work Log:
- §0.1/§0.6: constitution + worklog re-read; interpretation declared: owner
  wants straight vertical input columns ⇒ container scope (already built into
  the Task-25 hook as the optional mode). §0.5 respected (additive only,
  no removals); §5.1: new prop is additive/backward-compatible.
- simple-form-two-row-tabbed.tsx: hook call switched to
  useAlignedLabels(fieldsGridRef, { scope: labelScope }); NEW additive prop
  labelScope?: AlignedLabelsScope (default "container" = one shared label
  width ⇒ vertical columns; "row" opt-in preserved for per-row alignment);
  FieldCell comment + component docblock updated. NOTE: first MultiEdit was
  non-atomic (edits 1-2 applied, 3+ failed on a JSX-comment brace mismatch);
  detected via grep and completed in a second pass — final file verified.
- Verification: bun run lint → exit 0; bunx tsc --noEmit → 0 src/ errors.
- E2E (Agent Browser 1280×800, fresh fa/RTL): uniqueLabelVars = ["65px"]
  (ONE width form-wide = «گروه مشتری»), ALL cell indents 87px
  (allIndentDelta = 0), column continuity: rightmost column
  [کد، گروه مشتری، اثر] = 3 controls, maxDelta 0px — the exact reported
  defect is gone; middle/left columns [2 controls] delta 0. EN/LTR via
  Language menu: vars = ["97px"], delta 0 (auto re-measure). fa restored.
  Mobile 390×844 fresh mount: vars ["65px"], delta 0, horizontal overflow 0.
  Console errors ZERO; page errors ZERO; dev.log clean (200s + Compiled).
  Screenshots: /tmp/ual-5-container-fa.png, ual-6-container-mobile.png.

Stage Summary:
- useAlignedLabels confirmed ACTIVE in the sample form through
  SimpleFormTwoRowTabbed; default alignment is now column-continuous
  (container scope): every input of the form starts on one shared edge inside
  its cell and the edges stack into straight vertical columns — the classic
  legacy ERP grid the owner expects. labelScope="row" remains available per
  form via the new additive prop. All §7 DoD items pass.
---
Task ID: 26
Agent: Z.ai Code (main)
Task: Owner requirement — if the dashboard language is an RTL locale the
  forms/fields/tabs must lay out right-to-left; if LTR, left-to-right.
  (Direction conformance audit + fixes for SimpleFormTwoRowTabbed & desktop.)

Work Log:
- §0.1: AGENTS.md + worklog re-read; §1.4 (logical classes only, direction
  from DIR_BY_LOCALE), §0.5 additive-only, §0.6 assumptions declared, §1.3
  no new strings, §6/§7 DoD.
- Audit: grep for non-logical directional classes across src/components/forms/
  + form-demo-window → only ONE hit (form-header gradient bg-gradient-to-l).
  Direction propagation already correct: i18n/config DIR_BY_LOCALE →
  settings-store dir() → desktop.tsx sets documentElement.dir/lang.
- FINDING 1 (root cause of RTL violations): Radix primitives (Tabs/Select/
  DropdownMenu/Dialog) default dir="ltr" without a DirectionProvider —
  measured: role=tablist had dir="ltr" attribute while <html dir="rtl">;
  conformance eval showed tabOrder=false, thOrder=false (tabs and the table
  inside TabsContent rendered LTR inside an RTL page).
  FIX: desktop.tsx now wraps the whole desktop tree in
  <DirectionProvider dir={dir}> (reactive — same dir() selector that drives
  documentElement). @radix-ui/react-direction added as an EXPLICIT dependency
  (bun add; previously transitive). This fixes Tabs order, table direction
  inside TabsContent, Select/Dropdown/Dialog RTL semantics app-wide.
- FINDING 2: record-nav group had rtl:-scale-x-100 on the GROUP — in RTL that
  pushes «اولین» (First) to the group's LEFT edge (wrong reading order) while
  mirroring glyphs. FIX: flip moved to EACH NavButton (rtl:-scale-x-100 on the
  button) — RTL flex already puts First at the reading start (right edge) and
  per-button mirroring shows correctly-flipped glyphs: RTL visual left→right
  = [Last|<][Next<][Prev>][First>|]. LTR unchanged/standard.
- FINDING 3: form-header gradient hardcoded to-left. FIX:
  rtl:bg-gradient-to-l ltr:bg-gradient-to-r — emerald end sits on the inline
  END side in both directions (mirrored, §1.4).
- Edit mishap fixed en route: a JSX comment placed inside `{hasNav && ( … )}`
  produced a transient syntax error (caught by dev overlay; dev.log line
  ~1886) — comment moved outside; lint/tsc clean. MultiEdit non-atomicity
  noted again (partial application detected via grep, completed in follow-up).
- Verification: bun run lint → exit 0; bunx tsc --noEmit → 0 src/ errors.
- E2E (Agent Browser 1280×800, fresh loads): conformance eval —
  fa/RTL: firstFieldAtStart=true (کد rightmost), labelAtStartSide=true (label
  right of input), indentDelta=0 (Task 25.1 intact), tabOrder=true (آدرس‌ها
  rightmost), thOrder=true (آدرس کامل column rightmost),
  nav.firstAtGroupStart=true, nav.groupAtEndHalf=true (nav at strip end),
  hdrControlsAtEnd=true (help/close at left). en/LTR: ALL the same trues with
  mirrored semantics (Code leftmost, labels left, Addresses leftmost, first
  column leftmost, nav First at left, group at right half). Select dropdown
  sanity in EN (Normal/Special options render). Console: stale HMR error
  eliminated by console --clear + fresh reload → ZERO console errors, ZERO
  page errors; dev.log 200s + Compiled only. fa restored at session end.
  Screenshots: /tmp/dir-1-en-ltr.png (full LTR mirror), /tmp/dir-2-fa-rtl.png,
  /tmp/dir-3-fa-rtl-final.png (tabs right, table mirrored, nav mirrored,
  Select value-right/chevron-left).

Stage Summary:
- Form direction now FOLLOWS the dashboard locale end-to-end: field grid
  order, label side, colon alignment, tab order, tab-grid column order,
  record nav (correct RTL transport semantics), header/aux controls, selects
  and all Radix primitives reactively mirror with dir — RTL locales
  (fa/ar/ps/ckb) right-to-left, the other seven left-to-right. Root fix is
  the Radix DirectionProvider at the desktop root + per-button nav flip +
  mirrored header gradient. All §7 DoD items pass.
---
Task ID: 27
Agent: Z.ai Code (main)
Task: Owner request — «ارتفاع فیلدها را در فرم نمونه فرم و کامپوننت های
  مربوطه ۳۰درصد کاهش دهید و چیدمان فیلدها هم از پایین و بالا پدینگ و مارجین
  آنها کاهش پیدا کند و به هم نزدیک تر باشند تا فضای بیشتری به قسمت تب ها و
  فوتر فرم اختصاص پیدا کند» (compact vertical metrics for
  SimpleFormTwoRowTabbed + its field components).

Work Log:
- §0.1: AGENTS.md + worklog re-read (Tasks 24/25/25.1/26 context). §0.5
  respected (no removals, no build, no tests, no indigo/blue); §5.1: pure
  style-class edits, public API/props unchanged; §1.3: zero new strings —
  11 dictionaries untouched; §6/§7 DoD.
- §0.6 declared assumptions: «فیلدها» = the field-grid inputs/lookup
  trigger/suffix chip + the tab-grid cell inputs; 30% mapped to the Tailwind
  scale as h-8 32px→h-5.5 22px (−31.25%) and h-7 28px→h-5 20px (−28.6%);
  vertical tightening limited to the field grid's own paddings/gaps — the
  form header (h-11), action strip and footer (h-10) are deliberately
  UNCHANGED because the owner wants them to GAIN space.
- BEFORE metrics (agent-browser, fa/RTL, 1280×800): field input 32px, tab
  cell input 28px (row 37px), grid row-gap 14px, body pt/pb 16/12px, tabs
  section pt/pb 12/16px, TabsContent mt 10px, field-grid block 124px.
- Edits (all in simple-form-two-row-tabbed.tsx): inputBase h-8→h-5.5;
  lookup + button h-8 w-8→h-5.5 w-5.5 (icon h-4→h-3.5); suffix chip h-5→h-4
  (end-1.5→end-1); grid gap-y-3.5→gap-y-2; body wrapper px-4 pb-3 pt-4 →
  px-4 pb-2 pt-2.5; tabs wrapper px-4 pb-4 pt-3 → px-4 pb-2.5 pt-2;
  TabsContent mt-2.5→mt-2; tab th py-2→py-1.5; tab td py-1→py-0.5; tab cell
  input h-7→h-5. Horizontal metrics (gap-x, --label-w contract, pe-16 chip
  reserve) untouched — useAlignedLabels unaffected.
- Verification: bun run lint → exit 0; bunx tsc --noEmit → 0 src/ errors.
- E2E (Agent Browser): fa/RTL AFTER — field 22px, tab input 20px (row 25px),
  gap 8px, body pt/pb 10/8, tabs pt/pb 8/10, TabsContent mt 8, field-grid
  block 124→82px (−34%); action strip 55px & footer 40px unchanged ⇒ they
  gain the freed space. Task 25.1 regression: labelVars ["65px"] (single
  shared width), start-indent delta 0 — column alignment intact. en/LTR
  (via Language menu): identical values, indentDelta 0. Mobile 390×844 (fa):
  single column, gridH 226, horizontal overflow 0. Console errors ZERO;
  page errors ZERO; dev.log 200s + Compiled only (the stale useT/parse
  errors near log lines 1921–1962 are pre-HMR artifacts from a previous
  session — current GET / are 200 and useT exists in settings-store).
  Screenshots: /tmp/compact-1-fa-rtl.png, /tmp/compact-2-fa-final.png.

Stage Summary:
- The sample form's vertical density is now ~30% tighter: fields 22px, tab
  rows 25px, gaps 8px, surrounding paddings ~35% smaller — the field grid
  block shrank 124→82px, so the tabs section and the form footer get
  visibly more room inside the same window. Label alignment (Task 25.1),
  RTL/LTR mirroring (Task 26) and all public contracts remain intact;
  lint/tsc/console all clean. All §7 DoD items pass.
---
Task ID: 29
Agent: Z.ai Code (main)
Task: Owner request — «اگر زبان انتخاب شده توسط کاربر یکی از زبان های RTL بود
  دکمه های فوتر باید از سمت راست به چپ چیدمان شوند و اگر زبان انتخاب شده LTR
  بود باید آیکون ها از سمت چپ به راست چیدمان شوند» (direction-aware layout of
  the form footer row buttons) + closing the outstanding Task 28 item #2
  (tabs body stuck to the form footer).

Work Log:
- §0.1: AGENTS.md + worklog re-read (Tasks 24–27 context). §0.5 respected
  (additive only, no build, no test code, no indigo/blue); §1.4 logical
  classes only; §5.1 public API/props unchanged; §1.3 zero new strings —
  dictionaries untouched; §6/§7 DoD.
- §0.6 declared assumptions: «دکمه های فوتر» = the four MiniRowButtons in
  SimpleFormTwoRowTabbed's footer strip (the ONLY <footer> element in src/);
  «از سمت راست به چپ چیدمان شوند» = the group anchors at the inline
  READING-START edge and flows with the reading direction (RTL: group hugs
  the right edge, first DOM button rightmost; LTR: left edge, leftmost).
- Task 28 retroactive audit (the lost session left NO worklog entry, so the
  code was verified directly): #1 help icon as the 11th ActionBar gradient
  tile + caption buttons [– □ ✕] hosted in the form header — VERIFIED
  present; #3 maximized window uses inset:0 inside the windows layer whose
  bottom stops at the 52px taskbar — VERIFIED present; #2 tabs body stuck
  to the footer — VERIFIED MISSING (free space accumulated between the
  tabs section and the footer) → completed in this task as FIX 2.
- FIX 1 (Task 29, simple-form-two-row-tabbed.tsx): footer button group
  ms-auto → me-auto; the empty aria-live record-counter span moved to the
  group's END side (was before it at the start side). Pure logical CSS —
  no dir conditionals needed; flex flow follows the inherited direction.
- FIX 2 (Task 28-b, same file): body wrapper became a column flex box
  (flex min-h-0 flex-1 flex-col overflow-y-auto); fields block shrink-0;
  tabs wrapper flex min-h-44 flex-1 flex-col (pb-2.5 removed → grid box
  flush on the footer's border-t); Tabs root flex min-h-0 flex-1 flex-col;
  TabsList +shrink-0; TabsContent mt-2 flex min-h-0 flex-1 flex-col; grid
  wrapper max-h-64 → min-h-0 flex-1 — the grid box now GROWS to fill all
  remaining height down to the footer (empty state included) instead of
  capping at 256px and leaving dead space; min-h-44 keeps the tabs section
  alive when the outer body must scroll (tiny viewports).
- FIX 3 (app-window.tsx, dev.log hygiene): onResizePointerDown's
  setPointerCapture wrapped in try/catch — same vanished-pointer guard the
  lost session added to startDrag; the resize handle was the last
  unguarded capture (uncaught NotFoundError appeared in dev.log under
  synthetic pointers; unrelated to but found during this E2E).
- Verification: bun run lint → 0; bunx tsc --noEmit → 0 src/ errors.
- E2E (agent-browser, fresh loads): fa/RTL — footer startGap_right 12px
  (=px-3), free space 849px on the left, reading order right→left
  [افزودن سطر جدید، حذف سطر انتخاب‌شده، کپی سطر انتخاب‌شده، ذخیره],
  gridToFooter 0px, tabs gridH 355 (was 256-cap + dead gap); en/LTR —
  startGap_left 12px, order left→right [Add a new row, Delete selected
  row, Copy selected row, Save], gridToFooter 0. Maximize (en): window
  bottom 748 = taskbar top (delta 0) and form footer = window bottom
  (delta 0) — Task 28 #3 regression intact. Mobile 390×844 (fa, fresh):
  window 366px, fields single column, horizOverflow 0, footer buttons at
  the right, tabs flush. Short viewport 1280×420 (fa, fresh): winH 344,
  outer body scrolls, tabs kept alive by the min-h-44 floor (grid 127px),
  footer reachable. Task 25.1 regression: single shared --label-w "65px",
  hook untouched. Console errors 0; page errors 0; recent dev.log 0
  errors. Screenshots: /tmp/t29-1-fa-rtl.png, /tmp/t29-2-en-ltr.png,
  /tmp/t29-3-mobile.png, /tmp/t29-4-fa-final.png.
- Known edge (pre-existing, unchanged): window size clamps are computed at
  render time — a LIVE browser-viewport resize does not re-clamp an
  already-open window until its next render; fresh loads clamp correctly.

Stage Summary:
- Form footer row buttons are now direction-aware: RTL locales lay them
  out from the right edge (reading order right→left), LTR locales from the
  left edge — implemented with logical CSS only (me-auto + flex flow).
  The tabs body fills all remaining height and sits flush on the form
  footer in both directions (Task 28 #2 closed); maximized windows still
  sit flush on the taskbar (Task 28 #3 verified). Resize-handle pointer
  capture is crash-guarded. lint/tsc/console all clean; all §7 DoD items
  pass.
---
Task ID: 30
Agent: Z.ai Code (main)
Task: Owner request — «یک نمونه دیگر از فرم هایی که در پروژه از آن استفاده
  خواهیم کرد تصویری است… این فرم را با کامپوننت هایی که برای اکشن بار ایجاد
  شده است ایجاد کنید. باید یک کامپوننت جدید ایجاد کنید بنام SimpleTreeForm
  و هر جایی نیاز شد از این فرم استفاده خواهیم کرد» — build the legacy
  master-detail tree form (screenshot: «محل های جغرافیایی» + «جزئیات: استان
  تهران») as a NEW reusable component named SimpleTreeForm, reusing the
  Task-20 action-bar components.

Work Log:
- §0.1: AGENTS.md + worklog re-read (Tasks 24–29 context). §0.5 respected
  (additive only, no build, no test code, no indigo/blue accent); §5.1
  (purely additive public API; extraction is behavior-preserving); §1.3
  (13 new stf.* keys in ALL 11 dictionaries); §1.4 (logical classes +
  direction variants only); §4.6 (demo keeps placeholder contract — sample
  data only); §6/§7 DoD.
- §0.6 declared assumptions: (a) the legacy DARK theme and BLUE header of
  the screenshot are legacy skin — the implementation follows the project's
  own Windows-11 light shell (teal→emerald header, shadcn tokens, primary
  selection) consistent with SimpleFormTwoRowTabbed; (b) the help «?» of the
  legacy header stays in the ActionBar (Task 28 owner decision) instead of
  the header; (c) the detail field grid uses the project's responsive grid
  (1/2/3 cols) rather than the legacy single column; (d) the «latin»
  strings of demo nodes are sample DATA (like the legacy's own «Tehran
  Provine»), kept out of the dictionaries; (e) preview = new desktop icon
  «نمونه درختی» + chromeless window kind "tree-demo".
- REFACTOR (behavior-preserving): HeaderButton, NavButton and FieldCell
  moved VERBATIM from simple-form-two-row-tabbed.tsx into the new shared
  src/components/forms/form-primitives.tsx (type-only import of
  SimpleFormField — no runtime cycle). FieldCell gained an optional
  idPrefix (default "sft") so checkbox DOM ids stay unique when two forms
  are mounted at once. The tabbed form imports the three primitives;
  zero visual/behavioral change (regression-verified below).
- NEW SimpleTreeForm (src/components/forms/simple-tree-form.tsx): two-pane
  shell — tree pane on the inline START (right in RTL / left in LTR,
  sm:w-72 lg:w-80, border-e; stacked h-44-on-top on mobile) with the
  project's own ARIA tree (role=tree/treeitem/group, aria-expanded,
  aria-selected, aria-level, Enter/Space select, per-depth
  paddingInlineStart, glyph set globe/flag/pin/folder/dot, chevrons
  end-aligned collapsing with ltr:-rotate-90 rtl:rotate-90); detail pane =
  the exact form-shell contract of SimpleFormTwoRowTabbed: gradient header
  hosting the Task-28 caption buttons + drag/double-click, FormActionBar
  (all 10 composed actions + Task-28 help tile + records-list dropdown),
  scrollable body with the Task-25 aligned field grid (useAlignedLabels,
  labelScope prop, default "container") + Task-27 compact FieldCell
  metrics, Inbox empty state (sft.noData) when nothing is selected.
  Selection lives inside the component (defaultSelectedId seed) and is
  mirrored to the caller via onSelect(node).
- NEW TreeDemoWindow (src/components/erp/tree-demo-window.tsx): sample
  tree محل های جغرافیایی → ایران → {استان تهران → تهران, استان البرز →
  کرج} with per-node sample detail data (kind country/province/city, code,
  latin title, active) — the legacy screenshot state (استان تهران, code 10,
  «Tehran Province») seeds the open. Reset/save/copy/delete/print/close/
  help wired with toasts; the records-list dropdown lists every node and
  opens it in the tree.
- REGISTRATION: WindowKind += "tree-demo" (desktop-store); CHROMELESS_KINDS
  += "tree-demo" (app-window — the form header hosts the caption buttons);
  STATIC_WINDOWS entry (amber→orange ListTree tile, titleKey stf.iconLabel)
  + desktop icon after «نمونه فرم» + iconGlyph branch (desktop.tsx).
- i18n: 13 keys "stf.details/iconLabel/geoTitle/iran/tehranProvince/
  tehran/alborz/karaj/type/latinTitle/optCountry/optProvince/optCity"
  added to ALL 11 dictionaries (fa source of DictKey + en/tr/ar/hi/ps/
  ckb/pt/ko/fr/zh), inserted after sft.selectPlaceholder in every block.
- Verification: bun run lint → 0; bunx tsc --noEmit → 0 src/ errors.
- E2E (agent-browser, fresh loads): fa/RTL — tree pane at RIGHT (320px),
  title bar «محل های جغرافیایی», detail header «جزئیات: استان تهران»,
  6 treeitems levels 1–4 all expanded, indentation 6/20/34/48px,
  aria-selected on tehran-province, fields نوع=استان/کد=10/عنوان=استان
  تهران/عنوان (لاتین)=Tehran Province/فعال=checked, --label-w "65px",
  toolbar order right→left [ریست…راهنما] (legacy order). Interactions:
  click کرج → header «جزئیات: کرج» + fields 201/کرج/Karaj + selection
  moves; chevron collapse of ایران → only [geo, iran] visible,
  aria-expanded=false; re-expand → 6 nodes; keyboard Enter on ایران →
  selected. en/LTR — tree pane at LEFT, header "Details: Iran" (selection
  survives the locale switch), labels Type/Code/Title/Latin Title, tree
  fully localized. Maximize (en): window bottom 748 = taskbar top
  (delta 0). Mobile 390×844 (fa, fresh): stacked panes, tree h-44=176px,
  horizOverflow 0, window 366px. Task 24/25/27/28-b/29 regression on the
  tabbed form: labelW 65px, input 22px, footer start-gap 12px,
  gridToFooter 0, checkbox id "sft-chk-active" unchanged. Console errors
  0; page errors 0; recent dev.log 0 errors. Screenshots:
  /tmp/t30-1-fa-rtl.png, /tmp/t30-2-en-ltr.png, /tmp/t30-3-mobile.png,
  /tmp/t30-4-fa-final.png.

Stage Summary:
- SimpleTreeForm is now the project's reusable master-detail tree shell:
  legacy «محل های جغرافیایی» fidelity (tree glyphs, chevrons, selection,
  detail fields نوع/کد/عنوان/عنوان لاتین/فعال) on the project's own
  Windows-11 design system, direction-aware end-to-end (RTL start = tree
  right / LTR tree left), FormActionBar reused verbatim, label alignment
  and compact metrics shared with the tabbed form via form-primitives.
  Reachable from the new desktop icon «نمونه درختی» (chromeless window,
  maximize flush with the taskbar). Form primitives extraction verified
  regression-free; lint/tsc/console all clean; all §7 DoD items pass.

---
Task ID: 31
Agent: Z.ai Code (main)
Task: گزارش مالک — «وقتی فرم‌ها باز می‌شود آیکون‌های زیر فرم که در دسکتاپ وجود دارد نمایش داده می‌شود»؛ آیکون‌های دسکتاپ نباید از زیر پنجرهٔ فرم باز دیده شوند.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (کانتکست Tasks 24–30). §0.5 رعایت شد
  (بدون حذف قابلیت، بدون build، بدون کد تست، بدون indigo/blue)؛ §3.5 (الگوی
  Fluent/Win11: فریم پنجره در Windows 11 واقعی مات است، فقط flyout/استارت‌منو/
  تسک‌بار شیشه‌ای‌اند)؛ §7 DoD کامل.
- §0.6 فرض اعلام‌شده: شکایت مالک شامل «همهٔ پنجره‌های دسکتاپ» است (نه فقط دو
  فرم دمو) — اصلاح در ریشهٔ AppWindow اعمال شد تا یکنواخت پوشش دهد؛ flyoutها
  (dropdown/select/tooltip/dialog)، تسک‌بار، استارت‌منو و منوی کانتکست شیشه‌ای
  می‌مانند (رفتار اصیل Win11 و خارج از موضوع گزارش).
- ROOT CAUSE: ریشهٔ AppWindow کلاس acrylic-strong داشت =
  color-mix(card 88%, transparent) + backdrop-blur(40px) → پنجره ۱۲٪ شفاف و
  کاشی‌های رنگی پُراشباع دسکتاپ به‌صورت لکه‌های محو از داخل بدنهٔ فرم دیده
  می‌شدند (طبق اسکرین‌شات مالک). z-index سالم بود (icons z-0 < windows z-100).
- FIX (تک‌خطی و جراحی): src/components/desktop/app-window.tsx — ریشهٔ پنجره
  acrylic-strong → bg-card (معادل ماتِ دقیقِ ترکیب قبلی ۸۸٪ card؛ در هر دو تم
  تعریف‌شده). backdrop-filter بلااستفاده هم حذف شد (صرفهٔ GPU). هیچ مصرف‌کنندهٔ
  دیگری از acrylic-strong تغییر نکرد.
- Verification: bun run lint → 0 خطا/۰ هشدار. E2E (agent-browser):
  hit-test از مرکز هر ۳۰ آیکون دسکتاپ — ۲۰ آیکون زیر پنجرهٔ باز، ۰ مورد از
  داخل پنجره قابل‌دسترسی (قبل: دیده‌شدن بصری). computed style ریشه:
  lab(100 0 0) مات + backdrop none (روشن) و lab(14.1 -1.4 -5.2) مات (تیره).
  پنجره‌های نمونهٔ درختی/نمونهٔ فرم/placeholder «انبار» همگی مات و ساختار
  دست‌نخورده (header، ActionBar ۱۱ کاشی، tree، فیلدها، footer). RTL (fa) و
  LTR (en) هر دو صحیح؛ موبایل 390×844: پنجره 366px بدون overflow افقی،
  چیدمان پشته‌ای سالم. خطای صفحه در مسیر عادی (fa، تم روشن): ۰.
- OBSERVATION (پیش‌آمینه، خارج از scope این تسک — برای تصمیم مالک): Desktop
  کلاس والپیپر را مستقیماً از resolvedTheme در رندر می‌گیرد بدون گارد mounted؛
  اگر prefers-color-scheme سیستم تیره باشد (یا theme=tیره ذخیره شده باشد)
  React یک هشدار hydration mismatch روی کلاس ریشه ثبت می‌کند
  (erp-wallpaper ↔ erp-wallpaper-dark). رگرسیون Task 31 نیست؛ در اسکرین‌شات‌ها
  با emulate مرورگر آشکار شد و پس از set media light صفر شد.

Stage Summary:
- پنجره‌های دسکتاپ (فرم‌ها و همهٔ انواع) اکنون کاملاً مات‌اند: هیچ آیکون یا
  عنصری از زیر پنجرهٔ باز دیده نمی‌شود — دقیقاً مطابق رفتار Windows 11 واقعی.
  افکت شیشه‌ای acrylic فقط روی flyoutها/تسک‌بار/استارت‌منو حفظ شد. تغییر
  تک‌کلاسی در app-window.tsx؛ صفر رگرسیون بصری/رفتاری در فرم‌ها (Tasks 24–30
  همه سالم). lint/E2E/RTL/LTR/موبایل/console همگی پاس؛ ثبت در worklog انجام شد.

---
Task ID: 32
Agent: Z.ai Code (main)
Task: درخواست مالک — «فرم ساختار کسب و کار را با استفاده از کامپوننت SimpleTreeForm ریفکتور کنید».

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 24–31). §0.5 رعایت شد (بدون
  build، بدون کد تست، بدون indigo/blue)؛ §5.1 (همهٔ توسعه‌های قرارداد فرم
  افزودنی و backward-compatible)؛ §5.4 (BS از استثنای TreeForm-domain است و
  همان اتصال مستقیم سرویس Task-17 حفظ شد)؛ §5.6 (erp:records-changed + refetch
  + انتخاب مجدد گره)؛ §1.3 (صفر کلید جدید — همهٔ متن‌ها از کلیدهای موجود
  bs.*/abar.*/sft.* آمد؛ ۱۱ زبان دست‌نخورده)؛ §1.4 (کلاس‌های منطقی فقط)؛
  §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) تب «کاربران مجاز» placeholder غیرعملیاتی بود
  (endpoint IAM هنوز پیاده نشده؛ خودش «به‌زودی» می‌گفت) و روی پوستهٔ
  SimpleTreeForm جایی ندارد — حذف شد و برای بازگشت به شکل extension پوسته
  به تصمیم مالک گذاشته شد؛ (۲) دکمهٔ «جدید» و refresh سرصفحهٔ قبلی به
  ترتیب با کاشی «+» (ریست = ورود جدید، پدر = گره انتخابی یا ریشه) و
  listener رویداد §5.6 جایگزین شدند (به‌روزرسانی خودکار بدون refresh دستی)؛
  (۳) خطای اعتبارسنجی inline قبلی به toast با همان پیام‌های bs.val.* تبدیل
  شد؛ (۴) chip کد/«SYS» سرصفحهٔ قبلی به badge پوسته (کد رکورد) تبدیل شد؛
  (۵) جست‌وجوی درخت و دکمه‌های +/حذف سطری TreeForm حذف شدند — معادلشان
  کاشی‌های ActionBar و dropdown «لیست» است (درخت ≤۴ سطح است)؛ (۶) labelهای
  فارسی گره‌ها دادهٔ API هستند (نه chrome) و در en هم فارسی می‌مانند — مثل
  میراث.
- ADDITIVE shell extensions (SimpleTreeForm، همه اختیاری و بدون شکستن
  Task-30): props جدید selectedId (آینهٔ کنترل‌شده با الگوی
  derive-during-render — نه effect، قانون react-hooks/set-state-in-effect
  پاس)، detailTitleOverride (حالت ایجاد: «جدید — والد: X»)، emptyText
  (پیش‌فرض sft.noData)، detailExtra (آپلودر لوگو/هشدار union زیر شبکهٔ
  فیلدها)، treeEmptyText (بارگذاری/خالی بودن درخت)؛ و
  SimpleTreeFormNode.icon از این پس ReactNode هم می‌پذیرد (BsTypeIcon
  رنگی Task-17 در گره‌ها حفظ شد). SimpleFormField.ltr + FieldCell
  (dir=ltr + text-start) برای «عنوان لاتین».
- chromeless: CHROMELESS_KINDS += "business-structure" (قرارداد Task 28 —
  header سبز میزبان caption buttons و drag handle؛ یکدست با Task 30).
- bs-window.tsx بازنویسی روی پوسته: ناوبری/CRUD و قواعد نوع parent-driven و
  seed/saveNew/saveClose و نگاشت خطاهای حذف و dispatch رویداد عیناً از
  Task-17 حفظ شد؛ درخت تودرتو از items با همان ترتیب؛ فرم state با
  derive-and-reset (کلید mode:node:version، از BsDetail منتقل)؛ ریشه: کد و
  عنوان readonly + isBasicInfoShared + ۴ چک‌باکس activeStructureTypes
  (معادل چیپ‌ها) + isActive + هشدار union در detailExtra؛ غیر-ریشه:
  عنوان/عنوان لاتین(ltr)/نوع(قفل روی isSystem)/مدیر/فعال + آپلودر لوگو؛
  gating کاشی‌ها: canSave=mode≠idle، canCopy=false، canPrint=false،
  canDelete=قواعد ریشه/سیستم/فرزند؛ listItems=همهٔ گره‌ها (کد subtitle).
- bs-detail.tsx به ماژول اتم‌های دامنه تبدیل شد (BsTypeIcon/parseTypes/
  BsLogoUploader verbatim رفتار)؛ BsDetail card و TreeForm از BS جدا شدند
  (هر دو فایل مشترک دست‌نخورده برای استفاده‌های آینده)؛ childRuleHint
  بلااستفاده حذف شد.
- FIX حین E2E: کاشی‌های خانوادهٔ حذف FormActionBar خودشان
  ConfirmDeleteDialog دارند → window.confirm میراث Task-17 از handleDelete
  حذف شد (رفع دوباره‌پرسشی؛ تک‌تأیید). actionDeleteNew/Close صریح و async
  شدند تا ترتیب confirm→delete→new/close درست باشد.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/.
  E2E (agent-browser، fa/RTL 1440×810): درخت ۴ گره L1–L3 با آیکون‌های
  رنگی؛ ریشه: کد 01/عنوان readonly + ۴ چک‌باکس + هشدار union با badgeها؛
  ایجاد: «+» روی شرکت نمونه → «جدید — والد: شرکت نمونه (01-01)» +
  badge «جدید» + لوگو؛ ذخیره → toast «با موفقیت ذخیره شد» + گره تازه
  «شعبه تست ۳۲» با کد خودکار 01-01-03 انتخاب؛ ویرایش مدیر → PUT ✓؛ حذف
  از کاشی → دیالوگ «تأیید حذف» → تک‌تأیید → toast «شاخه حذف شد» + حالت
  خالی (داده به حالت اولیه برگشت)؛ dropdown لیست با ۴ آیتم + کد → انتخاب
  شعبه شیراز همگام با درخت/فرم؛ بستن از caption ✕. en/LTR: درخت چپ،
  Details/Structure Tree/Select a node — gating صحیح (فقط ریست/لیست فعال).
  موبایل 390×844: پنجره 366px، پشتهٔ درخت h-44=176px، بدون overflow
  افقی. رگرسیون Task-30 (نمونه درختی): انتخاب پیش‌فرض/سویچ کرج/لیبل‌ها
  دست‌نخورده. page errors=0، console errors=0، dev.log پاک.
  اسکرین‌شات‌ها: /tmp/t32-1-root.png … /tmp/t32-6-mobile.png.

Stage Summary:
- «ساختار کسب و کار» اکنون روی همان پوستهٔ SimpleTreeForm «محل‌های
  جغرافیایی» است: header سبز chromeless با caption buttons، ActionBar
  ۱۰ کاشی + dropdown لیست، شبکهٔ فیلد هم‌تراز (Task 25/27)، درخت
  جهت‌آگاه با آیکون‌های رنگی نوع. تمام رفتار CRUD/قواعد/رویدادهای Task-17
  حفظ شد؛ تب غیرعملیاتی کاربران و جست‌وجوی درخت حذف (فرض‌های اعلام‌شده
  برای تصمیم مالک)؛ window.confirm تکراری حذف شد. lint/tsc/E2E/RTL/LTR/
  موبایل/console همگی پاک؛ ۱۱ زبان بدون کلید جدید؛ ثبت در worklog انجام شد.

---
Task ID: 33
Agent: Z.ai Code (main)
Task: درخواست مالک — «توی کامپوننت SimpleTreeForm کاربر با کلیک راست روی هرشاخه باید بتواند افزودن شاخه و حذف شاخه را انجام دهد».

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 31/32). §0.5 رعایت شد (بدون build،
  بدون کد تست، بدون indigo/blue، بدون حذف قابلیت)؛ §5.1 (همهٔ توسعه‌ها افزودنی —
  پوسته و هر دو مصرف‌کنندهٔ قبلی بدون رفتار تازه به‌اصطلاح پیش‌فرض)؛ §1.3 (صفر کلید
  جدید — متن‌ها از کلیدهای موجود bs.addNode «افزودن زیرشاخه» و bs.deleteBranch
  «حذف شاخه» که در هر ۱۱ دیکشنری موجودند)؛ §1.4 (بدون کلاس جهت‌دار جدید؛ منو با
  clientX/clientY و راست‌چین خودکار سند)؛ §5.6 (حذف از منو همان handleDelete
  Task-32 را می‌رود: toast + refetch + erp:records-changed)؛ §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) منو opt-in است — فقط مصرف‌کننده‌ای که هندلر بدهد منو
  می‌بیند؛ «نمونه درختی» (Task 30) بدون هندلر می‌ماند و راست‌کلیکش مثل قبل منوی
  بومی مرورگر است (E2E تأیید)؛ (۲) «افزودن شاخه» = ایجاد زیرشاخه تحت همان گرهٔ
  راست‌کلیک‌شده (برای BS همان startCreate با والدِ گره؛ قواعد نوع parent-driven در
  فرم اعمال می‌شود)؛ (۳) «حذف شاخه» تأییدِ حذف را به عهدهٔ فراخوان می‌گذارد و در BS
  از همان ConfirmDeleteDialog کاشی‌های حذف ActionBar می‌رود (تک‌تأیید، تصمیم
  Task-32؛ بدون window.confirm)؛ (۴) راست‌کلیک اول گره را انتخاب می‌کند (رفتار
  Explorer/TreeForm میراث — در BS حالت ایجادِ ناتمام رها می‌شود مثل کلیک معمولی)؛
  (۵) لمس/موبایل مسیر CRUD خود را از کاشی‌های ActionBar دارد (منو تقویتِ اشاره‌گر
  دسکتاپ است).
- SHELL (src/components/forms/simple-tree-form.tsx — افزودنی): props جدید
  onAddBranch(parent)/canAddBranch/onDeleteBranch(node)/canDeleteBranch/
  addBranchLabel/deleteBranchLabel (اختیاری؛ پیش‌فرض لیبل‌ها bs.addNode/
  bs.deleteBranch). state منو {x,y,node} + clamp اندازهٔ واقعی داخل viewport با
  useLayoutEffect (قرارداد FloatingMenu)؛ بستن روی pointerdown «بیرونِ» منو
  (capture) / Escape / resize — عمداً روی pointerdown داخل منو بسته نمی‌شود تا
  click آیتم قبل از unmount بنشیند (دام شناخته‌شدهٔ الگوی «بستن روی هر
  pointerdown» در TreeForm). flyout با createPortal به document.body رندر می‌شود
  تا overflow-hidden پنجره/پنل و هر containing block آینده هرگز کلیپش نکند؛
  کلاس‌ها acrylic-strong menu-in z-[13000] (خانوادهٔ منوهای Win-11، هم‌لایهٔ منوی
  TreeForm). role=menu/menuitem + aria-label؛ آیتم افزودن با Plus text-primary،
  حذف با Trash2 text-destructive hover:bg-destructive/10. راست‌کلیک روی ردیف فقط
  وقتی هندلری wired است preventDefault می‌شود؛ اگر برای آن گره هیچ آیتمی قابل
  نمایش نباشد منوی خالی باز نمی‌شود (گate قبل از باز شدن). با صفر هندلر، رفتار
  Task-30 عیناً حفظ می‌شود.
- BS (src/components/erp/business-structure/bs-window.tsx): onAddBranch →
  startCreate(parent.id)؛ onDeleteBranch → state contextDeleteId + ConfirmDeleteDialog
  (frament کنار SimpleTreeForm) → handleDelete همان Task-32؛ canDeleteBranch از
  bsCanDelete (ریشه/سیستم/دارای‌فرزند → آیتم حذف مخفی) — همان قواعد کاشی حذف.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/. E2E
  (agent-browser): fa/RTL 1440×810 — راست‌کلیک «شرکت نمونه»: فقط «افزودن
  زیرشاخه» (حذف مخفی چون فرزند دارد) → فرم «جدید — والد: شرکت نمونه (01-01)» →
  ذخیره → «شعبه تست ۳۳» (01-01-03) انتخاب؛ راست‌کلیک برگ تازه: هر دو آیتم →
  «حذف شاخه» → دیالوگ «تأیید حذف» → تأیید → گره حذف، درخت به ۴ گره اولیه برگشت؛
  راست‌کلیک ریشه: فقط افزودن (حذف مخفی)؛ Escape منو را بست. en/LTR: درخت چپ،
  "Add child"/"Delete branch" — ساخت برگ "Test Branch EN" و حذف تأییدی کامل.
  دمو «نمونه درختی»: راست‌کلیک → role=menu برابر null (بدون منوی سفارشی —
  رگرسیون صفر). موبایل 390×844: پنجره 366px بدون overflow افقی؛ منو کاملاً داخل
  viewport (x195,y142,160×38,inViewport:true). تم تیره: منوی acrylic خوانا، هر
  دو آیتم روی برگ واقعی «شعبه اصفهان». کنسول پس از reload تمیز fa/light: 0
  خطا/۰ هشدار؛ page errors=0؛ dev.log فقط هشدار hydration پیش‌موجودِ مستندِ
  والپیپر (مربوط به reload تم تیره؛ خارج از scope این تسک). اسکرین‌شات‌ها:
  /tmp/t33-1 … /tmp/t33-9.
- NOTE (مشاهدهٔ فنی برای مالک، بدون تغییر در این تسک): منوی کانتکست TreeForm
  میراث روی «هر pointerdown» بسته می‌شود که در برخی زمان‌بندی‌های React می‌تواند
  click آیتم را ببلعد؛ الگوی صحیح FloatingMenu/Task-33 در SimpleTreeForm
  پیاده شد. TreeForm دست‌نخورده ماند (§5.1) — در صورت خواست مالک هم‌تراز شود.

Stage Summary:
- راست‌کلیک روی هر گرهٔ درخت در پوستهٔ SimpleTreeForm اکنون flyout Win-11 با
  «افزودن زیرشاخه» و «حذف شاخه» باز می‌کند: افزودن = فرم ایجاد با والد همان
  گره؛ حذف = همان دیالوگ تأیید کاشی‌های ActionBar و همان جریان Task-32 (toast +
  refetch + رخداد §5.6). گیتینگ کامل: ریشه/سیستم/گرهٔ دارای فرزند آیتم حذف را
  ندارند. منو opt-in است؛ «نمونه درختی» و رفتار قبلی پوسته بدون تغییر. fa/en،
  RTL/LTR، دسکتاپ/موبایل، تم روشن/تیره همگی پاس؛ lint/tsc/console پاک؛ ۱۱ زبان
  بدون کلید جدید؛ ثبت در worklog انجام شد.

---
Task ID: 34
Agent: Z.ai Code (main)
Task: درخواست مالک — «به آیتم‌های نوع در ساختار کسب و کار، فروشگاه را هم اضافه کنید. اطلاعات علاوه بر 4 سطح هولدینگ، شرکت، شعبه، نمایندگی در سطح فروشگاه هم باید نگهداری شود. بدون اینکه تغییری در ظاهر و استایل فرم‌ها انجام دهید این تغییر و درخواست را در پروژه اعمال کنید».

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 31-33). §0.5 رعایت شد (بدون build،
  بدون کد تست، بدون indigo/blue جدید — رنگ نوع ۵ fuchsia است؛ sky میراثِ نوع ۴
  دست‌نخورده ماند)؛ §1.3 (کلید جدید bs.type.5 در هر ۱۱ دیکشنری — fa منبع و TS
  بقیه را الزام کرد)؛ §1.4 (صفر کلاس جهت‌دار جدید)؛ §2.3 (فقط کامنت اسکیما —
  ستون Int? مقدار ۵ را بدون تغییر ساختاری می‌پذیرد؛ db push لازم نشد)؛ §5.1
  (همهٔ تغییرات افزودنی؛ آیکون/رنگ نوع‌های ۱-۴ و همهٔ استایل‌ها verbatim)؛
  §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) فروشگاه = نوع ۵ و «پنجمین سطح» زیر ریشه؛ قواعد
  والد-محور: Holding/Company → [2,3,4,5]، Branch/Agency → [4,5]، Store → برگ
  (بدون فرزند — الگوی خرده‌فروشی؛ مشابه بازگشت‌پذیری Agency در میراث)؛
  ROOT_ALLOWED شامل ۵ تا فروشگاه مستقیماً تحت دفتر مرکزی هم ممکن شود؛
  MAX_DEPTH سرویس ۴→۵ و پیام «۵ سطح». (۲) چک‌باکس پنجم «فروشگاه» در فرم ریشه و
  badge آن در هشدار union، دادهٔ جدید در همان استایل‌های موجود است (خواستهٔ
  ضمنی درخواست: ریشه باید بتواند نوع فروشگاه را فعال کند). (۳) آیکون نوع ۵ =
  ShoppingBag با رنگ fuchsia — آیکون فعلی نوع ۳ (Store glyph) عمداً عوض نشد تا
  هیچ ظاهری تغییر نکند. (۴) منوی راست‌کلیک Task-33 روی گره‌های برگ (مثل
  فروشگاه) دیگر «افزودن زیرشاخه» پیشنهاد نمی‌دهد (canAddBranch جدید = همان
  قاعدهٔ سرور) و کاشی «+» با انتخاب برگ به اولین شاخهٔ ریشه برمی‌گردد (رفتار
  «...یا ریشه» Task-17) — جلوگیری از بن‌بست فرم ایجاد با dropdown نوع خالی.
- FRONTEND: src/types/business-structure.ts — CHILD_TYPE_RULES/ROOT_ALLOWED_
  TYPES/MAX_LEVELS (4→5) + bsTypeColor case 5 (fuchsia-500) + کامنت‌ها؛
  src/i18n/dictionaries.ts — «bs.type.5» فروشگاه/Store/Mağaza/متجر/स्टोर/
  پلورنځی/فروشگا/Loja/상점/Magasin/商店؛ src/components/erp/business-structure/
  bs-detail.tsx — BsTypeIcon فقط شاخهٔ type===5 اضافه شد (ShoppingBag)؛
  src/components/erp/business-structure/bs-window.tsx — bsCanHostChild
  (allowedChildTypes>0) + canAddBranch منو + fallback کاشی «+».
- SERVER (mini-services/settings-service، با bun --hot خودش restart شد):
  business-structure.dto.ts — @Max(4)→@Max(5) روی businessStructureType هر دو
  DTO و @Max(4,{each})→@Max(5,{each}) روی activeStructureTypes؛
  business-structure.service.ts — CHILD_TYPE_RULES/ROOT_ALLOWED/MAX_DEPTH=5 +
  پیام عمق «۵ سطح» + کامنت سرآیند؛ prisma/schema.prisma — کامنت ستون
  «// 1=Holding 2=Company 3=Branch 4=Agency 5=Store (Task 34)». BFF فقط پروکسی
  است (بدون اعتبارسنجی نوع) — تغییر نیافت.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/. E2E
  (agent-browser، fa/RTL 1440×810): dropdown نوع زیر «شرکت نمونه» چهار گزینه
  (شرکت/شعبه/نمایندگی/فروشگاه)؛ ذخیرهٔ «فروشگاه مرکزی» → کد خودکار 01-01-03،
  گره انتخابی با چیپ fuchsia/ShoppingBag، toast «با موفقیت ذخیره شد»؛ فرم
  ریشه: ۵ چک‌باکس + هشدار union با ۵ badge (استایل‌ها عیناً قبلی)؛ راست‌کلیک
  فروشگاه: فقط «حذف شاخه» (برگ)؛ کاشی «+» با فروشگاه انتخابی → «جدید — والد:
  دفتر مرکزی (01)» (fallback)؛ فروشگاه دوم زیر شرکت → + → fallback → حذف از
  منوی راست‌کلیک → تأیید → درخت به ۴ گرهٔ seed برگشت؛ راست‌کلیک «شرکت نمونه»:
  فقط افزودن (حذف مخفی، فرزند دارد) — گیت‌های Task-33 سالم. en/LTR: dropdown
  ریشه ۵ گزینه با "Store". موبایل 390×844: پنجره 366px بدون overflow، منوها با
  گیت صحیح. console پس از reload تمیز fa/light: 0 خطا/۰ هشدار؛ page errors=0؛
  dev.log و settings-service.log بدون خطای runtime. اسکرین‌شات‌ها: /tmp/t34-1
  … /tmp/t34-4.

Stage Summary:
- نوع پنجم «فروشگاه» (Store) به ساختار کسب و کار اضافه شد: در dropdown نوع‌ها
  (زیر هلدینگ/شرکت/شعبه/نمایندگی و مستقیماً تحت ریشه)، در چک‌باکس‌های فعال‌سازی
  ریشه و هشدار union، در آیکون‌های رنگی گره‌ها و در اعتبارسنجی سرور (DTO،
  قواعد والد-محور، عمق ۵ سطح). فروشگاه برگ است و زیر آن شاخه ساخته نمی‌شود —
  منو/کاشی «+» هم همین را رعایت می‌کنند. هیچ تغییر ظاهری در فرم‌ها (استایل،
  چیدمان، آیکون‌های نوع‌های قبلی) رخ نداد؛ ۱۱ زبان همگام؛ lint/tsc/E2E/console
  همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 35
Agent: Z.ai Code (main)
Task: درخواست مالک — «فرم ساختار کسب و کار را در آیکون تنظیمات قرار دهید و به عنوان یک آیکون مجزا در صفحه دسکتاپ نباشد. فرم ساختار کسب و کار به عنوان یک فرم زیرمنوی تنظیمات باشد» (فرم ساختار کسب و کار به زیرمنوی پنجرهٔ تنظیمات منتقل شود و آیکون مستقل دسکتاپ حذف گردد).

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 31-34). §0.5 رعایت شد (بدون build،
  بدون کد تست، بدون رنگ indigo/blue جدید — کارت بنفشِ ساختار کسب و کار همان هویت
  violet-500→700 خود آیکون قبلی است؛ §4.6 دست نخورد: placeholder های ۲۷ نرم‌افزار
  کاتالوگ از جمله آیکون دسکتاپی «تنظیماتِ کاتالوگ» عیناً قبلی‌اند)؛ §1.3 (دو کلید
  جدید settings.back / settings.bsDesc در هر ۱۱ دیکشنری؛ عنوان زیرمنو از کلید
  موجود menus.businessStructure استفاده کرد — fa منبع و TS بقیه را الزام کرد)؛
  §1.4 (شِورون/فلش جهت‌دار از dir مشتق شد؛ صفر کلاس فیزیکی جدید)؛ §5.1 (همهٔ
  تغییرات افزودنی؛ پنجرهٔ مستقل business-structure و قرارداد chromeless Task-28
  برای آن verbatim حفظ شد؛ pinnedMeta/PinnedGlyph تسک‌بار برای سازگاری backend
  باقی ماند)؛ §5.6 (رویداد erp:records-changed و selfEventRef در حالت embedded
  عیناً کار می‌کند — E2E شد)؛ §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) «آیکون مجزا در صفحه دسکتاپ» شامل سنجاقِ داک فوتر
  تسک‌بار هم می‌شود → از DEFAULT_PINNED حذف و مهاجرت یک‌بارهٔ persist (version 0→1)
  سنجاق‌های ذخیره‌شدهٔ قبلی را می‌شوید (E2E: seeded ["business-structure","settings"]
  v0 → ["settings"] v1)؛ (۲) کاشی لانچر «ساختار کسب و کار» در منوی استارت (گرید
  pinned + ردیف پیشنهاد شده) همان سطح «آیکون مجزا» است → حذف شد؛ (۳) «فرم
  زیرمنوی تنظیمات» = زیرصفحهٔ embedded درون پنجرهٔ تنظیمات به الگوی Settings ویندوز
  ۱۱ با نوار «بازگشت / ساختار کسب و کار»؛ (۴) در حالت embedded، هدر سبز فرم بدون
  دکمه‌های caption رندر می‌شود (کروم مالِ پنجرهٔ تنظیمات است؛ گیت‌های opt-in پوسته
  هنگام undefined بودن هندلرها دکمه‌ها را پنهان می‌کنند) و «ذخیره و بستن» /
  «حذف و بستن» به‌جای بستن پنجره، به صفحهٔ خانهٔ تنظیمات برمی‌گردند؛ (۵) دیتای
  نمونهٔ درخت (اسامی فارسی گره‌ها) دیتاست نه رشتهٔ UI — در en فارسی می‌ماند.
- SHELL (src/components/desktop/desktop-store.ts): DEFAULT_PINNED = ["settings"]؛
  persist version:1 + migrate که فقط "business-structure" را از pinned و
  iconPositions ذخیره‌شده حذف می‌کند (سایر کلیدها دست‌نخورده).
- DESKTOP (src/components/desktop/desktop.tsx): آرایهٔ items آیکون‌های دسکتاپ
  بدون مدخل business-structure (نمونه‌ها + ۲۷ نرم‌افزار)؛ شاخهٔ BusinessStructure
  از iconGlyph حذف شد؛ STATIC_WINDOWS و WindowKind حفظ شد (پنجرهٔ مستقل هنوز
  قابل رندر است — سازگاری backward).
- START MENU (src/components/desktop/start-menu.tsx): کاشی BS از گرید pinned و
  ردیف پیشنهاد شده حذف شد؛ «تنظیمات» تنها ردیف پیشنهاد ماند؛ import Network حذف.
- SETTINGS (src/components/erp/settings-window.tsx): state داخلی page
  ("home" | "business-structure")؛ خانه: سه سکشن زبان/ظاهر قبلی + کارت لانچر
  «ساختار کسب و کار» (آیکون Network بنفش + توضیح + شِورون جهت‌دار؛ همان زبان
  بصری rounded-xl/border-border/70/bg-card/60/p-4 سکشن‌های موجود)؛ زیرصفحه: نوار
  باریک «بازگشت» + عنوان، سپس <BusinessStructureWindow embedded
  onEmbeddedClose={...}/> در min-h-0 flex-1.
- BS WINDOW (src/components/erp/business-structure/bs-window.tsx): props جدید
  embedded/onEmbeddedClose (اختیاری — پیش‌فرض رفتار قبلی)؛ chromeApi = embedded ?
  null : chrome (دکمه‌های caption و درگ هدر در حالت embedded خاموش)؛
  closeThisWindow در حالت embedded به onEmbeddedClose می‌رود و مسیرهای
  «ذخیره و بستن»/«حذف و بستن»/onClose از همین قیف عبور می‌کنند (خط myWindowId/
  closeWindow حذف شد)؛ سیم‌کشی onHeaderMinimize/Maximize/Drag*/DoubleClick از
  chromeApi — standalone عیناً قرارداد Task-28.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/ (فقط خطاهای
  pre-existing خارج src در skills/). E2E (agent-browser): fa/RTL 1440×810 با
  localStorage تازه — دسکتاپ بدون آیکون BS؛ داک فوتر فقط «تنظیمات»؛ منوی استارت
  بدون کاشی BS؛ پنجرهٔ تنظیمات (پین تسک‌بار) با کارت BS؛ کلیک کارت → زیرصفحه با
  نوار بازگشت، درخت ۴ گرهٔ seed (دیتا از settings-service)، هدر فرم بدون دکمهٔ
  caption (0 دکمه)؛ راست‌کلیک «شرکت نمونه» → فقط «افزودن زیرشاخه» → فرم «جدید —
  والد: شرکت نمونه (01-01)» → نوع فروشگاه از dropdown (شرکت/شعبه/نمایندگی/
  فروشگاه) → ذخیرهٔ «فروشگاه تست ۳۵» → گره در درخت؛ راست‌کلیک فروشگاه → فقط
  «حذف شاخه» (برگ، گیت Task-33/34) → «تأیید حذف» → درخت به ۴ گره برگشت؛
  «ذخیره و بستن» → برگشت به خانهٔ تنظیمات (کارت دوباره، پنجره باز)؛ ورود دوباره
  + دکمهٔ «بازگشت» → خانه. en/LTR: کارت "Business Structure / Manage holding,
  company, branch, agency and store levels"، زیرصفحه "← Back / Business
  Structure"، درخت سمت چپ، دکمهٔ caption صفر. مهاجرت: seeded erp.desktop.layout
  v0 با پین BS → پس از reload پین حذف و version:1. موبایل 390×844 fa: پنجرهٔ
  366px بدون overflow افقی (scrollW=clientW=390)، زیرصفحه با چیدمان ستونی پوسته.
  تم تیره: کارت/نوار بازگشت/درخت/اکشن‌ها خوانا. کنسول پس از reload تازهٔ
  fa/light: 0 خطا/۰ هشدار (فقط info React-DevTools + HMR)؛ page errors=0؛
  dev.log فقط هشدار hydration پیش‌موجودِ مستندِ والپیپر (reload تم تیره). توجه:
  آیکون دسکتاپی «تنظیماتِ کاتالوگ» طبق §4.6 همچنان placeholder است؛ ورودی واقعی
  تنظیمات، پین داک/منوی استارت است. اسکرین‌شات‌ها: /tmp/t35-1 … /tmp/t35-7.

Stage Summary:
- «ساختار کسب و کار» دیگر هیچ آیکون مستقلی روی دسکتاپ ندارد (نه آیکون دسکتاپ،
  نه پین داک فوتر — با مهاجرت یک‌بارهٔ layout ذخیره‌شده، نه کاشی منوی استارت).
  تنها ورودی، پنجرهٔ «تنظیمات» است: کارت لانچر در خانهٔ تنظیمات و فرم کامل BS
  به‌صورت زیرصفحهٔ embedded با نوار «بازگشت» — با همان SimpleTreeForm، همان
  CRUD، همان منوی راست‌کلیک و همان رویداد §5.6. پنجرهٔ مستقل BS و قرارداد
  chromeless آن برای سازگاری حفظ شد. دو کلید i18n جدید در ۱۱ زبان؛ lint/tsc/
  E2E/console همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 36
Agent: Z.ai Code (main)
Task: درخواست مالک — «دکمه تنظیمات در صفحه دسکتاپ و دکمه تنظیمات در تسک بار باید دقیقا یک اطلاعات را نمایش بدهند. الان دکمه تنظیمات در تسک بار فرم ساختار کسب و کار را نمایش می‌دهد ولی دکمه تنظیمات در صفحه دسکتاپ (فلش قرمز) فرم ساختار کسب و کار را نمایش نمی‌دهد» (همگام‌سازی کامل ورودی‌های تنظیمات).

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 31-35). §0.5 رعایت شد (بدون build، بدون کد
  تست، بدون رنگ indigo/blue جدید؛ هیچ قابلیتی حذف نشد — جایگزینی placeholderِ تنظیمات با
  پنجرهٔ واقعی، همان «تأیید مالک» مجازِ §0.5 است)؛ §1.3 (صفر کلید جدید — «app.settings» و
  «settings.title» از قبل در هر ۱۱ دیکشنری موجود و هم‌متن‌اند)؛ §1.4 (صفر کلاس جهت‌دار
  جدید)؛ §4.6 (استثنای صریحِ مالک فقط برای نرم‌افزار «تنظیمات»؛ ۲۶ برنامهٔ دیگر کاتالوگ با
  پنجرهٔ placeholder و قرارداد §4.6 دست‌نخورده ماندند)؛ §5.1 (تغییر افزودنی — یک گارد
  بازگردانی در openWindow؛ هیچ قرارداد پنجره‌ای شکسته نشد)؛ §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) «دکمه تنظیمات در صفحه دسکتاپ» = آیکون کاتالوگی تنظیمات
  (AppTile چرخ‌دنده از رجیستری ۲۷ برنامه) که تا دیروز پنجرهٔ §4.6 placeholder را باز می‌کرد
  (ته‌متِ ثبت‌شده در Stage Summary تسک ۳۵)؛ (۲) اصل مالک «دقیقا یک اطلاعات» به همهٔ
  لانچرهای نرم‌افزار تنظیمات تعمیم یافت — کاشی «تنظیمات» در گرید pinned منوی استارت هم
  همین عیب را داشت و اصلاح شد؛ (۳) نقطهٔ اصلاح، چوک‌آهُن واحد openWindow است تا همهٔ
  ورودی‌ها (آیکون دسکتاپ، منوی استارت، پین تسک‌بار) به «یک نمونهٔ واحد» پنجرهٔ تنظیمات
  برسند (کلیک روی هر ورودی وقتی پنجره باز است همان را فوکوس/unminimize می‌کند — عرف
  ویندوز)؛ (۴) خود آیکون دسکتاپ (گلیف/برچسب/موقعیت گرید) تغییر نکرد — فقط مقصدِ کلیک.
- STORE (src/stores/desktop-store.ts): گارد ابتدای openWindow — اگر kind==="app" و
  appKey==="settings" بود → kind="settings"، appKey=undefined (بازگردانی به پنجرهٔ واقعی
  تنظیمات با کارت «ساختار کسب و کار»؛ dedup موجود kind+appKey نمونهٔ واحد را تضمین
  می‌کند؛ windows پارس نمی‌شود پس نیازی به migrate نیست).
- DESKTOP (src/components/desktop/desktop.tsx): فقط کامنت مرجع بالای activate (رفتار
  onClick/dblclick/منوی راست‌کلیک/لمس همه از activate می‌گذرند و توسط گارد استور
  هدایت می‌شوند). start-menu.tsx و taskbar.tsx تغییر نکردند (خودکار هم‌راستا شدند).
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/. E2E (agent-browser):
  fa/RTL 1440×810 — دابل‌کلیک آیکون دسکتاپ «تنظیمات» → پنجرهٔ واقعی (سرتیتر تنظیمات،
  سکشن زبان/ظاهر + کارت «ساختار کسب و کار …فروشگاه») نه placeholder؛ کلیک کارت →
  زیرصفحهٔ BS (نوار «بازگشت» + درخت ۴ گرهٔ seed + اکشن‌بار)؛ راست‌کلیک «شرکت نمونه» →
  فقط «افزودن زیرشاخه» (گیت Task-33/34 سالم)؛ «بازگشت» → خانهٔ تنظیمات؛ «بستن» →
  باز شدن از پین تسک‌بار → ۱ پنجره؛ دابل‌کلیک دوبارهٔ آیکون دسکتاپ → همچنان ۱ پنجره
  (نمونهٔ واحد)؛ منوی استارت → کاشی گرید «تنظیمات» → همان ۱ پنجره با محتوای واقعی.
  en/LTR: "Business Structure — Manage holding, company, branch, agency and store
  levels"، زیرصفحهٔ "Back" + درخت + "Details". موبایل 390×844: scrollW=clientW=390
  (بدون overflow)، ضربه روی کارت → زیرصفحه با ۴ treeitem و «Back». کنسول پس از reload
  تازهٔ fa/light: 0 خطا/۰ هشدار (فقط info React-DevTools + HMR)؛ page errors=0؛
  dev.log پاک. اسکرین‌شات‌ها: /tmp/t36-1 … /tmp/t36-8.

Stage Summary:
- همهٔ ورودی‌های «تنظیمات» (آیکون دسکتاپ، کاشی گرید منوی استارت، پین تسک‌بار، کاشی
  پیشنهادی منوی استارت) اکنون دقیقاً یک پنجرهٔ واحد با یک محتوا را باز می‌کنند: پنجرهٔ
  واقعی تنظیمات با زیرصفحهٔ «ساختار کسب و کار» (Task 35). placeholder §4.6 برای
  تنظیمات دیگر از هیچ مسیری قابل رسیدن نیست؛ ۲۶ برنامهٔ دیگر کاتالوگ دست‌نخورده.
  اصلاح با یک گارد ۴ خطی در openWindow (تک نقطهٔ حقیقت)؛ بدون کلید i18n جدید، بدون
  تغییر ظاهر آیکون‌ها؛ lint/tsc/E2E/console همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 37
Agent: Z.ai Code (main)
Task: درخواست مالک — «آیکون مدیریت کاربران را در آیکون تنظیمات قرار دهید. مدیریت کاربران از چندین فرم تشکیل شده که سند تحلیل آن ارائه خواهد شد» (انتقال آیکون/لانچر «مدیریت کاربران» به داخل پنجرهٔ تنظیمات؛ محتوای چندفرمی پس از رسیدن سند تحلیل).

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 31-36). §0.5 رعایت شد (بدون build، بدون
  کد تست، بدون رنگ indigo/blue جدید؛ هیچ قابلیتی حذف نشد — جابه‌جایی ورودی با پیشینهٔ
  تأییدشدهٔ Task 35)؛ §1.3 (دو کلید جدید settings.umDesc / settings.umPending در هر ۱۱
  دیکشنری — fa منبع و TS بقیه را الزام کرد؛ عنوان از app.userManagement موجود استفاده شد)
 ؛ §1.4 (شِورون/فلش بازگشت از dir مشتق شد — صفر کلاس فیزیکی جدید)؛ §4.1/§4.5 (کاتالوگ و
  رجیستری DB دست‌نخورده — فیلتر فقط در نمای UI فرانت است؛ نرم‌افزار userManagement با
  appKey/پورت/dbMode خودش در کاتالوگ باقی است)؛ §4.6 (زیرصفحهٔ جدید صفر فرم/فیلد دارد —
  E2E: 0 عنصر input/select/textarea؛ فقط هویت + بنر انتظار)؛ §5.1 (همهٔ تغییرات افزودنی؛
  پنجرهٔ مستقل placeholder و قرارداد آن حفظ شد — فقط از هیچ لانچری قابل رسیدن نیست)؛
  §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) «قرار دادن آیکون در آیکون تنظیمات» = عین الگوی Task 35:
  حذف لانچرهای مستقل (آیکون دسکتاپ + کاشی گرید منوی استارت) و افزودن کارت لانچر در خانهٔ
  تنظیمات + زیرصفحه؛ (۲) چون سند تحلیل نیامده، زیرصفحه طبق §4.6 placeholder است: AppTile
  بزرگ هویت‌دار + عنوان + توضیح + بنر کهربایی «چند فرم — سند تحلیل ارائه خواهد شد» (همان
  زبان بصری بنر انتظار AppPlaceholderWindow)؛ (۳) کارت لانچر از AppTile خودِ
  userManagement استفاده می‌کند (هویت آیکونی که مالک می‌شناسد حفظ شود) نه یک گلیف جدید؛
  (۴) مهاجرت یک‌بارهٔ layout: نسخهٔ persist 1→2 و حذف "userManagement" از pinned/
  iconPositions ذخیره‌شده (به موازیِ حذف "business-structure" در Task 35؛ هر دو مسیر
  v0→2 و v1→2 پوشش داده می‌شود)؛ (۵) بازگردانیِ نوع Task-36 برای openWindow به
  userManagement تعمیم داده نشد (پس از این تسک هیچ مسیر UIای بازش را صدا نمی‌زند؛
  پنجرهٔ مستقل برای سازگاری باقی است).
- DICTIONARIES (src/i18n/dictionaries.ts): ۲ کلید × ۱۱ زبان بعد از settings.bsDesc در هر
  دیکشنری (fa: «مدیریت کاربران، نقش‌ها و سطوح دسترسی سامانه» / «این بخش از چندین فرم
  تشکیل شده است؛ سند تحلیل آن ارائه خواهد شد و فرم‌ها پس از آن پیاده‌سازی می‌شوند.»).
- SETTINGS (src/components/erp/settings-window.tsx): SettingsPage += "user-management"؛
  زیرصفحه با نوار باریک «بازگشت / مدیریت کاربران» (عین الگوی BS) + بدنهٔ placeholder؛
  خانه: کارت لانچر UM بعد از کارت BS با همان استایل کارت‌ها (rounded-xl border-border/70
  bg-card/60 p-4 + شِورون جهت‌دار) و آیکون AppTile.
- SHELL (src/components/desktop/desktop.tsx): فیلتر userManagement از آرایهٔ items آیکون‌
  های دسکتاپ. START MENU (src/components/desktop/start-menu.tsx): همان فیلتر از tiles
  (جستجو هم دیگر آن را نمی‌یابد). STORE (src/stores/desktop-store.ts): version:2 +
  migrate سوشده (retired = business-structure + userManagement).
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/. E2E (agent-browser):
  fa/RTL 1440×810 با localStorage تازه — دسکتاپ ۰ مورد «مدیریت کاربران»؛ پنجرهٔ تنظیمات
  (دابل‌کلیک آیکون) هر دو کارت BS + UM؛ کلیک کارت UM → زیرصفحهٔ «بازگشت / مدیریت کاربران»
  با AppTile بنفش بزرگ + بنر «سند تحلیل…» و 0 فیلد فرم؛ «بازگشت» → خانه؛ منوی استارت:
  جستجوی «مدیریت کاربران» → ۰ کاشی. مهاجرت: seed v1 با پین UM + موقعیت آیکون → پس از
  reload: pinned ["settings"]، iconPositions فقط settings، version:2. en/LTR: کارت
  "User Management — Manage users, roles and system access levels"، زیرصفحه با متن
  انگلیسی انتظار، ۰ فیلد. موبایل 390×844 fa: خانه و زیرصفحه scrollW=clientW=390؛
  (نکته: نمای تعریف‌شدهٔ مرورگر pointer:coarse نیست — دابل‌کلیک). تم تیره: کارت‌ها و
  زیرصفحه خوانا. رگرسیون BS: کارت → درخت ۴ گره + «جزئیات». کنسول پس از reload تازهٔ
  fa/light: 0 خطا/۰ هشدار (فقط info React-DevTools + HMR)؛ page errors=0؛ dev.log پاک.
  اسکرین‌شات‌ها: /tmp/t37-1 … /tmp/t37-9.

Stage Summary:
- «مدیریت کاربران» دیگر هیچ لانچر مستقلی ندارد (نه آیکون دسکتاپ، نه کاشی منوی استارت —
  با مهاجرت یک‌بارهٔ layout ذخیره‌شده). تنها ورودی، کارت لانچر در خانهٔ پنجرهٔ تنظیمات است
  که زیرصفحهٔ placeholder §4.6 را باز می‌کند (هویت AppTile + بنر انتظار سند تحلیل؛ صفر
  فرم/فیلد). کاتالوگ/رجیستری/سرویس‌ها دست‌نخورده؛ پنجرهٔ مستقل placeholder برای سازگاری
  باقی است. وقتی سند تحلیل رسید، فقط بدنهٔ زیرصفحهٔ user-management با فرم‌های واقعی جای-
 گزین می‌شود (نقطهٔ الحاق آمادهٔ §5.1). دو کلید i18n جدید در ۱۱ زبان؛ lint/tsc/E2E/console
  همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 38
Agent: Z.ai Code (main)
Task: درخواست مالک — «یک دکمه در صفحه دسکتاپ قرار دهید که وقتی کاربر روی آن کلیک کرد تمامی آیکون‌هایی که در صفحه دسکتاپ وجود دارد بصورت یک سایدبار با منوی جمع‌شوند و بازشونده بسیار زیبا و جذاب و شیک و کاربرپسند نمایش داده شوند و استایل آیکون تغییر پیدا کند و اگر مجددا روی آن آیکون کلیک کرد سایدبار تبدیل به همین حالتی شود که هر منو بصورت آیکون در صفحه دسکتاپ نمایش داده شود».

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (Tasks 31-37). §0.5 رعایت شد (بدون build، بدون
  کد تست، بدون رنگ indigo/blue جدید؛ هیچ قابلیتی حذف نشد — گرید و سایدبار دو نمایِ همان
  داده‌اند)؛ §1.3 (پنج کلید جدید sidebar.title/toSidebar/toGrid/collapse/expand در هر ۱۱
  دیکشنری — fa منبع و TS بقیه را الزام کرد)؛ §1.4 (جای‌گذاری فقط با insetInlineStart
  منطقی؛ شِورون‌ها و آیکون‌های Panel از dir مشتق شدند — صفر کلاس فیزیکی جدید)؛ §5.1
  (افزودنی محض: state جدید با مقدار پیش‌فرض «grid»؛ بدون migrate — merge ذاتی persist
  کلید غایب را پیش‌فرض نگه می‌دارد؛ partialize افزودنی)؛ §6/§7 DoD کامل.
- §0.6 فرض‌های اعلام‌شده: (۱) «دکمه» = قرص شناور شیشه‌ای (acrylic) بالای تسک‌بار در لبهٔ
  آغازین؛ با باز شدن سایدبار «سوار» لبهٔ آن می‌شود (transition inset-inline-start) تا همیشه
  «همان دکمه» قابل کلیک باشد — طبق خواستهٔ مالک کلیک دوبارهٔ همان دکمه به گرید برمی‌گردد؛
  (۲) «جمع‌شونده/بازشونده» = دو ترازِ درون‌سایدبار: ریل ۶۴px (فقط آیکون + tooltip) و
  بازِ ۲۷۲px (آیکون + برچسب) با دکمهٔ مخصوص در سرستون؛ (۳) «تغییر استایل آیکون» = در
  سایدبار کاشی‌های فشردهٔ h-8 rounded-lg (به‌جای h-12 rounded-2xl گرید) در ردیف‌های
  hover/انتخاب‌دار؛ (۴) سایدبار روی لبهٔ inline-start سنجاق می‌شود و اگر هدر داشبورد همان
  سمت سنجاق باشد با آفست HEADER_THICK+8 از آن فاصله می‌گیرد؛ (۵) حالت نمایش و وضعیت ریل
  در erp.desktop.layout ماندگارند؛ (۶) منوی راست‌کلیک ردیف‌های سایدبار «باز کردن/سنجاق»
  دارد و «بازنشانی چیدمان» (مخصوص گرید آزاد) در سایدبار نمایش داده نمی‌شود.
- STORE (src/stores/desktop-store.ts): نوع IconMode + فیلدهای iconMode/sidebarCollapsed +
  setIconMode/setSidebarCollapsed + partialize (افزودنی؛ نسخهٔ persist همان ۲).
- DESKTOP (src/components/desktop/desktop.tsx): بازگردان DesktopIcons به fragment؛ گرید
  فقط در iconMode==="grid" رندر می‌شود (موقعیت‌ها دست‌نخورده می‌مانند)؛ <aside> شیشه‌ای
  (acrylic-strong/menu-in/win-shadow/rounded-2xl، عرض transition-دار) با سرستون (عنوان +
  Badge تعداد + دکمهٔ ریل) و <nav> اسکرول‌شوندهٔ ۲۸ ردیفی از همان items؛ منوی راست‌کلیک
  مشترک با source:"grid"|"sidebar"؛ دکمهٔ سوییچ شناور با آیکون‌های جهت‌آگاه Panel*/Chevron*.
  DICTIONARIES: ۵ کلید × ۱۱ زبان بعد از settings.umPending.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/. E2E (agent-browser):
  fa/RTL 1440×810 — قرص «نمایش به‌صورت منوی کناری» پایین-راست؛ کلیک → سایدبار x=1160
  (سمت راست RTL)، عرض ۲۷۲، ۲۸ ردیف، سرستون «همهٔ آیتم‌ها» + Badge، گرید از DOM حذف
  (۰ آیکون تکراری)؛ کلیک ردیف «انبار» → پنجره باز شد؛ «جمع کردن منو» → ریل ۶۴px بدون
  برچسب با tooltip ردیف‌ها و سوییچ دقیقاً روی لبه (gap=۸۰=۸+۶۴+۸)؛ «باز کردن منو» → ۲۷۲؛
  کلیک دوبارهٔ سوییچ → گرید با ۲۸ آیکون برگشت؛ persist: reload در حالت ریل → سایدبار ۶۴px
  با iconMode:"sidebar"/collapsed:true؛ راست‌کلیک ردیف ریل → «باز کردن/سنجاق به نوار
  پایین» (بدون بازنشانی چیدمان) → سنجاق «حسابداری» به داک → برداشتن از منوی پین تسک‌بار
  → pinned به ["settings"] برگشت. en/LTR: سایدبار x=8 سمت چپ، "All items"/"Accounting"؛
  موبایل 390×844: عرض ۲۷۲ بدون overflow (scrollW=390)، سوییچ کار می‌کند؛ تم تیره: سایدبار
  ۲۸ ردیف خوانا. کنسول پس از reload تازهٔ fa/light: 0 خطا/۰ هشدار؛ page errors=0؛
  dev.log پاک. اسکرین‌شات‌ها: /tmp/t38-1 … /tmp/t38-10.

Stage Summary:
- دسکتاپ اکنون دو نمایش دارد: گرید کلاسیک آیکون‌ها و سایدبار شیشه‌ای جمع‌شونده/بازشوندهٔ
  ۲۸ آیتمی — با یک دکمهٔ سوییچ شناور که «سوار» لبهٔ سایدبار می‌شود و کلیک دوباره‌اش همان
  چیدمان آیکونی را (با همان موقعیت‌ها) برمی‌گرداند. استایل آیکون‌ها بین دو حالت عوض می‌شود
  (کاشی بزرگ گرید ↔ ردیف فشردهٔ سایدبار)، منوی راست‌کلیک و فعال‌سازی پنجره‌ها یکسان
  می‌ماند، وضعیت نمایش ماندگار است و در fa/en، RTL/LTR، موبایل و تم تیره آزموده شد؛
  lint/tsc/E2E/console همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 39
Agent: Z.ai Code (main)
Task: درخواست مالک — «وقتی روی نمایش آیکون‌ها به‌صورت آیکون در دسکتاپ کلیک می‌کنم آیتم‌ها روی هم قرار می‌گیرند که نامشخص و گنگ است و کاربر باید زمان زیادی بگذارد تا آیکون‌ها را چیدمان کند. وقتی کاربر روی نمایش آیکون‌ها در دسکتاپ کلیک کرد آیکون‌ها به ترتیب بر اساس زبان انتخاب‌شده در سمت راست یا سمت چپ پشت سر هم چیدمان شوند.» — ریشه‌یابی تلنبار آیکون‌ها در بازگشت از سایدبار (Task 38) و چیدمان خودکارِ مرتب‌شدهٔ زبانی.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 38). §0.5 رعایت شد (بدون
  build، بدون کد تست، بدون رنگ indigo/blue جدید؛ هیچ قابلیتی حذف نشد — درگ آزاد، منوی
  راست‌کلیک، «بازنشانی چیدمان» و سایدبار Task 38 همگی سر جایشان‌اند)؛ §1.3 (هیچ کلید
  متنی جدیدی لازم نشد — دکمه‌ها از کلیدهای موجود sidebar.toSidebar/toGrid استفاده
  می‌کنند)؛ §1.4 (هیچ کلاس جهت‌دار جدیدی اضافه نشد — هندسه از defaultPos منطقیِ موجود
  استفاده کرد که از لبهٔ inline-start مشتق است)؛ §5.1 (تغییر persist صفر — از اکشن
  موجود resetIconLayout استفاده شد؛ نسخهٔ erp.desktop.layout همان ۲)؛ §6/§7 DoD کامل.
- ریشه‌یابی: در نمای آزاد، موقعیت هر آیکون = iconPositions[id] ?? defaultPos(i).
  چیدمان‌های میراثِ ذخیره‌شده (یا مواضع کلمپ‌شده پس از تغییر اندازهٔ پنجره) هنگام
  بازگشت از سایدبار عیناً بازگردانده می‌شدند → تلنبار نامفهوم. ضمناً ResizeObserver
  لایهٔ آیکون‌ها یک‌بار در mount وصل می‌شد و پس از unmount/remount دورهٔ سایدبار دیگر
  وصل نمی‌شد (rect کهنه).
- DESKTOP (src/components/desktop/desktop.tsx) — تنها فایل تغییریافته:
  1) مرتب‌سازی زبانی: Intl.Collator(locale, {numeric:true}) روی برچسب آیکون‌ها
     (id به‌عنوان تساوی‌شکن پایدار) — items به useMemo رفت؛ هم گرید هم سایدبار با
     همین ترتیب رندر می‌شوند (fa → الفبای فارسی، en → A-Z، … ×۱۱ زبان).
  2) دکمهٔ سوییچ: بازگشت به نمای آیکونی اکنون resetIconLayout + setIconMode("grid") —
     چیدمان تازه: ستون‌های پشت‌سرهم از لبهٔ آغازین (راست در RTL، چپ در LTR)؛ هیچ
     چیدمان دستیِ کهنه‌ای زنده نمی‌مانَد. درگ دستی درون جلسه همچنان کار می‌کند.
  3) خودترمیمی: در (re)mount گرید یا تغییر هندسهٔ لایه، اگر هر دو آیکون همپوشانی
     مؤثر (84×100) داشته باشند → resetIconLayout؛ درگ‌های دستیِ بدون همپوشانی دست‌نخورده
     می‌مانند؛ re-renderهای معمولی (انتخاب/ghost درگ) این افکت را اجرا نمی‌کنند.
  4) اتصال مجدد ResizeObserver در هر remount گرید (وابستگی iconMode) — رفع rect کهنه.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/. E2E (agent-browser):
  seed تلنبار (۴ آیکون روی هم در ~40,40) → reload → ۲۸ آیکون، overlaps=0،
  sortedOK=true با Intl.Collator("fa") (ابزارهای پیشرفته → اتوماسیون اداری → انبار)،
  ستون آغازین x=1332 = لبهٔ راست (layerW 1424)؛ localStorage iconPositions={} (ترمیم
  ماندگار شد). seed پراکندهٔ بدون‌همپوشانی → reload → مواضع دستی عیناً ماندند (ترمیم
  کاذب رخ نداد) → سوییچ → سایدبار (۲۸ ردیف مرتب fa، x=1160 راست) → سوییچ مجدد
  («نمایش آیکون‌ها روی دسکتاپ») → گرید مرتب تازه، iconPositions={} و آیکون‌های
  پراکنده به اسلات پیش‌فرضِ مرتب رفتند. dblclick «نمونه فرم» → پنجره باز شد (رجرسین
  فعال‌سازی). en/LTR: sortedOK A-Z (Accounting، Advanced Tools، Business Intelligence)،
  ستون آغازین x=8 = لبهٔ چپ؛ سایدبار مرتب با x=8. موبایل 390×844: scrollW=390 بدون
  سرریز، ۲۸ آیکون flow، سایدبار 272px fit، سوییچ دوطرفه سالم. تم تیره: گرید
  ۲۸/۰ همپوشانی/مرتب + سایدبار تیره. کنسول پس از reload تازهٔ light: 0 خطا/0 هشدار؛
  page errors=0؛ dev.log فقط GET 200. هشدار hydration erp-wallpaper روی reload تیره =
  مورد میراث Task 22 (خارج از دامنهٔ این تسک؛ در رکوردهای قبلی هم ثبت است).
  اسکرین‌شات‌ها: /tmp/t39-1 … /tmp/t39-7.

Stage Summary:
- بازگشت از سایدبار به نمای آیکونی دیگر هیچ‌گاه چیدمان تلنبار تولید نمی‌کند: با هر
  کلیک روی «نمایش آیکون‌ها روی دسکتاپ»، هر ۲۸ آیکون به‌ترتیب الفبای زبان فعال
  (fa → الفبای فارسی از سمت راست، en → A-Z از سمت چپ، و همین‌طور ۹ زبان دیگر)
  ستون‌به‌ستون و پشت‌سرهم از لبهٔ آغازین چیده می‌شوند و همین چیدمان ماندگار می‌شود؛
  هیچ چیدمان دستی لازم نیست. چیدمان‌های ذخیره‌شدهٔ معیوب (همپوشان) در بارگذاری
  خودترمیم می‌شوند؛ درگ دستیِ بدون همپوشانی همچنان کار می‌کند و تا سوییچ/ریلود بعدی
  می‌مانَد. سایدبار Task 38 نیز با همان ترتیب زبانی هم‌راستا شد. lint/tsc/E2E/console
  همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 40
Agent: Z.ai Code (main)
Task: درخواست مالک (با تصویر قرصِ متنی دکمهٔ سوییچ) — «عنوان این دکمه را در تولتیپ زیبا نمایش بدهید و فقط دکمه توسط کاربر مشاهده شود» — دکمهٔ سوییچ نمای دسکتاپ فقط تک‌آیکونی شود و عنوانش در تولتیپ نمایش داده شود.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 39). §0.5 رعایت شد (بدون
  build/کد تست/رنگ indigo-blue؛ هیچ قابلیتی حذف نشد — همان دکمه با همان رفتار
  Task 38/39، فقط نمایش تک‌آیکونی شد)؛ §1.3 (هیچ کلید متنی جدیدی لازم نشد — همان
  sidebar.toSidebar / sidebar.toGrid موجود در ۱۱ دیکشنری)؛ §1.4 (جهت تولتیپ از
  DirectionProvider موجود مشتق می‌شود؛ side فیزیکی "top" برای هر دو جهت درست است)؛
  §5.1 (تغییر persist صفر)؛ §6/§7 DoD کامل.
- فرض‌های §0.6: (۱) «فقط دکمه» = دکمهٔ گرد تک‌آیکونی ۴۰×۴۰ (متن درون‌دکمه و
  attribute بومی title حذف شد؛ aria-label برای دسترس‌پذیری ماند)؛ (۲) «تولتیپ زیبا» =
  کامپوننت shadcn/ui Tooltip (radix) با استایل acrylic موجود TooltipContent — قرصی
  (rounded-full px-3.5 font-medium)، side="top" با فاصلهٔ ۱۰px؛ (۳) برچسب تولتیپ با
  حالت عوض می‌شود: در گرید «نمایش به‌صورت منوی کناری» و در سایدبار «نمایش آیکون‌ها
  روی دسکتاپ» (×۱۱ زبان از قبل همگام)؛ (۴) هندسهٔ سواری روی لبهٔ سایدبار و رفتار
  Task 39 (چیدمان تازهٔ مرتب در بازگشت) دست‌نخورده ماند.
- DESKTOP (src/components/desktop/desktop.tsx) — تنها فایل تغییریافته: import
  Tooltip/TooltipTrigger/TooltipContent (TooltipProvider از قبل کل دسکتاپ را می‌پوشاند،
  delayDuration=300)؛ بدنهٔ دکمه در Tooltip/TooltipTrigger asChild پیچیده شد؛ کلاس‌ها
  به h-10 w-10 justify-center ساده‌سازی شد (حذف gap/px-3/max-w/متن شرطی)؛ حذف title
  بومی؛ TooltipContent با برچسب وابسته به iconMode.
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src (فقط خطاهای
  پیش‌موجود skills/ بیرون از src). E2E (agent-browser): fa/light 1440×810 — دکمه
  ۴۰×۴۰، متن داخلی ""، بدون title، aria-label درست؛ hover موس واقعی → یک
  [role=tooltip] با متن «نمایش به‌صورت منوی کناری» بالای دکمه (y تولتیپ ۶۶۶..۶۹۶ <
  y دکمه ۷۰۶)؛ کلیک → سایدبار باز، aria-label → «نمایش آیکون‌ها روی دسکتاپ»، hover →
  تولتیپ با متن جدید؛ کلیک مجدد → گرید ۲۸ آیکون/۰ همپوشانی. en/LTR: تولتیپ «Show as
  sidebar menu» بالای دکمه، عرض دکمه ۴۰. موبایل 390×844: بدون سرریز (scrollW=390)،
  دکمه fit، کلیک → سایدبار؛ mode در persist ماندگار و پس از reload سالم بازگشت.
  کنسول پس از reload تازه (light/fa): 0 خطا/0 هشدار؛ page errors=0؛ dev.log فقط
  GET 200. اسکرین‌شات‌ها: /tmp/t40-1 … /tmp/t40-4.

Stage Summary:
- دکمهٔ سوییچ نمای دسکتاپ اکنون یک دکمهٔ گرد شیشه‌ایِ تک‌آیکونی است (فقط دکمه — بدون
  متن و بدون تولتیپ بومی مرورگر) و عنوان آن در تولتیپ شیشه‌ای زیبای shadcn/ui بالای
  دکمه ظاهر می‌شود؛ برچسب تولتیپ با جهت زبان و حالت نمایش (گرید/سایدبار) به‌درستی
  عوض می‌شود، رفتار Task 38/39 (سوییچ + چیدمان مرتب زبانی) و موبایل/تیره سالم ماند؛
  lint/tsc/E2E/console همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 41
Agent: Z.ai Code (main)
Task: درخواست مالک — «من فایل بک آپ داشتم. سورس و بانک اطلاعاتی را از فایلی که برات فرستادم بازیابی کنید» — بازیابی کامل سورس و دیتابیس از farataraz-backup-20261023-2329.

Work Log:
- جستجوی مجدد فایل‌سیستم: فایل zip خودِ بک‌آپ یافت نشد (شاید پاک شده باشد) اما محتوای
  استخراج‌شدهٔ آن در /tmp/farataraz-restore سالم بود — BACKUP-INFO.txt تاریخ ایجاد
  2026-10-23 ساعت 23:29 (Asia/Tehran) را تأیید می‌کند؛ نسخهٔ 0.16 «erp-rebuild».
- محتوای بک‌آپ: src/ کامل، mini-services (_shared، settings-service :3001، apps-service
  :3002)، db/custom.db (SQLite)، package.json/bun.lock/tsconfig و بقیهٔ کانفیگ‌ها،
  AGENTS.md، worklog.md (تا Task 40)، download/ (اسکرین‌شات‌های E2E)، .env ریشه و
  .env هر دو سرویس (INTERNAL_API_KEY + DATABASE_URL=file:/home/z/my-project/db/custom.db).
- ایمنی: معماری قبلی (۱۳ سرویس) در تاریخچهٔ گیت زیر commit های auto-checkpoint
  (46434a0، 67786cb روی 3baf457) محفوظ است و هر زمان قابل بازیابی است.
- بازیابی قبلاً در انتهای جلسهٔ قبل انجام شده بود؛ در این جلسه صحت آن با
  diff -rq کامل (EXIT:0، بدون هیچ تفاوتی به‌جز node_modules/.git/dist) تأیید شد.
- bun install در ریشه + settings-service + apps-service؛ bunx prisma generate برای
  settings-service (کلاینت روی اسکیمای دیتابیس بک‌آپ ساخته شد).
- راه‌اندازی: settings-service :3001 (Prisma وصل؛ AppRegistry سینک شد: 27 اپ،
  0 تغییر — یعنی دیتابیس بک‌آپ با کاتالوگ کد هم‌خوان است) و apps-service :3002
  (health: 26 hostedApps از 27 catalogApps)؛ Next dev :3000 (GET / 200).
- E2E (agent-browser، 1440×810): دسکتاپ با ۲۸ آیکون کامل (ابزارهای پیشرفته تا هوش
  تجاری) + دکمهٔ سوییچ سایدبار Task 40 + تسک‌بار؛ dblclick «تنظیمات» → پنجرهٔ تنظیمات؛
  کلیک «ساختار کسب و کار» → درخت با داده‌های واقعی دیتابیس بازیابی‌شده (دفتر مرکزی →
  شرکت نمونه → شعبه اصفهان، شعبه شیراز) و پنل جزئیات — یعنی سورس و DB هر دو سالم.
- خطاها: page errors=0، console error=0؛ dev.log فقط GET 200 (app-registry،
  business-structure). موبایل 390×844: scrollW=390 بدون سرریز.
- اسکرین‌شات‌ها: /tmp/restore-1-desktop.png، restore-2-settings.png، restore-3-bs.png،
  restore-4-mobile.png، restore-5-final.png.

Stage Summary:
- پروژهٔ FaraTaraz (نسخهٔ 0.16 erp-rebuild) عیناً از بک‌آپ 2026-10-23-2329 بازیابی شد:
  سورس کامل Next.js + دو سرویس NestJS (settings :3001، apps :3002) + دیتابیس
  db/custom.db با تمام داده‌ها (۲۷ اپ رجیستری، ساختار کسب‌وکار با شعب اصفهان/شیراز).
  هر سه پروسه در حال اجرا و E2E تأییدشده است. معماری ۱۳-سرویسهٔ جدیدتر در گیت
  (3baf457) نگهداری می‌شود.

---
Task ID: 42
Agent: Z.ai Code (main)
Task: درخواست مالک — «روی صفحه دسکتاپ یک آیکون عمومی اضافه کنید» — افزودن نرم‌افزار «عمومی» به کاتالوگ و دسکتاپ.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 41 — بازیابی از بک‌آپ).
  §0.5 رعایت شد (هیچ قابلیتی حذف نشد؛ build/کد تست/رنگ indigo-blue صفر)؛ §1.4
  (هیچ کلاس جهت‌دار جدیدی لازم نشد)؛ §5.1 (تغییر فقط افزودنی است)؛ §6/§7 کامل.
- فرض‌های §0.6: (۱) «عمومی» = بیست‌وهشتمین نرم‌افزار کاتالوگ با appKey "general" و
  order 29 (شماره‌گذاری بدون ۱۳ حفظ شد)؛ (۲) میزبان apps-service مثل ۲۶ اپ دیگرِ
  غیرتنظیمات — چون endpointهای placeholder (/meta، /health، /integrations/status)
  آنجاست و مسیر ارتقا به سرویس مستقل (§4.4) باز می‌ماند؛ (۳) طبق §4.6 پنجرهٔ
  placeholder استاندارد (بدون فرم/جدول تا رسیدن سند تحلیل)؛ (۴) ترجمه‌های ۱۰ زبان
  غیرفارسی انتخاب عامل بود (fa=عمومی, en=General, tr=Genel, ar=عام, hi=सामान्य,
  ps=عمومي, ckb=گشتی, pt=Geral, ko=일반, fr=Général, zh=通用)؛ (۵) اعداد توصیفی
  «۲۷ نرم‌افزار» در کامنت کاتالوگ/آینهٔ فرانت و §4.1 و جدول پورت‌های AGENTS.md به ۲۸
  (و میزبان ۲۶→۲۷) به‌روز شد.
- تغییرات (۳ فایل کد + ۱ سند):
  1) mini-services/_shared/app-catalog.ts — ردیف { appKey:"general", order:29,
     titleFa:"عمومی", titleKey:"app.general", iconKey:"boxes", appGroup:"platform",
     port:3002, dbMode:"shared", host:"apps-service" } (§4.1 منبع واحد حقیقت).
  2) src/lib/app-catalog.ts — ردیف همان در FRONTEND_APPS + APP_ICONS با آیکون
     lucide Boxes و گرادیان from-fuchsia-600 to-rose-700 (بدون indigo/blue).
  3) src/i18n/dictionaries.ts — کلید "app.general" در هر ۱۱ دیکشنری (fa مرجع؛
     TS شکل کلیدها را قفل می‌کند).
  4) AGENTS.md — به‌روزرسانی اعداد توصیفی §4.1 و جدول پورت‌ها.
- بدون تغییر در desktop.tsx: آیکون‌ها از رجیستری DB می‌آیند (store →
  /api/settings/app-registry)؛ نمای گرید، سایدبار Task 38، چیدمان مرتب زبانی Task 39
  و تولتیپ Task 40 خودکار آیکون جدید را شامل شدند. BFF (/api/[app]/…) هم appKey
  ناشناخته را خودکار به apps-service می‌فرستد — صفر تغییر.
- راه‌اندازی مجدد هر دو سرویس: boot-sync اجرا شد → «AppRegistry synced (28 apps…)»
  و «Systems synced from APP_CATALOG (total 28…)»؛ ردیف general با isEnabled=true و
  Version=2 (§2.5 rowversion) در DB ثبت شد.
- Verification: curl /api/settings/app-registry → 28 آیتم شامل general؛
  /api/general/integrations/status → overall:"ok"، signed، 7ms. E2E (agent-browser):
  دسکتاپ fa/RTL 1440×810 → دکمهٔ «عمومی» روی گرید (مجموع ۲۹ آیکون = ۲ دمو + ۲۷ کاتالوگ
  منهای userManagement)؛ dblclick → پنجرهٔ placeholder با heading «عمومی»، چیپ‌های
  «پورت سرویس» و «پایگاهدادهٔ اشتراکی»، بنر «در انتظار سند تحلیل» و وضعیت اتصال سبز
  (ms). سایدبار: ۲۹ ردیف شامل «عمومی». en/LTR: آیکون "General" و عنوان پنجره "General".
  موبایل 390×844: scrollW=390 بدون سرریز و آیکون حاضر. زبان به fa برگردانده شد.
  bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src (فقط خطای پیش‌موجود skills/ خارج
  از دامنه). page errors=0؛ dev.log فقط GET 200 (شامل /api/general/integrations/status).
  اسکرین‌شات‌ها: /tmp/general-1-window.png، general-2-sidebar.png،
  general-3-english.png، general-4-english-window.png، general-5-mobile.png،
  general-6-final-fa.png.

Stage Summary:
- آیکون «عمومی» روی دسکتاپ اضافه شد — به‌صورت بیست‌وهشتمین نرم‌افزار کاتالوگ (§4.1)
  نه آیکون محلی: با DB-driven AppRegistry همگام است، در گرید، سایدبار، منوی استارت و
  پنجرهٔ placeholder با وضعیت زندهٔ اتصال امن مش سرویس‌ها کار می‌کند، در هر ۱۱ زبان
  برچسب دارد و در RTL/LTR و موبایل سالم است. وقتی سند تحلیل «عمومی» برسد، طبق §4.6
  همین appKey به فرم/بک‌اند واقعی ارتقا می‌یابد (و در صورت نیاز به سرویس مستقل §4.4).
  lint/tsc/E2E/console همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 43
Agent: Z.ai Code (main)
Task: درخواست مالک — «در فایل AGENTS.md یک قانون اضافه کنید…» — افزودن دو قانون حفاظتی گفت‌وگو به §0.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 42). تغییر فقط-سند است؛
  هیچ تغییری در سورس/دیتابیس لازم نبود و انجام نشد؛ §0.4 (درخواست صریح مالک در
  اولویت) و §6 رعایت شد.
- AGENTS.md §0 — دو بند بعد از §0.6 اضافه شد:
  - §0.7 (قانون حالت راهنمایی): استفاده از کلمات «راهنمایی»، «مشاوره» یا «توضیح»
    در چت = فقط پاسخ اطلاعاتی؛ تا تأیید مالک با «بلی» یا «Yes» هیچ تغییری در سورس
    یا بانک اطلاعاتی مجاز نیست (حتی اصلاح جزئی).
  - §0.8 (قانون حذف مخرب): هر درخواستی که مستلزم حذف کلی سورس یا بانک اطلاعاتی
    باشد، موظف است عبارت دقیق «حذف کل سورس» (و در صورت شمول، «حذف کل بانک
    اطلاعاتی») را صریحاً به مالک اعلام کند؛ حذف فقط با تأیید «بلی» یا «Yes»
    انجام می‌شود؛ بدون تأیید ممنوع.
- Verification: بازخوانی §0 پس از ویرایش — هر دو بند در جای درست، سبک و شماره‌گذاری
  سازگار با سند؛ بدون تغییر کد → بدون نیاز به lint/E2E.

Stage Summary:
- دو قانون حفاظتی مالک‌محور جزء پروتکل اجباری ایجنت‌ها شد (§0.7 حالت راهنمایی،
  §0.8 حذف مخرب با تأیید صریح) — از این پس برای همهٔ ایجنت‌های این مخزن الزامی است.

---
Task ID: 45
Agent: Z.ai Code (main)
Task: درخواست مالک (پس از مشاورهٔ تأییدشده با «بلی») — چک‌باکس «استفاده از داده‌های مشترک دفتر مرکزی» باید واقعاً داده‌ها را حاکم کند؛ افزودن فیلدهای ارث‌بری ۱۲گانه به تمامی جداول + کلاس پایهٔ AppBaseEntity که همهٔ انتیتی‌ها از آن ارث بری کنند.

Work Log:
- §0.1: AGENTS.md (از جمله §0.7/§0.8 جدید) + worklog بازخوانی شد (آخرین رکورد: Task 44 —
  مشاوره). §0.4: مالک با «بلی» تأیید کرد → اجرا مجاز شد؛ §0.5 (بدون حذف قابلیت/کد تست/
  build/رنگ indigo-blue)؛ §0.6 فرض‌های اعلام‌شده: تاریخ/زمان شمسی رشته‌ای به وقت تهران،
  جداول پلتفرمی مستثنا (تأیید پرسش ۲ مشاوره)، منبع حقیقت = چک‌باکس گرهٔ ریشه، چک‌باکس
  فقط روی سرشاخهٔ اصلی، بازیگر پیش‌فرض "system" تا رسیدن IAM؛ §2.3–§2.6/§5.1/§6/§7 رعایت.
- مطالعهٔ وضعیت موجود: UI (bs-window.tsx) چک‌باکس را فقط در شاخهٔ isRoot نشان می‌دهد؛
  سرویس (business-structure.service.ts) در مسیر update غیر-ریشه اصلاً isBasicInfoShared
  نمی‌پذیرد، create همیشه false می‌سازد و ریشه به‌صورت تراکنشی به Setting
  bs.shareHeadquarterData آینه می‌شود → نامتقارنی «اشتراک فقط از ریشه» از قبل برقرار
  بود (بدون تغییر کد، با E2E اثبات شد).
- ۱) mini-services/_shared/app-base-entity.ts (جدید، بدون وابستگی تا سرویس‌های آیندهٔ
  §4.4 هم استفاده کنند): APP_BASE_FIELDS (۱۲فیلد)، HEAD_OFFICE_NODE_ID=1n،
  AppBaseActor/AppBaseEntityFields/SYSTEM_ACTOR، ساعت شمسی تهران بدون وابستگی
  (gregorianToJalali استاندارد + tehranNowParts با Intl timeZone Asia/Tehran)،
  appBaseOnCreate/appBaseOnUpdate (audit هرگز دستی-کاربر نیست؛ Version به §2.5
  واگذار شد تا دوبامپ نشود)، baseDataScopeWhere (تنها پیاده‌سازی قرارداد اشتراک:
  scope-off → فقط زنجیرهٔ خود کاربر؛ scope-on → + رکوردهای مالک ریشه).
- ۲) settings-service/prisma/schema.prisma — قالب اجباری ۱۲فیلدی با نگاشت میراث
  PascalCase (Creator/CreationDate/…/BusinessStructureRef/CompanyRef/BranchRef/
  AgencyRef/ShopRef) به‌صورت کامنت مرجع برای «هر» مدل عملیاتی آینده + الزام ثبت مدل
  در VERSIONED_MODELS (کامنت خالص؛ اسکیما/DB تغییر نکرد — جداول عملیاتی هنوز وجود
  ندارند چون §4.6 تا رسیدن سند تحلیل جدول عملیاتی ممنوع است؛ به محض نخستین جدول،
  بلوک ۱۲فیلدی + AppBaseEntity با آن زاده می‌شود).
- Verification: دودی ماژول: tehranNowParts=14050802/ساعت تهران، jalali(2026-10-23)=
  1405/8/1 و jalali(2025-03-21)=1404/1/1 (Nowruz ✓)، onCreate/onUpdate/scope درست.
  E2E (agent-browser): فرم ریشه «دفتر مرکزی» → تیک «استفاده از داده‌های مشترک دفتر
  مرکزی» → ذخیره → PUT 200 و API: isBasicInfoShared=true، Version 6→7 (§2.5)؛ بازگشت
  تیک → ذخیره → false، Version 8 (وضعیت اولیهٔ دادهٔ مالک حفظ شد). فرم «شرکت نمونه»:
  چک‌باکس اشتراک وجود ندارد (hasShare=false) ✓. en/LTR: «Use shared headquarters
  data» + Holding/Company/Branch/Agency/Store فقط روی ریشه ✓؛ موبایل 390×844 بدون
  سرریز؛ زبان به fa/RTL برگشت؛ page errors=0، console error=0؛ dev.log فقط GET/PUT 200.
  bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src/mini-services (فقط skills/ خارج از
  دامنه). اسکرین‌شات‌ها: /tmp/share-1-on.png، share-2-company.png، share-3-english.png.

Stage Summary:
- قرارداد ارث‌بری مالک‌محور مستقر شد: کلاس پایهٔ AppBaseEntity در _shared با ساعت شمسی
  تهران، پرکننده‌های خودکار audit و تک‌پیاده‌سازیِ منطق اشتراک (baseDataScopeWhere) —
  از این پس هر جدول عملیاتی (با رسیدن سند تحلیل §4.6) با بلوک ۱۲فیلدیِ قالبِ ثبت‌شده در
  اسکیما و همین کلاس زاده می‌شود؛ رفتار چک‌باکس ریشه در UI/API/پایداری/۱۱ زبان/موبایل
  E2E-تأیید شد و دادهٔ مالک به حالت اولیه برگشت. lint/tsc/E2E/console همگی پاک؛ ثبت در
  worklog انجام شد.

---
Task ID: 45
Agent: main (Z.ai Code)
Task: فرمساز حرفه‌ای در «ابزارهای پیشرفته» — سرویس مستقل dfb-service با اسکیمای Dfb، درختوارهٔ فرم‌ساز، جادوگر ایجاد فرم (قالب/هدر/بدنه/فوتر/فیلدها/تب)، کوئری‌ساز whitelist، آیکون‌های کاربر روی دسکتاپ، runtime فرم‌ها و فیلد الحاقی فرم‌های سیستمی (درخواست مالک، §0.7 مشاوره → «بلی»)

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 44). §0.6 فرض‌های ۵گانهٔ مشاوره هنگام شروع دوباره اعلام شد؛ §0.5/§2.x/§4.x/§5.1/§6/§7 رعایت.
- فاز ۱ — زیرساخت: mini-services/dfb-service (پورت 3003، NestJS+bun، الگوی settings-service) با db/dfb.db اختصاصی؛ Prisma schema با ۹ مدل (IDGeneration + DfbMenu/DfbForm/DfbFormTab/DfbFormField/DfbQuery/DfbQueryField/DfbFormData/DfbFormDataValue) — همه با بلوک اجباری ۱۲فیلدی AppBaseEntity (PascalCase §2.6)، بدون autoincrement (§16)، JSONها به‌صورت رشته (§2.3)؛ VERSIONED_MODELS کامل (§2.5)؛ IdGenerationService + TABLE_REGISTRY؛ InternalAuthGuard §4.2؛ seed idempotent: ۲۸ نرم‌افزار کاتالوگ → گره آیکون سیستمی (AppKey=appKey) + فرم سیستمی gnr.businessStructure زیر «عمومی» (رجیستری SYSTEM_FORMS برای فرم‌های سیستمی آینده).
- فاز ۲ — API: menus/tree+CRUD (گره سیستمی فقط IsActive، گاردهای حذف)، forms CRUD با تب/فیلد تو در تو (replace تراکنشی)، add-field روی فرم سیستمی → IsCustom=true، form-data ذخیره/خواندن EAV (upsert per value)، queries CRUD + execute فقط-خواندنی با QUERY_TABLES whitelist (ریموت: BusinessStructure/Systems از settings-service با §4.2 امضا + keyMap؛ لوکال: DfbMenu) — بدون SQL آزاد کاربر.
- فاز ۳ — مش: کاتالوگ (تک‌منبع §4.1) advancedTools → port 3003/host dfb-service (host union + DFB_SERVICE_PORT)؛ BFF HOST_BY_APP + advancedTools؛ آینهٔ فرانت port/dbMode؛ AppRegistry روی بوت ری‌سینک شد (Port=3003/Host=dfb-service)؛ AGENTS.md جدول پورت‌ها + apps-service میزبان ۲۶.
- فاز ۴ — فرانت: stores/dfb-store (tree/userIcons + dfbApi + helpers)؛ FormBuilderWindow (پوستهٔ SimpleTreeForm + روبان افزودن آیکون اصلی/مدیریت کوئری‌ها + ویرایش در پنل جزئیات با pendingEdits بدون setState-in-effect)؛ دیالوگ‌ها (منو با IconPicker، جادوگر ۳مرحله‌ای: کارت‌های قالب ساده/درختی → هدر/فوتر/تب‌ها → فیلدها با نوع/عرض/اجباری/اتصال کوئری، کوئری‌ساز، افزودن فیلد) — بدنه‌ها به‌صورت شرطی mount می‌شوند تا state با remount ریست شود؛ DfbMenuWindow (پنجرهٔ آیکون کاربر: زیرمنو + فهرست فرم)؛ DfbFormRuntime (رندر SimpleFormTwoRowTabbed/SimpleTreeForm از تعریف DB + گزینه‌های select از کوئری با نگاشت هوشمند ستون + ذخیرهٔ EAV + فهرست رکوردها)؛ دسکتاپ: WindowKind +dfb-builder/dfb-menu/dfb-form، redirect advancedTools→dfb-builder (الگوی settings)، merge آیکون‌های کاربر در grid/سایدبار/منوی شروع/تسک‌بار (مرتب‌سازی الفبایی مخلوط — پیش‌فرض تأییدشده)، CHROMELESS_KINDS برای پوسته‌های فرم، getIconKeyGlyph در app-catalog.
- i18n: ۹۳ کلید dfb.* × ۱۱ زبان (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh) با اسکریپت anchor-based؛ لینت/تایپ‌چک خالص.
- رفع اشکال حین E2E: (۱) نشت DATABASE_URL از شل → prisma/db و اجرای سرویس با مقدار صریح (custom.db دست‌نخورده ماند)؛ (۲) whitelist ValidationPipe پراپرتی‌های بدون دکوراتور را حذف می‌کرد → @IsObject/@ValidateNested برای values/header/footer؛ (۳) ReferenceError IsObject → ایمپورت؛ (۴) runRemote به table.keyMap ارجاع می‌داد با پارامتر string → امضای runLocal/runRemote به QueryableTable؛ (۵) نگاشت PascalCase↔camelCase برای کوئری لوکال/ریموت؛ (۶) forms.create خودِ item را برمی‌گرداند نه {item} → WizardBody؛ (۷) forms tree: byParent.get(menuRef) فرزندان را می‌داد → nodeById map؛ (۸) react-hooks/set-state-in-effect ×۸ → remount-keyed bodies + pendingEdits + FormDetailPanel/RuntimInner کلیددار؛ (۹) گزینهٔ خالی select → نگاشت valKey/labelKey هوشمند.
- E2E (agent-browser): builder باز شد (روبان + درخت ۲۸ آیکون + فرم سیستمی)؛ ایجاد آیکون «پورتال فروش» → درخت ✓ دسکتاپ ✓؛ ایجاد کوئری «شرکت‌های ساختار» از جدول BusinessStructure ✓؛ ایجاد فرم «مشتری پورتال» با جادوگر (قالب ساده، برچسب هدر، دکمه‌های فوتر، فیلد اجباری + فیلد select متصل به کوئری) ✓؛ پنجرهٔ آیکون کاربر از دسکتاپ → فهرست فرم → runtime ✓؛ select گزینه‌های ریموت (دفتر مرکزی/شرکت نمونه/…) ✓؛ ذخیره → toast + EAV در dfb.db (FormData+2 Value) + فهرست رکورد ✓؛ فیلد الحاقی «کد پرسنلی» روی فرم سیستمی (IsCustom=true، نشان الحاقی) ✓؛ en/LTR کامل (Form Builder/Add Main Icon) ✓؛ موبایل 390×844 بدون سرریز ✓؛ page errors=0، console error=0؛ dev.log فقط 200/201.
- پاکسازی: داده‌های آزمون حذف شد (فیلد الحاقی/فرم ۳/کوئری/آیکون) → dfb.db تمیز (۰ کاربر آیکون، ۱ فرم سیستمی، ۰ کوئری، ۰ رکورد)؛ lint → 0؛ tsc → 0 خطای src/mini-services (skills/ و examples/ خارج از دامنه).

Stage Summary:
- فرمساز مالک‌محور مستقر شد: اسکیمای Dfb روی سرویس مستقل 3003 (نخستین ارتقای §4.4 با dbMode اختصاصی)، درختواره‌ای که هم آیکون‌های سیستمی (کاتالوگ-driven) و هم فرم‌های سیستمی (SYSTEM_FORMS) را به‌تفکیک نشان می‌دهد و افزودن فیلد به آن‌ها را ممکن می‌کند؛ آیکون‌های کاربر بلافاصله در grid/سایدبار/منوی شروع/تسک‌بار ظاهر می‌شوند و فرم‌ها با هدر/بدنه/فوتر تعریف‌شده، فیلدهای متصل به کوئری و ذخیرهٔ EAV اجرا می‌شوند. قرارداد ۱۲فیلدی AppBaseEntity روی همهٔ جداول Dfb فعال است. مکانیزم ثبت فرم‌های سیستمی آینده = افزودن به SYSTEM_FORMS در seed. lint/tsc/E2E/۱۱ زبان/موبایل همگی پاک.

---
Task ID: 46
Agent: main (Z.ai Code)
Task: درخواست مالک — «برای فرم‌ساز در منوی ابزارهای پیشرفته یک فرم ایجاد کنید؛ وقتی کاربر روی فرم کلیک کرد فرم‌ساز و درختواره نمایش داده شود؛ منوی ابزارهای پیشرفته ممکن است فرم‌های دیگری هم در آینده به آن اضافه گردد» — پنجرهٔ منوی فرم‌های advancedTools با فرم سیستمی راه‌انداز «فرمساز».

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 45). §0.4: درخواست صریح مالک؛ §0.6 فرض‌های ۴گانه دوباره اعلام شد (منوی فرم‌ها به‌جای پرش مستقیم، فرم راه‌انداز سیستمی، افزوده‌شدن خودکار فرم‌های آینده، عنوان‌های locale-آگاه)؛ §0.5/§2.3/§2.6/§4.1/§6/§7 رعایت.
- زیرساخت (dfb-service): SYSTEM_FORMS += {systemKey: "dfb.formBuilder", anchorAppKey: "advancedTools", code: "FB", titleFa: «فرمساز», titleEn: "Form Builder", componentKey: "dfb-builder"} — seed idempotent بوت، فرم سیستمی راه‌انداز زیر گرهٔ سیستمی advancedTools؛ ComponentKey="dfb-builder" در whitelist فرم‌های کاربر مجاز نیست (فقط دو قالب واقعی) → راه‌انداز صرفاً سیستمی می‌ماند.
- desktop-store: redirect (app, advancedTools) → kind "dfb-menu" با appKey "app:advancedTools" (پنجرهٔ منوی فرم‌ها)؛ همهٔ نقاط ورود (آیکون دسکتاپ/گرید، سایدبار، منوی استارت، پین تسک‌بار) از openWindow می‌گذرند و خودکار پوشش داده می‌شوند.
- desktop.tsx resolveWindowMeta: پشتیبانی از ارجاع "app:<appKey>" (یافتن گرهٔ ریشه با appKey از درخت dfb؛ تا لود درخت، برچسب/آیکون از کاتالوگ — بدون پرش عنوان)؛ پارامتر locale؛ عنوان‌های dfb-menu/dfb-form با هلپرهای locale-آگاه؛ به‌روزرسانی کامنت dfb-builder.
- dfb-store: هلپرهای dfbFormTitle/dfbNodeTitle (گره سیستمی با appKey → برچسب ۱۱زبانهٔ کاتالوگ §1.3؛ فرم/گره کاربر → title (fa) / titleEn (en)) + findMenuNodeByAppKey.
- dfb-menu-window: پراپ menuRef رشته‌ای ("42" | "app:advancedTools")؛ مسیریابی راه‌انداز — ComponentKey="dfb-builder" → openWindow("dfb-builder")، بقیهٔ فرم‌ها → runtime (dfb-form)؛ آیکون آجری کهربایی برای راه‌انداز؛ عنوان‌های breadcrumb/کاشی زیرمنو/ردیف فرم‌ها locale-آگاه؛ بدنهٔ منو data-driven است → فرم‌های آیندهٔ advancedTools (سیستمی از SYSTEM_FORMS یا کاربرساز از فرمساز زیر همین گره) بدون تغییر کد در همین لیست ظاهر می‌شوند.
- form-builder-window: برچسب‌های درخت و عنوان جزئیات با هلپرهای locale-آگاه (درخت در en: "Form Builder" زیر "Advanced Tools").
- restart dfb-service (pid قبلی kill؛ اجرای orphan با DATABASE_URL صریح file:/home/z/my-project/db/dfb.db — درس worklog: نشت DATABASE_URL شل)؛ فرم راه‌انداز با ID=5 زیر گرهٔ 16 ثبت شد (تأیید BFF: menus/tree).
- Verification: bun run lint → 0؛ bunx tsc --noEmit → 0 خطای src. E2E (agent-browser، fa/RTL 1440×810): dblclick «ابزارهای پیشرفته» → پنجرهٔ منو با بخش «فرم‌ها» و ردیف «فرمساز / FB / فرم سیستمی» (آیکون آجری کهربایی)؛ کلیک → پنجرهٔ «فرمساز» (ریبون + درخت ۲۸ آیکون؛ «ابزارهای پیشرفته» باز با فرزند «فرمساز»)؛ انتخاب گره → پنل جزئیات (عنوان/عنوان لاتین/کد FB/منتشر شده/سیستمی/افزودن فیلد). en/LTR: آیکون "Advanced Tools" → منو "Advanced Tools" با ردیف "Form Builder / FB / System form"؛ کلیک → فوکوس پنجرهٔ موجود (dedup، شمار پنجره‌ها ۲→۲)؛ درخت "Form Builder" زیر "Advanced Tools"؛ جزئیات "Form: Form Builder". موبایل 390×844: scrollW=390 بدون سرریز. page errors=0؛ console error=0؛ dev.log پس از ری‌استارت فقط 200 (سه 502 /queries فقط در پنجرهٔ کوتاه ری‌استارت سرویس بود). زبان به fa/RTL برگشت. اسکرین‌شات‌ها: /tmp/dfb46-1…9.

Stage Summary:
- «ابزارهای پیشرفته» حالا یک منوی فرم واقعی دارد: کلیک روی آیکون → پنجرهٔ منوی فرم‌ها؛ فرم سیستمی «فرمساز» راه‌اندازِ پنجرهٔ فرمساز + درختواره است؛ فرم‌های آیندهٔ این منو (سیستمی/کاربرساز) خودکار به همان لیست اضافه می‌شوند. گره‌ها/فرم‌ها در همهٔ پنجره‌ها (منو، درخت، عنوان پنجره) locale-آگاه نمایش داده می‌شوند (کاتالوگ ۱۱زبانه برای گره‌های سیستمی، title/titleEn برای فرم‌ها). lint/tsc/E2E/موبایل/کنسول همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 47
Agent: main (Z.ai Code)
Task: درخواست مالک (با ماکت تصویری) — «وقتی کاربر اطلاعات فرم جدید را وارد کرد استودیوی طراحی فرم باز شود و در استودیو بتواند فیلدهای موردنظر را اضافه کند؛ کاملاً پیشرفته، حرفه‌ای، شیک و جذاب با امکانات کاربرپسند» — استودیوی طراحی فرم WYSIWYG.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 46). §0.4: درخواست صریح مالک؛ §0.6 فرض‌های ۶گانه اعلام شد (پنجرهٔ مستقل dfb-studio پس از ثبت اطلاعات، «بانک اصلی»=فیلدهای بدون تب + بانک‌های بعدی=DfbFormTab، ذخیرهٔ استایل در headerJson.style، پالت‌های رنگ بدون آبی/نیلی طبق §0.5، انتقال مرحلهٔ ۳ جادوگر به استودیو=ارتقا نه حذف، رندر وفادار date/textarea در runtime)؛ §0.5/§1.4/§2.3/§6/§7 رعایت.
- سرویس: forms.dto.ts — FormStyleDto جدید (theme/titleSize/font با اعتبارسنجی تو در تو @ValidateNested) داخل FormHeaderDto.style؛ whitelist ValidationPipe دیگر استایل را نمی‌تراشد (ری‌استارت dfb-service pid 23725).
- پوسته‌ها: SimpleFormTwoRowTabbed و SimpleTreeForm — سه هوک اختیاری Task-47 (headerClassName/titleClassName/bodyStyle با cn/twMerge → override تم)؛ FieldCell (form-primitives) دو نوع جدید date (ورودی LTR با الگوی YYYY/MM/DD + آیکون تقویم) و textarea (جعبهٔ چندخطی) + گسترش SimpleFormFieldType؛ runtime (dfb-form-runtime) نگاشت date/textarea و اعمال تم ذخیره‌شده از header.style (design==run).
- src/lib/dfb-theme.ts (جدید): DFB_THEME_HEADER/DFB_THEME_SWATCHES (teal/emerald/amber/violet/rose)، DFB_TITLE_SIZE، DFB_FONT_FAMILY و dfbShellTheme — تک‌منبع استایل بین بوم استودیو و runtime.
- استودیو (src/components/erp/form-builder/dfb-studio.tsx ~1370 خط): تولبار (نشان قالب/کد، مشخصات پایه و متا دیالوگ، Undo/Redo با تاریخچهٔ ۶۰اسنپ‌شات، پیش‌نمایش eye، ذخیرهٔ قالب با dirty-gate، خروج با گارد تغییرات)؛ بوم = پوستهٔ زندهٔ فرم (سربرگ تم، کاشی‌های فوتر، کانتینرهای بانک خط‌چین با شمار فیلد و chip ۱۰۰٪، کارت فیلدها با #ترتیب/آیکون نوع/کنترل بالا-پایین-حذف/انتخاب، نوار «افزودن بانک جدید»)؛ ریل تنظیمات = جعبه‌ابزار ۷نوعی (کلیک=افزودن به بانک فعال، drag به بوم)، استایل پوسته (سواچ‌ها/اندازهٔ عنوان/قلم)، تنظیمات بانک فعال (عنوان/والد ثابت/جابه‌جایی/حذفِ فقط-خالی)، تنظیمات فیلد فعال (برچسب/نوع/اجباری/فقط‌خواندنی/عرض/اتصال کوئری+ستون مقدار)؛ DnD ماژول‌سطح (dragRef) با نشانگر درج قبل‌از کارت؛ رندر preview غیرتعاملی؛ گیت فرم سیستمی (فقط استایل/متا).
- ذخیرهٔ دومرحله‌ای: PUT#1 (متا/استایل/تب‌ها → تب‌ها id تازه می‌گیرند) → PUT#2 (فیلدها با tabRefهای تازه، fieldKey پایدار `f{n}_{type}` برای فیلدهای جدید، orderIndex سراسری) → بازسازی baseline از سرور؛ هیچ SQL آزاد، همه از APIهای §4.2.
- مش/فرانت: WindowKind+"dfb-studio" (appKey=formId، dedup per form)؛ resolveWindowMeta با عنوان «استودیوی طراحی فرم — {فرم}»؛ جادوگر ۲مرحله‌ای شد (حذف مرحلهٔ ۳ فیلدها، دکمهٔ «ایجاد و ورود به استودیو») و onSaved آن پنجرهٔ استودیو را باز می‌کند؛ پنل جزئیات درخت فرمساز دکمهٔ «طراحی در استودیو» گرفت (فقط فرم کاربر).
- i18n: ۴۲ کلید dfb.studio.* × ۱۱ زبان (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh) با اسکریپت anchor-based روی dfb.builderNote.
- رفع اشکال حین E2E: (۱) هشدارهای lint (Trash2 بلااستفاده، disableهای بی‌اثر، paletteType، وابستگی t در اثر لود → عنوان بانک اصلی به رندر منتقل شد)؛ (۲) موبایل: ریل ارتفاع بوم را می‌بلعید → max-lg:max-h-[55vh] برای ریل + max-lg:min-h-56 برای بوم.
- E2E (agent-browser): جادوگر (قالب ساده ← عنوان «فرم آزمایش استودیو»/تب «اقلام فنی» ← ایجاد و ورود به استودیو) → استودیو با هدر/پالت/ریل/دو بانک ✓؛ افزودن متن→بانک اصلی و تاریخ/عدد/متن→بانک تب (کارت‌ها + پیش‌نمایش نوع‌ها) ✓؛ تغییرنام فیلد از ریل ✓؛ سواچ amber → سربرگ بوم فوراً کهربایی ✓؛ Undo→فیروزه‌ای/Redo→کهربایی ✓؛ ذخیره → PUT×2 (dev.log فقط 200) و API: header.style.theme=amber، تب id=3، چهار فیلد با tabRef درست و label ویرایش‌شده ✓؛ «باز کردن فرم» → runtime با تم کهربایی، فیلد متن، تب «اقلام فنی» با ستون‌های طراحی‌شده ✓؛ ذخیرهٔ رکورد → EAV (dataId=8, fieldRef=9) ✓؛ en/LTR کامل (Field toolbox/Form shell style/Active bank settings، بوم LTR) ✓؛ موبایل 390×844 بدون سرریز با هر دو پنل ✓؛ page errors=0، console error=0؛ زبان به fa برگشت.
- پاکسازی: فرم آزمون 8 (با رکورد/تب/فیلدها) حذف شد → dfb.db تمیز (فقط فرم‌های سیستمی)؛ lint → 0؛ tsc → 0 خطای src (skills/ خارج از دامنه).

Stage Summary:
- استودیوی طراحی فرم طبق ماکت مالک مستقر شد: پس از ثبت اطلاعات فرم جدید، بلافاصله پنجرهٔ استودیو باز می‌شود و کاربر با جعبه‌ابزار فیلدها، بانک‌ها، استایل پوسته (رنگ/قلم/اندازه)، Undo/Redo، پیش‌نمایش و ذخیرهٔ قالب، فرم را بصری طراحی می‌کند؛ خروجی دقیقاً همان‌طور که طراحی شده در runtime اجرا می‌شود (تم/فونت/انواع فیلد). ۴۲ کلید گفتاری در ۱۱ زبان، RTL/LTR و موبایل سالم، EAV و اسکیمای Dfb دست‌نخورده. lint/tsc/E2E/کنسول همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 48-a
Agent: general-purpose (i18n subagent)
Task: افزودن ۱۲ کلید گفتاری جدید dfb.btn.*/dfb.studio.* به ۱۱ زبان (تکلیف ۴۸ — اکشن‌بار کامل، تراز و پیش‌نمایش تعاملی)

Work Log:
- worklog (تا رکورد Task 47) بازخوانی شد؛ تنها فایل مجاز برای ویرایش: src/i18n/dictionaries.ts.
- ساختار فایل شناسایی شد: ۱۱ بلوک مستقل (fa به‌عنوان منبع حقیقت با `as const` و بقیه typed با Dict=Record<DictKey,string>)؛ دو لنگر در هر بلوک: "dfb.studio.editMode" (۱۱ رخداد با مقدارهای یکتا) و "dfb.btn.print" (۱۰ مقدار یکتا + fa/ps هر دو «چاپ» → برای این دو، لنگر با خط بعدی "dfb.tabsSection" برای یکتاسازی ترکیب شد).
- با MultiEdit (۲۲ ویرایش) در هر بلوک: ۴ کلید dfb.btn.{copy,deleteNew,deleteClose,list} بلافاصله بعد از dfb.btn.print و ۸ کلید dfb.studio.{align,alignStart,alignCenter,alignEnd,equalize,alignHint,previewHint,unsavedFieldsHint} بلافاصله بعد از dfb.studio.editMode درج شد — ترجمه‌ها عیناً مطابق متن مصوب تکلیف برای fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh؛ سبک همسایه‌ها رعایت شد (تورفتگی ۲فضایی، دابل‌کوت، ویرگول پایانی).
- Verification: rg -c روی هر ۱۲ کلید جدید → هر کدام دقیقاً 11/11 (alignHint=11، btn.list=11 و ۱۰ کلید دیگر همگی 11)؛ جای‌گذاری نمونه‌ها با Read بازبینی شد (fa: خطوط 160–167 و 240–243).
- bunx tsc --noEmit → ۰ خطا در src/ (فقط خطاهای ازپیش‌موجود examples/ و skills/ خارج از دامنه)؛ هیچ فایل دیگری تغییر نکرد.

Stage Summary:
- ۱۲ کلید × ۱۱ زبان = ۱۳۲ خط گفتاری جدید به dictionaries.ts اضافه شد (هر بلوک دقیقاً ۱۲ کلید، درج در دو لنگر editMode/print هر بلوک)؛ شمارش هر ۱۲ کلید 11/11 تأیید شد؛ فایل: src/i18n/dictionaries.ts؛ لنگرها: "dfb.studio.editMode" (۸ کلید) و "dfb.btn.print" (۴ کلید؛ fa/ps با زمینهٔ tabsSection یکتا شد). تایپ‌چک src پاک؛ اکشن‌بار کامل و تراز/پیش‌نمایش استودیو حالا در ۱۱ زبان در دسترس‌اند.

---
Task ID: 48
Agent: main (Z.ai Code)
Task: درخواست مالک (با ۵ نیازمندی جدید) — «۱) اکشن بار فرم‌های جدید باید تمامی آیکون‌های اکشن بار را پیش‌فرض داشته باشد؛ ۲) پیش‌نمایش فرم نباید باندها را نشان دهد و فقط فیلدها دیده شوند؛ ۳) قابلیت تراز کردن فیلدها در استودیو؛ ۴) کم و زیاد کردن عرض فیلدها با موس؛ ۵) امکان ورود اطلاعات در حالت پیش‌نمایش» — اکشن‌بار کامل پیش‌فرض، پیش‌نمایش زندهٔ بی‌باند، تراز بانک، دستگیرهٔ عرض موس، ورود داده در پیش‌نمایش.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 47). §0.4: درخواست صریح مالک با ماکت تصویری؛ §0.6 فرض‌های اعلام‌شده: واژگان دکمه‌ها به ۱۰ کلید اکشن‌بار Legacy گسترش یافت (reset/save/saveNew/saveClose/copy/delete/deleteNew/deleteClose/print/list — پیکربندی ذخیره‌شده همچنان رندر را می‌گیتد؛ null/خالی = کامل)، «باند»=کروم طراحی بانک‌ها (کانتینر خط‌چین/عنوان/چیپ/دکمه‌های افزودن)، تراز هر بانک در headerJson.style.bankAlign (کلید "main"|"tab{i}" — مقاوم به بازتولید id تب) بدون تغییر اسکیما، مدل عرض WidthSpan از «۱=نصف/۲=تمام» به درصدی 25..100 گام ۵٪ ارتقا یافت (نام میراث §2.6 حفظ؛ قدیمی‌ها 1→50/2→100 سمت کلاینت نرمال و SQL دفاعی روی dfb.db — جدول فیلدها خالی بود)، ذخیره‌وبستن در پیش‌نمایش = ذخیره + بازگشت به طراحی؛ §0.5/§1.4/§2.3/§5.1/§6/§7 رعایت.
- اکشن‌بار (§5.1 افزونه‌ای): ACTION_BAR_KEYS/ActionBarKey در action-bar/index.ts (تک‌منبع)؛ FormActionBar پراپ اختیاری actions (allowlist) گرفت — بدون actions رفتار قبلی (همهٔ ۱۰ آیکون) برای bs-window و بقیه دست‌نخورده؛ دیوایدرها فقط بین گروه‌های نامرئی/مرئی رندر می‌شوند.
- قالب‌ها: SimpleFormField.widthPct + پراپ‌های fieldsAlign/actions (افزونه‌ای)؛ FlowFieldGrid در form-primitives (flex-wrap با عرض درصدی + justify تراز + سازگار useAlignedLabels) — حالت Legacy grid برای مصرف‌کنندگان بدون این پراپ‌ها حفظ شد؛ SimpleTreeForm هم همین قرارداد.
- runtime (dfb-form-runtime): footerButtons با storedFooterButtons (خالی/ناموجود = کامل) → پراپ actions؛ هندلرهای copy (جداسازی رکورد برای ذخیرهٔ جدید)، deleteNew/deleteClose؛ widthPct از normalizeFieldWidth؛ تراز main از dfbBankAlign؛ ستون‌های تب minWidth از width (widthMinWidthClass)؛ منطق گزینه‌های کوئری به هلپر مشترک fetchQueryOptionsForFields منتقل شد (runtime == پیش‌نمایش).
- استودیو (dfb-studio): بوم بانک‌ها به جریان flex-wrap با عرض درصدی + تراز زنده؛ FieldResizeHandle (دستگیرهٔ pointer-events روی لبهٔ inline-end، آگاه از RTL، اسنپ ۵٪ در 25..100، چیپ درصد زنده، یک اسنپ‌شات Undo در pointerup)؛ ابزار تراز بانک (ابتدا/وسط/انتها + هم‌عرض کردن — رایج‌ترین عرض) در ریل تنظیمات بانک؛ Select عرض 25/50/75/100؛ پیش‌نمایش = PreviewCanvas (بدون باندها: فیلدهای واقعی FieldCell با عرض/تراز طراحی‌شده + اکشن‌بار واقعی FormActionBar با allowlist + ورود داده + ذخیرهٔ EAV + کپی/ریست/پرینت + لیست و بازکردن رکورد + گیت «فیلد بدون id» با پیام راهنما)؛ متادیتا/جادوگر چک‌لیست ۱۰تایی؛ i18n ۱۲ کلید جدید × ۱۱ زبان (ساب‌ایجنت 48-a: dfb.btn.copy/deleteNew/deleteClose/list + dfb.studio.align/alignStart/alignCenter/alignEnd/equalize/alignHint/previewHint/unsavedFieldsHint — 132 خط، count 11/11 تأیید).
- سرویس dfb (:3003): FormStyleDto.bankAlign @IsObject؛ widthSpan DTO Min(25)/Max(100) (FieldInput/AddField)؛ schema.prisma WidthSpan @default(50) + کامنت درصدی؛ prisma db push روی db/dfb.db اختصاصی (DATABASE_URL صریح — درس worklog) + SQL دفاعی مهاجرت 1→50/2→100؛ ری‌استارت سرویس (pid قبلی 23725 که pkill الگوش نگیرد → kill با ss -tlnp؛ EADDRINUSE گذرا resolved).
- رفع اشکال حین E2E: (۱) ترتیب تعریف previewDelete/previewSaveClose قبل از previewSave/previewReset → «Cannot access variable before declared» + togglePreview بدون مصرف → جابه‌جایی بعد از هندلرها و اتصال به دکمهٔ چشم؛ (۲) MultiEdit ناتمام که خط mapLoadedRecords را حذف کرده بود → بازسازی؛ (۳) mapLoadedRecords به تابع خالص (fields پارامتر) بازنویسی شد تا exhaustive-deps تمیز بماند.
- E2E (agent-browser، fa/RTL 1440×810): دسکتاپ → ابزارهای پیشرفته → فرمساز → درخت → ایجاد فرم «فرم آزمون ۴۸» با تب «اقلام» → جادوگر: ۱۰/۱۰ چک‌باکس اکشن‌بار تیک پیش‌فرض ✓؛ استودیو: افزودن متن/عدد/تاریخ، نوار کاشی‌های اکشن ۱۰تایی ✓؛ ذخیرهٔ قالب → PUT×2 200 و DB: footer هر ۱۰ کلید + ۳ فیلد w=50 ✓؛ تراز وسط → justify-content:center زنده ✓؛ عرض ۱۰۰٪ از Select ✓؛ درگ موس دستگیره (RTL: به چپ=پهن‌تر) 50→60٪ ✓؛ پیش‌نمایش: باندها/عنوان بانک/افزودن بانک ناپدید، تولبار واقعی ۱۱ دکمه، تایپ «سلام آزمون»، ذخیره → POST 201 + EAV (dataId=9, fieldRef=13) ✓؛ چیپ #9، لیست رکوردها → بازکردن رکورد ۹ → مقدار برگشت ✓؛ خروج از پیش‌نمایش + ذخیره → headerJson.style.bankAlign.main=center و عرض‌ها 100/60/50 در DB ✓؛ runtime («باز کردن فرم»): اکشن‌بار ۱۱ آیکونی، عرض‌ها و تراز وسط عیناً اعمال، ذخیرهٔ رکورد دوم → POST 201 + EAV ✓ (عرض‌ها بعد از بازتولید فیلد توسط ذخیرهٔ پنل جزئیات هم پایدار)؛ en/LTR: "Align center"/"Equalize widths"/"Field alignment"/hint پیش‌نمایش/Save template ✓ و پیش‌نمایش LTR با تراز وسط ✓؛ موبایل 390×844: scrollW=390 بدون سرریز (استودیو و دسکتاپ) ✓؛ بازگشت به fa/RTL؛ reload تازه: بدون page error، GET / 200 (۵۰۰های وسط لاگ فقط HMR حین ویرایش بودند)؛ console error=0.
- پاکسازی: فرم آزمون ۹ با همهٔ وابستگی‌ها (۲ رکورد/۲ مقدار از جمله یتیم fieldRef=13/۳ فیلد/۱ تب) حذف شد → dfb.db فقط فرم‌های سیستمی BS+FB و دو پوستهٔ کاربری از قبل موجود (6/7)؛ lint → 0؛ tsc → 0 خطای src (skills/ و examples/ خارج از دامنه).

Stage Summary:
- پنج نیازمندی مالک در تکلیف ۴۸ مستقر شد: فرم‌های جدید با اکشن‌بار کامل ۱۰ آیکونی زاده می‌شوند (و پیکربندی ذخیره‌شده همچنان رندر را کنترل می‌کند)؛ پیش‌نمایش استودیو «باندها» را حذف و فقط فیلدها را با همان موتور runtime نشان می‌دهد؛ تراز افقی هر بانک (ابتدا/وسط/انتها) و هم‌عرض‌سازی در استودیو طراحی است و به runtime هم جاری می‌شود؛ عرض فیلد با موس (دستگیرهٔ لبه، اسنپ ۵٪، RTL-آگاه) و با Select تنظیم و در WidthSpan درصدی ذخیره می‌شود؛ پیش‌نمایش زنده است — داده وارد و با اکشن‌بار واقعی در EAV ذخیره/بازخوانی می‌شود. قرارداد ۱۲فیلدی AppBaseEntity و §2.3/§2.5/§2.6 دست‌نخورده؛ i18n ۱۱زبانه کامل؛ lint/tsc/E2E/موبایل/کنسول پاک؛ ثبت در worklog انجام شد.
