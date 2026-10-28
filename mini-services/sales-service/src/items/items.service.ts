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
    return this.prisma.saleInvoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.saleInvoice.create({
        data: dto as Prisma.SaleInvoiceUncheckedCreateInput,
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
    const [all, paid] = await Promise.all([
      this.prisma.saleInvoice.aggregate({ _count: true, _sum: { amount: true } }),
      this.prisma.saleInvoice.aggregate({ _sum: { amount: true }, where: { status: 'paid' } }),
    ]);
    return { count: all._count, totalAmount: all._sum.amount ?? 0, paidAmount: paid._sum.amount ?? 0 };
  }
}
