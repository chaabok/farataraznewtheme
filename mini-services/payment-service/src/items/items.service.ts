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
    return this.prisma.paymentRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.paymentRecord.create({
        data: dto as Prisma.PaymentRecordUncheckedCreateInput,
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
    const rows = await this.prisma.paymentRecord.findMany({ select: { kind: true, amount: true } });
    const receipts = rows.filter((r) => r.kind === 'receipt').reduce((sum, r) => sum + r.amount, 0);
    const payments = rows.filter((r) => r.kind === 'payment').reduce((sum, r) => sum + r.amount, 0);
    return {
      count: rows.length,
      totalReceipts: Number(receipts.toFixed(2)),
      totalPayments: Number(payments.toFixed(2)),
      net: Number((receipts - payments).toFixed(2)),
    };
  }
}
