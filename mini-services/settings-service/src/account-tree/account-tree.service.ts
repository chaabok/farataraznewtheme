import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import {
  appBaseOnCreate,
  appBaseOnUpdate,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
} from "../../../_shared/app-base-entity";
import {
  ACCOUNT_DEFAULT_CODE_LEN,
  ACCOUNT_DEFAULT_DETAIL_LEVELS,
  ACCOUNT_LEVEL_CODELEN_SOURCE,
  ACCOUNT_MAX_DETAIL_LEVEL_INDEX,
  ACCOUNT_MAX_LEVELS,
  SaveAccountNodeDto,
} from "./account-tree.dto";

/**
 * AccountTreeService — Task 140 (درخواست مالک): فرم «درختواره حسابها» در
 * نرم‌افزار «حسابداری» ← زیرمنوی «اطلاعات پایه» (SimpleTreeForm). رعایت کامل
 * ارث‌بری AppBaseEntity (۸فیلدی): ID از IDGeneration (§۱۶)، Version با §۲.۵
 * auto-rowversion، مهر Creator/LastModifier + زنجیرهٔ ساختار سازمانی
 * (تا استقرار IAM = SYSTEM_ACTOR / دفتر مرکزی ID=۱).
 *
 * زنجیرهٔ اعتبارسنجی (خط دفاعی نهایی سمت سرور؛ فرانت همان قوانین را پیش از
 * ارسال هم چک می‌کند):
 *   ۱. کد عددی با طول دقیق سطح — از SoftwareConfig حسابداری خوانده می‌شود:
 *      گروه = accGroupCodeLen، کل = گروه + accLedgerCodeLen،
 *      معین/شاخه = گروه + کل + accSubsidiaryCodeLen (۴۲۲ پیام روشن).
 *   ۲. سطح از والد می‌آید (والد+۱، حداکثر ۴)؛ تغییر والدِ گره موجود رد می‌شود.
 *   ۳. کد یکتا در ساختار (۴۰۹)؛ عنوان یکتا در بین خواهربرادرها (۴۰۹).
 *   ۴. فیلدهای اختصاصی سطح: نوع حساب فقط گروه؛ ماهیت گروه/کل (۱/۲/۷) و معین
 *      (۳/۴/۵/۶/۷)؛ شاخه بدون ماهیت؛ کنترل ماهیت فقط معین با ماهیت ۳/۴؛
 *      ویژگی‌های حساب فقط معین (سرور نرمال می‌کند).
 *   ۵. حذف گره با فرزند رد می‌شود (۴۰۹).
 *   ۶. سطح تفصیلیِ گره‌های ≥۳ هنگام ایجاد تا N ردیف seed می‌شود (N از
 *      accDetailLevels — پیش‌فرض ۱۰، کلمپ ۱..۲۰).
 *   ۷. انتساب نوع تفصیلی تکراری در یک گره رد می‌شود (۴۰۹ — «انواع
 *      تکراری/استفاده‌شده»).
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** ماهیت‌های «قابل تعدیل» معین — جفت‌های مخالف: ۳↔۴ (طی دوره)، ۵↔۶ (پایان دوره). */
const NATURE_ADJUST_OPPOSITE: Record<number, number[]> = {
  3: [4],
  4: [3],
  5: [6],
  6: [5],
};

@Injectable()
export class AccountTreeService {
  private readonly logger = new Logger(AccountTreeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** تنظیمات طول کد/شمار سطوح تفصیلی از SoftwareConfig حسابداری (Task 135/137/139). */
  private async readConfig(): Promise<{
    groupLen: number;
    ledgerLen: number;
    subsidiaryLen: number;
    detailLevelsCount: number;
    ledgerAccessControl: boolean;
  }> {
    const rows = await this.prisma.softwareConfig.findMany({
      where: { appKey: "accounting" },
    });
    const map = new Map(rows.map((r) => [r.configKey, r.configValue]));
    const readInt = (key: string, dflt: number, max: number): number => {
      const raw = map.get(key);
      const n = raw != null && raw !== "" ? Number(toLatinDigits(raw)) : NaN;
      if (!Number.isFinite(n)) return dflt;
      return Math.max(1, Math.min(max, Math.trunc(n)));
    };
    const g = readInt(ACCOUNT_LEVEL_CODELEN_SOURCE.group, ACCOUNT_DEFAULT_CODE_LEN.group, 15);
    const l = readInt(ACCOUNT_LEVEL_CODELEN_SOURCE.ledger, ACCOUNT_DEFAULT_CODE_LEN.ledger, 15);
    const s = readInt(
      ACCOUNT_LEVEL_CODELEN_SOURCE.subsidiary,
      ACCOUNT_DEFAULT_CODE_LEN.subsidiary,
      15,
    );
    const levels = readInt(
      ACCOUNT_LEVEL_CODELEN_SOURCE.detailLevelsCount,
      ACCOUNT_DEFAULT_DETAIL_LEVELS,
      ACCOUNT_MAX_DETAIL_LEVEL_INDEX,
    );
    const lacRaw = map.get("enableLedgerAccessControl");
    return {
      groupLen: g,
      ledgerLen: l,
      subsidiaryLen: s,
      detailLevelsCount: levels,
      ledgerAccessControl: lacRaw === "1",
    };
  }

  /** طول مجاز کد هر سطح (تفسیر اعلامی §0.6: شاخه هم طول معین). */
  private codeLenForLevel(
    level: number,
    cfg: { groupLen: number; ledgerLen: number; subsidiaryLen: number },
  ): number {
    if (level === 1) return cfg.groupLen;
    if (level === 2) return cfg.groupLen + cfg.ledgerLen;
    return cfg.groupLen + cfg.ledgerLen + cfg.subsidiaryLen;
  }

  /** فهرست تختِ درخت (سرویس‌مرتب بر کد) — هر گره با تمام فیلدهای فرم. */
  async list() {
    const rows = await this.prisma.accountNode.findMany({
      orderBy: [{ code: "asc" }],
    });
    return { items: rows.map((r) => this.toNodeDto(r)) };
  }

  /** جزئیات کامل یک گره (گره + سطوح تفصیلی با انواع + تعدیل ماهیت + شرح‌ها + کاربران). */
  async detail(id: number) {
    const row = await this.prisma.accountNode.findUnique({
      where: { id: BigInt(id) },
      include: {
        detailLevels: {
          orderBy: { levelIndex: "asc" },
          include: { types: { orderBy: { id: "asc" } } },
        },
        adjustments: { orderBy: { id: "asc" } },
        recurringDescs: { orderBy: { id: "asc" } },
        allowedUsers: { orderBy: { id: "asc" } },
      },
    });
    if (!row) {
      throw new NotFoundException({
        statusCode: 404,
        message: `گره حساب با شناسه «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    /* ارجاع‌های منطقی: انواع تفصیلی (DetailType) و حساب‌های تعدیل ماهیت */
    const typeIds = [...new Set(row.detailLevels.flatMap((lv) => lv.types.map((tp) => tp.detailTypeRef)))];
    const typeRows = typeIds.length
      ? await this.prisma.detailType.findMany({
          where: { id: { in: typeIds } },
          select: { id: true, code: true, title: true },
        })
      : [];
    const typeById = new Map(typeRows.map((t) => [Number(t.id), t]));
    const adjustTargets = new Map<number, { code: string; title: string; nature: number }>();
    const targetIds = [...new Set(row.adjustments.map((a) => a.adjustAccountRef))];
    if (targetIds.length > 0) {
      const targets = await this.prisma.accountNode.findMany({
        where: { id: { in: targetIds } },
        select: { id: true, code: true, title: true, nature: true },
      });
      for (const t of targets) {
        adjustTargets.set(Number(t.id), { code: t.code, title: t.title, nature: t.nature });
      }
    }
    /* کاربران مجاز — نام کاربری/نام کامل برای نمایش فقط‌خواندنی (ارجاع منطقی) */
    const userIds = [...new Set(row.allowedUsers.map((u) => u.userRef))];
    const userRows = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, username: true, fullName: true },
        })
      : [];
    const userById = new Map(userRows.map((u) => [Number(u.id), u]));
    return {
      item: {
        ...this.toNodeDto(row),
        config: await this.readConfig(),
        detailLevels: row.detailLevels.map((lv) => ({
          id: Number(lv.id),
          levelIndex: lv.levelIndex,
          title: lv.title,
          isActive: lv.isActive,
          types: lv.types.map((tp) => ({
            id: Number(tp.id),
            detailTypeRef: Number(tp.detailTypeRef),
            code: typeById.get(Number(tp.detailTypeRef))?.code ?? "",
            title: typeById.get(Number(tp.detailTypeRef))?.title ?? "",
          })),
        })),
        natureAdjust: row.adjustments.map((a) => {
          const tgt = adjustTargets.get(Number(a.adjustAccountRef));
          return {
            id: Number(a.id),
            adjustAccountRef: Number(a.adjustAccountRef),
            adjustAccountCode: tgt?.code ?? "",
            adjustAccountTitle: tgt?.title ?? "",
            adjustAccountNature: tgt?.nature ?? 0,
            description: a.description ?? "",
            description2: a.description2 ?? "",
          };
        }),
        recurringDesc: row.recurringDescs.map((d) => ({
          id: Number(d.id),
          description: d.description,
          description2: d.description2 ?? "",
        })),
        allowedUsers: row.allowedUsers.map((u) => ({
          id: Number(u.id),
          userRef: Number(u.userRef),
          username: userById.get(Number(u.userRef))?.username ?? "",
          fullName: userById.get(Number(u.userRef))?.fullName ?? "",
          permCreate: u.permCreate,
          permView: u.permView,
          permEdit: u.permEdit,
          permDelete: u.permDelete,
          permReport: u.permReport,
          permSend: u.permSend,
        })),
      },
    };
  }

  /** ثبت گره تازه — سطح از والد، کد/عنوان با قوانین سطح، seed سطوح تفصیلی. */
  async create(dto: SaveAccountNodeDto) {
    const cfg = await this.readConfig();
    const parentRef = dto.parentRef != null && dto.parentRef > 0 ? BigInt(dto.parentRef) : null;

    let level = 1;
    let structureRef = HEAD_OFFICE_NODE_ID;
    /* Task 141 — کدینگ سلسله‌مراتبی: کد زیرشاخه باید با کد سرشاخه آغاز شود */
    let parentCode: string | null = null;
    if (parentRef != null) {
      const parent = await this.prisma.accountNode.findUnique({ where: { id: parentRef } });
      if (!parent) {
        throw new BadRequestException({
          statusCode: 422,
          message: "حساب والد یافت نشد؛ ابتدا والد را ذخیره کنید.",
          messageKey: "common.error",
        });
      }
      level = parent.level + 1;
      if (level > ACCOUNT_MAX_LEVELS) {
        throw new BadRequestException({
          statusCode: 422,
          message: `درختواره حسابها حداکثر ${ACCOUNT_MAX_LEVELS} سطح دارد.`,
          messageKey: "common.error",
        });
      }
      parentCode = parent.code;
      structureRef = parent.businessStructureRef;
    }

    const code = toLatinDigits(dto.code).trim();
    const title = dto.title.trim();
    this.assertLevelFields(level, dto, cfg);
    this.assertCode(code, level, cfg);
    /* Task 141 (درخواست مالک) — «هر زیرشاخه در فیلد کد باید کد سرشاخه را
       داشته باشد»: خط دوم دفاعی سمت سرور؛ فرانت پیشوند را در UI قفل می‌کند */
    if (parentCode && !code.startsWith(parentCode)) {
      throw new BadRequestException({
        statusCode: 422,
        message: `کد این سطح باید با کد سرشاخه «${parentCode}» شروع شود.`,
        messageKey: "common.error",
      });
    }

    /* یکتایی کد در ساختار + عنوان در بین خواهربرادرها */
    const codeClash = await this.prisma.accountNode.findFirst({
      where: { code, businessStructureRef: structureRef },
      select: { id: true },
    });
    if (codeClash) {
      throw new ConflictException({
        statusCode: 409,
        message: `کد حساب «${code}» قبلاً استفاده شده است.`,
        messageKey: "common.error",
      });
    }
    const titleClash = await this.prisma.accountNode.findFirst({
      where: { title, parentRef: parentRef, businessStructureRef: structureRef },
      select: { id: true },
    });
    if (titleClash) {
      throw new ConflictException({
        statusCode: 409,
        message: `عنوان «${title}» در همین سطح قبلاً استفاده شده است.`,
        messageKey: "common.error",
      });
    }

    const newId = await this.idGen.generateNextId("AccountNode");
    const norm = this.normalizeLevelFields(level, dto);
    const row = await this.prisma.accountNode.create({
      data: {
        id: BigInt(newId),
        parentRef,
        level,
        code,
        title,
        latinTitle: dto.latinTitle?.trim() || null,
        isActive: dto.isActive,
        ...norm,
        ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef }),
      },
    });

    /* Task 139/140 — seed سطوح تفصیلی برای گره‌های سطح ≥ ۳: سطر «سطح اول» تا
       «سطح N» (N از accDetailLevels — پیش‌فرض ۱۰)؛ عناوین ارسالی فرم هم بلافاصله
       اعمال می‌شوند تا چیزی که کاربر پیش از نخستین ذخیره تایپ کرده از دست نرود.
       seed و اعمالِ عناوین هر دو «بدون تراکنش بیرونی»اند (IDGen ترکیب‌ناپذیر — §8). */
    if (level >= 3) {
      await this.seedDetailLevels(row.id, cfg.detailLevelsCount, structureRef);
      if (dto.detailLevels !== undefined) {
        const seeded = await this.prisma.accountDetailLevel.findMany({
          where: { accountNodeRef: row.id },
          select: { id: true, levelIndex: true },
        });
        for (const l of dto.detailLevels) {
          if (l.levelIndex < 1 || l.levelIndex > ACCOUNT_MAX_DETAIL_LEVEL_INDEX) continue;
          const cur = seeded.find((s) => s.levelIndex === l.levelIndex);
          if (cur) {
            await this.prisma.accountDetailLevel.update({
              where: { id: cur.id },
              data: { title: l.title.slice(0, 100), isActive: l.isActive },
            });
          } else {
            const newLevelId = await this.idGen.generateNextId("AccountDetailLevel");
            await this.prisma.accountDetailLevel.create({
              data: {
                id: BigInt(newLevelId),
                accountNodeRef: row.id,
                levelIndex: l.levelIndex,
                title: l.title.slice(0, 100),
                isActive: l.isActive,
                ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef }),
              },
            });
          }
        }
      }
    }

    this.logger.log(
      `AccountNode created — ID=${newId} L${level} Code=${code} Title=${title} Parent=${parentRef ?? "root"}`,
    );
    return this.toNodeDto(row);
  }

  /** ویرایش گره — والد/سطح تغییرناپذیر؛ مجموعه‌های ارسالی تراکنشی بازنویسی می‌شوند. */
  async update(id: number, dto: SaveAccountNodeDto) {
    const existing = await this.prisma.accountNode.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `گره حساب با شناسه «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    if (dto.parentRef != null && dto.parentRef > 0 && BigInt(dto.parentRef) !== existing.parentRef) {
      throw new BadRequestException({
        statusCode: 422,
        message: "جابه‌جایی گره در درخت مجاز نیست؛ والد حساب قابل تغییر نیست.",
        messageKey: "common.error",
      });
    }
    const cfg = await this.readConfig();
    const level = existing.level;
    const code = toLatinDigits(dto.code).trim();
    const title = dto.title.trim();
    this.assertLevelFields(level, dto, cfg);
    this.assertCode(code, level, cfg);

    const codeClash = await this.prisma.accountNode.findFirst({
      where: { code, businessStructureRef: existing.businessStructureRef, id: { not: existing.id } },
      select: { id: true },
    });
    if (codeClash) {
      throw new ConflictException({
        statusCode: 409,
        message: `کد حساب «${code}» قبلاً استفاده شده است.`,
        messageKey: "common.error",
      });
    }
    const titleClash = await this.prisma.accountNode.findFirst({
      where: {
        title,
        parentRef: existing.parentRef,
        businessStructureRef: existing.businessStructureRef,
        id: { not: existing.id },
      },
      select: { id: true },
    });
    if (titleClash) {
      throw new ConflictException({
        statusCode: 409,
        message: `عنوان «${title}» در همین سطح قبلاً استفاده شده است.`,
        messageKey: "common.error",
      });
    }

    const norm = this.normalizeLevelFields(level, dto);

    /* §8 — پیش‌تولید همهٔ شناسه‌ها و پیش‌اعتبارسنجی ارجاع‌ها «بیرون» از تراکنش
       (ID service هرگز با تراکنش بیزینسی ترکیب نمی‌شود — قفل نوشتن SQLite).
       تراکنش بیرونی فقط می‌نویسد. */
    const wantedLevels = new Map(
      (dto.detailLevels ?? [])
        .filter((l) => l.levelIndex >= 1 && l.levelIndex <= ACCOUNT_MAX_DETAIL_LEVEL_INDEX)
        .map((l) => [l.levelIndex, l]),
    );
    const currentLevels =
      dto.detailLevels !== undefined
        ? await this.prisma.accountDetailLevel.findMany({
            where: { accountNodeRef: existing.id },
            select: { id: true, levelIndex: true },
          })
        : [];
    const missingLevelIdx = [...wantedLevels.keys()].filter(
      (idx) => !currentLevels.some((c) => c.levelIndex === idx),
    );
    const levelIds =
      dto.detailLevels !== undefined && missingLevelIdx.length > 0
        ? await this.idGen.generateNextIdBlock("AccountDetailLevel", missingLevelIdx.length)
        : null;

    /* اعتبارسنجی هدف‌های تعدیل ماهیت و کاربران مجاز — بیرون از تراکنش */
    const adjustTargets: bigint[] = [];
    if (dto.natureAdjust !== undefined) {
      for (const a of dto.natureAdjust) {
        const target = await this.prisma.accountNode.findUnique({
          where: { id: BigInt(a.adjustAccountRef) },
          select: { id: true },
        });
        if (!target) {
          throw new BadRequestException({
            statusCode: 422,
            message: "حساب معین منتخب برای تعدیل ماهیت یافت نشد.",
            messageKey: "common.error",
          });
        }
        if (target.id === existing.id) {
          throw new BadRequestException({
            statusCode: 422,
            message: "خودِ حساب جاری برای تعدیل ماهیت قابل انتخاب نیست.",
            messageKey: "common.error",
          });
        }
        adjustTargets.push(target.id);
      }
    }
    const adjustIds =
      dto.natureAdjust !== undefined && dto.natureAdjust.length > 0
        ? await this.idGen.generateNextIdBlock("AccountNatureAdjust", dto.natureAdjust.length)
        : null;
    const recurringIds =
      dto.recurringDesc !== undefined && dto.recurringDesc.length > 0
        ? await this.idGen.generateNextIdBlock("AccountRecurringDesc", dto.recurringDesc.length)
        : null;
    if (dto.allowedUsers !== undefined) {
      for (const u of dto.allowedUsers) {
        const user = await this.prisma.user.findUnique({
          where: { id: BigInt(u.userRef) },
          select: { id: true },
        });
        if (!user) {
          throw new BadRequestException({
            statusCode: 422,
            message: "کاربر منتخب برای «کاربران مجاز» یافت نشد.",
            messageKey: "common.error",
          });
        }
      }
    }
    const allowedIds =
      dto.allowedUsers !== undefined && dto.allowedUsers.length > 0
        ? await this.idGen.generateNextIdBlock("AccountAllowedUser", dto.allowedUsers.length)
        : null;

    /* بازنویسی تراکنشی مجموعه‌های ارسالی — فقط نوشتن، بدون IDGen */
    const result = await this.prisma.$transaction(
      async (tx) => {
        const row = await tx.accountNode.update({
          where: { id: existing.id },
          data: {
            code,
            title,
            latinTitle: dto.latinTitle?.trim() || null,
            isActive: dto.isActive,
            ...norm,
            ...appBaseOnUpdate(SYSTEM_ACTOR),
          },
        });

        if (dto.detailLevels !== undefined) {
          /* به‌روزرسانی عنوان/فعالِ سطوح موجود + ساخت سطوح کم‌شمار با ID پیش‌تولیدشده
             (انواع انتسابیِ سطوح حذف‌شده با cascade می‌روند) */
          for (const cur of currentLevels) {
            const w = wantedLevels.get(cur.levelIndex);
            if (!w) {
              await tx.accountDetailLevel.delete({ where: { id: BigInt(cur.id) } });
              continue;
            }
            await tx.accountDetailLevel.update({
              where: { id: BigInt(cur.id) },
              data: { title: w.title.slice(0, 100), isActive: w.isActive },
            });
          }
          for (let i = 0; i < missingLevelIdx.length; i++) {
            const idx = missingLevelIdx[i];
            const w = wantedLevels.get(idx);
            await tx.accountDetailLevel.create({
              data: {
                id: BigInt((levelIds as number) + i),
                accountNodeRef: existing.id,
                levelIndex: idx,
                title: (w as { title: string }).title.slice(0, 100),
                isActive: (w as { isActive: boolean }).isActive,
                ...appBaseOnCreate({
                  userId: SYSTEM_ACTOR.userId,
                  nodeId: existing.businessStructureRef,
                }),
              },
            });
          }
        }

        if (dto.natureAdjust !== undefined) {
          await tx.accountNatureAdjust.deleteMany({ where: { accountNodeRef: existing.id } });
          for (let i = 0; i < dto.natureAdjust.length; i++) {
            const a = dto.natureAdjust[i];
            await tx.accountNatureAdjust.create({
              data: {
                id: BigInt((adjustIds as number) + i),
                accountNodeRef: existing.id,
                adjustAccountRef: adjustTargets[i],
                description: a.description?.trim() || null,
                description2: a.description2?.trim() || null,
                ...appBaseOnCreate({
                  userId: SYSTEM_ACTOR.userId,
                  nodeId: existing.businessStructureRef,
                }),
              },
            });
          }
        }

        if (dto.recurringDesc !== undefined) {
          await tx.accountRecurringDesc.deleteMany({ where: { accountNodeRef: existing.id } });
          for (let i = 0; i < dto.recurringDesc.length; i++) {
            const d = dto.recurringDesc[i];
            await tx.accountRecurringDesc.create({
              data: {
                id: BigInt((recurringIds as number) + i),
                accountNodeRef: existing.id,
                description: d.description.trim(),
                description2: d.description2?.trim() || null,
                ...appBaseOnCreate({
                  userId: SYSTEM_ACTOR.userId,
                  nodeId: existing.businessStructureRef,
                }),
              },
            });
          }
        }

        if (dto.allowedUsers !== undefined) {
          await tx.accountAllowedUser.deleteMany({ where: { accountNodeRef: existing.id } });
          for (let i = 0; i < dto.allowedUsers.length; i++) {
            const u = dto.allowedUsers[i];
            await tx.accountAllowedUser.create({
              data: {
                id: BigInt((allowedIds as number) + i),
                accountNodeRef: existing.id,
                userRef: BigInt(u.userRef),
                permCreate: u.permCreate,
                permView: u.permView,
                permEdit: u.permEdit,
                permDelete: u.permDelete,
                permReport: u.permReport,
                permSend: u.permSend,
                ...appBaseOnCreate({
                  userId: SYSTEM_ACTOR.userId,
                  nodeId: existing.businessStructureRef,
                }),
              },
            });
          }
        }

        return row;
      },
      { timeout: 30_000, maxWait: 10_000 },
    );

    this.logger.log(`AccountNode updated — ID=${id} L${level} Code=${code} Title=${title}`);
    return this.toNodeDto(result);
  }

  /** حذف گره — با فرزند رد می‌شود (۴۰۹)؛ مجموعه‌ها با cascade حذف می‌شوند. */
  async remove(id: number) {
    const existing = await this.prisma.accountNode.findUnique({
      where: { id: BigInt(id) },
      include: { _count: { select: { children: true } } },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `گره حساب با شناسه «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    if (existing._count.children > 0) {
      throw new ConflictException({
        statusCode: 409,
        message: `حساب «${existing.title}» دارای زیرشاخه است و قابل حذف نیست؛ ابتدا زیرشاخه‌ها را حذف کنید.`,
        messageKey: "common.error",
      });
    }
    await this.prisma.accountNode.delete({ where: { id: existing.id } });
    this.logger.log(`AccountNode deleted — ID=${id} Code=${existing.code} Title=${existing.title}`);
    return { deleted: true };
  }

  /** انتساب «نوع تفصیلی» به یک سطح — تکراری در همان گره رد می‌شود (۴۰۹). */
  async assignDetailType(id: number, dto: { levelIndex: number; detailTypeRef: number }) {
    const node = await this.prisma.accountNode.findUnique({ where: { id: BigInt(id) } });
    if (!node) {
      throw new NotFoundException({
        statusCode: 404,
        message: `گره حساب با شناسه «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    const level = await this.prisma.accountDetailLevel.findUnique({
      where: { accountNodeRef_levelIndex: { accountNodeRef: node.id, levelIndex: dto.levelIndex } },
    });
    if (!level) {
      throw new BadRequestException({
        statusCode: 422,
        message: `سطح تفصیلی «${dto.levelIndex}» برای این حساب وجود ندارد.`,
        messageKey: "common.error",
      });
    }
    const type = await this.prisma.detailType.findUnique({ where: { id: BigInt(dto.detailTypeRef) } });
    if (!type) {
      throw new BadRequestException({
        statusCode: 422,
        message: "نوع تفصیلی منتخب یافت نشد.",
        messageKey: "common.error",
      });
    }
    /* «انواع تکراری/استفاده‌شده فیلتر می‌شوند» — همین نوع در هر سطحی از همین گره */
    const clash = await this.prisma.accountDetailLevelType.findFirst({
      where: { detailTypeRef: type.id, level: { accountNodeRef: node.id } },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `نوع تفصیلی «${type.title}» قبلاً در سطوح این حساب استفاده شده است.`,
        messageKey: "common.error",
      });
    }
    const newId = await this.idGen.generateNextId("AccountDetailLevelType");
    const row = await this.prisma.accountDetailLevelType.create({
      data: {
        id: BigInt(newId),
        detailLevelRef: level.id,
        detailTypeRef: type.id,
        ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: node.businessStructureRef }),
      },
    });
    return { id: Number(row.id), detailTypeRef: Number(type.id), code: type.code, title: type.title };
  }

  /** حذف انتساب نوع تفصیلی. */
  async removeDetailType(_nodeId: number, assignmentId: number) {
    const existing = await this.prisma.accountDetailLevelType.findUnique({
      where: { id: BigInt(assignmentId) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: "انتساب نوع تفصیلی یافت نشد",
        messageKey: "common.error",
      });
    }
    await this.prisma.accountDetailLevelType.delete({ where: { id: existing.id } });
    return { deleted: true };
  }

  /* ------------------------------ internals ------------------------------ */

  /** seed سطرهای سطوح تفصیلی ۱..N برای گره تازه (عنوان خالی، فعال). */
  private async seedDetailLevels(nodeRef: bigint, count: number, structureRef: bigint) {
    const n = Math.max(1, Math.min(ACCOUNT_MAX_DETAIL_LEVEL_INDEX, count));
    for (let i = 1; i <= n; i++) {
      const newId = await this.idGen.generateNextId("AccountDetailLevel");
      await this.prisma.accountDetailLevel.create({
        data: {
          id: BigInt(newId),
          accountNodeRef: nodeRef,
          levelIndex: i,
          title: "",
          isActive: true,
          ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef }),
        },
      });
    }
  }

  /** قانون فیلدهای اختصاصی هر سطح (۴۲۲ با پیام روشن). */
  private assertLevelFields(
    level: number,
    dto: SaveAccountNodeDto,
    cfg: { groupLen: number; ledgerLen: number; subsidiaryLen: number },
  ) {
    const nature = dto.nature ?? 0;
    if (level === 1) {
      if (dto.accountType == null || ![1, 2, 3].includes(dto.accountType)) {
        throw new BadRequestException({
          statusCode: 422,
          message: "انتخاب «نوع حساب» برای گروه حساب الزامی است (ترازنامه‌ای/سود و زیانی/انتظامی).",
          messageKey: "common.error",
        });
      }
      if (![1, 2, 7].includes(nature)) {
        throw new BadRequestException({
          statusCode: 422,
          message: "ماهیت گروه حساب باید بدهکار(1)، بستانکار(2) یا مهم نیست(7) باشد.",
          messageKey: "common.error",
        });
      }
      return;
    }
    if (level === 2) {
      if (![1, 2, 7].includes(nature)) {
        throw new BadRequestException({
          statusCode: 422,
          message: "ماهیت حساب کل باید بدهکار(1)، بستانکار(2) یا مهم نیست(7) باشد.",
          messageKey: "common.error",
        });
      }
      return;
    }
    if (level === 3) {
      if (![3, 4, 5, 6, 7].includes(nature)) {
        throw new BadRequestException({
          statusCode: 422,
          message:
            "ماهیت حساب معین باید بدهکار طی دوره(3)، بستانکار طی دوره(4)، بدهکار پایان دوره(5)، بستانکار پایان دوره(6) یا مهم نیست(7) باشد.",
          messageKey: "common.error",
        });
      }
      if (dto.natureControl != null && ![3, 4].includes(nature)) {
        throw new BadRequestException({
          statusCode: 422,
          message: "«کنترل ماهیت» فقط برای ماهیت طی دوره (بدهکار طی دوره/بستانکار طی دوره) قابل انتخاب است.",
          messageKey: "common.error",
        });
      }
      return;
    }
    /* سطح ۴ = شاخه تفصیلی — بدون ماهیت/نوع/کنترل/ویژگی */
    void cfg;
  }

  /** نرمال‌سازی فیلدهای اختصاصی سطح برای ذخیره (سرور تک‌منبع حقیقت). */
  private normalizeLevelFields(level: number, dto: SaveAccountNodeDto) {
    const clamp3 = (v?: number) => (v == null ? 0 : Math.max(0, Math.min(2, Math.trunc(v))));
    if (level === 1) {
      return {
        accountType: dto.accountType ?? null,
        nature: dto.nature,
        natureControl: null,
        featureQuantitative: 0,
        featureTrackingNumber: 0,
        featureTrackingDate: 0,
        featureCurrency: 0,
        featureRevaluable: 0,
      };
    }
    if (level === 2) {
      return {
        accountType: null,
        nature: dto.nature,
        natureControl: null,
        featureQuantitative: 0,
        featureTrackingNumber: 0,
        featureTrackingDate: 0,
        featureCurrency: 0,
        featureRevaluable: 0,
      };
    }
    if (level === 3) {
      const natureControlOk = [3, 4].includes(dto.nature) && dto.natureControl != null;
      return {
        accountType: null,
        nature: dto.nature,
        natureControl: natureControlOk ? dto.natureControl ?? null : null,
        featureQuantitative: clamp3(dto.featureQuantitative),
        featureTrackingNumber: clamp3(dto.featureTrackingNumber),
        featureTrackingDate: clamp3(dto.featureTrackingDate),
        featureCurrency: clamp3(dto.featureCurrency),
        featureRevaluable: clamp3(dto.featureRevaluable),
      };
    }
    return {
      accountType: null,
      nature: 0,
      natureControl: null,
      featureQuantitative: 0,
      featureTrackingNumber: 0,
      featureTrackingDate: 0,
      featureCurrency: 0,
      featureRevaluable: 0,
    };
  }

  /** کد عددی با طول دقیق سطح (۴۲۲). */
  private assertCode(
    code: string,
    level: number,
    cfg: { groupLen: number; ledgerLen: number; subsidiaryLen: number },
  ) {
    if (!/^[0-9]+$/.test(code)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد حساب باید فقط عدد باشد.",
        messageKey: "common.error",
      });
    }
    const len = this.codeLenForLevel(level, cfg);
    if (code.length !== len) {
      throw new BadRequestException({
        statusCode: 422,
        message: `طول کد این سطح باید ${len} رقم باشد (طول مجاز از تنظیمات حسابداری خوانده می‌شود).`,
        messageKey: "common.error",
      });
    }
  }

  private toNodeDto(r: {
    id: bigint;
    parentRef: bigint | null;
    level: number;
    code: string;
    title: string;
    latinTitle: string | null;
    isActive: boolean;
    accountType: number | null;
    nature: number;
    natureControl: number | null;
    featureQuantitative: number;
    featureTrackingNumber: number;
    featureTrackingDate: number;
    featureCurrency: number;
    featureRevaluable: number;
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
      parentRef: r.parentRef == null ? null : Number(r.parentRef),
      level: r.level,
      code: r.code,
      title: r.title,
      latinTitle: r.latinTitle ?? "",
      isActive: r.isActive,
      accountType: r.accountType,
      nature: r.nature,
      natureControl: r.natureControl,
      featureQuantitative: r.featureQuantitative,
      featureTrackingNumber: r.featureTrackingNumber,
      featureTrackingDate: r.featureTrackingDate,
      featureCurrency: r.featureCurrency,
      featureRevaluable: r.featureRevaluable,
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

/** خوانندهٔ تنظیم برای فرانت (کلیدها برای آینهٔ فرم) */
export const ACCOUNT_TREE_CONFIG_KEYS = ACCOUNT_LEVEL_CODELEN_SOURCE;
export { NATURE_ADJUST_OPPOSITE };
