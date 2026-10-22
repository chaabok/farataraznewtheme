import { ConflictException, Inject, Injectable } from '@erp/shared';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  findAll() {
    return this.prisma.statement.findMany({
      orderBy: { period: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.statement.create({
        data: dto as Prisma.StatementUncheckedCreateInput,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException('رکورد تکراری است (مقدار یکتا قبلاً ثبت شده است)');
      }
      throw error;
    }
  }

  async stats() {
    const [all, byKind] = await Promise.all([
      this.prisma.statement.aggregate({ _count: true, _sum: { netValue: true } }),
      this.prisma.statement.groupBy({ by: ['kind'], _count: true }),
    ]);
    const kinds: Record<string, number> = {};
    for (const row of byKind) {
      kinds[row.kind] = row._count;
    }
    return { count: all._count, totalNetValue: all._sum.netValue ?? 0, byKind: kinds };
  }
}
