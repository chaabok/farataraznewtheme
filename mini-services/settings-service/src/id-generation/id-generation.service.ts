import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { bigToNumber, possibleNames, resolveEntry } from "./table-registry";

/**
 * IdGenerationService — faithful re-implementation of the legacy contract (spec §3-§5):
 *  1. one counter row per table, UNIQUE(TableName), stored under the canonical name;
 *  2. short independent transaction (SQLite serializes writes → FOR UPDATE semantics for free);
 *  3. self-healing formula max(LastID+1, maxDbId+1) on fresh rows / strictSelfHeal tables;
 *  4. block reservation for batch child rows;
 *  catch is scoped ONLY to unique-violation (PG 23505 ≡ Prisma P2002) — never swallow others.
 */
@Injectable()
export class IdGenerationService {
  private readonly logger = new Logger(IdGenerationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Reserves one id. */
  async generateNextId(tableName: string): Promise<number> {
    return this.withTx(async (tx) => this.nextInTx(tx, tableName, 1));
  }

  /** Reserves `count` consecutive ids; returns startId (consumer uses startId..startId+count-1). */
  async generateNextIdBlock(tableName: string, count: number): Promise<number> {
    if (!Number.isInteger(count) || count < 1 || count > 10_000) {
      throw new Error(`IDGeneration: invalid block count ${count}`);
    }
    return this.withTx(async (tx) => this.nextInTx(tx, tableName, count));
  }

  /* ------------------------------------------------------------------ */

  private async withTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    // Short, independent interactive transaction — never composed with business txs
    // so a burned id (gap) stays an accepted, documented behavior (spec §8).
    return this.prisma.$transaction(fn, { timeout: 5_000, maxWait: 2_000 });
  }

  private async nextInTx(
    tx: Prisma.TransactionClient,
    tableName: string,
    count: number,
  ): Promise<number> {
    const entry = resolveEntry(tableName);
    const names = possibleNames(tableName);

    let row = await tx.iDGeneration.findFirst({
      where: { tableName: { in: names } },
    });

    if (!row) {
      // ---- fresh counter row (self-heal bootstrap, spec §4 step 6) ----
      const maxDbId = await this.maxDbId(tx, entry);
      let nextId = Math.max(1, maxDbId + 1);
      if (entry.reservedIds?.length) {
        nextId = Math.max(nextId, Math.max(...entry.reservedIds) + 1);
      }
      try {
        const counterId = await this.nextCounterId(tx);
        await tx.iDGeneration.create({
          data: { idGenerationId: BigInt(counterId), tableName: entry.canonical, lastId: BigInt(nextId + count - 1) },
        });
      } catch (e) {
        if (!this.isUniqueViolation(e)) throw e; // catch scoped to 23505/P2002 only
        // race on simultaneous counter-row creation: adopt the existing row (spec §4)
        row = await tx.iDGeneration.findFirst({ where: { tableName: entry.canonical } });
        if (!row) throw e;
        const existing = Number(row.lastId);
        const merged = Math.max(existing, nextId);
        await tx.iDGeneration.update({
          where: { idGenerationId: row.idGenerationId },
          data: { lastId: BigInt(merged + count - 1) },
        });
        return merged;
      }
      return nextId;
    }

    // ---- existing counter row ----
    const lastId = Number(row.lastId);
    let candidate = lastId + 1;
    if (entry.strictSelfHeal) {
      const maxDbId = await this.maxDbId(tx, entry);
      candidate = Math.max(candidate, maxDbId + 1);
    }
    if (entry.reservedIds?.length) {
      candidate = Math.max(candidate, Math.max(...entry.reservedIds) + 1);
    }
    await tx.iDGeneration.update({
      where: { idGenerationId: row.idGenerationId },
      data: { lastId: BigInt(candidate + count - 1) },
    });
    return candidate;
  }

  /** MAX(pk) — identifiers come ONLY from TABLE_REGISTRY (never from user input). */
  private async maxDbId(
    tx: Prisma.TransactionClient,
    entry: { canonical: string; pk: string },
  ): Promise<number> {
    const rows: Array<{ m: bigint | null }> = await tx.$queryRawUnsafe(
      `SELECT MAX("${entry.pk}") AS m FROM "${entry.canonical}"`,
    );
    return rows[0]?.m != null ? bigToNumber(rows[0].m) : 0;
  }

  /** The counter table's own manual PK: MAX(IDGenerationID)+1 (spec §2). */
  private async nextCounterId(tx: Prisma.TransactionClient): Promise<number> {
    const rows: Array<{ m: bigint | null }> = await tx.$queryRawUnsafe(
      `SELECT MAX("IDGenerationID") AS m FROM "IDGeneration"`,
    );
    return (rows[0]?.m != null ? bigToNumber(rows[0].m) : 0) + 1;
  }

  private isUniqueViolation(e: unknown): boolean {
    return (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    );
  }
}
