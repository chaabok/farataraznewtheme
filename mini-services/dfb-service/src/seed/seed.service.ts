import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { APP_CATALOG } from "../../../_shared/app-catalog";
import { appBaseOnCreate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";

/**
 * SYSTEM_FORMS — registry of the ERP's built-in forms (in the owner's words:
 * «تمام فرم‌هایی که بصورت سیستمی ایجاد می‌شوند به تفکیک هر آیکون و منو باید در
 * درختواره فرم‌ساز نمایش داده شوند»). Each entry anchors a DfbForm row
 * (IsSystem=true) under the DfbMenu icon node of its hosting app; users can
 * add custom fields (IsCustom=true) to them from the builder.
 * New system forms register HERE as their analysis documents arrive (§4.6).
 */
interface SystemFormSeed {
  systemKey: string;
  anchorAppKey: string; // catalog appKey of the icon node it lives under
  code: string;
  titleFa: string;
  titleEn: string;
  componentKey: string; // "simpleTwoRowTabbed" | "treeForm" | "dfb-builder" (launcher)
}

const SYSTEM_FORMS: SystemFormSeed[] = [
  {
    systemKey: "gnr.businessStructure",
    anchorAppKey: "general", // عمومی — سرویس عمومی (Gnr) میزبان ساختار کسب‌وکار است
    code: "BS",
    titleFa: "ساختار کسب و کار",
    titleEn: "Business Structure",
    componentKey: "treeForm",
  },
  {
    /* Task 46 — the «فرمساز» launcher form of «ابزارهای پیشرفته»: the icon
       opens the app's forms menu (DfbMenuWindow) and this entry opens the
       form builder + tree (ComponentKey "dfb-builder" is mapped to the
       builder window by the menu window — never user-creatable, the forms
       DTO whitelist only accepts the two real templates). Future forms of
       this menu (system or user-made under this node) join it here. */
    systemKey: "dfb.formBuilder",
    anchorAppKey: "advancedTools",
    code: "FB",
    titleFa: "فرمساز",
    titleEn: "Form Builder",
    componentKey: "dfb-builder",
  },
];

/**
 * Boot seed (idempotent) — اسکیمای Dfb:
 *  1) pre-seed IDGeneration counter rows for every Dfb table,
 *  2) sync the 28 catalog apps as system icon nodes (DfbMenu, IsSystem=true,
 *     ParentRef=0, NodeType=1, AppKey=appKey) — catalog stays the single source
 *     of truth (§4.1); drift updates code-driven fields only on real change,
 *  3) register SYSTEM_FORMS as system forms under their anchor icon.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    /* 1) pre-seed counter rows (self-heal bootstrap) */
    for (const table of [
      "DfbMenu",
      "DfbForm",
      "DfbFormTab",
      "DfbFormField",
      "DfbQuery",
      "DfbQueryField",
      "DfbFormData",
      "DfbFormDataValue",
      "DfbTranslation", // Task 68
    ]) {
      const exists = await this.prisma.iDGeneration.findUnique({ where: { tableName: table } });
      if (!exists) {
        const rows: Array<{ m: bigint | null }> = await this.prisma.$queryRawUnsafe(
          `SELECT MAX("IDGenerationID") AS m FROM "IDGeneration"`,
        );
        const counterId = Number(rows[0]?.m ?? 0n) + 1;
        const maxRows: Array<{ m: bigint | null }> = await this.prisma.$queryRawUnsafe(
          `SELECT MAX("ID") AS m FROM "${table}"`,
        );
        const lastId = maxRows[0]?.m ?? 0n;
        await this.prisma.iDGeneration.create({
          data: { idGenerationId: BigInt(counterId), tableName: table, lastId },
        });
        this.logger.log(`seeded IDGeneration counter for ${table} (LastID=${lastId})`);
      }
    }

    /* 2) catalog apps → system icon nodes (§4.1 single source, idempotent sync) */
    let created = 0;
    let updated = 0;
    for (const app of APP_CATALOG) {
      const existing = await this.prisma.dfbMenu.findFirst({
        where: { parentRef: 0n, isSystem: true, appKey: app.appKey },
      });
      if (!existing) {
        const id = await this.idGen.generateNextId("DfbMenu");
        await this.prisma.dfbMenu.create({
          data: {
            id: BigInt(id),
            parentRef: 0n,
            nodeType: 1,
            code: app.appKey,
            title: app.titleFa,
            titleEn: null,
            iconKey: app.iconKey,
            appKey: app.appKey,
            sortOrder: app.order,
            isSystem: true,
            isActive: true,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
        created++;
      } else {
        const drift =
          existing.title !== app.titleFa ||
          existing.iconKey !== app.iconKey ||
          existing.sortOrder !== app.order;
        if (drift) {
          await this.prisma.dfbMenu.update({
            where: { id: existing.id },
            data: {
              title: app.titleFa,
              iconKey: app.iconKey,
              sortOrder: app.order,
            },
          });
          updated++;
        }
      }
    }
    if (created || updated) {
      this.logger.log(`DfbMenu sync: ${created} created, ${updated} updated (${APP_CATALOG.length} catalog apps)`);
    }

    /* 3) system forms under their anchor icon */
    for (const sf of SYSTEM_FORMS) {
      const anchor = await this.prisma.dfbMenu.findFirst({
        where: { parentRef: 0n, isSystem: true, appKey: sf.anchorAppKey },
      });
      if (!anchor) continue;
      const existing = await this.prisma.dfbForm.findFirst({
        where: { systemKey: sf.systemKey },
      });
      if (!existing) {
        const id = await this.idGen.generateNextId("DfbForm");
        await this.prisma.dfbForm.create({
          data: {
            id: BigInt(id),
            menuRef: anchor.id,
            code: sf.code,
            title: sf.titleFa,
            titleEn: sf.titleEn,
            componentKey: sf.componentKey,
            status: 2,
            systemKey: sf.systemKey,
            isSystem: true,
            ...appBaseOnCreate(SYSTEM_ACTOR),
          },
        });
        this.logger.log(`seeded system form ${sf.systemKey} (ID=${id}) under "${sf.anchorAppKey}"`);
      } else if (
        existing.title !== sf.titleFa ||
        existing.componentKey !== sf.componentKey ||
        existing.menuRef !== anchor.id
      ) {
        await this.prisma.dfbForm.update({
          where: { id: existing.id },
          data: { title: sf.titleFa, componentKey: sf.componentKey, menuRef: anchor.id },
        });
      }
    }

    /* 4) Task 68 — ترجمه‌ها:
       ۴الف) مهاجرت میراث: هر *_En موجود (Menu/Form/Field) → ردیف ترجمهٔ en
       ۴ب) ترجمهٔ نمونهٔ مالک: عنوان‌های منو/فرم موجود به ۱۰ زبان غیر-fa
       هر دو idempotent هستند (فقط وقتی ردیفی وجود ندارد ساخته می‌شود). */
    const ensureTr = async (
      entityType: string,
      entityRef: bigint,
      fieldKey: string,
      lang: string,
      value: string,
    ): Promise<boolean> => {
      const where = {
        entityType_entityRef_fieldKey_lang: { entityType, entityRef, fieldKey, lang },
      };
      const exists = await this.prisma.dfbTranslation.findUnique({ where });
      if (exists) return false;
      await this.prisma.dfbTranslation.create({
        data: {
          id: BigInt(await this.idGen.generateNextId("DfbTranslation")),
          entityType,
          entityRef,
          fieldKey,
          lang,
          value,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      });
      return true;
    };

    /* ۴ب — ترجمهٔ نمونهٔ ۱۰زبانهٔ موجودیت‌های فعلی (مالک می‌تواند در استودیو ویرایش کند) */
    const TRANSLATION_SEED: Array<{
      entityType: "Menu" | "Form";
      matchTitle: string;
      values: Record<string, string>;
    }> = [
      {
        entityType: "Form",
        matchTitle: "انواع وسیله نقلیه",
        values: {
          en: "Vehicle Types", tr: "Araç Türleri", ar: "أنواع المركبات",
          hi: "वाहन प्रकार", ps: "د نقلیو وسایطو ډولونه", ckb: "جۆرەکانی ئۆتۆمبێل",
          pt: "Tipos de Veículos", ko: "차량 유형", fr: "Types de véhicules", zh: "车辆类型",
        },
      },
      {
        entityType: "Menu",
        matchTitle: "حمل و ترابری",
        values: {
          en: "Transportation", tr: "Ulaşım", ar: "النقل والمواصلات",
          hi: "परिवहन", ps: "ترانسپورت", ckb: "گواسترەوە",
          pt: "Transporte", ko: "운송", fr: "Transport", zh: "交通运输",
        },
      },
      {
        entityType: "Form",
        matchTitle: "ساختار کسب و کار",
        values: {
          en: "Business Structure", tr: "İş Yapısı", ar: "هيكل الأعمال",
          hi: "व्यावसायिक संरचना", ps: "د سوداګرۍ جوړښت", ckb: "پێکهاتەی بازرگانی",
          pt: "Estrutura de Negócios", ko: "비즈니스 구조", fr: "Structure commerciale", zh: "业务结构",
        },
      },
      {
        entityType: "Form",
        matchTitle: "فرمساز",
        values: {
          en: "Form Builder", tr: "Form Oluşturucu", ar: "منشئ النماذج",
          hi: "फ़ॉर्म बिल्डर", ps: "فورم جوړونکی", ckb: "د فۆرم سازەکەر",
          pt: "Criador de Formulários", ko: "폼 빌더", fr: "Créateur de formulaires", zh: "表单构建器",
        },
      },
    ];
    /* ۴الف — مهاجرت ستون‌های میراث Title_En / Label_En به ردیف‌های en */
    const legacyMenus = await this.prisma.dfbMenu.findMany({ where: { titleEn: { not: null } } });
    for (const m of legacyMenus) {
      if ((m.titleEn ?? "").trim()) await ensureTr("Menu", m.id, "Title", "en", (m.titleEn ?? "").trim());
    }
    const legacyForms = await this.prisma.dfbForm.findMany({ where: { titleEn: { not: null } } });
    for (const f of legacyForms) {
      if ((f.titleEn ?? "").trim()) await ensureTr("Form", f.id, "Title", "en", (f.titleEn ?? "").trim());
    }
    const legacyFields = await this.prisma.dfbFormField.findMany({ where: { labelEn: { not: null } } });
    for (const f of legacyFields) {
      if ((f.labelEn ?? "").trim()) await ensureTr("Field", f.formRef, f.fieldKey, "en", (f.labelEn ?? "").trim());
    }

    let seededTr = 0;
    for (const s of TRANSLATION_SEED) {
      const row =
        s.entityType === "Menu"
          ? await this.prisma.dfbMenu.findFirst({ where: { title: s.matchTitle } })
          : await this.prisma.dfbForm.findFirst({ where: { title: s.matchTitle } });
      if (!row) continue;
      for (const [lang, value] of Object.entries(s.values)) {
        if (await ensureTr(s.entityType, row.id, "Title", lang, value)) seededTr++;
      }
    }
    if (seededTr > 0) this.logger.log(`seeded ${seededTr} demo translation rows (Task 68)`);
  }
}
