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
    return this.prisma.stockItem.findMany({
      orderBy: { name: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.stockItem.create({
        data: dto as Prisma.StockItemUncheckedCreateInput,
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
    const rows = await this.prisma.stockItem.findMany({ select: { quantity: true, minQuantity: true } });
    const totalQuantity = rows.reduce((sum, r) => sum + r.quantity, 0);
    const lowStock = rows.filter((r) => r.quantity <= r.minQuantity).length;
    return { count: rows.length, totalQuantity, lowStock };
  }
}
