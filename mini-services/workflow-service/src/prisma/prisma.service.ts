import { Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * PrismaService — workflow-service (db/workflow.db). Same §2.5 auto-rowversion
 * contract as settings/dfb: a single global query extension bumps `version`
 * (+1) on EVERY write of every VERSIONED model. Rule (§2.5): every NEW table
 * with a `Version` column MUST be registered here.
 */
const VERSIONED_MODELS: ReadonlySet<string> = new Set([
  "IDGeneration",
  "WorkflowRole",
  "WorkflowRoleAssignment",
  "WorkflowDefinition",
  "WorkflowInstance",
  "WorkflowStatusMap",
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
        `Prisma connected (workflow.db) — §2.5 auto-rowversion active on: ${[...VERSIONED_MODELS].join(", ")}`,
      );
    },
    onModuleDestroy: async () => {
      await base.$disconnect();
    },
  };

  return new Proxy(ext as unknown as PrismaService, {
    get(target, prop) {
      if (prop in hooks) return hooks[prop as keyof typeof hooks];
      return Reflect.get(target, prop, target);
    },
  });
}
