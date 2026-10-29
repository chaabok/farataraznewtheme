import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  appBaseOnUpdate,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
} from "../../../_shared/app-base-entity";
import {
  SOFTWARE_CONFIG_APP_KEYS,
  SOFTWARE_CONFIG_FIELDS,
  UpsertSoftwareConfigDto,
  type SoftwareConfigAppKey,
} from "./software-config.dto";

/**
 * SoftwareConfig — Task 72 (تأیید مالک): «پیکربندی نرم افزارها» با رعایت
 * کامل فیلدهای ارث‌بری AppBaseEntity (۸فیلدی — نسخهٔ Task 76: مهر زمانی را
 * CreatedAt/UpdatedAt پرایسما دارد): ID دستی از IDGeneration (§16)،
 * Version با §2.5 auto-rowversion، و مهر Creator/LastModifier +
 * زنجیرهٔ ساختار سازمانی روی هر ردیف (تا استقرار IAM = SYSTEM_ACTOR / دفتر
 * مرکزی ID=1). خواندن فعلاً سراسری است؛ وقتی IAM وصل شود همین مسیر با
 * baseDataScopeWhere دامنه‌گذاری می‌شود (قرارداد _shared/app-base-entity).
 */
@Injectable()
export class SoftwareConfigService {
  private readonly logger = new Logger(SoftwareConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست نرم‌افزارهای دارای تب پیکربندی + شمار فیلدهای اعلام‌شدهٔ هر کدام. */
  listApps() {
    return {
      items: SOFTWARE_CONFIG_APP_KEYS.map((appKey) => ({
        appKey,
        fieldCount: SOFTWARE_CONFIG_FIELDS[appKey].length,
      })),
    };
  }

  /** مقادیر ذخیره‌شدهٔ پیکربندی یک نرم‌افزار. */
  async list(appKey: string) {
    this.assertAppKey(appKey);
    const rows = await this.prisma.softwareConfig.findMany({
      where: { appKey },
      orderBy: { configKey: "asc" },
    });
    return { appKey, items: rows.map((r) => this.toDto(r)) };
  }

  /**
   * ذخیرهٔ دسته‌ای پیکربندی یک نرم‌افزار (فقط کلیدهای رجیستری؛ §2.3 مقدار
   * رشته‌ای ≤۲۰۰۰ کاراکتر؛ مقدار خالی = حذف ردیف — الگوی ترجمهٔ Task 68).
   */
  async upsert(appKey: string, dto: UpsertSoftwareConfigDto) {
    this.assertAppKey(appKey);
    const registry = SOFTWARE_CONFIG_FIELDS[appKey as SoftwareConfigAppKey] ?? {};
    let saved = 0;
    let deleted = 0;

    /* Task 137 — نقشهٔ payload برای قانون فیلدهای مشتق‌شده (خط دوم دفاعی):
       اگر from و همهٔ کلیدهای minus در همین payload حاضر باشند، مقدار فیلد
       مشتق‌شده باید برابر from − Σ(minus) باشد؛ وگرنه فقط بازهٔ min/max
       اعمال می‌شود. */
    const incoming = new Map<string, string>();
    for (const it of dto.items) {
      incoming.set(String(it.configKey ?? "").trim(), String(it.configValue ?? "").trim());
    }

    for (const it of dto.items) {
      const key = String(it.configKey ?? "").trim();
      const spec = registry[key];
      if (!spec) {
        throw new BadRequestException({
          statusCode: 422,
          message: `کلید پیکربندی «${key}» برای «${appKey}» هنوز در رجیستری فیلدها تعریف نشده است`,
          messageKey: "common.error",
        });
      }

      const raw = String(it.configValue ?? "");
      const value = raw.trim() === "" ? "" : raw.trim().slice(0, 2000);

      /* Task 73 — قانون بازهٔ فیلدهای عددی (مثل «تعداد ماه‌های مالی»:
         عدد صحیح ۱..۱۶) — خط دوم دفاعی؛ فرانت هم پیش از PUT اعتبارسنجی می‌کند. */
      if (value !== "" && spec.type === "number") {
        const num = Number(value);
        if (!Number.isFinite(num)) {
          throw new BadRequestException({
            statusCode: 422,
            message: `مقدار فیلد «${key}» باید عدد باشد`,
            messageKey: "common.error",
          });
        }
        if (spec.integer && !Number.isInteger(num)) {
          throw new BadRequestException({
            statusCode: 422,
            message: `مقدار فیلد «${key}» باید عدد صحیح باشد`,
            messageKey: "common.error",
          });
        }
        if (spec.min !== undefined && num < spec.min) {
          throw new BadRequestException({
            statusCode: 422,
            message: `مقدار فیلد «${key}» نمی‌تواند کمتر از ${spec.min} باشد`,
            messageKey: "common.error",
          });
        }
        if (spec.max !== undefined && num > spec.max) {
          throw new BadRequestException({
            statusCode: 422,
            message: `مقدار فیلد «${key}» نمی‌تواند بیشتر از ${spec.max} باشد`,
            messageKey: "common.error",
          });
        }
        /* Task 137 — قانون مشتق‌شده: معین = طول کد حسابها − طول گروه حساب −
           طول حساب کل (فقط وقتی همهٔ مراجع در همین payload حاضرند؛ مقادیر
           خالی = حذف ردیف و مشمول این قانون نیستند). */
        if (spec.derived) {
          const fromRaw = incoming.get(spec.derived.from) ?? "";
          const minusRaws = spec.derived.minus.map((k) => incoming.get(k) ?? "");
          if (fromRaw !== "" && minusRaws.every((v) => v !== "")) {
            const fromN = Number(fromRaw);
            const minusSum = minusRaws.reduce((s, v) => s + Number(v), 0);
            if (
              !Number.isFinite(fromN) ||
              minusRaws.some((v) => !Number.isFinite(Number(v))) ||
              num !== fromN - minusSum
            ) {
              throw new BadRequestException({
                statusCode: 422,
                message: `مقدار فیلد «${key}» باید برابر مقدار «${spec.derived.from}» منهای جمع «${spec.derived.minus.join("» و «")}» باشد`,
                messageKey: "common.error",
              });
            }
          }
        }
      }

      /* Task 157 — خط دوم دفاعی «کامپوننت لیست»: مقدار فیلد list (فعلاً
         «ارز پایه») باید کد یکی از ارزهای ثبت‌شدهٔ فرم «نوع ارز»
         (CurrencyType) باشد؛ وگرنه رد می‌شود. */
      if (value !== "" && spec.type === "list" && spec.listSource === "currencyType") {
        const found = await this.prisma.currencyType.findFirst({
          where: { code: value },
          select: { id: true },
        });
        if (!found) {
          throw new BadRequestException({
            statusCode: 422,
            message: `ارز با کد «${value}» در فرم نوع ارز یافت نشد؛ ابتدا آن را در فرم نوع ارز ثبت کنید`,
            messageKey: "common.error",
          });
        }
      }

      if (value === "") {
        const res = await this.prisma.softwareConfig.deleteMany({
          where: { appKey, configKey: key },
        });
        deleted += res.count;
        continue;
      }

      /* §16 — find-then-create تا در ذخیرهٔ مجدد ID نسوزد؛ شکاف فقط در
         مسیرهای رقابتی می‌سوزد که در این سرویس تک‌کاربره بی‌اثر است. */
      const existing = await this.prisma.softwareConfig.findUnique({
        where: {
          appKey_configKey_businessStructureRef: {
            appKey,
            configKey: key,
            businessStructureRef: HEAD_OFFICE_NODE_ID,
          },
        },
      });

      if (existing) {
        await this.prisma.softwareConfig.update({
          where: { id: existing.id },
          data: { configValue: value, ...appBaseOnUpdate(SYSTEM_ACTOR) },
        });
      } else {
        const newId = await this.idGen.generateNextId("SoftwareConfig");
        await this.prisma.softwareConfig.create({
          data: {
            id: BigInt(newId),
            appKey,
            configKey: key,
            configValue: value,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
      }
      saved += 1;
    }

    return { appKey, saved, deleted };
  }

  private assertAppKey(appKey: string) {
    if (!(SOFTWARE_CONFIG_APP_KEYS as readonly string[]).includes(appKey)) {
      throw new NotFoundException({
        statusCode: 404,
        message: `software config "${appKey}" not found`,
        messageKey: "common.error",
      });
    }
  }

  private toDto(r: {
    id: bigint;
    appKey: string;
    configKey: string;
    configValue: string | null;
    version: number;
    creator: string;
    lastModifier: string | null;
    businessStructureRef: bigint;
    companyRef: bigint | null;
    branchRef: bigint | null;
    agencyRef: bigint | null;
    shopRef: bigint | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      appKey: r.appKey,
      configKey: r.configKey,
      configValue: r.configValue ?? "",
      version: r.version,
      creator: r.creator,
      lastModifier: r.lastModifier,
      businessStructureRef: Number(r.businessStructureRef),
      companyRef: r.companyRef == null ? null : Number(r.companyRef),
      branchRef: r.branchRef == null ? null : Number(r.branchRef),
      agencyRef: r.agencyRef == null ? null : Number(r.agencyRef),
      shopRef: r.shopRef == null ? null : Number(r.shopRef),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
