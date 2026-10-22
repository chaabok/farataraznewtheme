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
    return this.prisma.customerOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.customerOrder.create({
        data: dto as Prisma.CustomerOrderUncheckedCreateInput,
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
    const [all, open] = await Promise.all([
      this.prisma.customerOrder.aggregate({ _count: true, _sum: { total: true } }),
      this.prisma.customerOrder.count({ where: { status: { in: ['new', 'processing'] } } }),
    ]);
    return { count: all._count, totalValue: all._sum.total ?? 0, openCount: open };
  }
}
