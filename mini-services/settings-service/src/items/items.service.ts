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
    return this.prisma.setting.findMany({
      orderBy: { key: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.setting.create({
        data: dto as Prisma.SettingUncheckedCreateInput,
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
    const [count, rows] = await Promise.all([
      this.prisma.setting.count(),
      this.prisma.setting.findMany({ select: { category: true }, distinct: ['category'] }),
    ]);
    return { count, categories: rows.length };
  }
}
