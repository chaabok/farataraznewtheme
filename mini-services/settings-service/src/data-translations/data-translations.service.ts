import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  appBaseOnUpdate,
  SYSTEM_ACTOR,
} from "../../../_shared/app-base-entity";
import { SaveDataTranslationsDto } from "./data-translations.dto";

/**
 * DataTranslation service — Task 92 (تأیید مالک): انبار ترجمهٔ «دادهٔ» فرم‌های
 * سیستمی (مثل Party) روی بانک اصلی. قرارداد هم‌سان با DfbTranslation فرم‌ساز:
 *   · خواندن: GET ?entityType=&entityId= — همهٔ ردیف‌های ترجمهٔ یک رکورد
 *   · نوشتن: upsert روی unique چهارگانه (EntityType, EntityID, FieldKey, Locale)؛
 *     مقدار خالی = حذف ترجمه (fallback به fa — عین قرارداد DfbTranslationsBody)؛
 *     هر دو مسیر آنلاین (BFF/LLM) و آفلاین (ورود دستی) از همین سرویس می‌گذرند.
 * §16: ID دستی از IDGeneration ("DataTranslation")؛ Version با §2.5
 * auto-rowversion (PrismaService)؛ بلوک AppBaseEntity ۸فیلدی روی هر ردیف —
 * تا استقرار IAM = SYSTEM_ACTOR (دفتر مرکزی ID=1).
 */
@Injectable()
export class DataTranslationsService {
  private readonly logger = new Logger(DataTranslationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست ترجمه‌های یک رکورد — JSON-safe (BigInt → number/string) */
  async list(entityType: string, entityId: number) {
    const rows = await this.prisma.dataTranslation.findMany({
      where: { entityType, entityId: BigInt(entityId) },
      orderBy: [{ fieldKey: "asc" }, { locale: "asc" }],
    });
    return {
      items: rows.map((r) => ({
        id: r.id.toString(),
        entityType: r.entityType,
        entityId: Number(r.entityId),
        fieldKey: r.fieldKey,
        locale: r.locale,
        value: r.value,
      })),
    };
  }

  /**
   * Task 99 (بازخورد مالک) — خواندن «دسته‌ای» برای لیست‌ها/دراپ‌داون‌ها:
   * چند رکورد از یک entityType (و فیلتر اختیاری fieldKeys — مثلاً فقط
   * name,lastName برای ستون نامِ فهرست) در یک درخواست، تا سطرهای لیست هم
   * با تعویض زبان نرم‌افزار به همان زبان نمایش داده شوند.
   */
  async listMany(entityType: string, entityIds: number[], fieldKeys: string[]) {
    if (entityIds.length === 0) return { items: [] };
    const rows = await this.prisma.dataTranslation.findMany({
      where: {
        entityType,
        entityId: { in: entityIds.map((id) => BigInt(id)) },
        ...(fieldKeys.length > 0 ? { fieldKey: { in: fieldKeys } } : {}),
      },
      orderBy: [{ entityId: "asc" }, { fieldKey: "asc" }, { locale: "asc" }],
    });
    return {
      items: rows.map((r) => ({
        id: r.id.toString(),
        entityType: r.entityType,
        entityId: Number(r.entityId),
        fieldKey: r.fieldKey,
        locale: r.locale,
        value: r.value,
      })),
    };
  }

  /**
   * ذخیرهٔ دسته‌ای ترجمه‌های یک رکورد (upsert؛ value خالی/حذف‌شده = پاک‌کردن ردیف).
   * تعداد ردیف‌های ساخته‌شده/به‌روزشده/حذف‌شده برمی‌گردد.
   */
  async save(dto: SaveDataTranslationsDto) {
    const entityId = BigInt(dto.entityId);
    let created = 0;
    let updated = 0;
    let deleted = 0;
    /* IDهای ردیف‌های جدید یک‌جا از شمارندهٔ مرکزی گرفته می‌شود (§16) —
       generateNextIdBlock «شناسهٔ آغازین» برمی‌گرداند (startId..startId+n-1) */
    const fresh = dto.items.filter((it) => (it.value ?? "").trim() !== "");
    let startId = 0;
    if (fresh.length > 0) {
      startId = await this.idGen.generateNextIdBlock("DataTranslation", fresh.length);
    }

    for (let i = 0; i < dto.items.length; i++) {
      const it = dto.items[i];
      const value = (it.value ?? "").trim();
      if (value === "") {
        /* deleteMany فیلتر معمولی می‌گیرد (نه کلید یکتای مرکب) */
        const res = await this.prisma.dataTranslation.deleteMany({
          where: {
            entityType: dto.entityType,
            entityId,
            fieldKey: it.fieldKey,
            locale: it.locale,
          },
        });
        deleted += res.count;
        continue;
      }
      const existing = await this.prisma.dataTranslation.findUnique({
        where: {
          entityType_entityId_fieldKey_locale: {
            entityType: dto.entityType,
            entityId,
            fieldKey: it.fieldKey,
            locale: it.locale,
          },
        },
      });
      if (existing) {
        await this.prisma.dataTranslation.update({
          where: { id: existing.id },
          data: { value, ...appBaseOnUpdate(SYSTEM_ACTOR) },
        });
        updated += 1;
      } else {
        await this.prisma.dataTranslation.create({
          data: {
            id: BigInt(startId + created),
            entityType: dto.entityType,
            entityId,
            fieldKey: it.fieldKey,
            locale: it.locale,
            value,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
        created += 1;
      }
    }

    this.logger.log(
      `data-translations save ${dto.entityType}#${dto.entityId}: +${created} ~${updated} -${deleted}`,
    );
    return { ok: true, created, updated, deleted };
  }
}
