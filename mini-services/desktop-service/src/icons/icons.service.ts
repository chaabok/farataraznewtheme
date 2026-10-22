import { Injectable, Logger } from '@erp/shared';
import { Inject } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIconDto } from './dto/create-icon.dto';
import type { DesktopIcon } from '@prisma/client';

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<DesktopIcon[]> {
    return this.prisma.desktopIcon.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<DesktopIcon | null> {
    return this.prisma.desktopIcon.findUnique({ where: { id } });
  }

  async create(dto: CreateIconDto): Promise<DesktopIcon> {
    this.logger.log(`Creating icon "${dto.name}"`);
    return this.prisma.desktopIcon.create({ data: dto });
  }
}
