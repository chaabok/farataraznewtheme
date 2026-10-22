import { Injectable, type OnModuleDestroy } from '@erp/shared';
import {
  PrismaClient as DataClient,
  type AppRecord,
} from '../generated/data-client';

/** Logical key of an installation target database. */
export type DatabaseKey = 'main' | 'secondary';

export const DATABASE_KEYS: DatabaseKey[] = ['main', 'secondary'];

/**
 * Opens the TWO installation target databases at runtime:
 *
 *   main      → selected services   (DATA_DATABASE_URL)
 *   secondary → unselected services (DATA_DATABASE_URL_SECONDARY)
 *
 * Both share the same Prisma schema (prisma/data.prisma), so one generated
 * client is instantiated twice with a different `datasourceUrl`. All
 * cross-database data exchange is implemented in the service layer through
 * these two clients — never through direct SQL links — which keeps the
 * architecture valid for two independent PostgreSQL instances later.
 */
@Injectable()
export class DataDatabasesService implements OnModuleDestroy {
  readonly main: DataClient;
  readonly secondary: DataClient;

  constructor() {
    const mainUrl =
      process.env.DATA_DATABASE_URL ?? 'file:/home/z/my-project/db/main.db';
    const secondaryUrl =
      process.env.DATA_DATABASE_URL_SECONDARY ??
      'file:/home/z/my-project/db/secondary.db';

    this.main = new DataClient({ datasourceUrl: mainUrl });
    this.secondary = new DataClient({ datasourceUrl: secondaryUrl });
  }

  forDatabase(key: DatabaseKey): DataClient {
    return key === 'main' ? this.main : this.secondary;
  }

  otherDatabase(key: DatabaseKey): DatabaseKey {
    return key === 'main' ? 'secondary' : 'main';
  }

  /** Database a service is installed in, based on its `selected` flag. */
  targetDatabase(selected: boolean): DatabaseKey {
    return selected ? 'main' : 'secondary';
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([
      this.main.$disconnect(),
      this.secondary.$disconnect(),
    ]);
  }
}

export type { AppRecord };
