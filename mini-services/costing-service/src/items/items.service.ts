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
    return this.prisma.costItem.findMany({
      orderBy: { product: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.costItem.create({
        data: dto as Prisma.CostItemUncheckedCreateInput,
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
    const agg = await this.prisma.costItem.aggregate({
      _count: true,
      _sum: { materialCost: true, laborCost: true, overhead: true },
    });
    return {
      count: agg._count,
      totalMaterial: agg._sum.materialCost ?? 0,
      totalLabor: agg._sum.laborCost ?? 0,
      totalOverhead: agg._sum.overhead ?? 0,
    };
  }
}
