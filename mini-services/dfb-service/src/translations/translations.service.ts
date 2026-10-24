import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { appBaseOnCreate, appBaseOnUpdate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";
import {
  TRANSLATION_ENTITY_TYPES,
  TRANSLATION_LANGS,
  UpsertTranslationsDto,
} from "./translations.dto";

/**
 * DfbTranslation service (Task 68) — ترجمهٔ مرکزی ۱۱زبانهٔ فرمساز.
 *
 * هویت پایدار: (EntityType, EntityRef, FieldKey, Lang) — برای فیلدها EntityRef
 * همان FormRef است (نه ID ردیف فیلد) تا ترجمه‌ها در «ذخیرهٔ مجدد» فرم‌های کاربر
 * (که ID فیلدها را بازتولید می‌کند) زنده بمانند.
 *
 * آفلاین: کل نقشهٔ ترجمه (جدولی کوچک) یک‌جا خوانده می‌شود و در کش کلاینت
 * (localStorage) می‌نشیند؛ تغییر زبان = تعویض نقشه، بدون هیچ درخواست شبکه.
 */
@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** کل نقشهٔ ترجمه — جدول کوچک است (تعداد موجودیت × ۱۰ زبان) */
  async findAll() {
    const rows = await this.prisma.dfbTranslation.findMany({ orderBy: [{ entityType: "asc" }, { entityRef: "asc" }, { lang: "asc" }] });
    return {
      items: rows.map((r) => ({
        entityType: r.entityType,
        entityRef: Number(r.entityRef),
        fieldKey: r.fieldKey,
        lang: r.lang,
        value: r.value,
      })),
    };
  }

  /** upsert دسته‌ای؛ value خالی = حذف ردیف ترجمه */
  async upsert(dto: UpsertTranslationsDto) {
    const items = Array.isArray(dto?.items) ? dto.items : [];
    if (items.length === 0) throw new BadRequestException("هیچ ترجمه‌ای ارسال نشده است");
    if (items.length > 500) throw new BadRequestException("تعداد ترجمه‌ها بیش از حد مجاز است");

    /* existence check — once per distinct (entityType, entityRef), تا ترجمهٔ یتیم از UI ممکن نشود */
    const seenRefs = new Set<string>();
    for (const it of items) {
      const entityType = String(it?.entityType ?? "");
      const entityRef = Number(it?.entityRef);
      const refKey = `${entityType}:${entityRef}`;
      if (seenRefs.has(refKey)) continue;
      seenRefs.add(refKey);
      if (
        !(TRANSLATION_ENTITY_TYPES as readonly string[]).includes(entityType) ||
        !Number.isInteger(entityRef) ||
        entityRef <= 0
      ) {
        throw new BadRequestException(`موجودیت نامعتبر: ${refKey}`);
      }
      await this.assertEntityExists(entityType, entityRef);
    }

    let saved = 0;
    let deleted = 0;
    for (const it of items) {
      const entityType = String(it?.entityType ?? "");
      const lang = String(it?.lang ?? "");
      const fieldKey = String(it?.fieldKey ?? "").trim();
      const value = String(it?.value ?? "").trim();
      const entityRef = Number(it?.entityRef);

      if (!(TRANSLATION_ENTITY_TYPES as readonly string[]).includes(entityType)) {
        throw new BadRequestException(`نوع موجودیت نامعتبر: ${entityType || "خالی"}`);
      }
      if (!(TRANSLATION_LANGS as readonly string[]).includes(lang)) {
        throw new BadRequestException(`زبان نامعتبر: ${lang || "خالی"} (fa زبان پایه است و ترجمه نمی‌پذیرد)`);
      }
      if (!Number.isInteger(entityRef) || entityRef <= 0) {
        throw new BadRequestException("شناسهٔ موجودیت نامعتبر است");
      }
      if (!fieldKey || fieldKey.length > FIELD_KEY_MAX) {
        throw new BadRequestException("کلید فیلد نامعتبر است");
      }
      if (value.length > VALUE_MAX) {
        throw new BadRequestException("متن ترجمه بیش از حد بلند است");
      }

      const where = {
        entityType_entityRef_fieldKey_lang: {
          entityType,
          entityRef: BigInt(entityRef),
          fieldKey,
          lang,
        },
      };

      if (!value) {
        const res = await this.prisma.dfbTranslation.deleteMany({ where });
        deleted += res.count;
        continue;
      }

      const existing = await this.prisma.dfbTranslation.findUnique({ where });
      if (existing) {
        if (existing.value === value) continue; // no-op
        await this.prisma.dfbTranslation.update({
          where,
          data: { value, ...appBaseOnUpdate(SYSTEM_ACTOR) },
        });
      } else {
        await this.prisma.dfbTranslation.create({
          data: {
            id: BigInt(await this.idGen.generateNextId("DfbTranslation")),
            entityType,
            entityRef: BigInt(entityRef),
            fieldKey,
            lang,
            value,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
      }
      saved++;
    }
    this.logger.log(`translations upsert saved=${saved} deleted=${deleted}`);
    return { ok: true, saved, deleted };
  }

  /** وجود رکورد مبدأ را صحت‌سنجی می‌کند (برای جلوگیری از ترجمهٔ یتیم از UI) */
  async assertEntityExists(entityType: string, entityRef: number): Promise<void> {
    if (entityType === "Menu") {
      const row = await this.prisma.dfbMenu.findUnique({ where: { id: BigInt(entityRef) } });
      if (!row) throw new NotFoundException("منوی مقصد یافت نشد");
      return;
    }
    if (entityType === "Form") {
      const row = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(entityRef) } });
      if (!row) throw new NotFoundException("فرم مقصد یافت نشد");
      return;
    }
    // Field — entityRef = FormRef؛ فرم باید وجود داشته باشد
    const row = await this.prisma.dfbForm.findUnique({ where: { id: BigInt(entityRef) } });
    if (!row) throw new NotFoundException("فرم مقصد یافت نشد");
  }
}
