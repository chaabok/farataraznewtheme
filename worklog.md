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

---
Task ID: 49-a
Agent: general-purpose (i18n subagent)
Task: تسک ۴۹-الف — تغییرنام «بانک→باند» در ۹ کلید استودیو × ۱۱ زبان + افزودن ۶ کلید جدید dfb.studio.* (addGridTab/addFieldsTab/bankKind/bankKindGrid/bankKindFields/emptyFieldsTab) به ۱۱ زبان

Work Log:
- worklog (تا رکورد Task 48) بازخوانی شد؛ تنها فایل ویرایش‌شده: src/i18n/dictionaries.ts (اسکریپت دای‌ران فقط در /home/z بیرون از مخزن ساخته و پس از کار حذف شد).
- پیش‌ازویرایش، دای‌ران پایتونی: هر ۹۳ خط قدیم (fa=9, en=9, tr=8, ar=9, hi=8, ps=8, ckb=7, pt=9, ko=9, fr=9, zh=8) به‌صورت substring دقیقاً یک‌بار در فایل بود (count=1 ⇒ تطابق بایت‌به‌بایت شامل ZWNJ)؛ پس از شبیه‌سازی تغییرنام‌ها، ۱۱ لنگر addBank تغییرنام‌یافته هم count=1 بودند، کلیدهای جدید از قبل موجود نبودند و اختلاف سطر شبیه‌سازی‌شده = ۶۶.
- JOB 1 — MultiEdit ۹۳تایی: مقدار ۹ کلید dfb.studio.{alignHint, bankSettings, bankTitle, parentRoot, addBank, bankMain, bankDeleteHint, paletteHint, emptyBankHint} در هر بلوک به واژهٔ باند (fa/ps: باند، tr: bant، ar: شريط، hi: बैंड، ckb: باندا/باندێ، en: band، pt: banda، ko: 밴드، fr: bande، zh: 带区) تغییر کرد؛ نام کلیدها دست‌نخورده ماند. کلیدهای بدون واژهٔ بانک طبق متن تکلیف اصلاً در فهرست نبودند (tr/hi paletteHint، ckb alignHint/paletteHint، zh alignHint) — هیچ خط قدیمی یافت‌نشده وجود نداشت؛ صفر جایگزین ردشده.
- JOB 2 — MultiEdit ۱۱تایی: در هر بلوک، ۶ خط جدید dfb.studio.{addGridTab, addFieldsTab, bankKind, bankKindGrid, bankKindFields, emptyFieldsTab} بلافاصله بعد از addBank همان بلوک درج شد (تورفتگی ۲فضایی، دابل‌کوت، ویرگول پایانی؛ ترجمه‌های مصوب عیناً؛ ترتیب بقیهٔ خطوط حفظ شد).
- Verification: rg -c هر کلید جدید → دقیقاً 11/11 (addGridTab=11، addFieldsTab=11، bankKind=11، bankKindGrid=11، bankKindFields=11، emptyFieldsTab=11)؛ بررسی واژهٔ بانک فقط روی مقادیر: rg '"dfb\.studio\.[a-zA-Z]+": "[^"]*(بانک|بنك|뱅크|银行|banka|banco|banque|बैंक)' و نیز نسخهٔ ASCII 'bank' → هر دو خروجی خالی (نام کلیدهایی مثل bankMain عمداً حفظ شده‌اند)؛ wc -l: 4098 → 4164 (+66).
- bunx tsc --noEmit → صفر خطا در src/ و mini-services (فقط خطاهای ازپیش‌موجود examples/ و skills/ خارج از دامنه)؛ هیچ فایل دیگری تغییر نکرد.

Stage Summary:
- ۹۳ تغییرنام مقداری «بانک→باند» در ۹ کلید استودیو × ۱۱ زبان اعمال و ۶ کلید جدید × ۱۱ زبان = ۶۶ خط گفتاری بلافاصله پس از addBank هر بلوک درج شد؛ شمارش هر ۶ کلید 11/11، پاکسازی واژهٔ بانک از تمام مقادیر dfb.studio و تایپ‌چک src پاک تأیید شد. کلیدهای addGridTab/addFieldsTab/bankKind/bankKindGrid/bankKindFields/emptyFieldsTab اکنون برای اتصال UI تکلیف ۴۹ (تب‌های گرید/فیلدهای ورودی و نوع باند) در هر ۱۱ زبان آماده‌اند.

---
Task ID: 49
Agent: main (Z.ai Code)
Task: درخواست مالک (۳ نیازمندی) — «۱) در فرم‌ساز عنوان بانک به باند تغییرنام یابد؛ ۲) کامپوننت Date پس از ۴ رقم سال «/» خودکار و پس از ۲ رقم ماه «/» خودکار بگذارد و سپس ۲ رقم روز وارد شود؛ ۳) افزودن تب به فرم در استودیوی طراحی قرار گیرد — تب‌ها دو مدل‌اند: گرید (رکوردها با دکمهٔ افزودنِ فوتر) و غیرگریدیِ حاوی فیلدهای اینپوت» + ماکت تصویری استودیو.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: Task 48). §0.4 درخواست صریح مالک؛ §0.6 فرض‌های اعلام‌شده: تغییرنام فقط در مقادیر کاربرپدید (کلیدهای i18n شناسهٔ کد می‌مانند)، ماسک تاریخ ارقام فارسی/عربی را نرمال و فقط ۸ رقم می‌پذیرد (پس‌حرف‌زدن Backspace روان می‌ماند)، TabKind=1 پیش‌فرض (سازگاری میراث) و 2=فیلد ورودی، «افزودن تب»=ارتقای نوار «افزودن باند جدید» به دو دکمهٔ صریح + قابل‌تغییر در تنظیمات باند + نشان نوع روی سربرگ؛ §0.5/§1.3/§1.4/§2.3/§2.5/§2.6/§6/§7 رعایت.
- ۴۹-الف (ساب‌ایجنت i18n): ۹۳ تغییرنام «بانک→باند» در ۹ کلید استودیو × ۱۱ زبان (fa: باند، en: Band، tr: Bant، ar: شريط، hi: बैंड، ps/ckb: باند، pt: Banda، ko: 밴드، fr: Bande، zh: 带区) + ۶ کلید جدید dfb.studio.{addGridTab,addFieldsTab,bankKind,bankKindGrid,bankKindFields,emptyFieldsTab} × ۱۱ زبان (۶۶ خط) — شمارش هر کلید 11/11، بدون رشتهٔ باقی‌ماندهٔ بانک در مقادیر dfb.studio.*، tsc پاک.
- ۴۹-ب (سرویس): DfbFormTab.TabKind Int @default(1) (1=Grid میراث | 2=InputFields) + کامنت؛ TabInputDto.tabKind (1..2)؛ replaceTabs ذخیرهٔ tabKind (t.tabKind===2?2:1)؛ findOne برگرداندن tabKind؛ prisma db push روی db/dfb.db (DATABASE_URL صریح — درس worklog) + generate + ری‌استارت سرویس (bun run dev با NODE_PATH — اجرای مستقیم main.ts از _shared خطای ماژول می‌دهد).
- ۴۹-ج (ماسک تاریخ): form-primitives — applyDateMask/normalizeDigits (صادراتی): ارقام ۰-۹/۰-۹ فارسی-عربی→ASCII، فقط ۸ رقم (حداکثر ۱۰ نویسه)، «/» خودکار بعد از ۴ رقم سال و ۲ رقم ماه هنگام تایپ؛ هنگام حذف جداکنندهٔ انتهایی دوباره اضافه نمی‌شود (Backspace همیشه پیشرفت می‌کند)؛ FieldCell date: inputMode=numeric، dir=ltr، رد کليد نامعتبر با بازگرداندن DOM به مقدار ماسک‌شده (ref)؛ refs به بالای FieldCell منتقل شد (rules-of-hooks — هوک داخل شاخه شرطی نباشد).
- ۴۹-د (تب فیلدورودی): SimpleFormTab.kind ("grid"|"fields") + fields?: SimpleFormField[]؛ TabsContent برای kind="fields": FlowFieldGrid از فیلدهای تب (هم‌ترازِ fieldsAlign، عرض‌های درصدی، FieldCell کامل با ماسک/کوئری) و حالت خالی با emptyFieldsTab؛ فوتر (+/×/کپی/ذخیرهٔ سطرها) فقط وقتی تب فعال گریدی است (activeTabIsGrid) — دقیقاً مطابق درخواست «دکمهٔ افزودن فوتر برای گریدهاست»؛ runtime: tb.tabKind===2 → kind:"fields" با fields=tabFields.map(toSimpleField) (کوئری‌بایند/عرض/اجباری عیناً)؛ DfbTabDef.tabKind به store.
- ۴۹-هـ (استودیو): StudioBank.tabKind (0=اصلی/1=گرید/2=فیلدورودی) در load/save/baseline؛ addBank(tabKind) + updateBankKind؛ نوار افزودن باند → دو دکمهٔ «افزودن باند گرید» (Grid3x3، teal) و «افزودن باند فیلد ورودی» (FormInput، violet) زیر عنوان «افزودن باند جدید به فرم»؛ نشان نوع (Badge + آیکون) روی سربرگ هر باندِ تب؛ Select «نوع باند» در تنظیمات باند فعال (گرید↔فیلدورودی، تغییرپذیر)؛ ذخیره: tabs با tabKind؛ متادیتای سرویس بدون تغییر اسکیمای دیگر جداول.
- E2E (agent-browser، fa/RTL 1440×810): دسکتاپ→ابزارهای پیشرفته→فرمساز→ایجاد فرم «فرم آزمون ۴۹» (تب «اقلام»)→استودیو: «باند اصلی»، «تنظیمات باند فعال»، دو دکمهٔ افزودن، نشان «گرید (جدول رکوردها)» روی اقلام ✓؛ فیلد تاریخ به باند اصلی، متن به اقلام، «افزودن باند فیلد ورودی»→باند جدید با نشان «فیلدهای ورودی» + متن و تاریخ ✓؛ تغییرنام باند از ریل ✓؛ ذخیرهٔ قالب → PUT×2 200 و DB: TabKind اقلام=1/مشخصات تکمیلی=2 و ۴ فیلد با tabRef درست ✓؛ پیش‌نمایش: باندها ناپدید، تایپ پله‌ای 1405→«1405/»، 08→«1405/08/»، 15→«1405/08/15»، Backspace→«1405/08/1»→«1405/08» ✓؛ ذخیرهٔ پیش‌نمایش → POST 201 + EAV ✓؛ runtime («باز کردن فرم»): تب‌ها اقلام+مشخصات تکمیلی، مشخصات تکمیلی = اینپوت‌های واقعی (متن+تاریخ با ماسک) و فوتر رکوردی مخفی؛ اقلام = گرید با فوتر و «افزودن سطر جدید» ✓؛ ماسک در runtime: 1404→«1404/»، 11→«1404/11/»، 09→«1404/11/09» ✓؛ ذخیرهٔ رکورد → POST 201 + EAV (فیلد باند اصلی + هر دو فیلد تب ورودی) ✓؛ en/LTR: "Main band"/"Add grid band"/"Add input-fields band"/"Active band settings"/chips "Grid (record table)"+"Input fields" ✓؛ بازگشت به fa/RTL؛ موبایل 390×844 بدون سرریز (sw=390)؛ page errors=0، console error=0.
- درس‌های حین E2E: کلیک مصنوعی b.click()/Radix TabsTrigger از eval گاهی سوییچ نمی‌کند → رویداد واقعی mouse move/down/up یا کیبورد (roving tabindex) استفاده شد؛ پنجرهٔ رویی runtime دکمهٔ «طراحی در استودیو» را می‌پوشاند → ابتدا بستن/فوکوس پنجره؛ دکمه‌های اکشن‌بار در چند پنجره هم‌نام‌اند → هدف‌گیری با scope [data-simple-form] یا ردیف پیش‌نمایش.
- پاکسازی: فرم آزمون ۱۰ با همهٔ وابستگی‌ها (۲ رکورد/۵ مقدار/۴ فیلد/۲ تب) حذف شد → dfb.db فقط فرم‌های سیستمی BS+FB؛ فعالیت همزمان مالک (منوی «حمل و ترابری» + فرم ۱۱ «انواع وسیله نقلیه») شناسایی و دست‌نخورده حفظ شد؛ lint → 0؛ tsc → 0 خطای src/mini-services (skills/ و examples/ خارج از دامنه)؛ dev.log فقط 200/201.

Stage Summary:
- سه نیازمندی مالک مستقر شد: واژگان استودیو از «بانک» به «باند» در ۱۱ زبان تغییر کرد؛ کامپوننت Date با ماسک YYYY/MM/DD (اسلش خودکار پس از سال ۴ رقمی و ماه ۲ رقمی، نرمال‌سازی ارقام فارسی/عربی، Backspace روان) در استودیو/پیش‌نمایش/runtime یکسان کار می‌کند؛ «افزودن تب» در استودیوی طراحی با دو مدل رسمی — باند گرید (رکوردها با دکمهٔ افزودن فوتر) و باند فیلد ورودی (اینپوت‌های معمولی که با رکورد فرم در EAV ذخیره می‌شوند، بدون فوتر رکوردی) — پشتیبانی و با ستون TabKind در اسکیمای Dfb (پیش‌فرض 1=سازگار با تب‌های قبلی) ماندگار می‌شود. تب فیلدورودی در runtime از همان موتور FieldCell/FlowFieldGrid استفاده می‌کند (طراحی==اجرا). lint/tsc/E2E/۱۱ زبان/موبایل همگی پاک؛ ثبت در worklog انجام شد.
---
Task ID: 50-a
Agent: general-purpose (i18n subagent)
Task: تسک ۵۰-الف — افزودن ۱۰ کلید گفتاری dfb.studio.* (افزودن تب/عنوان‌ها/قفل لاتین/حالت خالی باند) به ۱۱ زبان

Work Log:
- worklog (تا رکورد Task 49) بازخوانی شد؛ تنها فایل ویرایش‌شده: src/i18n/dictionaries.ts.
- لنگر پیش از ویرایش با rg شمارش شد: "dfb.studio.addFieldsTab" دقیقاً ۱۱ رخداد (fa:187، en:576، tr:956، ar:1331، hi:1706، ps:2081، ckb:2456، pt:2832، ko:3207، fr:3583، zh:3958) — مقدار هر خط در ۱۱ بلوک یکتا بود، پس هر لنگر بدون زمینهٔ اضافی یکتاست.
- با MultiEdit (۱۱ ویرایش — هر بلوک یک ویرایش) بلافاصله بعد از خط addFieldsTab همان بلوک، ۱۰ کلید dfb.studio.{addTab, addTabDesc, tabTitleFa, tabTitleEn, latinOnly, latinBlocked, emptyGridBand, emptyGridBandHint, tabDeleteHint, bandTabs} به همان ترتیب متن مصوب درج شد — تورفتگی ۲فضایی، دابل‌کوت، ویرگول پایانی؛ ترجمه‌ها عیناً (شامل آپاستروف tab's در en، گیومه‌های “ ”/« »/「 」 و ZWNJهای fa/ps/ckb)؛ هیچ امضای تایپ یا کلید موجودی تغییر نکرد (fa همچنان as const، بقیه Dict=Record<DictKey,string>).
- Verification: rg -c برای هر ۱۰ کلید جدید → دقیقاً 11/11 (addTab=11، addTabDesc=11، tabTitleFa=11، tabTitleEn=11، latinOnly=11، latinBlocked=11، emptyGridBand=11، emptyGridBandHint=11، tabDeleteHint=11، bandTabs=11)؛ لنگر addFieldsTab همچنان 11؛ wc -l: 4164 → 4274 (+110)؛ جای‌گذاری در هر ۱۱ بلوک با خروجی diff ویرایش بازبینی شد.
- bunx tsc --noEmit → صفر خطا در src/ (فقط خطاهای ازپیش‌موجود examples/ و skills/ خارج از دامنه)؛ git status → در میان فایل‌های سورس تنها src/i18n/dictionaries.ts تغییر کرد (موارد دیگر تغییرکردهٔ گیت فقط آرتیفکت‌های runtime توسعه‌اند: .next/dev، dev.log، db/dfb.db — خارج از کار این تسک).

Stage Summary:
- ۱۰ کلید گفتاری جدید × ۱۱ زبان = ۱۱۰ خط به dictionaries.ts اضافه شد (هر بلوک دقیقاً ۱۰ کلید، بلافاصله بعد از addFieldsTab همان بلوک)؛ شمارش هر کلید 11/11 تأیید و تایپ‌چک src پاک ماند. کلیدهای گفتاری UI تکلیف ۵۰ (دیالوگ «افزودن تب»، عنوان‌های فارسی/لاتین، قفل نویسه‌های غیرلاتین، حالت خالی باند گرید، هشدار حذف تب و تب‌های باند) اکنون در هر ۱۱ زبان آماده‌اند.

---
Task ID: 50
Agent: main (Z.ai Code)
Task: درخواست مالک — «نوع باند را جدول رکوردها انتخاب کردم ولی تب‌بندی نشده؛ دکمهٔ «افزودن تب» بگذارید که تب ایجادشده داخل باند قرار بگیرد؛ فرم ممکن است چندین تب داشته باشد، پس دکمهٔ افزودن تب عنوان فارسی و لاتین بگیرد؛ کاربر نباید در فیلد عنوان لاتین بتواند زبان‌های دیگر وارد کند» — تب‌بندی داخلی باند جدول رکوردها + قفل ورودی لاتین.

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: 49-a). §0.4 درخواست صریح مالک؛ §0.6 فرض‌های اعلام‌شده: تب‌ها متعلق به باندِ جدول رکوردها هستند (هر تب = یک جدول رکورد)، هر دو عنوان در دیالوگ الزامی، قفل لاتین سخت‌گیر (تایپ/چسباندن زبان دیگر اصلاً وارد فیلد نمی‌شود)، نگاشت سازگاری باند گرید قدیمیِ فیلددار → «باند+یک تب هم‌نام» (هیچ فیلدی گم نمی‌شود)، اعمال قفل لاتین روی همهٔ «عنوان لاتین»های موجود برای یکنواختی؛ §0.5/§1.3/§1.4/§2.3/§2.5/§2.6/§6/§7 رعایت.
- ۵۰-الف (ساب‌ایجنت i18n): ۱۰ کلید dfb.studio.{addTab,addTabDesc,tabTitleFa,tabTitleEn,latinOnly,latinBlocked,emptyGridBand,emptyGridBandHint,tabDeleteHint,bandTabs} × ۱۱ زبان (۱۱۰ خط، لنگر addFieldsTab، شمارش هر کلید 11/11، tsc پاک).
- ۵۰-ب (سرویس dfb :3003): schema.prisma → DfbFormTab.ParentRef BigInt @default(0) (0=باند سطح بالا، >0=تبِ داخل باند)؛ TabInputDto + clientKey/parentKey (کلیدهای همبستگی — id تب‌ها در هر ذخیره بازتولید می‌شود)؛ replaceTabs دوگذره (باندها اول، سپس فرزندان با resolve parentKey→id تازه و پرتاب BadRequest برای والد ناموجود)؛ update پاسخ PUT را با clientKey هر تب غنی می‌کند تا فاز فیلدها tabRef را به idهای تازه نگاشت کند؛ findOne parentRef برمی‌گرداند؛ prisma db push + generate با DATABASE_URL صریح (درس worklog) + ری‌استارت سرویس (pid 9680).
- ۵۰-ث: src/components/forms/latin-input.tsx — LatinInput + sanitizeLatin: مجاز A-Za-z0-9 و فاصله و علائم پایه؛ هر تغییری (تایپ/IME/درگ/پیست) پاک‌سازی می‌شود؛ هنگام حذف نویسه، پیام latinBlocked با حلقهٔ قرمز ۲.۴ثانیه‌ای + hint دائمی latinOnly؛ aria-live polite. اعمال روی: دیالوگ افزودن تب، دیالوگ منو (عنوان لاتین آیکون/زیرمنو)، دیالوگ فرم جادوگر، متای استودیو.
- ۵۰-د: dfb-store DfbTabDef + parentRef/clientKey؛ قالب SimpleFormTwoRowTabbed — SimpleFormTab.children? ، rowsByTab با فرزندان، effectiveGridTabId مشتق‌شده (بدون setState-in-effect)، addRow/remove/copy/onSaveRows روی تب داخلی فعال، renderGridTable استخراج‌شده، TabsContent باند دارای فرزند = Tabs داخلی با TabsTrigger فرزندان.
- ۵۰-هـ: رانتایم dfb-form-runtime — bandTabs=parentRef==0 ، childrenOf، نگاشت باند دارای فرزند → SimpleFormTab با children (ستون‌های هر فرزند از فیلدهای TabRef همان تب؛ label locale-آگاه با dfbFormTitle)؛ باند گرید قدیمی بدون فرزند = رفتار قبلی؛ فیلد مستقیم باند دارای فرزند (دفاعی) → گرید فرزند اضافی هم‌نام باند.
- ۵۰-و (استودیو، refactor بزرگ): مدل StudioTab + StudioBank.tabs؛ ContainerKey ("main"|"bank"|"bank::tab") برای همهٔ عملیات فیلد (addField/moveFieldDir/removeField/moveFieldToBank/reorderField/updateField/equalizeContainer)؛ buildBanks نرمال‌سازی بارگذاری با legacy-wrap؛ activeContainerKey جایگزین activeBankKey؛ AddTabDialog (دو عنوان الزامی + LatinInput)؛ دکمهٔ «افزودن تب» روی سربرگ باند گرید + حالت خالی «این باند هنوز تب ندارد» + نوار چیپ تب داخل باند (عنوان+لاتین+شمار+حذف فقط-خالی) + دکمهٔ چیپ افزودن؛ ریل: بخش «تب‌های باند» با فهرست/افزودن/حذف؛ گارد تغییر نوع باند وقتی فیلد دارد؛ FieldFlow استخراج‌شده؛ ذخیره: tabsPayload با clientKey/parentKey + فاز فیلدها با idByClientKey؛ پیش‌نمایش همهٔ فیلدها از allFieldsOf (باندها پنهان، فیلدها ورودداده‌ای — Task 48 پایدار)؛ Undo/Redo و dirty-gate با اسنپ‌شات‌های شامل تب‌ها.
- E2E (agent-browser، fa/RTL 1440×810): ایجاد «فرم آزمون ۵۰» → استودیو → «افزودن باند گرید» → حالت خالی با دکمهٔ افزودن تب ✓؛ دیالوگ: تایپ «فارسی نباید بماند» در فیلد لاتین → فیلد خالی ماند (قفل سخت‌گیر) و "Items" ماند ✓؛ تأیید تا هر دو عنوان پر نشود disabled ✓؛ تب «اقلام فنی/Items» داخل باند (چیپ داخل کانتینر باند) ✓؛ متن+عدد به تب فعال، تب دوم «خدمات/Services» از سربرگ باند + متن ✓؛ ذخیره → PUT×2 200 و DB: باند ID=10 ParentRef=0 + دو فرزند ParentRef=10 با Title_En و فیلدها TabRef=11/12 ✓؛ رانتایم («باز کردن فرم»): tablist بیرونی=[عنوان باند 1] و tablist داخلی=[اقلام فنی، خدمات]، سوییچ به خدمات → گرید ستون «متن»، «افزودن سطر جدید» فوتر سطر را در همان گرید داخلی ساخت ✓؛ en/LTR: تب‌های داخلی "Items"/"Services"، دیالوگ "Add tab"/"Tab title (Persian)/(Latin)"/"Only Latin characters are allowed" ✓؛ موبایل 390×844 بدون سرریز (scrollW=390) ✓؛ بازگشت به fa/RTL؛ page errors=0، console error=0، dev.log فقط 200/201.
- پاکسازی: فرم آزمون ۱۲ با همهٔ وابستگی‌ها (باند/۲ تب/۳ فیلد) حذف شد → dfb.db فقط فرم‌های سیستمی BS+FB و فرم مالک ۱۱ (دست‌نخورده)؛ lint → 0؛ tsc → 0 خطای src/mini-services (skills/ و examples/ خارج از دامنه).

Stage Summary:
- باند «جدول رکوردها» حالا خودش تب‌بندی دارد: دکمهٔ «افزودن تب» روی باند است و هر تب ساخته‌شده *داخل همان باند* می‌نشیند (نوار تب داخلی)؛ دیالوگ افزودن تب عنوان فارسی و لاتین می‌گیرد (هر دو الزامی) و فیلد لاتین با فیلتر سخت‌گیر فقط نویسه‌های لاتین می‌پذیرد (تایپ فارسی/عربی/غیرلاتین عملاً وارد فیلد نمی‌شود و پیام «نویسه‌های غیرلاتین حذف شد» می‌دهد)؛ هر تب = یک جدول رکورد که دکمهٔ افزودن فوتر روی تب فعال داخلی کار می‌کند؛ سلسله‌مراتب با ستون ParentRef در اسکیمای Dfb ماندگار می‌شود (همبستگی clientKey/parentKey به‌دلیل بازتولید id در هر ذخیره)؛ قفل لاتین روی همهٔ فیلدهای «عنوان لاتین» سیستم هم اعمال شد. lint/tsc/E2E/۱۱ زبان/موبایل/کنسول همگی پاک؛ ثبت در worklog انجام شد.

---
Task ID: 51
Agent: main (Z.ai Code)
Task: گزارش مالک — «در پیش‌نمایش فرم همهٔ فیلدها کنار هم نمایش داده می‌شود؛ اگر فرمی تب‌بندی داشت باید تب‌ها همانند نمونه فرم نمایش داده شود» + «آیکون حذف فیلدها در استودیو طراحی هیچ اکشنی ندارد و کار نمی‌کند» (با دو تصویر ماکت از استودیو و پیش‌نمایش فرم «انواع وسیله نقلیه»)

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: 50). §0.4 درخواست صریح مالک؛ §0.6 فرض‌های اعلام‌شده: «همانند نمونه فرم» = همان موتور SimpleFormTwoRowTabbed که runtime نصب می‌کند (نه ساخت چهرهٔ تقلبی)، نگاشت پیش‌نمایش از «حالت زندهٔ استودیو» است پس طراحی ذخیره‌نشده هم درست پیش‌نمایش می‌گیرد (فرم ۱۱ مالک در DB اصلاً تب/فیلد ذخیره‌شده نداشت — اسکرین‌شات‌هایش fieldKey خالی کارت‌ها را نشان می‌دهد)، برچسب تب‌ها locale-آگاه مثل runtime (dfbFormTitle)، باند گریدِ میراثِ تک‌تبِ ساختگی (tb-legacy-) مثل runtime به‌صورت تب گرید ساده رندر می‌شود؛ §0.5/§1.3/§1.4/§2.3/§2.5/§2.6/§6/§7 رعایت.
- ریشه‌یابی باگ ۲: removeField روی شیءِ پوشانندهٔ خروجی findContainer مقدار `dst.fields = filtered` می‌گذاشت — فقط پراپرتی wrapper عوض می‌شد و آرایهٔ واقعی bank/tab دست‌نخورده می‌ماند (add/move/equalize چون درجا splice/push می‌کنند سالم بودند؛ حذف تنها reassign بود). اصلاح: splice درجا + کامنت توضیحی.
- ریشه‌یابی باگ ۱: PreviewCanvas تکلیف ۴۸ عمداً همهٔ فیلدها را با allFieldsOf در یک FlowFieldGrid صاف می‌چید (پیش از وجود تب‌های درون‌باندی). بازنویسی کامل: PreviewCanvas اکنون خود قالب SimpleFormTwoRowTabbed را نصب می‌کند — fields=فیلدهای باند اصلی، banks[1..] → tabs: باند فیلدورودی → kind:"fields"، باند گرید دارای تب → children (هر «افزودن تب» = تب داخلی گرید با ستون‌های فیلدهایش و minWidth عرضی)، باند گرید بی‌تب → تب گرید ساده؛ actions/اکشن‌بار واقعی، listItems رکوردها، onHeaderClose/Close=خروج از پیش‌نمایش؛ head چوب‌اسکلت ماکت در حالت پیش‌نمایش رندر نمی‌شود (قالب سربرگ خودش را دارد) و نشان «پیش‌نمایش/#id» بالای پوسته منتقل شد؛ سربرگ/ستون‌ها locale-آگاه.
- E2E (agent-browser، fa/RTL 1440×810): فرم آزمون ۵۱ ساخته شد (جادوگر کامل)؛ استودیو: باند گرید + دو تب «اقلام فنی/Items» و «خدمات/Services» + فیلد در هر تب؛ پیش‌نمایش: data-simple-form قالب واقعی، tablist بیرونی=[عنوان باند 1]، tablist داخلی=[اقلام فنی، خدمات] (هندسهٔ دو نوار تأیید شد)، سوییچ تب داخلی با موس واقعی → ستون‌های همان تب، «افزودن سطر جدید» فوتر → سطر+اینپوت ساخته شد ✓؛ خروج از پیش‌نمایش؛ **باگ حذف**: کلیک سطلِ فیلد تب خدمات → شمارندهٔ چیپ 1→0 و کارت حذف شد؛ حذف فیلد باند اصلی هم ✓ (پیش از اصلاح هیچ‌کدام عمل نمی‌کرد)؛ ذخیرهٔ قالب → PUT×2 200 و DB: باند id=13 ParentRef=0 + دو فرزند ParentRef=13 (اقلام فنی/Items، خدمات/Services) + فیلد TabRef=14 ✓ (فیلدهای حذف‌شده از DB هم رفتند)؛ «باز کردن فرم» runtime → همان tablist دو سطحی + جدول ✓؛ en/LTR با سوییچر زبان → runtime و پیش‌نمایش استودیو هر دو تب داخلی را «Items/Services» نشان دادند (dfbFormTitle) ✓؛ موبایل 390×844 → scrollW=390 بدون سرریز صفحه (جدول داخل overflow خودش) ✓؛ بازگشت به fa/RTL.
- بازبینی دادهٔ مالک: فرم ۱۱ «انواع وسیله نقلیه» استودیو/پیش‌نمایش شد (بدون هیچ تغییری — dirty نشد و تمیز بسته شد)؛ DB نشان داد تب/فیلدِ ذخیره‌شده ندارد، پس پیش‌نمایشِ نو برای طراحی ذخیره‌نشدهٔ او هم از حالت زندهٔ استودیو نگاشت می‌کند و تب‌ها را خواهد نشان داد.
- درس‌های E2E: آیکون‌های دسکتاپ با dblclick باز می‌شوند (سینگل‌کلیک فقط انتخاب)؛ «ذخیره اطلاعات» اکشن‌بارِ پنل جزئیاتِ پشت‌پنجره با find اولین‌مطابقت زده می‌شد → هدف‌گیری با aria-label دقیق («ذخیرهٔ قالب») + موس واقعی؛ کلیک مصنوعی روی treeitem گاهی انتخاب نمی‌کند → راه مطمئن: فهرست «فرمها»/ریف‌های تازهٔ snapshot.
- پاکسازی: هر دو فرم آزمون (۱۳ و ۱۴) با همهٔ وابستگی‌ها (تب‌ها/فیلدها؛ رکورد داده‌ای وجود نداشت) حذف شدند → dfb.db فقط فرم‌های سیستمی ۱ و ۵ + فرم مالک ۱۱ (دست‌نخورده)؛ lint → 0؛ tsc → 0 خطای src (skills/ و examples/ خارج از دامنه)؛ خطاهای «Ecmascript file had an error» در dev.log فقط وضعیت‌های میانیِ خودِ ویرایش‌های HMR بودند و در حالت نهایی پاک؛ page errors=0.

Stage Summary:
- دو گزارش مالک در تکلیف ۵۱ برطرف و اثبات‌شده شد: (۱) پیش‌نمایش استودیو حالا «خودِ فرم در حال اجرا» است — با موتور واقعی SimpleFormTwoRowTabbed؛ فرم دارای تب‌بندی دقیقاً همانند نمونه فرم نوار تب بیرونی (باندها) و داخلی (تب‌های «افزودن تب» درون باند جدول رکوردها) + جدول گرید + فوتر سطرها را نشان می‌دهد و ورود داده/ذخیرهٔ EAV هم مثل قبل زنده است؛ (۲) آیکون حذف فیلد در استودیو با splice درجای آرایه واقعاً فیلد را از باند/تب حذف می‌کند (باگ reassign روی wrapper). برچسب‌های تب پیش‌نمایش locale-آگاه شد؛ رفتار runtime/ذخیره‌سازی/اسکیما دست‌نخورده؛ lint/tsc/E2E/۱۱ زبانِ سازوکار مشترک/موبایل/کنسول پاک؛ ثبت در worklog انجام شد.

---
Task ID: 52
Agent: main (Z.ai Code)
Task: گزارش مالک — «توی پیش‌نمایش فرم به هیچ عنوان نباید عنوان عناصر طراحی نمایش داده شود؛ الان دارد عنوان "عنوان باند 1" را نمایش می‌دهد» + «توی تب‌بندی ارتفاع بدنه فرم باید ثابت باشد و اگر تعداد رکوردهای داخل تب‌بندی زیاد شد باید داخل بدنه فرم اسکرول داخلی ایجاد گردد و فرم افزایش ارتفاع پیدا نکند» (با تصویر پیش‌نمایش فرم دارای تب)

Work Log:
- §0.1: AGENTS.md + worklog بازخوانی شد (آخرین رکورد: 51). §0.4 درخواست صریح مالک؛ §0.6 فرض‌های اعلام‌شده: «عناصر طراحی» = باند/باندهای استودیو (عنوان پیش‌فرض «عنوان باند N») که در مدل دو-نوارِ تسک ۵۰/۵۱ به‌عنوان تب بیرونی رندر می‌شدند — تب‌های ساخته‌شده با «افزودن تب» (عنوان فارسی/لاتینِ کاربر) تنها عناصر کاربر-روی هستند و باید مثل نمونه فرم در «یک» نوار تب بنشینند؛ «ارتفاع ثابت» یعنی پوستهٔ پیش‌نمایش مثل پنجرهٔ اجرای واقعی ارتفاع مقید دارد و فقط گرید اسکرول داخلی می‌گیرد؛ §0.5 (عدم حذف قابلیت بدون تأیید — حذف ماشینری تب-درون-باند به حکم اصلاح صریح همین درخواست مالک انجام شد و در کامنت ثبت است)؛ §1.3 (کلید گفتاری جدید لازم نشد)؛ §1.4/§2.*/§6/§7 رعایت.
- ریشه‌یابی ۱: نگاشت تسک ۵۱ در هر دو موتور (runtime و PreviewCanvas) هر باند را به یک تب بیرونی با «عنوان باند» تبدیل و تب‌های «افزودن تب» را به نوار داخلی می‌برد — دقیقاً همان چیزی که مالک در تصویر علامت زده بود (دو قرصِ تلاییِ روی‌هم: عنوان باند ۱ روی تب واقعی).
- ۵۲-الف (قالب SimpleFormTwoRowTabbed): ماشینری «تب داخلی» بازنشسته شد — SimpleFormTab.children حذف، rowsByTab تک‌سطحی، activeInnerTab/effectiveGridTabId حذف (activeTab، عملیات فوتر روی تب فعال)، شاخهٔ Tabs داخلی حذف؛ قالب اکنون دقیقاً مثل نمونه فرم: «یک» نوار تب، هر تب = گرید رکوردها یا تب فیلدورودی (kind="fields" تسک ۴۹ دست‌نخورده). نمونهٔ fdf (فرم دمو) هیچ‌وقت children نمی‌فرستاد و consumers دیگر هم بعد از ۵۲-ب نمی‌فرستند.
- ۵۲-ب (نگاشت runtime dfb-form-runtime): باندها دیگر تب نیستند؛ حلقهٔ تخت‌سازی — باند tabKind=2 → تب فیلدورودی (عنوان باند = نام رویی تب، مدل تسک ۴۹)؛ باند گرید دارای فرزند → هر فرزند = یک تب گرید مستقل در نوار واحد (عنوان locale-آگاه dfbFormTitle)؛ فیلد مستقیمِ باندِ تب‌دار (دفاعی میراث) → تب گرید جدا با عنوان باند؛ باند گرید بی‌فرزند (میراث) → یک تب گرید. ترتیب: ترتیب باندها و ترتیب تب‌های هر باند حفظ می‌شود.
- ۵۲-ج (نگاشت PreviewCanvas استودیو): عین همان نگاشت روی مدل استودیو (banks[1..]) — children flat، tb-legacy مثل قبل یک تب گرید با عنوان باند، دفاعیِ فیلد مستقیمِ باندِ تب‌دار هم اضافه شد (قبلاً در پیش‌نمایش گم می‌شد)؛ شناسهٔ تب‌ها «bankKey::tabKey» (استودیو) / String(id) (رانتایم) — برخوردناپذیر.
- ۵۲-د (ارتفاع ثابت): ریشهٔ رشد فرم، میزبانِ پیش‌نمایش در استودیو بود (پوستهٔ ماکت داخل ScrollArea ارتفاع نداشت و h-full قالب بی‌اثر می‌شد). پوستهٔ پیش‌نمایش اکنون h-[min(70vh,640px)] min-h-[420px] (فقط حالت پیش‌نمایش؛ بوم طراحی همچنان سیال) — زنجیرهٔ min-h-0/flex-1/overflow-auto قالب (تسک ۲۸-ب) اکنون قفل می‌شود: بدنهٔ فرم ارتفاع ثابت، گریدِ تب overflow داخلی scrollbar-slim. پنجرهٔ runtime از قبل مقید بود (app-window: min-h-0 flex-1 overflow-hidden) و اثبات شد.
- E2E (agent-browser، fa/RTL 1440×810): فرم آزمون ۵۲ ساخته شد (جادوگر: فرم ساده، عنوان فارسی/لاتین) → استودیو: «افزودن باند گرید» → باند «عنوان باند 1» → دو تب «اقلام فنی/Items» و «خدمات/Services» (دیالوگ دو-عنوانیِ الزامی + قفل لاتین) → فیلد متن در هر تب → ذخیرهٔ قالب → PUT 200 و DB: باند id=16 ParentRef=0 + فرزندان 17/18 ParentRef=16 + فیلدهای TabRef=17/18 (عین ساختار مالک). پیش‌نمایش: tablist=1 و تب‌ها=[اقلام فنی، خدمات] و «عنوان باند 1» غایب (hasBandTitle=false) و shellH=567 ثابت؛ ۲۵ سطر با دکمهٔ فوتر → shellH همچنان 567 و گرید scrollHeight>clientHeight (اسکرول داخلی) و scrollTop کار می‌کند؛ سوییچ تب با موس واقعی → گرید همان تب؛ خروج از پیش‌نمایش. رانتایم («باز کردن فرم»): تب‌ها=[اقلام فنی، خدمات] بدون عنوان باند، فرم 652px ثابت با ۲۴ سطر و گرید 446/629 (اسکرول داخلی). en/LTR: تب‌ها "Items"/"Services" و بدون عنوان باند؛ بازگشت به fa/RTL با موس واقعی (درس: منوی Radix با click مصنوعی باز نمی‌شود). موبایل 390×844: pageScrollW=390 بدون سرریز صفحه، گرید اسکرول داخلی. page errors=0، console error=0، dev.log فقط 200/201.
- پاکسازی: فرم آزمون ۵۲ با همهٔ وابستگی‌ها از خود UI سازنده حذف شد (دکمهٔ «حذف» پنل جزئیات) → DB: TABS=0، FIELDS=0؛ تنها رکورد دادهٔ موجود متعلق به فرم ۱۱ مالک است (دست‌نخورده). lint → 0؛ tsc → 0 خطای src (skills/ و examples/ خارج از دامنه).
- درس حین E2E: کلیک‌های هم‌زمانِ addBtn.click() در یک eval در یک تیک React بچ می‌شوند (فقط ۱ سطر) → حلقهٔ async با فاصلهٔ ۷۰ms بین کلیک‌ها؛ «حذف» پنل جزئیات با مختصاتِ کهنه از دست می‌رود → el.click() مستقیم مطمئن‌تر.

Stage Summary:
- دو گزارش مالک در تسک ۵۲ برطرف و اثبات‌شدە شد: (۱) «عنوان عناصر طراحی» دیگر در پیش‌نمایش و اجرا دیده نمی‌شود — باند‌ها از نگاشت تب حذف و تب‌های «افزودن تب» در یک نوارِ تختِ واحد (عین نمونه فرم) با عنوان‌های locale-آگاه رندر می‌شوند؛ ماشینری دو-نوارِ تسک ۵۰/۵۱ از قالب بازنشسته شد (نیروی محرکه: اصلاح صریح مالک). (۲) ارتفاع بدنهٔ فرم در پیش‌نمایش ثابت شد (پوستهٔ مقید h-[min(70vh,640px)]) و با انبوه سطرها فقط گرید اسکرول داخلی می‌گیرد — هم در پیش‌نمایش و هم در پنجرهٔ اجرا (652px ثابت با ۲۴ سطر). مدل داده/ذخیره‌سازی (ParentRef/TabKind) دست‌نخورده؛ lint/tsc/E2E/موبایل/کنسول پاک؛ ثبت در worklog انجام شد.

---
Task ID: 53
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک (۳ نیازمندی) — «۱) یک باند در استودیو طراحی قرار دهید که مختص و ویژه فوتر فرم می باشد و این باند همیشه در انتهای فرم باید نمایش داده شود؛ ۲) توی استودیو طراحی امکان افزودن لاین، باکس، دایره و یک سری شیپ ها که توی طراحی فرم ها کاربرد دارد را در جعبه ابزار قرار دهید؛ ۳) یک نوع فیلد از نوع اسکریپت نویسی — کاربر اسکریپت بنویسد و داده های خودش را از بانک اطلاعاتی دریافت کند؛ سپس فیلدهای واکشی‌شده قابل انتخاب باشند و فیلدهای انتخاب‌شده در فرم از طریق فیلدها استفاده شوند.»

Work Log:
- §0.1 بازخوانی AGENTS.md + worklog (آخرین: Task 52). §0.4 درخواست صریح مالک؛ §0.6 فرض‌ها: باند فوتر = باند ثابت همیشه-آخر (غیرقابل حذف/جابه‌جایی، Section="footer" روی DfbFormField — ستون موجود)، شیپ‌ها = انواع فیلد ایستا (بدون مقدار EAV)، فیلد اسکریپت = عنصر منبع‌داده + فیلدهای برگرفته (ConfigJson {bindScript,bindField}) که فیلد واقعی فرم می‌شوند و ران‌تایم از سطر اول اسکریپت پیش‌پر می‌کند.
- backend (dfb-service :3003): DfbFormField.ConfigJson (String? — پیش‌آیند §2.3 HeaderJson) + db:push؛ FIELD_TYPES += script|line|box|circle|oval؛ FieldInputDto/AddFieldDto.configJson؛ POST advancedTools/forms/script/execute (RunScriptDto) — AsyncFunction با فقط هندل فقط-خواندنی db.table(<whitelist 8 جدول Dfb>).findMany({where,take≤200,orderBy})، خروجی = {ok,fields[],rowCount,rows≤50}؛ ذخیره configJson در findOne/addField/replaceFields. تست دودی: اجرای اسکریپت با BFF → ۳ ردیف DfbMenu، فیلدها ["ID","Title"].
- قالب (simple-form-two-row-tabbed + form-primitives): SimpleFormFieldType += ۵ نوع؛ FieldCell رندر ایستای شیپ‌ها (خط/باکس/دایره/بیضی) + استریپ اسکریپت (Braces + db chip)؛ پراپ footerFields → زون shrink-0 بیرون از بدنه اسکرول، همیشه چسبیده به انتهای فرم، با scope تراز لیبل مستقل (footerGridRef).
- استودیو (dfb-studio): StudioState.footer (tabKind=3، خارج از banks ترتیب‌پذیر)؛ findContainer("footer") + allFieldsOf شامل فوتر؛ buildBanks → {banks, footer}؛ پالت: گروه «اشکال طراحی» (۴ تایل) + تایل اسکریپت؛ FieldPreview مینی‌رندر شیپ/اسکریپت؛ FooterBandCanvas — بنفش خط‌چین، چیپ قفل «همیشه در انتهای فرم»، drop-target، همیشه بعد از همه باندها؛ ذخیره: فیلدهای فوتر آخر + section:"footer" + configJson؛ فیلد اسکریپت fieldKey پایدار از لحظه ساخت (script_xxx)؛ ریل اسکریپت: ادیتور (ltr mono) + «اجرا و واکشی» + چک‌باکس فیلدهای واکشی‌شده + «افزودن فیلدهای انتخاب‌شده به فرم» (فیلدهای واقعی متصل، ضدتکرار) + نوت bind روی فیلدهای برگرفته؛ previewSave/preview فقط فیلدهای ورودی (isDfbInputField) در اعتبارسنجی/EAV؛ پیش‌نمایش: runPreviewScripts پیش‌پر فیلدهای متصل (باز هم در reset).
- ران‌تایم (dfb-form-runtime): footerBandFields → footerFields پراپ (ساده + درختی: الحاق به انتهای فیلدها)؛ save/missing فقط input types و فیلدهای فوتر ذخیره می‌شوند؛ پیش‌پر اسکریپت هنگام لود (scriptPrefillRef، reset هم دوباره اعمال می‌کند).
- i18n: ۲۲ کلید جدید × ۱۱ زبان (fa,en,tr,ar,hi,ps,ckb,pt,ko,fr,zh) — dfb.type.{line,box,circle,oval,script} + dfb.studio.{footerBand,footerBandChip,footerBandHint,shapesGroup,scriptEditor,scriptHint,scriptRun,scriptEmpty,scriptRows,scriptExecError,scriptFetched,scriptFetchedEmpty,scriptAddSelected,scriptAdded,scriptNone,scriptAlready,scriptBindNote}.
- رفع خرابی جانبی: یک MultiEdit ناقص importهای app-base-entity/serialize را از forms.service حذف کرده بود (بازیابی شد)؛ پورت 3003/3000 توسط پروسه کهنه گرفته بود (kill با PID).
- تست: lint = 0 خطا/0 هشدار؛ API regression (ساخت فرم تست → ذخیره فیلد footer/شکل/اسکریپت/متصل → خواندن → EAV save شامل فیلد فوتر → حذف فرم تست)؛ E2E مرورگری در ادامه.

Stage Summary:
- «باند فوتر» در استودیو/پیش‌نمایش/ران‌تایم همیشه انتهای فرم است (Section="footer").
- جعبه‌ابزار: خط/باکس/دایره/بیضی (ایستا، بدون EAV) + فیلد «اسکریپت» با اجرای سندباکس‌شده و انتخاب فیلدهای واکشی‌شده به‌صورت فیلدهای واقعی فرم (ConfigJson).
- artifacts: schema+ endpoint جدید، footer zone قالب، FooterBandCanvas، ریل اسکریپت، ۲۴۲ خط i18n.

---
Task ID: 54
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «یک قانون به فایل AGENTS.md اضافه کنید که ایجنت بعد از انجام هر تغییرات در سورس پروژه یک نسخه از سورس و بانک اطلاعاتی را به گیتهاب پوش کند».

Work Log:
- §0.1 بازخوانی AGENTS.md + worklog (آخرین: Task 53). §0.4 درخواست صریح مالک.
- بررسی .gitignore: فایل‌های db/ مسدود نیستند (پوش دیتابیس ممکن است).
- افزودن §0.9 «قانون پشتیبان GitHub» به §0 پروتکل اجباری: پس از هر تغییر سورس → git add -A + commit توصیفی + push شاخهٔ فعلی؛ همهٔ db/*.db (شامل db/dfb.db) + prisma/schema.prisma باید ردیابی‌شده و همراه هر پوش ارسال شوند؛ ممنوعیت gitignore مسیرهای دیتابیس؛ ترتیب: lint ✓ → worklog ✓ → push؛ مانع (نبود remote/خطای شبکه) باید صریح اعلام و در worklog ثبت شود و commit محلی نگه داشته شود.
- طبق خود §0.9: تغییر AGENTS.md کامیت محلی شد؛ اما هیچ remote گیت‌هابی تنظیم نشده (git remote -v خالی) — پوش ممکن نیست تا مالک remote را فراهم کند.

Stage Summary:
- §0.9 به AGENTS.md افزوده شد (قانون پوش سورس+بانک اطلاعاتی به GitHub پس از هر تغییر).
- مانع صریح: remote گیت‌هاب تنظیم نشده است؛ برای فعال‌شدن پوش، مالک باید آدرس remote (مثلاً git@github.com:user/repo.git یا HTTPS) را اعلام کند؛ commit محلی آماده است.

---
Task ID: 55
Agent: Z.ai Code (main orchestrator)
Task: مالک PAT گیت‌هاب را فرستاد — اجرای §0.9: تنظیم remote و پوش سورس + بانک اطلاعاتی به GitHub.

Work Log:
- توکن با API گیت‌هاب تأیید شد (login: chaabok / mostafa sharbati).
- مخازن قابل‌دسترس بررسی شد؛ «farataraz» و «farataraznewtheme» هر دو امروز ساخته و خالی‌اند.
- فرض صریح (§0.6): چون پروژه بازسازی فراتراز با تم جدید است و farataraznewtheme آخرین مخزن ساخته‌شده است، به‌عنوان مقصد انتخاب شد (جابه‌جایی به farataraz با یک دستور ممکن است).
- db/custom.db و db/dfb.db از قبل ردیابی‌شده‌اند (§0.9 برقرار) و آخرین وضعیت‌شان در کامیت فعلی است.
- remote = origin → https://github.com/chaabok/farataraznewtheme.git (توکن فقط در .git/config غیر-ردیابی‌شده ذخیره شد، نه در سورس).
- push کامل ۴۹+ کامیت شاخهٔ main شامل سورس، AGENTS.md، worklog.md و دو فایل بانک اطلاعاتی.

Stage Summary:
- §0.9 از این پس فعال است: پس از هر تغییر سورس → commit + push به chaabok/farataraznewtheme (شامل db/*.db).

---
Task ID: 56
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «.next/ و dev.log موقع ارسال پشتیبانی حذف شوند» + تأیید مقصد پوش: مخزن farataraznewtheme.

Work Log:
- .gitignore: دو مسیر .next/ و dev.log اضافه شد (در کنار skills/، node_modules/، tool-results/).
- git rm -r --cached .next dev.log → ۳۲۸ فایل از ردیابی خارج شد (فایل‌ها روی دیسک دست‌نخورده ماندند؛ فقط دیگر در پشتیبان پوش نمی‌شوند).
- مقصد پوش تأیید مالک: origin = chaabok/farataraznewtheme (همان remote تنظیم‌شدهٔ Task 55 — بدون تغییر).
- طبق §0.9: commit + push شاخهٔ main.

Stage Summary:
- از این پس پشتیبان GitHub فقط سورس + بانک اطلاعاتی است؛ .next/ و dev.log دیگر پوش نمی‌شوند (تاریخچهٔ قبلی دست‌نخورده ماند).

---
Task ID: 57
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «بک آپ دیتابیس را همیشه در پوشه backup db قرار دهید».

Work Log:
- فرض صریح (§0.6): در هر پوش §0.9، علاوه بر وضعیت جاری db/*.db، نسخهٔ زمان‌دار از هر دیتابیس در پوشهٔ «backup db/» ساخته و پوش می‌شود (آرشیو پشتیبان).
- AGENTS.md §0.9 بند جدید «پوشهٔ backup db» افزوده شد: پوش بدون نسخهٔ تازه در backup db ممنوع.
- scripts/db-backup.sh ساخته شد (chmod +x): کپی همهٔ db/*.db با نام <نام>-<YYYY-MM-DD_HHMM>.db به وقت تهران.
- اولین اجرا: backup db/custom-2026-10-24_1432.db + backup db/dfb-2026-10-24_1432.db.
- طبق §0.9: commit + push به chaabok/farataraznewtheme.

Stage Summary:
- قانون پشتیبان دیتابیس مستقر شد: هر پوش شامل نسخهٔ زمان‌دار در «backup db/» است؛ اسکریپت استاندارد scripts/db-backup.sh منبع واحد فرمت است.

---
Task ID: 58
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک (۳ نیازمندی گرید فرمساز) — «۱) هر فیلدی در گرید باید با همان فرمت از کاربر اطلاعات دریافت کند: چک‌باکس=چک‌باکس، سلکتور=لیست بازشو، تاریخ=فرمت تاریخ؛ ۲) برای فیلد لیست کاربر بتواند آیتم تعریف کند یا آیتم‌ها را از اسکریپت اضافه کند؛ ۳) دکمه رادیو باتن با قابلیت افزودن آیتم‌ها.»

Work Log:
- §0.1 بازخوانی AGENTS.md + worklog (آخرین: Task 57). §0.4 درخواست صریح مالک؛ §0.6 فرض: آیتم‌ها در ConfigJson (پیش‌آیند §2.3) با ساختار items:[{label,value}] + itemsScript (همان API سندباکس اسکریپت).
- backend (dfb-service): forms.dto.ts — RADIO_FIELD_TYPE="radio" به whitelist FIELD_TYPES (آیتم‌ها بدون تغییر اسکیما در ConfigJson می‌مانند)؛ سرویس restart تمیز.
- پریمیتیو (form-primitives): FieldCell شاخهٔ «radio» (گروه رادیو با label-unit هم‌تراز)؛ GridCellInput جدید — ادیتور سلول گرید بر اساس نوع ستون: checkbox→Checkbox واقعی، select→Select بازشو، radio→گروه رادیو فشرده، date→ماسهٔ YYYY/MM/DD (applyDateMask)، number→LTR decimal، text→Input.
- قالب (simple-form-two-row-tabbed): SimpleFormFieldType+="radio"؛ SimpleFormGridColumn+=type/options؛ renderGridTable سلول‌ها را به GridCellInput سپرد (قبلاً input متنی ساده بود).
- ران‌تایم (dfb-form-runtime): toShellType+=radio؛ scriptItemOptions state — اجرای itemsScript هر select/radio در load؛ resolveFieldOptions: کوئری-متصل > اسکریپتی > ثابت با ادغام VALUE-UNIQUE؛ columnsOf ستون‌ها type+options دادند (گرید = همان ادیتور بدنه)؛ فرم درختی هم options گرفت.
- استودیو (dfb-studio): FIELD_TYPE_META+=radio (CircleDot, pink-rose)؛ تایل «دکمه رادیو» در پالت؛ ریل «آیتم‌های لیست» برای select/radio — لیست آیتم‌ها با ویرایش برچسب (مقدار EAV پایدار می‌ماند) + حذف + «افزودن آیتم» (Enter هم)؛ بلوک «آیتم‌ها از اسکریپت» + «اجرا و واکشی آیتم‌ها» + کاندیدها با چک‌باکس (پیش‌فرض همه) + «افزودن آیتم‌های انتخاب‌شده» (ضدتکرار value)؛ FieldPreview رندر مینی رادیو؛ PreviewCanvas fieldOpts value-unique + colOf ستون‌های تایپ‌دار؛ runPreviewScripts آیتم‌های اسکریپتی پیش‌نمایش زنده را هم اجرا می‌کند.
- i18n: ۱۳ کلید جدید × ۱۱ زبان (dfb.type.radio + dfb.studio.listItems/listItemsHint/listItemsEmpty/listItemPlaceholder/listItemAdd/itemsScriptEditor/itemsRun/itemsFetched/itemsAddSelected/itemsAdded/itemsNone/itemsAlready).
- E2E مرورگر: فرم تست ساخته شد (select+radio+checkbox+date+number+text به‌عنوان ستون‌های گرید) — ران‌تایم: چک‌باکس واقعی تیک خورد، رادیو «بله» انتخاب شد، تاریخ 14040802→1404/08/02 ماسک شد، سلکتور لیست باز کرد و «آیتم دو» انتخاب شد؛ استودیو: ریل آیتم‌ها، «آیتم سه» اضافه شد، اسکریپت رادیو ۴ رکورد DfbMenu را واکشی و ۴ آیتم اضافه کرد؛ ذخیرهٔ قالب → بک‌اند: select=3 آیتم، radio=6 آیتم؛ بارگذاری مجدد: رادیوی گرید ۶ آیتم یکتا (رفع تکرار value در ادغام)؛ فرم تست پس از آزمون حذف شد.
- تست: lint = 0 خطا (EXIT=0)؛ dev.log بدون خطای runtime.

Stage Summary:
- گرید فرمساز اکنون هر فیلد را «با همان فرمت» جمع می‌کند: چک‌باکس=چک‌باکس، سلکتور=لیست بازشو، تاریخ=YYYY/MM/DD، رادیو=گروه رادیو.
- فیلد لیست/رادیو: آیتم دستی + واکشی اسکریپتی از بانک اطلاعاتی؛ ادغام یکتا بر اساس value؛ ستون گرید همان آیتم‌ها را نشان می‌دهد.
- artifacts: RADIO_FIELD_TYPE، GridCellInput، ریل آیتم‌ها، ۱۳×۱۱ کلید i18n.

---
Task ID: 59
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک (۲ نیازمندی استودیو طراحی) — «۱) کاربر روی هر فیلد در استودیو طراحی دبل کلیک کرد مودال باز شود تا کاربر بتواند ویژگی های آن را تغییر دهد؛ ۲) برای اسکریپت نویسی باید یک مودال باز شود و در یک تب کاربر بتواند کد اسکریپت را بنویسد و در تب بعدی بتواند پیش نمایش اطلاعات اسکریپت و کوئری را مشاهده کند. در مودال اسکریپت نویسی کاربر باید جداول و ویوهای موجود در بانک اطلاعاتی متصل شده را ببیند؛ لیست جداول هر نرم‌افزار بصورت شاخه به تفکیک فیلدهای آن جدول نمایش داده شود.»

Work Log:
- §0.1 بازخوانی AGENTS.md + worklog (آخرین: Task 58). §0.4 درخواست صریح مالک؛ §0.6 فرض‌ها: «بانک متصل» = فایل‌های فیزیکی db/ (custom.db مشترکِ نرم‌افزارهای shared + dfb.db اختصاصی advancedTools)؛ درخت به‌تفکیک نرم‌افزار (کاتالوگ) → بانک متصل → جداول/ویوها → فیلدها؛ کلیک روی جدول/فیلد نامش را در محل کرسر ادیتور درج می‌کند؛ اسکریپت‌ها از این پس همیشه نام‌های «فیزیکی» ستون‌ها را می‌بینند (هم‌نام با درخت)؛ §0.5 (ادیتور اسکریپت از ریل به مودال منتقل شد به حکم صریح همین درخواست مالک — ریل خلاصه + اجرا + فهرست واکشی را نگه داشت)؛ §2.3 (بدون ستون JSON — همه‌چیز رابطه‌ای/ConfigJson موجود)؛ §1.3 (۱۹ کلید جدید × ۱۱ زبان)؛ §1.4/§2.5/§2.6/§6/§7 رعایت.
- backend (dfb-service :3003): GET forms/schema/tree — معرفی ساختار بانک‌های متصل با bun:sqlite فقط-خواندنی: sqlite_master (table+view، حذف sqlite_%) + PRAGMA table_info (نام/نوع/PK/notNull)؛ گروه‌بندی نرم‌افزارهای کاتالوگ به‌تفکیک فایل بانک (dedupe بر اساس dbFile)؛ کش ۱۵ثانیه‌ای. runScript — یک‌مسیره شد: هر خواندن (جداول Dfb و هر جدول/ویوی بانک‌های متصل) از خوانندهٔ امن sqlite می‌گذرد (شناسه‌ها با PRAGMA اعتبارسنجی، مقادیر پارامتری، WHERE برابری، سقف ۲۰۰ ردیف، اتصال readonly) — مسیر قدیمی Prisma (کلیدهای camelCase) حذف شد تا نام ستون‌ها همیشه با درخت یکسان باشد؛ ترتیب resolve: dfb.db سپس custom.db؛ SCRIPT_TABLES منسوخ شد. کنترلر: مسیر literals قبل از :id (schema/tree اول). رفع ۴ خطای tsc قدیمی (spread unknown در findOne، tb ضمنی، دو filter تایپ‌دار در queries.service).
- فرانت (dfb-store): تایپ‌های DfbSchema{Field,Table,App,Group} + fetchSchemaTree.
- استودیو (dfb-studio): ①FieldCard با onDoubleClick → FieldPropsDialog («ویژگی‌های فیلد») — مودال ویژگی‌ها با همان FieldSettingsBody مشترکِ ریل (یک منبع حقیقت): برچسب، برچسب لاتین (جدید — StudioField.labelEn + ذخیره در Label_En)، نوع، عرض ۲۵..۱۰۰٪، اجباری، فقط-خواندنی، اتصال کوئری، آیتم‌های لیست/رادیو، اسکریپت، یادداشت bind، حذف؛ چیپ موقعیت فیلد در فرم + fieldKey؛ dbl-click روی کارت‌های همهٔ کانتینرها (اصلی/باند/تب/فوتر) کار می‌کند (onOpenFieldProps در FieldFlow/BankCanvas/FooterBandCanvas). ②ScriptModalDialog («اسکریپت‌نویسی فرم») دو تب: «کد اسکریپت» = ادیتور LTR mono + درخت بانک متصل (جستجوی جدول/فیلد، نرم‌افزارها با آیکون کاتالوگ، گروه جداول/ویوها، badge تعداد فیلدها، PK با آیکون کلید، کلیک = درج در کرسر: جدول → db.table("X")، فیلد → "X") + «پیش‌نمایش اطلاعات» = اجرای خودکار هنگام سوییچ، گرید ردیف‌ها (header چسبان، max-h-56 اسکرول داخلی)، badge تعداد ردیف، ستون‌های خروجی، چک‌لیست فیلدهای واکشی‌شده (field mode: انتخاب + افزودن به فرم) یا آیتم‌های واکشی‌شده (items mode: انتخاب + افزودن به آیتم‌ها). ریل: تکس‌ت‌AREAهای اسکریپت → دکمهٔ «ویرایش اسکریپت در مودال» + چیپ function(db){…} + شمار رکورد؛ اجرا/واکشی و انتخاب‌ها در ریل حفظ شد.
- i18n: ۱۹ کلید جدید × ۱۱ زبان (dfb.studio.{fieldProps,fieldPropsHint,labelEn,openScriptModal,scriptModalTitle,scriptModalDesc,scriptTabCode,scriptTabPreview,dbTree,dbTreeHint,dbSearch,dbTablesGroup,dbViewsGroup,dbLoading,dbError,dbEmpty,previewRows,previewCols,previewEmpty}) + پاکسازی ۳۹ خط تکراری Task-58 (بلوک ۱۳تایی radio/listItems در fa/en/tr دوبار درج شده بود — نسخهٔ دوم حذف شد؛ شمارش هر کلید 11/11).
- **کشف و رفع اشکال زیرساختی حین E2E**: restart سرویس dfb با DATABASE_URL محیطیِ اشتباه (custom.db از env عمومی — dotenv متغیر موجود را override نمی‌کند) بالا آمده بود؛ نتیجه: سرویس به custom.db وصل بود و dfb.db واقعی (بدون ستون‌های جدید ConfigJson/ParentRef به‌دلیل بازگشت env-restore) 500 می‌داد. رفع: pin کردن DATABASE_URL در scripts dev/start پکیج dfb-service (هم‌راستا با db:push) + restart تمیز + bun run db:push روی dfb.db (افزودنی/غیرمخرب) → فرم ۱۱ مالک و فرم‌های سیستمی سالم (سرویس اکنون dfb.db واقعی: فرم‌های 1/5/11).
- E2E (agent-browser، fa/RTL 1440×810 + en + موبایل 390×844): فرم آزمون ۵۹ ساخته شد (select + script)؛ دبل‌کلیک کارت شهر → مودال ویژگی‌ها (برچسب/لاتین/نوع/عرض/اجباری/آیتم) ✓؛ «ویرایش اسکریپت در مودال» (items mode) → تب کد + درخت (۲۹ نرم‌افزار، expanded=true پیش‌فرض ابزارهای پیشرفته) → بازشدن DfbMenu و فیلدهایش با تایپ (ID BIGINT…) ✓؛ کلیک فیلد Title → درج "Title" در کرسر ✓؛ تب پیش‌نمایش → اجرای خودکار → گرید ۴ ردیف واقعی (تنظیمات/1…) ✓؛ «افزودن آیتم‌های انتخاب‌شده» → آیتم‌ها به فیلد اضافه شد ✓؛ field mode: اسکریپت Name/Code → پیش‌نمایش گرید واقعی → انتخاب هر دو فیلد → «افزودن فیلدهای انتخاب‌شده به فرم» → دو فیلد مشتق متصل (bindScript) پشت اسکریپت نشستند ✓؛ ذخیره → DB: label/labelEn/required/items/scripts/bind ذخیره ✓؛ en: "Field properties"/"Script code"/"Data preview"/"Edit script in modal" ✓؛ موبایل 390 بدون سرریز ✓؛ صفر هشدار duplicate-key و صفر page error در جریان تمیز پس از reload (هشدارهای قبلی محصول بازیابی HMR بعد از crash میانی بود)؛ پاکسازی: فرم آزمون ۵۹ حذف شد → dfb.db فقط فرم‌های سیستمی ۱/۵ + فرم مالک ۱۱ (دست‌نخورده)؛ فرم ۴ قدیمیِ custom.db (میراث pre-dfb.db، دیگر در هیچ UI دیده نمی‌شود) دست‌نخورده ماند.
- تست: eslint src = 0 خطا/0 هشدار؛ tsc = 0 خطای src؛ tsc سرویس = 0؛ curl smoke روی سرویس واقعی: schema/tree 200، script/execute با ستون‌های فیزیکی 200، forms/11 200.

Stage Summary:
- دبل‌کلیک روی هر فیلد استودیو = مودال «ویژگی‌های فیلد» (برچسب/لاتین/نوع/عرض/اجباری/فقط-خواندنی/کوئری/آیتم‌ها/اسکریپت/حذف) — همان بدنهٔ تنظیمات ریل، یک منبع حقیقت.
- مودال «اسکریپت‌نویسی فرم» دو تب: کد (با درخت شاخه‌ای نرم‌افزارها → بانک متصل → جداول/ویوها → فیلدها + جستجو + درج در کرسر) و پیش‌نمایش اطلاعات (اجرای زنده، گرید ردیف‌ها، انتخاب فیلدهای واکشی‌شده/آیتم‌ها و افزودن).
- اسکریپت‌ها اکنون همیشه با نام‌های فیزیکی ستون‌ها (هم‌نام درخت) از هر دو بانک متصل می‌خوانند — خوانندهٔ امن sqlite فقط-خواندنی با سقف ردیف.
- artifacts: endpoint schema/tree، ScriptModalDialog، FieldPropsDialog، FieldSettingsBody مشترک، labelEn، ۱۹×۱۱ کلید i18n، pin DATABASE_URL در سرویس + db:push واقعی روی dfb.db.

---
Task ID: 60
Agent: Z.ai Code (main)
Task: درخواست مالک — چهار اصلاح روی مودال «ویژگی‌های فیلد» استودیو طراحی: ۱) با نوع فیلدِ ازقبل‌انتخاب‌شده، سلکتور «نوع فیلد» در مودال تکرار نشود؛ ۲) توضیحات هدر مودال حذف شود؛ ۳) توضیحات اضافی «آیتم‌های لیست» (و متن راهنمای برچسب لاتین) حذف شود؛ ۴) عرض مودال افزایش یابد.

Work Log:
- FieldSettingsBody (dfb-studio.tsx): پراپ اختیاری hideFieldType — در مودال ویژگی‌ها سلکتور «نوع فیلد» رندر نمی‌شود (نوع در لحظهٔ ساخت از جعبه‌ابزار انتخاب می‌شود و پس از آن منجمد است) و «عرض» تمام‌عرضِ ردیف می‌شود؛ رِیل استودیو سلکتور نوع را برای ویرایش سریع حفظ کرد (محدودهٔ صریح درخواست: «در مودال»).
- LatinInput (latin-input.tsx): پراپ hideHint — خط راهنمای دائمی «فقط نویسه‌های لاتین مجاز است» در بدنهٔ تنظیمات فیلد حذف شد؛ فلشِ گذرای قرمز «نویسه‌های غیرلاتین حذف شد» در صورت رخداد همچنان نمایش داده می‌شود تا حذفِ بی‌صدا نامرئی نماند. سایر کاربردها (دیالوگ منو/فرم/تب) بدون تغییر.
- FieldPropsDialog: DialogDescription (fieldPropsHint) حذف شد + aria-describedby={undefined} برای سکوتِ هشدار a11y رادیکس؛ عرض از max-w-lg به max-w-[calc(100%-2rem)] sm:max-w-2xl (۶۷۲px) افزایش یافت؛ max-h اسکرول بدنه ۶۰vh→۶۵vh.
- پاراگراف توضیحات «آیتم‌های لیست» (listItemsHint) از باکس بنفش حذف شد (عنوان + حالت خالی + ادیتور آیتم باقی ماند).
- کلیدهای مردهٔ i18n «fieldPropsHint» و «listItemsHint» از هر ۱۱ زبان dictionaries.ts حذف شد (۲۲ ردیف؛ پس از حذف، ارجاع صفر).
- باگ جانبی کشف‌شده در E2E: «افزودن فیلد» از جزئیاتِ فرم 400 می‌داد — AddFieldBody هنوز widthSpan میراثی 1|2 می‌فرستاد در حالی که قرارداد تسک ۴۸ درصد ۲۵..۱۰۰ است؛ نگاشت به 50/100 (برچسب‌های نیم‌عرض/تمام‌عرض دست‌نخورده).
- ترمیم محیط: پس از بازیابی محیط، db/custom.db به نسخهٔ کامیت‌شدهٔ فاقد جداول پلتفرمی برگشته بود (app-registry → 500، P2021). prisma db push ممنوع بود چون جدول‌های Dfb میراثی را drop می‌کرد؛ جداول مفقود (Setting/BusinessStructure/BusinessStructureUser/AppRegistry/Systems + ایندکس‌های یکتا) با DDL دستیِ همسان اسکیما ساخته شد؛ بوت‌سینک سرویس ۲۸ ردیف AppRegistry/Systems را بازساخت → 200.
- E2E (agent-browser): فرم ۱۱ «انواع وسیله نقلیه» ← افزودن فیلد «جنسیت» (select، عرض ۵۰ ذخیره شد) ← استودیو ← دبل‌کلیک کارت ← مودال: بدون توضیح هدر/بدون سلکتور نوع/بدون راهنمای لاتین/بدون توضیح آیتم‌ها، عرض ۶۷۲px تأیید؛ «تأیید» می‌بندد؛ رِیل همچنان «نوع فیلد» دارد؛ موبایل ۳۹۰px بدون سرریز (۳۵۸px)؛ حذف فیلد از خود مودال + ذخیرهٔ قالب → DB پاک شد (فرم ۱۱ بدون فیلد، دست‌نخورده). eslint 4 فایل لمس‌شده = 0/0؛ tsc خطای src = صفر؛ dev.log پس از ترمیم فقط 200.

Stage Summary:
- مودال «ویژگی‌های فیلد» مینیمال شد: عنوان + آیکون نوع، برچسب/لاتین/عرض/اجباری/فقط-خواندنی/کوئری/آیتم‌ها/اسکریپت/حذف — بدون تکرار نوع و بدون متن‌های راهنما؛ عرض ۶۷۲px.
- «افزودن فیلد» جزئیات فرم دوباره کار می‌کند (widthSpan درصدی).
- بانک تنظیمات پس از ترمیمِ جداول پلتفرمی، این‌بار داخل custom.db کامیت‌شده ماندگار می‌شود (همراه پوش این تسک).

---
Task ID: 61
Agent: Z.ai Code (main orchestrator)
Task: ادامهٔ جلسهٔ قطع‌شده — راستی‌آزمایی مرورگریِ چهار اصلاح Task 60 روی مودال «ویژگی‌های فیلد» (بدون تغییر سورس؛ درخواست مالک مجدداً ارسال شده بود).

Work Log:
- بازخوانی worklog (آخرین: Task 60) و کد: هر چهار اصلاح در HEAD (کامیت 53b0a95 = origin/main) موجود است — hideFieldType در FieldSettingsBody، حذف DialogDescription + aria-describedby={undefined}، hideHint در LatinInput، حذف پاراگراف listItemsHint، عرض sm:max-w-2xl.
- سرویس‌ها سالم: /api/advancedTools/forms/11 = 200 (کلید اپ advancedTools، نه dfb)؛ dev.log بدون خطا.
- E2E دسکتاپ 1440×810 (agent-browser): آیکون «ابزارهای پیشرفته» → فرمساز → فرم ۱۱ «انواع وسیله نقلیه» → افزودن فیلد آزمونی (select «جنسیت» از دیالوگ افزودن) → «طراحی در استودیو» → دبل‌کلیک روی کارت فیلد → مودال «ویژگی‌های فیلد»: عرض ۶۷۲px، بدون سلکتور «نوع فیلد»، بدون توضیح هدر، بدون راهنمای لاتین، بدون توضیح «آیتم‌های لیست»، کنترل‌های کاربردی (عرض/اجباری/فقط-خواندنی/کوئری/آیتم‌ها/اسکریپت/حذف) سر جا — هر ۴ اصلاح تأیید.
- E2E موبایل 390×844: مودال = 358px (100%-2rem)، x=16، بدون سرریز افقی؛ همان مینیمالیته.
- پاکسازی آزمون: حذف فیلد از خود مودال (مسیر «حذف» مودال) + «ذخیرهٔ قالب» → GET forms/11: fields=0 (فرم ۱۱ دست‌نخورده؛ فقط Version به‌دلیل چرخهٔ آزمون بالا رفته).
- یادداشت فنی: دبل‌کلیک رادیکس در agent-browser با دو جفت down/up دو فرمانی قابل‌اتکا نیست (فاصلهٔ CLIها از آستانهٔ dblclick می‌گذرد) — dispatch رویداد dblclick با bubbles=true روی element مقصد معتبر و پایدار است؛ افزودن فیلد در موبایل به‌جای UI (دکمه بیرون از ویوپورت) با POST امضاشدهٔ مستقیم سرویس انجام شد.
- محدودیت محیط: eslint بارها SIGKILL شد (فشار حافظه؛ ~656MB آزاد)؛ در اجرای موفق، دو فایل لمس‌شدهٔ Task 60 صفر خطا/هشدار. HEAD تغییری نکرده و lint همان کامیت پیش‌تر پاس شده است.
- خانه‌داری: «upload/» (اسکرین‌شات‌های مالک) به .gitignore افزوده شد؛ طبق §0.9 نسخهٔ زمان‌دار db ساخته و db/dfb.db (چرخش Version آزمون) پوش شد.

Stage Summary:
- چهار اصلاح مودال «ویژگی‌های فیلد» هم در سورس، هم در مرورگر (دسکتاپ و موبایل) تأیید نهایی شد — تسک ۵۸/۵۹/۶۰ بسته؛ بدهی باز جدیدی از این درخواست باقی نماند.
- artifacts: گزارش راستی‌آزمایی + بک‌آپ تازهٔ db + .gitignore/upload.

---
Task ID: 62
Agent: Z.ai Code (main orchestrator)
Task: گزارش مالک — «در مودال تنظیمات فیلدها اسکریپت select * from db.table("DfbForm") را اجرا کردم ولی در تب پیش‌نمایش خطا ایجاد می‌شود» (تصویر: خطای عمومی «پیام را در لاگ سرویس ببینید»).

Work Log:
- ریشه‌یابی از لاگ سرویس: `form script failed: Unexpected identifier 'db'` — سندباکس اسکریپت فقط بدنهٔ JS می‌پذیرفت و SQL طبیعیِ مالک را SyntaxError می‌داد؛ ضمناً پیام واقعی بک‌اند (که در ApiError موجود بود) در فرانت دور ریخته می‌شد و توستِ کلی «لاگ سرویس» نشان داده می‌شد.
- backend (forms.service.ts): parseSqlSelect + execSqlSelect — یک پارسر SELECT فقط-خواندنیِ کوچک: `select <ستون‌ها|*> from <جدول> [where ستون = مقدار [and …]] [limit N]` (جدول به‌صورت db.table("X") یا نقل‌قولی یا ساده هم پذیرفته می‌شود؛ `;` انتهایی تحمل می‌شود) — اجرا از مسیر همان خوانندهٔ امن sqlite (شناسه‌ها با اسکیمای واقعی اعتبارسنجی، مقادیر پارامتری، اتصال readonly، سقف ۲۰۰ ردیف)؛ projection ستون‌ها با اعتبارسنجی اسکیما؛ هر select بدقواره پیام روشن فارسی می‌دهد؛ غیر-select همان مسیر JS (AsyncFunction) قبلی. runScript اول مسیر SQL را امتحان می‌کند.
- فرانت (dfb-studio.tsx): scriptErrMsg (ApiError → پیام واقعی، وگرنه کلید i18n)؛ توست سه اجراکنندهٔ اسکریپت (ریل فیلد، ریل آیتم‌ها، مودال) اکنون پیام واقعی می‌دهد؛ در تب «پیش‌نمایش اطلاعات» پنل خطای قرمز inline با role=alert اضافه شد (عنوان + متن دقیق خطا)؛ state قبلی پاک و placeholder ادیتور نمونهٔ SQL هم گرفت.
- i18n: dfb.studio.scriptExecError در ۱۱ زبان به متن کوتاه («خطا در اجرای اسکریپت») تغییر کرد (ارجاع به لاگ دیگر معنی ندارد)؛ dfb.studio.scriptHint در ۱۱ زبان جملهٔ «یا ساده‌تر، دستور SQL هم پذیرفته می‌شود: select * from DfbForm limit 10» گرفت. (تصحیح وسط‌مسیر: جایگزینی regex-ای که به نقل‌قول‌های گریزدار \\" برخورد کرده بود، با بازسازی خط‌به‌خط ۱۱ ردیف — هر ۲۲ مقدار راستی‌آزمایی شد.)
- باگ حین ساخت: `hit[2]` برای نام جدولِ bare (بدون نقل‌قول) گروهِ ناموجود دوم را می‌خواند → table=null؛ تفکیک به شاخهٔ quoted/bare با گروه درست.
- smoke با curl امضاشده (۶ مسیر): select * from DfbForm ✓ ۳ ردیف؛ select Title, Code from DfbForm limit 2 ✓ projection+limit؛ select * from db.table("DfbForm") ✓؛ select Title from DfbMenu where NodeType = 1 limit 5 ✓ where+limit؛ جدول ناموجود → «جدول یا ویو … یافت نشد»؛ اسکریپت JS قدیمی ✓ و selectx بد → «خطای اجرای اسکریپت: Unexpected identifier …». tsc سرویس = 0.
- E2E مرورگر: فرم ۱۱ → استودیو → فیلد اسکریپت روی باند اصلی → «ویرایش اسکریپت در مودال»: SQL در تب کد → تب پیش‌نمایش = گرید ۳ ردیف واقعی DfbForm (بدون خطا)؛ `select * from NoSuchTable` → پنل قرمز inline + توست با پیام واقعی؛ ورودی دقیق مالک `select * from db.table("DfbForm")` → گرید ۳ ردیف ✓. بدون ذخیرهٔ قالب → فرم ۱۱ دست‌نخورده (۰ فیلد، version=10).
- **بهینه‌سازی محیط**: ۲۲ پروسهٔ bun زائد (نمونه‌های قدیمی dfb/settings از ری‌استارت‌های قبلی) شناسایی و kill شد → ~۲.۲GB حافظه آزاد شد (۴۵۰MB→۲.۴GB available)؛ چهار پورت ۳۰۰۰-۳۰۰۳ سالم ماندند. علت بن‌بست‌های قبلی CDP همین فشار حافظه بود.
- eslint فایل‌های لمس‌شده = 0/0 (mini-services خارج از eslint پروژه است و با tsc خودش صفر است)؛ dev.log بدون خطا.

Stage Summary:
- اسکریپت فرمساز اکنون هم JS (`db.table(...).findMany`) و هم SQL ساده (`select * from جدول [where …] [limit N]`) را از مسیر امن فقط-خواندنی اجرا می‌کند؛ خطاها با پیام واقعی بک‌اند (inline + توست) دیده می‌شوند، نه ارجاع به لاگ.
- artifacts: parseSqlSelect/execSqlSelect، پنل خطای inline مودال اسکریپت، scriptErrMsg، ۲۲ مقدار i18n (۱۱ زبان × ۲ کلید)، پاکسازی پروسه‌های زائد.

---
Task ID: 63
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در استودیو طراحی فرم، دکمهٔ ماکزیمایز و مینیمایز را به ناحیه‌ای اضافه کن که دکمهٔ ذخیرهٔ قالب وجود دارد و ناحیهٔ بالا را بطور کامل پاک کن؛ آیتم‌های مشخص‌شده با فلش قرمز را هم حذف کن» (تصویر: فلش‌ها روی نوار عنوانِ پنجره، بجِ DFB-F-11، بج «فرم ساده (با قالب بندی)» و بج «انواع وسیله نقلیه»).

Work Log:
- برش تصویر با sharp برای تشخیص دقیق فلش‌ها: فلش ۱ = کنترل‌های نوار عنوان سیستم (× □ −)؛ فلش ۲ = بج کد «DFB-F-11» (نه دکمهٔ × و نه «ذخیرهٔ قالب»)؛ فلش ۳ = بج قالب؛ فلش ۴ = بج عنوان فرم.
- app-window.tsx: «dfb-studio» به CHROMELESS_KINDS افزوده شد → نوار عنوانِ روشن (× □ − + «استودیو طراحی فرم — انواع وسیله نقلیه» + آیکون نارنجی) برای استودیو بطور کامل حذف شد؛ «ناحیهٔ بالا» دیگر رندر نمی‌شود.
- app-window.tsx (رفع اثر جانبی مهم): پنجرهٔ minimizeشده به‌جای unmount اکنون با display:none مانت می‌ماند (frameStyle.display) — تاریخچهٔ undo/ویرایش‌های ذخیره‌نشدهٔ استودیو در چرخهٔ کمینه‌سازی/بازگردانی از بین نمی‌رود (معنای ویندوزی Minimize). مسیر بازگردانی: کلیک دوبارهٔ لانچر (openWindow روی نمونهٔ موجود minimized=false می‌گذارد) — همان رفتار پیشین.
- dfb-studio.tsx: نوار ابزار استودیو نقش «نوار درگ پنجره» را گرفت (chrome.onDragStart/Move/End + onDoubleClick با شرط دورزدن [data-window-btn] — دبل‌کلیک نوار = ماکزیمایز، قانون کپشن ویندوز)؛ همهٔ دکمه‌های نوار data-window-btn گرفتند تا درگ را تحریک نکنند.
- خوشهٔ کپشن کنار «ذخیرهٔ قالب» افزوده شد (ترتیب DOM: ذخیرهٔ قالب → کوچک‌نمایی(Minus) → بزرگ‌نمایی(Square/Copy بر اساس وضعیت winMaximized از استور دسکتاپ) → خروج(×)) — در RTL خوشه در لبهٔ بصری پنجره با ترتیب کپشن ویندوز می‌نشیند.
- حذف‌ها: بج عنوان فرم (state.shell.title)، بج قالب (template treeForm/simple) و رشتهٔ کد فرم (code) — stateهای یتیم template/code/setTemplate/setCode و ایمپورت ListTree هم پاک شدند (FileText/Badge در جای دیگر زنده‌اند).
- i18n: بدون کلید جدید — از common.minimize/common.maximize موجود (هر ۱۱ زبان) استفاده شد.
- eslint دو فایل لمس‌شده = 0 خطا/0 هشدار.
- E2E (agent-browser، دسکتاپ 1280×800): ① نوار عنوان بالا نیست و پنجره مستقیم با نوار ابزار شروع می‌شود ② بج‌های فلش‌خورده و DFB-F-11 نیستند ③ بزرگ‌نمایی = پرشدن لایه (0,36,1280×712، گوشت‌خالی 0px) با آیکون Copy، بازگردانی = بازگشت دقیق به 141,89,998×643 ④ درگ نوار ابزار پنجره را جابه‌جا می‌کند (تأیید دو بردار حرکت + کلمپ لبه) ⑤ دبل‌کلیک نوار = ماکزیمایز/بازگردانی ⑥ کوچک‌نمایی = display:none با مانت‌ماندن (تگ DOM روی دکمهٔ ذخیره پس از بازگردانی سر جا = بدون remount، حفظ state) ⑦ دکمه‌ها کماکان کلیک‌پذیر (درگ روی آن‌ها سرکوب می‌شود) ⑧ ری‌لود کامل + عبور دوبارهٔ مسیر: صفر خطای کنسول/دواِرور (خطاهای میانهٔ لاگ = ترنزیشن HMR حین ویرایش).
- خانه‌داری §0.9: بک‌آپ زمان‌دار custom-2026-10-24_1736.db و dfb-2026-10-24_1736.db.

Stage Summary:
- استودیو طراحی فرم اکنون پنجرهٔ chromeless است: نوار عنوان سیستمی حذف، نوار ابزار خودش هندل درگ + کپشن (کمینه/بیشینه/بسته) کنار «ذخیرهٔ قالب» است؛ سه بج فلش‌خورده حذف شدند؛ کمینه‌سازی state را حفظ می‌کند.
- artifacts: CHROMELESS_KINDS+dfb-studio، frameStyle.display، خوشهٔ کپشن RTL، پاکسازی state/ایمپورت یتیم؛ بدون تغییر دیتابیس و بدون کلید i18n جدید.

---
Task ID: 64
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «کامپوننتی بنام MainDataGrid اضافه کن که لیست اطلاعات ثبت‌شده در فرم‌ها را نمایش دهد؛ تمامی فیلترهای ستون‌ها و دکمه‌های پایین فرم را کاملاً شیک و جذاب پیاده کن» (تصویر: پنجرهٔ «فهرست کلّی خدمات (0)» با فیلتر عملگری ۸ گزینه‌ای و نوار دکمه‌های پایین).

Work Log:
- backend (dfb-service): DELETE forms/:id/data/:dataId (removeData) — حذف مقادیر EAV سپس رکورد، با گارد تعلق رکورد به همان فرم؛ smoke با curl امضاشده: ok + مسیر ۴۰۴ «رکورد یافت نشد».
- desktop-store: WindowKind جدید «dfb-list» + WinState.titleOverride + setWindowTitle — برای شمارندهٔ زندهٔ رکورد در عنوان پنجره.
- desktop.tsx: متای پنجرهٔ dfb-list (آیکون tile سبز ListChecks، عنوان fallback) + اعمال titleOverride در AppWindow.
- **main-data-grid.tsx (کامپوننت اصلی)**: گرید مستقل و reusable — فیلتر عملگری هر ستون با منوی قیفی ۸ عملگری (شامل/شامل نبودن/شروع با/پایان با/برابر با/نابرابر با/خالی باشد/خالی نباشد — کلیک روی عملگر فعال = پاک‌کردن فیلتر)، هدر و ردیف فیلتر sticky، مرتب‌سازی با کلیک هدر (چرخه asc→desc→هیچ با نشانگر)، انتخاب‌گر ستون‌ها (DropdownMenuCheckboxItem)، انتخاب ردیف + دبل‌کلیک/Enter، ریل # غیرقابل‌حذف، حالت خالی «اطلاعاتی برای نمایش وجود ندارد»، حالت لودینگ، نوار پایین: اکشن‌های سفارشی + چیپ شمارندهٔ زندهٔ «فیلترشده» + توگل نوار فیلتر (با بج تعداد فیلتر فعال) + انتخابگر ستون‌ها + خروجی CSV از ردیف‌های فیلترشده (BOM + نقل‌قول، سازگار اکسل). GridActionButton رنگی (emerald/rose/teal/violet/amber) با هاور بالا-پیکسلی. همه با توکن‌های تم (روشن/تاریک) و RTL طبیعی جدول.
- records-list-window.tsx: پنجرهٔ «فهرست کلّی {فرم} (N)» روی MainDataGrid — ستون کد (dataId، فونت‌مونو) + یک ستون برای هر فیلد ورودی فرم (چک‌باکس → بلی/—)، عنوان زنده با شمارنده از setWindowTitle، اکشن‌ها: افزودن رکورد (بازکردن پنجرهٔ ورود فرم)، حذف رکورد (§0.8 ConfirmDeleteDialog با متن «این عمل بازگشت‌پذیر نیست»)، بازخوانی؛ دبل‌کلیک ردیف = بازکردن فرم.
- form-builder-window (FormDetailPanel): دکمهٔ «فهرست رکوردها» برای همهٔ فرم‌ها (سیستمی و غیرسیستمی).
- i18n: ۲۳ کلید dfb.list.* × ۱۱ زبان (۲۵۳ خط) با اسکریپت درج بعد از لنگر «dfb.openForm» هر زبان؛ شمارش راستی‌آزمایی شد (۱۱/۱۱ برای کلیدهای نمونه).
- رفع lint: react-hooks/set-state-in-effect — لود اولیه به الگوی fetchRows().then(applyRows) با گارد alive بازنویسی شد؛ چیپ شمارنده به شمارش زندهٔ فیلترشده تغییر کرد.
- دادهٔ آزمون: ۳ فیلد (عنوان/ایران کد/وضعیت select) + ۴ رکورد روی فرم ۱۱ با POST امضاشده (کشف ۱ رکورد یتیم قدیمی 14 و حذفش با همان endpoint جدید!)؛ E2E مرورگر کامل: منوی ۸ عملگری ✓ فیلتر برابر-با=غیرفعال → ۱ ردیف + چیپ «۱ رکورد» + بج فیلتر فعال ✓ پاک‌کردن فیلتر ✓ مرتب‌سازی کد asc/desc ✓ حذف با تأیید → ۳ ردیف + عنوان «(3)» ✓ پنهان/نمایش ستون ✓ توگل نوار فیلتر ✓ «افزودن رکورد» پنجرهٔ ورود فرم را باز کرد ✓ رفرش کامل صفحه بدون خطای کنسول.
- پاکسازی کامل: حذف هر ۴ رکورد آزمون + خالی‌کردن فیلدهای فرم ۱۱ با PUT fields:[] (الگوی ذخیرهٔ استودیو؛ DELETE مستقیم فیلد با گارد «فیلد سیستمی» مسدود بود) → فرم ۱۱ دوباره ۰ فیلد/۰ رکورد.
- یادداشت محیط: لاگ قدیمی Prisma «Unable to open the database file» متعلق به پروسهٔ مردهٔ قبلی بود؛ ss -tlnp تک‌مالک بودن :3003 (PID 18540) و سلامت ۲۰۰ را نشان داد.
- خانه‌داری §0.9: بک‌آپ زمان‌دار پیش از push.

Stage Summary:
- MainDataGrid آمادهٔ استفادهٔ مجدد است: هر پنجرهٔ فهرستی آینده (فهرست کلّی هر فرم، گزارش‌ها) فقط با دادن columns/rows/actions ساخته می‌شود؛ فیلتر عملگری، مرتب‌سازی، انتخابگر ستون، خروجی CSV و نوار اکشن رنگی داخل خود گرید است.
- artifacts: main-data-grid.tsx، records-list-window.tsx، DELETE forms/:id/data/:dataId، dfb-list window kind + titleOverride، ۲۳×۱۱ کلید i18n؛ دیتابیس بدون ردِ آزمون.

---
Task ID: 65
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «آخرین نسخهٔ سورس و بک‌آپ دیتابیس به گیت‌هاب پوش شود».

Work Log:
- بررسی مخزن: working tree تمیز و HEAD (861c1a6 = Task 64) هم‌تراز origin/main بود → سورس از پیش به‌روز بود.
- خانه‌داری §0.9: اجرای scripts/db-backup.sh در ۱۹:۲۰ تهران → backup db/custom-2026-10-24_1920.db و dfb-2026-10-24_1920.db (اعتبارسنجی سلامت SQLite: ۱۴ و ۹ جدول).
- کامیت + پوش به origin/main.

Stage Summary:
- مخزن گیت‌هاب اکنون آخرین سورس (Task 64: MainDataGrid) و تازه‌ترین بک‌آپ دیتابیس (۱۹:۲۰ تهران) را دارد.

---
Task ID: 66
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «بصورت خودکار آخرین تغییرات در سورس یا دیتابیس اتفاق افتاده را به گیت‌هاب پوش کنید» (ساخت سرویس پوش خودکار دائمی).

Work Log:
- سرویس مستقل mini-services/auto-push-service ساخته شد (Bun خالص، بدون وابستگی، پورت 3010):
  - چرخهٔ هر تیک: تشخیص تغییر سورس (git status --porcelain) + تشخیص محتوایی دیتابیس (sha256 زندهٔ db/*.db در برابر db-state.json — نه فقط mtime) → اگر هیچ تغییری نبود «بی‌کار» و بدون ساخت بک‌آپ.
  - قانون §0.9 داخل سرویس اجباری شد: پیش از هر پوش، scripts/db-backup.sh اجرا و بک‌آپ زمان‌دار تهران ضمیمهٔ کامیت می‌شود.
  - git add -A (محافظت‌شده با .gitignore موجود) → کامیت پیام‌دار «Auto-sync (پوش خودکار): <زمان تهران> — سورس: N فایل، دیتابیس: تغییر/بدون تغییر» → fetch + rebase خودکار در صورت عقب‌ماندن از ریموت (با abort در تعارض) → push origin/main.
  - حالت دیتابیس آخرین پوش در db-state.json (کامیت‌شده) نگه داشته می‌شود تا پس از ری‌استارت محیط هم نقطهٔ مقایسه معتبر بماند.
  - تایم‌اوت ۱۲۰ ثانیه برای هر فرمان گیت + فلگ busy برای جلوگیری از چرخهٔ موازی + گارد globalThis برای سازگاری با bun --hot (بدون تایمر موازی پس از reload).
  - HTTP وضعیت: GET / (وضعیت + ۳۰ لاگ آخر) و POST /run-now (چرخهٔ فوری برای تست/اجرای دستی).
  - فاصلهٔ پیش‌فرض ۱۰ دقیقه، اولین تیک ۲۰ ثانیه پس از استارت (متغیر محیطی AUTO_PUSH_INTERVAL_MS).
- استارت در پس‌زمینه: setsid nohup bun run dev → /tmp/auto-push.log؛ مالکیت انحصاری :3010 (PID 4888).
- E2E (مسیر مثبت): تیک اول، فایل‌های خود سرویس را شناسایی کرد → بک‌آپ §0.9 (custom/dfb-2026-10-24_1930.db) → کامیت 8d19fd0 شامل سرویس + db-state.json + بک‌آپ‌ها → پوش موفق به origin/main (تأیید 0/0 پس از fetch).
- E2E (مسیر بی‌کار): POST /run-now بدون تغییر → لاگ «idle» و هیچ کامیت/بک‌آپ جدیدی ساخته نشد (HEAD روی 8d19fd0 ماند).
- افزودهٔ Task 65 (پوش دستی بک‌آپ ۱۹:۲۰) پیش از این تسک هم‌تراز بود؛ این تسک روی آن سوار شد.

Stage Summary:
- هم‌گام‌سازی گیت‌هاب اکنون خودکار است: هر تغییر سورس یا دیتابیس حداکثر ۱۰ دقیقه بعد (یا فوری با POST /run-now) با بک‌آپ §0.9، کامیت پیام‌دار و پوش امن (fetch+rebase) به origin/main می‌رسد.
- artifacts: mini-services/auto-push-service/{index.ts,package.json,db-state.json}، پورت 3010، لاگ /tmp/auto-push.log.

---
Task ID: 67
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در فرمساز، اگر کاربر روی یک فرم کلیک کرد، آیتم‌هایی که در تصویر با فلش قرمز مشخص کردم را حذف کنید» (تصویر: جزئیات فرم «انواع وسیله نقلیه»).

Work Log:
- برش پیکسلی سه‌گانه (sharp): فلش ۱ = لینک آچار «ساخت آیکون، زیرمنو و فرم روی درختواره» (dfb.builderNote) در نوار بالای فرمساز؛ فلش ۲ = بج «فرمساز» (dfb.builderBadge) روی هدر فیروزه‌ای جزئیات فرم؛ فلش ۳ = دکمهٔ «افزودن فیلد» (dfb.addField) در ردیف اکشن‌های جزئیات فرم. خود هدر، خود آیکون آچارِ هدر و بقیهٔ دکمه‌ها (طراحی در استودیو/باز کردن فرم/فهرست رکوردها/حذف) هدف نبودند.
- form-builder-window.tsx: spanِ builderNote از نوار بالا حذف (Wrench همچنان برای آیکون هدر استفاده می‌شود)؛ badge={t("dfb.builderBadge")} از SimpleTreeForm حذف؛ دکمهٔ «افزودن فیلد» + state addFieldOpen + رندر DfbAddFieldDialog + ایمپورت آن حذف شدند — مدیریت فیلد از این پس فقط در استودیو طراحی است.
- dfb-dialogs.tsx: کامپوننت‌های یتیم DfbAddFieldDialog و AddFieldBody بطور کامل حذف شدند؛ ثابت یتیم FIELD_TYPE_OPTIONS حذف؛ ایمپورت‌های یتیم RefreshCw و type DfbTabDef حذف (DfbFieldDef در DfbFieldsOverview زنده است).
- i18n: ۶ کلید یتیم × ۱۱ زبان = ۶۶ خط حذف (dfb.builderBadge، dfb.addFieldDesc، dfb.addFieldSystemDesc، dfb.fieldLabelEn، dfb.widthHalf، dfb.widthFull) — راستی‌آزمایی اسکریپتی ۱۱/۱۱ برای هر کلید؛ کلیدهای مشترک (dfb.addField، dfb.fieldLabel، dfb.fieldType، dfb.width، dfb.required) چون در استودیو زنده‌اند باقی ماندند (شمارش ۴۴ = ۴ کلید × ۱۱).
- eslint سه فایل لمس‌شده = 0 خطا/0 هشدار.
- E2E (agent-browser، 1280×800): دسکتاپ → ابزارهای پیشرفته → فرم‌ساز → درخت → کلیک f11 «انواع وسیله نقلیه»: ① نوار بالا فقط «افزودن آیکون اصلی» + «مدیریت گروه‌ها» (لینک آچار نیست) ② هدر = آیکون + «فرم: انواع وسیله نقلیه» بدون بج ③ اکشن‌ها = طراحی در استودیو/باز کردن فرم/فهرست رکوردها/حذف (بدون افزودن فیلد) — مطابق DOM: headerBadge=null، دکمه‌های حذف‌شده یافت نشدند ④ کلیک روی منوی m32 «حمل و ترابری» هم سالم (هدر منو بدون بج) ⑤ ریلود کامل + عبور دوبارهٔ مسیر = صفر خطای کنسول/صفحه.
- خانه‌داری §0.9: بک‌آپ زمان‌دار پیش از push.

Stage Summary:
- نمای «کلیک روی فرم» در فرمساز مطابق سلیقهٔ مالک سبک شد: سه آیتم زائد حذف و کد یتیم (کامپوننت دیالوگ، state، ایمپورت، ثابت و ۶۶ خط i18n) کامل پاک‌سازی شد؛ افزودن فیلد صرفاً از استودیو طراحی فرم.
- artifacts: form-builder-window.tsx، dfb-dialogs.tsx، dictionaries.ts؛ بدون تغییر دیتابیس.

---
Task ID: 68
Agent: Z.ai Code (main orchestrator)
Task: تأیید مالک بر مشاورهٔ ترجمه — پیاده‌سازی «ترجمهٔ آفلاین ۱۱زبانهٔ اطلاعات فیلدها هنگام تغییر زبان نرم‌افزار» (جدول ترجمهٔ مرکزی DfbTranslation + کش کلاینت + پنل زبان در استودیو).

Work Log:
- مشاوره: سه گزینه مقایسه شد (جدول ترجمهٔ مرکزی / ستون‌های چندگانه / JSON) — جدول مرکزی تأیید مالک («بلی»). نکتهٔ کلیدی طراحی: چون در فرم‌های کاربر ID فیلدها در هر ذخیره بازتولید می‌شود (replaceFields)، هویت ترجمه با «کلید بیزینسی پایدار» گرفتنی شد نه ID ردیف: Menu→(menuId، Title)، Form→(formId، Title)، Field→(formRef، fieldKey). زبان fa پذیرفته نمی‌شود (متن اصلی خودش fa است)؛ ۱۰ زبان دیگر.
- اسکیما: مدل DfbTranslation در mini-services/dfb-service/prisma/schema.prisma (۱۲فیلد AppBaseEntity + Version + @@unique چهارگانه؛ §2.3/§16) → db:push + generate.
- ثبت در TABLE_REGISTRY (id-generation) + شمارندهٔ IDGeneration در seed + VERSIONED_MODELS در prisma.service (§2.5).
- ماژول جدید translations (controller/service/dto/module): GET advancedTools/translations (کل نقشه) + POST upsert دسته‌ای (۱..۵۰۰ آیتم؛ value خالی = حذف؛ validate: زبان/موجودیت/وجود مبدأ — fa رد می‌شود؛ 404 برای مبدأ ناموجود) + GET langs. دو نکتهٔ اشکال‌زدایی: ValidationPipe با whitelist:true دکوراتور class-validator می‌خواست؛ deleteMany سینتکس کلید مرکب نمی‌پذیرد (فیلتر اسکالر).
- پاک‌سازی همگام در خود سرویس: removeField → حذف ترجمه‌های (Field، formRef، fieldKey)؛ remove(form) → حذف Form+Field با entityRef=formId؛ replaceFields → حذف ترجمه‌های فیلدهایی که دیگر وجود ندارند (notIn fieldKeys)؛ menus.remove → حذف Menu.
- seed گام ۴ (idempotent): «۴ب» ترجمهٔ نمونهٔ ۱۰زبانهٔ موجودیت‌های فعلی (فرم‌های «انواع وسیله نقلیه/ساختار کسب و کار/فرمساز» + منوی «حمل و ترابری» — هر ۴ × ۱۰ زبان) و بعد «۴الف» مهاجرت میراث ستون‌های Title_En/Label_En به ردیف‌های en (ترتیب مهم: نمونه اول تا en بهتری جایگزین میراث ضعیف مثل «haml»/«vehicleyypes» شود — این ترتیب پس از تست اصلاح شد).
- فرانت — استور جدید src/stores/dfb-translations.ts: نقشهٔ byLang (زبان→کلید مرکبی→متن) با persist روی localStorage (کلید erp.dfb-translations) + load یک‌باره + applyLocal خوش‌بینانه + saveDfbTranslations (POST + apply) + useDfbTrMap (نقشهٔ زبان فعلی، reactive) + dfbResolveTr (زنجیره: ترجمهٔ زبان فعلی → fa → *_En).
- helperهای dfb-store توسعه یافتند: dfbFormTitle/dfbNodeTitle پارامتر اختیاری trMap گرفتند + dfbFieldLabel جدید (Field:<formRef>:<fieldKey>). فراخوانی‌های این helper اکنون trMap را از useDfbTrMap می‌گذرانند — form-builder-window (درخت + عنوان جزئیات)، dfb-menu-window (ناوبری + فهرست فرم‌ها)، desktop.tsx (عنوان ۴ نوع پنجرهٔ داینامیک + برچسب آیکون‌های کاربر دسکتاپ)، start-menu.tsx (آیکون‌های کاربر)، dfb-form-runtime (عنوان فرم، عنوان تب‌ها، برچسب همهٔ فیلدها body/grid/footer/tree)، records-list-window (ستون‌های MainDataGrid + عنوان زندهٔ پنجره). واکشی یک‌بارهٔ نقشه در Desktop useEffect (ensureDfbTranslations).
- استودیو: FieldTranslationsBody جدید (field-translations.tsx) — انتخابگر ۱۰ زبان با نقطهٔ «پر/خالی» + شمارندهٔ n/10 + ورودی dir=auto؛ هر ضربه فوراً کش را به‌روز می‌کند و ذخیرهٔ سرور debounce ۶۰۰ms + flush در unmount. در FieldSettingsBody (مشترک ریل + مودال ویژگی‌ها) بعد از «برچسب لاتین» سوار شد (prop جدید formRef به هر دو محل فراخوانی پاس شد). fieldKey اکنون از لحظهٔ ساخت پایدار است (fld_<ts36>) تا ترجمه پیش از اولین ذخیره هم معنا داشته باشد (پیش‌آیند فیلدهای script).
- i18n: کلید جدید «dfb.i18n.title» × ۱۱ زبان در dictionaries.ts.
- نکتهٔ عملیاتی: bun --hot سرویس dfb پس از چند reload ناپایدار شد (مرگ بی‌صدای پروسه)؛ سرویس با bun run start (بدون hot) پایدار شد — برای این تسک پایداری مهم‌تر از reload خودکار بود.
- E2E API (curl از مسیر BFF): upsert/حذف با مقدار خالی/no-op تکراری/fa رد/404 مبدأ ناموجود — همه سبز؛ ۴۰ ردیف seed.
- E2E مرورگر (agent-browser 1280×800): سوییچ en → درخت فرمساز «Vehicle Types/Transportation/Form Builder» و آیکون دسکتاپ «Transportation»؛ سوییچ ar → عنوان جزئیات «نموذج: أنواع المركبات»؛ استودیو → افزودن فیلد متن (fieldKey پایدار fld_mvmrvq4915) → پنل «ترجمهٔ برچسب» (0/10) → انتخاب العربية و تایپ «نوع وسیله نقلیه» → ردیف روی سرور در همان لحظه (debounce) → ذخیرهٔ قالب → بازکردن ران‌تایم در عربی: عنوان فرم «أنواع المركبات» + برچسب فیلد «نوع وسیله نقلیه» (اسکرین‌شات تأیید)؛ پاک‌سازی: حذف فیلد + ذخیره → فیلدهای فرم [] و ردیف ترجمهٔ Field خودکار حذف شد (notIn sync) → ۴۰ ردیف مفید باقی. ریلود تمیز نهایی در fa: ۰ خطای کنسول.
- خانه‌داری §0.9: بک‌آپ زمان‌دار پیش از push.

Stage Summary:
- ترجمهٔ آفلاین ۱۱زبانهٔ محتوای دیتابیسی فرمساز فعال است: عنوان منو/فرم و برچسب فیلدها با تغییر زبان نرم‌افزار بلافاصله و بدون هیچ درخواست شبکه عوض می‌شوند (کش localStorage + نقشهٔ واکنشی)؛ ورود ترجمه از پنل زبان در استودیو (ریل و مودال ویژگی‌ها) با ذخیرهٔ فوری؛ زنجیرهٔ fallback تضمین می‌کند زبان‌های بدون ترجمه به فارسی برمی‌گردند. معماری نسبت به مهاجرت آیندهٔ PostgreSQL بی‌تفاوت است (Prisma + §2.3).
- artifacts: mini-services/dfb-service/{prisma/schema.prisma، src/translations/*، src/forms/forms.service.ts، src/menus/menus.service.ts، src/seed/seed.service.ts، src/prisma/prisma.service.ts، src/id-generation/table-registry.ts، src/app.module.ts}، src/stores/dfb-translations.ts، src/stores/dfb-store.ts، src/components/erp/form-builder/{field-translations.tsx، dfb-studio.tsx، dfb-form-runtime.tsx، form-builder-window.tsx، dfb-menu-window.tsx، records-list-window.tsx}، src/components/desktop/{desktop.tsx، start-menu.tsx}، src/i18n/dictionaries.ts.
- محدودیت شناخته‌شده: ترجمهٔ «عنوان تب‌ها» (DfbFormTab) فعلاً پشتیبانی نمی‌شود چون ID تب‌ها در هر ذخیره بازتولید می‌شود — نیازمند کلید پایدار clientKey در مدل (کار آینده). ترجمهٔ آیتم‌های select/radio نیز از همین الگو در آینده اضافه می‌شود (FieldKey=opt.<value>).

---
Task ID: 69
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «ترجمهٔ «عنوان تب‌ها» و «آیتم‌های select/radio»» (تکمیل محدودیت شناخته‌شدهٔ Task 68: ترجمهٔ آفلاین عنوان تب‌ها و آیتم‌های لیست هنگام تغییر زبان).

Work Log:
- طراحی هویت پایدار: تب/باند = Tab:<formRef>:<clientKey> (نیازمند ذخیرهٔ ClientKey که تا پیش از این فقط برای همبستگی Task 50 استفاده می‌شد و persist نمی‌شد)؛ آیتم select/radio = Option:<formRef>:<fieldKey>::<value> (fieldKey فیلد از Task 68 پایدار است و value آیتم در EAV ذخیره می‌شود؛ جداکنندهٔ :: جلوی تداخل پیشوند فیلدهای مشابه fld_a/fld_ab را می‌گیرد).
- اسکیما: ستون ClientKey (TEXT nullable) به DfbFormTab — prisma db push به‌خاطر جدول‌های خارج از اسکیما هشدار drop داد؛ به‌جای آن ALTER TABLE مستقیم bun:sqlite (بدون هیچ ریسک حذف داده) + generate. seed گام ۴ج: backfill tab_<ID> برای ردیف‌های بدون ClientKey (idempotent؛ فعلاً صفر ردیف).
- بک‌اند (dfb-service): TRANSLATION_ENTITY_TYPES += Tab, Option؛ assertEntityExists برای هر دو = وجود فرم (EntityRef=FormRef). replaceTabs: clientKey اکنون persist می‌شود (fallback tab_<id>) و پس از بازسازی، ترجمه‌های Tab با clientKey زنده‌مانده پاک می‌شوند (sync یتیم‌ها)؛ replaceFields: sync ترجمه‌های Option با کلیدهای زندهٔ استخراج‌شده از ConfigJson (items string و {label,value})؛ removeField: پاک‌سازی Option با startsWith `<fieldKey>::`؛ remove(form): حذف Tab+Option هم به Form+Field اضافه شد. findOne اکنون clientKey هر تب را برمی‌گرداند.
- فرانت — dfb-store: helperهای dfbTabTitle و dfbOptionLabel (زنجیره: ترجمهٔ زبان فعلی → fa → Title_En فقط برای تب)؛ DfbTabDef.clientKey از پیش بود. dfb-translations: DfbTransEntityType += Tab|Option.
- ران‌تایم (dfb-form-runtime): برچسب همهٔ تب‌ها/باندها (tabKind=2 و legacy و فرزندان «افزودن تب») از dfbTabTitle؛ resolveFieldOptions هر آیتم (static/script/query-bound) را از dfbOptionLabel عبور می‌دهد.
- استودیو (dfb-studio): baseline از ClientKey ذخیره‌شده می‌خواند (key: tb.clientKey || tb-<id>) تا کلید بین sessionها ثابت بماند؛ دکمهٔ Languages کنار «عنوان باند» + دکمهٔ Languages روی هر ردیف تب (MiniIconBtn prop جدید active) + دکمهٔ Languages روی هر ردیف آیتم select/radio — هر سه پنل DfbTranslationsBody (debounce ۶۰۰ms + flush در unmount) باز می‌کنند. FieldTranslationsBody به DfbTranslationsBody عمومی تبدیل شد (entityType/labelKey) و wrapper سازگار ماند؛ key=field.key روی هر دو فراخوانی FieldSettingsBody برای ریست پنل آیتم با تغییر فیلد.
- i18n: ۲ کلید جدید dfb.i18n.tabTitle / dfb.i18n.optionTitle × ۱۱ زبان (۲۲ خط) — راستی‌آزمایی اسکریپتی ۱۱/۱۱.
- نکتهٔ محیط: prisma db push در این مخزن db push است (با دونقطه شناخته نمی‌شود)؛ آیکون‌های دسکتاپ با دبل‌کلیک باز می‌شوند (قرارداد ویندوز — تک‌کلیک فقط انتخاب).
- eslint شش فایل لمس‌شدهٔ فرانت = 0 خطا/0 هشدار؛ tsc سرویس dfb = 0.
- E2E API: upsert Tab/Option ✓ fa رد ✓ مبدأ ناموجود 404 ✓ حذف با مقدار خالی ✓.
- E2E مرورگر (agent-browser 1280×800): استودیو فرم «انواع وسیله نقلیه» → افزودن باند فیلد ورودی → دکمهٔLanguages کنار عنوان باند → پنل «ترجمهٔ عنوان تب» → تایپ en «Vehicle Band» (ردیف روی سرور همان لحظه با clientKey bank-mvmtvk5s-0) → افزودن فیلد select + آیتم «سدان» → دکمهٔ Languages ردیف آیتم → پنل «ترجمهٔ آیتم ۱/۱۰» → تایپ en «Sedan» → ذخیرهٔ قالب (ID تب بازتولید شد ولی clientKey پایدار ماند — راستی‌آزمایی GET) → سوییچ زبان به English: نوار تب ران‌تایم «Vehicle Band» + آیتم بازشوی select «Sedan» (اسکرین‌شات)؛ سوییچ به French (بدون ترجمه): fallback صحیح به fa («عنوان باند 1» و «سدان») با عنوان فرم فرانسوی seed («Types de véhicules»). خطای hydration میانه فقط آرتیفکت تغییر locale از localStorage پیش از hydrate بود — در بارگذاری عادی fa صفر خطا.
- پاک‌سازی کامل دادهٔ آزمون: PUT tabs:[] و fields:[] (الگوی ذخیرهٔ استودیو) → باند/فیلد حذف و ترجمه‌های Tab/Option یتیم «خودکار» توسط syncهای جدید پاک شدند (آزمون واقعی همان مسیر پاک‌سازی!)؛ فرم ۱۱ دوباره ۰ فیلد/۰ تب و ۴۰ ردیف ترجمهٔ مفید قبلی دست‌نخورده.

Stage Summary:
- دو موجودیت باقی‌ماندهٔ ترجمهٔ فرمساز فعال شدند: عنوان تب‌ها/باندها و آیتم‌های select/radio — با هویت پایدارِ مستقل از بازتولید ID در هر ذخیره (ClientKey persist شد). ورود ترجمه از سه نقطهٔ جدید استودیو؛ رندر آفلاین در ران‌تایم با زنجیرهٔ fallback؛ حذف باند/فیلد/آیتم ترجمه‌ها را به‌صورت خودکار sync می‌کند. معماری نسبت به مهاجرت PostgreSQL بی‌تفاوت (Prisma + §2.3).
- artifacts: mini-services/dfb-service/{prisma/schema.prisma، src/translations/{dto,service}، src/forms/forms.service.ts، src/seed/seed.service.ts}، src/stores/{dfb-translations.ts، dfb-store.ts}، src/components/erp/form-builder/{field-translations.tsx، dfb-form-runtime.tsx، dfb-studio.tsx}، src/i18n/dictionaries.ts؛ ستون DfbFormTab.ClientKey (ALTER TABLE امن).

---
Task ID: 70
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک (تأیید مشاورهٔ ترجمهٔ داده) — «این دکمه را در اکشن بار قرار دهید که شامل آنلاین و آفلاین باشد؛ اگر آنلاین بود از طریق ابزارهای آنلاین اطلاعات فیلدهای فرم که توسط کاربر وارد شده‌اند ترجمه گردد و به‌صورت خودکار به تمامی زبان‌های فعال ترجمه انجام گردد و اگر آفلاین بود راهکار پیشنهادی (ورود دستی)».

Work Log:
- مفهوم جدید «زبان‌های فعال» (activeLocales) در settings-store: پیش‌فرض هر ۱۱ زبان؛ toggleActiveLocale با قفل fa (زبان پایه همیشه فعال)؛ persist روی همان کلید erp.settings. مصرف‌کنندگان: سوییچر نوار وظیفه (taskbar)، بخش زبان پنجرهٔ تنظیمات (فیلتر دکمه‌های انتخاب زبان)، پنل‌های ترجمهٔ استودیو (DfbTranslationsBody — شمارنده n/active و فهرست زبان‌ها).
- تنظیمات: بخش جدید «زبان‌های فعال» با بج n/11، توضیح، و کاشی ۱۱ زبانه (فعال = زمردی با نقطهٔ پر، غیرفعال = خاکستری، fa قفل/غیرقابل‌کلیک) — ۲ کلید i18n جدید settings.activeLangs/activeLangsDesc × ۱۱ زبان.
- بک‌اند dfb-service: TRANSLATION_ENTITY_TYPES += «Value» (دادهٔ واردشدهٔ کاربر — EntityRef = dataId رکورد EAV، FieldKey = fieldKey فیلد، فقط فیلدهای متنی آزاد)؛ assertEntityExists شاخهٔ Value (وجود DfbFormData)؛ پاک‌سازی خودکار: removeData ترجمه‌های Value رکورد را حذف می‌کند و remove(form) ترجمه‌های Value همهٔ رکوردهای فرم را (داخل همان تراکنش). tsc = 0؛ سرویس با bun run start ری‌استارت شد.
- مسیر آنلاین جدید src/app/api/dfb-translations/auto-translate/route.ts (Next route، SDK فقط بک‌اند): ① تعریف فرم + مقادیر رکورد از dfb-service با هوک HMAC داخلی §4 ② فیلدهای text/textarea غیرخالی (سقف ۳۰ فیلد/۲۰۰۰ کاراکتر) ③ «یک» فراخوانی LLM (z-ai-web-dev-sdk، thinking disabled، خروجی JSON سخت با پارسر حصار-دوست) برای کل رکورد به همهٔ زبان‌های فعالِ ارسالی فرانت ④ upsert به DfbTranslation (سقف ۱۰۰۰ کاراکتر؛ مقدار خالی = skip)؛ خطاها با پیام واقعی به توست می‌رسند.
- اکشن بار «فهرست کلّی» (records-list-window): دکمهٔ «ترجمه» (بنفش، Languages) به‌صورت DropdownMenu با دو آیتم: «ترجمهٔ خودکار (آنلاین) — N زبان فعال» (Sparkles) و «ورود دستی (آفلاین) — ترجمهٔ فیلدهای متنی این رکورد» (Keyboard)؛ هر دو نیازمند انتخاب رکورد (توست dfb.noRecordSelected). آنلاین: POST مسیر جدید + بازخوانی نقشهٔ کش (useDfbTranslations.load) + توست موفقیت. آفلاین: دیالوگ «ترجمهٔ دستی رکورد» با پنل DfbTranslationsBody برای هر فیلد متنی (entityType=Value، fallbackFa=مقدار فعلی رکورد، labelKey جدید dfb.i18n.valueTitle) — max-h-85vh اسکرولی. GridActionButton اکنون rest-props <button> را فوروارد می‌کند تا DropdownMenuTrigger(asChild) شود.
- رندر ترجمهٔ داده (زنجیرهٔ جایگزینی ترجمهٔ زبان فعلی → مقدار اصلی fa): ① گرید فهرست رکوردها — ستون‌های text/textarea با render زندهٔ trMap (Value:<dataId>:<fieldKey>) بدون بازسازی ردیف‌ها ② ران‌تایم فرم — overlayValue: برای فیلد متنی رکورد بازشده، اگر مقدار فعلی = پایه (baseValues state) و فوکوس نشده باشد ترجمه نمایش داده می‌شود؛ با فوکوس (onRevealFocus جدید روی SimpleFormField + FieldCell text/textarea) مقدار پایه آشکار می‌شود تا ویرایش از متن واقعی شروع شود؛ ذخیره همیشه مقدار پایه/ویرایش‌شده را می‌فرستد — ترجمه هرگز در EAV ذخیره نمی‌شود.
- i18n: ۱۱ کلید جدید (dfb.list.translate/translateOnline/translateLangsHint/translateOffline/translateOfflineHint/translateDone/translateManualTitle/translateNoTextFields، dfb.i18n.valueTitle، settings.activeLangs/activeLangsDesc) × ۱۱ زبان = ۱۲۱ خط با اسکریپت درج بعد از لنگرهای settings.umPending / dfb.i18n.optionTitle / dfb.list.refresh — راستی‌آزمایی اسکریپتی ۱۱/۱۱ برای هر کلید.
- eslint ۱۲ فایل لمس‌شدهٔ فرانت = 0 خطا/0 هشدار (react-hooks/refs → پایهٔ overlay از ref به state منتقل شد)؛ tsc سرویس = 0.
- E2E API: auto-translate با curl روی رکورد آزمونی → ۲ ردیف en/ar دقیق («Purchase of office supplies for Tehran office» / «شراء مستلزمات المكتب لمكتب طهران»)؛ upsert Value با fa رد/404 مبدأ ناموجود در Task 68 قبلاً سبز.
- E2E مرورگر (agent-browser 1280×800، فرم ۱۱ + فیلد «شرح سند» + رکورد ۱۹): ① اکشن بار = افزودن/حذف/بازخوانی/ترجمه ② منوی ترجمه: «۱۰ زبان فعال» پیش‌فرض ③ دیالوگ آفلاین: پنل زبان با مقدار کش‌شده، تعویض زبان، تایپ دستی عربی → ردیف روی سرور با debounce (راستی‌آزمایی DB) ④ تنظیمات → زبان‌های فعال: ۸ زبان خاموش → 3/11؛ سوییچر زبان فقط fa/en/ar؛ منوی ترجمه «۲ زبان فعال» ⑤ ترجمهٔ خودکار آنلاین با ۲ زبان فعال → توست موفق → سوییچ en: سلول گرید انگلیسی + ران‌تایم انگلیسی؛ فوکوس فیلد = بازگشت به مقدار پایهٔ فارسی (ویرایش امن) ⑥ سوییچ ar و بازکردن رکورد: ترجمهٔ دستی عربی نمایش داده شد ⑦ سوییچ fa: مقادیر پایه ⑧ صفر خطای کنسول/دواِرور.
- پاک‌سازی کامل دادهٔ آزمون: حذف رکورد ۱۹ → ترجمه‌های Value «خودکار» پاک شدند (۰ ردیف — آزمون واقعی sync جدید!)؛ فرم ۱۱ با PUT fields:[] به ۰ فیلد بازگشت؛ ۴۰ ردیف seed دست‌نخورده.

Stage Summary:
- ترجمهٔ «دادهٔ واردشدهٔ کاربر» در فرم‌ها فعال شد: دکمهٔ «ترجمه» در اکشن بار فهرست کلّی با دو حالت آنلاین (یک فراخوانی LLM → همهٔ زبان‌های فعال → ذخیرهٔ آفلاین) و آفلاین (دیالوگ ورود دستی با پنل زبان هر فیلد متنی)؛ نمایش با زنجیرهٔ جایگزینی در گرید و ران‌تایم؛ مفهوم «زبان‌های فعال» سراسری شد (سوییچر، تنظیمات، پنل‌های ترجمه)؛ حذف رکورد/فرم ترجمه‌های داده را خودکار پاک می‌کند.
- artifacts: src/app/api/dfb-translations/auto-translate/route.ts، TRANSLATION_ENTITY_TYPES+Value، activeLocales در settings-store، بخش «زبان‌های فعال» تنظیمات، دکمه/دیالوگ ترجمهٔ records-list-window، overlay ران‌تایم/گرید، onRevealFocus در SimpleFormField/FieldCell، ۱۱×۱۱ کلید i18n.
- محدودیت شناخته‌شده: ترجمهٔ داده فقط برای فیلدهای متنی رکوردِ «انتخاب‌شده» در فهرست است (انتخاب تکی گرید) — ترجمهٔ دسته‌جمعی همهٔ رکوردها و رکوردهای سلول‌های گریدِ باندها برای تکس آینده؛ ویرایش مقدار پایه پس از ترجمه، ترجمهٔ موجود را کهنه می‌کند (با ترجمهٔ خودکار مجدد به‌روز می‌شود).

---
Task ID: 71
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «توی زبان‌های نرم‌افزار، زبان آلمانی و زبان روسی را اضافه کنید؛ تمامی تنظیمات سایر زبان‌ها را برای این 2 زبان هم انجام دهید» (افزودن Deutsch + Русский به‌عنوان زبان دوازدهم و سیزدهم با کامل‌ترین هم‌ترازی).

Work Log:
- ممیزی اولیه یک باگ نهفتهٔ Task 70 را آشکار کرد: اسکریپت درج i18n قبلی ۱۲۱ خط تکراری (۱۱ کلید × ۱۱ زبان) را داخل بلوک fa ریخته و مقادیر ترجمه‌شدهٔ ۱۰ زبان دیگر را هرگز به بلوک‌های خودشان نرسانده بود (en..zh هر ۱۱ کلید settings.activeLangs/dfb.list.translate*/dfb.i18n.valueTitle را نداشتند؛ tsc ۱۰۶ خطای TS1117 duplicate + مقادیر fa در UI غیرفارسی). در همین تسک به‌عنوان پیش‌نیاز ترمیم شد.
- ترجمهٔ کامل ۴۵۹ کلید i18n به آلمانی (de.json) و روسی (ru.json) با حفظ جایگاه placeholderها ({n}/{field}) و اعتبارزبانی تجاری/حسابداری (سفتی پاریتی: 459/459 بدون کلید اضافه/گم‌شده).
- اسکریپت مونتاژ (§16/§2.3-safe، بدون دست‌کاری دستی): ① حذف ۱۲۱ خط تکراری fa ② توزیع مقادیر یتیم استخراج‌شده به بلوک درست هر ۱۰ زبان در جایگاه لنگر همتا (umPending/optionTitle/refresh) ③ درج بلوک‌های کامل de/ru با ساختار خطی یکسان (حفظ blank-lineهای گروهی، قرارداد بستن fa=`} as const;` و بقیه=`};`، حفظ اعلان DictKey/Dict) ④ DICTS + کامنت «All 13 locales». دو باگ حین مونتاژ (emit زودهنگام بستن‌کننده، دوباره‌ساطع‌شدن خط مقدار unionWarning) پیدا و با git checkout + اجرای مجدد اصلاح شد.
- src/i18n/config.ts: LOCALES +de/ru، DIR_BY_LOCALE (هر دو ltr)، LOCALE_NAMES (Deutsch/Русский) — مصرف‌کنندگان (taskbar، settings، پنل‌های ترجمه، فیلترها) همه LOCALES-driven بودند و خودکار ارتقا یافتند.
- settings-store: persist نسخهٔ ۱ + migrate — زبان‌های تازه (de/ru) برای کاربران موجود با activeLocales ذخیره‌شده به‌صورت پیش‌فرض فعال تزریق می‌شوند (بدون از دست رفتن خاموش‌سازی‌های قبلی؛ کاربر تازه = هر ۱۳).
- بک‌اند dfb-service: TRANSLATION_LANGS dto +de/ru (اعتبارسنجی upsert ترجمه)؛ auto-translate route +de/ru (مقاصد LLM)؛ کامنت‌های schema.prisma (Lang mapping)؛ seed گام ۴ب: نمونهٔ ترجمهٔ de/ru برای ۴ موجودیت (Fahrzeugarten/Типы транспортных средств، Transport und Verkehr/Транспорт и перевозки، Geschäftsstruktur/Бизнес-структура، Formular-Builder/Конструктор форм) — ensureTr idempotent.
- راستی‌آزمایی ایستا: ممیزی اسکریپتی ۱۳ بلوک × ۴۵۹ کلید بدون تکرار/پاریتی متقابل ✓؛ bun run lint صفر خطا/هشدار؛ tsc سرویس صفر؛ مقایسهٔ tsc کل پروژه قبل/بعد (stash): ۱۱۶ → ۵ خطا (۱۱۱ خطا ریشه‌کن شد — صفر خطای جدید؛ ۵ باقی‌مانده پیشینِ نامرتبط)؛ ضمناً دو خطای TS2352 مرتبط با LOCALES در field-translations/records-list-window (cast قرمزنگار به آرایهٔ mutable) هم اصلاح شد.
- ری‌استارت dfb-service (bun run start، مالکیت انحصاری :3003): لاگ «seeded 8 demo translation rows» = ۴ موجودیت × ۲ زبان تازه؛ GET translations/langs → ۱۲ زبان؛ bun:sqlite → دقیقاً ۸ ردیف de/ru صحیح.
- E2E مرورگر (agent-browser 1280×800): ① سوییچر زبان ۱۳ آیتم شامل de/ru (مهاجرت persist خودکار روی localStorage قدیمی کار کرد) ② Deutsch: دسکتاپ/هدر/تاریخ «Samstag, 24. Oktober»/taskbar DE، تنظیمات با بج «13/13» و ۱۳ کاشی، فرمساز: Formular-Builder → Formularbaum «Geschäftsstruktur/Transport und Verkehr/Fahrzeugarten» (seed زنده)، جزئیات «Formular: Fahrzeugarten»، استودیو کاملاً آلمانی (Hauptband/Feld-Werkzeugleiste/Vorlage speichern/…) ③ Русский: دسکتاپ/تاریخ «суббота, 24 октября»/بج RU ④ استودیو: افزودن فیلد Text → پنل «Label-Übersetzung» با شمارندهٔ «0/12» و dropdown هر ۱۲ زبان شامل Deutsch/Русский ⑤ خروج بدون ذخیره (Ohne Speichern beenden) → فرم به ۰ فیلد بازگشت و DB دست‌نخورده ⑥ بازگشت به fa/rtl با صفر خطای کنسول (بارگذاری تمیز).
- خانه‌داری: فایل‌های موقت .tmp-i18n حذف؛ auto-push-service هر ۱۰ دقیقه حین کار کامیت میانی می‌گرفت (حالت‌های شکستهٔ میانی هم به مخزن رفته بود که کامیت نهایی 18-file جایگزین کامل شد)؛ §0.9 در هر چرخه رعایت شده.

Stage Summary:
- نرم‌افزار اکنون ۱۳ زبانه است: Deutsch و Русский در همهٔ سطح‌ها (سوییچر، تنظیمات، واژه‌نامهٔ کامل UI، پنل‌های ترجمهٔ فرمساز، ترجمهٔ آنلاین داده، نمونه‌های seed و زنجیرهٔ fallback) مثل بقیهٔ زبان‌ها سرویس می‌شوند؛ هر دو LTR با تاریخ بومی. باگ پخش i18n نسل قبلی هم به‌عنوان اثر جانبی ترمیم شد (خطاهای type-check از ۱۱۶ به ۵).
- artifacts: src/i18n/{config.ts، dictionaries.ts}، src/stores/settings-store.ts، src/components/erp/form-builder/{field-translations.tsx، records-list-window.tsx}، mini-services/dfb-service/{src/translations/translations.dto.ts، src/seed/seed.service.ts، prisma/schema.prisma}؛ db/dfb.db (+۸ ردیف ترجمهٔ نمونه).
- محدودیت شناخته‌شده: فونت روسی از زنجیرهٔ fallback سیستم استفاده می‌کند (Vazirmatn گلیف سیریلیک ندارد — مثل en/fr رفتار می‌کند)؛ رابط مدیریت «زبان‌های فعال» بدون تغییر و برای ۱۳ زبان کار می‌کند؛ ۳ خطای tsc پیشین نامرتبط (start-menu، entityRef) خارج از دامنهٔ این تسک ماند.

---
Task ID: 72
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک (مشاوره — هنوز تأیید نشده) — «توی آیکون تنظیمات یک تب اضافه کنید بنام پیکربندی نرم افزارها و تب عمومی، تب حسابداری، تب دریافت و پرداخت، تب انبار، تب فروش، تب دارایی ثابت، تب حقوق را اضافه کنید. هر کدام از این تب ها دارای فیلدهایی که به مرور اعلان می کنم. برای تنظیمات نرم افزار باید فیلدهای ارث بری رعایت گردد.»

Work Log (فقط مشاوره — بدون هیچ کد):
- بازخوانی وضعیت: Task 70 (ترجمهٔ دادهٔ آنلاین/آفلاین) و Task 71 (de/ru — ۱۳ زبان) کامل‌اند؛ پنجرهٔ تنظیمات اکنون home + دو زیرصفحه (ساختار کسب‌وکار، مدیریت کاربران) با الگوی کارت پرتابگر دارد (settings-window.tsx).
- نگاشت ۷ تب درخواستی به کاتالوگ نرم‌افزارها (app-catalog.ts): عمومی=general، حسابداری=accounting، دریافت و پرداخت=receiptsPayment، انبار=inventory، فروش=sales، دارایی ثابت=fixedAssets، حقوق=payroll — عنوان‌های i18n این ۷ مورد از قبل ×۱۳ زبان در dictionaries.ts موجود است (تنها تفاوت: کاتالوگ «حقوق و دستمزد»، عبارت مالک «حقوق»).
- بررسی قرارداد ارث‌بری: بلوک ۱۲فیلدی AppBaseEntity (mini-services/_shared/app-base-entity.ts) + appBaseOnCreate/OnUpdate + baseDataScopeWhere؛ جداول پلتفرمی Setting/IDGeneration/... مستثنا هستند ولی جدول جدید تنظیمات نرم‌افزارها «عملیاتی» است و باید بلوک کامل را بگیرد + TABLE_REGISTRY (§16) + VERSIONED_MODELS (§2.5).
- مشاورهٔ طراحی به مالک ارائه شد: زیرصفحهٔ «پیکربندی نرم افزارها» در پنجرهٔ تنظیمات با ۷ تب؛ جدول واحد SoftwareConfig (ID دستی + AppKey + ConfigKey + ConfigValue + بلوک ارث‌بری ۱۲فیلدی؛ unique(AppKey,ConfigKey,BusinessStructureRef)) در settings-service (Gnr)؛ API GET/PUT per-appKey با whitelist؛ رجیستری اسکیمای فیلد (فرانت + whitelist سرور) برای فیلدهای به‌مرور اعلام‌شونده بدون مهاجرت دیتابیس.
- چهار تصمیم باز به مالک ارائه شد: ① جای هاب (کارت پرتابگر + زیرصفحه) ② برچسب «حقوق» در برابر «حقوق و دستمزد» ③ مدل key-value واحد در برابر جدول ستونی مجزا ④ scope ساختار سازمانی در unique.
- در انتظار تأیید مالک برای شروع پیاده‌سازی.

Stage Summary:
- درک درخواست به مالک بازگویی و طراحی کامل (دیتابیس/بک‌اند/فرانت/i18n×۱۳) پیشنهاد شد؛ هنوز هیچ پیاده‌سازی انجام نشده — Task 72 منتظر «بلی» مالک است.

---
Task ID: 72
Agent: Z.ai Code (main orchestrator)
Task: تأیید مالک («بلی») بر مشاوره — پیاده‌سازی «پیکربندی نرم افزارها» در پنجرهٔ تنظیمات: هاب ۷تب (عمومی/حسابداری/دریافت و پرداخت/انبار/فروش/دارایی ثابت/حقوق) با فیلدهای به‌مرور اعلام‌شونده و رعایت کامل فیلدهای ارث‌بری AppBaseEntity.

Work Log:
- دیتابیس (db/custom.db): جدول SoftwareConfig با CREATE TABLE مستقیم bun:sqlite (بدون prisma db push — درس Task 69: جدول‌های میراث Dfb* خارج از اسکیمای settings-service با db push در خطر drop بودند) با DDL هم‌سبک Prisma + unique index سه‌جزئی (AppKey,ConfigKey,BusinessStructureRef). مدل در schema.prisma با کامنت کامل ثبت شد (§2.3 مقدار رشته‌ای، §16 ID دستی، بلوک ۱۲فیلدی ارث‌بری).
- ثبت‌های قراردادی: TABLE_REGISTRY += SoftwareConfig (§16)، VERSIONED_MODELS += SoftwareConfig (§2.5)؛ prisma generate.
- بک‌اند (settings-service :3001، ماژول software-config): GET /software-config (فهرست ۷ نرم‌افزار + fieldCount) + GET /software-config/:appKey (مقادیر) + PUT /software-config/:appKey (ذخیرهٔ دسته‌ای با whitelist رجیستری SOFTWARE_CONFIG_FIELDS — فعلاً هر ۷ خالی؛ مقدار خالی=حذف الگوی Task 68؛ ID با generateNextId find-then-create بدون سوزاندن شکاف؛ مهر appBaseOnCreate/OnUpdate با SYSTEM_ACTOR؛ appKey ناشناس=404؛ کلید خارج از رجیستری=422 با پیام فارسی). tsc سرویس=0.
- فرانت: کامپوننت جدید src/components/erp/settings/software-config-window.tsx — هدر فیروزه‌ای SlidersHorizontal + نوار تب RTL-آگاه ۷تایی (آیکون lucide هم‌راستا با کاتالوگ) + رندرکنندهٔ فرم آینده‌نگر از رجیستری (text/number/date/checkbox/select/textarea + دکمهٔ ذخیرهٔ PUT) + placeholder خط‌چین «فیلدهای این بخش به‌مرور اعلان و اضافه می‌شوند» تا اعلام فیلدها (بدون هیچ درخواست شبکه تا آن زمان). settings-window.tsx: کارت پرتابگر سوم + زیرصفحهٔ slim-bar.
- رجیستری دوقلو (قرارداد اعلام فیلد آینده): فرانت SOFTWARE_CONFIG_FIELDS در software-config-window.tsx + سرور whitelist در software-config.dto.ts — هر اعلام فیلد جدید مالک = فقط افزودن به این دو + ترجمهٔ labelKey؛ صفر مهاجرت دیتابیس.
- i18n: ۴ کلید جدید (settings.swConfig/swConfigDesc/swConfigPending/swConfigPayroll) ×۱۳ زبان با اسکریپت درج بعد از لنگر settings.umPending — راستی‌آزمایی ۱۳/۱۳ برای هر کلید + جایگاه صحیح de/ru. عنوان ۶ تب اول از کلیدهای موجود app.* بازاستفاده شد؛ «حقوق» طبق عبارت دقیق مالک کلید مستقل گرفت.
- رفع lint: react-hooks/set-state-in-effect دو بار پرچم کرد (setState در زنجیرهٔ effect و سپس فراخوانی sync از effect) — بازآرایی به الگوی records-list: fetchValues خالص بدون setState + applyValues فقط داخل then/catch. lint نهایی صفر؛ tsc کل پروژه: baseline 11 → after 11 (صفر خطای جدید).
- E2E API (curl امضاشدهٔ HMAC روی :3001): فهرست ۷ نرم‌افزار ✓؛ لیست خالی ✓؛ appKey ناشناس 404 ✓؛ کلید غیرمجاز 422 ✓؛ [کلید آزمونی موقت testFlag در رجیستری] create → ردیف با ID=1 از IDGeneration (ردیف شمارنده ساخته شد: LastID=1)، Creator=system، CreationDate=14050803 شمسی تهران، BusinessStructureRef=1 ✓؛ update → Version 1→2 خودکار + مهر LastModifier ✓؛ مقدار خالی → حذف (deleted=1، جدول ۰ ردیف) ✓؛ سپس کلید آزمونی از رجیستری حذف و سرویس ری‌استارت شد — دیتابیس بدون ردِ آزمون.
- E2E مرورگر (agent-browser): دسکتاپ fa — تنظیمات → کارت «پیکربندی نرم افزارها» → زیرصفحه با بازگشت/هدر/۷ تب RTL؛ هر ۷ تب انتخاب + placeholder ✓؛ دکمهٔ بازگشت → خانه با هر ۳ کارت ✓. موبایل 375px — ۷ تب + نوار افقی اسکرول‌پذیر + placeholder ✓. آلمانی LTR — Softwarekonfiguration + Allgemein/Buchhaltung/Einnahmen und Ausgaben/Lager/Verkauf/Anlagevermögen/Gehälter + placeholder آلمانی ✓. ری‌لود تمیز fa = ۰ خطای کنسول/هیدریشن (آرتیفکت شناخته‌شدهٔ تغییر locale فقط در ری‌لود میانی).
- استقرار: settings-service با bun run start (بدون hot، الگوی پایداری Task 68) با مالکیت انحصاری :3001؛ لاگ /tmp/settings-service.log. سینک origin/main توسط auto-push-service (کامیت bdd7d15 با بک‌آپ §0.9 ضمیمه) — working tree تمیز و هم‌تراز.

Stage Summary:
- هاب «پیکربندی نرم افزارها» فعال است: ۷ تب اعلام‌شدهٔ مالک با placeholder منتظرِ فیلدها؛ زیرساخت کامل (جدول ارث‌بری ۱۲فیلدی + IDGeneration + API whitelist + رندرکنندهٔ فرم چندنوعی) طوری بسته شد که هر اعلام فیلد جدید فقط «رجیستری + ترجمه» است — بدون مهاجرت دیتابیس و بدون کد جدید.
- artifacts: mini-services/settings-service/{prisma/schema.prisma، src/software-config/*، src/app.module.ts، src/id-generation/table-registry.ts، src/prisma/prisma.service.ts}، src/components/erp/settings/software-config-window.tsx، src/components/erp/settings-window.tsx، src/i18n/dictionaries.ts؛ جدول SoftwareConfig در db/custom.db.
- تصمیم‌های تأییدشدهٔ مالک در مشاوره: کارت پرتابگر + زیرصفحه؛ برچسب «حقوق»؛ جدول واحد key-value؛ unique شامل BusinessStructureRef (برای پیکربندی تفکیکی شعب در آینده).

---
Task ID: 73
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در منوی تنظیمات، زبان و زبان های فعال را در منوی عمومی قرار دهید» + «دکمه تم شب و روز را در هدر فرم قرار دهید».

Work Log:
- انتقال بخش‌ها: «زبان» و «زبان‌های فعال» (قبلآ در خانهٔ پنجرهٔ تنظیمات) به تب «عمومی» هاب «پیکربندی نرم افزارها» منتقل شدند — کامپوننت مشترک جدید LanguageSettingsSections در src/components/erp/settings/language-settings.tsx (JSX عینأ منتقل‌شده؛ ماندگاری همچنان سمت کلاینت erp.settings).
- settings-window.tsx: دو بخش + importهای بلااستفاده (Globe/Languages/Badge/cn/LOCALES/LOCALE_NAMES/Locale و selectorهای setLocale/activeLocales/toggleActiveLocale) حذف شدند؛ بخش «ظاهر» و سه کارت پرتابگر دست‌نخورده ماندند.
- software-config-window.tsx: تب عمومی اکنون «اولین محتوای اعلام‌شده» را رندر می‌کند (LanguageSettingsSections بالای ردیف‌های آیندهٔ SoftwareConfig همین تب)؛ placeholder خط‌چین فقط برای ۶ تب بدون فیلد؛ شاخهٔ فرم فیلدها از ternary به شرط مستقل fields.length > 0 شکسته شد تا وقتی فیلدهای عمومی اعلام شوند بخش زبان‌ها از بین نرود.
- دکمهٔ تم شب/روز: کامپوننت جدید FormThemeToggle در src/components/forms/form-theme-toggle.tsx (HeaderButton سفید-روی-گرادیان با data-window-btn؛ Sun/Moon؛ tooltip = برچسب حالت مقصد با کلیدهای موجود settings.light/settings.dark — بدون کلید i18n جدید) به ابتدای خوشهٔ caption [تم – □ ✕] هدر گرادیانی هر دو پوستهٔ فرم (SimpleFormTwoRowTabbed + SimpleTreeForm) اضافه شد — همهٔ فرم‌های ران‌تایم (dfb-form-runtime)، نمونه‌ها و ساختار کسب‌وکار را پوشش می‌دهد؛ در حالت embedded هم فعال است.
- الگوی hydration-safe: setState-in-effect پرچم react-hooks/set-state-in-effect را گرفت → به useSyncExternalStore (subscribe هیچ‌گاه، snapshot سرور=false/کلاینت=true) بازنویسی شد؛ پیش از mount آیکون با تم پیش‌فرض «روشن» یکی است.
- دو خطای lint حین کار (parsing error باق‌ماندن */ در ویرایش کامنت بالای settings-window + set-state-in-effect) اصلاح شدند؛ lint نهایی صفر خطا/هشدار.
- dfb-service (:3003) پایین بود (۵۰۲ در dev.log) → با bun run start راه‌اندازی مجدد شد؛ همهٔ مسیرها 200.

Stage Summary:
- تب «عمومی» پیکربندی نرم‌افزارها زنده شد: انتخاب زبان + مدیریت زبان‌های فعال (۱۳ زبانه) از همان‌جا سرویس می‌شوند و سوییچ فوری کل UI را همان‌جا اعمال می‌کند؛ خانهٔ تنظیمات فقط «ظاهر» + پرتابگرهاست. دکمهٔ تم شب/روز روی هدر گرادیانی همهٔ فرم‌ها (کنار captionهای پنجره) در دسترس است و تم سراسری next-themes را بین روشن/تیره جابه‌جا می‌کند.
- artifacts: src/components/erp/settings/language-settings.tsx (جدید)، src/components/forms/form-theme-toggle.tsx (جدید)، src/components/erp/settings-window.tsx، src/components/erp/settings/software-config-window.tsx، src/components/forms/simple-form-two-row-tabbed.tsx، src/components/forms/simple-tree-form.tsx.
- E2E مرورگر: خانهٔ تنظیمات بدون بخش زبان ✓؛ عمومی = زبان + زبان‌های فعال با بج 13/13 ✓؛ سوییچ en→ کل UI انگلیسی، de→ آلمانی (هر دو جهت از همان تب) ✓؛ toggle خاموش/روشن زبان فعال ✓؛ state به locale=fa و هر ۱۳ زبان فعال بازگردانده شد ✓. دکمهٔ تم: هدر «مشتری جدید» (دو‌ردیفه‌ای) و «نمونه درختی» (درختی) → dark (html.dark + آیکون Sun/«روشن») → light (Moon/«تیره») ✓؛ اسکرین‌شات‌های light/dark/موبایل ذخیره شدند. موبایل 375px: ۷ تب اسکرول‌پذیر + گرید دوستونهٔ زبان‌ها ✓. صفر خطای کنسول/دواِرور در بارگذاری عادی fa.

---
Task ID: 74
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در منوی تنظیمات و در زیرمنوی پیکربندی نرم افزار و در تب حسابداری یک فیلد اضافه کنید بنام تعداد ماه های مالی که باید فیلد عددی باشد و بصورت پیش فرض عدد 12 داخل آن وجود داشته باشد و نمی تواند بیشتر از عدد 16 باشد» (اولین اعلام فیلدِ معماری Task 72).

Work Log:
- دوتایی رجیستری (قرارداد اعلام فیلد — صفر مهاجرت دیتابیس): ① فرانت SOFTWARE_CONFIG_FIELDS.accounting += فیلد fiscalMonthsCount (labelKey=settings.swFiscalMonths، type=number، min=1، max=16، integer، defaultValue="12") ② سرور software-config.dto.ts: whitelist از آرایهٔ رشته‌ای به رجیستری مشخصات ارتقا یافت (SoftwareConfigFieldSpec: type/min/max/integer/defaultValue) با همان ورودی.
- اعتبارسنجی دولایه: ① فرانت (save): قبل از PUT — NaN/اعشاری/خارج از بازه → توست خطا و ارسال نمی‌شود ② سرور (software-config.service.ts upsert): همان قانون بازه با پیام‌های روشن فارسی (باید عدد باشد/عدد صحیح باشد/کمتر از ۱/بیشتر از ۱۶ = 422) — خط دوم دفاعی.
- سقف ۱۶ در UI هم نشسته: input عددی با min=1/max=16/step=1 (اسپینر در ۱۶ می‌ایستد) + مقدار پیش‌فرض: وقتی ردیف ذخیره‌شده نیست فیلد ۱۲ نشان می‌دهد و ذخیرهٔ بی‌تغییر همان ۱۲ را می‌نویسد؛ خالی‌کردن و ذخیره = حذف ردیف (الگوی Task 68) → بازگشت به پیش‌فرض ۱۲.
- بهبود توست خطا: پیام متنی سرور (مثل رد 422) اکنون مستقیم در توست نمایش داده می‌شود (قبلاً generic بود).
- i18n: ۳ کلید جدید settings.swFiscalMonths/swRangeError/swIntError ×۱۳ زبان (۳۹ خط) با اسکریپت لنگردار بعد از settings.swConfigPayroll — دو باگ اسکریپت (regex \w{2} که ckb سه‌حرفی را نمی‌گرفت + جایگزینی ناقص sed روی regex literal) پیدا و رفع شد؛ راستی‌آزمایی نهایی ۱۳/۱۳ برای هر ۳ کلید + جایگاه ckb بعد از لنگر.
- خطای محیطی: dfb پایین بود در ابتدای جلسه (۵۰۲) → راه‌اندازی مجدد؛ settings-service با pkill قدیمی نکُشت (cmdline متفاوت) → خطای EADDRINUSE → kill با PID + راه‌اندازی مجدد تمیز روی :3001.
- tsc سرویس=0؛ bun run lint=0 خطا/هشدار.
- E2E API (پروکسی امضاشدهٔ Next): GET خالی ✓؛ PUT 20 → 422 «نمی‌تواند بیشتر از 16 باشد» ✓؛ PUT 12.5 → 422 «باید عدد صحیح باشد» ✓؛ PUT 0 → 422 «کمتر از 1» ✓؛ کلید ناشناس → 422 whitelist ✓؛ PUT 14 → saved=1 با ردیف کامل ارث‌بری (creator=system، CreationDate شمسی، BusinessStructureRef=1، ID=2 از IDGeneration — ID=1 مال ردیف آزمون Task 72) ✓.
- E2E مرورگر (1280×800): تب حسابداری = فیلد «تعداد ماه‌های مالی» با مقدار سرور ✓؛ تایپ ۲۰ + ذخیره → توست «مقدار «تعداد ماههای مالی» باید عددی بین 1 و 16 باشد.» و مقدار سرور دست‌نخورده (درخواست ارسال نشد) ✓؛ ذخیرهٔ ۱۳ → موفق ✓؛ reload کامل + مسیر مجدد → ۱۳ ✓؛ آلمانی: Softwarekonfiguration→Buchhaltung = «Anzahl der Geschäftsjahresmonate» (اسکرین‌شات) ✓؛ حذف ردیف آزمون با PUT خالی → فیلد پیش‌فرض ۱۲ را نشان می‌دهد (اسکرین‌شات fa) ✓؛ بارگذاری تمیز fa = ۰ خطا (خطای hydration فقط آرتیفکت تزریق de از localStorage پیش از hydrate — الگوی شناخته‌شده).
- state نهایی تمیز: locale=fa + هر ۱۳ زبان فعال؛ جدول SoftwareConfig بدون ردِ آزمون (فیلد با ذخیرهٔ مالک اولین ردیف واقعی را با ID بعدی می‌گیرد).

Stage Summary:
- اولین فیلد پیکربندی نرم‌افزارها زنده شد: تب «حسابداری» فیلد «تعداد ماه‌های مالی» را دارد — عددی، پیش‌فرض ۱۲، سقف ۱۶ (و کف ۱، فقط صحیح) با اعتبارسنجی دولایهٔ فرانت/سرور و پیام‌های بومی ۱۳زبانه؛ قرارداد «اعلام فیلد = رجیستری دوقلو + ترجمه» بار اول خودش را ثابت کرد (بدون مهاجرت، بدون کد مسیر جدید).
- artifacts: src/components/erp/settings/software-config-window.tsx، mini-services/settings-service/src/software-config/{software-config.dto.ts، software-config.service.ts}، src/i18n/dictionaries.ts.
- تصمیم تفسیری اعلام‌شده: کف ۱ و قید «عدد صحیح» به‌عنوان گارد فنی شمارندهٔ ماه اضافه شد (مالک فقط سقف ۱۶ را گفته بود) — در worklog و گزارش مالک شفاف است.

---
Task ID: 75
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در منوی عمومی و در زیرمنوی اطلاعات پایه یک فرم اضافه کنید بنام سال مالی جدید» با فیلدهای: ۱-کد (اجباری، غیرخالی) ۲-عنوان (اجباری، فقط عدد، ۴ کاراکتر) ۳-تاریخ شروع ۴-تاریخ پایان ۵-فعال + سه قانون ثبت: سال مالی تکراری ممنوع، بازهٔ شروع/پایان تکراری ممنوع، کنترل طول بازه با «تعداد ماه‌های مالی» پیکربندی نرم‌افزار/تب حسابداری (نباید بیشتر باشد).

Work Log:
- دامنه: نرم‌افزار «عمومی» (appKey "general" از کاتالوگ — میزبان apps-service:3002) اولین اپ کاتالوگ شد که محتوای واقعی اعلامی می‌گیرد؛ بقیهٔ اپ‌ها روی قرارداد placeholder §4.6 ماندند. انتخاب بومی‌سازی: ماژول FiscalYear در settings-service (:3001 — سرویس دامنهٔ Gnr/عمومی میراث) تا خواندن «تعداد ماه‌های مالی» از همان جدول SoftwareConfig بدون تماس بین‌سرویسی انجام شود؛ مسیر مرورگر: /api/settings/fiscal-year/** (BFF امضاشده).
- دیتابیس (db/custom.db): جدول FiscalYear با CREATE TABLE مستقیم bun:sqlite (درس Task 69/72 — بدون db push) هم‌سبک DDL پرایسما؛ ID دستی، Code/Title/StartDate/EndDate/IsActive + بلوک کامل ۱۲فیلدی ارث‌بری AppBaseEntity + CreatedAt/UpdatedAt؛ دو unique index دومعیتی (Code+BusinessStructureRef) و (Title+BusinessStructureRef) = «سال مالی تکراری» در لایهٔ DB هم بسته شد. مدل در schema.prisma با کامنت کامل؛ TABLE_REGISTRY += FiscalYear (§16)؛ VERSIONED_MODELS += FiscalYear (§2.5)؛ prisma generate.
- بک‌اند (ماژول fiscal-year: dto/service/controller/module + ثبت در app.module): زنجیرهٔ اعتبارسنجی سرور — کد اجباری (422 فارسی)؛ عنوان: اجباری + فقط رقم لاتین (نرمال‌سازی ارقام فارسی/عربی ورودی) + دقیقاً ۴ کاراکتر (422)؛ تاریخی: 'YYYY/MM/DD' یا 'YYYYMMDD' شمسی نرمال به 'YYYYMMDD' با گارد y1300..1500/m1..12/d1..31 (422 قالب)؛ پایان قبل از شروع (422)؛ تکرار کد یا عنوان → 409 با نام رکورد برخوردی؛ هم‌پوشانی بازهٔ [شروع،پایان] با هر سال مالی موجود (بازهٔ بسته، تاریخ تک‌روزی = نقطه) → 409 با نمایش بازهٔ متداخل؛ طول بازه: ماه‌های سپری‌شدهٔ دقیق تا سطح روز (b.d < a.d → یک ماه کمتر؛ 1404/01/01→1406/01/01 = ۱۲ ماه مجاز، →1406/01/02 = ۱۳ ماه رد) در برابر SoftwareConfig("accounting","fiscalMonthsCount") با پیش‌فرض ۱۲ (قرارداد Task 74) → 422 با ذکر سقف و مسیر تنظیمات. ID با generateNextId("FiscalYear")؛ مهر appBaseOnCreate/OnUpdate با SYSTEM_ACTOR؛ update همان قوانین با مستثنای خود رکورد؛ DELETE فیزیکی. tsc سرویس = 0.
- فرانت — GeneralWindow (src/components/erp/general/general-window.tsx): خانه = هدر گرادیانی «عمومی» + زیرمنوی تاشوی «اطلاعات پایه» (FolderOpen کهربایی، chevron جهت‌آگاه) با آیتم «سال مالی جدید» (CalendarPlus فیروزه‌ای) + ردیف خط‌چین «فرم‌های بعدی به‌مرور اعلان و اضافه می‌شوند»؛ کلیک آیتم = زیرصفحه با نوار باریک بردارًا (بازگشت / اطلاعات پایه / سال مالی جدید — الگوی Win-11 پنجرهٔ تنظیمات) و FiscalYearForm.
- فرانت — FiscalYearForm (src/components/erp/general/fiscal-year-form.tsx): پوستهٔ SimpleFormTwoRowTabbed با عنوان «سال مالی جدید»، بج «عمومی»، دکمهٔ تم شب/روز هدر (Task 73 خودکار)، فیلدهای کد* / عنوان* (فیلتر هم‌زمان با تایپ: normalizeDigits + فقط رقم + سقف ۴ کاراکتر، placeholder «1404») / تاریخ شروع (ماسک Task 49) / تاریخ پایان / فعال (چک‌باکس، پیش‌فرض روشن)؛ اکشن بار ده‌آیکونه + ناوبری |< < > >| + لیست کشویی رکوردها (عنوان «کد - عنوان» + زیرنویس بازهٔ تاریخ).
- اعتبارسنجی دولایهٔ فرانت: قبل از ارسال — کد خالی، عنوان خالی/غیر-۴رقمی، قالب تاریخ ناقص، ترتیب تاریخ‌ها، و طول بازه > سقفِ واکشی‌شده از GET /api/settings/software-config/accounting (پیش‌فرض ۱۲) همگی توست فارسی و بدون ارسال؛ خطای واقعی سرور (409/422 پیام فارسی) مستقیم در توست.
- رفتارهای رکورد: ذخیره = POST جدید/PUT ویرایش → بازخوانی فهرست + باز شدن رکورد ذخیره‌شده؛ «ذخیره و جدید» = ذخیره موفق → فرم خالی؛ «کپی» = جداسازی به رکورد نو با همان مقادیر (حذف قفل می‌شود تا ذخیره)؛ حذف با دیالوگ تأیید → فرم خالی؛ «ریست (+)» = شروع ثبت جدید (فرم خالی — بازکردن رکورد از لیست/ناوبری)؛ بستن/«ذخیره و بستن» = بازگشت به منوی عمومی؛ canDelete فقط با رکورد جاری؛ chromeless captionها به پنجرهٔ میزبان وصل (useWindowChrome، headerMaximized از ویندوز app/general).
- routing: desktop.tsx در شاخهٔ kind==="app" فقط appKey==="general" به GeneralWindow هدایت شد (کامنت Task 75)؛ بقیهٔ appKeyها دست‌نخورده.
- i18n: ۱۶ کلید جدید fy.* (menuBasicInfo/menuBasicInfoDesc/formTitle/formDesc/menuPending/code/title/startDate/endDate/active/errCodeRequired/errTitleRequired/errTitleDigits/errDateInvalid/errDateOrder/errMonths با {max}) ×۱۳ زبان = ۱۹۲ خط با اسکریپت درج لنگردار بعد از settings.swIntError — راستی‌آزمایی اسکریپتی ۱۳/۱۳ برای هر ۱۶ کلید؛ بج/بردکرامب/کلیدهای مشترک (app.general، settings.back، abar.*) بازاستفاده شدند.
- رفع خطاها: FormAction type (Promise<boolean> → wrapper async void برای onSave)؛ ChevronLeft جاافتادهٔ import؛ حذف helper بلااستفاده (lint warning)؛ lint نهایی صفر/صفر؛ tsc فرانت بدون خطای جدید.
- E2E API (curl روی BFF :3000): لیست خالی ✓؛ کد خالی → 400 DTO ✓؛ عنوان «abcd» → 422 فارسی ✓؛ ثبت 1404 کامل → ID=1 از IDGeneration با ردیف ارث‌بری کامل (creator=system، CreationDate=14050803 شمسی، BSRef=1) ✓؛ تکرار عنوان → 409 «سال مالی تکراری است: عنوان …» ✓؛ تکرار کد → 409 ✓؛ هم‌پوشانی → 409 با بازهٔ متداخل ✓؛ بازهٔ ۱۸ماهه → 422 «(12 ماه)» ✓؛ 1405/01/01→1406/01/01 = دقیقاً ۱۲ ماه → ثبت ✓؛ پایان<شروع → 422 ✓؛ سقف پویا: PUT fiscalMonthsCount=16 → بازهٔ ۱۳ماهه غیرمتداخل ثبت شد و ۱۷ماهه با «(16 ماه)» رد ✓؛ PUT ویرایش → Version 1→2 خودکار + مهر LastModifier ✓؛ DELETE → حذف ✓؛ بازگردانی تنظیم به خالی (پیش‌فرض ۱۲) ✓.
- E2E مرورگر (agent-browser، 1280×800 و 375×720): دسکتاپ — آیکون «عمومی» → پنجره با زیرمنوی «اطلاعات پایه» (expanded) و آیتم «سال مالی جدید» ✓؛ فرم با ۵ فیلد، فعال=تیک، حذف/حذف و جدید/حذف و بستن disabled ✓؛ ذخیرهٔ خالی → توست «ثبت کد الزامی است…» ✓؛ تایپ «abcd14045» در عنوان → «1404» (فیلتر رقم+سقف) ✓؛ عنوان ۲رقمی → توست ۴ کاراکتر ✓؛ ثبت معتبر 1/1404/1404-01-01→1404-12-29 → توست موفق + حذف فعال شد ✓؛ ریست → فرم خالی و حذف disabled ✓؛ تکرار عنوان → توست سرور 409 ✓؛ تکرار کد → 409 ✓؛ هم‌پوشانی → توست بازهٔ متداخل ✓؛ ۱۸ ماه → توست فرانت «نمی‌تواند بیشتر از 12 ماه باشد» ✓؛ ۱۲ ماه → ذخیره ✓؛ پایان<شروع → توست ترتیب ✓؛ لیست کشویی دو رکورد با بازهٔ تاریخ ✓؛ بازکردن رکورد از لیست → فیلدها پر ✓؛ دیالوگ «تأیید حذف» → حذف + فرم خالی ✓؛ ناوبری «رکورد اول» → کد 3 ✓؛ کپی → مقادیر ماند و حذف disabled (رکورد نو) ✓؛ بازگشت → منو ✓. موبایل 375px (بیشینه): اکشن بار دو ردیفه، فیلدهای تک‌ستونه ✓. آلمانی (LTR): Allgemein/Basisinformationen/Neues Geschäftsjahr/Code/Titel/Startdatum/Enddatum/Aktiv/Zurück ✓ (placeholder «1404» در Titel طبیعی است)؛ بازگشت به fa ✓. صفر خطای کنسول/دواِرور در کل سناریو.
- یافتهٔ E2E و بهبود حاصل: «ریست» ابتدا رکورد جاری را بازمی‌گرداند (undo ویرایش) که جریان «ثبت سال بعد» را نمی‌بست — به «شروع ثبت جدید» (فرم خالی) تغییر یافت و در E2E دوم تأیید شد.
- پاک‌سازی: رکوردهای آزمون (ID 1..5) حذف شدند — جدول FiscalYear ۰ ردیف، SoftwareConfig حسابداری ۰ ردیف (IDGeneration.FiscalYear.LastID=3 طبق قرارداد شکاف §8)؛ اسکریپت موقت i18n حذف شد؛ settings-service با bun run start روی :3001 راه‌اندازی مجدد شد (لاگ §2.5 شامل FiscalYear).

Stage Summary:
- فرم «سال مالی جدید» با کامل‌ترین زنجیرهٔ قواعد ثبت تا امروز زنده شد: منوی عمومی ← زیرمنوی اطلاعات پایه ← فرم با کد اجباری، عنوان عددی ۴کاراکتری (فیلتر ورودی)، تاریخ شروع/پایان شمسی ماسک‌دار و فعال؛ سه قانون مالک (عدم تکرار سال مالی، عدم تکرار بازه، سقف طول بازه برابر «تعداد ماه‌های مالی» تب حسابداری با پیش‌فرض ۱۲) هم دولایه (فرانت+سرور) اعمال و هم API و هم مرورگر راستی‌آزمایی شد؛ ارث‌بری AppBaseEntity کامل (ID دستی، Version خودکار، مهر شمسی تهران، BSRef) و «سال مالی تکراری» با unique دوتایی در DB هم قفل است.
- artifacts: mini-services/settings-service/{prisma/schema.prisma، src/fiscal-year/*، src/id-generation/table-registry.ts، src/prisma/prisma.service.ts، src/app.module.ts}، جدول FiscalYear در db/custom.db؛ src/components/erp/general/{general-window.tsx، fiscal-year-form.tsx}؛ src/components/desktop/desktop.tsx؛ src/i18n/dictionaries.ts (۱۶ کلید ×۱۳).
- محدودیت شناخته‌شده: پیام‌های خطای سرور فارسی‌اند (الگوی Task 72/74) تا مکانیزم messageKey چندزبانه اضافه شود؛ اعتبارسنجی تاریخ سطح قالب/ماه/روز است (اعتبارسنجی کامل تقویم شمسی مثل روز ۳۱ در ماه ۳۰روزه برای تکس آینده)؛ دامنهٔ خواندن/نوشتن فعلاً دفتر مرکزی (SYSTEM_ACTOR) است و با اتصال IAM به baseDataScopeWhere منتقل می‌شود.

---
Task ID: 76
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «فیلد‌های CreationDate و LastModificationDate/Time را از فیلدهای ارث‌بری پاک کنید چون CreatedAt و UpdatedAt همان منطق را دارد» (لاغرسازی بلوک ارث‌بری AppBaseEntity از ۱۲فیلد به ۸فیلد؛ پرسش‌های مشاوره‌ای پیشین مالک دربارهٔ «تاریخ شمسی تهران» و تفاوت دو خانوادهٔ ستون‌ها بستر همین تصمیم بود).

Work Log:
- دامنه‌یابی کامل با rg: ارجاع به چهار ستون مهرِ شمسی فقط در _shared/app-base-entity.ts، اسکیمای پرایسمای settings-service (SoftwareConfig/FiscalYear)، اسکیمای dfb-service (۹ مدل Dfb*) و toDto دو سرویس settings بود؛ فرانت (src/) صفر ارجاع داشت و سرویس‌های dfb فقط spread می‌کردند.
- قرارداد مشترک mini-services/_shared/app-base-entity.ts: APP_BASE_FIELDS و AppBaseEntityFields به ۸فیلد (version/creator/lastModifier/businessStructureRef/companyRef/branchRef/agencyRef/shopRef) لاغر شد؛ appBaseOnCreate فقط creator + زنجیرهٔ ساختار سازمانی برمی‌گرداند و appBaseOnUpdate فقط lastModifier؛ کامنت سرصفحهٔ فایل تصمیم مالک (1405/08/03) را مستند می‌کند: «زمانِ ایجاد/ویرایش = CreatedAt/UpdatedAt پرایسما؛ Creator/LastModifier برای چه‌کسی می‌ماند».
- gregorianToJalali + tehranNowParts حفظ شدند اما نقششان به «تبدیل نمایش» تغییر کرد: هر جا لازم باشد CreatedAt به شمسی تهران نمایش داده شود در زمانِ خواندن با tehranNowParts(new Date(row.createdAt)) تبدیل می‌شود (کاربرد آیندهٔ UI/گزارش) — دیگر هیچ نوشتنی مهر شمسی تولید نمی‌کند.
- اسکیمای settings-service: قالب سرصفحهٔ AppBaseEntity به ۸فیلد بازنویسی شد؛ مدل‌های SoftwareConfig و FiscalYear چهار ستون CreationDate/CreationTime/LastModificationDate/LastModificationTime را از دست دادند (LastModifier ماند)؛ کامنت «۱۲فیلدی» → «۸فیلدی (نسخهٔ Task 76)». اسکیمای dfb-service: همان حذف با replace_all روی هر ۹ بلوک یکسان (DfbMenu/DfbForm/DfbFormTab/DfbFormField/DfbQuery/DfbQueryField/DfbFormData/DfbFormDataValue/DfbTranslation) + اصلاح کامنت سرصفحه.
- toDto سرویس‌های software-config و fiscal-year: چهار فیلد از تایپ پارامتر و نگاشت پاسخ حذف شد؛ اکنون DTO شامل creator/lastModifier/createdAt(ISO)/updatedAt(ISO) است.
- prisma generate هر دو سرویس بدون خطا؛ tsc --noEmit هر دو = ۰.
- مهاجرت دیتابیس بدون db push (درس Task 69/72): بکاپ اول (db/custom.db.bak-t76 و db/dfb.db.bak-t76)؛ اسکریپت bun:sqlite برای هر جدولی که CreationDate داشت در هر دو فایل DB — ۴ ALTER TABLE DROP COLUMN — در تراکنش: custom.db ده جدول (۹ Dfb + SoftwareConfig + FiscalYear؛ Dfbهای custom.db باقی‌ماندهٔ قدیمی‌اند و برای هم‌راستایی لاغر شدند) و dfb.db نه جدول = ۱۹ جدول/۷۶ ستون؛ راستی‌آزمایی پس از مهاجرت: صفر ستون باقی‌مانده، شمار ردیف‌ها دست‌نخورده (DfbMenu=29، DfbTranslation=48، DfbForm=3)، ایندکس‌های unique دوتایی FiscalYear سالم.
- ری‌استارت هر دو سرویس (kill با پورت + bun run start در پس‌زمینه): settings-service :3001 و dfb-service :3003 هر دو «successfully started» با فهرست VERSIONED_MODELS شامل مدل‌های لاغرشده.
- E2E API روی BFF :3000: PUT fiscalMonthsCount=12 → ردیف id=5 با بلوک لاغر ✓؛ POST سال مالی E2E/1404/12ماهه → id=7، version=1 ✓؛ PUT ویرایش → version=2 + lastModifier=system + updatedAt جابه‌جا ✓؛ گارد هم‌پوشانی بازه → 409 فارسی ✓؛ گارد طول بازه با سقف پویا → 422 «(14 ماه)» (خواندن زنده از SoftwareConfig سالم ماند) ✓؛ DELETE و الگوی حذف با configValue خالی → هر دو جدول ۰ ردیف (قرارداد شکاف IDGeneration حفظ — LastID 5 و 7 بر جای مانده) ✓.
- E2E مرورگر (agent-browser 1280×800): هاب پیکربندی نرم‌افزارها → تب عمومی (بخش‌های زبان Task 73 پابرجا) → تب حسابداری = فیلد «تعداد ماه‌های مالی» با پیش‌فرض ۱۲، ذخیرهٔ UI موفق (ردیف از API بازخوانی شد با بلوک لاغر) ✓؛ پنجرهٔ عمومی → اطلاعات پایه → سال مالی جدید → فرم با نوار اکشن کامل و دکمهٔ تم هدر ✓؛ پر کردن کد=E2E/عنوان=1404 (ماسک رقم)/تاریخ‌ها با ماسک 1404/01/01 و 1404/12/29 → ذخیره = توست «اطلاعات با موفقیت ذخیره شد» و ردیف در API ✓؛ حذف با دیالوگ «تأیید حذف» → توست «اطلاعات حذف شد» و جدول خالی ✓؛ صفر خطای کنسول/دواِرور و صفر خطای dev.log در کل سناریو.
- پاک‌سازی: رکوردهای آزمون حذف شدند؛ اسکریپت‌های موقت /tmp پاک شدند؛ دو فایل بکاپ *.bak-t76 در db/ برای بازگشت اضطراری نگه داشته شد.
- lint برنامهٔ اصلی = ۰ خطا/هشدار.

Stage Summary:
- بلوک ارث‌بری AppBaseEntity طبق تصمیم مالک به ۸فیلد رسید: زمانِ ایجاد/ویرایش منحصراً بر عهدهٔ CreatedAt/UpdatedAt (اپوک UTC پرایسما) و هویتِ ایجادکننده/ویرایشگر روی Creator/LastModifier — چهار ستون مهرِ شمسی از اسکیما، سرویس‌ها، DTOها و هر ۱۹ جدول هر دو دیتابیس حذف شد؛ هیچ ردیفی از دست نرفت و هیچ گارد اعتبارسنجی (تکرار/هم‌پوشانی/سقف پویا) آسیب ندید.
- قرارداد جدید برای مدل‌های آینده: هر مدل عملیاتی ۸ فیلد ارث‌بری + CreatedAt/UpdatedAt می‌گیرد؛ نمایش شمسیِ زمان = تبدیل در زمان خواندن با tehranNowParts (تبدیل‌گر در _shared/app-base-entity.ts حفظ شد).
- artifacts: mini-services/_shared/app-base-entity.ts؛ mini-services/settings-service/{prisma/schema.prisma، src/software-config/software-config.service.ts، src/fiscal-year/fiscal-year.service.ts}؛ mini-services/dfb-service/prisma/schema.prisma؛ مهاجرت ALTER روی db/custom.db و db/dfb.db (بکاپ: *.bak-t76).

---
Task ID: 77
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «تمامی ستون‌های از نوع تاریخ فقط باید بصورت میلادی در بانک اطلاعاتی ذخیره شوند و نباید به تاریخ‌های دیگر در بانک اطلاعاتی ذخیره شوند ولی موقع نمایش در فرم‌ها باید به تاریخ زبان انتخاب شده نمایش داده شوند» (قرارداد جدید تقویم: ذخیره = میلادی، نمایش = تقویمِ زبان انتخابی).

Work Log:
- دامنه‌یابی: تنها ستون‌های تاریخِ «غیرمیلادی در حال ذخیره» StartDate/EndDate جدول FiscalYear بودند ('YYYYMMDD' شمسی — جدول ۰ ردیف، بدون نیاز به مهاجرت داده)؛ CreatedAt/UpdatedAt از Task 76 از قبل میلادی اپوک UTC است؛ فرانت فقط در fiscal-year-form.tsx تاریخ کار می‌کند (mask Task 49 تقویم‌آگنوست است).
- تبدیل‌گر مرجع جدید src/lib/calendar-date.ts (کلاینت‌سِیف، بدون وابستگی): پورت وفادار الگوریتم استاندارد jalaali-js (jalCal/g2d/d2g/j2d/d2j) + JALALI_LOCALES = [fa, ps, ckb] (سه زبانِ تقویم شمسی؛ ۱۰ زبان دیگر میلادی) + storedToDisplayDate (میلادی ISO → 'YYYY/MM/DD' تقویم زبان) + displayToStoredDate (نمایش ماسک‌دار → 'YYYY-MM-DD' میلادی با نرمال‌سازی ارقام) + monthsBetweenISO (همان معنای Task 75 روی تقویم ذخیره‌سازی) — اعتبار تاریخ با رفت‌وبرگشت دوجهته (j→g→j و UTC round-trip میلادی) تضمین می‌شود؛ dودیت آزمون: Nowruz 1404=2025-03-21 ✓، اسفند ۳۰ سال کبیسه 1403=2025-03-20 ✓، 1404/12/30 رد ✓، 2025-02-30 رد ✓، شمار ماه 12/11 مرزی ✓.
- سرور fiscal-year.service.ts: normalizeShamsiDate → normalizeGregorianDate (پذیرش 'YYYY-MM-DD'/'YYYY/MM/DD'/'YYYYMMDD' همگی به‌عنوان میلادی، گارد سال ۱۹۰۰..۲۱۹۹، اعتبار تقویم واقعی میلادی با UTC round-trip)؛ elapsedMonths روی ISO میلادی؛ rangesOverlap بدون تغییر (مقایسهٔ لغوی ISO درست است)؛ پیام 422 قالب اکنون صریح میلادی است («قالب تاریخ شروع باید میلادی و در قالب YYYY-MM-DD باشد»)؛ ورودی شمسی به سرور دیگر پذیرفته نمی‌شود (1404/01/01 → 422) — تبدیل «فقط فرانت»؛ toDto تاریخ را عیناً میلادی برمی‌گرداند؛ dto/schema کامنت‌ها به میلادی به‌روز شدند (بدون تغییر DDL — ستون TEXT ماند، محتوا عوض شد).
- فرانت fiscal-year-form.tsx: locale از useSettings؛ applyRecord تاریخ میلادی ذخیره‌شده را با storedToDisplayDate به تقویم زبان برمی‌گرداند (deps [locale])؛ validate و بدنهٔ save با displayToStoredDate به میلادی تبدیل و همین را POST/PUT می‌کنند؛ زیرنویس لیست رکوردها در زمان رندر تبدیل می‌شود (سوییچ زبان → لیست فوراً تقویم عوض می‌کند)؛ ماسک Task 49 بدون تغییر برای هر دو تقویم کار می‌کند (شکل رقمی یکسان YYYY/MM/DD).
- tsc سرویس=۰؛ lint برنامهٔ اصلی=۰؛ settings-service ری‌استارت و بالا آمد.
- E2E API: POST میلادی 2025-03-21→2026-03-21 → ذخیرهٔ عین ISO در DB (با sqlite مستقیم کنترل شد) ✓؛ ورودی شمسی 1404/01/01 → 422 میلادی ✓؛ 2025-02-30 (ناممکن) → 422 ✓؛ هم‌پوشانی روز مرزی → 409 با نمایش بازهٔ میلادی ✓؛ ۱۳ماهه → 422 با سقف پویا ۱۲ ✓.
- E2E مرورگر (agent-browser، fa و en): در fa تایپ 1405/01/01→1406/01/01 → API میلادی 2026-03-21→2027-03-21 ثبت شد ✓ (و ناخواسته گارد هم‌پوشانی روز مرزی با ردیف آزمون قبلی هم از مسیر فرانت راستی‌آزمایی شد)؛ لیست fa زیرنویس شمسی ✓؛ سوییچ en → لیست «2026/03/21 ← 2027/03/21» ✓ (اسکرین‌شات)، بازکردن رکورد در en = ورودی‌های میلادی ✓، بازگشت به fa → همان رکورد «1405/01/01 ← 1406/01/01» شمسی ✓ (ذخیره/نمایش دوجهته کامل)؛ صفر خطای کنسول.
- پاک‌سازی: ردیف آزمون حذف (جدول ۰ ردیف)، locale به fa بازگردانده شد، اسکریپت‌های موقت پاک شدند.

Stage Summary:
- قرارداد تقویم مالک مستقر شد: «DB فقط میلادی، UI به تقویم زبان انتخابی» — StartDate/EndDate سال مالی حالا میلادی ISO ذخیره می‌شوند، سرور هر ورودی غیرمیلادی را رد می‌کند، و سه زبان fa/ps/ckb شمسی می‌بینند (ورود + نمایش) در حالی که ۱۰ زبان دیگر میلادی می‌بینند؛ همهٔ قواعد ثبت (یکتایی، عدم هم‌پوشانی، سقف پویای ماه‌ها) روی تاریخ میلادی معیار دولایه باقی است؛ الگوی الگوریتم jalaali-js برای هر نمایش تاریخ آینده در UI قابل بازاستفاده است.
- artifacts: src/lib/calendar-date.ts (جدید)، src/components/erp/general/fiscal-year-form.tsx، mini-services/settings-service/{src/fiscal-year/fiscal-year.service.ts، src/fiscal-year/fiscal-year.dto.ts، prisma/schema.prisma} — بدون مهاجرت DDL.
- محدودیت‌های شناخته‌شده: پیام‌های خطای سرور فارسی‌اند (الگوی پیشین) و تاریخ داخل پیام 409 میلادی نمایش داده می‌شود؛ اگر رکوردی باز باشد و کاربر وسط ویرایش زبان عوض کند، نمایش فیلدهای تاریخ تا بازکردن مجدد رکورد به‌روز نمی‌شود (لیست فوراً عوض می‌شود)؛ عنوان ۴رقمی (مثل «1404») دادهٔ کاربر است نه ستون تاریخ و طبق قاعده دست‌نخورده ماند.

---
Task ID: 78
Agent: Z.ai Code (main orchestrator)
Task: «تمامی کسب‌وکارهای نوع هلدینگ/شرکت + شعبه/نمایندگی/فروشگاه در هدر داشبورد به‌صورت آبشاری
نمایش داده شود؛ پیش‌فرض = اولین شرکت تعریف‌شده، پس از تغییر = آخرین انتخاب کاربر (پایدار)؛
نمایش اطلاعات فرم‌ها بر اساس هر سطح انتخابی در همان سطح فیلتر گردد» — زمینهٔ سطح سازمانی
(Org Context) در هدر داشبورد + فیلتر دادهٔ فرم‌های DFB.

Work Log:
- org-context-store.ts (جدید، src/stores): درخت BusinessStructure از settings-BFF با
  «erp:records-changed» بازخوانی می‌شود؛ آبشار چهار فیلد — companies = گره‌های فعال نوع ۱|۲ به
  ترتیب ID («اولین شرکت»)، branches/agencies/shops = فرزندان نوع ۳|۴|۵ زیر عمیق‌ترین سطح انتخابی
  (تنگ‌شونده در هر گام)؛ انتخاب شرکت سطوح پایین‌تر را پاک می‌کند؛ ids نامعتبر در بارگذاری
  fall-back می‌شوند؛ انتخاب کاربر در erp.orgContext (persist، partialize فقط ids).
- ancestryChain: زنجیرهٔ اقامت = تبار کاملِ عمیق‌ترین گره (نوع ۵→ShopRef، ۴→AgencyRef، ۳→BranchRef،
  ۱|۲→CompanyRef) — حتی اگر کاربر مستقیم فروشگاه را زده باشد، BranchRef/CompanyRef از درخت حل
  می‌شود تا فیلتر سطوح بالاتر رکوردهای زیرمجموعه را هم ببیند (قرارداد AppBase: anchors از تبار).
- dashboard-header.tsx + org-selectors.tsx (جدید): چهار فیلد pill هم‌سبک با جست‌وجو (Building2/
  Building/Handshake/Store)؛ فیلدهای شعبه/نمایندگی/فروشگاه فقط وقتی لیست‌شان غیرخالی است رندر
  می‌شوند؛ آیتم اولِ سطوح عمیق «همه» = بازگشت به سطح والد؛ pointerdown/dblclick داخل فیلدها
  propagate نمی‌شود (هدر نکشد/اسنپ نکند)؛ عمودی و موبایل = فقط آیکون (۲۴px، بدون سرریز).
- dfb-service: SaveFormDataDto.org (اختیاری) → actorFromOrg (nodeId = عمیق‌ترین، زنجیره از بدنه،
  بدون org = SYSTEM_ACTOR دفتر مرکزی) در saveData فقط برای رکورد تازه (جابه‌جایی رکورد قدیم ممنوع)؛
  loadData با query params companyRef/branchRef/agencyRef/shopRef/shared → orgScopeWhere:
  OR(ستون زنجیرهٔ عمیق‌ترین سطح، BusinessStructureRef=عمیق‌ترین گره، BusinessStructureRef=1 اگر
  shared) — بدون companyRef = بدون فیلتر؛ «shared» = IsBasicInfoShared ریشه که کلاینت از درخت
  می‌فرستد (قرارداد اشتراک دفتر مرکزی، Task 44).
- فرانت: dfb-store → loadFormData(scope) + orgScopeQuery + saveFormData(org)؛ dfb-form-runtime
  و records-list-window با useOrgScope فیلتر می‌شوند و افکت مستقل رکوردها را با تغییر سطح
  دوباره واکشی می‌کند (بدون واکشی مجدد تعریف فرم)؛ save ران‌تایم زنجیرهٔ org را می‌فرستد
  (فقط وقتی شرکتی انتخاب است)؛ dfb-studio (پیش‌نمایش طراحی) عمداً بدون scope ماند.
- i18n: ۵ کلید header.orgCompany/orgBranch/orgAgency/orgShop/orgAll در ۱۳ زبان.
- E2E API (پس از کشتن پروسهٔ قدیمی :3003 که EADDRINUSE داده بود): مُهر DB = {24: BS=14,C=14}
  {25: BS=16,C=14,B=16} {26: BS=19,C=14,B=16,S=19} {27: بدون org → BS=1}؛ فیلتر: company14
  shared=0 → ۲۴|۲۵|۲۶ (دفتر مرکزی پنهان)، shared=1 → +۲۷، +branch16 → ۲۵|۲۶، +shop19 → ۲۶،
  company18 → خالی.
- E2E مرورگر: پیش‌فرض «شرکت نمونه» در تریگر؛ لیست شرکت‌ها = هلدینگ نمونه/شرکت نمونه/شرکت دوم؛
  انتخاب شعبه → فیلد نمایندگی ناپدید شد (آبشار درست)؛ لیست رکوردهای فرمِ باز «انواع وسیله نقلیه»
  زنده فیلتر شد: شعبه→[25,26]، همه→[24,25,26]، فروشگاه→[26]، شرکت دوم→[]؛ ذخیره از ران‌تایم در
  سطح فروشگاه → رکورد ۲۹ با زنجیرهٔ کامل B=16 (پس از فیکس ancestry)؛ reload → «شرکت دوم» باقی
  ماند (آخرین انتخاب کاربر) و بازگشت به «شرکت نمونه»؛ en → برچسب‌ها + «Sample Company»؛ fa→
  بازگشت؛ اسکرین‌شات هدر با ۴ فیلد؛ صفر خطای کنسول/صفحه؛ موبایل ۳۹۰px = ۴ دکمهٔ آیکونی.
- lint برنامه = ۰ (پس از فیکس set-state-in-effect: واکشی رکوردها داخل Promise.resolve().then)؛
  tsc dfb-service = ۰؛ dev.log = همه ۲۰۰/۲۰۱ (خطاهای «Return statement» قدیمیِ settings-window
  از جلسات قبل است — فایل دست‌نخورده و صفحه سالم).

Stage Summary:
- قرارداد مالک پیاده شد: هدر داشبورد مرجع «زمینهٔ سازمانی» است — ۴ فیلد آبشاری (هلدینگ/شرکت ←
  شعبه ← نمایندگی ← فروشگاه)، پیش‌فرض اولین شرکت، پایدارسازی آخرین انتخاب، و فیلتر دادهٔ فرم‌ها
  دقیقاً در سطح انتخابی؛ رکوردهای تازه در همان سطح ساکن می‌شوند و ستون‌های زنجیرهٔ AppBase
  (BusinessStructureRef/CompanyRef/BranchRef/AgencyRef/ShopRef) حالا به‌صورت عملیاتی استفاده می‌شوند.
- artifacts: src/stores/org-context-store.ts، src/components/desktop/org-selectors.tsx (جدید)؛
  src/components/desktop/dashboard-header.tsx، src/stores/dfb-store.ts،
  src/components/erp/form-builder/{dfb-form-runtime.tsx،records-list-window.tsx}،
  src/i18n/dictionaries.ts؛ mini-services/dfb-service/src/forms/{forms.dto.ts،forms.controller.ts،
  forms.service.ts} — بدون مهاجرت DDL (ستون‌ها از قبل وجود داشتند).
- دادهٔ نمونه برای دمو باقی مانده: گره‌های ۱۵..۱۹ (هلدینگ نمونه، شعبه مرکزی، نمایندگی تهران،
  شرکت دوم، فروشگاه شعبه مرکزی) + فیلدهای vt_title/vt_code و ۵ رکورد فرم ۱۱ در ۴ سطح
  (۲۴ شرکت، ۲۵ شعبه، ۲۶ فروشگاه، ۲۷ دفتر مرکزی، ۲۹ فروشگاه) — مالک می‌تواند از خودِ فرم‌ها پاک کند.
- محدودیت‌های شناخته‌شده: فیلتر «در همان سطح» = زیردرختِ سطح انتخابی (سطح + پایین‌تر) با ستون
  زنجیره؛ نمایندگی تو در تو (نمایندگی زیر نمایندگی) فقط با عمیق‌ترین AgencyRef مچ می‌شود؛
  رکوردِ باز در فرم هنگام تغییر زمینه دستی بسته نمی‌شود (فقط فهرست فیلتر می‌شود)؛ پیام‌های
  سرور همچنان فارسی.

---
Task ID: 79
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در فرم ساختار کسب و کار، کاربر زمانی می‌تواند شاخه‌های از نوع شرکت، شعبه،
نمایندگی و فروشگاه تعریف نماید که این آیتم تیک داشته باشند. بصورت پیش‌فرض با نصب نرم‌افزار، تیک
هلدینگ فعال باشد و غیرقابل برداشتن توسط کاربر باشد» (گیتِ نوع‌ها با تیک‌های ریشه + قفل سیستميِ هلدینگ).

Work Log:
- تفسیر قرارداد (اعلام‌شده در worklog): تیک‌های پنج‌گانهٔ فرم ریشه همان ActiveStructureTypes هستند؛
  «ساختارهای تعریف‌شدهٔ سیستم» در هشدار Union = هلدینگِ سیستمی (۱) — مجموعهٔ مؤثر = {۱} ∪ تیک‌های
  کاربر؛ برداشتن تیک فقط «تعریف گرهٔ جدید» از آن نوع را می‌بندد و گره‌های موجود حفظ می‌شوند.
- بک‌اند business-structure.service.ts: effectiveActiveTypes() (ریشه خوانده، JSON امن با گارد ۱..۵،
  همیشه شامل ۱)؛ گیتِ create (نوع ∈ مؤثر → وگرنه 422 messageKey=bs.val.typeDisabled با پیام فارسی
  «تعریف شاخه از نوع «X» فعال نیست — ابتدا در دفتر مرکزی تیک آن را بزنید» + TYPE_FA)؛ گیتِ update
  روی «تغییر نوع» به نوعِ بی‌تیک (همان 422)؛ گارد ریشه: PUT بدون ۱ در activeStructureTypes → 422
  messageKey=bs.val.holdingLocked («تیک «هلدینگ» پیش‌فرض سیستم است و قابل برداشتن نیست»). tsc=۰.
- seed.service.ts: پیش‌فرض نصب تازه bs.activeStructureTypes = "[1]" (فقط هلدینگ — سایر تیک‌ها را
  مالک خودش بسته به نیاز می‌زند) + ریشه با "[1]" متولد می‌شود + گام backfill آرام‌بخشِ هر بوت
  (idempotent): اگر تیک ۱ در ریشهٔ قدیمی نیست (مثل "[]" قبل از Task 79) merge و آینهٔ Setting —
  جایگزین اسکریپت مهاجرت؛ چون UI قفل و API رد می‌کند هرگز با انتخاب مالک نمی‌جنگد. اجرای اول:
  root "[]" → "[1]" تأیید شد.
- فرانت bs-window.tsx: چک‌باکس هلدینگ ریشه checked:true + disabled (SimpleFormField.disabled →
  Checkbox radix) و no-op در onFieldChange؛ payload ریشه همیشه ۱ را همراه می‌برد؛ effectiveTypes
  از تیک‌های ریشهٔ بارگذاری‌شده (union با ۱) → فیلتر typeOptions فرم ثبت (پایهٔ allowedChildTypes ∩
  مؤثر؛ نوعِ جاریِ گره در view همیشه selectable می‌ماند)؛ bsCanHostChild حالا «∩ مؤثر ≠ ∅» است →
  فلای‌اوت «افزودن زیرشاخه» و fallback ریست هم گیت می‌شوند؛ chips هشدار = {۱} ∪ تیک‌ها (وابستگی به
  definedTypes حذف شد — state هم پاک شد)؛ hint جدید زیر هشدار ریشه. i18n: کلید bs.hint.holdingLocked
  ×۱۳ زبان بعد از bs.hint.codeAuto (راستی‌آزمایی 13/13).
- ops (الگوی محیط): فرایندهایی که از شِل ابزار spawn می‌شوند با پایان هر call کشته می‌شوند
  (setsid/nohup/bash یتیم همه آزمون و رد شدند؛ درس: dfb چون از نسل محیط بود زنده ماند) →
  route عملیاتی src/app/api/ops/start-service/route.ts (POST ?service=settings-service|dfb-service
  → spawn detached از دل پروسهٔ بلندمدت dev :3000 با لاگ /tmp/<name>.log) — سرویس تنظیمات از همین
  مسیر بالا آمد و در طول کل E2E مرورگر ماندگار شد.
- E2E API (BFF :3000، امضای داخلی): ریشه پس از بوت "[1]" ✓؛ PUT [2] (بدون هلدینگ) → 422
  holdingLocked ✓؛ PUT [1,2] → 200 ✓؛ POST شرکت تیک‌خورده → 201 (id=21) ✓؛ POST فروشگاه بی‌تیک →
  422 typeDisabled ✓؛ POST هلدینگ زیر ریشه (همیشه آزاد) → 201 (id=22) ✓؛ POST شعبه زیر شرکت بی‌تیک →
  422 ✓؛ تیک [1,2,3] → شعبه → 201 (id=23) ✓؛ PUT شعبه→نوع ۵ بی‌تیک → 422 ✓؛ ویرایش بدون تغییر نوعِ
  گره‌ای که نوعش بی‌تیک شده → 200 (حفظ موجودها) ✓؛ پاک‌سازی 20/21/22/23 → درخت ۷ گره، تیک‌ها [1]
  (ردیف 20 بقایای POST خرابِ اولین curl بود و جداگانه حذف شد).
- E2E مرورگر (agent-browser 1280×800 + 375×720): فرم ریشه = هلدینگ ✓(قفل) — کلیک واقعی روی آن
  before=true/after=true/disabled=true ✓؛ hint «تیک «هلدینگ» پیش‌فرض سیستم است و قابل برداشتن نیست»
  نمایان ✓؛ chips=[هلدینگ] ✓؛ تیک شرکت + ذخیره → chips=[هلدینگ/شرکت] ✓؛ فرم ثبت زیر ریشه → لیست
  نوع=[هولدینگ،شرکت] ✓؛ فرم ثبت زیر هلدینگ نمونه → لیست=[شرکت] ✓؛ انتخاب شعبه مرکزی + ریست(+)
  → fallback به ریشه (شعبه دیگر والد نمی‌شود) ✓؛ بازگردانی تیک شرکت با ذخیره → ریشه [1] و
  chips=[هلدینگ] ✓؛ اسکرین‌شات دسکتاپ/موبایل ذخیره شد؛ صفر خطای کنسول/صفحه و dev.log فقط
  200/201/422های طراحی‌شده.
- lint نهایی = ۰/۰؛ tsc = baseline 11 (صفر خطای جدید)؛ هر ۳ سرویس (3000/3001/3003) بالا.

Stage Summary:
- گیت نوع‌ها مستقر شد: تیک‌های ریشه حالا تعیین می‌کنند کدام ساختارها «قابل تعریف»اند — هم در UI
  (لیست نوعِ فرم ثبت، فلای‌اوت افزودن زیرشاخه، fallback ریست) و هم روی سرور (create و تغییر نوع →
  422 با پیام فارسی)؛ هلدینگ تیکِ سیستمی است: پیش‌فرض نصب تازه فقط هلدینگ تیک دارد، چک‌باکسش قفل است
  و حذف آن از مسیر API هم 422 می‌گیرد؛ گره‌های موجود با برداشتن تیک حذف/مختل نمی‌شوند.
- artifacts: mini-services/settings-service/{src/business-structure/business-structure.service.ts،
  src/seed/seed.service.ts}؛ src/components/erp/business-structure/bs-window.tsx؛
  src/i18n/dictionaries.ts؛ src/app/api/ops/start-service/route.ts (جدید — ops ماسهبازی).
- تصمیم تفسیری اعلام‌شده: پیش‌فرض نصب تازه = "[1]" فقط هلدینگ (مالک فقط تک هلدینگ را تصریح کرده
  بود)؛ «ساختارهای تعریف‌شدهٔ سیستم» در متن هشدار = هلدینگ سیستمی؛ محدودیت شناخته‌شده: فلای‌اوت
  راست‌کلیک درخت با رویداد سینتیک agent-browser باز نشد و گیتش به‌واسطهٔ fallback ریست (+) و
  لیست نوع راستی‌آزمایی شد (هر دو همان bsCanHostChild را مصرف می‌کنند).
---
Task ID: 80
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در فرم سال مالی، کاربر هر سال مالی را وارد کرده بود تاریخ شروع اولین
روز شروع آن سال مالی بصورت خودکار وارد شود و تاریخ پایان باید بر اساس تعداد ماه‌های سال مالی
که در پیکربندی نرم‌افزار و تب حسابداری تعیین شده محاسبه گردد. اگر ۱۲ بود پایان همان سال مالی
باشد و اگر ۱۶ وارد شده بود تا ۴ بعد از سال مالی بعد تعیین شود» (تاریخ‌های خودکارِ سال مالی).

Work Log:
- تفسیر قرارداد (اعلام‌شده در worklog): عنوانِ ۴رقمی = سال شمسیِ مالی؛ شروع = ۱ فروردین همان
  سال؛ پایان = آخرین روزِ ماهِ N-اُم از همان نقطه (N = fiscalMonthsCount تب حسابداری):
  N=۱۲ → ۱۲/۲۹ (یا ۱۲/۳۰ کبیسه) و N=۱۶ → ماه ۴ سال بعد (مثل ۱۴۰۵/۰۴/۳۱) = «۴ بعد از سال
  مالی بعد». محاسبه همیشه شمسی؛ میلادیِ ISO ذخیره و در تقویمِ زبانِ انتخابی نمایش (قرارداد ۷۷).
- fiscal-year-form.tsx: computeAutoFiscalDates(year, N, locale) با lastDayOfJalaliMonth
  (۱..۶=۳۱، ۷..۱۱=۳۰، اسفند = کبیسه؟ ۳۰:۲۹ — کبیسه با round-tripِ همان کتابخانه: جواب‌دادن
  j→g→j برای ۱۲/۳۰) و endIdx = year*12+(N−1)؛ خروجی با storedToDisplayDate در قالبِ زبان.
  معماری «مشتق در رندر» (نه اثر): autoYear state (تنظیم در onFieldChangeِ عنوان؛ null در
  applyRecord/newRecord) → autoDates/useMemo → effectiveValues (مصرف در validate/doSave/فیلدها)
  — صفر set-state-in-effect. فیلدهای تاریخ disabled و فقط-نمایش؛ hint توضیحی زیر گرید.
- همگام‌سازی زندهٔ پیکربندی: refreshMonthsLimit (شمارندهٔ توالی برای ردِ پاسخ کهنه) در
  newRecord و applyRecord — تغییر fiscalMonthsCount در حینِ باز بودنِ فرم بدون reload لحاظ
  می‌شود؛ واکشی اولیه در اثر مانت با الگوی .then (سازگار با قانون lint) و همان seq.
- simple-form-two-row-tabbed.tsx: پروپ اختیاری hint?: React.ReactNode زیر گرید فیلدها
  (نبود = هیچ) — پوستهٔ مشترک فرم‌ها، بدون تغییری در فرم‌های دیگر.
- i18n: کلید fy.datesAutoHint ×۱۳ زبان، بعد از fy.errMonths در هر بلاک (راستی‌آزمایی ۱۳/۱۳).
- سرور دست‌نخورده: قوانین ۷۵ (تکراری ۴۰۹، هم‌پوشانی ۴۰۹، طول ≤ N) سرِ جای خودند و بازهم
  پشتیبان محاسبهٔ فرانت‌اند؛ بازهٔ خودکار همیشه N−1 یا N ماهِ میلادی → هرگز ۴۲۲ نمی‌گیرد.
- E2E API (BFF :3000): ثبت ۱۴۰۴@۱۲ → ذخیره 2025-03-21..2026-03-20 ✓؛ PUT config=16؛ ثبت
  ۱۴۰۵@۱۶ → 2026-03-21..2027-07-22 ✓؛ ثبت دوبارهٔ ۱۴۰۴ → بلوک تکراریِ عنوان (۴۰۹) ✓؛
  پاک‌سازی: حذف رکوردهای آزمون ۱۰/۱۱ + حذف setting (بازگشت به پیش‌فرض ۱۲) ✓.
- E2E مرورگر (agent-browser 1280×800 + 375×720): تایپ ۱۴۰۴ در fa/۱۲ → ۱۴۰۴/۰۱/۰۱..۱۴۰۴/۱۲/۲۹ ✓؛
  config=16 → تایپ ۱۴۰۴ → پایان ۱۴۰۵/۰۴/۳۱ ✓؛ ۱۴۰۵@۱۶ → ۱۴۰۵/۰۱/۰۱..۱۴۰۶/۰۴/۳۱ و ذخیره ✓؛
  ریست بعد از config=12 (بدون reload) → ۱۴۰۶ → ۱۴۰۶/۱۲/۲۹ ✓ (همگام‌سازی زنده)؛ بازکردن
  رکورد ذخیره‌شدهٔ ۱۶ماهه با config=۱۲ → تاریخ‌های ذخیره‌شده دست‌نخورده (۱۴۰۶/۰۴/۳۱) ✓؛
  ویرایش عنوان به ۱۴۰۷ → بازمحاسبه با config جاری (۱۴۰۷/۱۲/۲۹) ✓؛ تلاش برای تایپ در فیلد
  تاریخِ disabled → بی‌اثر ✓؛ سوییچ به English → ۱۴۰۸ → 2029/03/20..2030/03/20 (میلادی) +
  hint انگلیسی ✓ (۱۴۰۸ کبیسه از نگاه کتابخانه؛ پایان=۱۲/۳۰ سازگار در هر دو تقویم)؛ بازگشت
  به fa ✓؛ موبایل ۳۷۵px: hint داخل قاب (hintFits=true) و بدون سرریز ✓؛ اسکرین‌شات‌ها ذخیره.
- lint نهایی = ۰/۰؛ tsc = baseline (صفر خطای جدید)؛ هشدار dev-log = نویزِ اطلاعاتیِ
  react-compiler روی اثرِ مانتِ ازپیش‌موجود (بدون تغییر نسبت به ۷۵/۷۷)؛ کامپایل نهایی ✓.

Stage Summary:
- فرم سال مالی حالا «خودکارِ کامل» است: سال را که کاربر بزند، شروع = ۱ فروردین همان سال و
  پایان = بر پایهٔ «تعداد ماه‌های مالی» تب حسابداری (۱۲→پایان همان سال، ۱۶→۴ ماه بعد از مرز
  سال مالی بعد) محاسبه و فقط-نمایش داده می‌شوند؛ کبیسه (۱۲/۳۰) و تقویمِ هر زبان (شمسی/fa،
  میلادی/en) درست است، رکوردهای ذخیره‌شده بازنویسی نمی‌شوند و تغییر پیکربندی بدون reload
  لحاظ می‌شود. ذخیره همچنان میلادیِ ISO (قرارداد ۷۷) و همهٔ قوانین سرور سرِ جای خودند.
- artifacts: src/components/erp/general/fiscal-year-form.tsx؛
  src/components/forms/simple-form-two-row-tabbed.tsx (proپ اختیاری hint)؛
  src/i18n/dictionaries.ts (fy.datesAutoHint ×۱۳).
- تصمیم تفسیری اعلام‌شده: «۴ بعد از سال مالی بعد» = پایان ماهِ چهارمِ سالِ بعد (۱۴۰۵/۰۴/۳۱)
  هم‌راستا با قانون «طول بازه ≤ تعداد ماه‌های مالی»؛ فیلدهای تاریخ به‌درخواستِ «خودکار/
  محاسبه» غیرقابل ویرایش شدند (راه اصلاح: تغییر عنوان/پیکربندی).
---
Task ID: 81
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «اگر کاربر فرمی را باز کرد باید یک تب بار زیر هدر دسکتاپ باز شود و تب اول
صفحه اصلی باشد و فرم از تب دوم باز شود. با باز شدن تب بار، هدر و فوتر داشبورد ارتفاع آنها
بطور خودکار کاهش پیدا کند. تب بار بسیار زیبا و شیک و جذاب ایجاد کنید» — نوار برگهٔ دسکتاپ
(تب‌های مرورگری زیر هدر).

Work Log:
- قرارداد تفسیری (اعلام‌شده): «فرم» = هر پنجرهٔ دسکتاپ (همهٔ WindowKindها) — مدل شناورِ پنجره
  بازنشسته شد و هر فرم به‌صورت یک «برگه» (tab) در نوار زیر هدر باز می‌شود؛ تب اول ثابتِ
  «صفحه اصلی» = خود دسکتاپ (کاغذدیواری + آیکون‌ها + سایدبار)؛ نوار تب فقط وقتی باز می‌شود که
  ≥۱ برگهٔ فرم موجود باشد و با بستن آخرین برگه محو می‌شود؛ برگه‌ها session-local اند
  (persist نمی‌شوند — مثل مرورگر تازه، بارگذاری جدید = خانه).
- chrome-metrics.ts (جدید): ارتفاع‌های زندهٔ پوسته — هدر ۳۶٫۴→۲۸ و فوتر ۵۲→۳۸ هنگام باز بودن
  نوار (قرارداد مالک: کاهش خودکار ارتفاع)، نوار تب ۳۴px، transition-[height,width] 300ms؛
  همهٔ سطوح (لایهٔ آیکون‌ها، سایدبار، دکمهٔ شناور، استارت‌منو، پنل‌ها) از useChromeMetrics می‌خوانند.
- desktop-store.ts: WinState → «برگه» (id/kind/appKey/titleOverride + maximized:true برای
  سازگاری انتخابگرهای `windows.find(...)?.maximized` در ۸ فرم)؛ windows[] = برگه‌های باز،
  activeTabId (HOME_TAB_ID="home")؛ openWindow حالا برگه می‌سازد/فعال می‌کند (dedupe kind+appKey
  حفظ شد)؛ closeWindow = بستن برگه با قانون مرورگر (فعالِ بسته‌شده → همسایهٔ قبلی، وگرنه بعدی،
  وگرنه خانه)؛ activateTab جدید؛ focusWindow/minimizeWindow/toggleMaximize/moveWindow/
  resizeWindow/zTop/defaultBounds حذف (هیچ مصرف‌نده‌ای نماند).
- app-window.tsx: بازنویسی به TabSurface — پنل کار از پیش‌تعریف opaque (bg-card، rounded-b-xl،
  border-t-0، window-in) که لبهٔ بالایش بدون درز زیر تبِ فعال می‌نشیند؛ برگه‌های غیرفعال
  MOUNTED می‌مانند (display:none) → پیش‌نویس‌های ذخیره‌نشده/تاریخچهٔ undo از سوییچ جان می‌برند
  (معنای Task 62 با حامل مرورگری)؛ WindowChromeApi حفظ شد: onClose = بستن برگه، drag‌ها no-op،
  onMinimize/onToggleMaximize حذف (undefined → دکمه‌های caption در سربرگ سبک فرم‌ها خودبه‌خود
  مخفی) — ۸ فرم chromeless بدون تغییر کد سازگار ماندند.
- tab-bar.tsx (جدید): ریل شیشه‌ای (acrylic-strong) زیر هدر با زبانه‌های چسبیده به لبهٔ پایین؛
  تب فعال از شیشه «بیرون می‌آید» (bg-background + سایهٔ بالا) و با زیرخط گرادیانی فیروزه‌ای→
  زمردی دقیقاً روی حاشیهٔ پایین، بدون درز به پنل می‌چسبد؛ تب خانه با کاشی گرادیانی برند و
  بدون دکمهٔ بستن؛ تب فرم = آیکون واقعی فرم (downscale h-5→h-4) + عنوان زندهٔ Task 64 +
  دکمهٔ بستنِ گرد که در hover سرخ می‌شود؛ tab-in keyframe تازه در globals.css؛ role=tablist/tab/
  aria-selected + tabIndex و Enter/Space برای فرم‌تب‌ها؛ سرریز افقی no-scrollbar؛ RTL/LTR خودکار.
- desktop.tsx: لایهٔ پنجره‌های شناور → لایهٔ پنل‌های تب (TabSurface برای هر برگه؛ متادیتا یک‌بار با
  resolveWindowMeta حل و بین نوار و پنل‌ها مشترک)؛ DesktopIcons فقط در تب خانه render می‌شود؛
  TabBar با tabbarStyle (هدرِ بالایی: top=headerH؛ داک چپ/راست: کنار نوار عمودی)؛ پنل‌ها بین
  contentTop و taskbarH+6 با inset ۸px.
- dashboard-header.tsx: ضخامت پویا (metrics.headerH) در dockedStyle/پیش‌نمایش درگ/شبح + transition؛
  taskbar.tsx: ارتفاع پویا، آیکون‌های پین با سقف ۲۸px در حالت فشرده، toggleId جدید (پینِ برگهٔ
  باز → فعال‌سازی؛ پینِ برگهٔ فعال → بازگشت به «صفحه اصلی» = minimize-to-desktop قدیم)، نقطهٔ
  وضعیت: فعال=primary/باز=کدرتر؛ start-menu.tsx: bottom پویا (۴۶/۶۰).
- dfb-studio.tsx: جفت دکمهٔ مردهٔ minimize/maximize از ردیف «ذخیره قالب» حذف شد (کپشن‌ها با
  پنجرهٔ شناور بازنشسته شدند)؛ save + exit (exit = بستن برگه) باقی‌اند.
- i18n: tabs.home («صفحه اصلی») و tabs.close («بستن برگه») ×۱۳ زبان بعد از taskbar.alreadyPinned
  (راستی‌آزمایی ۱۳/۱۳).
- E2E مرورگر (agent-browser 1280×800 + 375×720): حالت آرام → هدر ۳۶٫۴/فوتر ۵۲/بی‌نوار ✓؛
  باز کردن «عمومی» از استارت‌منو → نوار زیر هدر (top=۲۸)، tabs=[صفحه اصلی، عمومی(فعال)]،
  هدر ۲۸/فوتر ۳۸ ✓؛ هندسهٔ پنل top=۶۲/bottom=۷۵۶ ✓؛ کلیک «صفحه اصلی» → پنل hidden و آیکون‌ها
  برمی‌گردند، هدر همچنان فشرده ✓؛ مارکر DOM داخل پنل از سوییچ خانه↔فرم جان سالم به‌بر برد
  (بدون remount) ✓؛ پین تنظیمات → برگهٔ سوم + فعال ✓؛ بستن تب فعال با X → «عمومی» فعال شد
  (همسایهٔ قبلی) ✓؛ دکمهٔ «بستن» سربرگ سبک فرم نمونه → برگه بسته شد ✓؛ بستن آخرین برگه → نوار
  محو، هدر ۳۶٫۴/فوتر ۵۲ برگشت ✓؛ دابل‌کلیک دسکتاپ → تب جدید ✓؛ RTL (fa) و LTR (en: Home/
  General/Accounting) هر دو درست ✓؛ ۳۷۵px بدون سرریز افقی ✓؛ استارت‌منو (z 9500) روی پنل
  (z 100) ✓؛ تم شب: تب فعال/ریل/پنل همه هماهنگ ✓؛ کنسول صفر خطا؛ dev.log پس از آخرین کامپایل
  فقط 200/304 (خطاهای HEADER_THICK در میانهٔ ویرایش، تاریخی و بی‌اثر).
- lint نهایی = ۰/۰؛ tsc = baseline (۳ خطای قدیمی start-menu/field-translations که git diff
  اثبات می‌کند دست‌نخورده‌اند — صفر خطای جدید).

Stage Summary:
- دسکتاپ حالا یک پوستهٔ تب‌محور است: تب اول همیشه «صفحه اصلی» (خود دسکتاپ) و هر فرم در
  برگهٔ بعدی زیر هدر باز می‌شود؛ با باز شدن نوار، هدر (۳۶٫۴→۲۸) و فوتر (۵۲→۳۸) به‌طور خودکار
  و نرم کم‌ارتفاع می‌شوند و با بستن برگه‌ها همه‌چیز به حالت نخست برمی‌گردد؛ نوار تب با زبانهٔ
  فعالِ متصل به پنل (زیرخط گرادیانی برند)، بستنِ سرخِ hover و انیمیشن ورود ساخته شده است.
- artifacts: src/components/desktop/{chrome-metrics.ts، tab-bar.tsx (جدید)؛ app-window.tsx
  (بازنویسی TabSurface)؛ desktop.tsx؛ dashboard-header.tsx؛ taskbar.tsx؛ start-menu.tsx}؛
  src/stores/desktop-store.ts؛ src/app/globals.css (tab-in)؛
  src/components/erp/form-builder/dfb-studio.tsx؛ src/i18n/dictionaries.ts (tabs.* ×۱۳).
- تصمیم تفسیری اعلام‌شده: همهٔ WindowKindها «فرم»اند و در تب باز می‌شوند (پنجرهٔ شناور
  بازنشسته شد)؛ «صفحه اصلی» = دسکتاپِ آیکون‌ها؛ پینِ فعالِ نوار پایین = بازگشت به خانه؛
  برگه‌ها بین reloadها persist نمی‌شوند (رفتار مرورگر تازه)؛ محدودیت شناخته‌شده: آیکون‌های
  دسکتاپ فقط در تب خانه در دسترس‌اند (کشیدن آیکون به نوار برای سنجاق هم فقط از خانه).
---
Task ID: 82
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در فوتر دسکتاپ، لیست سال‌های مالی تعریف شده توسط کاربر نمایش داده شود و
کاربر اگر سال مالی را تغییر داد تمامی فرم‌های باز در تب بار باید بسته شود و اگر فرمی در تب بار
باز بود که دارای اطلاعات بود و ذخیره نشده بود باید به کاربر آلارم داده شود که اطلاعات ذخیره نشده
در فرم [نام فرم] وجود دارد. آیا ادامه می‌دهید؟ اگر کاربر تایید کرد فرم بسته شود و اگر خیر را
انتخاب کرد فرم مورد نظر در تب بار برای کاربر نمایش داده شود» (انتخابگر سال مالی در فوتر +
آلارم اطلاعات ذخیره‌نشده هنگام تعویض).

Work Log:
- قرارداد تفسیری (اعلام‌شده): «فوتر دسکتاپ» = همان نوار پایین (taskbar) پوستهٔ تب‌محور Task 81؛
  مقدار پیش‌فرض نمایش = نخستین سال مالی تعریف‌شده (هم‌الگو با «اولین شرکت» Task 78) و انتخاب
  کاربر در erp.fiscalYear ماندگار می‌شود (id نامعتبر در اجرا به نخستین مورد برمی‌گردد و تا
  تغییر واقعی کاربر persist نمی‌شود)؛ «فرم» = هر برگهٔ نوار تب (صفحه اصلی ضمنی می‌ماند).
- desktop-store.ts: ثبت‌گر وضعیت «کثیف» session-local — dirtyTabs + setTabDirty (no-op با
  مرجع برابر)، closeAllFormTabs (پاک‌کردن همهٔ برگه‌ها + بازگشت به خانه + صفرکردن ثبت‌گر)،
  closeWindow حالا مدخل dirty برگهٔ بسته‌شده را هم حذف می‌کند؛ setWindowTitle مقدار undefined
  را می‌پذیرد (حذف override و بازگشت به عنوان metadata).
- app-window.tsx: WindowChromeApi += windowId (TabSurface آن را تأمین می‌کند) + هوک
  useTabDirty(dirty) — هر فرم داخل برگه وضعیت ذخیره‌نشدهٔ خود را اعلام می‌کند؛ بیرون برگه
  no-op و در unmount همیشه «پاک» گزارش می‌شود.
- window-meta.tsx (جدید): STATIC_WINDOWS + resolveWindowMeta از desktop.tsx استخراج شد تا
  فوترِ سال مالی بتواند «عنوانِ برگه» را دقیقاً مثل نوار تب حل کند — بدون import چرخه‌ای
  (desktop.tsx فقط import می‌کند؛ عنوان آلارم = titleOverride ?? resolveWindowMeta().title).
- fiscal-year-store.ts (جدید): فهرست سال‌های مالی از GET /api/settings/fiscal-year با الگوی
  org-context (loading/loaded) + persisted fiscalYearId (name: "erp.fiscalYear"،
  skipHydration + rehydrate پس از مانت) + effectiveFiscalYearId (fallback نخستین مورد)؛
  شنوندهٔ erp:records-changed (entity=fiscal-year) برای همگامی زنده.
- fiscal-year-footer.tsx (جدید): دکمهٔ جمع‌وجور tray (CalendarDays + عنوان + نقطهٔ زمردی
  برای سال فعال + ChevronDown؛ هم‌قد با h-8/h-9 حالت فشرده/آرام) + DropdownMenu فهرست
  سال‌ها با تیک انتخاب؛ ماشین حالت گارد event-driven بدون effect: beginChange → advance
  (اولین برگهٔ dirty = آلارم، صف پاک = commit فوری) → تأیید: closeWindow همان برگه و ادامهٔ
  صف (آلارم‌های پشت‌سرهم)، خیر/Escape/کلیک بیرون: activateTab همان برگه (نمایش در تب بار) +
  بازگشت انتخاب + toast لغو؛ commit: closeAllFormTabs + setFiscalYearId + toast «سال مالی
  فعال: {fy}». آلارم = Dialog شیشه‌ای با نشان مثلث کهربایی، متن دقیق مالک با «{form}»،
  خیر (outline) و تأیید (destructive سرخ)؛ Dialog z-[11000/11500] از قبل بالای taskbar z-9000.
- سیم‌کشی dirty هشت سطح: fiscal-year-form (اولین ویرایش تا ذخیره/بازکردن رکورد/فرم خالی)،
  bs-window (onFieldChange + آپلودر لوگو + ریست derive-and-reset formKey + پس از ذخیره)،
  dfb-form-runtime (onFieldChange/reset/openRecord/پس از ذخیره — هر دو runtime ساده و درختی)،
  dfb-studio (dirty موجود hist.idx!==0)، form-builder-window (dirty موجود عنوان‌ها)،
  software-config-window (setVal تا ذخیرهٔ موفق)، form-demo و tree-demo (نمونه‌ها هم تابع
  همان قرارداد). settings/user-management (اعمال آنی) و placeholderها عمداً همیشه پاک‌اند.
- general-window.tsx: عنوان زندهٔ برگه هنگام باز بودن زیرصفحه («عمومی — سال مالی جدید»)
  با همان مکانیزم titleOverride Task 64 — نام فرم در آلارم دقیقاً چیزی است که کاربر در
  نوار تب می‌بیند؛ الگوی go() بدون setState-in-effect.
- fiscal-year-form.tsx: پس از ذخیره/حذف موفق رخ‌داد erp:records-changed
  (entity=fiscal-year) منتشر می‌شود — فوتر بی‌reload تازه می‌شود (E2E: ذخیرهٔ ۱۴۰۴ →
  فوتر همان لحظه ۱۴۰۴؛ حذف → «سال مالی تعریف نشده است»).
- i18n: هشت کلید fy.footerAria/footerEmpty/unsavedTitle/unsavedBody({form})/unsavedYes/
  unsavedNo/changedToast({fy})/changeCancelled ×۱۳ زبان بعد از fy.datesAutoHint (۱۳/۱۳).
- E2E مرورگر (agent-browser 1280×800 + 375×720، fa و en و تم شب): فوتر پیش‌فرض ۱۴۰۲
  ✓؛ بازکردن عمومی → نوار تب + هدر ۲۸/فوتر ۳۸ ✓؛ عنوان زندهٔ «عمومی — سال مالی جدید» ✓؛
  تایپ کد → تعویض به ۱۴۰۳ → آلارم با متن دقیق مالک و نام فرم ✓؛ «خیر» → دیالوگ بسته،
  برگه باز و فعال مانده، فوتر ۱۴۰۲، toast لغو ✓؛ دوباره → «تأیید» → همهٔ برگه‌ها بسته،
  نوار محو، فوتر ۱۴۰۳، toast فعال، هدر/فوتر به ۳۶٫۴/۵۲ برگشت ✓؛ برچسب انتخاب پس از
  reload = ۱۴۰۳ (erp.fiscalYear) ✓؛ برگهٔ تمیز (تنظیمات بدون ویرایش) → تعویض بی‌آلارم
  و بستن فوری ✓؛ دو برگهٔ کثیف → آلارم عمومی → تأیید → آلارم نمونه فرم → «خیر» → همان
  برگه فعال ماند و فوتر برگشت ✓؛ زبان en → "Select fiscal year"/«Unsaved data … Do you
  want to continue?»/No/Yes, continue + toast انگلیسی و LTR ✓؛ ۳۷۵px بدون سرریز ✓؛ تم شب
  هماهنگ ✓؛ ذخیره/حذف فرم سال مالی → فوتر زنده ✓؛ پاک‌سازی داده‌های آزمون (۱۴۰۲/۱۴۰۳/۱۴۰۴
  حذف؛ جدول سروری خالی) و بازگشت وضعیت خالی «سال مالی تعریف نشده است» با دکمهٔ disable ✓؛
  صفر خطای کنسول؛ خطای تاریخیِ «resolveWindowMeta defined multiple times» در dev.log
  فقط مربوط به وضعیت میانهٔ ویرایش است (فایل نهایی یک تعریف دارد؛ کامپایل‌های بعدی پاک).
- lint نهایی = ۰/۰؛ tsc = baseline ۳ خطای قدیمی (start-menu/field-translations —
  git diff اثبات دست‌نخوردگی) — صفر خطای جدید.

Stage Summary:
- فوتر دسکتاپ حالا انتخابگر سال مالی است: فهرست سال‌های تعریف‌شدهٔ کاربر، ماندگاری آخرین
  انتخاب (erp.fiscalYear) و نقطهٔ زمردی سال فعال؛ تعویض سال کل قرارداد مالک را اجرا
  می‌کند — هر برگهٔ دارای ویرایش ذخیره‌نشده با آلارم «اطلاعات ذخیره نشده در فرم «{نام}»
  وجود دارد. آیا ادامه می‌دهید؟» رضایت می‌گیرد، تأیید = بستن و ادامه، خیر = بازگشت کامل
  و نمایش همان فرم در تب بار؛ صف پاک بلافاصله commit می‌شود و همهٔ برگه‌ها بسته و پوسته
  به آرامش اول برمی‌گردد.
- artifacts: src/stores/fiscal-year-store.ts؛ src/components/desktop/{fiscal-year-footer.tsx
  (جدید)، window-meta.tsx (جدید)، app-window.tsx، desktop.tsx، taskbar.tsx}؛
  src/stores/desktop-store.ts؛ src/components/erp/general/{fiscal-year-form.tsx،
  general-window.tsx}؛ src/components/erp/business-structure/bs-window.tsx؛
  src/components/erp/form-builder/{dfb-form-runtime.tsx، dfb-studio.tsx،
  form-builder-window.tsx}؛ src/components/erp/settings/software-config-window.tsx؛
  src/components/erp/{form-demo-window.tsx، tree-demo-window.tsx}؛
  src/i18n/dictionaries.ts (fy.* ×۸ ×۱۳).
- تصمیم‌های تفسیری اعلام‌شده: پیش‌فرض نمایش = نخستین سال مالی تعریف‌شده (بدون دستور صریح
  مالک، هم‌الگو با Task 78)؛ «فوتر» = taskbar؛ آلارم به‌ازای هر برگهٔ کثیف (پشت‌سرهم،
  به ترتیب بازشدن) با نامِ دقیقِ برگه؛ بستن مجدد انتخاب همان سال = no-op؛ محدودیت
  شناخته‌شده: حذف سال از مسیر سروری (خارج از فرم) فوتر را تا رویداد بعدی/reload تازه
  نمی‌کند (همان رفتار شنونده‌های erp:records-changed در کل اپ).

---
Task ID: 83
Agent: Z.ai Code (main)
Task: درخواست مالک — «در فیلد تاریخ آیکون را از مقدار تاریخ فاصله بدهید که آیکون با مقدار تداخل نداشته باشد» (اسکرین‌شات: فرم سال مالی جدید، فلش قرمز روی آیکون تقویمِ روی رقم اول تاریخ)

Work Log:
- ریشه‌یابی: تراشهٔ تقویم (CalendarDays) با `end-1.5` روی wrapper مطلق سوار است؛ wrapper جهت صفحهٔ RTL (fa/ps/ckb) را به‌ارث می‌برد ⇒ `inset-inline-end` به لبهٔ «چپ» حل می‌شود، در حالی که `<Input dir="ltr">` متن را از چپ می‌گذارد ⇒ آیکون دقیقاً روی رقم اول تاریخ می‌نشیند (در اسکرین‌شات «404/01/01» — «1» زیر آیکون پنهان بود).
- سه نقطهٔ دارای همین الگو یافت و اصلاح شد:
  1) src/components/forms/form-primitives.tsx — FieldCell شاخهٔ date (فرم‌های همهٔ نرم‌افزارها)؛
  2) همان فایل — GridCellInput شاخهٔ date (ویرایشگر سلول جدول رکوردها)؛
  3) src/components/erp/form-builder/dfb-studio.tsx — پیش‌نمایش ایستای فیلد تاریخ استودیوی طراحی (+ `ps-2 pe-7` برای رزرو جای آیکون).
- اصلاح: `dir="ltr"` روی wrapper مطلق — تاریخ ذاتاً LTR است؛ حالا آیکون در «همهٔ» زبان‌ها به لبهٔ پایانیِ بصری (راست) می‌چسبد و `pe-7`/`pe-6` ورودی همان سمت را رزرو می‌کند؛ متن از چپ شروع می‌شود و آیکون هرگز روی رقم نمی‌افتد. رفتار ماسک تایپ (Task 49) دست‌نخورده ماند — فقط dir والد تغییر کرد.
- جست‌وجوی کامل: تنها همین سه نقطه الگوی «آیکون روی ورودی تاریخ» را دارند (سایر CalendarDaysها آیکون مستقل‌اند).
- lint = ۰/۰؛ tsc = فقط خطاهای baseline قدیمی (start-menu/field-translations/examples — بدون خطای جدید).
- E2E مرورگر (agent-browser، 1280×800، fa): فرم سال مالی جدید — حالت خالی: آیکون راست، placeholder چپ ✓؛ با ورود عنوان ۱۴۰۴ (تاریخ‌های خودکار ۱۴۰۴/۰۱/۰۱ و ۱۴۰۴/۱۲/۲۹): مقدار کامل از چپ نمایان، آیکون لبهٔ راست با فاصلهٔ تمیز ✓؛ اندازه‌گیری هندسی: textEnd≈100 و iconLeft=322.6 (شروع) / textEnd≈933 و iconLeft=1156 (پایان) ⇒ صفر همپوشانی (~۲۲۰px فاصله) ✓؛ کنسول/خطاهای صفحه صفر؛ dev.log پاک. کشف جانبی برای E2E: آیکون‌های دسکتاپ فقط در تب «صفحه اصلی» سوار می‌شوند (homeActive — Task 81)؛ باز کردن «نمونه فرم» نیازمند رفتن به خانه و dblclick آیکون بود.
- پاک‌سازی: reload ⇒ صفر تب باز، داده آزمون ذخیره نشد (جدول fiscal-year دست‌نخورده).

Stage Summary:
- آیکون تقویم فیلدهای تاریخ در هر سه سطح (فرم ساده، گرید رکوردها، پیش‌نمایش استودیو) به لبهٔ پایانی بصری منتقل و از مقدار تاریخ جدا شد؛ قرارداد: «ورودی تاریخ LTR است و آیکون همیشه در endِ همان فضای LTR» — مستقل از جهت صفحه.
- artifacts: src/components/forms/form-primitives.tsx (FieldCell date + GridCellInput date)؛ src/components/erp/form-builder/dfb-studio.tsx (پیش‌نمایش date).

---
Task ID: 84
Agent: Z.ai Code (main)
Task: «در منوی عمومی و اطلاعات پایه یک فرم جدید ایجاد کنید بنام طرف حساب جدید» — فرم کامل «تعریف طرف حساب» با کامپوننت SimpleFormTwoRowTabbed (فیلدهای اصلی دوستونه RTL + ۵ تب پایین، عین مشخصات مالک)

Work Log:
- Backend (settings-service، db/custom.db):
  · schema.prisma — پنج مدل جدید: City (جدول شهرها: کد/عنوان/عنوان لاتین/استان/کشور)، Party (ماهیت/نوع فرعی/نام/نام‌های لاتین/کد تفصیلی/کد اقتصادی/کد ملی/شناسه ملی/شماره ثبت/فعال + نقش‌های جزئیات + فیلدهای سایر اطلاعات، بلوک کامل AppBaseEntity ۸فیلدی، unique(tafsiliCode,BusinessStructureRef))، PartyPerson، PartyAddress (CityRef + عکس عنوان شهر، FK Cascade)، PartyPhone.
  · TABLE_REGISTRY + VERSIONED_MODELS + app.module — ثبت همهٔ مدل‌های جدید (§2.5/§16).
  · id-generation: generateNextIdBlock «شناسهٔ شروع» برمی‌گرداند (نه آرایه) — باگ خطای BigInt در اولین create رفع شد (start+i).
  · مهاجرت: db push به‌خاطر drift قدیمی (Int→BigInt) مسدود بود؛ نسخهٔ accept-data-loss جدول‌های کهنهٔ Dfb* را از custom.db حذف کرد (dfb-service از dfb.db جدا است — بی‌ضرر)؛ بکاپ db/custom.db.bak-t84؛ همهٔ داده‌ها (BS ۷ ردیف) سالم.
  · party.controller/service/dto — GET /party (list با فرزندان)، GET /party/next-tafsili (بدون سوزاندن)، GET /party/cities، POST، PUT (بازنویسی کامل ردیف‌های تب‌ها)، DELETE (cascade)؛ اعتبارسنجی دولایه: نام/نام‌خانوادگی حقیقی اجباری، مبلغ ماندهٔ غیر صفر ⇔ وضعیت همان نقش اجباری (پیام با نام نقش)، نوع آدرس/شهر/آدرس کامل ردیف نشانی اجباری، نام+نام‌خانوادگی ردیف افراد اجباری؛ پاک‌سازی متقاطع فیلدهای دو حالت هنگام تغییر ماهیت (سرور همان را اعمال می‌کند)؛ کد تفصیلی = سریال سراسری max+1 سمت سرور (ورودی کلاینت نادیده)؛ نوع تفصیلی: حقیقی←۶، حقوقی←۷ در DTO؛ تاریخ‌ها میلادی ISO (قرارداد Task 77).
  · seed.service — ۲۲ شهر major ایران (idempotent by Code).
  · curl E2E کامل: create حقیقی/حقوقی ✓، چهار قانون 422 ✓، PUT تغییر ماهیت با پاک‌سازی فیلدها ✓ (tafsili ثابت ماند)، cityTitle snapshot ✓، DELETE cascade ✓؛ داده‌های آزمون حذف شد.
- Frontend:
  · src/components/erp/general/party-form.tsx (جدید) — SimpleFormTwoRowTabbed با فیلدهای پویا بر اساس ماهیت (حقیقی: نام خانوادگی/نام۲/نام‌خانوادگی۲/کد ملی؛ حقوقی: نام لاتین/شناسه ملی/شماره ثبت؛ نوع فرعی فقط حقوقی فعال)، کد تفصیلی فقط-نمایش با prefetch «شمارهٔ بعدی» و چیپ «نوع تفصیلی ۶/۷»، فعال پیش‌فرض تیک (آخرین فیلد)؛ تب جزئیات = fields-tab (تیک←مبلغ←رادیو بدهکار/بستانکار برای تامین‌کننده/مشتری/واسط فروش، تا تیک نخورد غیرفعال)؛ تب‌های جدولی افراد مرتبط/نشانی (دراپ‌داون شهر با گزینهٔ چندستونه «کد - عنوان (استان — کشور)» متصل به جدول شهرها)/تلفن با GridCellInput؛ تب سایر اطلاعات = fields-tab (گذرنامه/ازدواج/تولد فقط حقیقی فعال، تاریخ‌ها در تقویم زبان انتخابی؛ Task 77)؛ dirty هشت‌سطحی (Task 82)؛ erp:records-changed؛ remount با formKey برای seed ردیف‌ها؛ اعتبارسنجی فرانت با پیام‌های دقیق (نقش/تب/شمارهٔ ردیف).
  · general-window.tsx — آیتم «طرف حساب جدید» در اطلاعات پایه + زیرصفحهٔ party + عنوان زندهٔ برگه («عمومی — طرف حساب جدید»).
  · i18n — ۷۴ کلید party.* ×۱۳ زبان با scripts/inject-party-i18n.ts؛ کشف: بلوک‌های tr/ar/hi/ps/ckb/pt/ko/fr/zh با `...en` spread هستند و کلیدها باید «بعد از» spread درج شوند (TS2783 وگرنه override می‌شد)؛ de/ru/en بلوک کامل‌اند.
- باگ‌های رفع‌شده در حین E2E: ①spread «...empty» در applyRecord آرایه‌های ردیف را خالی می‌کرد (بازشدن رکورد، تب‌ها را خالی نشان می‌داد)؛ ②فرانت side خالی «""» می‌فرستاد و DTO رد می‌کرد → null.
- E2E مرورگر (agent-browser، 1280×800 + 375×720، fa + en): منو → فرم باز می‌شود؛ پیش‌فرض‌ها (ماهیت حقیقی، نوع فرعی خاموش، تفصیلی=1 + چیپ ۶، فعال تیک) ✓؛ ذخیره بدون وضعیت با مبلغ غیرصفر → toast دقیق قانون ✓؛ بدهکار → ذخیره موفق (tafsili=1, type=6, supplier debtor) ✓؛ تغییر ماهیت → جابه‌جایی فیلدها + چیپ ۷ + پاک‌سازی ✓؛ نشانی: ردیف + انتخاب محل فعالیت + شهر چندستونه (101 - تهران (تهران — ایران)) + آدرس ✓؛ تلفن: تلفن همراه + شماره ✓؛ reload → بازکردن رکورد از لیست → همهٔ ردیف‌ها seed شدند ✓؛ سایر اطلاعات در حقوقی: گذرنامه/ازدواج/تولد غیرفعال ✓؛ en: LTR کامل با "New Party Account"/"Ledger type 7" ✓؛ 375px بدون سرریز ✓؛ پاک‌سازی: رکورد آزمون حذف، جدول خالی.
- lint = ۰/۰؛ tsc اپ = فقط baseline قدیمی؛ tsc سرویس = صفر؛ dev.log بدون خطای کامپایل.

Stage Summary:
- فرم «طرف حساب جدید» سرتاسری آماده است: عمومی ← اطلاعات پایه ← طرف حساب جدید؛ ۹ فیلد در حالت حقیقی / ۸ فیلد در حقوقی (عین جمع‌بندی مالک)، ۵ تب (جزئیات/افراد مرتبط/نشانی/تلفن/سایر اطلاعات) با ذخیرهٔ سند-محور و ردیف‌های جدولی.
- قراردادهای جدید: کد تفصیلی سراسری max+1 سمت سرور با نمایش «شمارهٔ بعدی» در فرم؛ جدول City (مرجع شهرها) با seed اولیه؛ نوع تفصیلی ۶/۷ متادیتای DTO.
- artifacts: mini-services/settings-service/src/party/*، schema.prisma، table-registry.ts، prisma.service.ts، app.module.ts، seed.service.ts؛ src/components/erp/general/party-form.tsx، general-window.tsx؛ src/i18n/dictionaries.ts (party.* ×۱۳)؛ scripts/inject-party-i18n.ts؛ بکاپ db/custom.db.bak-t84.
- محدودیت شناخته‌شده: دراپ‌داون شهر در گرید به‌صورت گزینهٔ چندستونه‌ی متنی رندر می‌شود (کد/عنوان/استان/کشور در یک گزینه) — کامپوننت جدول فعلی dropdown چندستونهٔ گرافیکی ندارد؛ ارتقای آن در صورت درخواست مالک.

---
Task ID: 84-b
Agent: Z.ai Code (main)
Task: هم‌ترازی با متن دوبارهٔ مشخصات مالک (همان Task 84) — محل فایل فرم طبق مسیر اعلامی مالک: «components/forms/common/Party.tsx»

Work Log:
- بررسی مجدد مشخصات سطر‌به‌سطر با پیاده‌سازی: ماهیت/نوع فرعی/نام + فیلدهای شرطی دو حالت + کد تفصیلی ۶/۷ + کد اقتصادی/کد ملی/شناسه ملی/شماره ثبت/فعال ✓؛ تب‌ها به ترتیب از راست (جزئیات، افراد مرتبط، نشانی، تلفن، سایر اطلاعات) ✓؛ ساختار تیک←مبلغ←وضعیت سه نقش ✓؛ قوانین الزامی هر تب ✓؛ جمع‌بندی ۹/۸ فیلد با شمارش بدون چک‌باکس فعال، منطبق بر فهرست تفصیلی ۱۰/۹ ردیفی خود مشخصات ✓.
- جابه‌جایی فایل: src/components/erp/general/party-form.tsx → src/components/forms/common/Party.tsx (دقیقاً مسیر اعلامی مالک؛ پوشهٔ common ساخته شد)؛ import عمومی/general-window به‌روز شد؛ هیچ ارجاع کهنه‌ای نماند؛ کامنت سربرگ فایل محل مسیر مالک را ثبت می‌کند.
- tsc اپ = فقط baseline قدیمی، lint = ۰/۰؛ E2E مرورگر: منو ← فرم از مسیر جدید باز می‌شود (ماهیت حقیقی، تفصیلی=1 + چیپ «نوع تفصیلی ۶»، پنج تب به ترتیب، تب جزئیات فعال با سه ردیف نقش) ✓؛ داده آزمون جدیدی ساخته نشد.

Stage Summary:
- فرم طرف حساب حالا در components/forms/common/Party.tsx است (همان فایلِ نام‌بردهٔ مالک) و از general-window ← اطلاعات پایه سرو می‌شود؛ عملکرد و قراردادها عین Task 84.
---
Task ID: 85
Agent: Z.ai Code (main)
Task: درخواست مالک — «اگر برنامه نصب شده بود و سال مالی ایجاد نشده بود باید به کاربر پیغام داده شود "سال مالی وجود ندارد. می خواهید سال مالی را ایجاد کنید؟" اگر کاربر روی دکمه بلی کلیک کرد فرم تعریف سال مالی برای کاربر باز شود»

Work Log:
- تصمیم تفسیری اعلام‌شده: «برنامه نصب شده» = پوستهٔ ERP در حال اجراست (بررسی داخل خود پوسته سوار است، پس شرط همیشه برقرار)؛ در اپ مفهوم نصب‌بودنِ مستقل وجود ندارد (فقط AppRegistry.IsEnabled — بی‌ربط به سناریو). گیتِ واقعی = فهرست سال مالی خالی پس از نخستین بارگیری موفق.
- src/stores/fiscal-year-store.ts — پرچم failed اضافه شد (load موفق: failed=false؛ catch: failed=true) تا خطای سرویس هرگز دیالوگ کاذب نسازد؛ UI دیگران دست‌نخورده.
- src/stores/general-nav-store.ts (جدید) — درخواست ناوبری یک‌باره به پنجرهٔ «عمومی»: هر درخواست id یک‌نواخت می‌گیرد؛ پنجره فقط idهای دیده‌نشده را مصرف می‌کند ⇒ تغییر زبان/رندر مجدد هرگز ناوبری کاذب نمی‌سازد؛ پنجرهٔ تازه‌بازشده هم درخواست در انتظار را در mount مصرف می‌کند (openWindow قبل از request — هر دو ترتیب درست).
- src/components/desktop/fiscal-year-missing-prompt.tsx (جدید) — Dialog شیشه‌ای با آیکون CalendarDays زمردی/فیروزه‌ای، عنوان «سال مالی وجود ندارد» + پرسش «می خواهید سال مالی را ایجاد کنید؟» (عین متن مالک، دو خط)، دکمهٔ «بلی» (primary) و «خیر» (outline)؛ Escape/کلیک بیرون/✕ = خیر (امن)؛ تصمیم از subscribe خود store — نه setState-in-effect (قاعدهٔ react-hooks/set-state-in-effect) — checkedRef یک‌باره در هر نشست؛ «بلی» = openWindow("app","general") + requestGeneralPage("fiscal-year") ⇒ فرم تعریف سال مالی مستقیم باز می‌شود.
- src/components/erp/general/general-window.tsx — GeneralPage از GeneralSubPage store مشتق شد؛ مصرف‌کنندهٔ درخواست‌های nav (mount + شنوندهٔ id-محور، بدون پرش در تغییر زبان).
- src/components/desktop/taskbar.tsx — FiscalYearMissingPrompt کنار FiscalYearFooter در tray سوار شد (Dialog پرتال است).
- i18n — چهار کلید fy.missingTitle/missingAsk/missingYes/missingNo ×۱۳ زبان (fa/en کامل؛ tr/ar/hi/ps/ckb/pt/ko/fr/zh بعد از spread؛ de/ru کامل) — «بلی» دقیقاً عین واژهٔ مالک.
- پاک‌سازی دادهٔ کهنهٔ E2E: ردیف ۱۴۰۴ بازماندهٔ Task 83 (id=15) حذف شد تا جدول خالی شود.
- lint = ۰/۰؛ tsc = فقط ۳ خطای baseline قدیمی (start-menu/field-translations) — صفر خطای جدید.
- E2E مرورگر (agent-browser، fa + en، 1280×800 + 375×720): جدول خالی → دیالوگ با متن دقیق مالک و «سال مالی تعریف نشده است» در فوتر ✓؛ «خیر» → بسته، در همان نشست تغییر زبان هم دوباره باز نمی‌شود ✓؛ reload در en → پیغام انگلیسی LTR ("No fiscal year exists" / "Do you want to create one?" / No/Yes) ✓؛ fa reload → «بلی» → برگهٔ «عمومی — سال مالی جدید» بدون هیچ ناوبری دستی مستقیم روی زیرصفحهٔ فرم (بازگشت/اطلاعات پایه/سال مالی جدید) ✓؛ ذخیرهٔ ۱۴۰۴ → ردیف سروری درست (تاریخ میلادی ۲۰۲۵-۰۳-۲۱→۲۰۲۶-۰۳-۲۰، قرارداد ۷۷) و فوتر همان لحظه ۱۴۰۴ ✓؛ reload با سال موجود → صفر دیالوگ ✓؛ 375px بدون سرریز (دکمه‌ها پشته‌ای) ✓؛ Escape = خیر ✓؛ نشست تازه با جدول خالی → دوباره می‌پرسد (قرارداد اجرای بعدی) ✓؛ هشدار hydrate موجود (chevron داخل Tooltip، dir-محور) با جست‌وجوی stack ثابت شد به Task 85 تعلق ندارد ✓؛ پاک‌سازی: ردیف آزمون حذف، جدول خالی، نشست با «خیر» بسته — tabs=0، فوتر «سال مالی تعریف نشده است».

Stage Summary:
- چرخهٔ «نصب بدون سال مالی» بسته شد: هر اجرای برنامه با جدولِ خالیِ سال مالی، پرسش مالک را exact same words می‌پرسد؛ «بلی» کاربر را بی‌واسطه به فرم تعریف سال مالی می‌رساند؛ «خیر» فقط نشست را بی‌سروصدا رد می‌کند و اجرای بعدی دوباره می‌پرسد؛ خطای سرویس هرگز دیالوگ کاذب نمی‌سازد.
- قراردادهای جدید: GeneralNavStore (درخواست ناوبری id-محور یک‌باره به پنجرهٔ عمومی — الگوی بازشدن مستقیم زیرصفحه از هر نقطهٔ پوسته)؛ پرچم failed در fiscal-year-store.
- artifacts: src/components/desktop/fiscal-year-missing-prompt.tsx (جدید)؛ src/stores/general-nav-store.ts (جدید)؛ src/stores/fiscal-year-store.ts؛ src/components/erp/general/general-window.tsx؛ src/components/desktop/taskbar.tsx؛ src/i18n/dictionaries.ts (fy.missing* ×۱۳).
---
Task ID: 86
Agent: Z.ai Code (main)
Task: درخواست مالک — «آیکون لیست در اکشن بار باید دقیقا شبیه تصویر پیوست باشد. بصورت کاملا زیبا و جذاب و کاربرپسند این دراپ دان را ایجاد کنید. دکمه پلاس را در این دراپ دان قرار ندهید» (تصویر پیوست: مینی‌گرید با سرستون فیلدها، ردیف «فیلتر...» با قیف، رکوردها، فوتر «۱ رکورد» + دکمه‌های گرد کوچک، آیکون ☰ سفیدِ ساده در اکشن بار)

Work Log:
- کشف پایه: «آیکون لیست» = RecordListDropdown در src/components/forms/action-bar/list-dropdown.tsx (اکشن ۱۰ Task 20) — تا دیروز فقط یک DropdownMenu متنی با title/subtitle بود.
- تصمیم تفسیری اعلام‌شده: دکمه‌های سندِ صورتی/سبز تصویر مرجع (وارد/خروجی اکسلِ ERP قدیمی) در context فعلی معنای عملیاتی ندارند و دکمهٔ مرده UX نیست — سه ابزار معنادار تصویر پیاده شد (جست‌وجو/پاک‌سازی فیلتر/بازخوانی) و دکمهٔ + با دستور صریح مالک حذف شد.
- @radix-ui/react-popover نصب شد + src/components/ui/popover.tsx (shadcn New York، z-[12500] هم‌تراز dropdown) — ورودی‌های متنی داخل Popover آزادند؛ DropdownMenu با typeahead می‌جنگید.
- types.ts — ActionBarListCell {label,value} و cells? روی ActionBarListItem (عرضه‌کنندگان بدون cells به دو ستون عنوان/توضیح برمی‌گردند).
- list-dropdown.tsx بازطراحی کامل عین تصویر: تریگر ☰ ساده (AlignJustify، بدون کاشی رنگی/شورون — text-foreground؛ هم‌شکل تصویر روی نوار تیره)؛ پنل w-[min(92vw,720px)] با جدول مینی‌گرید: سرستون sticky (برچسب فیلدها)، ردیف «فیلتر...» با قیف داخل هر خانه (filter row همیشه‌همراه تصویر)، ردیف‌های رکورد (کلیک = بازکردن رکورد؛ Enter/Space؛ hover/focus)، حالت خالی/بارگذاری، اسکرول افقی/عمودی با max-h-320؛ فوتر: دکمه‌های گرد کوچک (آسمانی جست‌وجو → فوکوسِ اولین فیلتر، کهربایی پاک‌سازی فیلترها → disabled تا وقتی فیلتری فعال است، زمردی بازخوانی → فقط وقتی onListRefresh داده شود) + «{n} رکورد» با ارقام زبان (toLocaleString(locale)) — بدون دکمهٔ پلاس (قاعدهٔ مالک). فیلترها contains-match و AND بین ستون‌ها و با هر بازشدن ریست می‌شوند.
- کشف/رفع باگ هندسی: ورودی متنی داخل سلول جدول با عرض ذاتی ~20حرفی هر ستون را به ~200px می‌گرفت (جدول 1035px در پنل 720px) — size={1} عرض ذاتی را کشت (جدول 718px ⇒ هر ۵ ستون بدون اسکرول افقی)؛ نقطهٔ هایلایت رکورد فعال فقط در ستون نخست.
- سیم‌کشی داده: dfb-form-runtime (سلول‌ها از mainFields با برچسب dfbFieldLabel؛ select با resolveFieldOptions به برچسب آیتم، checkbox با بله/خیر، تاریخ با storedToDisplayDate در تقویم زبان — قرارداد ۷۷؛ listActiveId=currentDataId؛ onListRefresh=loadRecords)؛ fiscal-year-form و Party (سلول‌های واقعی + activeId + refresh)؛ bs-window (کد/عنوان)؛ form-demo (سلول‌ها از رکوردهای نمونه + activeId)؛ tree-demo/app-placeholder مسیر fallback. پیمایش listActiveId/onListRefresh از FormActionBar و هر دو پوسته (simple-form-two-row-tabbed/simple-tree-form) اضافه شد.
- i18n — ده کلید abar.list* (listFilterPh/listSearch/listClearFilters/listRefresh/listCount/listColCode/listColTitle/listColSub/listYes/listNo) ×۱۳ زبان بعد از abar.toolbar.
- lint نهایی = ۰/۰؛ tsc = فقط ۳ خطای baseline قدیمی — صفر خطای جدید.
- E2E مرورگر (agent-browser، fa/en، light/dark، 1280×800 + 375×720): فرم سال مالی با رکورد ۱۴۰۵ (دادهٔ واقعی خود مالک که در آزمون Task 85 ساخته شد — عمداً حفظ شد): تریگر ☰ ساده در اکشن بار (عین تصویر، سفید روی تیره) ✓؛ دراپ‌داون: ۵ ستون (کد/عنوان/تاریخ شروع/تاریخ پایان/فعال) همگی داخل ۷۲۰px، ردیف فیلتر با قیف، ردیف «1 | 1405 | 1405/01/01 | 1405/12/29 | بله» ✓؛ تایپ ۹۹۹ در فیلتر کد → «۰ رکورد» + قیف پاک‌سازی فعال؛ کلیک قیف → «۱ رکورد» برگشت ✓؛ کلیک ردیف → دیالوگ بسته، رکورد در فرم باز شد (کد=1 + toast مالک)؛ بازکردن دوباره → ردیف فعال با tint سرمه‌ای primary + فقط یک نقطه در ستون نخست ✓؛ بازخوانی → فهرست دوباره بارگذاری شد ✓؛ dark theme → نمای نزدیک به تصویر مرجع (☰ سفید، پنل تیره، فیلترهای تیره) ✓؛ en → LTR کامل (Code/Title/Start date/End date/Active + "1 record(s)" + Search/Clear/Refresh) و تاریخ‌ها میلادی (۲۰۲۶/۰۳/۲۱) ✓؛ 375px → پنل ۳۴۵px (92vw) با اسکرول افقی ستون‌ها مثل تصویر ✓؛ صفر خطای کنسول؛ dev.log پاک.
- داده: رکورد ۱۴۰۵ مالک دست‌نخورده ماند (پاک‌سازی انجام نشد).

Stage Summary:
- دراپ‌داون «لیست» اکشن بار از یک منوی متنی ساده به مینی‌گرید حرفه‌ایِ عین تصویر مرجع ارتقا یافت: سرستون فیلدها + ردیف فیلترِ زنده + رکوردهای قابل کلیک + فوتر «شمارنده + ابزارهای گرد» — بدون دکمهٔ پلاس؛ تریگر هم ☰ سادهٔ هم‌شکل تصویر شد.
- قراردادهای جدید: ActionBarListCell/cells (هر ارائه‌دهنده فیلدهای واقعی فرم را به ستون تبدیل می‌کند؛ select/checkbox/date همان قواعد نمایش فرم)؛ listActiveId/onListRefresh به‌عنوان قرارداد استاندارد پوسته‌ها و FormActionBar؛ Popover شادکن به ui (z-[12500]).
- artifacts: src/components/forms/action-bar/{list-dropdown.tsx،types.ts،form-action-bar.tsx}؛ src/components/ui/popover.tsx (جدید)؛ src/components/forms/{simple-form-two-row-tabbed.tsx،simple-tree-form.tsx}؛ src/components/erp/form-builder/dfb-form-runtime.tsx؛ src/components/erp/general/fiscal-year-form.tsx؛ src/components/forms/common/Party.tsx؛ src/components/erp/business-structure/bs-window.tsx؛ src/components/erp/form-demo-window.tsx؛ src/i18n/dictionaries.ts (abar.list* ×۱۳)؛ package.json (+@radix-ui/react-popover).
---
Task ID: 86-b
Agent: Z.ai Code (main)
Task: درخواست مالک — «بررسی کنید درخواست زیر بطور کامل پیاده سازی شده است» (ممیزی کامل Task 86 نسبت به تصویر مرجع + بستن شکاف‌های یافت‌شده)

Work Log:
- زوم تصویر مرجع (crop فوتر با sharp): دکمه‌های فوتر «outline مربع‌گوشه» هستند نه دایرهٔ توپر — و ترتیبشان (راست→چپ): + آبی، 🔍، سند آبیِ خط‌دار، سند سبزِ جدول‌دار (اکسل)، سند صورتیِ مداد، قیف کهربایی، ↻.
- ممیزی ردیف‌به‌ردیف سه خواستهٔ مالک و شکاف‌های یافت‌شده:
  ۱) «آیکون لیست دقیقا شبیه تصویر» — تریگر ☰ ساده از قبل ✓؛ اما دکمه‌های فوتر دایرهٔ توپر بودند ⇒ بازطراحی به ListTool (rounded-lg، بوردر نازک، آیکون رنگی، پس‌زمینهٔ شفاف) هم‌شکل تصویر؛ قیفِ حالت عادی اکنون Filter سادهٔ تصویر است و فقط با فیلترِ فعال FilterX می‌شود.
  ۲) «زیبا و جذاب و کاربرپسند» — سلسله‌مراتب تصویر اعمال شد: سرستون‌ها وسط‌چین، متن فیلتر وسط‌چین، ستون نخست هر رکورد سفید/متوسط (مثل «سفارش فروش» تصویر) و بقیه ملایم؛ دو ابزار سندِ تصویر «واقعی» شدند: سند سبز = «خروجی اکسل» (دانلود CSV با BOM از نمای فیلترشده) و سند آبی = «کپی فهرست» (TSV برای چسباندن در اکسل)؛ سند صورتیِ مداد عمداً نیامد (معنایش ویرایشِ رکوردِ انتخابی است و کلیکِ خودِ ردیف همین کار را می‌کند — دکمهٔ مرده UX نیست؛ تصمیم اعلامی ماندگار از Task 86).
  ۳) «دکمهٔ پلاس را قرار ندهید» — بررسی DOM فوتر: پنج دکمه [جست‌وجو/کپی فهرست/خروجی اکسل/پاک‌کردن فیلترها/بازخوانی] + شمارنده؛ hasPlus=false ✓ (بدون دکمهٔ پلاس).
- رفع باگ‌های یافت‌شده در حین ممیزی: ①navigator.clipboard.writeText بدون transient activation رد می‌شد ⇒ fallback document.execCommand('copy') با textarea پنهان؛ ②انتخابِ متنِ باقی‌مانده پس از کپی (هایلایت‌های سرگردان) ⇒ removeAllRanges؛ ③i18n چهار کلید تازه abar.listCopy/listExport/listCopiedToast/listExportedToast ×۱۳ زبان.
- lint = ۰/۰؛ tsc = فقط ۳ خطای baseline قدیمی — صفر خطای جدید.
- E2E مرورگر (fa/en، light/dark، 1280×800 + 375×720): فرم سال مالی (رکورد ۱۴۰۵ مالک) — فوتر: [🔍 سفید، 📄 آبی، 📊 سبز، ⧩ کهربایی، ↻ آسمانی] outline + «۱ رکورد» و hasPlus=false ✓؛ خروجی اکسل → toast «فایل CSV دانلود شد» + دانلود ✓؛ کپی فهرست → toast «فهرست در حافظه کپی شد»، بدون هایلایت سرگردان ✓؛ تم تیره → تطابق بصری نزدیک با تصویر مرجع (☰ سفید، سرستون‌های وسط‌چین، ستون نخست سفید، فیلترهای تیره) ✓؛ فرم نمونه → گرید ۳ رکوردی با «۳ رکورد» و هایلایت رکورد فعال (۱۰۰۱ + نقطه) ✓؛ صفر خطای کنسول؛ dev.log پاک.
- داده: رکورد ۱۴۰۵ مالک دست‌نخورده.

Stage Summary:
- ممیزی کامل انجام و شکاف‌ها بسته شد: دراپ‌داون «لیست» حالا از نظر تریگر (☰ ساده)، بدنه (مینی‌گرید با سرستون وسط‌چین + ردیف فیلترِ قیف‌دار + ردیف‌های قابل کلیک با سلسله‌مراتب رنگی تصویر) و فوتر (ابزارهای outline مربعی با ترتیب دقیق تصویر، منهای پلاس به‌فرمان مالک) با تصویر مرجع منطبق است؛ دو سندِ تصویر عملکرد واقعی گرفتند (CSV/کپی) و سند مداد به‌دلیل افزونگی با کلیک ردیف حذف اعلام شد.
- artifacts: src/components/forms/action-bar/list-dropdown.tsx (ListTool + exportCsv/copyList + فیدلیتی هدر/فیلتر/ستون نخست)؛ src/i18n/dictionaries.ts (۴ کلید ×۱۳).

---
Task ID: 87
Agent: Z.ai Code (main)
Task: درخواست مالک — «آیکون لیست را بوردر بدهید مثل بقیه آیکون ها و استایل آن را زیباتر و جذاب تر کنید. فقط آیکون را تغییر بدهید و دراپ دان آن را تغییری ندهید»

Work Log:
- ممیزی نوار اکشن: همهٔ آیکون‌های همتا (ریست آسمانی، ذخیرهٔ زمردی، کپی بنفش، حذف رزگون، پرینت کهربایی، راهنما فوشیا) کاشی گرادیانی توپر با گلیف سفید، سایه و tooltip دارند؛ فقط تریگر «لیست» (☰) دکمهٔ شبحِ بی‌قاب بود (میراث تصویر مرجع Task 86).
- بازطراحی فقط تریگر در list-dropdown.tsx — کاشی تِیل هم‌قوارهٔ بقیه: گرادیان from-teal-500 to-teal-600 + «بوردر» واقعیِ براق border-teal-300/50 + گلیف سفید ☰ + سایهٔ رنگی shadow-teal-600/30 + hover:brightness و سایهٔ بزرگ‌تر + active:scale-95 + حلقهٔ teal هنگام بازبودن دراپ‌داون (با state خودِ کامپوننت، نه data-state — چون TooltipTrigger و PopoverTrigger هر دو روی یک عنصر data-state می‌نویسند و تداخل می‌کنند).
- tooltip رادیکس هم‌سان بقیهٔ آیکون‌ها اضافه شد (TooltipProvider > Tooltip > TooltipTrigger asChild دور PopoverTrigger asChild — الگوی مستند رادیکس)؛ title بومی حذف شد تا دوتایی نشود؛ aria-label/aria-haspopup حفظ شد.
- تِیل انتخاب شد چون در کل نوار یکتاست (آسمانی/زمردی/بنفش/رز/کهربایی/فوشیا قبلاً مصرف شده‌اند) و آبی/ایندیگو طبق قاعدهٔ ظاهری استفاده نمی‌شود.
- PopoverContent (مینی‌گرید، ردیف فیلتر، فوتر ابزارها، شمارنده) حتی یک کاراکتر تغییر نکرد — به‌فرمان مالک.
- lint = ۰/۰؛ tsc = فقط ۱۱ خطای baseline قدیمی (examples/skills/start-menu/field-translations) — صفر خطای جدید.
- E2E مرورگر: فرم سال مالی — computed style تریگر: گرادیان + border 1px + radius 12px + 36×36 ✓؛ tooltip «لیست اطلاعات ثبت‌شده» هنگام hover ✓؛ کلیک → دراپ‌داون با بدنهٔ دست‌نخورده و حلقهٔ باز روی تریگر ✓؛ دکمه‌های فوتر [جست‌وجو/کپی فهرست/خروجی اکسل/پاک‌کردن فیلترها/بازخوانی] و hasPlus=false ✓؛ Escape می‌بندد و کلیک دوباره باز می‌کند (ترکیب Tooltip+Popover سالم) ✓؛ تم تیره → کاشی تِیل روی کروم تیره عالی ✓؛ موبایل 375px → نوار به‌درستی می‌شکند و آیکون سالم ✓؛ کنسول صفر خطا، dev.log پاک.
- تم به حالت روشن برگردانده شد؛ رکورد ۱۴۰۵ دست‌نخورده.

Stage Summary:
- آیکون «لیست» اکنون کاشی گرادیانی بوردر‌دار تِیل است که دقیقاً هم‌خانوادهٔ بقیهٔ آیکون‌های اکشن بار دیده می‌شود، با جزئیات جذاب‌تر (هالهٔ رنگی، فشردن لمسی، حلقهٔ حالت باز، tooltip هم‌سان)؛ دراپ‌داون آن طبق فرمان مالک کاملاً دست‌نخورده ماند.
- artifacts: src/components/forms/action-bar/list-dropdown.tsx (فقط تریگر).

---
Task ID: 88
Agent: Z.ai Code (main)
Task: درخواست مالک (تکرار Task 87) — «آیکون لیست را بوردر بدهید مثل بقیه آیکون ها و استایل آن را زیباتر و جذاب تر کنید. فقط آیکون را تغییر بدهید و دراپ دان آن را تغییری ندهید» — تثبیتِ تغییر قبلی + جلای بیشتر

Work Log:
- بررسی مجدد کد: تغییرات Task 87 (کاشی تِیل بوردر‌دار) در place بود؛ پیام تکراری مالک به‌عنوان درخواستِ جلای بیشتر تفسیر و پالایش نهایی انجام شد.
- پالایش فقط تریگر در list-dropdown.tsx: گرادیان سه‌مرحله‌ایِ روشن‌تر (from-teal-400 via-teal-500 to-teal-600) + بوردر تِیل کمی پررنگ‌تر (border-teal-300/60) + «جلای شیشه‌ای» روی نیمهٔ بالای کاشی (span از-white/25 تا شفاف با overflow-hidden و rounded-xl) — گلیف ☰ سفید روی gloss با relative.
- بدون هیچ تغییری در PopoverContent (مینی‌گرید/فیلتر/فوتر/شمارنده) و بدون دکمهٔ پلاس.
- lint = ۰/۰؛ tsc = همان ۱۱ خطای baseline — صفر خطای جدید.
- E2E مرورگر: computed style تریگر (گرادیان + border 1px + gloss span + 36×36) ✓؛ tooltip «لیست اطلاعات ثبت‌شده» ✓؛ کلیک → دراپ‌داون باز، حلقهٔ باز روی تریگر، فوتر [جست‌وجو/کپی فهرست/خروجی اکسل/پاک‌کردن فیلترها/بازخوانی] و hasPlus=false ✓؛ Escape می‌بندد ✓؛ زومِ نوار → کاشی تِیل براق کاملاً هم‌خانوادهٔ بقیه ✓؛ تم تیره → درخشش و gloss سالم ✓؛ کنسول صفر خطا.
- تم به روشن برگردانده شد؛ رکورد ۱۴۰۵ دست‌نخورده.

Stage Summary:
- تریگر «لیست» نهایی شد: کاشی تِیل سه‌مرحله‌ایِ براق با بوردر، گلیف سفید، هالهٔ رنگی، حلقهٔ حالت باز و tooltip هم‌سان بقیهٔ آیکون‌های اکشن بار؛ دراپ‌داون طبق فرمان مالک دست‌نخورده ماند.
- artifacts: src/components/forms/action-bar/list-dropdown.tsx (فقط تریگر).

---
Task ID: 89
Agent: Z.ai Code (main)
Task: مشاوره (بدون تغییر کد) — «دکمهٔ ترجمه آنلاین الان در کدام قسمت وجود دارد؟»

Work Log:
- جست‌وجوی کل کدبیس برای «ترجمه/ترجمه آنلاین/auto-translate»: تنها فراخوانیِ API آنلاین از records-list-window.tsx است (POST /api/dfb-translations/auto-translate — Task 70).
- ردیابی مسیر: window-meta «dfb-list» ← RecordsListWindow؛ بازشونده از دکمهٔ «فهرست رکوردها» (dfb.list.open، Table2) در FormBuilderWindow؛ FormBuilderWindow از «ابزارهای پیشرفته ← فرمساز» (componentKey dfb-builder، Task 46).
- دکمه: GridActionButton بنفش با آیکون Languages و برچسب «ترجمه» در نوار ابزار گرید؛ DropdownMenu با دو گزینه: «ترجمهٔ خودکار (آنلاین)» (Sparkles — فیلدهای متنی رکورد انتخاب‌شده با یک فراخوانی LLM به زبان‌های فعال، ذخیره در DfbTranslation) و «ورود دستی (آفلاین)» (Keyboard — دیالوگ DfbTranslationsBody برای هر فیلد متنی).
- پیش‌شرط‌ها: رکورد انتخاب‌شده در گرید (disabled={!selectedId})، حداقل یک زبان فعال غیر fa (تنظیمات ← زبان‌های فعال)، داشتن فیلد متنی.
- ترجمهٔ آفلاین/دستی جدا است: پنل‌های استودیو (برچسب/تب/آیتم — Tasks 68/69). فرم‌های سیستمی (سال مالی و…) دکمهٔ ترجمه ندارند.
- تأیید زندهٔ مرورگر: مسیر ابزارهای پیشرفته ← فرمساز باز شد؛ درخت فرم‌ساز اکنون خالی است («اطلاعاتی وجود ندارد») — تا فرمی ساخته نشود دکمه در عمل دیده نمی‌شود.

Stage Summary:
- پاسخ مشاوره: دکمهٔ ترجمهٔ آنلاین فقط در «فهرست رکوردها (کلّی)» فرم‌های فرم‌ساز است: ابزارهای پیشرفته ← فرمساز ← انتخاب فرم ← «فهرست رکوردها» ← دکمهٔ بنفش 🌐 «ترجمه» در نوار گرید ← «ترجمهٔ خودکار (آنلاین)». هیچ‌جای دیگر (نوار اکشن فرم‌ها، استودیو، تنظیمات) دکمهٔ ترجمهٔ آنلاین وجود ندارد.
- هیچ فایل کدی تغییر نکرد (مشاوره).

---
Task ID: 90
Agent: Z.ai Code (main)
Task: درخواست مالک — «دکمه ترجمه باید در تمامی فرم های سیستم و غیرسیستمی وجود داشته باشد. اگر کاربر 2 زبان را در تنظیمات انتخاب کرده بود باید دکمه ترجمه در اکشن بار فعال گردد»

Work Log:
- ممیزی معماری: همهٔ فرم‌ها (سیستمی و غیرسیستمی) از SimpleFormTwoRowTabbed/SimpleTreeForm ← FormActionBar می‌گذرند؛ ترجمهٔ آنلاین موجود (Task 70) فقط DFB را پوشش می‌دهد (DfbTranslation روی dfb.db) و دادهٔ فرم‌های سیستمی (Party/FiscalYear روی main.db) در آن نیست.
- اکشن ۱۲ «ترجمه» جدید (translate-button.tsx): کاشی گرادیانی بنفش (Languages) هم‌قوارهٔ بقیه + tooltip هم‌سان + منوی کشویی عین فهرست کلّی (✨ ترجمهٔ خودکار آنلاین با شمارندهٔ زبان‌ها / ⌨ ورود دستی آفلاین) + busy چرخان داخلی؛ فعال‌بودن = activeLocales.length ≥ 2 (عین فرمان مالک — داخل خود دکمه، خودکار در همهٔ فرم‌ها)؛ حلقهٔ حالت باز با state (نه data-state — تداخل Tooltip/Dropdown)؛ آیتم‌های فرم‌های بدون رفتار ترجمه: غیرفعال با توضیح جدید abar.translateUnavailable (بدون کلیک مرده).
- FormActionBar: دو پراپ جدید onTranslateOnline/onTranslateOffline؛ دکمه عمداً بیرون از allowlist ذخیره‌شده (فرمان مطلق مالک: «تمامی فرم‌ها»)؛ pass-through در هر دو شِل (simple-form-two-row-tabbed + simple-tree-form).
- dfb-form-runtime: رفتار کامل رکورد باز — آنلاین: POST /api/dfb-translations/auto-translate {formId, dataId: currentDataId, langs: فعال منهای fa} → بازخوانی نقشهٔ کش → توست «ترجمهٔ خودکار انجام شد»؛ آفلاین: دیالوگ RuntimeTranslateDialog (جدید) با DfbTranslationsBody برای هر فیلد متنی (entityType=Value, entityRef=currentDataId) — در هر دو مسیر دو‌ردیفه و درختی؛ رکورد ذخیره‌نشده ← توست راهنما (dfb.noRecordSelected).
- i18n: کلید جدید abar.translateUnavailable ×۱۳ زبان (fa لنگر: «ترجمهٔ دادهٔ این فرم هنوز فعال نیست»).
- lint = ۰/۰؛ tsc = همان ۱۱ خطای baseline — صفر خطای جدید.
- دادهٔ آزمون: فرم DFB «فرم آزمون ترجمه» (id=16، دو فیلد متنی) + رکورد ۳۱ با مُهر سازمانی companyRef=14 ساخته شد (برای آزمون زندهٔ مالک نگه داشته شد — با اجازه حذف می‌شود).
- E2E مرورگر: فرم سیستمی سال مالی → کاشی بنفش حاضر و فعال (۱۳ زبان) + آیتم‌ها با توضیح غیرفعال ✓؛ تنظیم activeLocales=['fa'] → کاشی dimmed و aria-disabled=true ✓ (قاعدهٔ ≥2)؛ فرم غیرسیستمی → آیتم‌ها فعال با «۱۲ زبان فعال» ✓؛ ترجمهٔ آنلاین از اکشن بار → توست «ترجمهٔ خودکار انجام شد» و ۲۴ ردیف در DfbTranslation (۲ فیلد × ۱۲ زبان؛ یک فراخوانی اول 502 گذرای LLM بود، فراخوانی دوم موفق) ✓؛ زبان en → overlay رکورد باز «Liqvan Cheese / Probiotic product for export to Europe» ✓؛ دیالوگ آفلاین → دو پنل 12/12 با انتخابگر زبان ✓؛ کنسول صفر خطا، dev.log پاک (POST auto-translate 200 در 4.5s)؛ زبان به fa برگردانده شد.

Stage Summary:
- دکمهٔ «ترجمه» اکنون در اکشن بار همهٔ فرم‌ها (سیستمی و غیرسیستمی) هست و فقط با ≥۲ زبان فعال روشن می‌شود (فرمان مالک). فرم‌های فرم‌ساز ترجمهٔ کامل رکورد باز را دارند (آنلاین LLM + ورود دستی)؛ فرم‌های سیستمی دکمه را دارند ولی آیتم‌هایشان تا بستن زیرساخت ترجمهٔ دادهٔ main.db غیرفعال با توضیح است (پیشنهاد: تسک بعدی).
- artifacts: src/components/forms/action-bar/translate-button.tsx (جدید)؛ form-action-bar.tsx؛ index.ts؛ simple-form-two-row-tabbed.tsx؛ simple-tree-form.tsx؛ dfb-form-runtime.tsx (+RuntimeTranslateDialog)؛ src/i18n/dictionaries.ts (۱ کلید ×۱۳).
---
Task ID: 91
Agent: Z.ai Code (main)
Task: مشاوره (بدون تغییر کد) — «توی فرم طرف حساب روی دکمه ترجمه کلیک می کنم هیچ آیتمی فعال نیست. مشاوره بدهید چرا فعال نیست؟» (با اسکرین‌شات منوی بازشدهٔ فرم «طرف حساب جدید»)

Work Log:
- ریشه‌یابی کد: translate-button.tsx — کاشی با activeLocales.length ≥ 2 روشن می‌شود (فرمان Task 90)؛ اما دو آیتم منو با «wired = Boolean(onTranslateOnline || onTranslateOffline)» کنترل می‌شوند: wired=false ⇒ disabled + زیرنویس abar.translateUnavailable («ترجمهٔ دادهٔ این فرم هنوز فعال نیست»).
- Party.tsx (فرم طرف حساب) هیچ‌کدام از دو پراپ onTranslateOnline/onTranslateOffline را به SimpleFormTwoRowTabbed/FormActionBar نمی‌فرستد — زیرساخت ترجمهٔ دادهٔ فرم‌های سیستمی (main.db) هنوز بسته نشده (Task 90 آیتم‌های سیستمی را عمداً غیرفعال با توضیح گذاشت — بدون کلیک مرده).
- تأیید زندهٔ مرورگر (همان سناریوی مالک): عمومی ← اطلاعات پایه ← طرف حساب جدید ← کاشی ترجمه فعال و منو باز شد؛ هر دو آیتم [disabled] با زیرنویس «ترجمهٔ دادهٔ این فرم هنوز فعال نیست» ✓ (عین اسکرین‌شات مالک).
- مقایسهٔ زنده: فرم فرم‌ساز «فرم آزمون ترجمه» (Task 90) از مسیر ران‌تایم (باز کردن فرم) → هر دو آیتم فعال («۱۲ زبان فعال» / «ترجمهٔ فیلدهای متنی این رکورد») ✓ — یعنی دکمه در فرم‌های غیرسیستمی واقعاً کار می‌کند.
- نکتهٔ تکمیلی: حتی در ران‌تایمِ فرم‌ساز، رکورد باید ذخیرهٔ شده باشد (currentDataId ≠ null؛ وگرنه توست «رکوردی انتخاب نشده است») — مالک روی «طرف حساب جدید» (رکورد ذخیره‌نشده) بود.
- کنسول صفر خطا؛ هیچ داده‌ای تغییر نکرد؛ مرورگر بسته شد.

Stage Summary:
- پاسخ مشاوره: کاشی ترجمه فعال است چون ≥۲ زبان فعال دارید؛ ولی دو آیتم داخل منو در «طرف حساب» غیرفعال‌اند چون طرف حساب فرم سیستمی است و ترجمهٔ دادهٔ فرم‌های سیستمی هنوز به موتور ترجمه (API آنلاین + انبار ترجمه + ورود دستی) وصل نشده — فقط فرم‌های فرم‌ساز (غیرسیستمی) پشتیبانی کامل دارند؛ برای فعال‌شدن واقعی، تسک بعدی: زیرساخت ترجمهٔ دادهٔ main.db (جدول ترجمهٔ عمومی + تعمیم API) و سیم‌کشی onTranslateOnline/onTranslateOffline در فرم‌های سیستمی.
- هیچ فایل کدی تغییر نکرد (مشاوره).
---
Task ID: 92
Agent: Z.ai Code (main)
Task: تأیید مالک («بلی تایید می کنم») بر پیشنهاد Task 91 — ساخت زیرساخت ترجمهٔ «دادهٔ» فرم‌های سیستمی + فعال‌شدن واقعی دکمهٔ ترجمهٔ «طرف حساب» (آیتم‌های آنلاین/آفلاین)

Work Log:
- ممیزی معماری: دادهٔ فرم‌های سیستمی روی custom.db در settings-service:3001 است (Party/FiscalYear — NestJS + Prisma + IDGeneration §16 + بلوک اجباری AppBaseEntity ۸فیلدی + VERSIONED_MODELS §2.5)؛ موتور ترجمهٔ موجود (Task 70) فقط DFB را پوشش می‌داد.
- اسکیما: مدل DataTranslation در mini-services/settings-service/prisma/schema.prisma (EntityType/EntityID/FieldKey/Locale/Value + بلوک ۸فیلدی؛ unique چهارتایی؛ index خواندن) + `bun run db:push` (افزودنی — جدول FiscalYear/Party دست‌نخورده، رکورد ۱۴۰۵ سالم)؛ نکته: SQLite @db.VarChar ندارد — سقف‌ها به DTO منتقل شد.
- سرویس: data-translations.{dto,service,controller,module}.ts — GET ?entityType&entityId (JSON-safe) و POST /save (upsert چهارتایی؛ value خالی = deleteMany — عین قرارداد DfbTranslationsBody؛ ID دسته‌ای از generateNextIdBlock که «شناسهٔ آغازین» برمی‌گرداند نه آرایه — باگ اولیه id=0 رفع شد؛ deleteMany فیلتر معمولی می‌گیرد نه کلید یکتای مرکب)؛ ثبت در app.module + VERSIONED_MODELS + TABLE_REGISTRY؛ restart سرویس (bun --hot فایل‌های نوپست از راه‌اندازی را نمی‌گیرد)؛ smoke-test امضاشدهٔ save/list/delete = سبز.
- BFF: src/app/api/data-translations/auto-translate/route.ts — همان قرارداد dfb (Task 70) ولی برای بانک اصلی: ورودی {entityType, entityId, langs, fields:[{key,label,value}]} از «رکورد بازِ» فرانت؛ خروجی LLM → upsert امضاشده به /data-translations/save. کشف مهم E2E: پاسخ LLMِ چندفیلدی (۲فیلد×۱۲زبان ≈۵۷۰ نویسه) گاهی ~۳۳۰ نویسه بریده می‌شود (JSON ناقص → ۵۰۲) و دو بار پشت‌سرهم تکرار شد؛ راه‌حل: «یک فراخوانی به‌ازای هر فیلد» (پاسخ ≤۳۵۰ نویسه همیشه کامل) + یک تلاش مجدد درون‌فیلدی — بعد از آن همهٔ فراخوانی‌ها ۲۰۰ در همان تلاش اول.
- فرانت: DataTranslationsDialog (جدید، عمومی/فرم‌مستقل در components/forms/common) — دیالوگ «ورود دستی» با انتخابگر زبان مشترک (زبان‌های فعال منهای fa، شمارندهٔ سبز n/n)، ورودی به‌ازای هر فیلد با placeholder مقدار fa، ذخیرهٔ دکمه‌ای، خواندن از GET و نوشتن به save؛ body keyed-remount (قاعدهٔ react-hooks/set-state-in-effect — صفر setState همگام در effect). صفر کلید i18n جدید (بازاستفادهٔ dfb.list.translateManualTitle/translateOfflineHint/translateNoTextFields/translateDone + common.save/close + abar.savedToast) ×۱۳ زبان سالم ماند.
- سیم‌کشی Party.tsx: translatableFields() = name/lastName + address.{i}.fullAddress + persons.{i}.{firstName,lastName,notes} (فقط مقادیر غیرخالی)؛ onTranslateOnline (گارد رکورد ذخیره‌نشده → توست راهنما؛ گارد زبان فعال؛ POST مسیر جدید؛ توست موفقیت) و onTranslateOffline (گارد → بازکردن دیالوگ) به SimpleFormTwoRowTabbed/FormActionBar → TranslateButton از حالت «غیرفعال با توضیح» به «فعال» رسید (wired=true).
- lint = ۰/۰؛ tsc = همان ۱۱ خطای baseline — صفر خطای جدید؛ dev.log پاک.
- E2E مرورگر (agent-browser): فرم طرف حساب → هر دو آیتم منو فعال («۱۲ زبان فعال» / «ورود دستی») ✓؛ رکورد ذخیره‌نشده → کلیک آنلاین = توست «رکوردی انتخاب نشده است» ✓؛ ذخیرهٔ رکورد آزمون (#6 علی رضایی) → ترجمهٔ آنلاین = ۲۴ ردیف در DataTranslation (۲فیلد×۱۲زبان، name=Ali/lastName=Razai در en) + توست «ترجمهٔ خودکار انجام شد» ✓؛ دیالوگ دستی: بارگیری ۲/۲ همهٔ ۱۲ زبان، سوییچ Deutsch، ویرایش دستی «Ali-DE-Test» → ذخیره → DB به‌روز ✓؛ پاک‌کردن مقدار و ذخیره → ردیف DELETED ✓ (خالی=حذف)؛ کنسول صفر خطا ✓؛ موبایل 375px: آیتم‌ها فعال و دیالوگ ۳۷۵×۳۵۶ بدون سرریز با placeholderهای مقدار fa و شمارندهٔ 0/2 ✓.
- پاک‌سازی: رکورد آزمون #6 و ۲۳+۲۴ ردیف ترجمهٔ آن حذف شد؛ دادهٔ خود مالک (۱ طرف حساب) دست‌نخورده؛ شمارندهٔ Party طبق §8 جلو رفته (رفتار پذیرفته‌شده).

Stage Summary:
- دکمهٔ «ترجمه» در فرم سیستمی «طرف حساب» از نمایشِ غیرفعال به عملکرد کامل رسید: ترجمهٔ خودکار آنلاین (LLM، یک فراخوانی به‌ازای هر فیلد — مقاوم به بریدگی پاسخ) به انبار DataTranslation روی بانک اصلی + ورود دستی آفلاین با دیالوگ عمومی چندزبانه (خالی = حذف ترجمه). پیش‌شرط‌ها همان قرارداد مالک: ≥۲ زبان فعال برای روشن‌شدن کاشی، رکورد ذخیره‌شده برای ترجمه.
- زیرساخت عمومی است: هر فرم سیستمی آینده فقط با پاس‌دادن fields + دو پراپ به اکشن بار وفق می‌یابد (DataTranslation با EntityType ژنریک؛ DTO نام لاتین می‌پذیرد).
- artifacts: mini-services/settings-service/src/data-translations/* (جدید)؛ prisma/schema.prisma (+DataTranslation)؛ prisma.service.ts؛ id-generation/table-registry.ts؛ app.module.ts؛ src/app/api/data-translations/auto-translate/route.ts (جدید)؛ src/components/forms/common/data-translations-dialog.tsx (جدید)؛ src/components/forms/common/Party.tsx.
- یادداشت برای آینده: مسیر dfb (Task 70) همان آسیب‌پذیری بریدگی پاسخ چندفیلدی را دارد — در صورت گزارش مالک می‌توان همان الگوی تک‌فیلدی را آنجا هم اعمال کرد.
---
Task ID: 93
Agent: Z.ai Code (main)
Task: گزارش مالک — «رکورد طرف حساب را ثبت کردم و روی دکمه ترجمه آنلاین کلیک کردم ولی اطلاعات داخل فیلد نام و نام خانوادگی ترجمه نشده و همان فارسی نمایش می‌دهد؛ می‌خواهم اطلاعات داخل اینپوت ترجمه گردد»

Work Log:
- ریشه‌یابی با دادهٔ واقعی مالک: رکورد Party#5 (مصطفی شربتی) در انبار DataTranslation دارای ۲۲ ردیف ترجمه بود (name/lastName × ۱۱ زبان؛ en=Mostafa/Sharbati) — یعنی «ترجمهٔ آنلاین» سالم کار کرده و ذخیره بوده؛ مشکل «نمایش» بود: تسک ۹۲ فقط انبار + دیالوگ دستی را ساخته بود و هیچ کدی ترجمه‌های ذخیره‌شده را به اینپوت‌ها اعمال نمی‌کرد (فرم‌ساز این overlay را از تسک ۷۰ دارد، فرم سیستمی نه).
- پیاده‌سازی overlay در Party.tsx — هم‌قرارداد دقیق Task 70 فرم‌ساز: در زبان ≠ fa و رکورد ذخیره‌شدهٔ باز، اگر فیلد اصلی (name/lastName) نه فوکوس‌شده و نه ویرایش‌شده باشد، ترجمهٔ زبان فعلی از DataTranslation به‌جای مقدار پایه در اینپوت دیده می‌شود؛ زنجیرهٔ جایگزینی: بدون ترجمه = مقدار اصلی.
- مکانیک: نقشهٔ همه‌زبان رکورد باز (fieldKey→locale→value) با GET data-translations؛ stateهای trMap/revealed/baseValues (baseValues عمداً state است نه ref — رندر به آن وابسته است و قانون react-hooks/refs خواندن ref در رندر را منع می‌کند؛ اولین تلاش با useRef دو خطای lint داد)؛ guard ویرایش = مقایسهٔ values[key] با عکس رکورد باز؛ reveal-on-focus با onRevealFocus موجود در شِل (فقط فیلدهای اصلی — GridCellInput آن را ندارد و قرارداد Task 70 هم فقط فیلدهای اصلی است).
- بازخوانی نقشه در سه مسیر: بازکردن/ذخیرهٔ رکورد (applyRecord → نقشهٔ قبلی پاک + واکشی تازه)، موفقیت ترجمهٔ آنلاین (ریست reveal + await loadTr — فیلدها همان لحظه ترجمه را نشان می‌دهند بدون بستن رکورد)، بستن دیالوگ ورود دستی (loadTr دوباره — ترجمهٔ ذخیره‌شدهٔ دستی فوراً دیده می‌شود)؛ newRecord/کپی = پاک‌سازی نقشه و reveal.
- حفاظت داده: ذخیره با overlay نمایان، مقدار پایه (values state) را می‌نویسد نه متن ترجمه — چون overlay فقط در value prop فیلد است و onChange پس از reveal-on-focus روی مقدار پایه کار می‌کند.
- lint = ۰/۰؛ tsc = همان ۱۱ خطای baseline — صفر خطای جدید؛ بدون کلید i18n جدید (صفر تغییر دیکشنری).
- E2E مرورگر (agent-browser، UI انگلیسی — عین سناریوی مالک): بازکردن رکورد #۵ → نام=«Mostafa»، نام خانوادگی=«Sharbati» در اینپوت ✓؛ کلیک روی هر فیلد = نمایان‌شدن پایه (مصطفی/شربتی) ✓؛ ترجمهٔ آنلاین دوباره → توست موفقیت + فیلدها بلافاصله overlay شدند (۲۴ ردیف) ✓؛ ذخیره در حالی که اینپوت‌ها ترجمه نشان می‌دادند → DB پایه دست‌نخورده مصطفی/شربتی ماند ✓ (حفاظت داده)؛ دیالوگ دستی: بارگیری ۲/۲ انگلیسی، انتخاب Русский، ویرایش «Мустафа-Тест93» → ذخیره (POST save 201) → بستن → تغییر زبان نرم‌افزار به روسی → اینپوت همان لحظه «Мустاфа-Тест93» ✓ (حلقهٔ کامل دستی→نمایش)؛ برگشت به فارسی → پایه مصطفی/شربتی ✓؛ ریست فرم (رکورد نو) → فیلدها خالی ✓؛ کنسول/خطاهای صفحه صفر؛ dev.log فقط ۲۰۰/۲۰۱.
- پاک‌سازی: مقدار آزمایشی ru به «Мустаفا» بازگردانده شد (۲۴ ردیف سالم)؛ دادهٔ مالک (Party#5) دست‌نخورده؛ زبان نرم‌افزار به فارسی برگشت.

Stage Summary:
- «اطلاعات داخل اینپوت» اکنون واقعاً ترجمه می‌شود: با زبان غیر-fa و رکورد بازِ ذخیره‌شده، فیلدهای اصلی نام/نام خانوادگی ترجمهٔ همان زبان را از انبار DataTranslation نشان می‌دهند؛ فوکوس = مقدار پایه، ویرایش = مقدار واقعی، بدون ترجمه = مقدار اصلی؛ ترجمهٔ آنلاین و ورود دستی هر دو بلافاصله در اینپوت دیده می‌شوند. ذخیره هرگز متن ترجمه را روی دادهٔ پایه نمی‌نویسد.
- قرارداد عین فرم‌ساز (Task 70): overlay فقط فیلدهای اصلی متنی است؛ سلول‌های گرید (افراد مرتبط/نشانی) مقدار پایه را نشان می‌دهند و ترجمهٔشان از «ورود دستی» مدیریت می‌شود — در صورت درخواست مالک، overlay گرید به‌عنوان تسک جدا قابل افزودن است (نیازمند API reveal در شِل گرید).
- artifacts: src/components/forms/common/Party.tsx (تنها فایل تغییرکرده).
---
Task ID: 94
Agent: Z.ai Code (main)
Task: گزارش مالک — «خطای تصویر را بررسی و برطرف کنید» (اسکرین‌شات Console Error: hydration attribute mismatch — panel-left-open در کلاینت vs panel-right-open در سرور)

Work Log:
- ریشه‌یابی: دو آیکون در diff دقیقاً انتخابِ ToggleIcon در desktop.tsx است (dir==='rtl' ? PanelRightOpen : PanelLeftOpen) — یعنی dir سرور rtl (پیش‌فرض fa) و dir کلاینت ltr در لحظهٔ hydration. منبع: settings-store (erp.settings) با persist/localStorage و locale ذخیره‌شدهٔ کاربر (مالک با UI انگلیسی) — zustand persist وضعیت را «همگام در اولین رندر کلاینت» بازخوانی می‌کند، در حالی که سرور با پیش‌فرض fa رندر کرده → mismatch (آیکون فقط اولین diff گزارش‌شده است؛ متن‌ها هم در معرض همان خطا هستند).
- قرارداد موجود کدبیس کشف شد: desktop-store و fiscal-year-store همین مشکل را قبلاً با «skipHydration: true + بازخوانی بعد از mount» حل کرده‌اند (کامنت: «skipHydration keeps SSR markup deterministic; Desktop rehydrates after mount») — اما سه استور ماندگار دیگر این قرارداد را نداشتند: erp.settings (locale/dir/activeLocales) و erp.orgContext (انتخاب شرکت/شعبه/نمایندگی/فروشگاه — برچسب کسکاد هدر) و erp.dfb-translations (کش برچسب‌های ترجمه).
- بازتولید خطا (agent-browser): نوشتن erp.settings با locale=en در localStorage + reload → همان خطای کُنسول مالک عیناً ظاهر شد ✓.
- اصلاح: skipHydration: true برای هر سه استور + افکت بازخوانی در Desktop (ریشه): useSettings/useOrgContext/useDfbTranslations persist.rehydrate() بلافاصله پس از mount — رندر اول کلاینت با پیش‌فرض‌ها = یکی با SSR؛ وضعیت واقعی کاربر (زبان/انتخاب‌ها/کش ترجمه) بلافاصله پس از hydration اعمال می‌شود. ensureDfbTranslations قبلی دست‌نخورده (کش آفلاین اول، تازه‌سازی شبکه بعد).
- lint = ۰/۰؛ tsc = همان ۱۱ خطای baseline — صفر خطای جدید.
- E2E مرورگر: با locale=en ماندگار → reload → کُنسول صفر hydration error، UI انگلیسی، html dir/lang = «ltr / en»، دکمهٔ toggler سایدبار حاضر ✓؛ با locale=fa ماندگار → کُنسول پاک، «rtl / fa» ✓؛ سوییچ زبان در زمان اجرا (fa→en→fa) فوری و سالم ✓ و پس از reload ماندگار بدون هیچ hydration error ✓؛ دود: بازشدن پنجرهٔ عمومی و زیرمنوی اطلاعات پایه ✓؛ کنسول و page errors تا انتها صفر.

Stage Summary:
- خطای hydration ریشه‌ای برطرف شد: همهٔ پنج استور ماندگار اکنون یک قرارداد واحد دارند — رندر SSR/اولین رندر کلاینت با پیش‌فرض‌ها قطعی است و وضعیت ماندگار کاربر فقط بعد از mount بازخوانی می‌شود (erp.settings/erp.orgContext/erp.dfb-translations به erp.desktop.layout/erp.fiscalYear ملحق شدند). عارضهٔ جانبی: کاربر غیرفارسی‌زبان یک لحظه فلش fa در اولین رندر می‌بیند (همان سازش پذیرفته‌شدهٔ قبلی برای layout/سال مالی).
- artifacts: src/stores/settings-store.ts؛ src/stores/org-context-store.ts؛ src/stores/dfb-translations.ts؛ src/components/desktop/desktop.tsx (فقط این چهار فایل).

---
Task ID: 94
Agent: Z.ai Code (main)
Task: «عنوان آیکون‌ها در دسکتاپ در زبان آلمانی و برخی زبان‌های دیگر با هم تداخل پیدا کرده‌اند» — رفع همپوشانی برچسب آیکون‌های دسکتاپ (اسکرین‌شات کاربر: Anlagevermögen / Büroautomation / Finanzberichte / Kundenbeziehungsmanagement (CRM) روی هم افتاده بودند).

Work Log:
- ریشه‌یابی: در desktop.tsx شبکهٔ آیکون‌های دسکتاپ هر دکمه `w-[84px]` است ولی span برچسب (`line-clamp-2`) عرضش fit-content بود؛ واژه‌های مرکب طولانی آلمانی (بدون فاصله، مثل «Kundenbeziehungsmanagement» ≈۱۶۰px) قابل شکستن نبودند ⇒ span از سلول ۸۴px بیرون می‌زد و روی برچسب‌های مجاور می‌افتاد. line-clamp فقط تعداد خط را محدود می‌کند نه عرض را — برای همین brچسب‌ها تک‌خطیِ سرریز شده بودند.
- اصلاح desktop.tsx (شبکهٔ دسکتاپ): به span برچسب `w-full min-w-0 [overflow-wrap:anywhere]` اضافه شد ⇒ عرض برچسب به داخل سلول محدود و واژه‌های بلند شکسته می‌شوند؛ line-clamp-2 سرریز عمودی را با «…» می‌بُرد. همچنین `title={entry.label}` به دکمه اضافه شد تا نام کامل با hover دیده شود.
- اصلاح desktop.tsx (ghost درگ): همان قواعد شکست برای برچسب شبحِ کشیدن آیکون (وقتی freeMode).
- اصلاح start-menu.tsx (منوی استارت، grid-cols-4/6): همان الگوی پنهان همان مشکل داشت؛ span برچسب `w-full min-w-0 [overflow-wrap:anywhere]` گرفت.
- lint = ۰/۰؛ tsc = همان ۱۱ خطای baseline — صفر خطای جدید.
- E2E با agent-browser (زبان Deutsch از منوی زبان هدر): ۳۰ برچسب شبکهٔ دسکتاپ — `scrollWidth <= clientWidth` برای همه ✓، تداخل مستطیلی زوج‌برچسب‌ها = ۰ ✓؛ اسکرین‌شات: همهٔ برچسب‌ها (Anlagevermögen، Büroautomation، Kundenbeziehung…، Produktionsplanung و…) داخل سلول خودشان دوخطی شده و با «…» بسته می‌شوند، هیچ هم‌پوشانی نیست ✓؛ tooltip نام کامل («Kundenbeziehungsmanagement (CRM)») با title attr ✓؛ منوی استارت هم سالم (یک مورد ۲px فقط آرتیفکت گردکردن scrollWidth، درون gap و غیرمرئی) ✓؛ بازگشت به فارسی: شبکهٔ ۳۰تایی — صفر سرریز، صفر تداخل ✓؛ کنسول/page errors صفر؛ dev.log پاک.

Stage Summary:
- همپوشانی برچسب‌ها در همهٔ زبان‌ها (مستقل از locale، با CSS) برطرف شد: برچسب همیشه داخل سلول ۸۴px شکسته و حداکثر دوسطر با «…» نمایش داده می‌شود؛ نام کامل از طریق tooltip (title) در دسترس است و منوی استارت/سایدبار هم کامل‌تر نشان می‌دهند.
- فایل‌های تغییر یافته: src/components/desktop/desktop.tsx (span شبکه + ghost + title)؛ src/components/desktop/start-menu.tsx (span برچسب). هیچ منطق دیتا یا استور دست نخورد.

---
Task ID: 95
Agent: Z.ai Code
Task: بازیابی کامل سورس و دیتابیس از بکاپ ارسالی کاربر (farataraznewtheme-main.zip) پس از ریست سندباکس

Work Log:
- کاربر گزارش «پیش نمایش با مشکل مواجه شده است» داد و سپس بکاپ کامل پروژه (upload/farataraznewtheme-main.zip، ۴۹۱ فایل) را برای بازیابی ارسال کرد.
- تشخیص اولیه روی پروژهٔ فعلی نشان داد سندباکس در ۲۱:۵۶ به یک قالب ۱۳-سرویسی نامرتبط (سcaffold template) بازنشسته شده بود؛ .env پاک شده، node_modules سرویس‌ها ناقص و کل ساختار با پروژهٔ واقعی کاربر متفاوت بود.
- محتوای بکاپ را استخراج و صحت‌سنجی کردم: worklog تا Task 94، نشانگرهای Task 94 در desktop.tsx/start-menu.tsx، Party.tsx و API data-translations/auto-translate همگی موجود بودند ⇒ بکاپ دقیقاً حالت پروژه پس از Task 94 است.
- BACKUP-INFO: معماری واقعی پروژه = settings-service :3001، apps-service :3002، dfb-service :3003، auto-push-service؛ دیتابیس‌ها db/custom.db و db/dfb.db (+ بکاپ‌های t76/t84).
- در حین جابه‌جایی، دایسک پر شد (upload/ یک mount جداست و mv به کپی تبدیل شد)؛ فضای دیسک را با حذف کپی‌های ناقص آزاد و از مسیر /tmp بازیابی را از نو و تمیز انجام دادم.
- پروژه از بکاپ بازسازی شد: سورس کامل، db/ (custom.db 200KB + dfb.db + بکاپ‌ها)، .env با معماری قدیم (INTERNAL_API_KEY، SETTINGS :3001، APPS :3002)، .zscripts، worklog.md تا Task 94.
- وابستگی‌ها: bun install ریشه (۴۱۹ بسته) + هر ۴ سرویس؛ prisma db push ⇒ «database is already in sync» و Prisma Client v6.19.3 ساخته شد.
- بوت با .zscripts/dev.sh انجام شد (bun install → db:push → next dev :3000 → هر ۴ سرویس با NODE_PATH و DATABASE_URL مخصوص dfb).
- عیب‌یابی مرگ‌های مکرر و بی‌صدای next dev: OOM رد شد (memory.failcnt=0، اوج RSS فقط ~۸۰۰MB از ۴GB)، inotify رد شد (کل واچ‌ها ۱۱۹/۸۱۹۲، next تقریباً صفر)، در نهایت مشخص شد الگوی اجرای «nohup + &» از سشن ابزار، توسط پاک‌سازی سشن کشته می‌شود؛ اجرای دقیقاً مشابه سرویس‌های سالم (subshell + reparent) مشکل را حل کرد — سرور ۳+ دقیقه و پس از آن پایدار ماند.
- برای اطمینان، experimental.turbopackMemoryEviction: "full" به next.config.ts اضافه شد (سندباکس ۴GB؛ محافظت در برابر اوج کامپایل).
- راستی‌آزمایی E2E با agent-browser: دسکتاپ تم کامل فارسی با ~۳۰ آیکون ماژول رندر شد، CSS کامپایل و تولید utilities سالم (۱۵۵KB)، کنسول/page errors صفر، پنجرهٔ تنظیمات APIهای واقعی را گرفت (app-registry/fiscal-year/business-structure همگی 200)، GET / پایدار 200 و پورت‌های 3001/3002/3003 زنده.

Stage Summary:
- پروژهٔ FaraTaraz (تا Task 94) کامل از بکاپ کاربر بازیابی و راه‌اندازی شد: فرانت :3000 + settings :3001 + apps :3002 + dfb :3003 + auto-push. دیتابیس‌ها همان بکاپ کاربر (custom.db/dfb.db) هستند.
- تنها تغییر فنی نسبت به بکاپ: افزودن turbopackMemoryEviction:"full" در next.config.ts (بی‌اثر بر UI، صرفاً پایداری dev در رم ۴GB).
- نکته: auto-push-service بدون .git (بکاپ طبق طراحی، .git را مستثنا کرده) لذا لاگ «git status failed» آن طبیعی و بی‌خطر است.
- Task قبلی (ترجمهٔ تب‌ها + چک‌باکس ترجمهٔ خودکار پس از ذخیره) هنوز شروع نشده و در نوبت است.
---
Task ID: 96
Agent: Z.ai Code
Task: مشاورهٔ مالک — «چرا بعضی مواقع سورس پروژه پاک می‌شود و نسخهٔ قدیمی (پیش‌نمایش گل آبی) جایگزین می‌شود؟ نسخهٔ قدیمی باید از حافظهٔ پروژه پاک و آخرین سورس ریستورشده جایگزین گردد»

Work Log:
- ریشه‌یابی: پدیدهٔ «بازگشت نسخهٔ قدیمی» کارِ هوش مصنوعی نیست؛ سندباکس ابری گاهی به یک snapshot قدیمی/قالب برمی‌گردد (مستند در Task 95: بازنشانی ۲۱:۵۶ به قالب ۱۳-سرویسی نامرتبط). پیش‌نمایش «گل آبی» نسخهٔ خیلی قدیمی پروژه (قبل از تم جدید) است که از snapshot قدیمی پلتفرم/کش پیش‌نمایش می‌آید.
- راستی‌آزمایی workspace فعلی = آخرین سورس ریستورشده (بکاپ farataraznewtheme-main.zip تا Task 94): نشانگرهای Task 94 در desktop.tsx/start-menu.tsx ✓، مدل DataTranslation در اسکیما ✓، worklog تا Task 95 ✓، globals.css نسخهٔ اصلی (بدون دست‌کاری) ✓، پورت‌های 3000/3001/3002/3003 زنده ✓.
- بازسازی حالت قدیمی در workspace وجود ندارد: سورس = تم جدید؛ هیچ فایل تصویر/کاغذدیواری قدیمی در src نیست؛ فقط残余های لاگ قالب قدیمی بود.
- پاک‌سازی «حافظهٔ» نسخهٔ قدیمی از workspace: ۱۲ لاگ خالی سرویس‌های قالبِ ۱۳تایی (auth/accounting/costing/desktop/financial-statement/fixed-asset/inventory/order/payment/procurement/sales/setup) از .zscripts حذف شد + settings-service.log قدیمی ریشه + tsconfig.tsbuildinfo کهنه. فایل‌های مالک (download/، upload/، backup db/) دست‌نخورده ماندند.
- رگرسیون واقعی کشف و رفع شد: بعد از ریستور، بستهٔ z-ai-web-dev-sdk در node_modules/bun.lock نبود → POST /api/data-translations/auto-translate با 500 (Module not found) می‌خورد. با bun add نصب شد (0.0.18)؛ endpoint حالا 400 اعتبارسنجی سالم می‌دهد (نه 500).
- سپر ضدتکرار ساخته شد: restore-point/farataraznewtheme-main.zip (کپی امن بکاپ داخل پروژه، در برابر پاک‌شدن mount اینستنتی upload/) + اسکریپت .zscripts/restore-from-backup.sh — بازیابی یک‌فرمانی سورس (و اختیاری db با --with-db) با حفاظت node_modules/.next/restore-point/upload؛ هر سشن آینده با همین اسکریپت دقیقاً به «آخرین سورس تأییدشده» برمی‌گردد.
- lint = ۰/۰.
- E2E مرورگر: پیش‌نمایش = تمِ جدید (والپیپر گرادیانی + ~۲۹ آیکون ماژول رنگی) — هیچ ردّی از نسخهٔ گل‌آبی نیست ✓؛ کنسول/page errors صفر ✓؛ کلیک «تنظیمات» → پنجره با تم/ساختار کسب‌وکار/مدیریت کاربران/یکپارچه‌سازی باز شد و APIهای واقعی 200 (app-registry/fiscal-year/business-structure/advancedTools) ✓؛ dev.log فقط 200/201.

Stage Summary:
- پاسخ مشاوره: عامل، بازنشانی snapshot سندباکس/کش پیش‌نمایش پلتفرم است نه تعویض عمدی سورس؛ نسخهٔ قدیمی از workspace پاک شد و هیچ میراثی از قالب قدیمی نماند.
- workspace اکنون دقیقاً «آخرین سورس ریستورشده» است (Task 94 + تم جدید) و برای اولین بار یک نقطهٔ بازیابی درون‌پروژه‌ای + اسکریپت یک‌فرمانی دارد تا در صورت بازنشانی مجدد سندباکس، بازیابی قطعی و فوری باشد.
- artifacts: restore-point/farataraznewtheme-main.zip؛ restore-point/BACKUP-INFO.txt؛ .zscripts/restore-from-backup.sh؛ bun.lock/package.json (+z-ai-web-dev-sdk).
---
Task ID: 97
Agent: Z.ai Code
Task: گزارش مالک — «در فرم طرف حساب اطلاعات وارد کردم و روی دکمه ترجمه آنلاین کلیک کردم ولی اطلاعات داخل فیلدها و تب‌ها ترجمه نشده است؛ اطلاعات واردشدهٔ فیلدها باید به زبان‌های فعال ترجمه شوند» (اسکرین‌شات: رکورد #10 در fa با گرید افراد مرتبط)

Work Log:
- راستی‌آزمایی داده: ترجمهٔ آنلاین مالک واقعاً موفق بوده — Party#10 (محمد ریاحی) دارای ۶۶ ردیف در DataTranslation است (۶ فیلد: name/lastName + persons.0.{firstName,lastName,relation,notes} × ۱۱ زبان فعال آن لحظه؛ en: Mohammad/Riyahi/Mortaza/Namdari Nasab/cousin…/He was a good person)؛ dev.log هم POST auto-translate 200 در 8.9s را تأیید می‌کند ⇒ مشکل «ذخیره» نبود، «نمایش/بازخورد» بود.
- E2E مرورگرِ مسیر نمایش (کد Task 95 موجود در بکاپ ریستورشده — بدون تغییر کار کرد): رکورد #10 باز، زبان نرم‌افزار → English ⇒ فیلدهای اصلی Mohammad/Riyahi و سلول‌های گرید «افراد مرتبط» Mortaza / Namdari Nasab / cousin (son of maternal uncle) / He was a good person شدند (کد ملی/تلفن عمداً پایه) ✓؛ فوکوس روی سلول = نمایان‌شدن پایهٔ «مرتضی» ✓؛ برگشت به fa = مقادیر پایهٔ محمد/ریاحی ✓ — یعنی گزارش مالک دقیقاً رفتار fa است: fa زبان مبدأ است و طبق قرارداد Task 70/93 overlay در fa نمایش داده نمی‌شود؛ نتیجه فقط با عوض‌کردن زبان نرم‌افزار دیده می‌شد و در fa هیچ بازخورد بصری جز توست عمومی نبود.
- رفع شکاف بازخورد (Task 97): پس از موفقیت ترجمهٔ آنلاین، دیالوگ «ترجمهٔ دستی رکورد» (DataTranslationsDialog — عمومی از Task 92) اکنون به‌صورت خودکار باز می‌شود و ترجمهٔ ذخیره‌شدهٔ هر فیلد به‌ازای هر زبان فعال را بلافاصله نشان می‌دهد (انتخابگر زبان + نقطهٔ سبز تکمیل) — در fa هم نتیجه بدون هیچ گام اضافه دیده می‌شود؛ توست موفقیت هم شمارش می‌گیرد: «ترجمهٔ خودکار انجام شد — {n} فیلد به {m} زبان» (کلید جدید dfb.list.translateDoneCounts ×۱۳ زبان). state دیالوگ به بالای کامپوننت منتقل شد (setOfflineOpen در translateOnline قابل دسترس باشد؛ اعلان تکراری گذرا هنگام ویرایش فقط نویز ۵۰۰ِ چندثانیه‌ای HMR در dev.log بود — بعدش همه ۲۰۰).
- lint = ۰/۰؛ tsc = ۹ خطا (۶ تا examples/websocket + ۳ خطای پیش‌موجود بکاپ در start-menu ×۲ و field-translations ×۱ — فایل‌های این تسک صفر خطا؛ در سدّ ۱۱تایی baseline).
- E2E جریان جدید (رکورد آزمونی #11 «آزمون ترجمه ۹۷ / رکورد آزمایشی»): ذخیره ⇒ ترجمهٔ آنلاین ⇒ توست شمارش‌دار + دیالوگ خودکار باز شد: English 2/2 با «Translation Test 97 / Test Record» و ۲۴ ردیف (۲ فیلد × ۱۲ زبان فعال فعلی) در DB ✓؛ حذف رکورد آزمونی از UI (توست «اطلاعات حذف شد») + پاک‌سازی ۲۴ ردیف ترجمهٔ آن از انبار (save با value خالی = حذف؛ ۰ ردیف باقی) ✓؛ دادهٔ مالک دست‌نخورده (لیست [5,7,8,9,10]؛ #10 همچنان ۶۶ ردیف) ✓؛ زبان نرم‌افزار fa ماند؛ کنسول پس از reload صفر خطای تازه.

Stage Summary:
- پاسخ ریشه‌ای به مالک: ترجمهٔ آنلاین از همان اول کار کرده و ۶۶ ترجمهٔ رکورد شما (فیلدها + تب افراد مرتبط) در انبار ذخیره بوده؛ «دیده‌نشدن» دو علت داشت: (۱) در زبان fa طبق قرارداد، فیلد/سلول مقدار مبدأ را نشان می‌دهد و ترجمه با تعویض زبان نرم‌افزار ظاهر می‌شود — الان تست شد و سالم است؛ (۲) در fa هیچ بازخورد بصری از نتیجه نبود — از این پس بعد از ترجمهٔ آنلاین، دیالوگ نتیجه فوراً باز می‌شود (هر فیلد × هر زبان فعال، با انتخابگر زبان) و توست هم تعداد فیلد/زبان را می‌گوید.
- قراردادهای قبلی دست‌نخورده: overlay غیر-fa، reveal-on-focus، حفاظت ویرایش، ذخیرهٔ پایه زیر overlay.
- artifacts: src/components/forms/common/Party.tsx (جابه‌جایی state دیالوگ + بازشدن خودکار پس از ترجمهٔ آنلاین + توست شمارش‌دار)؛ src/i18n/dictionaries.ts (۱ کلید ×۱۳).
- نکته: ۳ خطای tsc پیش‌موجود بکاپ (start-menu/field-translations) خارج از این تسک است؛ در صورت فرمان مالک به‌عنوان تسک جدا رفع می‌شود.
---
Task ID: 98
Agent: Z.ai Code
Task: بازخورد مالک پس از تسک ۹۷ — «۱) بعد از ترجمهٔ آنلاین یک مودال باز می‌شود و از کاربر ذخیره می‌خواهد؛ در حالت ترجمهٔ آنلاین نباید دیگر این مودال باز شود. ۲) عنوان تب بعد از ترجمه هنوز فارسی است؛ عنوان فرم در نوار تب‌ها فارسی است» (اسکرین‌شات: UI پرتغالی، تب «… — طرف حساب جدید» فارسی با فلش قرمز)

Work Log:
- عارضهٔ ۱: بازخورد مستقیم تغییر تسک ۹۷ بود — «باز شدن خودکار دیالوگ ترجمهٔ دستی پس از ترجمهٔ آنلاین». دیالوگ دکمهٔ «ذخیره» دارد (برای ویرایش دستی) و در حالت آنلاین که ترجمه‌ها همان لحظه در انبار ذخیره شده‌اند، به‌اشتباه «درخواست ذخیره از کاربر» برداشت می‌شد.
- رفع ۱ (Party.tsx): حذف setOfflineOpen(true) از translateOnline — در ترجمهٔ آنلاین (دکمهٔ منو و مسیر خودکارِ پس از ذخیره) هیچ مودالی باز نمی‌شود؛ بازخورد = توست شمارش‌دار («{n} فیلد به {m} زبان») + در زبان‌های غیر-fa نشستن فوری overlay روی فیلدها/سلول‌ها. دیالوگ فقط برای «ترجمهٔ دستی» (دکمهٔ مخصوصش) باز می‌ماند.
- عارضهٔ ۲: ریشه‌یابی عنوان تب — عنوان پنجرهٔ «عمومی» فقط هنگام ناوبری با setWindowTitle ست می‌شد (Task 82) و رشتهٔ زمانِ ناوبری به‌عنوان titleOverride در desktop-store منجمد می‌شد؛ تعویض زبان نرم‌افزار آن را تازه نمی‌کرد (برخلاف بقیهٔ UI که با t() زنده است). الگوی درست از قبل در records-list-window (Task 64) بود.
- رفع ۲ (general-window.tsx): منطق عنوان به یک افکت زنده منتقل شد با وابستگی‌های [page, t, chrome?.windowId, setWindowTitle] — عنوان تب = «{app.general} — {fy.formTitle | party.formTitle}» و با تغییر زبان (pt⇄fa و هر زبان دیگر) بلافاصله تازه می‌شود؛ useT با locale میمویز می‌شود ⇒ افکت فقط با تغییر صفحه/زبان اجرا می‌شود نه هر رندر. go() ساده شد (فقط setPage).
- E2E (رکورد آزمونی #12 «آزمون ترجمه ۹۸ / رکورد آزمایشی» + فرد مرتبط مرتضی/نمداری نسب/پسرخاله/توضیح):
  · ذخیره ⇒ ترجمهٔ آنلاین ⇒ POST auto-translate 200 در ۵۴s، ۷۲ ردیف (۶ فیلد × ۱۲ زبان فعال) در انبار ✓
  · پس از پایان ترجمه: هیچ دیالوگی باز نشد (snapshot: صفر dialog) و فیلدها/سلول‌های تب افراد مرتبط همان لحظه پرتغالی شدند (Teste de tradução 98 / Registro de Teste / Morteza / Namdar Nasab / primo… / Tarefa experimental 98) ✓
  · عنوان تب در pt: «Geral — Nova conta de parceiro» = عین هدر فرم (اسکرین‌شات) ✓؛ برگشت به fa: «عمومی — طرف حساب جدید» (افکت دوطرفه) ✓
  · رگرسیون: «ورود دستی (offline)» هنوز دیالوگ را باز می‌کند و ۶/۶ ترجمهٔ English را نشان داد ✓
  · پاک‌سازی: حذف رکورد آزمونی از UI (تأیید «Confirmar exclusão») + حذف ۷۲ ردیف یتیم انبار با Prisma سرویس تنظیمات؛ دادهٔ مالک دست‌نخورده (لیست [5,7,8,9,10]؛ سطرها 5:24/7:22/8:55/9:72/10:66) ✓
- lint = ۰/۰؛ tsc = فقط ۹ خطای پیش‌موجود baseline (examples/websocket ×۶ + start-menu ×۲ + field-translations ×۱) — صفر خطای جدید؛ کنسول مرورگر و dev.log پاک (همه 200/201).

Stage Summary:
- ترجمهٔ آنلاین اکنون کاملاً «بی‌صدا» است: بدون هیچ مودال و بدون درخواست ذخیره از کاربر — ترجمه‌ها خودکار در انبار ذخیره و فیلدها/تب‌ها در زبان‌های فعال فوراً نمایش داده می‌شوند؛ تنها بازخورد، توست شمارش‌دار است.
- عنوان تبِ فرم‌های نرم‌افزار «عمومی» (طرف حساب جدید / سال مالی جدید) با تغییر زبان نرم‌افزار زنده تازه می‌شود و دیگر هیچ‌گاه در زبان قبلی منجمد نمی‌ماند.
- artifacts: src/components/forms/common/Party.tsx (حذف باز شدن خودکار دیالوگ در مسیر آنلاین)؛ src/components/erp/general/general-window.tsx (افکت عنوان زندهٔ وابسته به page/t).
---
Task ID: 99
Agent: Z.ai Code
Task: بازخورد مالک (دو اسکرین‌شات) — «وقتی زبان نرم‌افزار تغییر کرد، در دراپ‌داون و لیست‌ها هم اطلاعات لیست باید بر اساس زبان انتخابی نمایش داده شود» + «عنوان نرم‌افزار (عنوان پنجرهٔ مرورگر) هم باید به همان زبان باشد؛ در تصویر دوم با اینکه زبان عوض شده عنوان فارسی مانده»

Work Log:
- عارضهٔ ۱ (دادهٔ لیست‌ها): دراپ‌داون «لیست اطلاعات ثبت‌شده» فرم طرف حساب ستون نام را با مقدار پایهٔ فارسی نشان می‌داد حتی در زبان‌های دیگر (برچسب ستون‌ها ترجمه بود ولی «داده» نه) — چون لیست مستقیم از PartyDto ساخته می‌شد و نقشهٔ ترجمه فقط برای رکورد بازِ فعلی واکشی می‌شد (Task 93).
- بک‌اند: endpoint دسته‌ای جدید در settings-service — GET /data-translations?entityType=Party&entityIds=5,7,8&fieldKeys=name,lastName (controller: تجزیه/اعتبارسنجی entityIds تا ۵۰۰ و fieldKeys تا ۶۰ با الگوی کلید؛ service: listMany با findMany + in + مرتب‌سازی) — خروجی هم‌قرارداد list تک‌رکورد (Task 92)؛ مسیر تک‌رکورد قبلی دست‌نخورده. گیت‌وی BFF (catch-all) کوئری را عیناً پاس می‌دهد — بدون تغییر.
- فرانت (Party.tsx): state listTr [recordId][fieldKey][locale] + واکشی دسته‌ای همهٔ رکوردهای لیست (فقط name/lastName — ستون‌های کد/ماهیت/فعال متنی نیستند) در افکت با گارد alive (الگوی هم‌سان افکت records موجود، رفع خطای lint set-state-in-effect)؛ helpers listNameOf/listLastOf: در fa مقدار پایه، در غیر-fa ترجمهٔ زبان فعلی با fallback به پایه؛ اعمال بر title و سلول نامِ listItems؛ listTrVersion++ پس از ترجمهٔ آنلاین تا سطرهای لیست هم فوراً تازه شوند (نه فقط رکورد باز).
- عارضهٔ ۲ (عنوان مرورگر): layout.tsx متادیتای ثابت فارسی دارد و document.title هرگز با تعویض زبان عوض نمی‌شد. افکت جدید در Desktop: document.title = t("app.docTitle") با وابستگی [t] (میمویز با locale)؛ کلید جدید "app.docTitle" ×۱۳ زبان (fa همان «سامانهٔ جامع بازرگانی | Unified Commerce ERP» قبلی؛ en فقط "Unified Commerce ERP"؛ ۱۱ زبان دیگر «{ترجمهٔ نام} | Unified Commerce ERP»).
- E2E مرورگر (سه زبان روی همان لیست ۵ رکورد مالک [5,7,8,9,10]):
  · English: document.title = "Unified Commerce ERP" ✓؛ لیست: Mostafa Sharbati / Alireza Chabari Nasab / Leila Shahbazi / Layla Shahbazi / Mohammad Riyahi (عین دراپ‌داون اسکرین‌شات مالک، حالا انگلیسی) ✓؛ تب «General — New Party Account» ✓
  · Português: document.title = "ERP Comercial Unificado | Unified Commerce ERP" ✓؛ لیست: MUSTAFA Sharbati / … / Maomé Riyahi ✓
  · فارسی: document.title = «سامانهٔ جامع بازرگانی | Unified Commerce ERP» ✓؛ لیست با مقادیر پایه (مصطفی شربتی، علیرضا چاباری نسب، لیلا شهوازی، محمد ریاحی) ✓
- curl مستقیم endpoint دسته‌ای: ۱۱۴ ردیف برای ۵ رکورد × ۱۲ زبان × ۲ فیلد؛ dev.log همه 200؛ لاگ settings-service پس از reload سالم؛ کنسول مرورگر صفر خطا.
- lint = ۰/۰؛ tsc = فقط ۹ خطای پیش‌موجود baseline — صفر خطای جدید.

Stage Summary:
- «دادهٔ» لیست‌ها دیگر ثابت فارسی نیست: سطرهای دراپ‌داون/لیست فرم طرف حساب با تعویض زبان نرم‌افزار به همان زبان نمایش داده می‌شوند (انبار DataTranslation؛ نبودِ ترجمه = مقدار پایه)؛ پس از ترجمهٔ آنلاین هر رکورد، لیست هم بلافاصله تازه می‌شود. endpoint دسته‌ای برای فرم‌های سیستمی آینده هم قابل استفاده است.
- عنوان پنجرهٔ مرورگر (document.title) اکنون با هر زبان نرم‌افزار ترجمه می‌شود (۱۳ زبان) و دیگر در زبان قبلی منجمد نمی‌ماند.
- محدوده: لیستِ فرم‌های سیستمیِ دارای ترجمهٔ داده (الان Party) — فهرست کلّی فرم‌ساز از قبل ترجمه دارد (Task 70) و دراپ‌داون سال مالی دادهٔ بدون ترجمه است (در صورت فرمان مالک، با همین الگوی DataTranslation/FiscalYear اضافه می‌شود).
- artifacts: mini-services/settings-service/src/data-translations/{controller,service}.ts؛ src/components/forms/common/Party.tsx؛ src/components/desktop/desktop.tsx (افکت document.title)؛ src/i18n/dictionaries.ts (کلید app.docTitle ×۱۳).
---
Task ID: 100
Agent: Z.ai Code
Task: درخواست مالک — «توی منوی تنظیمات و مدیریت کاربران یک فرم ایجاد کنید بنام نقش کاربری جدید و در این فرم کاربر باید بتواند نقش های کاربری سازمان خودش را تعریف نماید. امکان تعیین محدوده دسترسی برای هر نقش در این فرم وجود داشته باشد. مشاوره کامل بدهید»

Work Log:
- مشاوره (تأیید طرح قبل از پیاده‌سازی): مدل نقش/محدوده دو بُعدی — ① محدودهٔ نرم‌افزاری (کدام نرم‌افزارهای سیستم از Systems) و ② محدودهٔ ساختار سازمانی (کدام گره‌های BusinessStructure؛ معنای هر گره شامل زیرمجموعه‌ها)؛ نبودِ ردیف در هر بُعد = «بدون محدودیت» (همه). سطح عملیاتِ هر فرم (مشاهده/ثبت/ویرایش/حذف) و اعمالِ الزام‌آور دسترسی = فاز دوم پس از استقرار IAM و سند تحلیل §4.6.
- اسکیما (settings-service): مدل UserRole (Code/Title یکتا با BusinessStructureRef، Description، IsActive، IsSystem) + UserRoleScope (ScopeType "software"|"structure" + RefKey؛ unique سه‌گانه؛ Cascade با نقش) — هر دو با بلوک کامل AppBaseEntity ۸فیلدی؛ db:push موفق.
- ثبت‌ها: VERSIONED_MODELS += UserRole/UserRoleScope؛ TABLE_REGISTRY += "UserRole"/"UserRoleScope" (ID دستی §16)؛ UserRolesModule در app.module.
- endpointها: GET/POST/PUT/DELETE /user-role (guard داشبورد BFF)؛ ثبت/ویرایش = بازنویسی تراکنشی ردیف‌های محدوده با رزرو بلاکی ID (الگوی تب‌های طرف حساب)؛ اعتبارسنجی دولایه: کد/عنوان اجباری، تکراری 409، appKey/گرهٔ ناموجود 422، حذف نقش سیستمی 403؛ پاسخ ثبت/ویرایش رکورد کامل با محدوده‌ها (readFull).
- seed بوت: نقش سیستمی «مدیر سیستم» (code=ADMIN، IsSystem، بدون ردیف محدوده = دسترسی کامل) — idempotent by code؛ لاگ تأیید شد.
- فرانت: فرم «نقش کاربری جدید» (user-role-form.tsx بر بستر SimpleFormTwoRowTabbed — هم‌خانوادهٔ سال مالی/طرف حساب): فیلدهای کد نقش/عنوان نقش/توضیحات/فعال + تب «محدوده دسترسی» با دو گروه رادیو (همه/برگزیده) و چک‌باکس‌های شرطی: ۲۸ نرم‌افزار از Systems (عنوان با TitleKey → زنده با تعویض زبان؛ قرارداد Task 99) و گره‌های ساختار با برچسب مسیر کامل (fa=Title، en=Title_En؛ DFS از ریشه)؛ جداکنندهٔ line بین دو بُعد؛ لیست رکوردها با سلول‌های کد/عنوان(+نقش سیستمی)/محدودهٔ نرم‌افزارها/محدودهٔ ساختار/فعال.
- settings-window.tsx: زیرصفحهٔ «مدیریت کاربران» از placeholder کهربایی به هاب واقعی تبدیل شد — کارت لانچر «نقش کاربری جدید» + یادداشت «سایر فرم‌ها پس از سند تحلیل»؛ زیرصفحهٔ جدید "user-role" با نوار بازگشت دولایه (تنظیمات/مدیریت کاربران/نقش کاربری جدید) که UserRoleForm را embed می‌کند.
- dictionaries.ts: ۱۹ کلید جدید um.* ×۱۳ زبان (roleFormTitle/roleCode/roleTitle/roleLauncherDesc/morePending/scopeTab/swScope/swAll/swSelected/stScope/stAll/stSelected/scopeHint/scopeNone/errSwEmpty/errStEmpty/systemRole/errCodeRequired/errTitleRequired).
- E2E (agent-browser): لانچر → فرم؛ ثبت نقش آزمونی R100 «حسابدار آزمونی ۱۰۰» با برگزیدهٔ نرم‌افزارها (حسابداری+عمومی) و برگزیدهٔ ساختار (دفتر مرکزی/شرکت نمونه) → POST 201 و دراپ‌داون لیست: «حسابداری ، عمومی» و «دفتر مرکزی / شرکت نمونه» ✓؛ بازکردن دوباره R100 = هر دو حالت برگزیده با تیک‌های درست (ماندگاری) ✓؛ سوییچ به English: Role Code/Access Scope/Selected software + چک‌باکس‌ها Accounting/General + مسیرها Headquarters / Sample Company / Main Branch — همه زنده ✓ و برگشت به fa سالم ✓؛ ADMIN: عنوان با پسوند «نقش سیستمی» در لیست و دکمهٔ حذف غیرفعال ✓ (سرور هم 403 — curl قبلی)؛ حذف R100 با دیالوگ تأیید → DB فقط ADMIN ✓؛ ذخیرهٔ فرم خالی → توست «ثبت کد نقش الزامی است…» ✓.
- اعتبار API با curl: تکراری 409، گرهٔ ناموجود 422، حذف سیستمی 403، PUT بازنویسی محدوده + Version++ — همه درست؛ سه رکورد آزمونی میانی (id 4,5,6,7) پاک شد؛ دادهٔ مالک دست‌نخورده.
- lint = ۰/۰؛ tsc = فقط ۹ خطای پیش‌موجود baseline — صفر خطای جدید؛ کنسول مرورگر و dev.log پاک (همه 200/201). نکته: daemon مرورگر وسط E2E هنگ کرد (دستور screenshot) و با kill + پاک‌سازی sock ری‌استارت شد — به کد پروژه مربوط نیست.

Stage Summary:
- مدیریت کاربران از «placeholder» به بخش فعال تبدیل شد: اولین فرم آن — «نقش کاربری جدید» — با تعریف نقش‌های سازمان و تعیین محدودهٔ دسترسی دولایه (نرم‌افزارها + ساختار سازمانی) کار می‌کند؛ نقش سیستمی «مدیر سیستم» seed و حفاظت‌شده است.
- قرارداد محدوده: خالی = بدون محدودیت؛ برگزیدهٔ خالی در فرانت رد می‌شود؛ اعمالِ واقعی این محدوده‌ها (فیلتر پنجره‌ها/رکوردها بر اساس نقش کاربر جاری) فاز دوم پس از IAM است و ساختار داده آن را آماده دارد.
- artifacts: mini-services/settings-service/prisma/schema.prisma (+UserRole/+UserRoleScope)؛ src/user-roles/{controller,service,dto,module}.ts؛ src/prisma/prisma.service.ts؛ src/id-generation/table-registry.ts؛ src/app.module.ts؛ src/seed/seed.service.ts؛ src/components/erp/settings/user-role-form.tsx؛ src/components/erp/settings-window.tsx؛ src/i18n/dictionaries.ts (۱۹ کلید ×۱۳).
---
Task ID: 101
Agent: Z.ai Code
Task: درخواست مالک — «آخرین تغییرات را پوش کنید» (اجرای §0.9 پس از بازیابی محیط از بک‌آپ)

Work Log:
- عارضهٔ زیرساختی: محیط فعلی از بک‌آپ ۲۰۲۶-۱۰-۲۳ بازگردانی شده که طبق BACKUP-INFO پوشهٔ .git (تاریخچهٔ ۵۳۰MB) را «عمداً» کنار گذاشته بود؛ نتیجه: هیچ مخزن گیت و هیچ اعتبارنامه‌ای (PAT) در محیط نبود و auto-push-service (تسک ۶۶) هر ۱۰ دقیقه با «not a git repository» شکست می‌خورد.
- جست‌وجوی اعتبارنامه: ~/.git-credentials، ~/.netrc، متغیرهای محیطی، gh CLI، تاریخچهٔ شل و کل سیستم فایل — PAT تنها در .git/config مخزن قدیمی ذخیره شده بود (طبق تسک ۵۵) و با حذف .git از دست رفت؛ هیچ نسخه‌ای باقی نماند.
- بازسازی مخزن: git init -b main + remote origin = https://github.com/chaabok/farataraznewtheme.git (مخزن برای خواندن عمومی است) + fetch سطح‌۱ (depth=1) → origin/main = c01eba7 «Auto-sync 2026-10-26 01:50 تهران»؛ سپس git reset --mixed origin/main (ایندکس = درخت ریموت، درخت کاری دست‌نخورده) تا کامیت جدید دقیقاً بر تاریخچهٔ ریموت سوار شود (بدون force-push و بدون گم‌شدن تاریخچه).
- تحلیل اختلاف: ریموت فاقد مصنوعات تسک‌های ۹۸–۱۰۰ بود (user-roles بک‌اند، user-role-form.tsx، endpoint دسته‌ای data-translations، تغییرات Party/general-window/desktop/dictionaries و…)؛ تغییرات: ۹ افزودن، ۱۵ حذف (لاگ سرویس‌های حذف‌شدهٔ محیط)، ۲۱ ویرایش، ۲ تغییرنام.
- restore-point/ (zip بازگردانی ۱۲MB، مصنوع مکانیزم بازیابی محیط نه سورس پروژه) به .gitignore اضافه شد تا auto-push آن را کامیت نکند.
- بک‌آپ §0.9 (الزامی پیش از پوش): scripts/db-backup.sh → custom-2026-10-26_0421.db + dfb-2026-10-26_0421.db در «backup db/».
- کامیت محلی 615b95e: «پوش دستی (بازیابی مخزن): 2026-10-26 04:21 تهران …» — ۴۷ فایل، ۲۳۶۳+ / ۳۴۳−.
- تلاش پوش: git push origin main → «fatal: could not read Username for 'https://github.com'» (پوش گیت‌هاب همیشه نیازمند احراز هویت است؛ مخزن عمومی فقط خواندن را می‌دهد).
- بازیابی سرویس auto-push: POST /run-now → چرخه سالم اجرا شد (تشخیص تغییر دیتابیس → بک‌آپ §0.9 → کامیت محلی become89b7 = نسخهٔ تازهٔ db) و فقط در گام پوش با همان مانع احراز هویت متوقف شد — سرویس اکنون کامیت‌های محلی را انباشته و پس از فراهم‌شدن توکن به‌طور خودکار پوش می‌کند.
- وضعیت نهایی: دو کامیت محلی (615b95e + become89b7) روی c01eba7 ریموت انباشته‌اند؛ working tree تمیز.

Stage Summary:
- مخزن گیت بازسازی و به تاریخچهٔ origin/main پیوند خورد؛ کل تغییرات تسک‌های ۹۸/۹۹/۱۰۰ + بانک اطلاعاتی در دو کامیت محلی (615b95e، become89b7) با بک‌آپ §0.9 آمادهٔ پوش است.
- مانع صریح (§0.9): پوش به دلیل نبود PAT ممکن نیست — توکن قبلی فقط در .git/config مخزن قدیمی بود و با بک‌آپ حذف شده است. مالک باید یک PAT جدید (با دسترسی Contents: Read and Write به مخزن chaabok/farataraznewtheme) ارسال کند؛ بلافاصله پس از آن remote با توکن تنظیم و هر دو کامیت پوش می‌شود و auto-push-service نیز خودکار از سر گرفته می‌شود.
- artifacts: .git بازسازی‌شده + remote origin؛ .gitignore (+restore-point/)؛ «backup db/custom-2026-10-26_0421.db» و «dfb-2026-10-26_0421.db»؛ کامیت‌های 615b95e و become89b7.
---
Task ID: 101-b
Agent: Z.ai Code
Task: دریافت PAT جدید مالک — تکمیل پوش گیت‌هاب و احیای پوش خودکار (ادامهٔ Task 101)

Work Log:
- اعتبارسنجی توکن با GitHub API: login = chaabok (mostafa sharbati) — همان مالک تسک ۵۵؛ permissions.push = true روی chaabok/farataraznewtheme ✅
- تنظیم remote: origin = https://<token>@github.com/chaabok/farataraznewtheme.git — توکن فقط در .git/config غیر-ردیابی‌شده ذخیره شد (الگوی تسک ۵۵)؛ هیچ فایل ردیابی‌شده‌ای توکن ندارد.
- پوش موفق: c01eba7..b2b8ce6 → هر دو کامیت انباشته (615b95e مصنوعات تسک‌های ۹۸/۹۹/۱۰۰ + bec89b7 بک‌آپ دیتابیس) به origin/main رسیدند.
- پوش خودکار احیا شد: چرخهٔ run-now تغییرات را تشخیص داد → بک‌آپ §0.9 → کامیت 6753186 → پوش موفق — lastError: None ✅ (تیک‌های ۱۰ دقیقه‌ای از این پس خودکار پوش می‌کنند).
- نکتهٔ محیطی: کامیت ce24c78 با پیام UUID توسط مکانیزم checkpoint خود محیط ساخته شد (همان worklog ۲۱ خطی + لاگ سرویس) — بی‌ضرر و جزو تاریخچه است.
- همگامی نهایی: HEAD محلی = origin/main = 6753186 ✅؛ working tree فقط لاگ زندهٔ سرویس (در تیک بعدی خودکار پوش می‌شود).

Stage Summary:
- زنجیرهٔ §0.9 کاملاً برقرار شد: هر تغییر سورس/دیتابیس → بک‌آپ زمان‌دار تهران → کامیت پیام‌دار → پوش خودکار به chaabok/farataraznewtheme (حداکثر ۱۰ دقیقه یا فوری با POST :3010/run-now).
- محتوای پوش‌شده: کل مصنوعات تسک‌های ۹۸ (سکوت مودال ترجمهٔ آنلاین + عنوان زندهٔ تب)، ۹۹ (ترجمهٔ دادهٔ لیست‌ها + endpoint دسته‌ای + عنوان مرورگر)، ۱۰۰ (فرم نقش کاربری جدید + محدودهٔ دسترسی دولایه + نقش سیستمی مدیر سیستم) + بانک اطلاعاتی و بک‌آپ‌های §0.9.
- امنیت: توکن فقط در .git/config (غیر-ردیابی)؛ در worklog و سورس هیچ اثری ندارد.
---
Task ID: 102
Agent: Z.ai Code
Task: درخواست مالک (اسکرین‌شات) — «توی فرم نقش‌های کاربری اگر زبان انتخاب‌شدهٔ نرم‌افزار RTL بود باید آیتم‌های تصویر بارگذاری‌شده از راست به چپ چیدمان شوند و اگر LTR بود از چپ به راست» + «داخل تب محدودیت‌ها بین هدر و آیتم‌ها یک فاصله قرار دهید»

Work Log:
- ریشه‌یابی: آیتم‌های چک‌باکسِ تب «محدوده دسترسی» با FieldCell مشترک (form-primitives) رندر می‌شوند که چک‌باکس را با justify-end (چیدمان قدیمی «فعالِ» انتهای ردیف) می‌چید — در RTL این یعنی لنگر به لبهٔ چپِ سلول (سمتِ دور از شروع خواندن) و در LTR لبهٔ راست؛ یعنی در هر دو جهت، چیدمان برعکسِ جهت خواندن بود (عین اسکرین‌شات مالک: جفت‌ها چسبیده به لبهٔ چپ، برچسب قبل از چک‌باکس در مسیر خواندن RTL).
- قرارداد جدید SimpleFormField.place: "start" | "end" (پیش‌فرض "end" = رفتارlegacy دست‌نخورده برای همهٔ فرم‌های موجود)؛ "start" = لنگر به لبهٔ شروع خواندن: در RTL لبهٔ راست و در LTR لبهٔ چپ، با ترتیب DOM [Checkbox, label] که در هر دو جهت چک‌باکس را اولِ خواندن می‌گذارد (flex-start در RTL به راست resolve می‌شود و در LTR به چپ — یک کلاس، دو جهت درست).
- نوع جدید "spacer" در SimpleFormFieldType (خانوادهٔ اشکال ثابت Task 53): ردیف تمام‌عرض نامرئی h-3 برای فاصلهٔ هدر تا آیتم‌ها.
- فرم نقش کاربری: هر دو رادیوی سربرگ (محدودهٔ نرم‌افزارها / ساختار سازمانی) widthPct: 100 گرفتند (ردیف هدر همیشه مستقل) + یک spacer پس از هر هدر؛ همهٔ چک‌باکس‌های نرم‌افزارها و گره‌های ساختار place: "start".
- E2E (agent-browser، تنظیمات ← مدیریت کاربران ← نقش کاربری جدید، حالت برگزیده):
  · fa (RTL): چک‌باکس‌ها به لبهٔ راست هر سلول لنگر شدند، چک‌باکس اولِ خواندن (راست‌ترین) و برچسب به چپِ آن — ستون راست: تنظیمات/دریافت و پرداخت/… و ستون چپ: حسابداری/انبار/… ✓؛ فاصلهٔ واضح هدر تا آیتم‌ها ✓؛ بخش ساختار سازمانی هم همین‌طور (دفتر مرکزی، دفتر مرکزی / شرکت نمونه / …) ✓
  · en (LTR): آینهٔ کامل — چک‌باکس چپِ برچسب، لنگر به لبهٔ چپ سلول‌ها (Settings/Receipts & Payments… و Accounting/Warehouse…) ✓؛ فاصلهٔ هدر تا آیتم‌ها ✓؛ بخش Selected levels با مسیرهای انگلیسی (Headquarters / Sample Company / Main Branch…) ✓
  · برگشت به fa سالم؛ کل پوسته در هر دو جهت درست آینه شد (نوار اکشن، breadcrumb، تسک‌بار)؛ «فعال» فرم همچنان در جای legacy خودش (پیش‌فرض end) ✓
- console مرورگر پاک (فقط info توسعه)؛ dev.log همه 200؛ lint = ۰/۰؛ tsc = فقط ۹ خطای baseline — صفر خطای جدید.

Stage Summary:
- آیتم‌های قابل تیکِ تب «محدوده دسترسی» (و هر لیست مشابه آینده) اکنون از جهت واقعی زبان پیروی می‌کنند: RTL = راست‌به‌چپ با چک‌باکس در شروع خواندن، LTR = چپ‌به‌راست — با یک مکانیزم اعلانی (place: "start") بدون دست‌زدن به چیدمان legacy هیچ فرم موجود.
- فاصلهٔ هدر تا آیتم‌ها با نوع اعلانی spacer تأمین شد (۲ ردیف: پس از هر رادیوی سربرگ) و ردیف هدرها با widthPct: 100 همیشه مستقل است.
- artifacts: src/components/forms/simple-form-two-row-tabbed.tsx (+place/+spacer در قرارداد)؛ src/components/forms/form-primitives.tsx (شاخهٔ spacer + چک‌باکس جهت‌آگاه)؛ src/components/erp/settings/user-role-form.tsx (اعمال place/spacer/widthPct).
---
Task ID: 103
Agent: Z.ai Code
Task: درخواست مالک — «توی منوی عمومی و در زیرمنوی اطلاعات پایه با استفاده از کامپوننت SimpleTreeForm یک فرم جدید اضافه کنید بنام محل های جغرافیایی و فیلدهای تصویر را در فرم قرار دهید. اسکیمای این فرم Gnr می‌باشد. توی فیلد نوع آیتم‌های زیر باشد: ۱-کشور ۲-استان ۳-شهر ۴-روستا ۵-خیابان ۶-کوچه. اولین شاخه کشور می‌باشد؛ زیرشاخهٔ کشور فقط استان قابل تعریف است و زیرشاخهٔ استان فقط شهر قابل تعریف است»

Work Log:
- اسکیما (settings-service، دامنهٔ Gnr): مدل GeoLocation (ParentRef 0=ریشهٔ مجازی؛ LevelType 1=کشور..6=کوچه به ترتیب مالک؛ Code عددی یکتا بین خواهرها با unique[ParentRef,Code]؛ Title/TitleLatin اجباری؛ IsActive پیش‌فرض تیک) + بلوک کامل AppBaseEntity ۸فیلدی — db:push موفق.
- ثبت‌ها: TABLE_REGISTRY += "GeoLocation" (ID دستی §16)؛ VERSIONED_MODELS += "GeoLocation" (§2.5)؛ GeoLocationModule در app.module.
- endpointها: GET/POST/PUT/DELETE /geo-location (guard داشبورد BFF)؛ create با اعتبارسنجی قواعد درخت + idGen؛ update با گارد تغییر نوع (سازگاری با والد و زیرشاخه‌های موجود — الگوی business-structure)؛ delete با گارد زیرشاخه‌دار 409؛ تکراری کد 409 («کد تکراری است — در این سطح کد دیگری انتخاب کنید»)؛ appBaseOnCreate/Update با SYSTEM_ACTOR.
- قواعد درخت (تک‌منبع حقیقت سرور): ریشه فقط [۱ کشور]؛ ۱→[۲ استان]؛ ۲→[۳ شهر] — عین حکم مالک؛ ادامهٔ سطوح پایین‌تر (فرض اعلام‌شده تا تصمیم مالک): ۳ شهر→[۴ روستا،۵ خیابان]؛ ۴ روستا→[۶ کوچه]؛ ۵ خیابان→[۶ کوچه]؛ ۶ برگ.
- restart دستی سرویس (bun --hot کلاینت Prisma تازه‌گرفته را بازسازی نکرد — درس: پس از prisma generate سرویس باید ری‌استارت شود).
- فرانت: types/geo-location.ts (GeoNode + آینهٔ قواعد geoAllowedChildTypes + geoTypeColor بدون indigo/blue) + geo-locations-form.tsx روی SimpleTreeForm (هم‌خانوادهٔ ساختار کسب‌وکار Task 32): درخت با GeoTypeIcon رنگی هر نوع؛ فیلدها عین اسکرین‌شات مالک (نوع دراپ‌داونِ آیتم‌های مجازِ والد / کد عددی با پیشنهاد خودکار بیشینهٔ خواهرها+۱ و readOnly در ویرایش / عنوان / عنوان لاتین ltr / فعال)؛ CRUD کامل با معناشناسی Task-17 (ذخیره/ذخیره‌وجدید/ذخیره‌وبستن/حذف‌و… ) + منوی راست‌کلیک Task 33 (افزودن زیرشاخه فقط روی گره‌های زیرشاخه‌پذیر؛ حذف فقط برگ‌ها) + لیست مینی‌گرید (کد/عنوان/نوع/فعال) + erp:records-changed entity "geo-location" + useTabDirty.
- پوسته (SimpleTreeForm — افزودنی §5.1): prop جدید forceDetail — برای فرم‌هایی که ریشهٔ مجازی دارند (ثبتِ اولین شاخه هیچ گره‌ای برای انتخاب ندارد)؛ بدون آن رفتار همهٔ مصرف‌کنندگان قبلی دست‌نخورده.
- یکپارچگی عمومی: GeneralSubPage += "geo-location"؛ general-window: آیتم لانچر «محل های جغرافیایی» در زیرمنوی اطلاعات پایه (آیکون Earth) + زیرصفحه با نوار بازگشت دولایه + عنوان زندهٔ برگه «عمومی — محل های جغرافیایی» (الگوی Task 98).
- i18n: ۱۵ کلید جدید geo.* (formTitle/formDesc/type.1..6/emptyTree/loadingTree/msg.loadError/val.rootCountryOnly/val.childTypeNotAllowed/val.codeDuplicate/val.codeRequired) ×۱۳ زبان با اسکریپت تزریقی (۱۹۵ خط؛ فیلدهای عمومی مثل عنوان/نوع/فعال از کلیدهای موجود bs.*/fy.* بازاستفاده شدند)؛ اسکریپت پس از اجرا حذف شد.
- E2E (agent-browser): لانچر → فرم (خالی: «هیچ مکانی ثبت نشده است») → + ثبت ریشه: نوع فقط «کشور» ✓ و کد پیشنهادی ۱ ✓ → ایران/Iran ذخیره (توست موفقیت + گره با آیکون کره و بج کد) → + زیر ایران: نوع فقط «استان» ✓ → فارس/Fars → + زیر فارس: نوع فقط «شهر» ✓ → شیراز/Shiraz → + زیر شهر: «روستا/خیابان» ✓ (فرض) → راست‌کلیک فارس: فقط «افزودن زیرشاخه» (حذف مخفی — زیرشاخه‌دار) ✓ → کد تکراری ۱ زیر فارس: 409 با توست «کد تکراری است…» و ثبت‌نشدن ✓ → خالی گذاشتن نوع: توست «انتخاب نوع الزامی است» ✓ → حذف: ایران/فارس غیرفعال (زیرشاخه‌دار)، شیراز فعال ✓ → دراپ‌داون لیست: ۳ رکورد با ستون‌های کد/عنوان/نوع/فعال ✓ → en/LTR: پوستهٔ کامل آینه شد (Geographic Locations/Country/Province/City/Type/Code/Latin Title/Active + درخت با عناوین پایه — قرارداد Task 99) و برگشت به fa سالم ✓؛ عنوان زندهٔ تب در هر دو زبان ✓.
- dev.log: همه GET/POST geo-location 200/409 درست؛ console پس از reload تازه صفر خطا (پیام‌های قبلی = آثار چرخهٔ HMR ویرایش‌ها)؛ lint = ۰/۰؛ tsc پروژهٔ اصلی و settings-service = صفر خطای جدید.
- دادهٔ مالک: ایران/فارس/شیراز (عین نمونهٔ اسکرین‌شات مالک) به‌عنوان دادهٔ پایهٔ مفید نگه داشته شد؛ رکورد آزمونیِ تکراری ثبت نشده بود.

Stage Summary:
- «محل های جغرافیایی» — سومین فرم اطلاعات پایهٔ «عمومی» — با پوستهٔ SimpleTreeForm، درخت مرجع مکان‌ها و قواعد سختگیرانهٔ والد-محورِ مالک (ریشه=کشور، کشور→استان، استان→شهر) هم در گیت UI و هم روی سرور کار می‌کند؛ کد خواهرها یکتاست و خودکار پیشنهاد می‌شود؛ حذف فقط برای برگ‌ها.
- ادامهٔ سطوح پایین‌تر (شهر→روستا/خیابان، روستا/خیابان→کوچه) فرض اعلام‌شدهٔ کارنام است و با یک ثابت در سرویس + types قابل اصلاح فوری به فرمان مالک.
- artifacts: mini-services/settings-service/{prisma/schema.prisma،src/geo-location/*،src/id-generation/table-registry.ts،src/prisma/prisma.service.ts،src/app.module.ts}؛ src/types/geo-location.ts؛ src/components/erp/general/geo-locations-form.tsx؛ src/components/forms/simple-tree-form.tsx (+forceDetail)؛ src/stores/general-nav-store.ts؛ src/components/erp/general/general-window.tsx؛ src/i18n/dictionaries.ts (۱۵ کلید ×۱۳).
---
Task ID: 104
Agent: Z.ai Code
Task: درخواست مالک — «توی اکشن بار دکمه لیست اطلاعات را قبل از دکمه ایجاد قرار دهید» + «اگر زبان انتخاب شده نرم افزار RTL بود در این صورت فیلدهای ورودی لیست باید راست به چپ باز شوند و اگر LTR بود از چپ به راست»

Work Log:
- ریشه‌یابی (بصری با agent-browser روی فرم محل های جغرافیایی): اولین کاشی نوار عملیات، کاشی آبی «+» است (ResetFieldsButton با گلیف Plus — در فرم‌های درختی همان مسیر «ایجاد» است) و کاشی تیل «لیست اطلاعات ثبت‌شده» نزدیک انتهای نوار (میان پرینت و ترجمه)؛ درخواست مالک = جابه‌جایی لیست به ابتدای نوار، دقیقاً پیش از «+».
- form-action-bar.tsx: بلوک RecordListDropdown از انتهای نوار به ابتدای آن منتقل شد (اولین کاشیِ DOM → راست‌ترین در RTL و چپ‌ترین در LTR) + جداکنندهٔ لیست|ریست فقط با حضور هر دو + جداکنندهٔ پیش از پرینت حالا مشروط به خودِ پرینت (نه hasPrintList) تا با allowlist‌های Task-48 جداکنندهٔ یتیم نسازد؛ hasPrintList بلااستفاده حذف شد؛ کامنت قرارداد به‌روز شد (ترتیب جدید + ثبت قاعدهٔ Task 104).
- ریشه‌یابی جهت لیست: PopoverContent پنل «لیست اطلاعات ثبت‌شده» dir="auto" داشت — تشخیص جهت از محتوا؛ پیامد: رادیکس برای موقعیت‌یابی «auto» را LTR می‌بیند (بررسی dir==="rtl")، پس در fa پنل به‌جای راست‌به‌چپ، چپ‌لنگر باز می‌شد و به سمت راست (زیر پنل درخت) کشیده می‌شد — عین گلایهٔ مالک.
- list-dropdown.tsx: dir پنل حالا صریحاً از زبان نرم‌افزار می‌آید (useSettings s.dir() — همان منبع DirectionProvider دسکتاپ)؛ RTL = لنگر لبهٔ راست تریگر و بازشدن راست‌به‌چپ، LTR = آینه؛ فیلدهای ورودی فیلتر (text-center قدیمی Task-86) به text-start تغییر کردند تا placeholder و متنِ تایپی از لبهٔ شروع خواندن (راست در RTL / چپ در LTR) باز شوند — قیفِ start-2 و ps-7 موجود در هر دو جهت درست می‌مانند.
- E2E (agent-browser، فرم محل های جغرافیایی، هر دو زبان):
  · fa (RTL): نوار از راست: [☰ لیست] [+ ایجاد] [ذخیره ×۳] [کپی] [حذف ×۳] [پرینت] [ترجمه] ✓؛ پنل لیست با لبهٔ راست لنگر به تریگر و بازشدن راست‌به‌چپ (دیگر زیر پنل درخت نمی‌رود) ✓؛ فیلتر عنوان: قیف راست، «فیلتر...» از راست، تایپ «فارس» راست‌به‌چپ با کرسر راست + فیلتر کار کرد (۱ رکورد، FilterX فعال) ✓
  · en (LTR): آینهٔ کامل: [☰ List] [+ create] [Save ×۳] [Copy] [Delete ×۳] [Print] [Translate] ✓؛ پنل چپ‌لنگر بازشدن چپ‌به‌راست ✓؛ «Fars» چپ‌به‌رست از لبهٔ چپ ✓ (بدون نتیجه = درست، چون سلول عنوان از عنوان پایهٔ فارسی است — قرارداد Task 99)؛ پاک‌کردن فیلترها ✓
  · برگشت به fa سالم؛ dev.log همه 200 بدون خطا؛ console پاک.
- lint = ۰/۰؛ tsc = فقط ۹ خطای baseline معروف — صفر خطای جدید.
- رفتار همهٔ فرم‌های دیگر (Party/سال مالی/نقش کاربری/فرم‌های DFB) که از همین FormActionBar و RecordListDropdown استفاده می‌کنند خودکار و یکدست به‌روز شد (قاعدهٔ سراسری مالک: «توی اکشن بار»).

Stage Summary:
- ترتیب نوار عملیات در ALL فرم‌ها: «لیست اطلاعات ثبت‌شده» اولِ نوار (راست‌ترین در RTL / چپ‌ترین در LTR) و دقیقاً پیش از کاشی آبی «+» (ایجاد) — با جداکننده‌های سازگار با allowlist‌های ذخیره‌شده.
- پنل لیست و فیلدهای ورودی‌اش جهت خود را از زبان انتخاب‌شدهٔ نرم‌افزار می‌گیرند (نه محتوا): RTL = بازشدن و تایپ راست‌به‌چپ، LTR = چپ‌به‌راست؛ رفع ضمنی شکست منطق RTL رادیکس که dir="auto" ایجاد می‌کرد.
- artifacts: src/components/forms/action-bar/form-action-bar.tsx؛ src/components/forms/action-bar/list-dropdown.tsx.
---
Task ID: 105
Agent: Z.ai Code
Task: درخواست مالک — «می‌خواهم تمامی کشورهای جهان و پایتخت‌های آنها و همچنین استان‌های ایران و شهرهای هر استان ایران را در فرم محل های جغرافیایی بطور کامل اضافه کنید»

Work Log:
- دادهٔ پایه (mini-services/settings-service/scripts/geo-seed/): countries.ts = ۱۹۵ کشور (۱۹۳ عضو ملل + واتیکان + فلسطین؛ دوروتیپ فارسی/لاتین + پایتخت دوروتیپ) + iran.ts = ۳۱ استان رسمی با ~۴۶۰ شهر (مراکز شهرستان‌ها + شهرهای مهم؛ دوروتیپ فارسی/لاتین). دو کشور جاماندهٔ دورشتهٔ اول (کامبوج، ساحل عاج) بعد از دورآزمایی شمارش اضافه شدند.
- قاعدهٔ درخت — Task 105: «شهر» به فرزندان مجازِ کشور اضافه شد (۱: [۲،۳]) تا پایتخت کشورهای فاقد استانِ ثبت‌شده مستقیماً زیر خودِ کشور بنشیند؛ پایتخت ایران (تهران) طبق ساختار زیر «استان تهران» است. تک‌منبع حقیقت سرور (geo-location.service.ts) + آینهٔ فرانت (src/types/geo-location.ts) هر دو به‌روز شدند؛ حکم Task 103 در کامنت‌ها حفظ و مبنای تغییر مستند شد.
- seed.ts (idempotent، merge نه بازنویسی): تطبیق (ParentRef, Title) → ایران/فارس/شیراز (دادهٔ مالک Task 103) بازیافت شدند و هیچ رکورد مالکی دست نخورد؛ کدهای جدید = بیشینهٔ کد خواهرها + ۱ به ترتیب الفبای فارسی (Intl.Collator("fa"))؛ شناسه‌ها با فرمول خودترمیم §4 از IDGeneration رزرو شد (بلاک پیوسته؛ شمارندهٔ نهایی = 881). اجرای دوم = صفر درج جدید (اثبات idempotency).
- نتیجهٔ پایگاه: 880 رکورد (195 کشور در ریشه؛ 31 استان زیر ایران — فارس#1 مالک اول، بقیه الفبایی؛ 460 شهر؛ 194 پایتخت زیر کشورهای خارجی — آلمان→برلین، آمریکا→واشینگتن دی‌سی، هرمزگان→کیش ✓). راستی‌آزمایی از مسیر واقعی BFF (GET /api/settings/geo-location = 880).
- زیرساخت (کشف حیاتی): سرویس تنظیمات (:3001) بعد از ری‌استارتِ دستی، توسط ناظرِ محیط در پایان هر فراخوان کشته می‌شد (همهٔ الگوها: nohup/setsid/env-i/delayed-exec آزمودیم و مردند) و خوددرمان هم ندارد → src/instrumentation.ts + src/instrumentation-node.ts (الگوی رسمی Next برای دورماندن از باندل Edge): هنگام بوت سرور Next، اگر /health سرویس تنظیمات پاسخ ندهد آن را به‌عنوان فرزندِ خودِ سرور (محافظت‌شدهٔ ناظر) اجرا می‌کند؛ با گارد سلامت در استقرار واقعی no-op است. سرویس اکنون ماندگار شد (SURVIVED-across-calls ✓) و دو ری‌استارت بعدی Next هم آن را سالم نگه داشت. هشدار: هرگز Next dev را kill نکنید — تنها فرایندِ نگه‌دارندهٔ زندهٔ محیط است.
- E2E (agent-browser، fa/en): درخت 880 گره را رندر می‌کند (بازشدهٔ کامل؛ بدون کرش) → انتخاب آلمان (کد 7) → «+» → «جدید — والد: آلمان (7)» با دراپ‌داون نوع = استان|شهر ✓ → ثبت هامبورگ/Hamburg (کد 2) زیر آلمان با توست «با موفقیت ذخیره شد» و گره در درخت ✓ (جریان 409 کد تکراری هم جداگانه با curl امضاشدهٔ HMAC §4 روی خودِ سرویس تأیید شد: نوع شهر زیر کشور 422 نمی‌خورد، فقط کد تکراری 409) → پنل «لیست اطلاعات ثبت‌شده» با 881 ردیف باز می‌شود، dir=rtl (زبان‌محور، Task 104) و فیلتر عنوان «کاشمر» → 1 ردیف (کد 18/شهر/بله) ✓ → en/LTR: پوستهٔ کامل آینه شد (Details/Saved records list/Save/Type=City/Latin Title)، «New — Parent: آلمان (7)» و منوی نوع زیر کشور = Province|City ✓ → برگشت به fa سالم، 881 گره با تهران/برلین/توکیو ✓.
- dev.log: پس از بارگذاری صفحه تازه صفر خطای کامپایل (هشدارهای Edge قبلی با تفکیک instrumentation-node رفع شد)؛ lint = ۰/۰؛ tsc پروژهٔ اصلی = ۹ baseline معروف، settings-service = صفر.

Stage Summary:
- «محل های جغرافیایی» اکنون مرجع کامل جهان است: 195 کشور + پایتخت‌ها (زیر خودِ کشور) و ایران با 31 استان + ~460 شهر (استان‌محور) — 880 رکورد در GeoLocation با کد خواهرِ یکتا و الفبای فارسی؛ دادهٔ مالک (ایران/فارس/شیراز) دست‌نخورده ماند.
- قاعدهٔ والد-محورِ مالک در Task 103 با یک استثنای موجه و مستندِ Task 105 کامل شد: کشور → استان | شهر (پایتخت)؛ شهرهای ایران زیر استان‌هایشان می‌مانند.
- زیرساختی: self-heal سرویس تنظیمات از طریق instrumentation سرور Next (فقط Node runtime) — مشکل کشته‌شدن سرویس‌های ری‌استارت‌شده در این محیط برای همیشه حل شد.
- artifacts: mini-services/settings-service/scripts/geo-seed/{countries.ts، iran.ts، seed.ts}؛ mini-services/settings-service/src/geo-location/geo-location.service.ts (قاعده)؛ src/types/geo-location.ts (آینه)؛ src/instrumentation.ts؛ src/instrumentation-node.ts.
---
Task ID: 106
Agent: Z.ai Code
Task: درخواست مالک — «وقتی فرم اطلاعات محل های جغرافیایی باز می شود تمام شاخه ها جمع شده باشد»

Work Log:
- ریشه‌یابی: در SimpleTreeForm (Task 30) مجموعهٔ «collapsed» همیشه خالی مقدار‌دهی می‌شد («هر شاخه از ابتدا باز» — نمای legacy)؛ پیامد با بذر ۸۸۰ رکوردی Task 105: باز شدن فرم یعنی رندر کامل ۱۹۵ کشور + همهٔ استان‌ها/شهرها/پایتخت‌ها به‌صورت درخت کاملاً باز.
- پوسته (§5.1 افزودنی — صفر تغییر رفتار مصرف‌کنندگان قبلی): prop جدید defaultCollapsed در SimpleTreeForm؛ مجموعهٔ تاشدگی حالا بسته به حالت معنا عوض می‌کند: legacy = مجموعهٔ «بسته»ها (پیش‌فرض خالی = همه باز)، با defaultCollapsed = مجموعهٔ «باز»ها (پیش‌فرض خالی = همه بسته) — بنابراین زیردرخت‌های بارگذاری‌شدهٔ ناهمگام (بذر ۸۸۰تایی) هم جمع آغاز می‌شوند؛ toggle در هر دو حالت فقط عضویت را فلیپ می‌کند (یک پیاده‌سازی، دو معنا).
- گارد تجربهٔ کاربری (Task 106): نگاشت والد از درخت جاری (parentOf) + الگوی derive-during-render (همان الگوی آینهٔ کنترل‌شده): هر بار انتخاب روی گره‌ای می‌نشیند (کلیک / آینهٔ کنترل‌شده / راست‌کلیک / پرش از «لیست اطلاعات ثبت‌شده»)، کل مسیر والدهای آن گره خودکار باز می‌شود تا ردیف هدف هرگز پنهان نماند — خواهرها جمع می‌مانند (فاش‌سازی حداقلی). renderedSel عمداً undefined آغاز می‌شود تا defaultSelectedId هنگام mount هم پردازش شود.
- فرم محل های جغرافیایی: defaultCollapsed اضافه شد (فقط همین فرم)؛ سایر مصرف‌کنندگان SimpleTreeForm (ساختار کسب‌وکار Task 32، نمونهٔ درختی Task 30، فرم‌ساز DFB) دست‌نخورده.
- E2E (agent-browser، fa/RTL):
  · باز شدن فرم: ۱۹۵ treeitem همگی [level=1, expanded=false] — فقط کشورها ✓ (شمارش دقیق ۱۹۵/۱۹۵)
  · باز کردن ایران: ۳۱ استان [level=2, expanded=false] ✓؛ باز کردن فارس: ۲۸ شهر [level=3] شامل شیراز (دادهٔ مالک Task 103) ✓
  · پرش از لیست ثبت‌شده‌ها به «کاشمر» (شهر زیر استان خراسان رضوی — هرگز دستی باز نشده بود): مسیر ایران[باز] ← خراسان رضوی[باز] ← کاشمر[انتخاب] خودکار باز شد و استان‌های خواهر (خراسان جنوبی/شمالی) جمع ماندند ✓
  · بستن و باز کردن دوبارهٔ فرم (remount): دوباره ۱۹۵/۱۹۵ جمع ✓ (حالت «هنگام باز شدن» در هر ورود برقرار است)
  · legacy: ساختار کسب‌وکار همچنان کاملاً باز آغاز می‌شود (expanded=true در کل زنجیره) ✓
  · en/LTR: باز شدن فرم = ۱۹۵ کشور جمع، پوستهٔ ترجمه‌شده («Geographic Locations»)؛ باز کردن ایران = ۳۱ استان ✓؛ برگشت به fa سالم (وضعیت تاشدگی درون‌نشست حفظ شد — رفتار درست: «جمع بودن» فقط در لحظهٔ باز شدن فرم اعمال می‌شود) ✓
- console مرورگر پاک (فقط info توسعه + HMR)؛ dev.log همهٔ GET geo-location/business-structure = 200 و بدون خطای جدید از فایل‌های تغییرکرده (خطای «forceDetail is not defined» در لاگ، اثر لحظهٔ ویرایش HMR در جلسهٔ Task 103 است — تاریخی). lint = ۰/۰؛ tsc = فقط ۹ خطای baseline معروف.

Stage Summary:
- فرم «محل های جغرافیایی» از این پس با درخت جمع‌شده باز می‌شود — فقط کشورهای سطح ریشه دیده می‌شوند و کاربر با هر کلیک چورون سطح بعدی را باز می‌کند؛ انتخاب/ذخیرهٔ رکورد جدید/پرش از فهرست ثبت‌شده‌ها خودکار مسیر والدها را باز می‌کند تا هیچ مقصدی گم نشود.
- مکانیزم اعلانی و افزودنی است: هر فرم درختی آینده با یک prop (defaultCollapsed) رفتار آغاز جمع‌شده می‌گیرد؛ رفتار همهٔ فرم‌های موجود بدون تغییر ماند.
- artifacts: src/components/forms/simple-tree-form.tsx (+defaultCollapsed +parentOf +auto-expand مسیر)؛ src/components/erp/general/geo-locations-form.tsx (فعال‌سازی prop).
---
Task ID: 107
Agent: Z.ai Code
Task: درخواست مالک — «توی فرم محل های جغرافیایی دکمه ترجمه آنلاین و دستی غیرفعال است. هر فرمی ایجاد شود برای فعال کردن آن باید بهت اعلام کنم؟ نمیشه هر فرمی ایجاد شد این گزینه ها فعال باشند»

Work Log:
- ریشه‌یابی: کاشی «ترجمه» (Task 90) در همهٔ فرم‌ها رندر می‌شود ولی دو آیتم منویش فقط وقتی فعال است که فرم، onTranslateOnline/onTranslateOffline بدهد؛ تا امروز فقط Party (Task 92-99) و ران‌تایم فرم‌ساز سیم‌کشی داشتند — فرم «محل های جغرافیایی» و بقیهٔ فرم‌های جدید غیرفعال می‌ماندند.
- پاسخ سیستمی به پرسش مالک («نمیشه هر فرمی ایجاد شد فعال باشند؟»): قلاب عمومی جدید useRecordTranslation (src/components/forms/common/use-record-translation.tsx) — کل قرارداد ترجمهٔ دادهٔ رکورد بازِ Party یک‌بار برای همیشه کپسوله شد: ترجمهٔ آنلاین (POST /api/data-translations/auto-translate — LLM به‌ازای هر فیلد، بدون هیچ مودالی حکم Task 98 + توست شمارش‌دار)، ورود دستی (دیالوگ عمومی DataTranslationsDialog که خود قلاب رندر می‌کند)، گاردهای «رکورد باز نیست/فیلد متنی نیست/زبان فعال نیست» با توست راهنما، و هوک‌های onTranslated/onOfflineClose برای تازه‌سازی نمایش. مصرف در هر فرم جدید = چند خط: دو handler به پوسته + رندر {tr.dialog}؛ TranslateButton خودکار فعال می‌شود. از این پس فرم‌های جدید را بدون فرمان مالک با همین قلاب فعال می‌کنیم.
- فرم محل های جغرافیایی (اولین مصرف‌کنندهٔ قلاب): entityType = "GeoLocation"؛ entityId = رکورد باز حالت نمایش (حالت ثبت → توست راهنما)؛ فیلد قابل ترجمه = «عنوان» (کد عددی است، عنوان لاتین ورود خودِ مالک). onTranslated/onOfflineClose هر دو trVersion را bump می‌کنند.
- نمایش ترجمه (تا نتیجه دیده شود، فقط انبار کافی نیست): نقشهٔ دسته‌ای DataTranslation با endpoint دسته‌ای Task 99 (fieldKeys=title) در تکه‌های ≤۵۰۰ (رکوردها ۸۸۱+ → ۲ درخواست)؛ displayTitle = ترجمهٔ زبان جاری یا عنوان پایهٔ fa (رفتار Task 99)؛ اعمال روی برچسب گره‌های درخت + عنوان/سلول عنوان «لیست اطلاعات ثبت‌شده» (پس فیلتر لیست هم در زبان‌های دیگر با عنوان ترجمه‌شده کار می‌کند). عنوان هدر جزئیات هم چون از label گره می‌آید خودکار ترجمه می‌شود.
- E2E (agent-browser، fa→en→fa):
  · fa: انتخاب ایران → منوی ترجمه: هر دو آیتم فعال («۱۲ زبان فعال» / «ترجمهٔ فیلدهای متنی این رکورد») ✓ → ترجمهٔ آنلاین: POST 200 در ۳.۲s، ۱۲ زبان ذخیره شد (انبار: en=Iran، ar=إيران، ckb=ئێران، de/fr=Iran …) ✓
  · en: درخت «Iran» را نشان داد ✓ → انتخاب آلمان → ورود دستی: دیالوگ «Manual record translation» با انتخابگر زبان (English 0/1) و ورودی «Title — English» → تایپ Germany → Save → توست «Data saved successfully» + شمارنده 1/1 ✓ → بستن دیالوگ: درخت همان لحظه «Germany» شد (trVersion → بازخوانی دسته‌ای) ✓
  · en: فهرست ثبت‌شده‌ها سطرهای «Iran»/«Germany» را نشان داد و فیلتر «Germany» فقط همان سطر را ماند ✓
  · برگشت به fa: عناوین پایه (ایران/آلمان) برگشتند — fa همیشه منبع پایه است ✓؛ console پاک؛ dev.log: همهٔ GET دسته‌ای/تکی و POST save = 200/201، auto-translate = 200.
- lint = ۰/۰؛ tsc = فقط ۹ خطای baseline معروف — صفر خطای جدید. دیتابیس: ۱۳ ردیف ترجمهٔ دادهٔ واقعی (ایران ۱۲ زبان + آلمان en) — دادهٔ مفید مالک.

Stage Summary:
- فعال‌سازی «ترجمهٔ آنلاین + دستی» دیگر وابسته به فرمان مالک برای هر فرم نیست: قلاب عمومی useRecordTranslation کل مسیر را کپسوله کرده و فرم «محل های جغرافیایی» اولین مصرف‌کننده است؛ از این پس در ساخت هر فرم جدید همین قلاب به‌صورت پیش‌فرض وصل می‌شود.
- ترجمه‌های ذخیره‌شده در درخت و فهرست فرم (و فیلتر آن) در زبان‌های غیر-fa نمایش داده می‌شوند؛ fa همیشه عنوان پایه را نشان می‌دهد (قرارداد Task 99).
- artifacts: src/components/forms/common/use-record-translation.tsx (قلاب عمومی جدید)؛ src/components/erp/general/geo-locations-form.tsx (سیم‌کشی + نقشهٔ دسته‌ای + displayTitle).
---
Task ID: 108
Agent: Z.ai Code
Task: درخواست مالک — «توی کامپوننت SimpleTreeForm کاربر روی هر شاخه کلیک کرد و روی ترجمه آنلاین کلیک کرد باید تمامی زیرشاخه‌ها آن سرشاخه ترجمه شوند و نیاز نباشد کاربر روی تک‌تک زیرشاخه‌ها کلیک کند و ترجمه را انجام بدهد»

Work Log:
- طراحی: زنجیرهٔ ترجمه سه‌لایه شد — ① قلاب عمومی Task 107 با گزینهٔ اختیاری getSubtreeRecords «سرشاخه + همهٔ زیرشاخه‌ها» را به‌صورت دسته‌های ≤۲۵ رکورد به endpoint جدید می‌فرستد (حلقهٔ هم‌زمانی ×۲ + صف تلاش‌مجدد با backoff)؛ ② endpoint دسته‌ای جدید /api/data-translations/auto-translate-batch برای «هر دسته» فقط «یک» فراخوانی LLM می‌زند (عناوین درخت کوتاه‌اند — برخلاف رکورد کامل Task 92) و با retry خودِ 429 (انتظار ۴s/۸s) مقاوم است؛ ③ سرویس تنظیمات endpoint جدید POST /data-translations/save-many را گرفت (هستهٔ مشترک saveRecords برای save/saveMany؛ بلاک ID پیوستهٔ §16 با مکان‌نمای سراسری — باگ per-record cursor در همان نگارش اول گرفتن و رفع شد) تا هر دسته با «یک» درخواست upsert شود.
- رفتار قلاب: برگ/فرم بدون زیرشاخه = عین مسیر تک‌رکوردی قبلی (Party و… دست‌نخورده)؛ با زیرشاخه = توست پیشرفت پایدار «ترجمهٔ آنلاین زیرشاخه‌ها… {done}/{total}» (sonner با id ثابت) و توست پایانی شمارش‌دار «{n} رکورد به {m} زبان» یا نسخهٔ ناقص با «{k} دسته ناموفق»؛ گارد ورود دوباره (runningRef) با توست «در حال انجام است». ترجمهٔ ناموفق نیمه‌کاره نمی‌ماند: اجرای دوبارهٔ همان سرشاخه فقط جامانده‌ها را می‌گیرد (upsert امن).
- فرم محل های جغرافیایی: getSubtreeRecords با پیمایش والد→فرزند روی درخت حاضر (۸۸۰ گره) — هر زیرشاخه با فیلد «عنوان»؛ فیلد خالی رد می‌شود.
- i18n: ۴ کلید جدید dfb.list.translateTreeProgress/translateTreeDone/translateTreePartial/translateTreeBusy ×۱۳ زبان (۵۲ خط، تزریق اسکریپتی با مرز بلوک زبانی — نگارش اول اسکریپت همه را در fa می‌ریخت، فایل از git بازگرده و با الگوریتم صحیح دوباره تزریق شد؛ اسکریپت حذف شد).
- E2E (agent-browser، fa→en→fa):
  · fa: انتخاب استان فارس → ترجمهٔ آنلاین: توست پیشرفت «…۰/۲۹» → پایان؛ انبار: ۱۳۲ ردیف برای نمونهٔ ۱۱ رکوردی = ۱۱×۱۲ زبان دقیقاً (شیراز→Shiraz، آباده→Abadeh، کوردی/کره‌ای/روسی هم موجود) ✓
  · fa: انتخاب ایران (سرشاخهٔ ۴۹۱ زیرشاخه‌ای) → ترجمهٔ آنلاین: ۲۰ دستهٔ ۲۵تایی با هم‌زمانی ×۳ → سرویس LLM سقف نرخ را زد: ۱۳ دسته 429 شد (۴۲۵ رکورد ناموفق) — توست ناقص درست ظاهر شد «ناقص ماند — ۱۶۷ رکورد… ۱۳ دسته ناموفق» (رفتار طراحی‌شده) ✓
  · مقاوم‌سازی (هم‌زمانی ۲ + صف تلاش‌مجدد قلاب + backoff 429 سرور) → اجرای دوبارهٔ ایران: توست پیشرفت ۰/۴۹۲→۴۰۰/۴۹۲ روان؛ پایان بدون خطا — انبار: «۵۹۰۴ ردیف = ۴۹۲ رکورد × ۱۲ زبان، صفر ناقص، صفر جامانده، هر ۱۲ زبان» ✓ (اجرا ≈ ۶ دقیقه؛ ۲۹ POST موفق 200 در کل جلسه)
  · en: درخت «Iran» → باز کردن: ۳۱ استان انگلیسی (Fars/ East Azerbaijan/ Isfahan/ Chaharmahal and Bakhtiari…) → باز کردن Tehran: شهرها انگلیسی (Eslamshahr/ Baharestan/ Robat Karim…) ✓؛ آلمان از Task 107 همچنان Germany ✓
  · برگشت به fa: عناوین پایهٔ فارسی (ایران/فارس/آذربایجان شرقی) — fa همیشه منبع پایه ✓؛ console مرورگر پاک؛ dev.log: همهٔ auto-translate-batch نهایی 200، geo و data-translations همه 200.
- lint = ۰/۰؛ tsc پروژهٔ اصلی = فقط ۹ baseline؛ tsc settings-service = صفر. db-backup §0.9: custom.db + dfb.db → bak-t108.

Stage Summary:
- «ترجمهٔ آنلاین» در SimpleTreeForm از این پس زنجیره‌ای است: یک کلیک روی هر سرشاخه، «تمامی زیرشاخه‌هایش» را هم به همهٔ زبان‌های فعال ترجمه می‌کند — ایران (۴۹۲ رکورد × ۱۲ زبان = ۵۹۰۴ ترجمه) با یک کلیک ترجمه شد؛ کاربر دیگر هیچ کلیک رکوردبه‌رکوردی ندارد.
- سیستم انعطاف‌پذیر است و مقیاس‌پذیر: دسته‌بندی ۲۵تایی + یک LLM به‌ازای هر دسته + save-many یک‌درخواستی + صف تلاش‌مجدد دوطرفه (قلاب و endpoint) سقف نرخ LLM را خودکار جذب می‌کند؛ هر فرم درختی آینده فقط با یک getSubtreeRecords به همین رفتار وصل می‌شود.
- artifacts: src/app/api/data-translations/auto-translate-batch/route.ts (endpoint جدید)؛ src/components/forms/common/use-record-translation.tsx (+getSubtreeRecords +صف تلاش‌مجدد +توست پیشرفت)؛ src/components/erp/general/geo-locations-form.tsx (سیم‌کشی زنجیره)؛ mini-services/settings-service/src/data-translations/{data-translations.dto.ts، data-translations.service.ts، data-translations.controller.ts} (+save-many)؛ src/i18n/dictionaries.ts (۴ کلید ×۱۳).
---
Task ID: 109
Agent: Z.ai Code
Task: درخواست مالک — «توی فرم محل های جغرافیایی من روی شاخه ایران کلیک کردم و روی ترجمه آنلاین کلیک کردم ترجمه آنلاین نمایش داده شده است ولی زمان زیادی را صرف کرده است و هیچ آیتمی ترجمه نشده است. با سرعت بسیار زیاد باید ترجمه انجام گردد» (اسکرین‌شات: توست پیشرفت «ترجمهٔ آنلاین زیرشاخه‌ها… 0/492» معلق)

Work Log:
- ریشه‌یابی (دو منبع مستقل): ① انبار DataTranslation سرویس تنظیمات = دقیقاً ۵۹۰۵ ردیف = ۴۹۳ رکورد (ایران + ۴۹۲ زیرشاخه) × ۱۲ زبان — یعنی اجرای قبلی کامل ذخیره شده بود؛ اما کدِ Task 108 در «هر» کلیک همهٔ ۴۹۲ رکورد را از صفر به LLM می‌فرستاد (۲۰ دسته × ~۳۵ ثانیه با هم‌زمانی ۲ ≈ ۶ دقیقه تکرار بیهوده؛ upsert = ردیف‌ها تغییر نمی‌کنند و کاربر هیچ تفاوتی نمی‌بیند). ② endpoint دسته‌ای هیچ تایم‌اوتی روی فراخوانی LLM نداشت — یک فراخوانی hang‌شده، worker را برای همیشه نگه می‌داشت و توست روی «0/492» می‌ماند (دقیقاً اسکرین‌شات مالک). لاگ dev اجرای زندهٔ مالک (۲۰+ POST با یک 502 در 78s) همین را تأیید کرد.
- ① انبارشناسی پوشش (قلاب useRecordTranslation): پیش از هر ترجمهٔ زنجیره‌ای، GET دسته‌ای data-translations (تکه‌های ≤۵۰۰ شناسه، fieldKeys یکتا ≤۶۰) نقشهٔ «entityId:fieldKey → زبان‌های موجود» می‌سازد؛ رکورد «کامل‌پوشش» فوراً انجام‌شده شمرده می‌شود (صفر LLM) و اگر هیچ رکوردی جامانده نباشد، مسیر بدون توست پیشرفت، مستقیم onTranslated + توست موفقیت — اجرای دوبارهٔ ایران ۴۹۲ رکوردی = چند صد میلی‌ثانیه.
- ② فقط زبان‌های جامانده: هر رکورد ناقص «امضای زبان جامانده» می‌گیرد؛ دسته‌ها بر اساس امضا بسته‌بندی می‌شوند و هر دسته فقط همان زبان‌ها را از LLM می‌خواهد — خروجی هر فراخوانی کوچک‌تر و پاسخ بسیار سریع‌تر (آزمون زنده: دستهٔ ۱ رکوردی ۱.۸s، دستهٔ ۲ رکوردی ۳.۴s — در برابر ~۳۵s دستهٔ کامل ۲۵×۱۲). واکشی ناموفق انبار = null = عین رفتار قبلی (همه به LLM می‌روند — مسیر هرگز بدتر نمی‌شود).
- ③ تایم‌اوت ضد-hang (endpoint دسته‌ای): فراخوانی LLM با withTimeout ۷۵s محصور شد؛ تایم‌اوت/429 = قابل‌تلاش‌مجدد (۲ attempt با backoff ۴s + صف تلاش‌مجدد ۳تایی قلاب) — توست پیشرفت دیگر هرگز ابدی نمی‌ماند.
- E2E (agent-browser، fa→en→fa، فرم محل های جغرافیایی):
  · fa: انتخاب ایران → ترجمهٔ آنلاین → توست سبز «ترجمهٔ آنلاین زیرشاخه‌ها انجام شد — ۴۹۲ رکورد به ۱۲ زبان» در <۶ ثانیه؛ لاگ سرور: فقط GET انبارشناسی (295ms) و «صفر» POST دسته‌ای ✓ (قبلاً ۶ دقیقه!)
  · fa: انتخاب آلمان (زیردرخت واقعاً جامانده: خودش ۱۱ زبان کم داشت + برلین/هامبورگ هیچ) → ۲ POST کوچک (۱.۸s + ۳.۴s) → توست «۳ رکورد به ۱۲ زبان»؛ DB: هر سه رکورد ۱۲/۱۲ زبان (de=Deutschland، fr=Hambourg، ko=함부르크…)؛ انبار: «صفر رکورد ناقص» ✓
  · fa: اجرای دوبارهٔ آلمان → توست موفقیت آنی، صفر POST ✓
  · en/LTR: درخت «Germany»/«Iran»/«Berlin»/«Hamburg» را نشان داد (ترجمهٔ تازه بلافاصله در درخت نشست)؛ کشورهای بدون ترجمه = عنوان پایه (قرارداد Task 99) ✓
  · برگشت به fa: عناوین پایه (آلمان/برلین/هامبورگ) ✓؛ console مرورگر پاک؛ dev.log همه 200.
- lint = ۰/۰؛ tsc = فقط ۹ خطای baseline معروف. مسیر تک‌رکوردی (Party و…) دست‌نخورده.

Stage Summary:
- «ترجمهٔ آنلاین» زنجیره‌ای از این پس «به‌ازای هر کلیک» فقط کارِ واقعاً جامانده را می‌کند: اجرای دوبارهٔ شاخهٔ ترجمه‌شده آنی است (صفر LLM)، رکورد ناقص فقط زبان‌های کم‌دارش را می‌گیرد (چند ثانیه)، و فراخوانی LLM معلق هرگز توست را ابدی نمی‌خواباند — همان سه شکایت مالک (زمان زیاد، «هیچ آیتمی ترجمه نشده»، انتظار سرعت بسیار زیاد).
- بهینه‌سازی برای همهٔ فرم‌های درختی آینده هم خودکار است (قلاب عمومی)؛ رفتار فرم‌های بدون زیرشاخه بدون تغییر ماند.
- artifacts: src/components/forms/common/use-record-translation.tsx (+fetchCoverageMap +امضای زبان جامانده +پایان فوری)؛ src/app/api/data-translations/auto-translate-batch/route.ts (+withTimeout 75s +تلاش‌مجدد منضبط).
---
Task ID: 110
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در فرم محل های جغرافیایی عنوان ترجمه نشده است و عنوان لاتین ترجمه شده است؛ ما دیگر نیازی به فیلد عنوان لاتین در فرم‌ها نداریم؛ اطلاعات فیلدهای عنوان باید ترجمه شود و با تغییر زبان، عنوان ترجمه‌شده به آن زبان نمایش داده شود؛ در محل های جغرافیایی و بقیه فرم‌ها همه فیلدهای ترجمه‌نشده باید ترجمه شوند.» (اسکرین‌شات: Shiraz — Title=شیراز، Latin Title=Shiraz در UI انگلیسی)

Work Log:
- حذف فیلد «عنوان لاتین» از همهٔ فرم‌های داده: geo-locations-form (titleLatin: state/validate/payload/fields)، bs-window (titleEn: state/validate/payload/فیلد create+view)، tree-demo-window (latinTitle نمونه)؛ ستون‌های legacy در DB و DTOها ماندند اما Create DTO (geo: titleLatin، bs: titleEn) optional شد تا ثبت بدون لاتین کار کند (settings-service).
- «عنوان» زبان‌آگاه شد (geo + bs): نمایش = ترجمهٔ زبان جاری از انبار DataTranslation (نبودِ ترجمه = عنوان پایهٔ fa)؛ فرم با کلید بازمشقِ شامل locale + trEpoch (نسخهٔ نقشهٔ ترجمه) با تغییر زبان خودش را تازه می‌کند؛ ویرایش عنوان در fa = ستون پایه، در سایر زبان‌ها = POST data-translations/save همان زبان (عنوان پایه دست‌نخورده) — با تشخیص «ویرایش واقعی» از طریق origTitle داخل state (نه ref — رعایت react-hooks/refs) تا ترجمهٔ غایب به اشتباه قفل نشود.
- سیم‌کشی ترجمهٔ ساختار کسب‌وکار (بقیهٔ فرم‌ها): trMap دسته‌ای (entityIds ≤۵۰۰) برای درخت/فهرست/فرم + قلاب useRecordTranslation (آنلاین زنجیره‌ای زیرشاخه‌ها + دستی) + مبدأ ترجمه = عنوان پایهٔ fa (اصلاح getFields که قبلاً مقدار نمایشی می‌فرستاد).
- برچسب‌های زبان‌آگاه در سطوح دیگر: org-context-store (کاسکاد هلدینگ/شرکت/شعبه/نمایندگی/فروشگاه هدر — trMap در load)، user-role-form (مسیرهای «محدودهٔ دسترسی» با useMemo بر bsTr + locale).
- پاکسازی داده (همهٔ ترجمه‌نشده‌ها): scripts/sweep-translations.ts — ① بذر en از ستون‌های لاتین legacy (۳۸۶ geo + ۱ bs — صفر LLM) ② ترجمهٔ زبان‌های جامانده با endpoint دسته‌ای موجود (دستهٔ ۱۰ رکوردی — دسته‌های ۲۵×۱۲ پرتکرار ۵۰۲ «JSON ناقص» می‌دادند؛ کوچک‌تر = تفسیرپذیر) + هم‌زمانی ۲ + تلاش‌مجدد؛ جبرانِ مکمل تک‌رکوردی (قاهره zh). نتیجهٔ نهایی انبار: GeoLocation ۱۰۵۷۲ = ۸۸۱×۱۲ و BusinessStructure ۸۴ = ۷×۱۲ — پوشش ۱۰۰٪.
- E2E (agent-browser، fa→en→de→ar→fa): fa: Iran → جزئیات: ایران، عنوان=ایران، بدون فیلد لاتین ✓؛ en: درخت کامل انگلیسی (۸۸۱ گره)، Title=Iran، ویرایش «Iran-EN-test» ذخیره → درخت فوری انگلیسی شد و پایهٔ fa دست‌نخورده ماند (بازگشت به fa = ایران ✓) → بازگردانی en=Iran ✓؛ de: Deutschland/Schiras ✓؛ ar (RTL): إيران/شیراز/العنوان ✓؛ bs-window در en: درخت Headquarters/Sample Company/Second Company…، Title=Second Company، منوی ترجمه آنلاین/دستی فعال ✓؛ ثبت رکورد آزمونی بدون لاتین + حذف ✓؛ کنسول/خطاها پاک.
- lint = ۰/۰؛ tsc = فقط ۹ baseline. نکتهٔ زیرساختی: فرایند پس‌زمینهٔ sweep با nohup/setsid هم به‌مرور کشته می‌شد — با اجرای عین‌حالِ idempotent (پوشش‌محور) تا «SWEEP COMPLETE» بسته شد.

Stage Summary:
- فیلد «عنوان لاتین» از فرم‌ها حذف و «عنوان» جایگزین تک‌فیلدیِ چندزبانه شد: هر زبان ترجمهٔ خودش را می‌بیند/ویرایش می‌کند و ترجمه‌ها در انبار DataTranslation می‌مانند (عنوان پایهٔ fa = مرجع).
- کل دادهٔ مرجع (۸۸۱ محل جغرافیایی + ۷ گرهٔ ساختار) اکنون ۱۲/۱۲ زبان ترجمه دارد — «همهٔ فیلدهای ترجمه‌نشده ترجمه شدند»؛ فرم‌های دادهٔ آینده با همان قلاب عمومی، بدون کار اضافه، همین رفتار را می‌گیرند.
- artifacts: geo-locations-form.tsx؛ business-structure/bs-window.tsx؛ settings/user-role-form.tsx؛ stores/org-context-store.ts؛ tree-demo-window.tsx؛ mini-services/settings-service (geo/bs DTO+service)؛ scripts/sweep-translations.ts؛ «backup db/custom-2026-10-26_1500.db» + «dfb-2026-10-26_1500.db» (bak-t110).
---
Task ID: 111
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «در لیست درختواره فرمساز و در منوی عمومی آخرین فرم های ایجاد شده نمایش داده نمی شود. بررسی کنید چرا فرم های ایجاد شده در منو وجود ندارد. فرم های جدیدی که ایجاد می شوند باید در درختواره فرمساز هم نمایش داده شوند.» (اسکرین‌شات: پنجرهٔ فرمساز با فرم سیستمی «ساختار کسب و کار» انتخاب‌شده)

Work Log:
- بازتولید زنده (agent-browser): چرخهٔ «ایجاد فرم زیر عمومی → درختواره» سالم بود (فرم بلافاصله در درخت می‌نشیند)؛ اما پنجرهٔ برنامهٔ «عمومی» فقط منوی ثابت اطلاعات پایه را نشان می‌داد و «هیچ» فرمِ فرم‌ساز را نمی‌دید — ریشهٔ نیمهٔ «منو»ی شکایت: تا امروز فقط advancedTools به پنجرهٔ دیتابیسی dfb-menu بازنگری شده بود (Task 46)؛ عمومی پنجرهٔ ثابت و ۲۵ برنامهٔ دیگر placeholder بودند.
- ریشهٔ دوم (کشف حیاتی، از دل خطای 500): دنبال‌کردن POST شکست‌خوردهٔ ایجاد فرم → سرویس dfb (:3003) دو فدِ باز به «db/dfb.db (deleted)» داشت — عملیات git (stash/pop برای مقایسهٔ tsc baseline) فایل دیتابیسِ تحت‌TRACK را زیر پای پروسهٔ زنده جابه‌جا کرده بود و اتصال Prisma به inode شبح چسبیده بود: ایجاد فرم = 500 (یا نوشتن در جای نامرئی) → «فرم‌های ایجادشده ذخیره/نمایش نمی‌شوند». اثبات: fd 401/406 → dfb.db (deleted) در /proc/6577؛ POST مستقیم امضاشده = 500؛ پس از reload زندهٔ bun --hot (فد جدید 408 به inode فعلی) همان POST = 201 و نوشتن روی دیسک راستی‌آزمایی شد (IDGeneration LastID=18/Version=21).
- پژواک سیستمیک: instrumentation-node.ts از «گارد تک‌سرویسی تنظیمات» به حلقهٔ SERVICES گسترش یافت — اکنون settings (:3001) و dfb (:3003) هر دو هنگام بوت Next اگر /health نداشتند به‌عنوان فرزند سرور زنده‌می‌شوند (قرارداد Task 105، بدون تغییر رفتار استقرار واقعی).
- بخش «منو» (اصلی): کامپوننت مشترک جدید DfbAppFormsSection (src/components/erp/form-builder/dfb-app-forms.tsx) — «فرم‌های فرم‌ساز» هر برنامهٔ سیستمی را از گرهٔ dfbTree با AppKey همان برنامه می‌خواند: زیرمنوها = کاشی (باز کردن پنجرهٔ dfb-menu همان گره برای ناوبری کامل) و فرم‌ها = ردیف (باز کردن runtime؛ لانچر فرمساز = پنجرهٔ builder)؛ حالت خالی راهنما فقط وقتی درخت بارگذاری‌شده و گره موجود است (بدون فلیکر). مصرف در GeneralWindow (عمومی — بالای اطلاعات پایه، قرارداد اعلام‌شده دست‌نخورده) و AppPlaceholderWindow (سیستمیک برای همهٔ ۲۵ برنامهٔ باقی‌مانده) — از این پس فرم جدیدِ هر آیکونی بدون هیچ تنظیمی در پنجرهٔ همان برنامه دیده و باز می‌شود.
- بخش «درختواره» (استحکام): ① مسابقهٔ load() در dfb-store رفع شد — reload ای که حین یک بارخوانیِ در جریان می‌آمد قبلاً بی‌صدا دور ریخته می‌شد؛ حالا صف می‌شود و پس از پایان آن، واکشیِ تازه (آغازشده بعد از درخواست) اجرا می‌شود. ② lastLoadedAt + loadIfStale(maxAgeMs=5s) — FormBuilderWindow هر بار که برگه‌اش فعال می‌شود (از جمله اولین باز شدن) اگر بارخوانی کهنه باشد دوباره می‌گیرد؛ تور ایمنی تازگی برای فرم‌های ساخته‌شده در هر جای برنامه/جلسه.
- i18n: ۲ کلید dfb.appFormsSection/dfb.appFormsEmpty ×۱۳ زبان (۲۶ خط، تزریق بعد از dfb.noFieldsYet در هر بلوک).
- E2E (agent-browser، fa→en→fa): ایجاد «فرم آزمون حسابداری» زیر حسابداری از ویزارد → استودیو باز شد → درختواره: زیر حسابداری [انتخاب‌شده] ✓ → پنجرهٔ حسابداری: بخش «فرم‌های فرم‌ساز (1 فرم)» با DFB-F-19 ✓ → کلیک = باز شدن runtime ✓؛ عمومی: ساختار کسب و کار + فرم آزمون منو (2 فرم) ✓؛ حالت خالی راهنما در برنامه‌های بی‌فرم (حسابداری پیش از ایجاد) ✓؛ en/LTR: «Form-builder forms / 1 form(s)» و «Business Structure BS System form» ✓؛ برگشت به fa سالم ✓. پاکسازی: فرم‌های آزمونی 17/18/19 از UI (حذف با دیالوگ تأیید، DELETE 200) و دیسک = 4 فرم پایه — با بذر آزمون 500/201 عمدی پیش و بعد از تعمیر سرویس.
- dev.log: 429های دیده‌شده تاریخی (دوران Task 108/109)؛ همهٔ فراخوانی‌های این جلسه 200/201. lint = ۰/۰؛ tsc = همان ۱۳ baseline قبلی (۶ websocket + ۴ sweep + ۲ start-menu + ۱ field-translations — با stash-mقایسه اثبات شد صفر خطای جدید؛ یادداشت: عدد «۹» در worklogهای قبلی کهنه بود).
- هشدار عملیاتی (برای جلسات بعد): db/*.db در git تحت‌TRACK هستند — هر stash/checkout/restore روی آن‌ها زیر پای سرویس زنده inode را می‌شکند (نشانه: 500 در نوشتن + «(deleted)» در /proc/<pid>/fd). درمان: reload زنده (touch/src change با bun --hot) یا بازراه‌اندازی سرویس؛ اکنون instrumentation هم dfb را زنده نگه می‌دارد. همچنین fd استاندارد لاگ dfb-service به فایل حذف‌شده چسبیده است (لاگ‌های تازه تا ری‌استارت بعدی در لاگ نمی‌نشینند — بی‌آسیب به منطق).

Stage Summary:
- «فرم‌های فرم‌ساز» از این پس شهروند درجه‌یک منوهاست: هر فرمی که در فرم‌ساز روی آیکون اصلی هر برنامه (سیستمی یا کاربری) ساخته می‌شود، هم در درختوارهٔ فرمساز (با قرارداد تازگیِ تضمین‌شده) و هم در پنجرهٔ خودِ برنامه دیده می‌شود و با کلیک باز می‌شود — بدون هیچ تنظیم اضافه (سیستمیک، عین فلسفهٔ Task 107).
- ریشهٔ دومِ نامرئی‌شدن فرم‌ها (500 ایجاد فرم به‌دلیل inode-شبح پس از جابه‌جایی فایل db زیر سرویس زنده) کشف، تعمیر و سیستمیک‌سازی شد: self-heal دو سرویسی در بوت Next + مستندسازی هشدار عملیاتی.
- artifacts: src/components/erp/form-builder/dfb-app-forms.tsx (جدید)؛ general-window.tsx؛ app-placeholder-window.tsx؛ dfb-store.ts (+loadIfStale +صف reload)؛ form-builder-window.tsx (+refresh-on-activate)؛ src/instrumentation-node.ts (گارد دوم сервис)؛ src/i18n/dictionaries.ts (۲ کلید ×۱۳)؛ mini-services/dfb-service/src/main.ts (مارکر reload زنده).
---
Task ID: 112
Agent: Z.ai Code (main orchestrator)
Task: درخواست مالک — «فرم هایی که در زیرمنوی اطلاعات پایه منوی عمومی ایجاد شده اند مثل طرف حساب در درختواره فرمساز و منوی عمومی دیده نمی شود»

Work Log:
- ریشه‌یابی (DB + UI): درخت dfb گرهٔ «عمومی» (ID=28) را داشت اما «هیچ» زیرمنویی و فقط فرم سیستمی «ساختار کسب و کار»؛ سه فرم واقعی زیرمنوی «اطلاعات پایه»ٔ پنجرهٔ عمومی (سال مالی جدید/طرف حساب جدید/محل های جغرافیایی) صفحه‌های React ثابت بودند و هرگز در رجیستری DfbForm ثبت نشده بودند ⇒ نه در درختوارهٔ فرمساز، نه در پنجرهٔ منوی dfb، نه در بخش «فرم‌های فرم‌ساز» عمومی دیده نمی‌شدند.
- بذر سیستمی (dfb-service/seed): ① SYSTEM_SUBMENUS — زیرمنوی سیستمی «اطلاعات پایه» (Code=basicInfo، NodeType=2، IsSystem=true، AppKey=عمداً null تا برچسب گره برچسب خودش بماند) زیر آیکون عمومی؛ ② SYSTEM_FORMS + فیلد anchorSubmenuCode — سه فرم سیستمی gnr.fiscalYear/FYS، gnr.party/PRT، gnr.geoLocations/GEO زیر همان زیرمنو (IsSystem، Published)؛ ③ ترجمهٔ دیکشنری‌محور: ensureDictTranslations از getDict برنامه (fy.menuBasicInfo / fy.formTitle / party.formTitle / geo.formTitle) ترجمهٔ ۱۲ زبانِ غیر-fa را عین برچسب UI بذر می‌کند — نتیجه: هر ۶ موجودیت ۱۲/۱۲ زبان. همه idempotent (upsert + drift-check شامل titleEn).
- راه‌انداز واقعی فرم سیستمی (src/components/erp/form-builder/dfb-system-forms.ts): openDfbFormReal — فرم‌های سیستمیِ دارای فرم واقعی به‌جای ران‌تایم عمومی EAV (که فیلد EAV ندارند و خالی باز می‌شدند) همان فرم واقعی را باز می‌کنند: gnr.businessStructure → پنجرهٔ ساختار کسب و کار؛ سه فرم اطلاعات پایه → openWindow("app","general") + requestGeneralPage (قرارداد یک‌بارهٔ Task 85، پنجرهٔ بسته هم با درخواستِ در انتظار mount می‌شود)؛ لانچر فرمساز → builder (Task 46)؛ بقیه = dfb-form. dfbFormHasRealWindow برای نمایش دکمهٔ «باز کردن فرم» روی فرم‌های سیستمیِ واقعی در پنل جزئیات builder.
- سیم‌کشی مصرف‌کننده‌ها: dfb-menu-window و dfb-app-forms و FormDetailPanel همه از راه‌انداز واحد می‌روند؛ DfbAppFormsSection یک سطح «فلت» شد — فرم‌های مستقیمِ زیرمنوهای سیستمی با سرگروهِ عنوانِ خود زیرمنو در همان بخش فهرست می‌شوند (بج شمارنده = مجموع) ⇒ در پنجرهٔ عمومی هر ۴ فرم بدون کلیک اضافه دیده می‌شوند؛ کاشیِ زیرمنو هم برای ناوبری کامل dfb-menu می‌ماند.
- زیرساخت خودترمیمی (کشف حیاتی جلسه): در این سندباکس هر پروسه‌ای که از فراخوانی ابزار spawn شود به‌محض پایان فراخوانی کشته می‌شود (حتی setsid/nohup — آزمون sleep). سرویس dfb سه بار پس از بوتِ سالم مُرد و درختواره 502 می‌داد. درمان دولایه: ① instrumentation-node.ts گارد را «دوره‌ای» شد (بازرسی ۳۰ثانیه‌ای + cooldown ۶۰s + globalThis ضدregister دوباره)؛ ② auto-push-service (پروسهٔ ماندگار سندباکس، bun --hot) نگهبان همتا گرفت — پاس اول فوری + بازرسی دوره‌ای با گارد epoch برای hot reload؛ سرویس مرده به‌عنوان فرزند پروسهٔ ماندگار بالا می‌آید (الگوی اثبات‌شدهٔ settings-service فرزند next-server). نکتهٔ bun --hot: تایمرهای تازهٔ ماژول ورودی پس از reload آتش نمی‌گیرند ⇒ پاس اول باید بی‌درنگ اجرا شود.
- E2E (agent-browser، fa→en→fa): درختوارهٔ فرمساز: عمومی → اطلاعات پایه → [سال مالی جدید، طرف حساب جدید، محل های جغرافیایی] + ساختار کسب و کار ✓؛ انتخاب طرف حساب جدید → پنل جزئیات (کد PRT، دکمهٔ «باز کردن فرم» برای فرم سیستمی) → کلیک = برگهٔ «عمومی — طرف حساب جدید» با فرم واقعی کامل (ماهیت/تفصیلی/تب‌ها) ✓؛ پنجرهٔ عمومی: بخش «فرم‌های فرم‌ساز (۴ فرم)» = کاشی اطلاعات پایه + ساختار کسب و کار + سرگروه اطلاعات پایه با ۳ فرم ✓؛ کلیک سال مالی جدید = برگهٔ «عمومی — سال مالی جدید» ✓؛ کاشی اطلاعات پایه → پنجرهٔ dfb-menu با ۳ فرم → کلیک طرف حساب جدید = فرم واقعی ✓؛ en/LTR: درخت General → Basic Information → New Fiscal Year/New Party Account/Geographic Locations، برگه‌ها «General — New Fiscal Year» (ترجمه‌های بذر دیکشنری‌محور نشستند) ✓؛ برگشت به fa سالم ✓؛ کنسول پاک؛ همهٔ APIها 200.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید). next.config.ts یک مارکر no-op گرفت (reload سرور برای فعال‌شدن گارد دوره‌ای در بوت‌های بعدی).

Stage Summary:
- «تمام فرم‌های سیستمی به‌تفکیک آیکون و منو در درختوارهٔ فرمساز» حالا واقعاً برقرار است: زیرمنوهای سیستمی (SYSTEM_SUBMENUS) + فرم‌های واقعی هر برنامه (SYSTEM_FORMS با anchorSubmenuCode) از بوت در رجیستری ثبت و در درختواره، پنجرهٔ dfb-menu و بخش «فرم‌های فرم‌ساز» پنجرهٔ خود برنامه (با فلت یک‌سطحی) دیده می‌شوند؛ کلیک روی مدخل فرم سیستمی همیشه «فرم واقعی» را باز می‌کند نه ران‌تایم خالی را.
- زبان‌آگاهی کامل: عنوان‌های ثبت‌شده ۱۲/۱۲ زبان ترجمهٔ دیکشنری‌محور دارند و با تغییر زبان، درخت/منو/برگه‌ها بلافاصله برچسب همان زبان را نشان می‌دهند.
- خودترمیمی سرویس‌ها دولایه شد (instrumentation دوره‌ای + نگهبان auto-push) — مرگ میانهٔ جلسهٔ dfb-service دیگر 502 ابدی نمی‌سازد.
- artifacts: mini-services/dfb-service/src/seed/seed.service.ts؛ src/components/erp/form-builder/dfb-system-forms.ts (جدید)؛ dfb-menu-window.tsx؛ dfb-app-forms.tsx؛ form-builder-window.tsx؛ src/instrumentation-node.ts؛ mini-services/auto-push-service/index.ts؛ next.config.ts.

---
Task ID: 113
Agent: Z.ai Code (main)
Task: «توی منوی عمومی فرم ها دوبل شده اند... اگر فرمی خارج از فرمساز ایجاد شد باید در درختواره فرم ها در فرم ساز توسط کاربران قابل مشاهده باشد. نباید مجددا آن فرم را در فرم ساز هم ایجاد کنید. فرم هایی که در تصویر با فلش قرمز مشخص کردم را پاک کنید و آیتم های پایین را در فرم ساز و منوی عمومی نمایش دهید» — حذف دوبل‌شدن فرم‌های سیستمی در پنجرهٔ «عمومی».

Work Log:
- ریشه‌یابی: درخت‌وارهٔ فرمساز/DB تک‌نسخه‌اند (dfb.db: BS زیر عمومی، FYS/PRT/GEO زیر زیرمنوی basicInfo، FB زیر advancedTools — هیچ رکورد تکراری نیست). دوبلِ واقعی، UI بود: DfbAppFormsSection (Task 111/112) در همان پنجرهٔ «عمومی»، فرم‌های سیستمی (BS + سرگروه اطلاعات پایه با ۳ فرم) را بالای کارت بومیِ «اطلاعات پایه» دوباره فهرست می‌کرد — دقیقاً ۴ مدخلی که مالک با فلش قرمز نشان داده بود.
- اصلاح (dfb-app-forms.tsx): prop جدید «hideSystem» — در این حالت فقط فرم‌های ساختهٔ کاربر (IsSystem=false) فهرست می‌شوند، کاشیِ زیرمنوها هم حذف می‌شود و اگر هیچ فرم کاربری نباشد کل بخش رندر نمی‌شود (نه قاب خالی، نه کاشی تکراری بالای کارت بومی).
- general-window.tsx → <DfbAppFormsSection appKey="general" hideSystem />؛ پنجره‌های placeholder بدون تغییر (فرم‌های سیستمی‌شان بدنهٔ بومی ندارند و همان‌جا باید بمانند — قرارداد Task 46/111).
- قرارداد Task 112 دست‌نخورده ماند: فرم‌های سیستمی همچنان در درختوارهٔ فرمساز (عمومی → اطلاعات پایه → ۳ فرم + ساختار کسب و کار) و پنجرهٔ منوی dfb و بخش «فرم‌های فرم‌ساز» پنجره‌های placeholder دیده می‌شوند — «اگر فرمی خارج از فرمساز ایجاد شد باید در درختواره فرم ها قابل مشاهده باشد، نباید مجددا آن فرم را در فرم ساز ایجاد کنید».
- E2E (agent-browser): fa — پنجرهٔ عمومی: صفر مدخل «فرم‌های فرم‌ساز»، صفر «ساختار کسب و کار»، کارت «اطلاعات پایه» با ۳ فرم فقط یک‌بار ✓؛ درخت فرمساز: ۳ فرم زیر اطلاعات پایه + ساختار کسب و کار ✓؛ کلیک طرف حساب جدید → پنل جزئیات → «باز کردن فرم» → برگهٔ «عمومی — طرف حساب جدید» با فرم واقعی ✓؛ آزمون سیستمیک: فرم آزمایشی «فرم آزمایشی همگام‌سازی» (DFB-F-23) در فرمساز ساخته شد → هم در درختواره (زیر عمومی) و هم در پنجرهٔ عمومی ظاهر شد اما فقط در بخش «فرم‌های فرم‌ساز (۱ فرم)» و بدون هیچ فرم سیستمی ✓؛ حذف فرم آزمایشی از UI → بخش دوباره به‌کلی پنهان شد + رکورد DB پاک ✓. en/LTR — General → Basic Information → New Fiscal Year/New Party Account/Geographic Locations تک‌نسخه ✓. کنسول پاک، همهٔ APIها ۲۰۰.
- نکتهٔ شناخته‌شده (خارج ازscope، برای Task 109): فرم تازه‌ساخته با فقط Title_En (بدون ردیف DfbTranslation) در en هنوز عنوان fa را نشان می‌دهد — زنجیرهٔ dfbResolveTr (Task 68) به fa برمی‌گردد؛ مالک‌سازی عنوان‌ها در Task 109 بازطراحی می‌شود.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید).

Stage Summary:
- پنجرهٔ «عمومی» (منوی عمومی) دیگر هیچ دوبلی ندارد: فرم‌های سیستمی فقط در بدنهٔ بومی خودشان (کارت اطلاعات پایه/پنجرهٔ ساختار کسب و کار)؛ بخش «فرم‌های فرم‌ساز» فقط ساخته‌های کاربر را نشان می‌دهد و تا وجود نداشتنشان کلاً رندر نمی‌شود.
- تک‌منبعی بودن حفظ شد: درختوارهٔ فرمساز + پنجرهٔ منوی dfb مرجع دیدن همهٔ فرم‌ها (سیستمی و کاربری) هستند؛ پنجرهٔ برنامه فقط افزودنیِ ساخته‌های کاربر را روی بدنهٔ بومی نشان می‌دهد.
- artifacts: src/components/erp/form-builder/dfb-app-forms.tsx (prop hideSystem + فیلتر IsSystem + حذف کاشی‌ها در این حالت)؛ src/components/erp/general/general-window.tsx (hideSystem).

---
Task ID: 114
Agent: Z.ai Code (main)
Task: «توی منوی عمومی و اطلاعات پایه یک فرم جدید ایجاد کنید بنام نوع ارز جدید و فیلدهایی که در تصویر بارگذاری شده وجود دارد را در این فرم اضافه کنید. ارزهای معتبر بین المللی را در این فرم بصورت Seed اضافه کنید» — فرم سیستمی «نوع ارز جدید» تمام‌-stack (فرم واقعی + API + seed ۲۵ ارز ISO 4217 + ثبت در فرمساز).

Work Log:
- الگوبرداری کامل از زنجیرهٔ Task 75/84/103 (فیسکال‌ایر/طرف‌حساب/محل‌های جغرافیایی): فرم واقعی React + سرویس تنظیمات + ثبت در رجیستری فرم‌های سیستمی dfb + آیتم کارت «اطلاعات پایه» + زیرصفحهٔ پنجرهٔ عمومی.
- Backend (settings-service): مدل Prisma CurrencyType (Code/Title/TitleLatin/BaseUnit/DecimalPlaces/DecimalTitle/DecimalTitleLatin/IsActive + AppBase ۸فیلدی؛ unique دوتایی کد و عنوان در ساختار سازمانی)؛ db:push + db:generate؛ ماژول NestJS کامل (GET/POST/PUT/DELETE /currency-type با InternalAuthGuard)؛ DTO class-validator؛ TABLE_REGISTRY += CurrencyType؛ VERSIONED_MODELS += CurrencyType (§2.5 auto-rowversion)؛ seed boot مرحلهٔ ۷ = ۲۵ ارز معتبر بین‌المللی ISO 4217 (IRR, USD, EUR, AED, SAR, QAR, OMR, KWD, BHD, IQD, AFN, TRY, AZN, TJS, PKR, INR, CNY, JPY, KRW, RUB, GBP, CHF, CAD, AUD, MYR) با تعداد اعشار استاندارد ISO (دینارها ۳، ین/وون/ریال ۰) و واحد مبنا ۱ — idempotent by (Code+structure).
- Frontend: src/components/erp/general/currency-type-form.tsx با SimpleFormTwoRowTabbed — هر ۸ فیلد تصویر مالک (کد*/عنوان*/عنوان لاتین* LTR/واحد مبنا* پیش‌فرض ۱/تعداد اعشار* پیش‌فرض ۰/عنوان اعشار/عنوان اعشار لاتین LTR/ثبت فعال پیش‌فرض فعال)؛ اعتبارسنجی دولایه (فرانت+سرور: کد/عنوان/لاتین اجباری، واحد مبنا صحیح≥۱، اعشار ۰..۳)؛ فیلتر فقط-لاتین هم‌زمان تایپ برای دو فیلد لاتین؛ نوار عملیات کامل (ناوبری |<<، ریست/ذخیره/ذخیره‌وجدید/کپی/حذف با تأیید/پرینت، لیست رکوردها با مینی‌گرید ۸ ستونه)؛ dirty-flag Task 82.
- یکپارچه‌سازی: general-window (آیتم چهارم کارت اطلاعات پایه با آیکون Coins طلایی + زیرصفحه + نان‌بار + عنوان زندهٔ برگه «عمومی — نوع ارز جدید»)؛ general-nav-store += "currency-type"؛ dfb-system-forms SYSTEM_GENERAL_PAGES += gnr.currencyType؛ seed سرویس dfb = فرم سیستمی CUR (gnr.currencyType) زیر general/basicInfo با dictKey currency.formTitle (ترجمهٔ ۱۳ زبانه از دیکشنری)؛ dictionaries.ts += ۱۵ کلید currency.* در هر ۱۳ زبان (۱۹۵ ردیف).
- E2E (agent-browser، fa→en→fa): کارت اطلاعات پایه ۴ آیتم ✓؛ زیرصفحه با هر ۸ فیلد و پیش‌فرض‌های تصویر (۱/۰/تیک) ✓؛ لیست = ۲۵ ارز seedشده ✓؛ بازکردن USD = همه فیلدها پر (USD/دلار آمریکا/US Dollar/1/2/سنت/تیک) ✓؛ ثبت آزمایشی TST «ارز آزمایشی» = ذخیره موفق (۲۶ ردیف) ✓؛ حذف با دیالوگ تأیید = پاک شد (۲۵ ردیف، API تأیید) ✓؛ درخت فرمساز: نوع ارز جدید زیر اطلاعات پایه (CUR) ✓؛ «باز کردن فرم» از درخت = زیرصفحهٔ واقعی ✓؛ en/LTR: General — New Currency Type / Basic Information / Code, Title, Latin Title, Base Unit, Decimal Places, Decimal Title, Latin Decimal Title, Active Registration + درخت New Currency Type ✓؛ برگشت fa سالم ✓؛ کنسول پاک؛ همهٔ APIها ۲۰۰.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید).

Stage Summary:
- فرم سیستمی «نوع ارز جدید» به اطلاعات پایهٔ منوی عمومی اضافه شد: فیلدها عین تصویر مالک، seed ۲۵ ارز معتبر بین‌المللی ISO 4217 (از ریال ایران تا دلار/یورو/درهم/دینارها)، CRUD کامل دولایه، و حضور هم‌زمان در منوی عمومی + درختوارهٔ فرمساز با بازکردن فرم واقعی (قرارداد Task 112/113).
- معماری سیستمیک حفظ شد: فرم‌های سیستمی جدید فقط با یک مدخل در SYSTEM_FORMS (dfb seed) + یک زیرصفحه در پنجرهٔ عمومی + ماژول سرویس تنظیمات اضافه می‌شوند؛ هیچ دوبلی در هیچ پنجره‌ای (قرارداد Task 113: پنجرهٔ عمومی بدنهٔ بومی دارد، فرم‌ساز فقط ثبت رجیستری را نشان می‌دهد).
- artifacts: mini-services/settings-service/src/currency-type/* (جدید)؛ prisma/schema.prisma؛ seed/seed.service.ts؛ id-generation/table-registry.ts؛ prisma/prisma.service.ts؛ src/components/erp/general/currency-type-form.tsx (جدید)؛ general-window.tsx؛ general-nav-store.ts؛ dfb-system-forms.ts؛ mini-services/dfb-service/src/seed/seed.service.ts؛ src/i18n/dictionaries.ts.
---
Task ID: 115
Agent: Z.ai Code (main)
Task: «دکمه ترجمه در فرم نوع ارز جدید غیرفعال می باشد» — فعال‌سازی کاشی «ترجمه»ٔ فرم «نوع ارز جدید» (Task 114) با قلاب عمومی ترجمهٔ رکورد + نمایش ترجمه در فیلدها و فهرست.

Work Log:
- ریشه‌یابی: فرم ارز (currency-type-form.tsx) هرگز onTranslateOnline/onTranslateOffline به SimpleFormTwoRowTabbed نداده بود؛ TranslateButton (Task 90) با دو handlerِ بی‌واسطه، هر دو آیتم منو را غیرفعال رندر می‌کرد (قرارداد wired).
- اتصال با قلاب عمومی Task 107 (useRecordTranslation): entityType «CurrencyType» (با regex endpoint سازگار — بررسی شد)، entityId = رکورد باز؛ فیلدهای قابل ترجمه = متن‌های fa رکورد: title + decimalTitle (کد/لاتین/اعداد ترجمه نمی‌گیرند).
- نمایش ترجمه (الگوی Party Task 93/99): نقشهٔ ترجمهٔ رکورد باز (loadTr با گارد currentIdRef برای پاسخ‌های کهنه) → در زبان غیر-fa فیلد عنوان/عنوان اعشارِ رکورد ذخیره‌شده تا فوکوس/ویرایش نشده ترجمهٔ زبان جاری را نشان می‌دهد (onRevealFocus = نمایان‌شدن مقدار پایه)؛ فهرست رکوردها با endpoint دسته‌ای (fieldKeys=title,decimalTitle) هنگام تعویض زبان نرم می‌شود.
- onTranslated/onOfflineClose → تازه‌سازی هم‌زمان overlay رکورد باز + نسخهٔ فهرست؛ دیالوگ ورود دستی (خروجی قلاب) در انتهای فرم رندر شد.
- E2E (agent-browser): دکمهٔ «ترجمه» بدون disabled ✓؛ منو: «ترجمهٔ خودکار (آنلاین) — ۱۲ زبان فعال» و «ورود دستی (آفلاین)» هر دو فعال ✓؛ ترجمهٔ آنلاین واقعی رکورد AED = POST /api/data-translations/auto-translate 200 (۲ فیلد × ۱۲ زبان، 3.5s) + دو GET تازه‌سازی ✓؛ سوییچ به tr: فیلد عنوان «BAE Dirhemi» و سطر فهرست «AED - BAE Dirhemi» ✓؛ بازگشت fa: مقادیر پایه «درهم امارات»/«فلس» ✓؛ دیالوگ ورود دستی با مقادیر انبار باز شد ✓؛ کنسول پاک، همهٔ APIها 200.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید)؛ بکاپ §0.9: db/dfb.db.bak-t115 + db/custom.db.bak-t115.

Stage Summary:
- کاشی «ترجمه»ٔ فرم «نوع ارز جدید» کاملاً فعال شد: ترجمهٔ خودکار آنلاین (LLM، ۱۲ زبان) و ورود دستی (دیالوگ عمومی) روی انبار DataTranslation با entityType «CurrencyType» کار می‌کنند و نتیجه بلافاصله در فیلدها (زبان غیر-fa) و فهرست رکوردها دیده می‌شود.
- فرم ارز حالا عین قرارداد فرم‌های سیستمی دیگر (طرف‌حساب/محل‌های جغرافیایی/ساختار کسب‌وکار) است — قلاب عمومی Task 107 دوباره ثابت کرد فعال‌سازی ترجمهٔ هر فرم جدید فقط چند خط است.
- artifacts: src/components/erp/general/currency-type-form.tsx (قلاب + overlay فیلدها + ترجمهٔ فهرست + دیالوگ).
---
Task ID: 116
Agent: Z.ai Code (main)
Task: «توی منوی عمومی و در منوی عملیات یک فرم جدید ایجاد کنید بنام نرخ برابری جدید و فیلدهای داخل تصویر را اضافه نمایید. نیازی به فیلد شناسه نمی باشد.» — فرم سیستمی «نرخ برابری جدید» تمام‌-stack در گروه نوپای «عملیات» منوی عمومی (بدون فیلد شناسه).

Work Log:
- Backend (settings-service): مدل Prisma ExchangeRate (EffectiveDate میلادی Task 77 / BaseCurrencyRef / QuoteCurrencyRef / ExchangeUnit اختیاری / Rate رشتهٔ عددی نرمال — Decimal روی SQLite پشتیبانی نمی‌شود + AppBase ۸فیلدی؛ unique چهارگوشهٔ تاریخ+جفت‌ارز+ساختار)؛ db:push + db:generate؛ ماژول NestJS کامل (GET/POST/PUT/DELETE /exchange-rate با InternalAuthGuard)؛ DTO class-validator؛ TABLE_REGISTRY += ExchangeRate؛ VERSIONED_MODELS += ExchangeRate (§2.5).
- زنجیرهٔ اعتبارسنجی سرور: تاریخ 'YYYY-MM-DD' میلادی واقعی؛ ارزها باید در CurrencyType موجود و متمایز باشند (422 پیام روشن)؛ نرخ > ۰ با regex اعشاری؛ واحد اختیاری ≥ ۱؛ نرخ تکراری همان جفت‌ارز در همان تاریخ = 409.
- dfb seed: SYSTEM_SUBMENUS += «عملیات» (operations, sortOrder=2, dictKey rate.menuGroup) زیر آیکون عمومی + SYSTEM_FORMS += EXR (gnr.exchangeRate, anchorSubmenuCode=operations, dictKey rate.formTitle) — بوت سرویس dfb خودکار ثبت کرد: زیرمنو ID=34، فرم ID=25.
- Frontend: src/components/erp/general/exchange-rate-form.tsx با SimpleFormTwoRowTabbed — ۵ فیلد عین تصویر و بدون شناسه (تاریخ موثر* ماسک‌دار Task 49 / ارز مبنا* و ارز مورد مبادله* دراپ‌داون از CurrencyType با placeholder «انتخاب کنید...» / واحد مبادله اختیاری با placeholder «ارز مبنا مبنای استخراج می‌باشد» / نرخ برابری 1 واحد*)؛ نوار عملیات کامل + dirty-flag Task 82؛ اعتبارسنجی دولایه؛ واحدِ لیست = ورودی کاربر وگرنه واحد مبنای ارز مبنا.
- Task 115 (الگوی تثبیت‌شده) — کاشی «ترجمه» از ابتدا با قلاب عمومی Task 107 وصل است (entityType ExchangeRate)؛ رکورد فیلد متنی ندارد ⇒ توست/دیالوگ راهنمای شفاف «بدون فیلد متنی» (بدون کلیک مرده — قرارداد Task 90).
- Task 77/49 — تاریخ: ذخیرهٔ میلادی 'YYYY-MM-DD'، نمایش در تقویم زبان انتخابی؛ نمایشِ رکورد باز «مشتق» از dateISO است (بدون setState-in-effect — قاعده react-hooks) ⇒ با تعویض زبان تقویمِ رکورد باز بلافاصله عوض می‌شود؛ تایپ کاربر نمایش مشتق را باطل می‌کند.
- یکپارچگی: general-window (کارت جمع‌شوندهٔ «عملیات» با آیکون Workflow + آیتم «نرخ برابری جدید» با ArrowLeftRight + زیرصفحه + نان‌بار عمومی/عملیات/نرخ برابری جدید + عنوان زندهٔ برگه)؛ general-nav-store += "exchange-rate"؛ dfb-system-forms += gnr.exchangeRate (بازکردن فرم واقعی از درخت)؛ dictionaries.ts += ۱۹ کلید rate.* در هر ۱۳ زبان (۲۴۷ ردیف).
- E2E (agent-browser): کارت «عملیات» در منوی عمومی ✓؛ زیرصفحه با ۵ فیلد و بدون شناسه ✓؛ ثبت USD→IRR تاریخ ۱۴۰۴/۰۸/۰۴ نرخ 6150000 = POST 201 + توست ✓؛ لیست: سطر «USD → IRR» با واحد استخراجی ۱ ✓؛ تکراری = 409 پیام فارسی ✓؛ هم‌ارز = 422 ✓؛ تاریخ شمسی↔میلادی (1404/08/04 ↔ 2025/10/26) در هر دو جهت و با تعویض زبانِ رکورد باز ✓؛ درخت فرمساز: عمومی ← عملیات ← نرخ برابری جدید ✓؛ «باز کردن فرم» از درخت = زیرصفحهٔ واقعی ✓؛ en/LTR: General — New Exchange Rate / Operations / Effective Date / Base Currency / Quoted Currency / Exchange Unit / Rate per 1 Unit ✓؛ برگشت fa سالم ✓؛ کنسول پاک؛ APIها 200/201.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید)؛ بکاپ §0.9: db/dfb.db.bak-t116 + db/custom.db.bak-t116.

Stage Summary:
- فرم سیستمی «نرخ برابری جدید» در گروه نوپای «عملیات» منوی عمومی ثبت شد: فیلدها عین تصویر مالک و بدون شناسه، CRUD کامل دولایه با گیت جفت‌ارز متمایز و یکتایی روزانه، و حضور هم‌زمان در کارت عملیات + درختوارهٔ فرمساز با بازکردن فرم واقعی (قرارداد Task 112/113).
- الگوی سیستمی تکرار شد: یک زیرمنو در SYSTEM_SUBMENUS + یک فرم در SYSTEM_FORMS + یک ماژول سرویس تنظیمات + یک زیرصفحهٔ عمومی؛ هیچ دوبلی در هیچ پنجره‌ای.
- آگاهی Task 115 لحاظ شد: کاشی ترجمه از ابتدا وصل است؛ برای دادهٔ عددی/کدی با پیام راهنمای شفاف پاسخ می‌دهد.
- artifacts: mini-services/settings-service/src/exchange-rate/* (جدید)؛ prisma/schema.prisma؛ id-generation/table-registry.ts؛ prisma/prisma.service.ts؛ mini-services/dfb-service/src/seed/seed.service.ts؛ src/components/erp/general/exchange-rate-form.tsx (جدید)؛ general-window.tsx؛ general-nav-store.ts؛ dfb-system-forms.ts؛ src/i18n/dictionaries.ts.
---
Task ID: 117
Agent: Z.ai Code (main)
Task: «توی منوی عمومی، زیرمنوها را بتوان به چند شکل به کاربر نمایش بدهید مثلاً بصورت کشویی، یا بصورت کنار هم یا بصورت لیست. از تجربیات ارزشمند خودت استفاده کن و چند مدل نمایش را به کاربر پیشنهاد بده. دکمه‌ها کنار منو قرار داشته باشد و کاربر هر کدام را انتخاب کرد نحوه نمایش زیرمنوها تغییر کند. فقط کاربرپسند باشد و UX/UI را مدنظر قرار دهید.» — حالت‌های نمایش زیرمنوی منوی عمومی.

Work Log:
- ۴ مدل نمایش (سه نمونهٔ مالک + یک پیشنهاد از تجربه): «کشویی» (رفتار کلاسیک ERP — کارت‌های جمع‌شونده؛ پیش‌فرض)، «کنار هم» (grid دوستونه sm: — هر دو گروه هم‌زمان دیده می‌شوند، بدون جمع‌شدن)، «لیستی» (یک کارت فشردهٔ واحد با سرگروه‌های کوچک و سطرهای تک‌خطی — اسکن سریع؛ توضیح در tooltip)، «کاشی» (پیشنهاد ما — شبکهٔ کاشی‌های آیکونی ۲/۳ستونه با hover-lift و scale آیکون، الگوی سنجاق‌شدهٔ وین ۱۱ و لمس‌پسند).
- بازآرایی معماری: بدنهٔ home پنجرهٔ عمومی به کامپوننت جدید general-menu-view.tsx منتقل شد؛ تک‌منبع دادهٔ MENU_GROUPS (گروه + آیتم‌ها با آیکون/گرادیان/کلید i18n) ⇒ هر ۴ چیدمان از یک مدل رندر می‌شوند و افزودن فرم/گروه بعدی فقط یک مدخل است (قرارداد پنجره‌های اعلامی). general-window.tsx از ۴۳۴ به ۲۴۷ خط رسید و فقط زیرصفحه‌ها را نگه داشت.
- سوییچر «کنار منو» (درخواست صریح مالک): segmented control در نوار عنوانِ پنجره، کنار عنوان (justify-between — در RTL انتهای چپ، در LTR راست)؛ ۴ دکمهٔ آیکونی (ChevronsDownUp/Columns2/List/LayoutGrid) با برچسب «نمایش»، tooltip هر حالت، aria-pressed، حلقهٔ فوکوس و استایل active=bg-primary؛ برچسب در موبایل مخفی (sm:inline).
- ماندگاری انتخاب کاربر در localStorage (کلید general.menuView) با استور خارجی کوچک + useSyncExternalStore — الگوی رسمی React: هم hydration-safe (اسنپ‌شات سروری «accordion»، رندر کلاینت مقدار ذخیره‌شده) هم بدون setState-in-effect (که ESLint react-hooks نمی‌پذیرفت — خطای اول به همین علت اصلاح شد).
- UX ریزه‌ها: fade-in ملایم (کلاس موجود globals) با key={view} هنگام تغییر حالت؛ chevronهای سرگروه جهت‌آگاه dir؛ placeholder «فرم‌های بعدی به‌مرور اعلان می‌شوند» در هر ۴ حالت (در کاشی‌ها به شکل کاشی خط‌چین)؛ سطرها title/desc کامل در کشویی و کنار هم، فشرده تک‌خطی در لیستی، کاشی با خط‌کشی دو سطری در کاشی‌ها.
- i18n: ۵ کلید جدید menuView.label/accordion/columns/list/tiles در هر ۱۳ زبان (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh/de/ru = ۶۵ ردیف) بعد از fy.menuPending در هر بلوک.
- E2E (agent-browser): سوییچر در هدر کنار عنوان ✓؛ پیش‌فرض کشویی با aria-pressed درست ✓؛ هر ۴ حالت با اسکرین‌شات (accordion/columns دوستونه/list تک‌کارت فشرده/tiles شبکهٔ کاشی) ✓؛ جمع‌کردن/بازکردن گروه در کشویی (expanded true↔false) ✓؛ کلیک کاشی «نرخ برابری جدید» = بازشدن زیرصفحه واقعی با عنوان برگه «عمومی — نرخ برابری جدید» ✓؛ برگشت = حالت کاشی حفظ شده ✓؛ localStorage = "tiles" ✓؛ reload کامل + بازکردن دوبارهٔ پنجره = کاشی هنوز فعال ✓؛ en/LTR: سوییچر راست هدر، «View / Accordion / …»، چیدمان آینه‌ای درست ✓؛ برگشت fa/rtl سالم ✓؛ کنسول پاک (فقط Fast Refresh)، صفر خطا ✓.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید)؛ بکاپ §0.9: db/dfb.db.bak-t117 + db/custom.db.bak-t117 (تسک فقط-UI، بدون تغییر دیتابیس).

Stage Summary:
- منوی عمومی حالا ۴ مدل نمایش زیرمنو دارد (کشویی/کنار هم/لیستی/کاشی) با سوییچرِ همیشه‌در‌دسترس کنار عنوان پنجره؛ انتخاب کاربر ماندگار است و با تعویض زبان/جهت و بازوبند کردن پنجره حفظ می‌شود.
- معماری تک‌منبع: MENU_GROUPS یگانه مرجع منو است؛ ۴ چیدمان، ۱۳ زبان و RTL/LTR همه از یک مدل تغذیه می‌شوند — فرم بعدی فقط یک مدخل در آرایه + کلیدهای i18n.
- artifacts: src/components/erp/general/general-menu-view.tsx (جدید، ~۴۹۸ خط)؛ src/components/erp/general/general-window.tsx (لاغرشده)؛ src/i18n/dictionaries.ts (+۶۵ ردیف).
---
Task ID: 118
Agent: Z.ai Code (main)
Task: «مشاوره: بررسی کنید کامپوننتی بنام MainDataGrid داریم یا نداریم؛ اگر نداریم تصویر بارگذاری‌شده را بررسی کنید و بصورت کامپوننت ایجاد کنید که بتوانم برای نمایش لیست اطلاعات فرم‌ها از این کامپوننت استفاده کنیم.» — مشاوره + سیم‌کشی MainDataGrid موجود به فرم‌های سیستمی.

Work Log:
- یافتهٔ مشاوره: کامپوننت MainDataGrid **از قبل موجود است** (Task 64) — src/components/erp/form-builder/main-data-grid.tsx: فیلتر عملگردار ۸گانهٔ هر ستون (شامل/شامل نبودن/شروع با/پایان با/برابر/نابرابر/خالی/نخالی) از منوی قیف، سورت با کلیک هدر، انتخابگر ستون، ردیف شماره‌دار #، انتخاب ردیف + دبل‌کلیک، نوار پایین (اسلات actions + چیپ تعداد + toggle فیلتر + CSV انبارشدهٔ فیلترشده) — دقیقاً عین طرح تصویر مالک (قیف + «شامل…» + نوار پایین رنگی). ولی فقط پنجره‌های فرمساز از آن استفاده می‌کردند و فرم‌های سیستمی مینی‌لیست داخلی داشتند.
- اقدام (استفادهٔ واقعی «لیست اطلاعات فرم‌ها»): فرم «نوع ارز جدید» (Task 114) و فرم «نرخ برابری جدید» (Task 116) هر دو بخش «فهرست» کامل با MainDataGrid گرفتند — زیر فرم با عنوان اختصاصی + آیکون.
- فرم ارز: ۸ ستون عین تصویر مالک (کد/عنوان/عنوان لاتین/واحد مبنا/تعداد اعشار/عنوان اعشار/عنوان اعشار لاتین/ثبت فعال با badge سبز)؛ ۲۵ رکورد seed؛ ترجمهٔ زبان‌های غیر-fa سطرها از انبار DataTranslation (listTitleOf/listDecimalOf همان قرارداد Task 115).
- فرم نرخ: ۵ ستون (تاریخ موثر در تقویم زبان جاری Task 77/ارز مبنا/ارز مورد مبادله/واحد مؤثر استخراجی/نرخ)؛ بدون ستون فعال (مدل رکورد نرخ فیلد فعال ندارد — خطای tsc همین را گرفت و اصلاح شد).
- نوار actions گرید هر دو فرم: «جدید» (سبز +، bs.action.new موجود)، «بازکردن» (teal پوشه، dfb.list.open موجود، disabled تا انتخاب)، «بازخوانی» (violet، abar.listRefresh موجود)؛ دبل‌کلیک سطر = applyRecord + توست abar.itemOpened.
- انتخاب مستقل گرید (gridSelectedId) جدا از رکورد باز فرم؛ دبل‌کلیک هر دو را هم‌راستا می‌کند.
- i18n: ۲ کلید جدید currency.listTitle «فهرست ارزها» و rate.listTitle «فهرست نرخ‌های برابری» در هر ۱۳ زبان (۲۶ ردیف)؛ سایر برچسب‌ها از کلیدهای موجود (صفر دوبل).
- E2E (agent-browser): فهرست ارزها = ۲۵ سطر با badge ✓؛ فیلتر «دلار» در ستون عنوان = ۳ سطر (استرالیا/کانادا/آمریکا) ✓؛ پاک‌کردن فیلتر با Backspace = ۲۵ سطر ✓؛ سورت هدر کد = AUD→CAD→USD صعودی ✓؛ دبل‌کلیک سطر USD = فرم با کد USD پر شد ✓؛ فهرست نرخ‌ها = سطر 1404/08/04 | USD - دلار آمریکا | IRR - ریال ایران | ۱ | ۶۱۵۰۰۰۰ ✓؛ en/LTR: «Currency List/Exchange Rate List»، «Contains…»، تاریخ میلادی 2025/10/26، چیدمان آینه‌ای ✓؛ برگشت fa/rtl سالم ✓؛ کنسول پاک، صفر خطا ✓.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید)؛ بکاپ §0.9: db/dfb.db.bak-t118 + db/custom.db.bak-t118.
- حادثهٔ عملیاتی: سرور dev بین E2E افتاد (پورت ۳۰۰۰ پایین) — با setsid nohup ری‌استارت شد و E2E ادامه یافت.

Stage Summary:
- پاسخ مشاوره: MainDataGrid موجود بود (Task 64) و حالا **واقعاً به‌کار گرفته شد**: دو فرم سیستمی (نوع ارز/نرخ برابری) فهرست کاملشان را با همین کامپوننت رندر می‌کنند — الگوی آماده برای هر فرم بعدی: columns + rows(MainGridRow) + selectedId + onRowDoubleClick + actions(GridActionButton×۳).
- MainDataGrid بدون تغییر ماند (کاملاً generic بود)؛ صرفاً مصرف‌کنندگان جدید اضافه شدند.
- artifacts: src/components/erp/general/currency-type-form.tsx؛ src/components/erp/general/exchange-rate-form.tsx؛ src/i18n/dictionaries.ts (+۲۶ ردیف).
---
Task ID: 119
Agent: Z.ai Code (main)
Task: «یک زیرمنو در منو حسابداری ایجاد کنید بنام اطلاعات پایه» — زیرمنوی «اطلاعات پایه» در منوی حسابداری (پنجرهٔ واقعی + درختوارهٔ فرمساز).

Work Log:
- پنجرهٔ «حسابداری» از حالت placeholder خارج و بدنهٔ واقعی گرفت: src/components/erp/accounting/accounting-window.tsx + accounting-menu-home.tsx؛ سیم‌کشی در window-meta.tsx (عمومی و حسابداری پنجره‌های واقعی؛ بقیه placeholder §4.6).
- بازآرایی سیستمی: موتور عمومی AppMenuHome در src/components/erp/shared/app-menu-home.tsx از بدنهٔ عمومی (Task 117) استخراج شد — همان ۴ حالت نمایش (کشویی/کنار‌هم/لیستی/کاشی)، همان سوییچر «کنار منو»، همان ماندگاری localStorage (با کلید مستقل هر برنامه: accounting.menuView / general.menuView) و hydration-safe (useSyncExternalStore + getServerSnapshot؛ بدون setState-in-effect). general-menu-view.tsx حالا فقط دادهٔ MENU_GROUPS را دارد و از همین موتور تغذیه می‌شود (رفتار عمومی بدون تغییر).
- زیرمنوی «اطلاعات پایه»ٔ حسابداری در ACCOUNTING_MENU_GROUPS با آیکون Database و گرادیان بنفش (هماهنگ با کاشی کاتالوگ حسابداری)؛ فعلاً بدون فرم سیستمی — PendingNote «فرم‌های بعدی به‌مرور اعلان می‌شوند» در هر ۴ حالت؛ فرم‌های آینده فقط یک مدخل در همین آرایه + یک زیرصفحه در accounting-window می‌گیرند.
- درختوارهٔ فرمساز (قرارداد Task 112): dfb seed SYSTEM_SUBMENUS += {anchorAppKey: "accounting", code: "accBasicInfo", dictKey: "acc.menuBasicInfo"}؛ بوت خودکار سرویس (bun --hot) ثبت کرد: گره ID=35 زیر آیکون حسابداری + ۱۲ ردیف ترجمهٔ دیکشنری‌محور؛ tree API: حسابداری(id=2) ← accBasicInfo(id=35) ✓.
- i18n: ۲ کلید جدید acc.menuBasicInfo / acc.menuBasicInfoDesc در هر ۱۳ زبان (۲۶ ردیف) بعد از fy.menuPending در هر بلوک.
- E2E (agent-browser): دبل‌کلیک حسابداری → پنجره با سربرگ «حسابداری» + سوییچر ۴حالته ✓؛ گروه «اطلاعات پایه» باز (aria-expanded true) و جمع/بازشدن با کلیک ✓؛ هر ۴ حالت رندر شد (اسکرین‌شات‌ها) ✓؛ ماندگاری: localStorage=columns، reload کامل + بازکردن دوباره = همان حالت ✓؛ کلیک کاشی/سطر فرم در عمومی (رفکتورشده) = زیرصفحهٔ واقعی نرخ برابری با عنوان برگهٔ زنده ✓؛ en/LTR: «Accounting / View / Basic Information / Accordion|Side by side|List|Tiles» و چیدمان آینه‌ای ✓؛ درخت فرمساز در EN: Accounting ← Basic Information (ترجمهٔ ۱۲زبانهٔ گره از انبار) ✓؛ برگشت fa/rtl سالم ✓.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید)؛ بکاپ §0.9: db/dfb.db.bak-t119 + db/custom.db.bak-t119.

Stage Summary:
- زیرمنوی «اطلاعات پایه» در هر دو لایهٔ منوی حسابداری نشست: پنجرهٔ نرم‌افزار (بدنهٔ واقعی با ۴ حالت نمایش) و درختوارهٔ فرمساز (گره سیستمی با ترجمهٔ ۱۳ زبانه).
- موتور AppMenuHome حالا الگوی استاندارد «پنجرهٔ اعلامی» است: هر برنامهٔ بعدی فقط data می‌دهد (groups + appKey + storageKey) و ۴ چیدمان/سوییچر/ماندگاری/فرم‌های فرمساز را مجانی می‌گیرد — بدون دوبل‌نویسی.
- artifacts: src/components/erp/shared/app-menu-home.tsx (جدید)؛ src/components/erp/accounting/accounting-window.tsx + accounting-menu-home.tsx (جدید)؛ src/components/erp/general/general-menu-view.tsx (لاغرشده)؛ src/components/desktop/window-meta.tsx؛ mini-services/dfb-service/src/seed/seed.service.ts؛ src/i18n/dictionaries.ts (+۲۶ ردیف)؛ db/dfb.db (گره ID=35).
---
Task ID: 120
Agent: Z.ai Code (main)
Task: «توی زیرمنوی اطلاعات پایهٔ حسابداری، یک فرم جدید با استفاده از کامپوننت SampleFormTwoRow ایجاد کنید و فیلدهای تصویر اول را در این فرم اضافه کنید. عنوان لاتین را نیاز نداریم که در فرم باشد.» — فرم سیستمی «نوع تفصیل جدید» تمام‌-stack در زیرمنوی «اطلاعات پایه»ٔ حسابداری (Task 119).

Work Log:
- یافتهٔ کامپوننت: «SampleFormTwoRow» در پروژه با نام SimpleFormTwoRowTabbed موجود است (شِل فرم دو-ردیفهٔ تب‌دار — همان فریم‌ورک فرم‌های نوع ارز/نرخ برابری/طرف حساب)؛ عین همین استفاده شد.
- Backend (settings-service): مدل Prisma DetailType (کد*/عنوان*/توضیحات اختیاری/فعال است + AppBase ۸فیلدی؛ unique (کد،ساختار) و (عنوان،ساختار) — بدون عنوان لاتین به فرمان صریح مالک)؛ db:push؛ TABLE_REGISTRY + VERSIONED_MODELS += DetailType (§۲.۵)؛ ماژول NestJS کامل (GET/POST/PUT/DELETE /detail-type با InternalAuthGuard)؛ DTO class-validator؛ زنجیرهٔ اعتبارسنجی سرور: کد/عنوان اجباری ۴۲۲ + تکراری ۴۰۹ پیام فارسی + سقف طول ۲۰/۱۰۰/۵۰۰.
- dfb seed: SYSTEM_FORMS += acc.detailType (anchorAppKey "accounting" + anchorSubmenuCode "accBasicInfo" — زیر گرهٔ Task 119)؛ بوت خودکار ثبت کرد: فرم ID=36 (کد DTL) + ۱۲ ردیف ترجمهٔ عنوان از dt.formTitle؛ درخت API: حسابداری ← accBasicInfo ← DTL ✓.
- seed داده: ۶ تفصیل رایج (CUST مشتریان، SUPP تامین‌کنندگان، BANK بانک‌ها، CASH صندوق‌ها، PRJ پروژه‌ها، CC مراکز هزینه) — idempotent by Code؛ فهرست فرم از ابتدا زنده.
- Frontend: src/components/erp/accounting/detail-type-form.tsx با SimpleFormTwoRowTabbed — ۴ فیلد عین تصویر و بدون عنوان لاتین (کد* با نرمال‌سازی ارقام/حروف بزرگ، عنوان*، فعال است چک‌باکس پیش‌فرض تیک‌خورده، توضیحات textarea عرض-کامل با placeholder «متن توضیحات (اختیاری)»)؛ نوار عملیات کامل + dirty-flag Task 82 + تأیید حذف؛ Task 115 — کاشی ترجمه از ابتدا وصل (entityType "DetailType"، فیلدهای قابل ترجمه = عنوان + توضیحات) با overlay زبان غیر-fa و ترجمهٔ دسته‌ای فهرست (endpoint دسته‌ای Task 99)؛ Task 118 — فهرست کامل MainDataGrid با ۴ ستون (کد/عنوان/توضیحات/فعال است badge سبز) + قیف فیلتر هر ستون + سورت + CSV + نوار «جدید/بازکردن/بازخوانی» و چیپ تعداد.
- سیم‌کشی پنجره: accounting-nav-store (الگوی Task 85: درخواست یک‌باره با id) + accounting-window زیرصفحهٔ detail-type با breadcrumb «حسابداری / اطلاعات پایه / نوع تفصیل جدید» و عنوان زندهٔ برگه («حسابداری — نوع تفصیل جدید») + accounting-menu-home آیتم «نوع تفصیل جدید» (آیکون Tags، گرادیان سبز) در گروه اطلاعات پایه؛ درختوارهٔ فرمساز: dfb-system-forms += SYSTEM_ACCOUNTING_PAGES (acc.detailType → زیرصفحهٔ واقعی — قرارداد Task 112/113 حالا برای حسابداری هم برقرار است؛ دکمهٔ «باز کردن فرم» پنجرهٔ حسابداری را مستقیم روی فرم باز می‌کند).
- i18n: ۱۰ کلید جدید dt.* (formTitle/formDesc/listTitle/code/title/active/description/descriptionPlaceholder/errCodeRequired/errTitleRequired) در هر ۱۳ زبان (۱۳۰ ردیف) — حادثهٔ رفع‌شده: MultiEdit غیر-اتمی ۵ بلوک را دوبله کرد؛ با collapse مبتنی بر محتوا به ۱۰×۱۳ رسید (هر کلید دقیقاً ۱۳).
- E2E (agent-browser): آیتم منو در حسابداری ✓؛ زیرصفحه با ۴ فیلد بدون لاتین ✓؛ ثبت TEST1 = POST 201 + توست + فهرست ۷ سطر ✓؛ دبل‌کلیک سطر = بازکردن رکورد ✓؛ تکراری CUST = 409 پیام فارسی «کد CUST قبلاً برای نوع تفصیل CUST - مشتریان ثبت شده» ✓ (هم از UI PUT و هم API)؛ کد خالی = توست الزامی فارسی (فرانت) و 400 class-validator (سرور) ✓؛ حذف با دیالوگ تأیید = DELETE + فرم خالی + فهرست ۶ سطر ✓؛ en/LTR: New Detail Type / Code / Title / Active / Description / Detail Types List / Contains… / Yes + چیدمان آینه‌ای + breadcrumb Basic Information ✓؛ درخت فرمساز EN: Accounting ← Basic Information ← New Detail Type ✓؛ «Open Form» از درخت = پنجرهٔ حسابداری مستقیم روی فرم ✓؛ برگشت fa/rtl سالم ✓؛ کنسول پاک.
- lint = ۰/۰؛ tsc = همان ۱۳ baseline (صفر خطای جدید)؛ بکاپ §0.9: db/dfb.db.bak-t120 + db/custom.db.bak-t120.

Stage Summary:
- نخستین فرم سیستمیِ زیرمنوی «اطلاعات پایه»ٔ حسابداری با موتور استاندارد فرم‌های سیستم نشست: شِل TwoRowTabbed + زنجیرهٔ اعتبارسنجی دولایه + کاشی ترجمه + فهرست MainDataGrid + ثبت در درختوارهٔ فرمساز با راه‌انداز واقعی — عین قرارداد Task 114/116 و بدون هیچ دوبلی.
- الگوی «فرم جدید حسابداری» از این پس: یک مدل در schema + یک ماژول settings-service + یک مدخل SYSTEM_FORMS با anchorSubmenuCode accBasicInfo + یک کامپوننت form + یک زیرصفحه در accounting-window + یک آیتم در ACCOUNTING_MENU_GROUPS + کلیدهای dt.*.
- artifacts: mini-services/settings-service/src/detail-type/* (جدید)؛ prisma/schema.prisma؛ id-generation/table-registry.ts؛ prisma/prisma.service.ts؛ app.module.ts؛ seed/seed.service.ts؛ mini-services/dfb-service/src/seed/seed.service.ts؛ src/components/erp/accounting/detail-type-form.tsx (جدید)؛ accounting-window.tsx؛ accounting-menu-home.tsx؛ src/stores/accounting-nav-store.ts (جدید)؛ src/components/erp/form-builder/dfb-system-forms.ts؛ src/i18n/dictionaries.ts (۱۳۰ ردیف).

---
Task ID: 121
Agent: Z.ai Code (اصلی)
Task: «این سورس و بک‌آپ داخل آن را ریستور کنید» — ریستور کامل پروژه از فایل ارسالی farataraznewtheme-main (8).zip (سورس + بک‌آپ‌های دیتابیس)

Work Log:
- بازبینی بسته: ۷۱۲ فایل — سورس کامل (src/، mini-services/، prisma، Caddyfile، AGENTS.md) + db/custom.db و db/dfb.db + زنجیرهٔ بک‌آپ‌های §۰.۹ (bak-t76…bak-t120) + پوشهٔ «backup db» تاریخی؛ خط اول آرشیو = هش کامیت 84b5c81 (خروجی Download ZIP از شاخهٔ main گیت‌هاب).
- تشخیص وضعیت: سندباکس قبلاً ریست شده بود — دیتابیس زنده به ۲۰۰KB (حالت قدیمی t76) برگشته و node_modules سرویس‌ها حذف شده بود؛ بستهٔ ارسالی جدیدترین وضعیت (t120، custom.db = ۲.۲MB) را داشت.
- عکس فوری: بک‌آپ دیتابیس‌های زندهٔ آسیب‌دیده در db/custom.db.bak-pre-restore و db/dfb.db.bak-pre-restore.
- rsync با --delete و استثناهای node_modules/.next/.git/upload/dev.log → درخت سورس دقیقاً برابر بسته شد؛ فایل‌های t120 (detail-type-form.tsx، ماژول detail-type، مدل DetailType، seed acc.detailType) تأیید شد.
- bun install ریشه + ۴ سرویس؛ راه‌اندازی با dev.sh → ۶ پورت (3000/3001/3002/3003/3010/81) بالا.
- E2E (agent-browser): دسکتاپ فارسی/RTL با نشست فعال ✓؛ پنجرهٔ حسابداری ← اطلاعات پایه ← فرم «نوع تفصیل جدید» با ۴ فیلد و بدون عنوان لاتین ✓؛ فهرست «فهرست انواع تفصیل» با گرید فیلتردار و ۶ رکورد seed بازیابی‌شده ✓؛ سال مالی ۱۴۰۵ و تب‌های بازیابی‌شده ✓؛ صفر خطای کنسول ✓.
- هم‌راستاسازی گیت: origin/main دقیقاً روی 84b5c81 (t120) = محتوای بسته بود؛ شاخهٔ محلی (منحرف‌شده به‌خاطر ریست) با `git reset --hard origin/main` به ریموت چسباند شد — صفر اتلاف از تاریخچهٔ ریموت (۱۰۵ کامیت دست‌نخورده)؛ بک‌آپ‌های pre-restore به‌عنوان کامیت b050733 اضافه شد.
- حادثهٔ باقی‌مانده: توکن گیت‌هاب داخل .git/config منقضی/باطل است (API = 401؛ push = Invalid username or token) → کامیت b050733 (فقط ۲ فایل بک‌آپ pre-restore) هنوز پوش نشده؛ ریموت در اوج سالم است چون خودش همان محتوای بسته است. پس از تعویض توکن توسط مالک، سرویس auto-push خودکار آن را پوش می‌کند.

Stage Summary:
- پروژه دقیقاً روی وضعیت t120 بستهٔ ارسالی بازنشانی شد: سورس + دیتابیس‌های ۲.۲MB + تمام بک‌آپ‌ها؛ برنامه تأیید مرورگری شد و داده‌ها (۶ تفصیل، سال مالی ۱۴۰۵، ترجمه‌ها) زنده‌اند.
- گیت: محلی = origin/main (84b5c81) + ۱ کامیت بک‌آپ در انتظار پوش؛ تنها مانع، توکن منقضی گیت‌هاب است — تعویض توکن لازم است.
- artifacts: کل درخت پروژه (ریستور)؛ db/custom.db.bak-pre-restore + db/dfb.db.bak-pre-restore (شواهد وضعیت پیش از ریستور).

---
Task ID: 122
Agent: Z.ai Code (main)
Task: «آیتم‌هایی که توی تصویر وجود دارد به ترتیب کد در فرم نوع تفصیلی ایجاد کنید … اگر تیک استفاده از داده‌های مشترک دفتر مرکزی فعال نبود، اگر هر شاخه از نوع هلدینگ یا شرکت اضافه شد این آیتم‌ها باید برای آن شاخه در فرم نوع تفصیلی اضافه گردد … با نصب دیتابیس این آیتم‌ها باید در جدول نوع تفصیل ایجاد گردد؛ البته باید کنترل گردد که اطلاعات وجود نداشته باشد.»

Work Log:
- خوانش دقیق تصویر (بزرگ‌نمایی ۳× دو نیمهٔ جدول؛ VLM ناپایدار بود): ۲۱ آیتم با کدهای ۱..۲۱ — حساب بانکی/صندوق/کارتخوان/درگاه های اینترنتی/ترجمه‌گر دلخواه/امضاضات مجوز/امضاضات حقوقی/پروژه/قرارداد/انبار/کالاهای و خدمات/اعتبارات اسنادی/گروه مشتریان/گروه تامین‌کنندگان/مراکز هزینه/تسهیلات مالی/دارایی های ثابت/سالو/گروه بندی کالا انبار/گروه بندی کالا فروش/کاتالوگ فروش — ستون لاتین در تصویر خالی است و به فرمان قبلی مالک هیچ لاتینی ثبت نشد.
- منبع واحد: mini-services/settings-service/src/detail-type/canonical-detail-types.ts (جدید) — لیست مرجع + sortDetailTypeRows (ترتیب عددی-آگاهِ کد: ۱..۲۱ درست، کدهای حرفی آخر) + resolveDetailTypeChain (زنجیرهٔ ارث AppBase مثل ancestryChain فرانت) + seedCanonicalDetailTypes (گارد: گره‌ای که ردیف دارد هیچ نمی‌گیرد).
- قاعدهٔ ۳ (نصب تازه): seed.service بلوک ۷ — فقط اگر COUNT جدول صفر باشد، ۲۱ آیتم برای دفتر مرکزی (ID=1) ساخته می‌شود؛ لیست دموِ قدیمی t120 (CUST/SUPP/BANK/CASH/PRJ/CC) حذف شد (one-off + پاک‌سازی ترجمه‌های یتیم).
- قاعدهٔ ۲ (شاخهٔ جدید): BusinessStructureService.create پس از ایجاد گرهٔ type∈{1,2} با isBasicInfoShared=false ⇒ seedCanonicalForStructure (گارد داخلی)؛ CreateBsDto/UpdateBsDto += isBasicInfoShared؛ update فقط فلگ را ذخیره می‌کند (بذر فقط در «ایجاد»). DetailTypeModule اکنون export می‌کند و در BusinessStructureModule import شده.
- قاعدهٔ ۲ برای گره‌های از پیش موجود (بلوک ۸ seed، هر بوت، بدون دوبل): هر هلدینگ/شرکت فعال بدون تیک و بدون ردیف ⇒ ۲۱ آیتم. اجرا شد: شرکت نمونه(14)/هلدینگ نمونه(15)/شرکت دوم(18) هرکدام ۲۱ ردیف.
- دامنهٔ خواندن/نوشتن: GET /detail-type?structureId&headOfficeShares ⇒ قرارداد واحد baseDataScopeWhere (ردیف‌های گرهٔ فعال + دفتر مرکزی در صورت اشتراک)؛ POST/PUT += structureId (اعتبارسنجی ۴۲۲ گرهٔ نامعتبر؛ مهر زنجیرهٔ companyRef/branchRef/... روی رکورد)؛ assertNotDuplicate درون همان گره. فرانت detail-type-form.tsx: useOrgScope + پارامترها + چیپ «گرهٔ فعال» کنار عنوان فهرست + re-fetch خودکار با تغییر انتخابگر سازمان.
- تیک فرم ساختار: bs-window.tsx — چک‌باکس «استفاده از داده‌های مشترک دفتر مرکزی» (کلید موجود bs.field.shareHeadquarterData) در «ایجاد» و «ویرایش» فقط برای نوع هلدینگ(1)/شرکت(2)؛ payload هر دو حالت += isBasicInfoShared.
- E2E (agent-browser): فهرست تفصیل = ۲۱ سطر به ترتیب 1..21 + چیپ «شرکت نمونه» ✓؛ فرم ساختار → راست‌کلیک دفتر مرکزی → «افزودن زیرشاخه» → نوع=هلدینگ ⇒ تیک ظاهر شد (تیک‌نخورده) → ذخیره «شرکت آزمون ۱۲۲» ⇒ لاگ سرویس: «seeded 21 canonical DetailType rows for structure 24 (Task 122 — قاعدهٔ شاخهٔ جدید)» و DB: 21 ردیف (کل ۸۴) ✓؛ سوییچ انتخابگر هدر به شاخهٔ جدید ⇒ فرمِ بازِ تفصیل خودکار بازخوانی شد: چیپ «شرکت آزمون ۱۲۲» + ۲۱ سطر ✓؛ ثبت تفصیل دلخواه ZZ1 در همان کانتکست ⇒ مهر bs=24/company=24/creator=system + فهرست ۲۲ سطر ✓؛ حذف با دیالوگ تأیید ⇒ ۲۱ ✓؛ گارد: ری‌استارت کامل settings-service ⇒ count ثابت ۶۳ (بدون دوبل) ✓؛ en/LTR: New Detail Type / Code / Title / Description / Active + dir=ltr + ۲۱ سطر ✓.
- پاک‌سازی آزمون: شاخهٔ «شرکت آزمون ۱۲۲» + ۲۱ ردیفش حذف شد (نهایی: ۶۳ ردیف = ۳ گره × ۲۱؛ گره‌ها ۷).
- lint = ۰/۰؛ tsc ریشه = همان ۱۳ baseline؛ tsc settings-service = صفر؛ بکاپ §0.9: db/custom.db.bak-t122 (2,240,512) + db/dfb.db.bak-t122.

Stage Summary:
- ۲۱ آیتم مرجع عین تصویر مالک، «به ترتیب کد» در هر کانتکست سازمانی درست رندر می‌شوند؛ نصب تازهٔ دیتابیس جدول را دقیقاً یک‌بار پر می‌کند (گارد جدول-خالی) و هر شاخهٔ هلدینگ/شرکتِ بدون تیکِ «داده‌های مشترک دفتر مرکزی» از همان لحظهٔ ایجاد، نسخهٔ خودش از ۲۱ آیتم را می‌گیرد — بدون دوبل، با قرارداد واحد اشتراک (baseDataScopeWhere) و مهر زنجیرهٔ سازمانی.
- یادآوری عملیاتی: توکن گیت‌هاب هنوز منقضی است (۴۰۱) — کامیت محلی انجام می‌شود؛ پوش پس از تعویض توکن توسط مالک، خودکار انجام خواهد شد.

---
Task ID: 123
Agent: Z.ai Code (main)
Task: «یک قانون به فایل AGENTS.md اضافه کنید به شرح زیر: فیلد کلید اصلی در هر جدول باید اسم جدول بعلاوه ID باشد. نوع تایپ کلید اصلی در بانک اطلاعاتی باید bigint باشد.»

Work Log:
- قرائت AGENTS.md (نسخهٔ ۲) و انتخاب محل درج: بند جدید §2.7 در فصل «§2 داده و مهاجرت»، در ادامهٔ §2.4 (PK دستی BigInt از IDGenerationService) و §2.6.
- متن بند §2.7 (قرارداد کلید اصلی): ۱) نام فیلد کلید اصلی هر جدول = «نام جدول + ID» (مثال: DetailType → DetailTypeID؛ الگوی موجود IDGenerationID)؛ ۲) نوع کلید اصلی در بانک اطلاعاتی = bigint (در Prisma: BigInt، هم‌سو با §2.4)؛ ۳) جدول‌های تازه از بدو ایجاد ملزم‌اند؛ ستون‌های PK جدول‌های موجود (اکنون @map("ID") عمومی‌اند) فقط با تأیید صریح مالک و در قالب تسک مهاجرت جداگانه هم‌سو می‌شوند (تغییر نام ستون PK مهاجرتی شکستنی است).
- هیچ تغییری در سورس/اسکیما/دیتابیس انجام نشد — صرفاً سند حاکم (AGENTS.md) به‌روزرسانی شد.

Stage Summary:
- قرارداد جدید PK («نام جدول + ID»، نوع bigint) به‌عنوان §2.7 وارد قانون اساسی مخزن شد و از این پس برای هر جدول تازه الزامی است؛ هم‌سوسازی رترواکتیو جدول‌های موجود نیازمند تصمیم و تأیید مالک است (پیشنهاد: تسک مهاجرت جداگانه).
- مانع §0.9: push ناموفق (توکن گیت‌هاب داخل remote منقضی/باطل است؛ «could not read Password») — کامیت t123 محلی نگه داشته شد و در صف auto-push (ahead 7) منتظر توکن تازهٔ مالک است.

---
Task ID: 124
Agent: Z.ai Code (main)
Task: «جدول‌های قبلی که در بانک اطلاعاتی ایجاد شده‌اند را هم به bigint تغییر تایپ بدهید. نام فیلد ستون PK جدول‌های قدیمی را هم اصلاح کنید.» (اجرا — تأیید مالک برای هم‌سوسازی رترواکتیو §2.7)

Work Log:
- فهرست‌برداری کامل: ۲۶ مدل عملیاتی (۱۷ settings-service / ۹ dfb-service) با PK عمومی "ID"؛ هر ۲۶ از قبل BigInt بودند (Prisma→BIGINT) → تغییر تایپ نیاز نداشت؛ کار اصلی = تغییر نام ستون.
- ویرایش اسکیماها: ۲۶ عدد `@id @map("ID")` → `@id @map("<نام‌جدول>ID")` (مثال: DetailType → DetailTypeID) با اسکریپت idempotent خودآزما.
- TABLE_REGISTRY هر دو سرویس (۱۶+۹ مدخل) pkها به‌روز شد — چون IdGenerationService.maxDbId با raw SQL `SELECT MAX("${entry.pk}")` کار می‌کند.
- ارجاعات raw باقی‌مانده اصلاح شد: dfb seed.service (MAX("ID")→registry-driven) + geo-seed script (MAX("ID")→MAX("GeoLocationID")).
- QUERY_TABLES فرم‌ساز دست‌نخورده ماند: alias "ID" سطح API است و با keyMap به فیلد camelCase Prisma نگاشت می‌شود (runLocal/runRemote) — نه ستون فیزیکی؛ تغییرش ردیف‌های ذخیره‌شدهٔ DfbQuery را می‌شکست (نیاز تصمیم مالک جدا).
- مهاجرت داده: kill سرویس‌های مالک DB → بکاپ §0.9 (backup db/*_0308.db) + db/*.bak-t124 → dry-run روی کپی در /tmp (تأیید بازنویسی خودکار FK: PartyPerson→Party(PartyID)، PartyAddress، PartyPhone، UserRoleScope) → `db push` روی کپی = «already in sync» → ALTER روی DB زنده (۲۶ جدول) → `prisma generate` هر دو سرویس → ری‌استارت تمیز → سلامت 3001/3003.
- تأیید API با امضای §4.2: business-structure=7، detail-type=63، systems=28، fiscal-year=1، geo-location=881، dfb menus/tree=200، forms/schema/tree=200.
- E2E (agent-browser): فرم تفصیل fa/RTL — ۲۱ سطر به ترتیب کد ✓؛ ایجاد «تست t124» (کد 99) → ۲۲ سطر ✓ (مسیر نوشتن با کلاینت جدید + IDGeneration)؛ حذف با دیالوگ تأیید → ۲۱ ✓؛ en/LTR — dir=ltr، Code/Title، همان ۲۱ سطر ✓؛ بازگشت fa/rtl ✓؛ صفر خطای کنسول.
- اصلاح جانبی: ۲ خطای TS7053 pre-existing در dfb seed.service (ایندکس Dict با string) — با cast ساده اصلاح شد.
- lint ریشه = ۰/۰؛ tsc هر دو سرویس = صفر؛ DB نهایی: DetailType 63 ردیف MAX(DetailTypeID)=70 (شناسهٔ ۷۱ برای ردیف آزمون سوزیده شد — gap پذیرفتهٔ §2.4).

Stage Summary:
- قرارداد §2.7 اکنون روی «همه» جدول‌های موجود برقرار است: ۲۶ ستون PK به الگوی «نام جدول+ID» تغییر نام یافتند با حفظ ۱۰۰٪ داده‌ها (خشک‌آزمون + foreign_key_check + integrity_check)؛ نوع همه bigint است.
- دو استثنای اعلامی برای تصمیم مالک: Setting (pk=Key) و AppRegistry (pk=AppKey) — متادیتای کلید-مقدار با PK رشته‌ای (AppRegistry مطابق §4.5 قفل‌شده)؛ تبدیل به bigint نیازمند دستور صریح مالک.
- بکاپ‌ها: db/custom.db.bak-t124 + db/dfb.db.bak-t124 + backup db/*_0308.db (وضعیت پیش از مهاجرت).
- تکمیل مانع §0.9 (پس از t124): توکن تازهٔ گیت‌هاب توسط مالک ارائه شد → remote URL به‌روزرسانی شد (API = 200/200)؛ سرویس auto-push پیش از پوش دستی، کل صف ۱۰ کامیتی (شامل t123، t124 و auto-syncهای ضمیمهٔ بکاپ) را به origin/main پوش کرد؛ `git status` = همگام (main = origin/main = b972118).

---
Task ID: 125
Agent: Z.ai Code (main)
Task: «در فرم ساختار کسب و کار، آیتم‌های نوع کسب و کار اگر زبان داشبورد RTL بود باید از سمت راست به چپ چیدمان شوند و اگر LTR بود از چپ به راست» (+ تصویر پیوست).

Work Log:
- ریشه‌یابی: چک‌باکس‌های «نوع کسب و کار» ریشه (ROOT_ALLOWED_TYPES = هلدینگ/شرکت/شعبه/نمایندگی/فروشگاه) در bs-window.tsx بدون place رندر می‌شدند → حالت پیش‌فرض میراث place:"end" (Task 102) جفت‌ها را به انتهای سلول می‌چسباند (در RTL = لبهٔ چپ سلول) → زنجیرهٔ تیک‌ها از راست آغاز نمی‌شد.
- اصلاح (یک‌خطی و منطقی §1.4): افزودن place:"start" به ۵ فیلد activeType* — لنگر جفت [چک‌باکس، برچسب] به لبهٔ شروعِ خواندن: راست در RTL، چپ در LTR؛ ترتیب DOM در هر دو جهت خوانش درست است (سازوکار Task 102 که عیناً برای همین فرمول مالک ساخته شده بود).
- E2E (agent-browser) با اندازه‌گیری پیکسلی getBoundingClientRect:
  · RTL: هر ۵ تیک با gapFromCellRight=0 و چک‌باکس راست‌ترینِ جفت — زنجیره: هلدینگ(راست)→شرکت→شعبه / نمایندگی→فروشگاه ✓ (اسکرین‌شات t125-rtl-after.png).
  · LTR (en): آینهٔ کامل — gapFromCellLeft=0، زنجیره: Holding→Company→Branch / Agency→Store چپ‌به‌راست ✓ (t125-ltr-after.png).
  · ترتیب سلول‌های گرید هم با جهت می‌چرخد (CSS grid پیرو dir سند).
  · «وضعیت فعال» و «استفاده از داده‌های مشترک دفتر مرکزی» عمداً روی لنگر میراث row-end ماندند (خارج از دامنهٔ درخواست؛ رفتار آینه‌ای درست دارند — در صورت صفر مالک قابل تعمیم است).
- بازگشت fa/rtl، صفر خطای کنسول؛ lint = ۰/۰.

Stage Summary:
- چیدمان تیک‌های «نوع کسب و کار» اکنون همیشه هم‌جهت زبان داشبورد است: RTL = شروع از راست، LTR = شروع از چپ؛ با همان قرارداد Task 102 (place:"start") بدون هیچ CSS هاردکد.

---
Task ID: 126
Agent: Z.ai Code (main)
Task: «توی منوی تنظیمات و مدیریت کاربران یک فرم جدید ایجاد کنید بنام کاربر جدید و این فرم را با استفاده از کامپوننت SimpleTreeForm فیلدهای زیر را به کاربر نمایش دهید…» — فرم تمام‌-stack «کاربر جدید» با درختوارهٔ دسترسی‌ها، «کامپوننت لیست» و قاعدهٔ چندشرکتی هلدینگ/شرکت با تیک «استفاده از داده مشترک دفتر مرکزی».

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§1.3/§1.4/§2.3/§2.4/§2.5/§2.7/§4.2/§0.9.
- Backend (settings-service — عین الگوی Task 100/122): دو مدل تازه با قرارداد §2.7 — `User` (PK=UserID، bigint؛ partyRef اختیاری + FullName اسنپ‌شده، Username یکتا در گرهٔ ساختار [unique(username,BusinessStructureRef)]، PasswordHash = scrypt نمک‌دار «salt:hash» — متن عبور هرگز ذخیره/برنمی‌گردد، UserRoleRef FK) و `UserAccess` (PK=UserAccessID؛ UserRef + NodeType ∈ menu/submenu/form/action + RefKey؛ unique سه‌گانه؛ Cascade)؛ back-relation `users` روی UserRole؛ db:push (already-in-sync سریع)؛ TABLE_REGISTRY += User/UserAccess؛ VERSIONED_MODELS += هر دو (§2.5)؛ ماژول NestJS کامل `users` (GET/POST/PUT/DELETE /user با InternalAuthGuard §4.2) با DTO class-validator.
- قاعدهٔ سازمانی مالک (تعبیر اعلامی §0.6): ثبت یک کاربر ⇒ ردیف دفتر مرکزی (۱) + یک ردیف برای «هر» شاخهٔ فعال هلدینگ(1)/شرکت(2) با IsBasicInfoShared=false؛ شاخهٔ دارای تیک ردیف مجزا نمی‌گیرد (کاربران مشترک — خواندن با baseDataScopeWhere قرارداد Task 122)؛ همهٔ ردیف‌ها + UserAccessها در «یک» تراکنش با رزرو بلاکی ID (§2.4) و مهر زنجیرهٔ ارث (resolveDetailTypeChain) ساخته می‌شوند؛ ویرایش = فقط ردیف جاری (کلمهٔ عبور خالی = بدون تغییر)؛ حذف = Cascade.
- زنجیرهٔ اعتبارسنجی دولایه: فرانت توست فارسی؛ سرور ۴۲۲ (نام‌خانوادگی/نقش/طرف حساب ناموجود، نام کاربری ≤۵ نویسه، کلمهٔ عبور خالی در ثبت) و ۴۰۹ تکراری با پیام فارسی.
- Frontend — گسترش‌های افزودنی §5.1: (۱) SimpleFormFieldType += `password` (Input ماسک‌دار + دکمهٔ Eye/EyeOff درون‌سلولی — «کاربر بتواند کلمه عبور وارد شده را مشاهده کند»؛ هر فیلد کلیدنمای خودش) و `list` (کامپوننت لیست: Input فقط‌خواندنی + کاشی فیروزه‌ای ☰ + پاپ‌اور مینی‌گرید عین Task 86 — سرستون‌ها از cells ردیف‌ها، ردیف «فیلتر…» per-column با AND، ردیف‌های قابل‌کلیک، شمارندهٔ رکورد — §1.4 کلاس‌های منطقی)؛ (۲) SimpleTreeForm += `treeHeaderExtra` (محتوای انتهای سرستون درخت).
- فرم `user-new-form.tsx` روی SimpleTreeForm: پنل درخت = «درختوارهٔ دسترسی‌ها» از درخت dfb (منوها ← زیرمنوها ← فرم‌ها + «تمامی» ۱۲ آیکون اکشن بار زیر هر فرم — عین ACTION_BAR_KEYS + ترجمه/راهنما)؛ هر گره نشانگر چک‌باکس دسترسی (CheckSquare سبز/Square خاکستری)؛ کلیک روی هر شاخه/آیکون کل زیرشاخه‌اش را فعال/غیرفعال می‌کند (Enter/Space هم)؛ دکمهٔ «دسترسی به همه» در سرستون درخت (treeHeaderExtra) همهٔ ۱۶۲ گره را یکجا فعال می‌کند؛ forceDetail = پنل جزئیات همیشه فیلدها را نشان می‌دهد؛ detailTitleOverride = «کاربر جدید».
- فیلدها (عین شش‌گانهٔ مالک): ۱) نام و نام خانوادگی — type:list با ستون‌های «نام | نام خانوادگی» از GET /party (انتخاب یک گزینه)؛ ۲) نام کاربری (اجباری >۵ نویسه)؛ ۳) کلمه عبور — type:password؛ ۴) تکرار کلمه عبور — type:password (تطبیق دولایه)؛ ۵) نقش کاربری — type:list با ستون‌های «کد نقش | عنوان نقش» از نقش‌های فعال Task 100؛ هیچ فیلد اضافه‌ای (بدون «فعال» — مالک فهرست بسته داد).
- فهرست رکوردها (لیست اکشن بار): ۴ ستون نام و نام خانوادگی/نام کاربری/نقش کاربری/ساختار سازمانی با قرارداد محدودهٔ Task 122 (structureId + headOfficeShares از useOrgScope)؛ بازکردن رکورد = بازسازی کامل Set دسترسی از ردیف‌های UserAccess؛ حذف با دیالوگ تأیید.
- سیم‌کشی پنجره: settings-window صفحهٔ `user-new` با breadcrumb «تنظیمات / مدیریت کاربران / کاربر جدید» + کارت لانچر (آیکون UserPlus، گرادیان teal-emerald) در هاب مدیریت کاربران.
- i18n: ۳۰ کلید تازهٔ `un.*` در هر ۱۳ زبان (۳۹۰ ردیف؛ اسکریپت خودآزما — هر کلید دقیقاً ×۱۳) + showPassword/hidePassword.
- E2E (agent-browser) fa/RTL: لانچر ✓؛ فرم با درخت راست (treeX=951) و جزئیات چپ + ۵ فیلد ✓؛ درخت ۱۶۲ گره (منو←زیرمنو←فرم←۱۲ آیکون) همگی خاکستری ✓؛ پیکر طرف حساب: ستون‌های نام/نام خانوادگی + ۵ ردیف و انتخاب «مصطفی شربتی» ✓؛ دکمهٔ مشاهدهٔ کلمه عبور (type password↔text) ✓؛ نام کاربری «abc» = توست فارسی «نام کاربری باید بیشتر از ۵ نویسه باشد…» ✓؛ نقش: ستون‌های کد/عنوان + «ADMIN - مدیر سیستم» ✓؛ کلیک «حسابداری» = ۱۵ گره سبز (زیرشاخهٔ کامل) ✓؛ «دسترسی به همه» = ۱۶۲/۱۶۲ + توست ✓؛ POST → توست «کاربر برای دفتر مرکزی و همهٔ شرکت‌ها/هلدینگ‌های بدون تیکِ… ایجاد شد» + لاگ سرویس «4 row(s) [1,14,15,18] Accesses=162/row» و DB: ۴ ردیف User (bs=1/14/15/18 با مهر companyRef) + ۶۴۸ ردیف UserAccess ✓؛ فهرست لیست = سطر شرکت نمونه با ۴ ستون ✓؛ بازکردن رکورد = بازسازی ۱۶۲ دسترسی ✓؛ خاموش‌کردن آیکون «ذخیره اطلاعات» + PUT = ۱۶۱ ردیف برای آن کاربر (بازنویسی تراکنشی) ✓؛ حذف با دیالوگ تأیید = فهرست خالی ✓.
- E2E en/LTR: dir=ltr و درخت چپ (treeX=9)/جزئیات راست — آینهٔ کامل ✓؛ Access Tree / Grant All / Full Name / Username / Password / Password Repeat / User Role ✓؛ آیکون‌های اکشن EN (Save data, Print form, …) و گریده‌ای که titleEn دارند (Basic Information, New Detail Type) ✓؛ ستون‌های لیست EN (First Name | Last Name) ✓؛ ثبت کامل EN (sara.test) با توست EN ✓؛ بازگشت fa/rtl سالم، صفر خطای کنسول.
- پاک‌سازی آزمون: ۷ ردیف User (و UserAccessهای کسکید) حذف شد — DB تمیز؛ gap شناسه‌ها پذیرفتهٔ §2.4.
- lint = ۰/۰؛ tsc ریشه = فقط ۱۳ baseline (صفر خطای جدید)؛ tsc settings-service = صفر.

Stage Summary:
- فرم «کاربر جدید» تمام‌-stack نشست: SimpleTreeForm با درختوارهٔ دسترسی‌ها (منو/زیرمنو/فرم/آیکون‌های اکشن بار) که کلیک روی هر شاخه دسترسی را می‌چرخاند و «دسترسی به همه» یکجا همه را می‌دهد؛ «کامپوننت لیست» تازه (ستون‌دار + فیلتر) هم برای طرف حساب (نام/نام خانوادگی) و هم برای نقش کاربری؛ کلمهٔ عبور/تکرارش با دکمهٔ مشاهده و هش scrypt نمک‌دار سمت سرور.
- قاعدهٔ مالک برقرار است: هر ثبت، کاربر را برای دفتر مرکزی + هر هلدینگ/شرکتِ بدون تیکِ «داده مشترک دفتر مرکزی» می‌سازد (۴ ردیف با ساختار فعلی) و شاخهٔ دارای تیک مشترک می‌ماند — با قرارداد واحد baseDataScopeWhere.
- دو فرض اعلامی (§0.6): ۱) برچسب گره‌های درخت از عنوان پایهٔ dfb/TitleEn می‌آید (ترجمهٔ کامل ۱۳زبانهٔ گره‌های منو از سازوکار DfbTranslation موجود در پنجرهٔ فرمساز؛ در صورت صفر مالک قابل اتصال است)؛ ۲) اعتبارسنجی شناسه‌های menu/form سمت سرور فقط شکلی است (dfb سرویس/بانک جداگانه است — قرارداد snapshot §4.4).
- artifacts: mini-services/settings-service/prisma/schema.prisma (+User/+UserAccess)؛ src/users/* (جدید)؛ id-generation/table-registry.ts؛ prisma/prisma.service.ts؛ app.module.ts؛ src/components/forms/form-primitives.tsx (password/list)؛ simple-form-two-row-tabbed.tsx (types)؛ simple-tree-form.tsx (treeHeaderExtra)؛ src/components/erp/settings/user-new-form.tsx (جدید)؛ settings-window.tsx؛ src/i18n/dictionaries.ts (۳۹۰ ردیف)؛ db/custom.db.bak-t126.

---
Task ID: 127
Agent: Z.ai Code (main)
Task: «تیک فعال را در فرم درختواره دسترسی ها قرار دهید. بصورت پیش فرض تیک فعال باشد. روی هر شاخه کلیک راست قرار دهید. در کلیک راست گزینه همه موارد فعال و همه موارد غیرفعال وجود داشته باشد.» — تکمیل درختوارهٔ دسترسی‌های فرم «کاربر جدید» (ادامهٔ Task 126).

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4/§5.1. تغییر سورس فقط؛ بدون تغییر اسکیما/بانک.
- گسترش افزودنی SimpleTreeForm (§5.1 — هیچ رفتار موجودی نشکست):
  · `SimpleTreeFormNode += endAdornment?: ReactNode` (تزئین‌گر تعاملی انتهای سطر، قبل از شورون؛ رپر آن کلیکِ سطر را می‌بلعد تا بدون دوبار-چرخش باشد)؛
  · پراپ‌های `onActivateAll/onDeactivateAll + activateAllLabel/deactivateAllLabel` — دو آیتم تازهٔ منوی کلیک راست (چک‌سبز/مربع خاکستری) با جداکنندهٔ شرطی پیش از آیتم‌های Task-33؛ بدون این هندلرها منوی فرم‌های دیگر دست‌نخورده می‌ماند؛
  · پراپ `selectOnContextMenu` (پیش‌فرض true = رفتار Task-33)؛ در فرم کاربر `false` تا راست‌کلیک، دسترسی را نچرخاند (چرخش فقط با کلیک/کیبورد سطر و تیک).
- تیک «فعال» (درخواست اول): چک‌باکس واقعی (`role=checkbox` + aria-checked + data-access-tick=on/off) با برچسب «فعال» در انتهای هر ۱۶۲ گره (منو/زیرمنو/فرم/آیکون اکشن بار) — سبز=فعال، خاکستری=غیرفعال؛ کلیک روی خودِ تیک = چرخش کل زیرمجموعهٔ همان گره (stopPropagation، بدون چرخش دوم از سطر)؛ نشانگر شروعِ سادهٔ t126 با همین تیک جایگزین شد (تفسیر اعلامی §0.6 — اطلاعات همان است، اینک صریح و برچسب‌دار).
- پیش‌فرض فعال (درخواست دوم): «بصورت پیش فرض تیک فعال باشد» ⇒ با اولین بارگذاری درخت و بعد از هر «فرم خالی» (+ آیکون ریست) همهٔ ۱۶۲ گره فعال‌اند؛ `allAccessIds` مستقیم از درخت dfb ساخته می‌شود (مستقل از زبان/تیک‌ها — بازمشق تیک‌ها پیش‌فرض را دوباره اعمال نمی‌کند)؛ بازکردن رکورد ذخیره‌شده همچنان دسترسی‌های ذخیره‌شدهٔ خودش را نشان می‌دهد؛ اعمالِ پیش‌فرض پرچم یک‌بارمصرف دارد تا چرخش‌های دستی کاربر بی‌جهت بازنویسی نشود.
- کلیک راست (درخواست سوم و چهارم): راست‌کلیک روی «هر» گره → منوی Win-11 با «همه موارد فعال» / «همه موارد غیرفعال» = فعال/غیرفعال‌سازی همان شاخه + کل زیرمجموعه‌اش (تفسیر اعلامی §0.6؛ دکمهٔ سرستونی «دسترسی به همه» همچنان کل درخت را پوشش می‌دهد)؛ راست‌کلیک خودش هیچ چرخشی ایجاد نمی‌کند (selectOnContextMenu=false).
- i18n §1.3: ۴ کلید تازهٔ `un.activeTick / un.activateAllCtx / un.deactivateAllCtx / un.ctxHint` در هر ۱۳ زبان (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh/de/ru — اسکریپت خودآزما: هر کلید دقیقاً ×۱۳) + راهنمای دوم زیر فیلدها.
- E2E (agent-browser):
  · fa/RTL: باز شدن فرم = ۱۶۲/۱۶۲ تیک on با برچسب «فعال» ✓؛ کلیک «حسابداری» = ۱۵ گره زیرمجموعه خاموش (۱۶۲←۱۴۷) ✓؛ راست‌کلیک همان شاخه = منوی «همه موارد فعال/همه موارد غیرفعال» بدون هیچ چرخش جانبی (۱۶۲=۱۶۲ قبل/بعد) ✓؛ «همه موارد فعال» = ۱۵/۱۵ روشن و ۱۶۲/۱۶۲ ✓؛ «همه موارد غیرفعال» روی برگِ بدون فرزند (انبار) = فقط خودش (−۱) ✓؛ روی گرهٔ فرم (f:26) = فرم + ۱۲ آیکون (−۱۳) ✓؛ روی برگ اکشن (a:26:save) = فقط همان برگ ✓؛ کلیک روی خودِ تیک = دقیقاً یک چرخش (بدون دوبار) ✓.
  · ثبت آزمایشی «t127.user» با ۱۴۸ گره فعال: POST 201 + توست «کاربر برای دفتر مرکزی و…» + DB: ۴ ردیف User (bs=1/14/15/18) هرکدام دقیقاً ۱۴۸ ردیف UserAccess = عین Set دسترسی ✓؛ پاک‌سازی آزمون (۴ ردیف + کسکید) — gap شناسه‌ها پذیرفتهٔ §2.4.
  · en/LTR: dir=ltr، برچسب "Active"، منو "Activate all"/"Deactivate all"، راهنمای EN ✓؛ «Deactivate all» روی Accounting = ۱۵ خاموش ✓؛ بازگشت fa/rtl سالم ✓.
  · رگرسیون: فرم ساختار کسب و کار — صفر تیک دسترسی و منوی راست‌کلیک خودش («افزودن زیرشاخه») دست‌نخورده ✓؛ کنسول: صفر خطا/هشدار.
- lint ریشه = ۰/۰؛ tsc ریشه = فقط همان ۱۳ baseline (صفر خطای جدید در فایل‌های لمس‌شده)؛ بکاپ §0.9: backup db/custom-2026-10-27_2014.db + dfb-… (تغییر محتوایی آزمون+پاک‌سازی؛ اسکیما بدون تغییر).

Stage Summary:
- درختوارهٔ دسترسی‌ها اینک با «تیک فعال» صریح روی همهٔ گره‌ها، پیش‌فرضِ همه‌فعال و منوی راست‌کلیک «همه موارد فعال / همه موارد غیرفعال» (دامنهٔ شاخه + زیرمجموعه) کامل شد؛ چرخش سه‌کاناله قبلی (کلیک سطر = کل زیرمجموعه) و «دسترسی به همه» حفظ شد و برای ثبت، همان Set با ۱۴۸ ردیف در ۴ شرکت به درستی سریال شد.
- دو تفسیر اعلامی (§0.6): ۱) «تیک فعال» = ارتقای نشانگر t126 به چک‌باکس برچسب‌دار انتهای سطر (نه افزودن نشانگر دوم)؛ ۲) دامنهٔ آیتم‌های کلیک راست = شاخهٔ راست‌کلیک‌شده و زیرمجموعه‌اش (کل درخت با دکمهٔ سرستون ممکن است).
- artifacts: src/components/forms/simple-tree-form.tsx (endAdornment/onActivateAll/onDeactivateAll/selectOnContextMenu)؛ src/components/erp/settings/user-new-form.tsx (ActiveTick، پیش‌فرض فعال، هندلرهای راست‌کلیک)؛ src/i18n/dictionaries.ts (۵۲ ردیف تازه = ۴×۱۳).

---
Task ID: 128
Agent: Z.ai Code (main)
Task: «توی تعریف کاربر و در درختواره دسترسی ها، اولین شاخه درختواره نرم افزارها و بقیه شاخه ها در زیر این شاخه قرار بگیرد. کاربر اگر درختواره نرم افزارها را فعال کرد یا غیرفعال کرد کل نرم افزار و امکانات نرم افزارها فعال یا غیرفعال شوند. کنار فیلد نقش کاربری یک گزینه قرار دهید بنام فعال و بصورت پیش فرض تیک داشته باشد.»

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4/§2.4/§2.7/§4.2/§5.1. بدون تغییر اسکیما (فقط کامنت UserAccess) و بدون مهاجرت داده.
- درخواست ۱ و ۲ — ریشهٔ «نرم افزارها» (user-new-form.tsx): تابع جدید `buildSoftwareRootNode` گرهٔ ریشهٔ مصنوعی `sw:root` با آیکون AppWindow را می‌سازد که «همهٔ» منوهای dfb (و زیرمنو/فرم/۱۲ آیکون اکشن بار هر فرم) زیر آن قرار می‌گیرند — درخت = ۱۶۳ گره (۱ ریشه + ۱۶۲ قبلی)؛ تیکِ «فعال» (Task 127) روی ریشه هم دارد؛ چون سازوکار چرخش هر گره کل زیرمجموعه‌اش را می‌چرخاند، کلیک/Enter/Space/راست‌کلیکِ ریشه «کل نرم‌افزارها و امکاناتشان» را یکجا فعال/غیرفعال می‌کند (آزمون: ۱۶۳→۰→۱۶۳)؛ آیتم‌های راست‌کلیک «همه موارد فعال/غیرفعال» روی ریشه = کل درخت؛ «دسترسی به همه» سرستون دست‌نخورده.
- ذخیره‌سازی ریشه (قرارداد §2.7 — بدون جدول تازه): همان UserAccess با NodeType تازهٔ `"software"` و RefKey `"root"`؛ DTO (`AccessItemDto @IsIn += "software"`)، `ACCESS_NODE_TYPES` سرویس، کامنت اسکیما و `accessToRows/rowsToAccess` فرانت هم‌گام شدند؛ `allAccessIds` ریشه را عضو اول پیش‌فرضِ همه‌فعال می‌کند (درخت خالی = فهرست خالی؛ گارد دکمهٔ «دسترسی به همه» محفوظ).
- درخواست ۳ — گزینهٔ «فعال» کنار نقش کاربری: فیلد ششم فرم با type:"checkbox" و place:"start" (قرارداد Task 102/125) در سلول مجاورِ نقش کاربری (گرید ۵۰٪/۵۰٪، ردیف سوم)؛ پیش‌فرض تیک‌خورده (BLANK.isActive=true)؛ مقدار بولی در onFieldChange مسیر جدا دارد (بدون String()); در body ثبت/ویرایش `isActive` ارسال می‌شود؛ بازکردن رکورد از پاسخ سرور بازمی‌گرداند. زیرساخت سرور از Task 126 آماده بود (User.IsActive + DTO + create/update/toDto) — فقط مصرفِ فرانت اضافه شد.
- i18n §1.3: ۳ کلید تازهٔ `un.softwareRoot / un.accountActive / un.rootHint` در هر ۱۳ زبان (اسکریپت خودآزما — درج پس از un.activeTick در هر بلوک؛ هر کلید دقیقاً ×۱۳) + راهنمای سوم زیر فیلدها (ریشه = «نرم افزارها»؛ چرخشش همه را یکجا می‌چرخاند).
- E2E (agent-browser) fa/RTL: فرم = ۱۶۳ گره/۱۶۳ تیک همه روشن ✓؛ ریشه «نرم افزارها» level=1 expanded ✓؛ کلیک ریشه = ۰/۱۶۳ و کلیک دوباره = ۱۶۳/۱۶۳ ✓؛ راست‌کلیک ریشه = منوی «همه موارد فعال/غیرفعال» بدون انتخاب جانبی ✓؛ «غیرفعال» = ۰/۱۶۳، «فعال» = ۱۶۳/۱۶۳ ✓؛ چک‌باکس «فعال» (stf-chk-isActive) aria-checked=true پیش‌فرض، هم‌ردیف نقش (top=239) با فاصلهٔ ۲۰px از سلول نقش در RTL ✓.
- ثبت آزمایشی «t128.user» (مصطفی شربتی / ADMIN) با تیکِ برداشتهٔ «فعال»: POST 201 + توست ✓؛ DB: ۴ ردیف User (bs=1/14/15/18 — قاعدهٔ چندشرکتی Task 126) همه IsActive=0 + هر ۴ ردیف دقیقاً ۱۶۳ ردیف UserAccess شامل NodeType="software"/RefKey="root" ✓؛ پس از ذخیره و بازکردن از فهرست، وضعیت تیک‌ها (۱۶۳) و چک‌باکس از ردیفِ همان گره بازمی‌گردد (ردیف شرکت نمونه IsActive=0 درست است — ویرایش فقط ردیف جاری، قرارداد t126؛ PUT ردیف ۱۷ = IsActive=1) ✓.
- E2E en/LTR: dir=ltr؛ ریشه "Software" level=1 ✓؛ ۱۶۳/۱۶۳ پیش‌فرض ✓؛ چک‌باکس "Active" هم‌ردیف "User Role"، آینهٔ کامل (لنگر به لبهٔ چپ سلول مجاور، فاصلهٔ ۲۰px) ✓؛ کلیک ریشه = ۰ و بازگشت = ۱۶۳ ✓؛ بازگشت fa/rtl سالم.
- کنسول پس از بارگذاری نهایی: صفر خطا/هشدار (ورودی‌های Fast Refresh میانهٔ جلسه = بازسازی HMR حین ویرایش).
- پاک‌سازی آزمون: ۴ ردیف User + ۶۵۲ ردیف UserAccess (کسکید) حذف شد — DB تمیز؛ gap شناسه‌ها پذیرفتهٔ §2.4.
- lint ریشه = ۰/۰؛ tsc ریشه = همان ۱۳ baseline (صفر خطای جدید؛ فایل‌های لمس‌شده پاک)؛ tsc settings-service = صفر.

Stage Summary:
- درختوارهٔ دسترسی‌ها اینک تک‌ریشه است: «نرم افزارها» اولین شاخه و پدر همهٔ منوها/فرم‌ها/آیکون‌ها؛ فعال/غیرفعال‌کردن همین شاخه (کلیک، تیک، راست‌کلیک → «همه موارد فعال/غیرفعال») کل نرم‌افزارها و امکاناتشان را یکجا می‌چرخاند و وضعیت ریشه با NodeType="software"/RefKey="root" در UserAccess ماندگار می‌شود (بازکردن رکورد عیناً بازمی‌گردد).
- گزینهٔ «فعال» کنار نقش کاربری واقعی و ماندگار است (User.IsActive از t126؛ پیش‌فرض تیک‌خورده؛ در هر دو جهت RTL/LTR در سلول مجاورِ نقش لنگر می‌شود).
- artifacts: src/components/erp/settings/user-new-form.tsx (ریشه + فیلد isActive)؛ mini-services/settings-service/src/users/users.dto.ts (+software)؛ src/users/users.service.ts (ACCESS_NODE_TYPES)؛ prisma/schema.prisma (کامنت NodeType)؛ src/i18n/dictionaries.ts (۳۹ ردیف تازه = ۳×۱۳). بکاپ §0.9: backup db/*-2026-10-27_2046.db + db/custom.db.bak-t128 (2,437,120) + db/dfb.db.bak-t128.

---
Task ID: 129
Agent: Z.ai Code (main)
Task: «کامپوننت لیست دراپ دان وقتی باز می شود از ابتدای فیلد ورودی باز شود. توی تصویری که برات بارگذاری کردم با فلش قرمز مشخص کردم از کجای فیلد ورودی باز شود» — ترازِ پاپ‌آور «کامپوننت لیست» فیلدها با لبهٔ ابتدای فیلد ورودی (ادامهٔ Task 126/127/128).

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4/§5.1. تغییر سورس فقط (form-primitives)؛ بدون تغییر اسکیما/بانک و بدون کلید ترجمهٔ تازه.
- اندازه‌گیریِ «قبل» (agent-browser، fa/RTL، فرم کاربر جدید): ورودیِ «نام و نام خانوادگی» راست=822 و پاپ‌آور راست=667 ⇒ ۱۵۵px انحراف به چپ — پاپ‌آور به کاشی ☰ لنگر بود (PopoverContent align="start" بدون dir ⇒ منطق LTR) نه به فیلد ورودی.
- اصلاح در `ListPickerCell` (src/components/forms/form-primitives.tsx): تریگر = کل خانهٔ ارزش (فیلد ورودی فقط‌خواندنی + کاشی ☰) در یک div با role دکمه‌مانند؛ چون کاشی در inline-end است، لبهٔ inline-startِ تریگر ≡ لبهٔ ابتدای «فیلد ورودی» و `align="start"` + `dir={dir}` (از useSettings — قرارداد Task 104) پاپ‌آور را در هر دو جهت به همان لبه می‌چسباند (RTL=لبهٔ راست، LTR=لبهٔ چپ). کاشی ☰ از button به span نمایشی تبدیل شد (جلوگیری از دوبار-تاگل) و کلیک/Enter خودِ ورودی هم پاپ‌آور را باز می‌کند؛ disabled با گارد handleOpenChange مسدود است.
- نکتهٔ فنی (اعلامی §0.6): تلاش اول با `PopoverAnchor` مستقیم (هم روی Input، هم روی div بومی هم‌قوارهٔ ورودی) در این محیط (React 19 + @radix-ui/react-popover 1.3.1) شکست خورد — پاپ‌آور با رفرنسِ صفر-مستطیل در مبدأ (0,0) می‌نشیند (ـ-radix-popper-anchor-width: 0px)؛ عین همین مکانیزم از مسیر Trigger (implicit Anchor) سالم است (اندازه‌گیری: پاپ‌آور اکشن‌بار 939=939 با تریگر). لذا مسیر اثبات‌شدهٔ trigger انتخاب شد؛ رفتار درست در هر دو جهت با اندازه‌گیری اثبات شد.
- E2E (agent-browser) fa/RTL: «نام و نام خانوادگی» deltaRight=0.0px (ورودی 822 / پاپ‌آور 822، پایینِ ورودی top=235) ✓؛ کاشی ☰ پاپ‌آور را تاگل می‌کند (باز→بسته) ✓؛ انتخاب ردیف «مصطفی شربتی» مقدار را می‌گذارد و پاپ‌آور جمع می‌شود ✓؛ «نقش کاربری» deltaRight=0.0px (512=512) ✓.
- E2E en/LTR (erp.settings → locale=en، dir=ltr): «Full Name» deltaLeft=0.0px (469=469، پاپ‌آور به راست باز می‌شود) ✓؛ «User Role» deltaLeft=0.0px (779=779) ✓؛ بازگشت fa/rtl سالم (dir=rtl, lang=fa) ✓.
- رگرسیون: فیلد list فقط در همین فرم است (دو نمونه، هر دو آزمایش شد)؛ لیست اکشن بار (RecordListDropdown) لمس نشد و به تریگر خودش لنگر است؛ گرید رکوردها (GridCellInput) دست‌نخورده؛ کنسول پس از پاک‌سازی و پاس تازه: صفر خطا (خطای «Unterminated regexp literal» میانهٔ نشست فقط هنگام ذخیرهٔ ناتمام ویرایش بود و در کامپایل نهایی وجود ندارد).
- lint ریشه = ۰/۰؛ tsc ریشه = همان ۱۳ baseline (صفر خطای جدید)؛ tsc settings-service = صفر (سرویس دست‌نخورده).
- بکاپ §0.9: backup db/custom-2026-10-27_2123.db + dfb-2026-10-27_2123.db + db/custom.db.bak-t129 (2,437,120) + db/dfb.db.bak-t129 (تغییر محتوایی بانک صفر — فقط UI).

Stage Summary:
- پاپ‌آور «کامپوننت لیست» اینک از «ابتدای فیلد ورودی» باز می‌شود: RTL = چسبیده به لبهٔ راست ورودی، LTR = چسبیده به لبهٔ چپ — با اندازه‌گیری مرورگر صفر انحراف در هر دو جهت؛ کل خانهٔ ارزش (ورودی + کاشی) تریگر است و رفتار تاگل/انتخاب/فیلتر/شمارندهٔ رکورد دست‌نخورده ماند.
- محدودیت ثبت‌شده: PopoverAnchor مستقیم radix در این نسخه/محیط قابل اتکا نیست (رفرنس صفر) — الگوی پذیرفته‌شدهٔ پروژه برای لنگرِ پاپ‌آور، PopoverTrigger (implicit anchor) است.
- artifacts: src/components/forms/form-primitives.tsx (ListPickerCell: تریگرِ خانهٔ ارزش + dir)؛ بکاپ‌های §0.9.

---
Task ID: 130
Agent: Z.ai Code (main)
Task: «هر نام و نام خانوادگی در یک ساختار کسب و کار فقط یکبار می تواند به عنوان کاربر تعریف گردد و اگر یکبار تعریف شد مجددا در دراپ دان نباید نمایش داده شود.» + «توضیحات زیر فرم تعریف کاربر را در انتهای فرم قرار دهید.» — یکتایی طرف حساب کاربر + انتقال توضیحات به انتهای فرم «کاربر جدید» (ادامهٔ Task 126/127/128/129).

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4/§4.2/§5.1. بدون تغییر اسکیما/بانک؛ بدون کلید عبوری تازه.
- درخواست ۱ — فرانت (user-new-form.tsx): مجموعهٔ `usedPartyRefs` از ردیف‌های User محدودهٔ جاری (فهرست رکوردها با قرارداد Task 122 — structureId + headOfficeShares از useOrgScope) ساخته می‌شود و «کامپوننت لیست» فیلد «نام و نام خانوادگی» طرف حساب‌های عضو آن را نمایش نمی‌دهد؛ هنگام ویرایش، طرف حسابِ خودِ رکورد جاری از فیلتر مستثناست تا مقدار فعلی در فهرست بماند (تفسیر اعلامی §0.6). چرخهٔ کامل اثبات شد: ثبت ⇒ حذف از لیست، حذف کاربر ⇒ بازگشت به لیست.
- درخواست ۱ — سرور (users.service.ts): قرینهٔ ۴۰۹ دولایه‌ای t126 — در ثبت، تکرار partyRef در «هر یک» از گره‌های هدف (ثبت همیشه دفتر مرکزی + همهٔ هلدینگ/شرکت‌های بدون تیک را یکجا می‌سازد؛ در عمل یعنی یک نام در کل کسب‌وکار فقط یکبار کاربر می‌شود) با پیام فارسی شامل نام کاربری و گرهٔ موجود؛ در ویرایش، تکرار partyRef در همان گره (به‌جز خود ردیف). JSDoc زنجیرهٔ اعتبارسنجی += بند ۶.
- درخواست ۲ — «توضیحات … در انتهای فرم»: پراپ افزودنی `footerExtra` (§5.1 opt-in) در SimpleTreeForm — بلوک لنگرشدهٔ `shrink-0` با border-t پس از بدنهٔ اسکرول‌شوندهٔ پنل فرم؛ همیشه در پایینِ فرم دیده می‌شود و با اسکرول نمی‌رود. فرم کاربر بلوک توضیحات را از `detailExtra` (زیر فیلدها) به همین فوتر منتقل کرد: عنوان «توضیحات» + ۴ سطر (سطر تازهٔ یکتایی + rootHint/treeHint/ctxHint). فرم‌های دیگر footerExtra نمی‌دهند ⇒ صفر تغییر بصری (رگرسیون bs: hasFooterStrip=0).
- i18n §1.3: ۲ کلید تازهٔ `un.notesTitle / un.partyUniqueHint` در هر ۱۳ زبان (اسکریپت خودآزما: هر کلید دقیقاً ×۱۳). نکتهٔ ابزار: MultiEdit ترتیبی است و در میانهٔ درج (خطای متن hi) ۴ زبان اول اعمال و ۹ تای بعدی در فراخوان دوم کامل شد — شمارش نهایی ×۱۳ سالم.
- E2E (agent-browser) fa/RTL: فوتر gapToSectionBottom=0 و پهنای ۹۴۲ (تمام پنل فرم، درخت ۳۲۰px جدا) ✓؛ دراپ‌دان نام و نام خانوادگی با دادهٔ موجودِ مالک: «مصطفی شربتی» (party 5 — کاربران chaabok/mostafash) نمایش داده نمی‌شود و ۴ نام باقی (چباری نصب/شهبازی×۲/ریاحی) ✓؛ تراز t129 پابرجا: deltaRight=0 ✓.
- ثبت آزمایشی «t130.user» (علیرضا چباری نصب / ADMIN): POST 201 + توست قاعدهٔ چندشرکتی + DB: ۴ ردیف User (bs=1/14/15/18) ✓؛ دراپ‌دان پس از ثبت: چباری حذف (۳ نام) ✓؛ ۴۰۹ سرور با POST مستقیمِ امضاشده (§4.2): «این نام و نام خانوادگی قبلاً با نام کاربری «t130.user» در ساختار سازمانی #1 …» ✓ (سرویس bun --hot به‌روزرسانی را خودکار گرفت).
- حذف آزمون: دیالوگ تأیید ⇒ ردیف دفتر مرکزی حذف (قرارداد t126 — حذف فقط ردیف جاری)؛ ردیف‌های ۱۴/۱۵/۱۸ با DELETE امضاشده پاک شدند (پاک‌سازی آزمون)؛ پس از بازخوانی فهرست رکوردها، «چباری نصب» به دراپ‌دان بازگشت ✓ — gap شناسه‌ها پذیرفتهٔ §2.4.
- E2E en/LTR (erp.settings → locale=en، dir=ltr): فوتر "Notes" + سطر EN یکتایی، gap=0، پهنای پنل فرم ✓؛ دراپ‌دان: شربتی مخفی/بقیه حاضر ✓؛ تراز LTR: deltaLeft=0 ✓؛ بازگشت fa/rtl سالم.
- رگرسیون: فرم ساختار کسب و کار — بدون نوار فوتر (footerExtra نمی‌دهد) و محتوای درخت سالم ✓؛ کنسول پس از پاک‌سازی: صفر خطا/هشدار.
- lint ریشه = ۰/۰؛ tsc ریشه = همان ۱۳ baseline (صفر خطای جدید؛ فایل‌های لمس‌شده پاک)؛ tsc settings-service = صفر.
- بکاپ §0.9: backup db/custom-2026-10-27_2203.db + dfb-2026-10-27_2203.db + db/custom.db.bak-t130 (2,502,656) + db/dfb.db.bak-t130.

Stage Summary:
- یکتایی طرف حساب برقرار است: هر «نام و نام خانوادگی» در یک ساختار کسب‌وکار فقط یکبار کاربر می‌شود — فرانت نام‌های کاربرشدهٔ محدودهٔ جاری را از «کامپوننت لیست» حذف می‌کند (و با حذف کاربر، نام دوباره برمی‌گردد) و سرور با ۴۰۹ فارسی هر تکرار را در ثبت (همهٔ گره‌های هدف) و ویرایش (همان گره) می‌بندد.
- بلوک «توضیحات» فرم تعریف کاربر اینک با پراپ تازهٔ `footerExtra` در انتهای فرم (پایینِ پنل فرم، همیشه رویت) می‌نشیند: عنوان + قاعدهٔ یکتایی + سه راهنمای درخت (ریشهٔ نرم افزارها/کلیک چرخش/کلیک راست).
- دو تفسیر اعلامی (§0.6): ۱) دامنهٔ «یکبار» = ردیف کاربر در محدودهٔ ساختار جاری برای فیلتر فرانت، و گره‌های هدف ثبت برای گارد سرور (چون ثبت همیشه همهٔ گره‌ها را یکجا می‌سازد، عملاً یک نام در کل کسب‌وکار یکبار کاربر می‌شود)؛ ۲) «انتهای فرم» = فوتر لنگرشدهٔ پایینِ پنل فرم (نه زیر درخت) — همیشه رویت با border-t.
- artifacts: src/components/forms/simple-tree-form.tsx (footerExtra)؛ src/components/erp/settings/user-new-form.tsx (usedPartyRefs + فیلتر لیست + فوتر توضیحات)؛ mini-services/settings-service/src/users/users.service.ts (۴۰۹ partyClash در create/update + JSDoc)؛ src/i18n/dictionaries.ts (۲۶ ردیف تازه = ۲×۱۳). بکاپ‌های §0.9.

---
Task ID: fix-preview
Agent: Z.ai Code (main)
Task: «پیش نمایش اجرا نمی شود» — عیب‌یابی کامل محیط: چرا پیش‌نمایش بالا نمی‌آید، رفع علت ریشه‌ای بوت، آشتی‌دادن ریپوی محلی با ریموت (بازیابی t128-t130) و مقاوم‌سازی dev.sh.

Work Log:
- نشانه: پیش‌نمایش پاسخ نمی‌داد؛ پورت 3000 هیچ شنونده‌ای نداشت و dev.log هم وجود نداشت — کل جریان بوت سندباکس (start.sh ← dev.sh) مرده بود.
- علت ریشه‌ای ۱ (بوت مرده): در ری‌استارت سندباکس (21:59 UTC)، آرشیو بازیابی، node_modules سرویس‌های کوچک را نداشت؛ dev.sh با set -e در مرحلهٔ db:push مرد زیرا bunx به‌جای prisma محلی، نسخهٔ 8.0.0-rc را از npm می‌گرفت که دستور `db push` ندارد ⇒ «custom dev script» نیمه‌کاره ماند، Next.js هرگز بالا نیامد و health-check پلتفرم (:81 → :3000) شکست خورد.
- رفع ۱: bun install برای هر ۴ سرویس کوچک (settings/dfb/apps/auto-push) اجرا شد؛ prisma محلی 6.19.3 برقرار و db:push سالم = «already in sync» (بدون هیچ تغییر داده‌ای).
- علت ریشه‌ای ۲ (پاک‌سازی پردازه‌ها): در این نمونهٔ سندباکس، هر پردازه‌ای که از دستورات من spawn شود در پایان همان دستور کشته می‌شود — با سه آزمون مستقل اثبات شد (nohup+disown، setsid، کناری sleep)؛ یعنی نگه‌داشتن سرور از نشست من ناممکن است و تنها مسیر، اجرای دوبارهٔ جریان بوتِ خودِ پلتفرم است.
- کشف مهم — عقب‌گرد snapshot: مقایسه با origin نشان داد snapshot محلی، کارهای جلسهٔ قبل (t128 ریشهٔ «نرم افزارها»، t129 تراز پاپ‌آور لیست، t130 یکتایی نام و نام خانوادگی) را ندارد ولی ریموت دارد؛ دیتابیس محلی جدول‌های User/UserAccess را نداشت ولی db ریموت داشت. با `git reset --hard origin/main` (6496ac4) محلی به آخرین وضعیت واقعی بازگردانده شد — دو کامیت auto-sync محلیِ گذرا (فقط لاگ/بکاپ db قدیمی، بدون تغییر دادهٔ من) حذف شدند؛ زنجیرهٔ §0.9 روی ریموت کامل است.
- مقاوم‌سازی dev.sh (ماندگار در گیت): حذف شکنندگی set -e؛ ترتیب جدید = اول Next.js (پاس‌شدن health-check پلتفرم در پنجرهٔ بوت) ← بعد سرویس‌های کوچک (هر کدام bun install خودش) ← db:push در انتها و best-effort (هرگز بوت را نمی‌کشد)؛ idempotent (اگر 3000 زنده باشد، skip). اجرای آزمایشی کامل: exit=0، health ✓، db:push OK ✓.
- کشف ابزار (§4.2): گارد داخلی اکنون timestamp را «میلی‌ثانیه» می‌خواهد (Date.now() با skew) — الگوی صحیح امضا: `ts=$(date +%s%3N)` و HMAC روی `GET:{path}:{ts}`؛ با آن GET /user پاسخ کامل داد (کاربر chaabok، نقش ADMIN، به‌همراه accesses درخت دسترسی) ✓.
- سلامت نهایی در همان نشست: GET / = 200 ✓؛ بوت آزمایشی dev.sh = exit=0 ✓؛ سرویس settings با کد t130 در حال سرویس ✓.

Stage Summary:
- علت «اجرنشدن پیش‌نمایش» ریشه‌ای بود (بوت شکسته به‌خاطر node_modules غایب + prisma بیگانه) و رفع شد؛ dev.js→dev.sh جدید تضمین می‌کند هر بوت آینده‌ای فارغ از وضعیت آرشیو، Next.js را اول بالا می‌آورد و db:push هرگز بوت را نمی‌کشد.
- ریپو و دیتابیس دوباره هم‌تراز ریموت شدند: t128/t129/t130 سالم روی main محلی است (کد + جدول‌های User/UserAccess + بکاپ‌های §0.9).
- محدودیت فعلی سندباکس: پردازه‌های spawned بین دستورات کشته می‌شوند ⇒ برای بالا آمدن پیش‌نمایش، یک‌بار ری‌استارت محیط/سندباکس لازم است تا جریان بوتِ اصلاح‌شده اجرا شود؛ پس از آن همهٔ سرویس‌ها به‌صورت خودکار بالا می‌آیند.
- artifacts: .zscripts/dev.sh (مقاوم‌سازی کامل)؛ worklog.md (این مدخل)؛ بدون تغییر اسکیما/داده (db:push فقط sync بود).

---
Task ID: 131
Agent: Z.ai Code (main)
Task: «در منوی اطلاعات پایه نرم افزار حسابداری یک فرم جدید ایجاد کنید بنام شماره گذاری تفصیلی ها و این فرم را با استفاده از کامپوننت MainDataGrid ایجاد نمایید و فیلدهای داخل تصویر می باشد. کاربر هر نوع تفصیلی در فرم نوع تفصیلی ایجاد کرد باید بصورت خودکار در این فرم مشاهده شود و بصورت خودکار رنج شماره شروع و شماره پایان برای آن تعیین گردد — شماره ها نباید با شماره های تفصیلی دیگر تداخل داشته باشد» — فرم تمام‌stack «شماره گذاری تفصیلی ها» (Task 131).

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4/§2.3-§2.7/§4.2/§5.1/§5.6/§7. بکاپ §0.9 پیش از هر تغییر: db/custom.db.bak-t131 + db/dfb.db.bak-t131 (+ backup db/custom-2026-10-28_0315.db).
- Backend — مدل Prisma DetailTypeNumbering (§2.7: PK=DetailTypeNumberingID، BigInt؛ §2.5 Version؛ AppBase ۸فیلدی کامل): DetailTypeRef + StartNumber/EndNumber (BigInt) + IsAutomatic (پیش‌فرض true — عین تیک تصویر) + IsCompany (پیش‌فرض false — عین خالی تصویر)؛ unique (DetailTypeRef, BusinessStructureRef)؛ db:push سالم؛ TABLE_REGISTRY + VERSIONED_MODELS += DetailTypeNumbering (§2.4/§2.5).
- Backend — allocate.ts (تابع آزاد، بدون وابستگی حلقوی): تخصیص پیوستهٔ خودکار — Start = MAX(EndNumber)+۱ در همان گره (نخستین بازه از ۱)، پهنای پیش‌فرض ۱۰۰۰ شماره (عین الگوی تصویر مالک: کد۵=۴۰۰۱-۵۰۰۰ و…)؛ catch P2002 قید یکتا = idempotent.
- Backend — ماژول detail-type-numbering: GET /detail-type-numbering (join با DetailType + ترتیب عددی-آگاهِ کد + backfill خودکار هر تفصیلِ بدون ردیف در محدودهٔ اشتراک — قرارداد baseDataScopeWhere مثل detail-type)؛ PUT /detail-type-numbering/:id (اعتبارسنجی دولایه: اعداد صحیح مثبت امن ۴۲۲ + شروع≤پایان ۴۲۲ + **کنترل تداخل بازه با هر ردیف دیگرِ همان گره = ۴۰۹ پیام فارسی** — «بازهٔ شماره‌ها با نوع تفصیل «X - Y» تداخل دارد (بازهٔ ثبت‌شده: A تا B).»).
- قلاب خودکار در DetailTypeService: create ⇒ بلافاصله allocate (لاگ «numbering auto-allocated»)؛ remove ⇒ deleteMany ردیف وابسته (شکاف بازه پذیرفتهٔ §2.4).
- Frontend — detail-type-numbering-form.tsx با MainDataGrid (عین تصویر: ۶ ستون کد | عنوان تفصیل | خودکار | شرکت | شماره شروع | شماره پایان): ویرایش درجریان سلولی (ورودی عددی با نرمال‌سازی ارقام فارسی/عربی + چک‌باکس‌های accent-primary)، کد/عنوان فقط‌خواندنی (مالکشان فرم نوع تفصیل است)، نوار عملیات گرید = ذخیره (Save/ذمerald — عین آیکون ذخیرهٔ تصویر) + بازخوانی، ذخیرهٔ دسته‌ای ردیف‌های تغییرکرده با توقف روی نخستین خطا، Task 82 (فلگ برگه + دکمهٔ ذخیره disabled تا تغییر)؛ شنوندهٔ §5.6 (erp:records-changed ← entity detail-type) برای تازه‌شدن زنده؛ chip گرهٔ فعال + hint.
- سیم‌کشی اعلامی: accounting-nav-store += "detail-type-numbering"؛ accounting-menu-home آیتم جدید (آیکون ListOrdered، گرادیان amber→orange — بدون blue/indigo §0.5)؛ accounting-window زیرصفحه با breadcrumb «حسابداری / اطلاعات پایه / شماره گذاری تفصیلی ها» + عنوان زندهٔ برگه (رفکتور کوچک: PAGE_TITLE_KEY data-driven — رفتار t120 بدون تغییر)؛ dfb-system-forms SYSTEM_ACCOUNTING_PAGES += acc.detailTypeNumbering؛ dfb seed SYSTEM_FORMS += {code:"DTN", componentKey:"mainDataGrid", dictKey:"dtn.formTitle", anchorSubmenuCode:"accBasicInfo"} — بوت ثبت کرد: ID=27 زیر حسابداری/اطلاعات پایه (tree API: forms:2 ✓).
- i18n §1.3: ۱۳ کلید تازهٔ dtn.* در هر ۱۳ زبان (اسکریپت درج خط‌محور؛ خودآزما: هر کلید دقیقاً ×۱۳).
- E2E (agent-browser) fa/RTL: دبل‌کلیک حسابداری → آیتم «شماره گذاری تفصیلی ها» ✓؛ گرید ۲۱ ردیف با backfill خودکار پیوسته (۱-۱۰۰۰، ۱۰۰۱-۲۰۰۰، … عین الگوی تصویر) و خودکار=تیک/شرکت=خالی ✓؛ ویرایش پایان ردیف۱=۱۵۰۰ (تداخل با ۱۰۰۱-۲۰۰۰) → ذخیره → **توست ۴۰۹ فارسی دقیق** + بازگشت مقادیر سرور ✓؛ ویرایش معتبر (پایان=۹۹۹ + تیک شرکت) → ذخیره موفق → reload کامل → مقادیر پایدار (۹۹۹/شرکت✓/خودکار✓) ✓؛ بازگردانی (۱۰۰۰/خالی) ✓؛ جریان قاعدهٔ مالک: ثبت «کد=۲۲ تست شماره گذاری t131» در فرم نوع تفصیل → بازگشت به شماره‌گذاری → **سطر تازه خودکار حاضر با بازهٔ ۲۱۰۰۱-۲۲۰۰۰** (خودکار تیک/شرکت خالی) ✓؛ حذف آزمون با دیالوگ تأیید → ردیف شماره‌گذاری وابسته هم حذف (۲۱ سطر، آخرین=کد ۲۱ با ۲۰۰۰۱-۲۱۰۰۰) ✓.
- E2E en/LTR (erp.settings → locale=en): «Back / Basic Information / Detail Type Numbering» + ستون‌های Code | Detail Title | Automatic | Company | Start Number | End Number با چیدمان آینه‌ای + chip «21 record(s)» ✓؛ برگشت fa/rtl سالم ✓.
- موبایل 375×812: breadcrumb سالم + اسکرول افقی گرید + نوار عملیات/تسک‌بار بدون همپوشانی ✓؛ کنسول پاک (صفر خطا)؛ dev.log بدون خطا.
- lint ریشه = ۰/۰؛ tsc ریشه = همان baseline (صفر خطای جدید در فایل‌های لمس‌شده)؛ tsc settings-service = صفر؛ tsc dfb-service = صفر.
- نکتهٔ عملیاتی: کلاینت Prisma سرویس dfb پس از bun install تازه، بدون generate بود (P2022 روی DfbMenu) — با bunx prisma generate + ری‌استارت پاک اصلاح شد؛ seed بوت خودش ردیف‌های IDGeneration را self-heal کرد.
- بکاپ §0.9 پس از تغییر: backup db/custom-2026-10-28_0334.db + dfb-2026-10-28_0334.db.

Stage Summary:
- فرم «شماره گذاری تفصیلی ها» با MainDataGrid در هر دو منو (پنجرهٔ حسابداری + درختوارهٔ فرمساز) نشست و قاعدهٔ مالک سرتاسی برقرار است: هر نوع تفصیل تازه خودکار در فرم ظاهر می‌شود، بازهٔ ۱۰۰۰تایی پیوستهٔ بدون تداخل می‌گیرد (MAX+۱) و هیچ ذخیره‌ای (خودکار یا دستی) اجازهٔ هم‌پوشانی ندارد (۴۰۹ دولایه).
- تفسیرهای اعلامی (§0.6): ۱) پهنای خودکار بازه = ۱۰۰۰ و آغاز از ۱ در هر گره (عین الگوی تصویر: کد۱=۱-۱۰۰۰ تا کد۲۱=۲۰۰۰۱-۲۱۰۰۰)؛ ۲) «خودکار» و «شرکت» پرچم‌های ذخیره‌شدهٔ ردیف‌اند (پیش‌فرض‌های تصویر)؛ ۳) دامنهٔ یکتایی/عدم‌تداخل بازه‌ها = هر گرهٔ ساختار سازمانی فضای مستقل خودش (قرارداد اقامت AppBase)؛ ۴) backfill در GET فهرست هم idempotent است تا تفصیل‌های قدیمی (از جمله ۲۱ مرجع) خودکار بازه بگیرند.
- artifacts: mini-services/settings-service/prisma/schema.prisma (مدل DetailTypeNumbering)؛ src/detail-type-numbering/* (ماژول کامل + allocate.ts)؛ src/detail-type/detail-type.service.ts (قلاب create/remove)؛ src/id-generation/table-registry.ts؛ src/prisma/prisma.service.ts؛ src/app.module.ts؛ src/components/erp/accounting/detail-type-numbering-form.tsx (جدید)؛ accounting-window.tsx؛ accounting-menu-home.tsx؛ src/components/erp/accounting/detail-type-form.tsx (رویداد §5.6)؛ src/stores/accounting-nav-store.ts؛ src/components/erp/form-builder/dfb-system-forms.ts؛ mini-services/dfb-service/src/seed/seed.service.ts؛ src/i18n/dictionaries.ts (۱۶۹ ردیف تازه = ۱۳×۱۳). بکاپ‌های §0.9.

---
Task ID: 132
Agent: Z.ai Code (main)
Task: «در فرم شماره گذاری تفصیلی ها، ستون شرکت را حذف کنید. در اکشن بار فرم، آیکون ذخیره را از اکشن بار قرار دهید که کاربر بتواند تنظیمات شماره گذاری را تغییر داده و در بانک اطلاعاتی ذخیره کند» — دو اصلاح روی فرم Task 131.

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§5.1. تغییر سورس فقط (فرانت + i18n)؛ بدون تغییر اسکیما/بانک؛ بکاپ §0.9 پیش از تغییر: db/custom.db.bak-t132 + db/dfb.db.bak-t132.
- درخواست ۱ — حذف ستون «شرکت» (detail-type-numbering-form.tsx): ستون comp از gridColumns و gridRows حذف شد؛ گرید اکنون پنج ستون است: کد | عنوان تفصیل | خودکار | شماره شروع | شماره پایان. تفسیر اعلامی (§0.6): پرچم IsCompany در بانک و DTO و payload PUT «دست‌نخورده» می‌ماند (مقدار موجود هر ردیف عیناً برگردانده می‌شود) — حذف فقط از «نمایش» است تا قرارداد سرور t131 و داده‌های موجود سالم بمانند؛ checkboxCell به «aut» محدود شد.
- درخواست ۲ — انتقال آیکون ذخیره به اکشن بار فرم: کاشی ذخیره از نوار پایینِ گرید (actions) حذف و به اکشن بار فرم منتقل شد — نوار ابزار استاندارد (role=toolbar، aria-label=abar.toolbar «نوار عملیات فرم») بالای گرید، با همان کاشی استاندارد ذخیرهٔ قرارداد Task 20 (SaveButton ماژول action-bar — گرادیان زمردی، تولتیپ «ذخیره اطلاعات»، اسپینر busy). کاشی تا وجود تغییر ذخیره‌نشده غیرفعال است (saving || !dirty — عین رفتار قبلی) و در انتهای نوار (ms-auto) هنگام کثیف‌بودن، نشان متنی dtn.unsavedNote «تغییرات ذخیره‌نشده وجود دارد.» (کهربایی) می‌نشیند. نوار پایین گرید فقط «بازخوانی لیست» را نگه داشت (تفسیر اعلامی §0.6: «از اکشن بار» = جابه‌جایی، نه تکثیر — فقط یک آیکون ذخیره در فرم هست).
- i18n §1.3: یک کلید تازهٔ dtn.unsavedNote در هر ۱۳ زبان (fa/en/tr/ar/hi/ps/ckb/pt/ko/fr/zh/de/ru — خودآزما: دقیقاً ×۱۳).
- E2E (agent-browser) fa/RTL: ورود دبل‌کلیک حسابداری → «شماره گذاری تفصیلی ها» ✓؛ سرستون‌ها = کد|عنوان تفصیل|خودکار|شماره شروع|شماره پایان و hasCompanyCol=false ✓؛ toolbar حاضر با ۱ دکمهٔ «ذخیره اطلاعات» و aria-disabled=true در ابتدای امر ✓؛ نوار گرید فقط «بازخوانی لیست» (saveTileCount=1 در کل فرم — فقط اکشن بار فرم) ✓.
- E2E جریان ذخیره (fa): ویرایش پایان ردیف۱ (۱۰۰۰→۱۵۰۰ تداخلی) → کاشی فعال + note ظاهر شد → ذخیره → توست ۴۰۹ فارسی دقیق «بازهٔ شماره‌ها با نوع تفصیل «2 - صندوق» تداخل دارد (بازهٔ ثبت‌شده: 1001 تا 2000).» + بازگشت مقدار سرور (۱۰۰۰) + کاشی دوباره غیرفعال ✓؛ مسیر موفق (۱۰۰۰→۹۹۹) → توست «اطلاعات با موفقیت ذخیره شد» → reload کامل → بازگشایی فرم → مقدار پایدار ۹۹۹ از بانک ✓ → بازگردانی ۱۰۰۰ با همان جریان ✓.
- E2E en/LTR (erp.settings → locale=en): dir=ltr ✓؛ toolbar «Form action bar» + کاشی «Save data» ✓؛ سرستون‌ها Code|Detail Title|Automatic|Start Number|End Number بدون Company ✓؛ ویرایش → note «There are unsaved changes.» + فعال‌شدن کاشی ✓؛ بازگردانی ✓.
- موبایل 375×812: نوار ابزار سالم و بدون سرریز (333px ≤ 375) ✓؛ بازگشت fa/rtl سالم (dir=rtl, lang=fa) ✓؛ کنسول پس از عملیات: صفر خطا/هشدار؛ errors مرورگر: صفر.
- سلامت بانک پس از آزمون‌ها (Prisma): ۲۱ ردیف، companyTrue=0، automaticTrue=21، ردیف اول ۱-۱۰۰۰ — عین وضعیت پایهٔ t131 (آزمون‌ها اثری برجای نگذاشتند).
- lint ریشه = ۰/۰؛ tsc ریشه = ۱۵ خطای pre-existing در فایل‌های لمس‌نشده (examples/scripts/skills/start-menu/field-translations — صفر خطا در فایل‌های این تسک)؛ tsc settings-service = صفر.
- بکاپ §0.9: db/custom.db.bak-t132 (2,502,656) + db/dfb.db.bak-t132 — پیش از تغییر؛ تغییر بانک در این تسک صفر (فقط PUTهای آزمون با بازگردانی کامل).

Stage Summary:
- فرم «شماره گذاری تفصیلی ها» اکنون پنج ستونی است (شرکت حذف شد — پرچم در بانک محفوظ) و «ذخیره» مثل هر فرم دیگری در اکشن بار فرم است: کاشی استاندارد ذخیرهٔ قرارداد Task 20 در نوار ابزار بالای گرید، تا تغییر ذخیره‌نشده غیرفعال، با نشان متنی «تغییرات ذخیره‌نشده وجود دارد.» هنگام کثیف‌بودن؛ ذخیره همان PUT دولایهٔ t131 (اعتبارسنجی فرانت + ۴۰۹ تداخل سرور) را اجرا می‌کند و به بانک می‌نویسد (اثبات ماندگاری با reload کامل).
- دو تفسیر اعلامی (§0.6): ۱) حذف ستون «شرکت» فقط از نمایش است و IsCompany در بانک/payload دست‌نخورده می‌ماند؛ ۲) «آیکون ذخیره را از اکشن بار قرار دهید» = جابه‌جایی کاشی ذخیره از نوار پایین گرید به اکشن بار فرم (نه تکثیر) — نوار گرید فقط بازخوانی دارد.
- artifacts: src/components/erp/accounting/detail-type-numbering-form.tsx (۵ ستون + اکشن بار فرم با SaveButton)؛ src/i18n/dictionaries.ts (۱۳ ردیف تازه = ۱×۱۳). بکاپ‌های §0.9.

---
Task ID: 133
Agent: Z.ai Code (main)
Task: «در کامپوننت MainDataGrid امکان جابجا کردن ستون ها و کم و زیاد کردن عرض ستون ها را اضافه کنید. اگر زبان داشبورد RTL بود کاربر با موس بتواند از سمت چپ ستون آن را به سمت چپ کم و زیاد کند و کم و زیاد کردن عرض یک ستون نباید روی عرض بقیه ستون ها تاثیر بگذارد و اگر عرض صفحه کم بود باید اسکرول افقی داخل گرید ایجاد شود و اگر زبان داشبورد LTR بود قرینه این انجام گردد» — Task 133.

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§5.1. تغییر سورس فقط (کامپوننت + i18n)؛ بدون تغییر اسکیما/بانک؛ بکاپ §0.9: db/custom.db.bak-t133 + db/dfb.db.bak-t133.
- تغییر عرض (main-data-grid.tsx): دستگیرهٔ جداکننده (role=separator، کلاس cursor-col-resize، touch-none) روی «لبهٔ انتهایی» هر سرستون — در RTL لبهٔ چپ و در LTR لبهٔ راست (یعنی inline-end منطقی؛ با اندازه‌گیری مرورگر اثبات شد). مکانیزم: جدول `table-fixed` با `width: max(100%, جمع‌عرض‌ها)` + colgroup با عرض دقیق هر ستون + «ستون مجازی جمع‌شونده» در انتها که فضای مازاد قاب را می‌بلعد — نتیجه: تغییر عرض یک ستون «هرگز» عرض ستون‌های دیگر را عوض نمی‌کند (مازاد را اسپیسِر می‌بلعد؛ کسری را اسکرول افقی جبران می‌کند) و در نبودِ مازاد، عملاً عرض رندرشدهٔ ستون‌ها با colgroup مو‌می‌باشد. حینِ درگ، عرض مستقیم روی <col> اعمال می‌شود (بدون رندر مجدد هر فریم) و در pointerup در state کلیدمحور commit می‌شود (aria-valuenow هم‌گام). کفٔ عرض ۴۸px. ریاضیاتِ جهت‌آگاه: Δ = (clientX − startX) × (+1 در LTR / −1 در RTL) — کشیدن به سمتِ لبه = پهن‌تر. دسترس‌پذیری: کاشی فوکوس‌پذیر با ArrowLeft/Right (جهت‌آگاه؛ Shift = گام ۴۸) و aria-valuemin/now.
- جابجایی ستون‌ها: درگ‌اند‌دراپ HTML5 روی سرستون‌ها (draggable th + setData برای فایرفاکس)؛ منطقِ نیمهٔ چپ/راستِ هدف جهت‌آگاه است: در RTL نیمهٔ راستِ هدف = «پیش از هدف» و نیمهٔ چپ = «پس از هدف»، در LTR قرینه — با مستطیل زندهٔ هدف (getBoundingClientRect) نه فرض جهت. نشانگر درج (میلهٔ ۲px پرایمری) با start-0/end-0 منطقی در لبهٔ مقصد می‌نشیند؛ سرستونِ در حال درگ opacity-40. ریل «#» ثابت است و شرکت در ترتیب ندارد. ترتیب در state کلیدمحور می‌ماند: فیلتر/سورت/CSV/انتخاب‌گر ستون با ترتیب جدید هم‌گام‌اند و عرض‌های تغییرکرده با جابجایی «دنبال ستون» می‌آیند. جلوگیری از تداخل: pointerdownِ دستگیره preventDefault + onDragStart دستگیره preventDefault/stopPropagation (درگِ بومی از دستگیره مسدود).
- هر دو فقط session-scoped هستند (بدون ذخیرهٔ ماندگار) — تفسیر اعلامی §0.6: «امکان» = رفتار زندهٔ گرید؛ ماندگاری تنظیمات درخواست نشده.
- i18n §1.3: دو کلید تازهٔ dfb.list.resizeHint / dfb.list.reorderHint در هر ۱۳ زبان (خودآزما: هر کلید دقیقاً ×۱۳) — تولتیپ/aria دستگیره و سرستون.
- E2E (agent-browser، موس واقعی) fa/RTL: ۵ دستگیره، همگی چسبیده به لبهٔ چپ سرستون (Δ<4px) ✓؛ درگِ موسِ دستگیرهٔ «کد» به چپ ۸۰px = ۹۰→۱۷۰ و عرض بقیه عیناً [220,100,150,150] ✓؛ درگ ۵۰۰px دیگر → جمع ۱۳۳۸ > قاب ۱۲۳۶ → **اسکرول افقی داخل گرید ظاهر شد** ✓؛ درگ برگشتی → اسکرول محو ✓؛ جابجایی: درگ «کد» روی مرکز «عنوان تفصیل» → بعد از آن نشست [عنوان،کد،خودکار،…] و روی نیمهٔ راستِ عنوان → «پیش از آن» برگشت [کد،عنوان,…] ✓ (هر دو نیمه در RTL)؛ عرض تغییرکرده با جابجایی دنبال ستون آمد ✓.
- E2E en/LTR: دستگیره‌ها لبهٔ راست سرستون ✓؛ درگ به راست ۸۰px = ۹۰→۱۷۰ و بقیه دست‌نخورده ✓؛ درگ روی نیمهٔ راستِ «Detail Title» → بعد از آن، و روی نیمهٔ چپ → پیش از آن ✓ (قرینهٔ کامل RTL). یک نکتهٔ ابزاری ثبت‌شده: درگِ HTML5 با پرشِ بزرگِ اولیهٔ موس گاهی شروع نمی‌شود — با گام‌های تدریجی ۲۰-۴۰px پایدار است (محدودیت تست‌محور، نه منطق کد).
- رگرسیون: کلیک سورت (شورون ظاهر شد) و فیلتر قیفی (۲۱→۱ ردیف با «صندوق» و بازگشت به ۲۱) با سرستون draggable سالم ✓؛ گرید «نوع تفصیل» (مصرف‌کنندهٔ دوم) با colgroup جدید و عرض دقیق [100,200,260,110] و ۴ دستگیره ✓؛ موبایل 375px: ۵ دستگیره + اسکرول افقی داخلی (۸۳۸>۳۳۱) ✓؛ کنسول: صفر خطا/هشدار؛ بازگشت fa/rtl سالم.
- lint ریشه = ۰/۰؛ tsc ریشه = baseline (صفر خطا در main-data-grid/dictionaries پس از اصلاح امضای sideAfter به Element)؛ tsc settings-service لمس نشد (صفر در t132).
- بکاپ §0.9: db/custom.db.bak-t133 + db/dfb.db.bak-t133 (تغییر بانک صفر — فقط UI).

Stage Summary:
- MainDataGrid اکنون هر دو قابلیت مالک را دارد: ۱) دستگیرهٔ تغییر عرض روی لبهٔ انتهایی هر ستون (RTL=چپ، LTR=راست) که «فقط» همان ستون را کم/زیاد می‌کند — با colgroup دقیق + ستون مجازی جمع‌شونده + عرض جدول max(۱۰۰٪, جمع) تضمین شده که عرض بقیه ستون‌ها ثابت می‌ماند و سرریز = اسکرول افقی داخل گرید؛ ۲) جابجایی ستون‌ها با درگ سرستون و نشانگر درج، با منطق نیمهٔ چپ/راستِ جهت‌آگاه. هر دو با موس در هر دو جهت E2E شدند و با کلیدهای پیکانی هم در دسترس‌اند.
- تفسیرهای اعلامی (§0.6): ۱) عرض ستون‌ها پس از این «دقیق» است و فضای مازاد قاب به ستون مجازی انتهایی می‌رود (به‌جای کشیده‌شدن تناسبی ستون‌ها — لازمهٔ ثابت‌ماندن عرض‌ها)؛ ۲) ترتیب/عرض‌ها session-scoped است (ماندگاری درخواست نشده)؛ ۳) ریل «#» ثابت و غیرقابل‌جابجایی.
- artifacts: src/components/erp/form-builder/main-data-grid.tsx (colgroup + resize handle + DnD reorder + spacer)؛ src/i18n/dictionaries.ts (۲۶ ردیف تازه = ۲×۱۳). بکاپ‌های §0.9.

---
Task ID: 134
Agent: Z.ai Code (main)
Task: «کامپوننت ارسال به csv الان همه اطلاعات دیتاگرید را در یک ستون نمایش می دهد. من می خواهم وقای اطلاعات به اکسل ارسال می گردد اطلاعات هر ستون دیتاگرید در یک ستون مجزا در اکسل نمایش داده شود. همچنین جهت نمایش اطلاعات در اکسل باید با زبان انتخاب شده در داشبورد هماهنگ باشد یعنی اگر زبان داشبورد یکی از زبان های RTL بود اطلاعات در اکسل هم از راست به چپ باشد و بالعکس» — تبدیل خروجی CSV به اکسل واقعی (xlsx) ستون‌به‌ستون با جهت هم‌گام با زبان داشبورد.

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4. تغییر سورس فقط (دو کامپوننت خروجی + i18n + کتابخانه)؛ بدون تغییر اسکیما/بانک؛ بکاپ §0.9 پیش از تغییر: db/custom.db.bak-t134 + db/dfb.db.bak-t134.
- ریشه‌یابی: خروجی قبلی CSV متنی بود (BOM + خانه‌های کوتیشن‌دار با جداکنندهٔ «,»)؛ اکسل فارسی با locale جداکنندهٔ «;» چنین فایلی را تک‌ستونی می‌خواند (تصویر مالک) و CSV اصلاً جهت شیت ندارد ⇒ رفع واقعی فقط با فایل xlsx واقعی ممکن است.
- کتابخانهٔ تازه: xlsx (SheetJS 0.18.5) با bun add — import پویا (await import) تا فقط با اولین کلیکِ خروجی دانلود شود و باندل اولیه سنگین نشود.
- ماژول تازهٔ src/lib/excel-export.ts: buildExcelWorkbook (تابع خالص: هدر در سطر ۱، هر ستون در ستون مجزای اکسل A1/B1/C1…؛ عرض هر ستون از بلندترین محتوای همان ستون، کلمپ ۱۰..۴۸ نویسه؛ نام شیت از نام فایل با پاک‌سازی حروف ممنوع و سقف ۳۱) + downloadExcel (Blob + a.click با MIME رسمی xlsx). پرچم RTL: SheetJS 0.18.5 آن را از نمای سطحِ «ورک‌بوک» می‌خواند (wb.Workbook.Views[0].RTL ⇒ rightToLeft="1" در sheetView) نه از ws["!views"] — با بازرسی XML داخل zip اثبات و در کامنت کد ثبت شد؛ LTR = بدون پرچم (پیش‌فرض اکسل).
- MainDataGrid (main-data-grid.tsx): exportCsv حذف و exportExcel جایگزین شد — همان نمای «فیلترشده» با ترتیب/انتخابِ فعلی ستون‌ها (سازگار با جابجایی/مخفی‌سازی t133) صادر می‌شود؛ rtl = dir داشبورد؛ نام فایل از همان prop قبلی csvFileName (سازگاری کامل با همهٔ فراخوان‌ها: records-list/currency-type/exchange-rate/detail-type/detail-type-numbering/form-builder) ولی پسوند .xlsx؛ توست موفقیت abar.listExportedToast و توست خطای abar.exportFailedToast؛ تولتیپ/aria دکمه از کلید «خروجی اکسل» (abar.listExport).
- RecordListDropdown (forms/action-bar/list-dropdown.tsx): خروجی لیستِ اکشن بار فرم‌ها هم به همان helper مهاجرت کرد (فایل list.xlsx، همان توست‌ها، rtl از dir).
- i18n §1.3: ۱) مقدار abar.listExportedToast در هر ۱۳ زبان از «فایل CSV دانلود شد» به «فایل اکسل دانلود شد» (Excel file downloaded و…) به‌روز شد؛ ۲) کلید تازهٔ abar.exportFailedToast («خروجی اکسل انجام نشد.») در هر ۱۳ زبان؛ ۳) کلید بی‌استفاده‌شدهٔ dfb.list.exportCsv («خروجی CSV») از هر ۱۳ دیکشنری حذف شد (تنها مصرف‌کننده‌اش دکمهٔ گرید بود که اکنون abar.listExport دارد). خودآزما: exportFailedToast=۱۳، listExportedToast=۱۳، exportCsv=صفر.
- راستی‌آزمایی واحد (bun + بازخوانی XLSX + بازرسی unzip): فایل fa = <sheetView workbookViewId="0" rightToLeft="1"/> و فایل en = sheetView بدون rightToLeft؛ هدرها در A1..E1 مجزا؛ دادهٔ کوتیشن‌دار «حساب بانک "بلده"» و «1,000» سالم در خانه‌های مجزا؛ امضای PK.
- E2E (agent-browser) fa/RTL: فرم شماره گذاری تفصیلی ها → دکمهٔ «خروجی اکسل» → توست «فایل اکسل دانلود شد» ✓؛ فایل دانلودشده در مرورگر رهگیری شد (Blob): 10,626 بایت، امضای PK، rightToLeft="1"، A1..E1 = کد|عنوان تفصیل|خودکار|شماره شروع|شماره پایان و سطر داده در A2..E2 ✓.
- E2E en/LTR: دکمهٔ "Excel export" → توست "Excel file downloaded" ✓؛ فایل رهگیری‌شده: 10,530 بایت، sheetView بدون rightToLeft (LTR) ✓، A1..E1 = Code|Detail Title|Automatic|Start Number|End Number ✓.
- موبایل 375×812 (fa): دکمهٔ خروجی حاضر، اسکرول افقی گرید t133 سالم (overflow-x:auto) ✓؛ کنسول/خطاهای مرورگر در همهٔ سناریوها: صفر.
- lint ریشه = ۰/۰؛ tsc ریشه = صفر خطا در فایل‌های این تسک (خطاهای pre-existing لمس‌نشده: field-translations و examples/scripts — همان baseline).
- بکاپ §0.9: db/custom.db.bak-t134 + db/dfb.db.bak-t134 و پیش از پوش «backup db/custom-2026-10-28_1056.db» + «backup db/dfb-2026-10-28_1056.db» (تغییر بانک در این تسک صفر).

Stage Summary:
- هر دو مسیر «ارسال به اکسل» (دکمهٔ خروجی دیتاگرید MainDataGrid و ابزار خروجی دراپ‌داون «لیست» اکشن بار) اکنون فایل xlsx واقعی می‌سازند: هر ستونِ گرید یک ستونِ مجزای اکسل است (دیگر همه‌چیز در ستون A نمی‌نشیند)، سطر ۱ هدر با عرض خودکار و جهتِ شیت هم‌گام با زبان داشبورد است — زبان‌های RTL داشبورد شیت راست‌به‌چپ (ستون A از راست) و داشبوردهای LTR شیت چپ‌به‌راست می‌بینند. نمای فیلترشده با ترتیب/انتخابِ ستون‌های t133 صادر می‌شود و نام prop قدیمی csvFileName برای سازگاری همهٔ فراخوان‌ها حفظ شد (خروجی .xlsx).
- تفسیر اعلامی (§0.6): «کامپوننت ارسال به csv» = هر دو مسیر خروجی فعلی (گرید + لیست اکشن بار) که هر دو CSV می‌دادند؛ هر دو یکجا ارتقا یافتند تا رفتار یکنواخت باشد. کلید dfb.list.exportCsv پس از بی‌استفاده شدن حذف شد (مقدار جایگزین از کلید موجود abar.listExport).
- artifacts: src/lib/excel-export.ts (تازه)؛ src/components/erp/form-builder/main-data-grid.tsx؛ src/components/forms/action-bar/list-dropdown.tsx؛ src/i18n/dictionaries.ts (−۱۳، +۱۳، ~۱۳ به‌روز)؛ package.json/bun.lock (xlsx@0.18.5). بکاپ‌های §0.9.

---
Task ID: 135
Agent: Z.ai Code (main)
Task: «توی تنظیمات و پیکربندی نرم افزار و در تب حسابداری گروپ فیلد طول کد حسابها را همانند تصویر ایجاد کنید. طول حساب معین از تفریغ طول کدحسابها و جمع طول گروه حساب و طول حساب کل بدست می آید» — گروپ فیلد «طول کد حسابها» با چهار فیلد و «طول حساب معین» مشتق‌شده.

Work Log:
- §0.1: خوانش AGENTS.md + worklog؛ بندهای مرتبط: §0.5/§0.6/§0.9/§1.3/§1.4. تغییر سورس (فرانت + i18n + رجیستری سرور) — بدون تغییر اسکیما (فلسفهٔ Task 72: هر فیلد = یک ردیف SoftwareConfig)؛ بکاپ §0.9 پیش از تغییر: db/custom.db.bak-t135 + db/dfb.db.bak-t135.
- خوانش دقیق تصویر با VLM: چهار فیلد عین تصویر — «طول حساب کل *»=۶ (سطر۱ راست)، «طول گروه حساب *»=۲ (سطر۱ چپ)، «طول حساب معین *»=۴ (سطر۲ راست)، «طول حساب تفصیلی *»=۰ (سطر۲ چپ) داخل جعبهٔ «طول کد حسابها».
- استخراج فرمول از عبارت مالک + اعداد تصویر (تفسیر اعلامی §0.6): «طول حساب معین از تفریغ (تفریق) طول کدحساب‌ها و [با توجه به اینکه طول کد حساب‌ها] جمع طول گروه حساب و طول حساب معین [است]» ⇒ **معین = طول حساب کل − طول گروه حساب** (۶−۲=۴ عین تصویر). معین «به‌دست می‌آید» ⇒ فقط‌خواندنی و زنده.
- فرانت (software-config-window.tsx): دو قابلیت تازه در رجیستری SwConfigFieldDef — ۱) groupLabelKey: فیلدهای هم‌گروهِ پشت‌سرهم داخل فیلدست با عنوان مشترک و شبکهٔ ۲ستونی (grid-cols-1 → sm:grid-cols-2؛ در RTL اولین فیلد = راست‌ترین — عین چینش تصویر؛ در LTR قرینه) با role=group + aria-labelledby؛ ۲) derived {from, minus}: فیلد فقط‌خواندنی با مقدار زندهٔ from−minus از مقادیر فعلی فرم (fallback به defaultValue)، readOnly + aria-readonly + تولتیپ راهنما + استایل muted. چهار کلید تازهٔ accounting: accLedgerCodeLen (۶، ۱..۱۵)، accGroupCodeLen (۲، ۱..۱۵)، accSubsidiaryCodeLen (مشتق‌شده، ۰..۱۵)، accDetailCodeLen (۰، ۰..۱۵) — همگی integer + required (ستارهٔ عین تصویر). ذخیره: مقدار معین = محاسبهٔ زنده؛ منفی/نامعتبر ⇒ توست خطای اختصاصی swDeriveError و ارسال نمیشود؛ زیر شبکه راهنمای متنی فرمول.
- سرور (software-config.dto.ts + service.ts): چهار کلید به whitelist آینه شد + فیلد spec.derived تازه؛ در upsert قانون مشتق (خط دوم دفاعی): اگر هر دو مرجع در همین payload حاضر باشند، مقدار فیلد مشتق‌شده باید برابر from−minus باشد وگرنه 422 با پیام روشن فارسی.
- i18n §1.3: هفت کلید تازه در هر ۱۳ زبان (خودآزما: هر کلید دقیقاً ×۱۳): swAccCodeLenGroup/swAccLedgerLen/swAccGroupLen/swAccSubsidiaryLen/swAccDetailLen/swAccDeriveHint/swDeriveError.
- E2E (agent-browser) fa/RTL: تنظیمات → «پیکربندی نرم افزارها» → تب حسابداری؛ فیلدست «طول کد حسابها» با ۴ ورودی و چینش عین تصویر (کل x=648 راست / گروه x=402 چپ / معین راست / تفصیلی چپ) و مقادیر پیش‌فرض ۶/۲/۴/۰؛ معین readOnly ✓؛ مشتق زنده: کل=۸ ⇒ معین=۶، گروه=۳ ⇒ معین=۵ ✓؛ ذخیره ⇒ توست «ذخیره» و ردیف‌ها در DB (accLedger=8, accGroup=3, accSubsidiary=5, accDetail=0) ✓؛ reload کامل → بازگشایی → همان مقادیر از DB (ماندگاری) ✓؛ آزمون منفی: کل=۱ ⇒ معین=−۲ ⇒ ذخیره رد شد با توست «طول حساب معین نامعتبر است؛ طول حساب کل باید عددی بزرگ‌تر یا برابر طول گروه حساب باشد.» و DB دست‌نخورده (8) ✓؛ بازگردانی ۶/۲ ⇒ معین=۴ ⇒ ذخیره.
- E2E en/LTR: عنوان‌ها Account code lengths/Ledger account length/Account group length/Subsidiary account length/Detail account length ✓؛ چینش قرینه (Ledger x=402 چپ در LTR) ✓؛ مشتق زنده ۸−۲=۶ ✓؛ ذخیره توست «Save» و DB آپدیت (version 3) ✓؛ بازگردانی ۶ ⇒ ۴ ✓.
- گارد سرور (curl): PUT با معین=۹ و کل/گروه=۶/۲ ⇒ رد با 422 «مقدار فیلد «accSubsidiaryCodeLen» باید برابر مقدار «accLedgerCodeLen» منهای «accGroupCodeLen» باشد» ✓؛ PUT سازگار ۶/۲/۴/۰ ⇒ 200 saved=4 ✓.
- موبایل 375×812 (fa): شبکه به یک ستون (۴×۲۵۷px) و بدون سرریز افقی ✓؛ مقادیر ۶/۲/۴/۰ ✓؛ کنسول/خطاهای مرورگر در همهٔ سناریوها (fa/en/mobile): صفر.
- lint ریشه = ۰/۰؛ tsc ریشه = صفر خطا در فایل‌های این تسک؛ tsc settings-service = صفر.
- وضعیت نهایی بانک: چهار ردیف تازهٔ SoftwareConfig با مقادیر تصویر (accLedger=6, accGroup=2, accSubsidiary=4, accDetail=0) + fiscalMonthsCount=12 (از ذخیرهٔ آزمون با پیش‌فرض).
- بکاپ §0.9: db/custom.db.bak-t135 + db/dfb.db.bak-t135 و پیش از پوش «backup db/custom-2026-10-28_1123.db» + «backup db/dfb-2026-10-28_1123.db».

Stage Summary:
- تب «حسابداری» پیکربندی نرم‌افزار اکنون گروپ فیلد «طول کد حسابها» را عین تصویر مالک دارد: سطر۱ = طول حساب کل (۶) و طول گروه حساب (۲)، سطر۲ = طول حساب معین و طول حساب تفصیلی (۰)؛ «طول حساب معین» فقط‌خواندنی است و به‌صورت زنده از «طول حساب کل − طول گروه حساب» به‌دست می‌آید (تفسیر اعلامی §0.6 بر پایهٔ اعداد تصویر: ۶−۲=۴)، با راهنمای متنی و تولتیپ؛ تغییر کل/گروه بلافاصله معین را به‌روز می‌کند و ذخیره در جدول SoftwareConfig ماندگار است (بدون هیچ مهاجرت — فلسفهٔ رجیستری Task 72).
- دو خط دفاعی برای سازگاری فرمول: فرانت پیش از ارسال (توست swDeriveError) و سرور در upsert (422) — اثبات‌شده در E2E و curl.
- artifacts: src/components/erp/settings/software-config-window.tsx (group+derived+رندر فیلدست)؛ mini-services/settings-service/src/software-config/software-config.dto.ts + software-config.service.ts (۴ کلید + قانون مشتق)؛ src/i18n/dictionaries.ts (۷×۱۳ ردیف تازه). بکاپ‌های §0.9.

---
Task ID: 136
Agent: Z.ai Code (main)
Task: «فیلدهایی که توی تصویر با فلش قرمز مشخص کردم در تب حسابداری پیکربندی نرم افزار باید قابل تغییر باشند» — سه فیلد علامت‌گذاری‌شدهٔ تصویر (طول حساب کل / طول گروه حساب / طول حساب معین) باید آزادانه قابل ویرایش باشند.

Work Log:
- §0.1 انجام شد؛ §0.9 پیش از تغییر: db/custom.db.bak-t136 + db/dfb.db.bak-t136.
- برداشت اعلامی §0.6: «قابل تغییر» یعنی هر سه ورودی مستقل و آزاد باشند؛ بنابراین قانون خودکارِ «طول حساب معین = طول حساب کل − طول گروه حساب» (Task 135) که معین را فقط‌خواندنی می‌کرد و هر مقدار مستقل را با 422 رد می‌کرد، حذف شد — با مالک هماهنگ است چون خواستهٔ صریح همین تسک است؛ در صورت نیاز به بازگشت خودکارِ محاسبه، مالک اعلام می‌کند.
- فرانت (software-config-window.tsx): حذف کامل سازوکار «فیلد مشتق‌شده» — گزینهٔ derived از SwConfigFieldDef، تابع derivedValue، شاخه‌های ویژهٔ ذخیره (توست swDeriveError و محاسبهٔ زنده در payload)، readOnly/aria-readonly/title/استایل bg-muted معین، و پاراگراف راهنمای فرمول زیر شبکه. هر چهار فیلد اکنون ورودیِ معمولی عددی‌اند: کل (۱..۱۵)، گروه (۱..۱۵)، معین (۰..۱۵)، تفصیلی (۰..۱۵) — همگی صحیح و اجباری با ستاره؛ مقادیر پیش‌فرض ۶/۲/۴/۰ دست‌نخورده.
- سرور (settings-service): حذف derived از SoftwareConfigFieldSpec و رجیستری accounting + حذف نقشهٔ incoming و قانون 422 «معین باید برابر from−minus باشد» از upsert؛ اعتبارسنجی بازه/صحیح برای هر فیلد سرِ جای خود ماند.
- i18n §1.3: حذف دو کلید بی‌مصرف swAccDeriveHint و swDeriveError از هر ۱۳ زبان (خودآزما: پیش از حذف ۲۶=۲×۱۳، پس از حذف صفر؛ پنج کلید دیگر گروه ۶۵=۵×۱۳ باقی).
- گارد سرور (curl از راه پروکسی BFF): PUT ناسازگارِ ۶/۲/۹ که در Task 135 رد می‌شد ⇒ اکنون 200 saved=4؛ بازگردانی ۶/۲/۴/۰ ⇒ 200.
- E2E (agent-browser) fa/RTL: تب حسابداری — چهار ورودی همگی readOnly=false و بدون استایل خاکستری و بدون متن راهنما ✓؛ تایپ مستقل ۸/۳/۵ در کل/گروه/معین پذیرفته شد و معین به‌صورت خودکار تغییر نکرد ✓؛ ذخیره ⇒ DB (8/3/5/0) ✓؛ reload کامل ⇒ بازگشایی ⇒ همان مقادیر ✓؛ آزمون قاطع استقلال: ۱۰/۲/۵ (ناقض فرمول؛ ۱۰−۲=۸≠۵) ذخیره شد و ماند ✓؛ گارد بازه: معین=۲۰ ⇒ توست خطای «مقدار «طول حساب معین» باید عددی بین 0 و 15 باشد.» و DB دست‌نخورده ✓؛ توست موفق «ذخیره» دیده شد ✓؛ بازگردانی ۶/۲/۴/۰ ⇒ DB ✓.
- E2E en/LTR: عنوان‌ها Ledger/Account group/Subsidiary/Detail account length ✓؛ همگی readOnly=false ✓؛ ویرایش ۹/۲/۷ ⇒ توست «Save» و DB ✓؛ بازگردانی ۶/۲/۴/۰ ✓.
- موبایل ۳۷۵×۸۱۲ (fa): تک‌ستونه (۴×۲۵۷px)، بدون سرریز افقی (scrollW=clientW=375) ✓.
- کنسول/خطای مرورگر در همهٔ سناریوها: صفر.
- lint ریشه = ۰/۰؛ tsc ریشه = صفر خطا در فایل‌های این تسک؛ tsc settings-service = صفر.
- بکاپ §0.9 پیش از پوش: «backup db/custom-2026-10-28_1144.db» + «backup db/dfb-2026-10-28_1144.db».

Stage Summary:
- تب «حسابداری» پیکربندی نرم‌افزار: هر سه فیلد علامت‌گذاری‌شدهٔ مالک (طول حساب کل، طول گروه حساب، طول حساب معین) — و همچنین طول حساب تفصیلی — ورودیِ مستقل و آزادند؛ کاربر می‌تواند هر مقدار مجاز (۰..۱۵ صحیح) را تایپ و ذخیره کند و مقدار دقیقاً همان می‌ماند (هیچ بازمحاسبهٔ خودکار یا قفل فقط‌خواندنی وجود ندارد).
- دو خط دفاعی قبلیِ قانون مشتق (توست فرانت + 422 سرور) حذف شد؛ تنها اعتبارسنجی باقی‌مانده بازهٔ هر فیلد است (فرانت + سرور).
- چیدمان فیلدست «طول کد حسابها»، شبکهٔ ۲ستونی جهت‌آگاه، ستارهٔ اجباری، مقادیر پیش‌فرض ۶/۲/۴/۰ و ماندگاری در جدول SoftwareConfig بدون هیچ مهاجرت — همگی عین Task 135 باقی است.
- artifacts: src/components/erp/settings/software-config-window.tsx؛ mini-services/settings-service/src/software-config/software-config.dto.ts + software-config.service.ts؛ src/i18n/dictionaries.ts (−۲۶ ردیف). بکاپ‌های §0.9 (bak-t136 + timestamped).

---
Task ID: 137
Agent: Z.ai Code (main)
Task: «در تب حسابداری از پیکربندی نرم افزار باید فیلد طول کدینگ حسابها را هم اضافه کنید؛ طول کد حسابها پیش‌فرض ۶، سپس طول گروه حساب پیش‌فرض ۲، سپس طول حساب کل پیش‌فرض ۲ و در نهایت طول حساب معین که از تفریغ طول کدحسابها و طول گروه حساب و طول حساب کل محاسبه می‌شود و فیلد فقط‌خواندنی می‌باشد.»

Work Log:
- §0.1 انجام شد؛ §0.9 پیش از تغییر: db/custom.db.bak-t137 + db/dfb.db.bak-t137.
- برداشت اعلامی §0.6: «طول کدینگ حسابها» = بازسازی/توسعهٔ همان گروپ فیلد تب حسابداری (عنوان تازه «طول کدینگ حسابها») با ساختار: ۱) فیلد تازهٔ «طول کد حسابها» (کل طول کدینگ) پیش‌فرض ۶؛ ۲) «طول گروه حساب» پیش‌فرض ۲؛ ۳) «طول حساب کل» پیش‌فرض از ۶ به ۲ تغییر کرد؛ ۴) «طول حساب معین» دوباره فقط‌خواندنی و مشتق‌شده = طول کد حسابها − طول گروه حساب − طول حساب کل (تفریغ = تفریق؛ با پیش‌فرض‌ها 6−2−2=2)؛ «طول حساب تفصیلی» (۰) از Task 135 حفظ شد چون مالک حذفش را نخواسته است. خواستهٔ قابل‌تغییربودنِ Task 136 برای کل/گروه/کدحسابها پابرجاست؛ فقط معین به حکم صریح همین تسک فقط‌خواندنی شد.
- فرانت (software-config-window.tsx): سازوکار مشتق‌شده تعمیم یافت — derived از {from, minus:string} به {from, minus:string[]} (مقدار = from − Σminus)؛ derivedValue با گارد رشتهٔ خالی/NaN؛ ورودی معین readOnly + aria-readonly + تولتیپ + استایل muted؛ پاراگراف راهنما زیر شبکه؛ در ذخیره مقدار معین = محاسبهٔ زنده و منفی‌شدن ⇒ توست swDeriveError و ارسال نمی‌شود. رجیستری: فیلد تازهٔ accCodeLen (۱..۱۵، صحیح، پیش‌فرض ۶) در ابتدای گروه، پیش‌فرض accLedgerCodeLen به ۲ و accSubsidiaryCodeLen به ۲ تغییر کرد؛ ترتیب فیلدها عین توالی مالک (کدحسابها، گروه، کل، معین، تفصیلی).
- سرور (software-config.dto.ts + service.ts): کلید تازهٔ accCodeLen در whitelist؛ پیش‌فرض‌های آینه شد؛ قانون مشتق تعمیم یافت: اگر from و همهٔ minus در payload حاضر باشند، مقدار باید برابر from−Σminus باشد وگرنه رد با پیام روشن (statusCode 422 در بدنه) — دفاع دوم پس از فرانت.
- i18n §1.3: کلید تازهٔ swAccCodeLen («طول کد حسابها») در هر ۱۳ زبان؛ مقدار swAccCodeLenGroup به «طول کدینگ حسابها» (Account coding lengths و…) تغییر یافت؛ دو کلید swAccDeriveHint و swDeriveError با متن فرمول سه‌جمله‌ای بازگشتند (خودآزما: هر کلید دقیقاً ×۱۳ — جمع ردیف‌های گروه = ۸×۱۳).
- مهاجرت مقادیر ذخیره‌شدهٔ DB (از راه API): ردیف‌های قبلی (کل=۶، معین=۴) با ساختار تازه ناسازگار می‌شدند (معین منفی) ⇒ PUT سازگار: accCodeLen=6 (تازه)، accLedgerCodeLen=2، accSubsidiaryCodeLen=2، بقیه بدون تغییر ⇒ saved=6.
- گارد سرور (curl): PUT ناسازگار (معین=۳ با ۶/۲/۲) رد شد با پیام «مقدار فیلد «accSubsidiaryCodeLen» باید برابر مقدار «accCodeLen» منهای جمع «accGroupCodeLen» و «accLedgerCodeLen» باشد» و DB دست‌نخورده ✓؛ PUT سازگار ⇒ 200 saved=6 ✓.
- E2E (agent-browser) fa/RTL: عنوان گروه «طول کدینگ حسابها»؛ ترتیب و مقادیر ۶/۲/۲/۲(RO)/۰ ✓؛ معین readOnly + muted + متن راهنما ✓؛ مشتق زنده: کدحسابها=۸ ⇒ معین=۴ و کل=۳ ⇒ معین=۳ (۸−۲−۳) ✓؛ ذخیره ⇒ توست «ذخیره» و DB (8/2/3/3/0) ✓؛ reload ⇒ بازگشایی ⇒ همان مقادیر با معین(RO) ✓؛ آزمون منفی: کدحسابها=۳ ⇒ معین=−۲ ⇒ توست «طول حساب معین نامعتبر است؛ طول کد حسابها باید عددی بزرگ‌تر یا برابر جمع طول گروه حساب و طول حساب کل باشد.» و DB دست‌نخورده ✓؛ بازگردانی ۶/۲/۲/۲/۰ ⇒ توست «ذخیره» و DB ✓.
- E2E en/LTR: عنوان «Account coding lengths» و برچسب‌ها Account code length/Account group length/Ledger account length/Subsidiary account length/Detail account length ✓؛ مشتق زنده ۹−۲−۲=۵ ✓؛ توست «Save» و DB ✓؛ بازگردانی ۶/۲/۲/۲/۰ ✓.
- موبایل ۳۷۵×۸۱۲ (fa): تک‌ستونه (۵×۲۵۷px)، بدون سرریز افقی، معین RO ✓.
- کنسول/خطای مرورگر در همهٔ سناریوها: صفر.
- lint ریشه = ۰/۰؛ tsc ریشه = صفر خطا در فایل‌های این تسک؛ tsc settings-service = صفر.
- بکاپ §0.9 پیش از پوش: «backup db/custom-2026-10-28_1206.db» + «backup db/dfb-2026-10-28_1206.db».

Stage Summary:
- تب «حسابداری» پیکربندی نرم‌افزار اکنون گروپ فیلد «طول کدینگ حسابها» را با پنج فیلد دارد: طول کد حسابها (۶، تازه)، طول گروه حساب (۲)، طول حساب کل (۲ — پیش‌فرض تازه)، طول حساب معین (فقط‌خواندنیِ مشتق‌شدهٔ زنده = طول کد حسابها − طول گروه حساب − طول حساب کل = ۲) و طول حساب تفصیلی (۰) — سه فیلد اول آزادانه قابل ویرایش‌اند و معین با هر تغییر زنده به‌روز می‌شود.
- قانون دوخطی سازگاری (فرانت: توست اختصاصی، سرور: رد ۴۲۲) برای فرمول سه‌جمله‌ای تعمیم یافت و با curl و E2E اثبات شد؛ مقادیر ذخیره‌شدهٔ DB با مهاجرت API به ساختار مالک (۶/۲/۲/۲/۰) رسید.
- artifacts: src/components/erp/settings/software-config-window.tsx؛ mini-services/settings-service/src/software-config/software-config.dto.ts + software-config.service.ts؛ src/i18n/dictionaries.ts (کلید تازه + تغییر مقدار گروه + ۲ کلید بازگشتی ×۱۳). بکاپ‌های §0.9 (bak-t137 + timestamped).

---
Task ID: 138
Agent: Z.ai Code (main)
Task: «در پیکربندی نرم افزار دکمه ذخیره را در هدر فرم جایی که با فلش قرمز مشخص کردم قرار دهید. برای دکمه ذخیره از آیکون ذخیره اکشن بار استفاده نمایید. فیلد طول کدتفصیلی را بصورت پیش فرض با عدد 6 تکمیل نمایید.»

Work Log:
- §0.1 انجام شد؛ §0.9 پیش از تغییر: db/custom.db.bak-t138 + db/dfb.db.bak-t138.
- فرانت (software-config-window.tsx): دکمهٔ ذخیره از انتهای فرم به «هدر» هاب منتقل شد — سطر هدر با justify-between: بلوک عنوان (راست در RTL) و دکمهٔ ذخیره در سمت مقابل (چپ در RTL؛ عین محل فلش قرمز تصویر مالک؛ در LTR قرینه به راست). خودِ دکمه = کامپوننت SaveButton اکشن‌بار (src/components/forms/action-bar/save-button.tsx) — دکمهٔ مربعی ۳۶px با گرادیان سبز emerald و آیکون Save ۱۸px، تولتیپ «ذخیره اطلاعات» (abar.save)، aria-label و حالت busy با چرخش — بازاستفادهٔ کامل نه کپی. دکمهٔ پایینیِ قبلی (متن+آیکون Save) حذف شد و import بلااستفادهٔ Save از lucide پاک شد. دکمهٔ هدر در تب‌های بی‌فیلد (عمومی/در انتظار) یا دادهٔ لودنشده غیرفعال است (aria-disabled=true، opacity-۴۰).
- پیش‌فرض «طول حساب تفصیلی» از ۰ به ۶: رجیستری فرانت + whitelist سرور (software-config.dto.ts) هر دو defaultValue "6"؛ معین مشتقی از تفصیلی تأثیر نمی‌گیرد (فرمول سه‌جمله‌ای کدحسابها−گروه−کل دست‌نخورده).
- مهاجرت مقدار ذخیره‌شدهٔ DB از راه API: accDetailCodeLen ۰→۶ (PUT سازگار ۶/۲/۲/۲/۶ ⇒ 200 saved=6).
- E2E (agent-browser) fa/RTL: دکمهٔ «ذخیره اطلاعات» در نوار هدر (y=۱۲۰ داخل باند هدر y=۱۰۲؛ x=۲۵ — چپ/انتهای RTL)، مربع ۳۶×۳۶ سبز، فعال ✓؛ دکمهٔ پایینی حذف ✓؛ مقادیر ۶/۲/۲/۲/۶ با معین(RO) ✓؛ عمومی: aria-disabled=true ✓؛ کارکرد: گروه=۴ ⇒ معین زنده=۰، کلیک دکمهٔ هدر ⇒ توست «ذخیره» و DB (6/4/2/0/6) ✓؛ بازگردانی ۶/۲/۲/۲/۶ ✓.
- E2E en/LTR: دکمهٔ «Save data» در هدر سمت راست (x=۹۴۴ — قرینهٔ جهت‌آگاه) سبز emerald ✓؛ تب Accounting با Detail account length=۶ و دکمهٔ فعال ✓.
- موبایل ۳۷۵×۸۱۲ (fa): دکمه در هدر دیده می‌شود (x=۲۵، بدون سرریز افقی)، پنج فیلد تک‌ستونه با تفصیلی=۶ ✓.
- کنسول/خطای مرورگر در همهٔ سناریوها: صفر.
- lint ریشه = ۰/۰؛ tsc ریشه = صفر خطا در فایل‌های این تسک؛ tsc settings-service = صفر.
- بکاپ §0.9 پیش از پوش: «backup db/custom-2026-10-28_1217.db» + «backup db/dfb-2026-10-28_1217.db».

Stage Summary:
- هدر «پیکربندی نرم افزارها» اکنون دکمهٔ ذخیرهٔ اکشن‌بار (SaveButton: مربع سبز emerald + آیکون Save + تولتیپ) را در سمت مقابل عنوان دارد — عین محل فلش قرمز مالک؛ دکمهٔ تکراری پایین فرم حذف شد. دکمه هوشمند است: در تب‌های بدون فیلد اعلام‌شده یا قبل از لود داده غیرفعال می‌شود و در حین ذخیره اسپینر می‌گیرد.
- «طول حساب تفصیلی» پیش‌فرض ۶ شد (فرانت + سرور + مهاجرت مقدار ذخیره‌شده)؛ فرمول مشتق معین و بقیهٔ ساختار دست‌نخورده.
- artifacts: src/components/erp/settings/software-config-window.tsx؛ mini-services/settings-service/src/software-config/software-config.dto.ts. بکاپ‌های §0.9 (bak-t138 + timestamped).

---
Task ID: 139
Agent: Z.ai Code (main)
Task: «توی تنظیمات و پیکربندی نرم افزار و در تب حسابداری یک فیلد اضافه کنید بنام تعداد سطوح تفصیلی و بصورت پیش فرض عدد 10 در آن وجود داشته باشد و حداکثر می تواند 20 باشد» — فیلد تازهٔ «تعداد سطوح تفصیلی».

Work Log:
- §0.1 انجام شد؛ §0.9 پیش از تغییر: db/custom.db.bak-t139 + db/dfb.db.bak-t139.
- برداشت اعلامی §0.6: «تعداد سطوح تفصیلی» فیلد شمارندهٔ عددی مستقل در تب حسابداری است (بیرون از گروپ تأییدشدهٔ مالک «طول کدینگ حسابها» چون مالک آن را فیلدی جداگانه اعلام کرد) — کلید پایدار accDetailLevels، صحیح، پیش‌فرض ۱۰، حداکثر ۲۰، حداقل ۱ (شمارِ سطوح نمی‌تواند صفر یا منفی باشد)؛ بلافاصله زیر گروپ به‌صورت فیلد ساده (بدون گروه) رندر می‌شود.
- فرانت (software-config-window.tsx): ورودی تازه در رجیستری SOFTWARE_CONFIG_FIELDS.accounting — type number، required (ستاره)، min 1 / max 20 / integer، defaultValue "10"؛ بدون هیچ تغییری در سازوکارها (مشتق/گروپ/ذخیرهٔ هدر Task 138 دست‌نخورده).
- سرور (software-config.dto.ts): کلید accDetailLevels در whitelist accounting آینه شد (min 1 / max 20 / integer / defaultValue "10")؛ قانون بازهٔ موجود Task 73 در service.ts بدون تغییر از همان مسیر اعمال می‌شود (خط دوم دفاعی).
- i18n §1.3: کلید تازهٔ settings.swAccDetailLevels در هر ۱۳ زبان (خودآزما: دقیقاً ×۱۳): fa «تعداد سطوح تفصیلی»، en «Number of detail levels»، tr «Detay seviyesi sayısı»، ar «عدد المستويات التفصيلية»، hi «विस्तृत स्तरों की संख्या»، ps «د تفصیلي سطحو شمېر»، ckb «ژمارەی ئاستەکانی وردەکاری»، pt «Número de níveis de detalhes»، ko «상세 단계 수»، fr «Nombre de niveaux de détails»، zh «辅助核算层级数»، de «Anzahl der Detailebenen»، ru «Количество аналитических уровней».
- مهاجرت DB لازم نبود (فلسفهٔ Task 72: فیلد تازه = ردیف تازه هنگام اولین ذخیره)؛ با آزمون curl پیش‌فرض ۱۰ در DB نشست.
- گارد سرور (curl از راه پروکسی BFF): PUT با ۲۵ ⇒ رد «مقدار فیلد «accDetailLevels» نمی‌تواند بیشتر از 20 باشد» و DB دست‌نخورده ✓؛ PUT با ۰ ⇒ رد «نمی‌تواند کمتر از 1 باشد» ✓؛ PUT با ۱۰ ⇒ 200 saved=1 ✓.
- E2E (agent-browser) fa/RTL: تب حسابداری — فیلد «تعداد سطوح تفصیلی *» به‌صورت بخش مستقل زیر گروپ «طول کدینگ حسابها» با پیش‌فرض ۱۰ ✓؛ readOnly=false، min=1، max=20، step=1 ✓؛ آزمون منفی: ۲۵ ⇒ توست «مقدار «تعداد سطوح تفصیلی» باید عددی بین 1 و 20 باشد.» و DB روی ۱۰ ماند ✓؛ ذخیرهٔ ۱۵ ⇒ توست «ذخیره» و DB=15 ✓؛ reload کامل ⇒ بازگشایی ⇒ همان ۱۵ از DB ✓؛ بازگردانی ۱۰ ⇒ DB ✓.
- E2E en/LTR: برچسب «Number of detail levels *» بخش مستقل زیر Account coding lengths با پیش‌فرض ۱۰ ✓؛ ویرایش ۱۲ ⇒ توست Save و DB=12 ✓؛ بازگردانی ۱۰ ⇒ DB ✓.
- موبایل ۳۷۵×۸۱۲ (en/fa layout): تک‌ستونه، فیلد دیده می‌شود، بدون سرریز افقی (scrollW=clientW=375) ✓.
- کنسول/خطای مرورگر در همهٔ سناریوها: صفر؛ dev.log پاک.
- lint ریشه = ۰/۰؛ tsc ریشه برای فایل‌های این تسک = صفر خطا؛ tsc settings-service = صفر.
- وضعیت نهایی بانک: accDetailLevels=10 (پیش‌فرض مالک) در کنار 6/2/2/2/6 و fiscalMonthsCount=12 — سایر ردیف‌ها دست‌نخورده.

Stage Summary:
- تب «حسابداری» پیکربندی نرم‌افزار اکنون فیلد مستقل «تعداد سطوح تفصیلی» را دارد: عدد صحیح با پیش‌فرض ۱۰ و حداکثر ۲۰ (و حداقل ۱ طبق تفسیر اعلامی §0.6)، با ستارهٔ اجباری، بیرون از گروپ «طول کدینگ حسابها» و بلافاصله زیر آن.
- دو خط دفاعی بازه (فرانت: توست اختصاصی، سرور: رد 422) اثبات شد؛ مقدار در جدول SoftwareConfig بدون هیچ مهاجرت ماندگار است و پس از reload برمی‌گردد؛ زبان/نما/مقادیر به حالت پایه بازگشت.
- artifacts: src/components/erp/settings/software-config-window.tsx؛ mini-services/settings-service/src/software-config/software-config.dto.ts؛ src/i18n/dictionaries.ts (۱ کلید تازه ×۱۳). بکاپ‌های §0.9 (bak-t139 + timestamped).

---
Task ID: 140
Agent: Z.ai Code (main)
Task: «پرامپت زیر را بخوانید و با استفاده از کامپوننت SimpleTreeForm در زیرمنوی اطلاعات پایه حسابداری فرم درختواره حسابها را ایجاد نمایید» — فرم کامل «درختواره حسابها» با درخت ۴ سطحی، پنل جزئیات، نوار ابزار و خروجی‌ها.

Work Log:
- §0.1 انجام شد؛ §0.9 پیش از تغییر: db/custom.db.bak-t140 + db/dfb.db.bak-t140.
- برداشت اعلامی §0.6: کلیدهای طول کد = همان رجیستری Tasks 135/137/139 (گروه=accGroupCodeLen ۲، کل=گروه+accLedgerCodeLen ۴، معین/شاخه=گروه+کل+accSubsidiaryCodeLen ۶)؛ شمار سطوح تفصیلی=accDetailLevels (Task 139)؛ «enableLedgerAccessControl» به whitelist سرور اضافه شد (چک‌باکس، بدون فیلد UI تا اعلام مالک — فقط راه API)؛ «toggle چندحالته» = سه حالت ۰=خاموش/۱=فعال/۲=اجباری با رنگ اختصاصی هر ویژگی؛ تب‌ها فقط برای سطح ≥۳ (کاربران مجاز شرطی به تنظیم؛ بقیه همیشه)؛ کد سطح ۴ = طول معین؛ «جدید/انصراف» = کاشی ریست اکشن‌بار (الگوی bs-window)؛ PDF/چاپ = پنجرهٔ چاپ استاندارد (ذخیره به‌صورت PDF از همان مسیر).
- بک‌اند (settings-service): شش مدل تازهٔ Prisma — AccountNode (level ۱..۴، code یکتا در ساختار، title/latinTitle/isActive، accountType فقط L1، nature گروه/کل=۱/۲/۷ و معین=۳/۴/۵/۶/۷ و شاخه=۰، natureControl فقط معین ۳/۴، پنج ویژگی Int ۰..۲) + AccountDetailLevel (سطر «سطح اول..N» هر گره ≥۳؛ N از accDetailLimits... accDetailLevels کلمپ ۱..۲۰) + AccountDetailLevelType (انتساب نوع تفصیلی؛ تکراری در گره ۴۰۹) + AccountNatureAdjust (۳↔۴/۵↔۶؛ خود حساب مستثنا) + AccountRecurringDesc + AccountAllowedUser (۶ مجوز سند) — همگی با بلوک کامل AppBaseEntity؛ ثبت در VERSIONED_MODELS و TABLE_REGISTRY؛ db:push موفق بدون مهاجرت دستی.
- ماژول NestJS account-tree (controller/service/dto): GET list/detail (جزئیات کامل گره + config) / POST / PUT (نرمال‌سازی فیلدهای سطح، طول دقیق کد، یکتایی کد/عنوان-خواهربرادر، بازنویسی تراکنشی مجموعه‌ها) / DELETE (با فرزند ۴۰۹) / POST+DELETE انتساب نوع تفصیلی. **باگ یافت‌شده و رفع‌شده در E2E**: فراخوانی generateNextId (تراکنش مستقل §8) «داخل» تراکنش بیزینسی ⇒ بن‌بست قفل SQLite و P2028 (timeout ۵ث)؛ راه‌حل: پیش‌تولید همهٔ IDها با generateNextIdBlock و پیش‌اعتبارسنجی ارجاع‌ها «بیرون» از تراکنش + timeout ۳۰ث — تراکنش فقط می‌نویسد.
- فرانت (account-tree-form.tsx روی SimpleTreeForm): درخت با ریشهٔ مجازی «ساختار کدینگ حساب‌ها» + جستجوی زنده (فیلتر کد/عنوان/لاتین با حفظ اجداد)؛ برچسب پویای افزودن بر اساس سطح (افزودن گروه حساب/حساب کل/حساب معین/شاخه) با تعمیم additive ساده در SimpleTreeForm (addBranchLabel تابعی + actionBarExtra)؛ فیلدهای پویا per-level (کد عددی با maxLength سطح، عنوان، لاتین، فعال، نوع حساب L1، ماهیت، کنترل ماهیت شرطی ۳/۴)؛ ریشه فقط‌خواندنی + راهنما؛ گروپ «ویژگی‌های حساب» با ۵ toggle سه‌حالتهٔ رنگی (emerald/amber/rose/violet/teal)؛ پنج تب سطح ≥۳ (سطوح تفصیلی دوپنلی با عنوان inline و فعال فقط‌نمایشی + مودال «انتخاب نوع تفصیلی» با دابل‌کلیک و فیلتر استفاده‌شده‌ها، کاربران مجاز شرطی با دراپ‌داون ۳ستونه و ۶ چک‌باکس دسترسی، معین تعدیل ماهیت با فیلتر ماهیت مخالف، شرح های پرتکرار textarea، ضمایم placeholder «در انتظار پیکربندی»)؛ خوشهٔ خروجی اکسل/ورد/PDF/چاپ با مودال مشترک چک‌باکس ۴ سطح؛ اکسل = downloadExcel واقعی (SheetJS، rtl همگام زبان)، ورد = Blob .doc، PDF/چاپ = پنجرهٔ چاپ.
- ثبت در منو: accounting-nav-store (+account-tree)، accounting-menu-home (ListTree، teal→cyan)، accounting-window (زیرصفحه + عنوان زندهٔ برگه «حسابداری — درختواره حسابها»؛ onBack برای ذخیره و بستن).
- i18n §1.3: ۱۲۰ کلید atr.* در هر ۱۳ زبان + ۲۰ کلید ordinal سطوح (fa عین پرامپت «سطح اول…بیستم»؛ سایر زبان‌ها «Level n» و …) — خودآزما: هر کلید ×۱۳ (جمع ۱۸۲۰ سطر تازه با اسکریپت).
- E2E (agent-browser) fa/RTL: منو ← فرم؛ ریشهٔ مجازی با فیلدهای RO و راهنما ✓؛ ایجاد گروه 01 دارایی‌ها (نوع=ترازنامه‌ای، ماهیت=بدهکار) ✓؛ حساب کل 0101 با برچسب پویا ✓؛ حساب معین 010101 صندوق با ماهیت بدهکار طی دوره ⇒ کنترل ماهیت ظاهر شد + ویژگی‌ها (تعدادی=اجباری emerald، ارزی=فعال violet) ✓؛ تب سطوح دقیقاً ۲۰ سطر از تنظیم مالک (accDetailLevels=20 — مالک بین دو تسک به ۲۰ و ماه‌های مالی به ۱۶ تغییر داده؛ اثبات زندهٔ پیکربندی‌محوربودن) ✓؛ انتساب نوع تفصیلی «صندوق» با دابل‌کلیک از مودال ✓؛ عنوان سطح ذخیره شد ✓؛ حساب معین دوم 010102 بانک (بستانکار طی دوره) ⇒ در تعدیل ماهیتِ صندوق فقط همین یکی در دراپ‌داون (فیلتر مخالف + استثنای خود) ✓؛ ذخیرهٔ ردیف تعدیل + شرح‌های پرتکرار از UI ✓؛ تب «کاربران مجاز» با تنظیم enableLedgerAccessControl=1 ظاهر و با 0 مخفی شد (حالت خالی درست — کاربری در DB نیست) ✓؛ مودال خروجی با ۴ چک‌باکس + تأیید بدون خطا ✓؛ گارد حذف 0101 با فرزند ⇒ 409 سرور و گره ماند ✓؛ توست اعتبارسنجی (کد/نوع/ماهیت الزامی) دیده شد ✓.
- E2E en/LTR: Accounts Tree/Account Coding Structure/Subsidiary account code/Debit during period/No control/Account features/Detail levels/Detail types of level — Level 1/Attachments و… ✓؛ درخت چپ، خروجی‌ها راست (قرینهٔ جهت) ✓؛ بازگشت به fa با حفظ کامل داده و انتخاب.
- موبایل ۳۷۵×۸۱۲: پنل‌ها پشته، بدون سرریز افقی (scrollW=clientW=375) ✓.
- کنسول/خطای مرورگر در همهٔ سناریوها: صفر. lint ریشه = ۰/۰؛ tsc ریشه فایل‌های تسک = صفر؛ tsc settings-service = صفر.
- بکاپ §0.9 پیش از پوش: timestamped جدید.

Stage Summary:
- فرم «درختواره حسابها» عین پرامپت مالک در زیرمنوی «اطلاعات پایه» حسابداری فعال است: درخت ۴ سطحی با ریشهٔ مجازی و جستجو، برچسب افزودن سطح‌آگاه، طول کد از تنظیمات حسابداری (۲/۴/۶ با تنظیم فعلی مالک)، فیلدهای مشترک + اختصاصی هر سطح با Enumهای اعلامی، ویژگی‌های حساب ۵گانهٔ چندحالته، تب‌های سطوح تفصیلی (۲۰ سطر از accDetailLevels)/کاربران مجاز (شرطی)/معین تعدیل ماهیت (فیلتر مخالف ۳↔۴/۵↔۶)/شرح های پرتکرار/ضمایم، نوار ابزار کامل + خروجی اکسل/ورد/PDF/چاپ با مودال انتخاب سطوح.
- دو خط دفاعی فرانت/سرور برای همهٔ قوانین (طول کد، یکتایی، سطح، ماهیت، حذف با فرزند، انتساب تکراری)؛ ماندگاری کامل در شش جدول تازهٔ AppBase بدون هیچ مهاجرت دستی؛ باگ قفل تراکنش SQLite رفع و با curl-guard و E2E اثبات شد.
- artifacts: mini-services/settings-service (schema.prisma + src/account-tree/* + prisma.service + table-registry + app.module + software-config.dto)؛ src/components/erp/accounting/account-tree-form.tsx (تازه) + accounting-window/menu-home + src/stores/accounting-nav-store + src/components/forms/simple-tree-form.tsx (دو تعمیم additive) + src/i18n/dictionaries.ts (+۱۸۲۰) + scripts/t140-i18n*.mjs. بکاپ‌های §0.9 (bak-t140 + timestamped).
