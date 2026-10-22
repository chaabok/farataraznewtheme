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
    return this.prisma.journalEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.journalEntry.create({
        data: dto as Prisma.JournalEntryUncheckedCreateInput,
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
    const agg = await this.prisma.journalEntry.aggregate({
      _count: true,
      _sum: { debit: true, credit: true },
    });
    const totalDebit = agg._sum.debit ?? 0;
    const totalCredit = agg._sum.credit ?? 0;
    return {
      count: agg._count,
      totalDebit,
      totalCredit,
      balance: Number((totalDebit - totalCredit).toFixed(2)),
    };
  }
}
