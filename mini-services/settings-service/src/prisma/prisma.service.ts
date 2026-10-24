import { Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * PrismaService — DI token/type. The actual instance is built by
 * createVersionedPrismaClient() (see prisma.module.ts) and IS the extended
 * client below, so every consumer keeps the exact same API surface.
 *
 * §2.5 auto-rowversion (owner rule: «هر جدول باید ستون Version داشته باشد که
 * هر بار تغییر کند متوجه شویم»): a single global query extension bumps
 * `version` (+1) on EVERY write of EVERY model listed in VERSIONED_MODELS:
 *   · update / updateMany   → injected into args.data (unless caller set it);
 *   · upsert                → injected into args.update ONLY when the update
 *                             payload is non-empty (idempotent seeds use
 *                             `update: {}` and must NOT churn the version).
 * WHY an explicit registry: Prisma.dmmf.datamodelMap is undefined in Prisma 6.19
 * (DMMF shape changed) — runtime introspection silently passed nothing; an
 * explicit, dictionary-driven set matches the TABLE_REGISTRY philosophy (§2.4)
 * and is deterministic across Prisma versions.
 * RULE (§2.5): every NEW table with a `Version` column MUST be added to
 * VERSIONED_MODELS. Services must NOT write manual `version: {increment:1}`
 * (double-bump); an explicitly caller-provided version still wins (escape hatch).
 * Note: Prisma 6 removed the classic `$use` middleware — `$extends` is the
 * supported mechanism (verified: +1 per update, no churn on empty upsert).
 */
const VERSIONED_MODELS: ReadonlySet<string> = new Set([
  "IDGeneration",
  "Setting",
  "BusinessStructure",
  "BusinessStructureUser",
  "AppRegistry",
  "Systems",
  "SoftwareConfig", // Task 72 — پیکربندی نرم‌افزارها
]);

const VERSION_ACTIONS = new Set(["update", "updateMany", "upsert"]);

export class PrismaService extends PrismaClient {}

export function createVersionedPrismaClient(): PrismaService {
  const logger = new Logger("PrismaService");
  const base = new PrismaClient();
  const ext = base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // args is the union of ALL model arg types (find* lack data/update) — narrow first
          const a = args as { data?: Record<string, unknown>; update?: Record<string, unknown> } | undefined;
          if (a && model && VERSION_ACTIONS.has(operation) && VERSIONED_MODELS.has(model)) {
            if (operation === "upsert") {
              const upd = a.update;
              if (
                upd &&
                typeof upd === "object" &&
                Object.keys(upd).length > 0 &&
                upd.version === undefined
              ) {
                a.update = { ...upd, version: { increment: 1 } };
              }
            } else {
              const data = a.data;
              if (data && typeof data === "object" && data.version === undefined) {
                a.data = { ...data, version: { increment: 1 } };
              }
            }
          }
          return query(args);
        },
      },
    },
  });

  const hooks = {
    onModuleInit: async () => {
      await base.$connect();
      logger.log(
        `Prisma connected — §2.5 auto-rowversion active on: ${[...VERSIONED_MODELS].join(", ")}`,
      );
    },
    onModuleDestroy: async () => {
      await base.$disconnect();
    },
  };

  // Pass-through proxy: everything delegates to the extended client; only the
  // Nest lifecycle hooks are served from the closure. Reflect binds the receiver
  // to the extended client itself so Prisma's internal delegate resolution never
  // escapes the extension pipeline.
  return new Proxy(ext as unknown as PrismaService, {
    get(target, prop) {
      if (prop in hooks) return hooks[prop as keyof typeof hooks];
      return Reflect.get(target, prop, target);
    },
  });
}
