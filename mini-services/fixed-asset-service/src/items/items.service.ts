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
    return this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.asset.create({
        data: dto as Prisma.AssetUncheckedCreateInput,
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
    const agg = await this.prisma.asset.aggregate({
      _count: true,
      _sum: { initialValue: true },
      _avg: { depreciationRate: true },
    });
    return {
      count: agg._count,
      totalValue: agg._sum.initialValue ?? 0,
      avgDepreciationRate: Number((agg._avg.depreciationRate ?? 0).toFixed(2)),
    };
  }
}
