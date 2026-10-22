import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@erp/shared';
import type { AppRecord } from '../generated/data-client';
import {
  DataDatabasesService,
  type DatabaseKey,
} from '../data/data-databases.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { SetInstalledDto } from './dto/set-installed.dto';

/** Registry row shape returned to the gateway. */
export interface ServiceInstallView {
  moduleKey: string;
  name: string;
  selected: boolean;
  databaseKey: DatabaseKey;
  recordCount: number;
}

export interface DatabaseView {
  key: DatabaseKey;
  file: string;
  serviceCount: number;
  recordCount: number;
}

export interface SetupOverview {
  databases: DatabaseView[];
  services: ServiceInstallView[];
}

const DATABASE_FILES: Record<DatabaseKey, string> = {
  main: 'main.db',
  secondary: 'secondary.db',
};

const MODULE_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,49}$/;

/**
 * Core of the installation settings:
 *
 * - every service is either "selected" (installed in the MAIN database)
 *   or "not selected" (installed in the SECONDARY database);
 * - its business records always live in the database it is installed in;
 * - switching the installation state migrates the records between the two
 *   databases purely through the API/data layer (read → create → delete),
 *   never through a direct database link — the same primitive the public
 *   `POST /api/setup/exchange` endpoint exposes.
 */
@Injectable()
export class SetupService {
  constructor(
    @Inject(PrismaService) private readonly registry: PrismaService,
    @Inject(DataDatabasesService)
    private readonly data: DataDatabasesService,
  ) {}

  private assertModuleKey(moduleKey: string): void {
    if (!MODULE_KEY_PATTERN.test(moduleKey)) {
      throw new BadRequestException('شناسه ماژول نامعتبر است');
    }
  }

  private async requireService(moduleKey: string) {
    this.assertModuleKey(moduleKey);
    const service = await this.registry.serviceInstall.findUnique({
      where: { moduleKey },
    });
    if (!service) {
      throw new NotFoundException('ماژول مورد نظر یافت نشد');
    }
    return service;
  }

  private async countRecords(
    moduleKey: string,
    database: DatabaseKey,
  ): Promise<number> {
    return this.data
      .forDatabase(database)
      .appRecord.count({ where: { moduleKey } });
  }

  private toView(
    service: { moduleKey: string; name: string; selected: boolean },
    recordCount: number,
  ): ServiceInstallView {
    return {
      moduleKey: service.moduleKey,
      name: service.name,
      selected: service.selected,
      databaseKey: this.data.targetDatabase(service.selected),
      recordCount,
    };
  }

  /** GET /api/setup/overview */
  async overview(): Promise<SetupOverview> {
    const rows = await this.registry.serviceInstall.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const services = await Promise.all(
      rows.map(async (service) => {
        const databaseKey = this.data.targetDatabase(service.selected);
        return this.toView(
          service,
          await this.countRecords(service.moduleKey, databaseKey),
        );
      }),
    );

    const perDatabase: Record<DatabaseKey, DatabaseView> = {
      main: { key: 'main', file: DATABASE_FILES.main, serviceCount: 0, recordCount: 0 },
      secondary: {
        key: 'secondary',
        file: DATABASE_FILES.secondary,
        serviceCount: 0,
        recordCount: 0,
      },
    };
    for (const service of services) {
      perDatabase[service.databaseKey].serviceCount += 1;
      perDatabase[service.databaseKey].recordCount += service.recordCount;
    }

    return {
      databases: [perDatabase.main, perDatabase.secondary],
      services,
    };
  }

  /**
   * Reads every record of `moduleKey` from `fromDatabase` and writes the
   * ones missing in `toDatabase` (deduplicated by id). With mode "move"
   * the source rows are deleted afterwards. This is the API-level data
   * exchange between the two installation databases.
   */
  async transferRecords(
    moduleKey: string,
    fromDatabase: DatabaseKey,
    toDatabase: DatabaseKey,
    mode: 'move' | 'copy',
  ): Promise<number> {
    if (fromDatabase === toDatabase) return 0;

    const source = this.data.forDatabase(fromDatabase);
    const target = this.data.forDatabase(toDatabase);

    const rows: AppRecord[] = await source.appRecord.findMany({
      where: { moduleKey },
    });
    if (!rows.length) return 0;

    const existingIds = new Set(
      (
        await target.appRecord.findMany({
          where: { moduleKey },
          select: { id: true },
        })
      ).map((row) => row.id),
    );
    const fresh = rows.filter((row) => !existingIds.has(row.id));
    if (fresh.length) {
      await target.appRecord.createMany({ data: fresh });
    }
    if (mode === 'move') {
      await source.appRecord.deleteMany({
        where: { id: { in: rows.map((row) => row.id) } },
      });
    }
    return mode === 'move' ? rows.length : fresh.length;
  }

  /** PUT /api/setup/services/:moduleKey — flip installation + migrate records. */
  async setInstalled(
    moduleKey: string,
    dto: SetInstalledDto,
  ): Promise<{
    service: ServiceInstallView;
    fromDatabase: DatabaseKey;
    toDatabase: DatabaseKey;
    movedRecords: number;
  }> {
    const service = await this.requireService(moduleKey);
    if (service.selected === dto.selected) {
      const databaseKey = this.data.targetDatabase(service.selected);
      return {
        service: await this.toView(
          service,
          await this.countRecords(moduleKey, databaseKey),
        ),
        fromDatabase: databaseKey,
        toDatabase: databaseKey,
        movedRecords: 0,
      };
    }

    const updated = await this.registry.serviceInstall.update({
      where: { moduleKey },
      data: { selected: dto.selected },
    });

    const fromDatabase = this.data.targetDatabase(!dto.selected);
    const toDatabase = this.data.targetDatabase(dto.selected);
    const movedRecords = await this.transferRecords(
      moduleKey,
      fromDatabase,
      toDatabase,
      'move',
    );

    return {
      service: await this.toView(updated, movedRecords),
      fromDatabase,
      toDatabase,
      movedRecords,
    };
  }

  /** POST /api/setup/services/:moduleKey/records — create in the installed DB. */
  async addRecord(moduleKey: string, dto: CreateRecordDto) {
    const service = await this.requireService(moduleKey);
    const databaseKey = this.data.targetDatabase(service.selected);
    const record = await this.data
      .forDatabase(databaseKey)
      .appRecord.create({
        data: {
          moduleKey,
          title: dto.title,
          payload: dto.payload ?? '{}',
        },
      });
    return { databaseKey, record };
  }

  /** GET /api/setup/services/:moduleKey/records?database=main|secondary */
  async listRecords(moduleKey: string, database?: DatabaseKey) {
    const service = await this.requireService(moduleKey);
    const databaseKey: DatabaseKey =
      database === 'main' || database === 'secondary'
        ? database
        : this.data.targetDatabase(service.selected);
    const records = await this.data
      .forDatabase(databaseKey)
      .appRecord.findMany({
        where: { moduleKey },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    return { databaseKey, records };
  }

  /** POST /api/setup/exchange — explicit cross-database data exchange. */
  async exchange(dto: ExchangeDto) {
    const mode = dto.mode ?? 'move';

    if (dto.moduleKey === 'all') {
      const rows = await this.registry.serviceInstall.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      let transferred = 0;
      for (const row of rows) {
        const fromDatabase: DatabaseKey =
          dto.direction === 'toMain' ? 'secondary' : 'main';
        transferred += await this.transferRecords(
          row.moduleKey,
          fromDatabase,
          this.data.otherDatabase(fromDatabase),
          mode,
        );
      }
      return { moduleKey: 'all', direction: dto.direction, mode, transferred };
    }

    await this.requireService(dto.moduleKey);
    const fromDatabase: DatabaseKey =
      dto.direction === 'toMain' ? 'secondary' : 'main';
    const transferred = await this.transferRecords(
      dto.moduleKey,
      fromDatabase,
      this.data.otherDatabase(fromDatabase),
      mode,
    );
    return {
      moduleKey: dto.moduleKey,
      direction: dto.direction,
      mode,
      transferred,
    };
  }
}
