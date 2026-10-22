/**
 * ERP module-services scaffolder.
 *
 * Generates one independent NestJS microservice per business module:
 *   mini-services/<dir>/
 *     ├── package.json / tsconfig.json / .env
 *     ├── prisma/schema.prisma          (own SQLite file, PostgreSQL-ready)
 *     ├── scripts/seed.ts
 *     └── src/{main,app.module}.ts + prisma/ + items/{controller,service,dto,module}
 *
 * Every service shares the hardened security kit from `@erp/shared`
 * (JWT guard + API-key guard + helmet + rate limiting + validation).
 *
 * Usage:  bun scripts/scaffold-module-services.ts
 * Idempotent: re-running overwrites generated files (never touches data).
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = '/home/z/my-project';
const DB_DIR = join(ROOT, 'db');
const JWT_SECRET =
  'f196c15264162aaff618c7253e4777977ae46f3742ae079021c650cf48dd518f';

type FieldKind =
  | 'text' // String
  | 'number' // Float
  | 'int' // Int
  | 'select'; // String with IsIn

interface FieldSpec {
  name: string;
  kind: FieldKind;
  required: boolean;
  options?: string[];
  unique?: boolean;
}

interface ServiceSpec {
  dir: string; // folder + service name
  port: number;
  dbName: string; // db/<dbName>.db
  apiKey: string;
  model: string; // Prisma model (PascalCase)
  delegate: string; // prisma.<delegate> (camelCase)
  orderBy: string;
  fields: FieldSpec[];
  seedRows: string; // TS object-literal array body
  statsBody: string; // function body (uses this.prisma.<delegate>)
}

const SERVICES: ServiceSpec[] = [
  {
    dir: 'settings-service',
    port: 3003,
    dbName: 'settings',
    apiKey: 'c12cadc831317225f416d4db1a475ab2337b00bc72560808',
    model: 'Setting',
    delegate: 'setting',
    orderBy: 'key',
    fields: [
      { name: 'key', kind: 'text', required: true, unique: true },
      { name: 'value', kind: 'text', required: true },
      { name: 'category', kind: 'text', required: false },
    ],
    seedRows: `[
  { key: 'companyName', value: 'شرکت بازرگانی نمونه', category: 'general' },
  { key: 'fiscalYear', value: '1405', category: 'general' },
  { key: 'currency', value: 'تومان', category: 'financial' },
  { key: 'taxRate', value: '9', category: 'financial' },
]`,
    statsBody: `    const [count, rows] = await Promise.all([
      this.prisma.setting.count(),
      this.prisma.setting.findMany({ select: { category: true }, distinct: ['category'] }),
    ]);
    return { count, categories: rows.length };`,
  },
  {
    dir: 'accounting-service',
    port: 3004,
    dbName: 'accounting',
    apiKey: 'f22c6faaa7e1e3906933c403a6ee67d384e6b1df1a81abb6',
    model: 'JournalEntry',
    delegate: 'journalEntry',
    orderBy: 'createdAt',
    fields: [
      { name: 'title', kind: 'text', required: true },
      { name: 'description', kind: 'text', required: false },
      { name: 'debit', kind: 'number', required: false },
      { name: 'credit', kind: 'number', required: false },
    ],
    seedRows: `[
  { title: 'خرید تجهیزات دفتر', description: 'سیستم و لوازم اداری', debit: 120000000, credit: 0 },
  { title: 'درآمد خدمات ماهانه', description: 'فاکتور خدمات مهر ۱۴۰۵', debit: 0, credit: 85000000 },
  { title: 'حقوق کارمندان', description: 'حقوق مهر ۱۴۰۵', debit: 320000000, credit: 0 },
]`,
    statsBody: `    const agg = await this.prisma.journalEntry.aggregate({
      _count: true,
      _sum: { debit: true, credit: true },
    });
    const totalDebit = agg._sum.debit ?? 0;
    const totalCredit = agg._sum.credit ?? 0;
    return {
      count: agg._count,
      totalDebit,
      totalCredit,
      balance: Number((totalDebit - totalCredit).toFixed(2)),
    };`,
  },
  {
    dir: 'payment-service',
    port: 3005,
    dbName: 'payments',
    apiKey: '639050cb0c19c5b4ed6b7bb54bd56084fa1f4bdf2433fe5f',
    model: 'PaymentRecord',
    delegate: 'paymentRecord',
    orderBy: 'createdAt',
    fields: [
      {
        name: 'kind',
        kind: 'select',
        required: true,
        options: ['receipt', 'payment'],
      },
      { name: 'party', kind: 'text', required: true },
      { name: 'amount', kind: 'number', required: true },
      { name: 'description', kind: 'text', required: false },
    ],
    seedRows: `[
  { kind: 'receipt', party: 'شرکت آریا', amount: 45000000, description: 'پرداخت فاکتور ۱۰۲' },
  { kind: 'receipt', party: 'فروشگاه مهر', amount: 27500000, description: 'پیش‌پرداخت پروژه' },
  { kind: 'payment', party: 'تامین‌کننده سپهر', amount: 18000000, description: 'تسویه خرید کالا' },
  { kind: 'payment', party: 'اجاره ساختمان', amount: 9500000, description: 'اجاره مهر ۱۴۰۵' },
]`,
    statsBody: `    const rows = await this.prisma.paymentRecord.findMany({ select: { kind: true, amount: true } });
    const receipts = rows.filter((r) => r.kind === 'receipt').reduce((sum, r) => sum + r.amount, 0);
    const payments = rows.filter((r) => r.kind === 'payment').reduce((sum, r) => sum + r.amount, 0);
    return {
      count: rows.length,
      totalReceipts: Number(receipts.toFixed(2)),
      totalPayments: Number(payments.toFixed(2)),
      net: Number((receipts - payments).toFixed(2)),
    };`,
  },
  {
    dir: 'inventory-service',
    port: 3006,
    dbName: 'inventory',
    apiKey: 'fad4f5294f512216868ed61a0247068c6fa434dde334a3d1',
    model: 'StockItem',
    delegate: 'stockItem',
    orderBy: 'name',
    fields: [
      { name: 'name', kind: 'text', required: true },
      { name: 'sku', kind: 'text', required: true, unique: true },
      { name: 'unit', kind: 'text', required: false },
      { name: 'quantity', kind: 'int', required: false },
      { name: 'minQuantity', kind: 'int', required: false },
    ],
    seedRows: `[
  { name: 'کاغذ A4', sku: 'ST-1001', unit: 'بسته', quantity: 240, minQuantity: 50 },
  { name: 'کارت‌ریج پرینتر', sku: 'ST-1002', unit: 'عدد', quantity: 8, minQuantity: 10 },
  { name: 'کابل شبکه Cat6', sku: 'ST-1003', unit: 'متر', quantity: 500, minQuantity: 100 },
  { name: 'هارد اکسترنال', sku: 'ST-1004', unit: 'عدد', quantity: 3, minQuantity: 5 },
]`,
    statsBody: `    const rows = await this.prisma.stockItem.findMany({ select: { quantity: true, minQuantity: true } });
    const totalQuantity = rows.reduce((sum, r) => sum + r.quantity, 0);
    const lowStock = rows.filter((r) => r.quantity <= r.minQuantity).length;
    return { count: rows.length, totalQuantity, lowStock };`,
  },
  {
    dir: 'sales-service',
    port: 3007,
    dbName: 'sales',
    apiKey: 'dfdb94a4a2b4c5bb0af8081d1eb303c0667ab32fc5faed56',
    model: 'SaleInvoice',
    delegate: 'saleInvoice',
    orderBy: 'createdAt',
    fields: [
      { name: 'customer', kind: 'text', required: true },
      { name: 'amount', kind: 'number', required: true },
      {
        name: 'status',
        kind: 'select',
        required: false,
        options: ['draft', 'sent', 'paid'],
      },
    ],
    seedRows: `[
  { customer: 'شرکت آریا', amount: 68000000, status: 'paid' },
  { customer: 'فروشگاه مهر', amount: 24000000, status: 'sent' },
  { customer: 'هلدینگ پارس', amount: 132000000, status: 'paid' },
  { customer: 'تعاونی نور', amount: 9800000, status: 'draft' },
]`,
    statsBody: `    const [all, paid] = await Promise.all([
      this.prisma.saleInvoice.aggregate({ _count: true, _sum: { amount: true } }),
      this.prisma.saleInvoice.aggregate({ _sum: { amount: true }, where: { status: 'paid' } }),
    ]);
    return { count: all._count, totalAmount: all._sum.amount ?? 0, paidAmount: paid._sum.amount ?? 0 };`,
  },
  {
    dir: 'fixed-asset-service',
    port: 3008,
    dbName: 'fixed_assets',
    apiKey: '2ec82fb2a4af0679ad9f85f042ea94cf7cb683ef08a60fa1',
    model: 'Asset',
    delegate: 'asset',
    orderBy: 'createdAt',
    fields: [
      { name: 'name', kind: 'text', required: true },
      { name: 'category', kind: 'text', required: false },
      { name: 'initialValue', kind: 'number', required: true },
      { name: 'depreciationRate', kind: 'number', required: false },
    ],
    seedRows: `[
  { name: 'ساختمان دفتر مرکزی', category: 'املاک', initialValue: 8500000000, depreciationRate: 2 },
  { name: 'خودرو وانت', category: 'نقلیه', initialValue: 950000000, depreciationRate: 15 },
  { name: 'سرور و تجهیزات شبکه', category: 'رایانه‌ای', initialValue: 420000000, depreciationRate: 25 },
]`,
    statsBody: `    const agg = await this.prisma.asset.aggregate({
      _count: true,
      _sum: { initialValue: true },
      _avg: { depreciationRate: true },
    });
    return {
      count: agg._count,
      totalValue: agg._sum.initialValue ?? 0,
      avgDepreciationRate: Number((agg._avg.depreciationRate ?? 0).toFixed(2)),
    };`,
  },
  {
    dir: 'procurement-service',
    port: 3009,
    dbName: 'procurement',
    apiKey: 'da7d480cd7a8e61a67316e9522fdc383813cca47419089b4',
    model: 'PurchaseOrder',
    delegate: 'purchaseOrder',
    orderBy: 'createdAt',
    fields: [
      { name: 'supplier', kind: 'text', required: true },
      { name: 'itemName', kind: 'text', required: true },
      { name: 'total', kind: 'number', required: true },
      {
        name: 'status',
        kind: 'select',
        required: false,
        options: ['pending', 'approved', 'received'],
      },
    ],
    seedRows: `[
  { supplier: 'پخش سراسری کالا', itemName: 'کارت‌ریج پرینتر', total: 36000000, status: 'received' },
  { supplier: 'ابزار صنعتی نور', itemName: 'ست ابزار تعمیرات', total: 18500000, status: 'approved' },
  { supplier: 'رایانه پخش', itemName: 'گوشی سازمانی', total: 72000000, status: 'pending' },
]`,
    statsBody: `    const [all, pending] = await Promise.all([
      this.prisma.purchaseOrder.aggregate({ _count: true, _sum: { total: true } }),
      this.prisma.purchaseOrder.count({ where: { status: 'pending' } }),
    ]);
    return { count: all._count, totalValue: all._sum.total ?? 0, pendingCount: pending };`,
  },
  {
    dir: 'order-service',
    port: 3010,
    dbName: 'orders',
    apiKey: '180c420e99551f9cea61b3b11f8feedbc833feb4819b03d2',
    model: 'CustomerOrder',
    delegate: 'customerOrder',
    orderBy: 'createdAt',
    fields: [
      { name: 'customer', kind: 'text', required: true },
      { name: 'total', kind: 'number', required: true },
      {
        name: 'status',
        kind: 'select',
        required: false,
        options: ['new', 'processing', 'completed', 'cancelled'],
      },
    ],
    seedRows: `[
  { customer: 'شرکت آریا', total: 68000000, status: 'completed' },
  { customer: 'فروشگاه مهر', total: 24000000, status: 'processing' },
  { customer: 'بازرگانی سپهر', total: 41500000, status: 'new' },
  { customer: 'تعاونی نور', total: 9800000, status: 'cancelled' },
]`,
    statsBody: `    const [all, open] = await Promise.all([
      this.prisma.customerOrder.aggregate({ _count: true, _sum: { total: true } }),
      this.prisma.customerOrder.count({ where: { status: { in: ['new', 'processing'] } } }),
    ]);
    return { count: all._count, totalValue: all._sum.total ?? 0, openCount: open };`,
  },
  {
    dir: 'costing-service',
    port: 3011,
    dbName: 'costing',
    apiKey: 'daa2cfe3333e325bb508cd9cd7aec42a44b18b267975403b',
    model: 'CostItem',
    delegate: 'costItem',
    orderBy: 'product',
    fields: [
      { name: 'product', kind: 'text', required: true },
      { name: 'materialCost', kind: 'number', required: false },
      { name: 'laborCost', kind: 'number', required: false },
      { name: 'overhead', kind: 'number', required: false },
    ],
    seedRows: `[
  { product: 'دفتر ۱۰۰ برگ', materialCost: 18500, laborCost: 9200, overhead: 4300 },
  { product: 'پوشه رنگی', materialCost: 12000, laborCost: 6400, overhead: 3100 },
  { product: 'ست اداری', materialCost: 46000, laborCost: 21500, overhead: 9800 },
]`,
    statsBody: `    const agg = await this.prisma.costItem.aggregate({
      _count: true,
      _sum: { materialCost: true, laborCost: true, overhead: true },
    });
    return {
      count: agg._count,
      totalMaterial: agg._sum.materialCost ?? 0,
      totalLabor: agg._sum.laborCost ?? 0,
      totalOverhead: agg._sum.overhead ?? 0,
    };`,
  },
  {
    dir: 'financial-statement-service',
    port: 3012,
    dbName: 'financial_statements',
    apiKey: '1930cf8af09ebb75717a85715106fb3ce85929564f77fb6f',
    model: 'Statement',
    delegate: 'statement',
    orderBy: 'period',
    fields: [
      { name: 'title', kind: 'text', required: true },
      {
        name: 'kind',
        kind: 'select',
        required: true,
        options: ['balance_sheet', 'income_statement', 'cash_flow'],
      },
      { name: 'period', kind: 'text', required: true },
      { name: 'netValue', kind: 'number', required: true },
    ],
    seedRows: `[
  { title: 'ترازنامه پایان مهر ۱۴۰۵', kind: 'balance_sheet', period: '1405-07', netValue: 12400000000 },
  { title: 'صورت سود و زیان مهر ۱۴۰۵', kind: 'income_statement', period: '1405-07', netValue: 1850000000 },
  { title: 'صورت جریان نقدی مهر ۱۴۰۵', kind: 'cash_flow', period: '1405-07', netValue: 940000000 },
]`,
    statsBody: `    const [all, byKind] = await Promise.all([
      this.prisma.statement.aggregate({ _count: true, _sum: { netValue: true } }),
      this.prisma.statement.groupBy({ by: ['kind'], _count: true }),
    ]);
    const kinds: Record<string, number> = {};
    for (const row of byKind) {
      kinds[row.kind] = row._count;
    }
    return { count: all._count, totalNetValue: all._sum.netValue ?? 0, byKind: kinds };`,
  },
];

// ---------------------------------------------------------------- templates

function schemaFields(spec: ServiceSpec): string {
  const lines: string[] = [];
  for (const field of spec.fields) {
    let line = '  ' + field.name + ' ';
    if (field.kind === 'text') {
      line += 'String';
      if (!field.required) line += '?';
      if (field.unique) line += ' @unique';
    } else if (field.kind === 'number') {
      line += 'Float';
      if (!field.required) line += ' @default(0)';
    } else if (field.kind === 'int') {
      line += 'Int';
      if (!field.required) line += ' @default(0)';
    } else if (field.kind === 'select') {
      line += 'String';
      if (!field.required) {
        line += ' @default("' + field.options![0] + '")';
      }
    }
    lines.push(line);
  }
  return lines.join('\n');
}

function dtoBody(spec: ServiceSpec): string {
  const blocks: string[] = [];
  for (const field of spec.fields) {
    let decorators: string;
    let prop: string;
    if (field.kind === 'text') {
      prop = field.required
        ? field.name + '!: string;'
        : field.name + '?: string;';
      decorators = field.required
        ? '@IsString()\n  @IsNotEmpty()'
        : '@IsOptional()\n  @IsString()';
    } else if (field.kind === 'number') {
      prop = field.required
        ? field.name + '!: number;'
        : field.name + '?: number;';
      decorators = field.required
        ? '@IsNumber()'
        : '@IsOptional()\n  @IsNumber()';
    } else if (field.kind === 'int') {
      prop = field.required
        ? field.name + '!: number;'
        : field.name + '?: number;';
      decorators = field.required
        ? '@IsInt()\n  @Min(0)'
        : '@IsOptional()\n  @IsInt()\n  @Min(0)';
    } else {
      const opts = field.options!.map((o) => "'" + o + "'").join(', ');
      prop = field.required
        ? field.name + '!: string;'
        : field.name + '?: string;';
      decorators = field.required
        ? '@IsIn([' + opts + '])'
        : '@IsOptional()\n  @IsIn([' + opts + '])';
    }
    blocks.push('  ' + decorators + '\n  ' + prop);
  }
  return blocks.join('\n\n');
}

const validatorImportsFor = (spec: ServiceSpec): string => {
  const used = new Set<string>(['IsString', 'IsNotEmpty', 'IsOptional']);
  for (const field of spec.fields) {
    if (field.kind === 'number') used.add('IsNumber');
    if (field.kind === 'int') {
      used.add('IsInt');
      used.add('Min');
    }
    if (field.kind === 'select') used.add('IsIn');
  }
  return Array.from(used).join(', ');
};

function servicePackageJson(spec: ServiceSpec): string {
  return (
    JSON.stringify(
      {
        name: spec.dir,
        version: '1.0.0',
        private: true,
        description: 'ERP ' + spec.dir + ' microservice (port ' + spec.port + ')',
        scripts: {
          dev: 'bun --hot src/main.ts',
          start: 'bun src/main.ts',
          'db:push': 'prisma db push --schema prisma/schema.prisma',
          'db:generate': 'prisma generate --schema prisma/schema.prisma',
          'db:seed': 'bun scripts/seed.ts',
        },
        dependencies: {
          '@erp/shared': 'file:../shared',
          '@prisma/client': '^6.11.1',
          'reflect-metadata': '^0.2.2',
        },
        devDependencies: {
          'bun-types': '^1.3.4',
          prisma: '^6.11.1',
        },
      },
      null,
      2,
    ) + '\n'
  );
}

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*", "scripts/**/*"],
  "exclude": ["node_modules"]
}
`;

function serviceEnv(spec: ServiceSpec): string {
  return (
    '# ' +
    spec.dir +
    ' configuration\nPORT=' +
    spec.port +
    '\n\n# Security secrets\nSERVICE_API_KEY="' +
    spec.apiKey +
    '"\nJWT_SECRET="' +
    JWT_SECRET +
    '"\nCORS_ORIGIN="http://localhost:3000"\n\n# Database: hardcoded in prisma/schema.prisma (db/' +
    spec.dbName +
    '.db). See schema comments for PostgreSQL migration.\n'
  );
}

function serviceSchema(spec: ServiceSpec): string {
  return `// ${spec.dir} - Prisma schema (PostgreSQL-ready)
//
// MIGRATION TO POSTGRESQL:
//   1. provider = "postgresql"
//   2. url      = env("DATABASE_URL")

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:${join(DB_DIR, spec.dbName + '.db')}"
}

model ${spec.model} {
  id        String   @id @default(uuid())
${schemaFields(spec)}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

function serviceMain(spec: ServiceSpec): string {
  return `import 'reflect-metadata';
import { bootstrapSecureService } from '@erp/shared';
import { AppModule } from './app.module';

const PORT = Number(process.env.PORT ?? ${spec.port});

void bootstrapSecureService({
  module: AppModule,
  appName: '${spec.dir}',
  port: PORT,
});
`;
}

function serviceAppModule(spec: ServiceSpec): string {
  return `import { APP_GUARD, ApiKeyGuard, JwtAuthGuard, Module } from '@erp/shared';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [PrismaModule, ItemsModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class AppModule {}
`;
}

const PRISMA_MODULE = `import { Global, Module } from '@erp/shared';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
`;

const PRISMA_SERVICE = `import { Injectable, OnModuleDestroy, OnModuleInit } from '@erp/shared';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
`;

function serviceItemsModule(spec: ServiceSpec): string {
  return `import { Module } from '@erp/shared';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
`;
}

function serviceController(spec: ServiceSpec): string {
  return `import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@erp/shared';
import { ItemsService } from './items.service';
import { CreateItemDto } from './create-item.dto';

/**
 * All routes require a valid user JWT **and** the internal API key
 * (injected server-side by the BFF gateway). See app.module guards.
 */
@Controller('items')
export class ItemsController {
  constructor(
    @Inject(ItemsService) private readonly itemsService: ItemsService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.itemsService.findAll();
    return { data };
  }

  @Get('stats')
  async stats() {
    const data = await this.itemsService.stats();
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateItemDto) {
    const data = await this.itemsService.create(dto);
    return { data };
  }
}
`;
}

function serviceService(spec: ServiceSpec): string {
  return `import { ConflictException, Inject, Injectable } from '@erp/shared';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  findAll() {
    return this.prisma.${spec.delegate}.findMany({
      orderBy: { ${spec.orderBy}: 'desc' },
    });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.${spec.delegate}.create({
        data: dto as Prisma.${spec.model}UncheckedCreateInput,
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
${spec.statsBody}
  }
}
`;
}

function serviceDto(spec: ServiceSpec): string {
  return `import { ${validatorImportsFor(spec)} } from '@erp/shared';

export class CreateItemDto {
${dtoBody(spec)}
}
`;
}

function serviceSeed(spec: ServiceSpec): string {
  return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ITEMS = ${spec.seedRows};

async function main(): Promise<void> {
  const count = await prisma.${spec.delegate}.count();
  if (count > 0) {
    console.log('Seed skipped: data already exists.');
    return;
  }
  await prisma.${spec.delegate}.createMany({ data: ITEMS });
  console.log('Seeded ' + ITEMS.length + ' records.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
`;
}

// ------------------------------------------------------------------ writer

function writeService(spec: ServiceSpec): void {
  const base = join(ROOT, 'mini-services', spec.dir);
  mkdirSync(join(base, 'prisma'), { recursive: true });
  mkdirSync(join(base, 'scripts'), { recursive: true });
  mkdirSync(join(base, 'src', 'prisma'), { recursive: true });
  mkdirSync(join(base, 'src', 'items'), { recursive: true });

  writeFileSync(join(base, 'package.json'), servicePackageJson(spec));
  writeFileSync(join(base, 'tsconfig.json'), TSCONFIG);
  writeFileSync(join(base, '.env'), serviceEnv(spec));
  writeFileSync(join(base, 'prisma', 'schema.prisma'), serviceSchema(spec));
  writeFileSync(join(base, 'scripts', 'seed.ts'), serviceSeed(spec));
  writeFileSync(join(base, 'src', 'main.ts'), serviceMain(spec));
  writeFileSync(join(base, 'src', 'app.module.ts'), serviceAppModule(spec));
  writeFileSync(join(base, 'src', 'prisma', 'prisma.module.ts'), PRISMA_MODULE);
  writeFileSync(join(base, 'src', 'prisma', 'prisma.service.ts'), PRISMA_SERVICE);
  writeFileSync(join(base, 'src', 'items', 'items.module.ts'), serviceItemsModule(spec));
  writeFileSync(join(base, 'src', 'items', 'items.controller.ts'), serviceController(spec));
  writeFileSync(join(base, 'src', 'items', 'items.service.ts'), serviceService(spec));
  writeFileSync(join(base, 'src', 'items', 'create-item.dto.ts'), serviceDto(spec));

  console.log('✓ generated', spec.dir, 'on port', spec.port);
}

/** Maintain the root .env consumed by the Next.js BFF gateway. */
function upsertRootEnv(): void {
  const envPath = join(ROOT, '.env');
  const lines = new Map<string, string>();
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      // Drop stale managed service vars; they are regenerated below.
      if (match && !match[1].endsWith('_SERVICE_URL') && !match[1].endsWith('_SERVICE_API_KEY')) {
        lines.set(match[1], match[2]);
      }
    }
  }

  const varName = (dir: string): string =>
    dir
      .replace(/-service$/, '')
      .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      .toUpperCase();

  for (const spec of SERVICES) {
    const name = varName(spec.dir);
    lines.set(name + '_SERVICE_URL', 'http://127.0.0.1:' + spec.port);
    lines.set(name + '_SERVICE_API_KEY', spec.apiKey);
  }

  // Hand-written services
  lines.set('AUTH_SERVICE_URL', 'http://127.0.0.1:3002');
  lines.set('AUTH_SERVICE_API_KEY', '3058f57deed2ddebf64588f249e57d2e1726d6e09522979a');
  lines.set('DESKTOP_SERVICE_URL', 'http://127.0.0.1:3001');
  lines.set('DESKTOP_SERVICE_API_KEY', '7ef552b48fe7078d1a1b83cf913155af9b14d3cb34e4ebe3');

  const banner = '# --- ERP microservices (managed by scripts/scaffold-module-services.ts) ---';
  const body = Array.from(lines.entries())
    .map(([key, value]) => key + '=' + value)
    .join('\n');
  writeFileSync(envPath, banner + '\n' + body + '\n');
  console.log('✓ root .env updated with', SERVICES.length * 2 + 4, 'service vars');
}

for (const spec of SERVICES) {
  writeService(spec);
}
upsertRootEnv();
console.log('\nAll', SERVICES.length, 'module services scaffolded.');
