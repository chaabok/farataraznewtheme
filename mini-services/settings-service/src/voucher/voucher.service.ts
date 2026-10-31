import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { InternalHttpClient } from "../../../_shared/internal-http";
import {
  appBaseOnCreate,
  appBaseOnUpdate,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
} from "../../../_shared/app-base-entity";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";
import { SaveVoucherDto, SaveVoucherItemDto } from "./voucher.dto";

/**
 * VoucherService — Task 158 (درخواست مالک): فرم «سند حسابداری جدید» در
 * نرم‌افزار «حسابداری» ← زیرمنوی «سند حسابداری». سه بخش هدر/اقلام/فوتر.
 *
 * شماره‌گذاری (فرمان مالک: «الزامی (خودکار طبق شماره‌گذاری)»):
 *   · شماره سند  — پیوسته به ازای هر نوع سند در گرهٔ ساختار: MAX+۱؛
 *     ورود دستیِ تکراری ۴۰۹. سرور تک‌مرجع نهایی تخصیص است (فرانت فقط پیشنهاد).
 *   · شماره عطف  — پیوستهٔ سراسری گره (مستقل از نوع): MAX+۱.
 *
 * اعتبارسنجی اقلام (خط دفاعی نهایی سمت سرور):
 *   · معین باید AccountNode سطح ۳ باشد (۴۲۲)؛
 *   · شرح ردیف اجباری (۴۲۲)؛
 *   · «یکی از بدهکار یا بستانکار» — هر دو همزمان با مقدار > ۰ رد (۴۲۲)؛
 *   · تفصیلی هر سطح فقط وقتی مجاز است که در کدینگ (AccountDetailLevelType)
 *     به همان سطحِ همان معین متصل شده باشد؛ ستون قفل 🔒 یعنی همین (۴۲۲)؛
 *   · نوع سند سیستمی (افتتاحیه/اختتامیه/…) رد (۴۲۲ — فرمان مالک)؛
 *   · وضعیت ۳/۴ (تاییدشده/دائمی) فقط پس از تایید — در فرم صدور رد (۴۲۲).
 *
 * meta() — یک‌واکشیِ منابع دراپ‌داون فرم (کدینگ/تفصیلی‌ها/انواع سند/ارزها/
 * سقف‌های پیکربندی) تا فرم با کمترین درخواست بالا بیاید.
 */

/** نرمال‌سازی ارقام فارسی/عربی + جداکننده‌ها به رشتهٔ عددی لاتین. */
function numericString(raw: string | undefined | null): string {
  const s = (raw ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[,٬'\s]/g, "")
    .trim();
  if (s === "") return "0";
  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw new BadRequestException({
      statusCode: 422,
      message: `مقدار مبلغ «${s}» معتبر نیست؛ فقط رقم و نقطهٔ اعشار مجاز است.`,
      messageKey: "common.error",
    });
  }
  return s.replace(/\.0+$/, "") || "0";
}

function bigToNum(v: bigint): number {
  const n = Number(v);
  if (!Number.isSafeInteger(n)) {
    throw new Error(`ID ${v} exceeds 2^53 safe-integer threshold.`);
  }
  return n;
}

/** وضعیت‌های مجاز فرم صدور — ۵=تایید کاربر (گلوگاه ورود گردش کار D-3)؛
 *  ۳/۴ فقط پس از تایید و فقط از مسیر موتور گردش کار (فرمان مالک — D-4). */
const ISSUABLE_STATUSES = new Set([1, 2, 5]);

/** وضعیت‌هایی که فقط موتور گردش کار حق نوشتنشان را دارد (engine-status — t178). */
const ENGINE_STATUSES = new Set([1, 3, 4, 5]);

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  /** قفل نرم سند در جریان رسیدگی (FR-06 — t178): پرس‌وجو از workflow-service؛
   *  دسترس‌ناپذیری سرویس گردش کار = باز (fail-open مستند — قفل اصلی UI موتور است). */
  private readonly wfClient = new InternalHttpClient(process.env.INTERNAL_API_KEY ?? "");
  private readonly wfBase = process.env.WORKFLOW_SERVICE_URL ?? "http://127.0.0.1:3004";

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ----------------------------- meta ----------------------------- */

  /** یک‌واکشیِ منابع فرم سند: انواع سندِ قابل صدور، ارزها، معین‌ها با
   *  سطوح تفصیلی و انواع متصل، رکوردهای تفصیلی، سقف‌های پیکربندی. */
  async meta() {
    const [docTypes, currencies, moeinRows, levelRows, levelTypeRows, detailItems, detailTypes, configRows] =
      await Promise.all([
        this.prisma.voucherType.findMany({
          where: { isActive: true, isSystem: false },
          orderBy: [{ code: "asc" }],
          select: { id: true, code: true, title: true, latinTitle: true },
        }),
        this.prisma.currencyType.findMany({
          where: { isActive: true },
          orderBy: [{ code: "asc" }],
          select: { id: true, code: true, title: true, titleLatin: true, decimalPlaces: true },
        }),
        this.prisma.accountNode.findMany({
          where: { level: 3, isActive: true },
          orderBy: [{ code: "asc" }],
          select: { id: true, parentRef: true, code: true, title: true },
        }),
        this.prisma.accountDetailLevel.findMany({
          where: { node: { level: 3 } },
          orderBy: [{ accountNodeRef: "asc" }, { levelIndex: "asc" }],
          select: { id: true, accountNodeRef: true, levelIndex: true, title: true, isActive: true },
        }),
        this.prisma.accountDetailLevelType.findMany({
          select: { detailLevelRef: true, detailTypeRef: true },
        }),
        this.prisma.detailItem.findMany({
          where: { isActive: true },
          orderBy: [{ code: "asc" }],
          select: { id: true, detailTypeRef: true, code: true, title: true },
        }),
        this.prisma.detailType.findMany({
          select: { id: true, code: true, title: true },
        }),
        this.prisma.softwareConfig.findMany({ where: { appKey: "accounting" } }),
      ]);

    /* زنجیرهٔ پدر هر معین (کل = پدر معین، گروه = پدر کل) برای فوتر فرم */
    const allNodes = await this.prisma.accountNode.findMany({
      select: { id: true, parentRef: true, level: true, code: true, title: true },
    });
    const nodeById = new Map(allNodes.map((n) => [Number(n.id), n]));
    const chainOf = (moein: { parentRef: bigint | null }) => {
      const ledger = moein.parentRef != null ? nodeById.get(Number(moein.parentRef)) : undefined;
      const group = ledger?.parentRef != null ? nodeById.get(Number(ledger.parentRef)) : undefined;
      return {
        ledgerCode: ledger?.code ?? "",
        ledgerTitle: ledger?.title ?? "",
        groupCode: group?.code ?? "",
        groupTitle: group?.title ?? "",
      };
    };

    /* انواع تفصیل متصل به هر سطح — کلید: AccountDetailLevel.id */
    const typesByLevel = new Map<number, number[]>();
    for (const lt of levelTypeRows) {
      const arr = typesByLevel.get(Number(lt.detailLevelRef)) ?? [];
      arr.push(Number(lt.detailTypeRef));
      typesByLevel.set(Number(lt.detailLevelRef), arr);
    }
    const typeTitleById = new Map(detailTypes.map((t) => [Number(t.id), t]));

    const levelsByMoein = new Map<number, typeof levelRows>();
    for (const lv of levelRows) {
      const arr = levelsByMoein.get(Number(lv.accountNodeRef)) ?? [];
      arr.push(lv);
      levelsByMoein.set(Number(lv.accountNodeRef), arr);
    }

    const cfg = new Map(configRows.map((r) => [r.configKey, r.configValue ?? ""]));
    const readFlag = (k: string) => cfg.get(k) === "1";
    const readInt = (k: string, dflt: number) => {
      const n = Number(cfg.get(k));
      return Number.isFinite(n) && n > 0 ? Math.trunc(n) : dflt;
    };

    return {
      docTypes: docTypes.map((t) => ({
        id: bigToNum(t.id),
        code: t.code,
        title: t.title,
        latinTitle: t.latinTitle ?? "",
      })),
      currencies: currencies.map((c) => ({
        id: bigToNum(c.id),
        code: c.code,
        title: c.title,
        titleLatin: c.titleLatin ?? "",
        decimalPlaces: c.decimalPlaces,
      })),
      moeinAccounts: moeinRows.map((m) => {
        const chain = chainOf(m);
        const levels = (levelsByMoein.get(Number(m.id)) ?? []).map((lv) => {
          const typeIds = typesByLevel.get(Number(lv.id)) ?? [];
          return {
            levelIndex: lv.levelIndex,
            title: lv.title,
            isActive: lv.isActive,
            typeRefs: typeIds,
          };
        });
        return {
          id: bigToNum(m.id),
          code: m.code,
          title: m.title,
          ledgerCode: chain.ledgerCode,
          ledgerTitle: chain.ledgerTitle,
          groupCode: chain.groupCode,
          groupTitle: chain.groupTitle,
          detailLevels: levels,
        };
      }),
      detailItems: detailItems.map((d) => ({
        id: bigToNum(d.id),
        detailTypeRef: bigToNum(d.detailTypeRef),
        code: d.code,
        title: d.title,
        typeTitle: typeTitleById.get(bigToNum(d.detailTypeRef))?.title ?? "",
        typeCode: typeTitleById.get(bigToNum(d.detailTypeRef))?.code ?? "",
      })),
      config: {
        showDocDateTrackCap: readFlag("showDocDateTrackCap"),
        docDateTrackEntryMandatory: readFlag("docDateTrackEntryMandatory"),
        showCurrencyCaps: readFlag("showCurrencyCaps"),
        detailLevelsCount: Math.min(20, Math.max(1, readInt("accDetailLevels", 10))),
        baseCurrencyCode: cfg.get("baseCurrency") ?? "",
      },
    };
  }

  /* -------------------------- next numbers -------------------------- */

  /** پیشنهاد شماره‌گذاری فرم: شماره سند (به ازای نوع) + شماره عطف (سراسری). */
  async nextNumber(q: { voucherTypeRef?: number; structureId?: number }) {
    const structureRef = await this.resolveStructureRef(q.structureId);
    const serialAgg = await this.prisma.voucher.aggregate({
      where: { businessStructureRef: structureRef },
      _max: { serialNo: true },
    });
    const nextSerial = (serialAgg._max.serialNo ?? 0n) + 1n;

    let nextVoucherNo: bigint | null = null;
    if (q.voucherTypeRef != null && Number.isFinite(q.voucherTypeRef) && q.voucherTypeRef > 0) {
      const agg = await this.prisma.voucher.aggregate({
        where: {
          voucherTypeRef: BigInt(q.voucherTypeRef),
          businessStructureRef: structureRef,
        },
        _max: { voucherNo: true },
      });
      nextVoucherNo = (agg._max.voucherNo ?? 0n) + 1n;
    } else {
      const agg = await this.prisma.voucher.aggregate({
        where: { businessStructureRef: structureRef },
        _max: { voucherNo: true },
      });
      nextVoucherNo = (agg._max.voucherNo ?? 0n) + 1n;
    }
    return { voucherNo: bigToNum(nextVoucherNo), serialNo: bigToNum(nextSerial) };
  }

  /* ------------------------------- list ------------------------------- */

  /** فهرست اسناد (جدول اکشن‌بار) — با جمع بدهکار/بستانکار هر سند. */
  async list(q: { structureId?: number } = {}) {
    const structureRef = await this.resolveStructureRef(q.structureId);
    const rows = await this.prisma.voucher.findMany({
      where: { businessStructureRef: structureRef },
      orderBy: [{ serialNo: "desc" }],
      include: { items: { select: { debit: true, credit: true } } },
    });
    const typeIds = [...new Set(rows.map((r) => r.voucherTypeRef))];
    const types = typeIds.length
      ? await this.prisma.voucherType.findMany({
          where: { id: { in: typeIds } },
          select: { id: true, code: true, title: true },
        })
      : [];
    const typeById = new Map(types.map((t) => [Number(t.id), t]));

    const items = rows.map((r) => {
      let totalDebit = 0;
      let totalCredit = 0;
      for (const it of r.items) {
        totalDebit += Number(numericString(it.debit));
        totalCredit += Number(numericString(it.credit));
      }
      return {
        id: bigToNum(r.id),
        voucherNo: bigToNum(r.voucherNo),
        serialNo: bigToNum(r.serialNo),
        subNo: r.subNo == null ? null : bigToNum(r.subNo),
        voucherTypeRef: bigToNum(r.voucherTypeRef),
        voucherTypeTitle: typeById.get(bigToNum(r.voucherTypeRef))?.title ?? "",
        voucherTypeCode: typeById.get(bigToNum(r.voucherTypeRef))?.code ?? "",
        nature: r.nature,
        status: r.status,
        date: r.date,
        description: r.description,
        itemCount: r.items.length,
        totalDebit,
        totalCredit,
        creator: r.creator,
        createdAt: r.createdAt.toISOString(),
      };
    });
    return { items };
  }

  /* ------------------------------ detail ------------------------------ */

  /** جزئیات کامل سند برای بازکردن در فرم (اقلام + تفصیلی‌ها + نام‌ها). */
  async detail(id: number) {
    const row = await this.prisma.voucher.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: {
          orderBy: { rowIndex: "asc" },
          include: { details: { orderBy: { levelIndex: "asc" } } },
        },
      },
    });
    if (!row) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سند با شناسهٔ «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }

    const type = await this.prisma.voucherType.findUnique({
      where: { id: row.voucherTypeRef },
      select: { code: true, title: true, latinTitle: true },
    });
    /* ایجاد کننده — نام کامل کاربر برای نمایش فقط‌خواندنی
       (creator رشتهٔ IAM است؛ اگر عددی بود با id هم جست‌وجو می‌شود) */
    const creatorIsNumeric = /^\d+$/.test(row.creator);
    const creatorUser = await this.prisma.user.findFirst({
      where: creatorIsNumeric
        ? { OR: [{ id: BigInt(row.creator) }, { username: row.creator }] }
        : { username: row.creator },
      select: { fullName: true, username: true },
    });

    const moeinIds = [...new Set(row.items.map((i) => i.moeinRef))];
    const moeinRows = moeinIds.length
      ? await this.prisma.accountNode.findMany({
          where: { id: { in: moeinIds } },
          select: { id: true, parentRef: true, code: true, title: true, level: true },
        })
      : [];
    const moeinById = new Map(moeinRows.map((m) => [Number(m.id), m]));
    const allNodes = await this.prisma.accountNode.findMany({
      select: { id: true, parentRef: true, code: true, title: true },
    });
    const nodeById = new Map(allNodes.map((n) => [Number(n.id), n]));

    const detailItemIds = [
      ...new Set(row.items.flatMap((i) => i.details.map((d) => d.detailItemRef))),
    ];
    const detailRows = detailItemIds.length
      ? await this.prisma.detailItem.findMany({
          where: { id: { in: detailItemIds } },
          select: { id: true, code: true, title: true },
        })
      : [];
    const detailById = new Map(detailRows.map((d) => [Number(d.id), d]));

    const currencyIds = [
      ...new Set(row.items.map((i) => i.currencyRef).filter((v): v is bigint => v != null)),
    ];
    const currencyRows = currencyIds.length
      ? await this.prisma.currencyType.findMany({
          where: { id: { in: currencyIds } },
          select: { id: true, code: true, title: true },
        })
      : [];
    const currencyById = new Map(currencyRows.map((c) => [Number(c.id), c]));

    const chainOfMoein = (m: { parentRef: bigint | null }) => {
      const ledger = m.parentRef != null ? nodeById.get(Number(m.parentRef)) : undefined;
      const group = ledger?.parentRef != null ? nodeById.get(Number(ledger.parentRef)) : undefined;
      return {
        ledgerCode: ledger?.code ?? "",
        ledgerTitle: ledger?.title ?? "",
        groupCode: group?.code ?? "",
        groupTitle: group?.title ?? "",
      };
    };

    return {
      item: {
        id: bigToNum(row.id),
        voucherNo: bigToNum(row.voucherNo),
        serialNo: bigToNum(row.serialNo),
        subNo: row.subNo == null ? null : bigToNum(row.subNo),
        voucherTypeRef: bigToNum(row.voucherTypeRef),
        voucherTypeCode: type?.code ?? "",
        voucherTypeTitle: type?.title ?? "",
        voucherTypeLatin: type?.latinTitle ?? "",
        nature: row.nature,
        status: row.status,
        date: row.date,
        description: row.description,
        description2: row.description2 ?? "",
        creatorName: creatorUser?.fullName || creatorUser?.username || row.creator,
        items: row.items.map((i) => {
          const m = moeinById.get(Number(i.moeinRef));
          const chain = m ? chainOfMoein(m) : { ledgerCode: "", ledgerTitle: "", groupCode: "", groupTitle: "" };
          return {
            id: bigToNum(i.id),
            rowIndex: i.rowIndex,
            moeinRef: bigToNum(i.moeinRef),
            moeinCode: m?.code ?? "",
            moeinTitle: m?.title ?? "",
            ledgerCode: chain.ledgerCode,
            ledgerTitle: chain.ledgerTitle,
            groupCode: chain.groupCode,
            groupTitle: chain.groupTitle,
            description: i.description,
            debit: numericString(i.debit),
            credit: numericString(i.credit),
            trackDate: i.trackDate ?? "",
            trackNumber: i.trackNumber ?? "",
            currencyRef: i.currencyRef == null ? null : bigToNum(i.currencyRef),
            currencyCode: i.currencyRef == null ? "" : currencyById.get(bigToNum(i.currencyRef))?.code ?? "",
            currencyTitle: i.currencyRef == null ? "" : currencyById.get(bigToNum(i.currencyRef))?.title ?? "",
            currencyValue: i.currencyValue ?? "",
            currencyRate: i.currencyRate ?? "",
            details: i.details.map((d) => ({
              levelIndex: d.levelIndex,
              detailItemRef: bigToNum(d.detailItemRef),
              detailCode: detailById.get(bigToNum(d.detailItemRef))?.code ?? "",
              detailTitle: detailById.get(bigToNum(d.detailItemRef))?.title ?? "",
            })),
          };
        }),
      },
    };
  }

  /* ------------------------------ create ------------------------------ */

  async create(dto: SaveVoucherDto) {
    const structureRef = await this.resolveStructureRef(dto.structureId);
    const anchors = await resolveDetailTypeChain(this.prisma, structureRef);
    await this.assertTypeIssuable(dto.voucherTypeRef);
    await this.assertStatusIssuable(dto.status);

    /* شماره‌گذاری — سرور تک‌مرجع: خالی ⇒ MAX+۱؛ دستیِ تکراری ⇒ ۴۰۹ */
    let voucherNo = BigInt(dto.voucherNo ?? 0);
    if (voucherNo <= 0n) {
      const agg = await this.prisma.voucher.aggregate({
        where: {
          voucherTypeRef: BigInt(dto.voucherTypeRef),
          businessStructureRef: structureRef,
        },
        _max: { voucherNo: true },
      });
      voucherNo = (agg._max.voucherNo ?? 0n) + 1n;
    } else {
      await this.assertVoucherNoFree(voucherNo, BigInt(dto.voucherTypeRef), structureRef);
    }
    let serialNo = BigInt(dto.serialNo ?? 0);
    if (serialNo <= 0n) {
      const agg = await this.prisma.voucher.aggregate({
        where: { businessStructureRef: structureRef },
        _max: { serialNo: true },
      });
      serialNo = (agg._max.serialNo ?? 0n) + 1n;
    }

    const normItems = await this.normalizeItems(dto.items);

    /* §16 — شناسهٔ دستی برای «هر» ردیف عملیاتی: اقلام و تفصیلی‌های ردیف‌ها
       هم از IDGeneration شناسه می‌گیرند (Prisma در create تو در تو هم id می‌خواهد). */
    const itemRows = [];
    for (let idx = 0; idx < normItems.length; idx++) {
      const ni = normItems[idx];
      const itemId = BigInt(await this.idGen.generateNextId("VoucherItem"));
      const detailRows = [];
      for (const d of ni.details) {
        detailRows.push({
          id: BigInt(await this.idGen.generateNextId("VoucherItemDetail")),
          levelIndex: d.levelIndex,
          detailItemRef: d.detailItemRef,
          detailTypeRef: d.detailTypeRef,
          ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef, ...anchors }),
        });
      }
      itemRows.push({
        id: itemId,
        rowIndex: idx + 1,
        moeinRef: ni.moeinRef,
        description: ni.description,
        debit: ni.debit,
        credit: ni.credit,
        trackDate: ni.trackDate || null,
        trackNumber: ni.trackNumber || null,
        currencyRef: ni.currencyRef,
        currencyValue: ni.currencyValue,
        currencyRate: ni.currencyRate,
        ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef, ...anchors }),
        details: { create: detailRows },
      });
    }

    const newId = await this.idGen.generateNextId("Voucher");
    const created = await this.prisma.voucher.create({
      data: {
        id: BigInt(newId),
        voucherNo,
        serialNo,
        subNo: dto.subNo != null && dto.subNo > 0 ? BigInt(dto.subNo) : null,
        voucherTypeRef: BigInt(dto.voucherTypeRef),
        nature: dto.nature,
        status: dto.status ?? 1,
        date: dto.date,
        description: dto.description.trim(),
        description2: dto.description2?.trim() || null,
        ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef, ...anchors }),
        items: { create: itemRows },
      },
    });
    this.logger.log(
      `Voucher created — ID=${created.id} No=${voucherNo} Serial=${serialNo} Items=${normItems.length} (Task 158)`,
    );
    return this.detail(bigToNum(created.id)).then((r) => r.item);
  }

  /* ------------------------------ update ------------------------------ */

  async update(id: number, dto: SaveVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سند با شناسهٔ «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    /* t178 — قفل نرم سند در جریان رسیدگی (FR-06): PUT سندِ دارای نمونهٔ running ممنوع */
    await this.assertNotWorkflowLocked(id);
    const structureRef = await this.resolveStructureRef(dto.structureId ?? Number(existing.businessStructureRef));
    const anchors = await resolveDetailTypeChain(this.prisma, structureRef);
    await this.assertTypeIssuable(dto.voucherTypeRef);
    await this.assertStatusIssuable(dto.status);

    /* شماره سند: خالی ⇒ حفظ شمارهٔ فعلی؛ دستیِ متفاوت ⇒ یکتایی (۴۰۹) */
    let voucherNo = existing.voucherNo;
    if (dto.voucherNo != null && dto.voucherNo > 0 && BigInt(dto.voucherNo) !== existing.voucherNo) {
      await this.assertVoucherNoFree(BigInt(dto.voucherNo), BigInt(dto.voucherTypeRef), structureRef, existing.id);
      voucherNo = BigInt(dto.voucherNo);
    }
    /* تغییر نوع سند ⇒ بازتخصیص خودکار شماره سند در همان نوع */
    if (BigInt(dto.voucherTypeRef) !== existing.voucherTypeRef && (dto.voucherNo ?? 0) === 0) {
      const agg = await this.prisma.voucher.aggregate({
        where: {
          voucherTypeRef: BigInt(dto.voucherTypeRef),
          businessStructureRef: structureRef,
          id: { not: existing.id },
        },
        _max: { voucherNo: true },
      });
      voucherNo = (agg._max.voucherNo ?? 0n) + 1n;
    }
    const serialNo =
      dto.serialNo != null && dto.serialNo > 0 ? BigInt(dto.serialNo) : existing.serialNo;

    const normItems = await this.normalizeItems(dto.items);

    /* §16 — شناسهٔ دستی اقلام/تفصیلی‌ها در بازنویسی کامل ردیف‌ها */
    const itemRows = [];
    for (let idx = 0; idx < normItems.length; idx++) {
      const ni = normItems[idx];
      const itemId = BigInt(await this.idGen.generateNextId("VoucherItem"));
      const detailRows = [];
      for (const d of ni.details) {
        detailRows.push({
          id: BigInt(await this.idGen.generateNextId("VoucherItemDetail")),
          levelIndex: d.levelIndex,
          detailItemRef: d.detailItemRef,
          detailTypeRef: d.detailTypeRef,
          ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef, ...anchors }),
        });
      }
      itemRows.push({
        id: itemId,
        rowIndex: idx + 1,
        moeinRef: ni.moeinRef,
        description: ni.description,
        debit: ni.debit,
        credit: ni.credit,
        trackDate: ni.trackDate || null,
        trackNumber: ni.trackNumber || null,
        currencyRef: ni.currencyRef,
        currencyValue: ni.currencyValue,
        currencyRate: ni.currencyRate,
        ...appBaseOnCreate({ userId: SYSTEM_ACTOR.userId, nodeId: structureRef, ...anchors }),
        details: { create: detailRows },
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.voucherItem.deleteMany({ where: { voucherRef: existing.id } });
      await tx.voucher.update({
        where: { id: existing.id },
        data: {
          voucherNo,
          serialNo,
          subNo: dto.subNo != null && dto.subNo > 0 ? BigInt(dto.subNo) : null,
          voucherTypeRef: BigInt(dto.voucherTypeRef),
          nature: dto.nature,
          status: dto.status ?? existing.status,
          date: dto.date,
          description: dto.description.trim(),
          description2: dto.description2?.trim() || null,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
          items: { create: itemRows },
        },
      });
    });
    this.logger.log(`Voucher updated — ID=${id} No=${voucherNo} Items=${normItems.length} (Task 158)`);
    return this.detail(id).then((r) => r.item);
  }

  /* ------------------------------ remove ------------------------------ */

  async remove(id: number) {
    const existing = await this.prisma.voucher.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سند با شناسهٔ «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    /* t178 — قفل نرم سند در جریان رسیدگی (FR-06): حذف سندِ دارای نمونهٔ running ممنوع */
    await this.assertNotWorkflowLocked(id);
    /* حذف اتمی: تفصیلی‌ها ← اقلام ← سند (ترتیب فرزند→والد) */
    await this.prisma.$transaction(async (tx) => {
      const items = await tx.voucherItem.findMany({
        where: { voucherRef: existing.id },
        select: { id: true },
      });
      for (const it of items) {
        await tx.voucherItemDetail.deleteMany({ where: { itemRef: it.id } });
      }
      await tx.voucherItem.deleteMany({ where: { voucherRef: existing.id } });
      await tx.voucher.delete({ where: { id: existing.id } });
    });
    this.logger.log(`Voucher deleted — ID=${id} No=${existing.voucherNo} (Task 158)`);
    return { ok: true };
  }

  /* ---------------------------- t178 — پل گردش کار ---------------------------- */

  /** قفل نرم (FR-06): سند دارای نمونهٔ running ویرایش/حذف نمی‌شود — ۴۲۳.
   *  دسترس‌ناپذیری workflow-service = باز (fail-open مستند در voucher.service). */
  private async assertNotWorkflowLocked(id: number) {
    const r = await this.wfClient.call<{ locked: boolean; instanceId: number | null }>(
      this.wfBase,
      `/workflow-instances/lock?entityType=voucher&entityId=${id}`,
      { timeoutMs: 1200 },
    );
    if (r.ok && r.data?.locked) {
      throw new HttpException(
        {
          statusCode: 423,
          message: "سند در جریان رسیدگی گردش کار است — ویرایش/حذف مجاز نیست (قفل نرم FR-06)",
          messageKey: "common.error",
        },
        423,
      );
    }
  }

  /** وضعیت واقعی سند — منبع حقیقت گلوگاه ورود موتور (D-3). */
  async internalStatus(id: number) {
    const v = await this.prisma.voucher.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, voucherNo: true, status: true },
    });
    if (!v) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سند با شناسهٔ «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    return { id: Number(v.id), voucherNo: String(v.voucherNo), status: v.status };
  }

  /**
   * نوشتن وضعیت فقط توسط موتور (D-4/D-5 — t178): گارد EngineKeyGuard روی مسیر
   * controller است؛ ۱=ثبت اولیه (رد) · ۳/۴=گرهٔ پایان · ۵=بازگشت به گلوگاه ورود.
   * هیچ دادهٔ دیگری اینجا دست نمی‌خورد.
   */
  async setEngineStatus(id: number, dto: EngineStatusDto) {
    if (!ENGINE_STATUSES.has(dto.status)) {
      throw new BadRequestException({
        statusCode: 422,
        message: `وضعیت ${dto.status} از مسیر موتور نوشتنی نیست — مجاز: ۱/۳/۴/۵`,
        messageKey: "common.error",
      });
    }
    const existing = await this.prisma.voucher.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `سند با شناسهٔ «${id}» یافت نشد`,
        messageKey: "common.error",
      });
    }
    const updated = await this.prisma.voucher.update({
      where: { id: existing.id },
      data: {
        status: dto.status,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    this.logger.log(
      `Voucher engine-status — ID=${id} status=${dto.status} (t178 — وضعیت پایانی گردش کار D-4/D-5)`,
    );
    return { id: Number(updated.id), voucherNo: String(updated.voucherNo), status: updated.status };
  }

  /* ---------------------------- validators ---------------------------- */

  private async resolveStructureRef(structureId?: number): Promise<bigint> {
    if (structureId == null || !Number.isFinite(structureId) || structureId <= 0) {
      return HEAD_OFFICE_NODE_ID;
    }
    const node = await this.prisma.businessStructure.findUnique({
      where: { id: BigInt(structureId) },
      select: { id: true, isActive: true, title: true },
    });
    if (!node || !node.isActive) {
      throw new BadRequestException({
        statusCode: 422,
        message: `ساختار سازمانی با شناسهٔ ${structureId} یافت نشد یا غیرفعال است.`,
        messageKey: "common.error",
      });
    }
    return BigInt(structureId);
  }

  /** نوع سند باید موجود، فعال و غیرسیستمی باشد (فرمان مالک Task 158). */
  private async assertTypeIssuable(voucherTypeRef: number) {
    const type = await this.prisma.voucherType.findUnique({
      where: { id: BigInt(voucherTypeRef) },
      select: { code: true, title: true, isActive: true, isSystem: true },
    });
    if (!type) {
      throw new BadRequestException({
        statusCode: 422,
        message: `نوع سند با شناسهٔ «${voucherTypeRef}» یافت نشد.`,
        messageKey: "common.error",
      });
    }
    if (!type.isActive) {
      throw new BadRequestException({
        statusCode: 422,
        message: `نوع سند «${type.title}» غیرفعال است و قابل انتخاب نیست.`,
        messageKey: "common.error",
      });
    }
    if (type.isSystem) {
      throw new BadRequestException({
        statusCode: 422,
        message: `نوع سند «${type.title}» سیستمی است و در فرم صدور سند نمایش داده نمی‌شود.`,
        messageKey: "common.error",
      });
    }
  }

  /** وضعیت ۳/۴ فقط پس از تایید و فقط از مسیر موتور — ۵=تایید کاربر مجاز است (D-3). */
  private async assertStatusIssuable(status?: number) {
    if (status != null && !ISSUABLE_STATUSES.has(status)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "وضعیت «تاییدشده/دائمی» فقط از مسیر موتور گردش کار قابل تنظیم است.",
        messageKey: "common.error",
      });
    }
  }

  private async assertVoucherNoFree(
    voucherNo: bigint,
    voucherTypeRef: bigint,
    structureRef: bigint,
    excludeId?: bigint,
  ) {
    const clash = await this.prisma.voucher.findFirst({
      where: {
        voucherNo,
        voucherTypeRef,
        businessStructureRef: structureRef,
        ...(excludeId != null ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `شماره سند «${voucherNo}» برای این نوع سند قبلاً ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** نرمال‌سازی + اعتبارسنجی کامل اقلام (موعین/مبلغ‌ها/تفصیلی‌های متصل). */
  private async normalizeItems(items: SaveVoucherItemDto[]) {
    if (!items.length) {
      throw new BadRequestException({
        statusCode: 422,
        message: "سند حداقل یک ردیف اقلام نیاز دارد.",
        messageKey: "common.error",
      });
    }

    const moeinIds = [...new Set(items.map((i) => i.moeinRef))];
    const moeinRows = await this.prisma.accountNode.findMany({
      where: { id: { in: moeinIds.map((v) => BigInt(v)) } },
      select: { id: true, level: true, code: true, title: true },
    });
    const moeinById = new Map(moeinRows.map((m) => [Number(m.id), m]));

    /* سطوح تفصیلیِ همهٔ معین‌های درگیر — قاعدهٔ قفل 🔒 فرم */
    const levelRows = await this.prisma.accountDetailLevel.findMany({
      where: { accountNodeRef: { in: moeinIds.map((v) => BigInt(v)) } },
      include: { types: { select: { detailTypeRef: true } } },
    });
    /** کلید: `${moeinRef}:${levelIndex}` → مجموعهٔ نوع‌تفصیل‌های متصل */
    const levelKey = (moein: number, level: number) => `${moein}:${level}`;
    const linkedTypes = new Map<string, Set<number>>();
    for (const lv of levelRows) {
      linkedTypes.set(
        levelKey(Number(lv.accountNodeRef), lv.levelIndex),
        new Set(lv.types.map((t) => Number(t.detailTypeRef))),
      );
    }

    const detailIds = [...new Set(items.flatMap((i) => (i.details ?? []).map((d) => d.detailItemRef)))];
    const detailRows = detailIds.length
      ? await this.prisma.detailItem.findMany({
          where: { id: { in: detailIds.map((v) => BigInt(v)) } },
          select: { id: true, detailTypeRef: true, code: true, title: true },
        })
      : [];
    const detailById = new Map(detailRows.map((d) => [Number(d.id), d]));

    const currencyIds = [...new Set(items.map((i) => i.currencyRef).filter((v): v is number => v != null))];
    const currencyRows = currencyIds.length
      ? await this.prisma.currencyType.findMany({
          where: { id: { in: currencyIds.map((v) => BigInt(v)) } },
          select: { id: true },
        })
      : [];
    const currencySet = new Set(currencyRows.map((c) => Number(c.id)));

    return items.map((raw, idx) => {
      const moein = moeinById.get(raw.moeinRef);
      if (!moein || moein.level !== 3) {
        throw new BadRequestException({
          statusCode: 422,
          message: `ردیف ${idx + 1}: حساب معین معتبر نیست؛ کدینگ باید در سطح «معین» انتخاب شود.`,
          messageKey: "common.error",
        });
      }
      const description = raw.description?.trim() ?? "";
      if (description === "") {
        throw new BadRequestException({
          statusCode: 422,
          message: `ردیف ${idx + 1}: شرح ردیف الزامی است.`,
          messageKey: "common.error",
        });
      }
      const debit = numericString(raw.debit);
      const credit = numericString(raw.credit);
      const debitPos = Number(debit) > 0;
      const creditPos = Number(credit) > 0;
      if (debitPos && creditPos) {
        throw new BadRequestException({
          statusCode: 422,
          message: `ردیف ${idx + 1}: فقط یکی از بدهکار یا بستانکار باید مقدار داشته باشد.`,
          messageKey: "common.error",
        });
      }
      if (raw.currencyRef != null && !currencySet.has(raw.currencyRef)) {
        throw new BadRequestException({
          statusCode: 422,
          message: `ردیف ${idx + 1}: ارز انتخاب‌شده در فرم نوع ارز یافت نشد.`,
          messageKey: "common.error",
        });
      }

      /* تفصیلی‌ها — فقط از انواع متصل‌شده به همان سطحِ همان معین (۴۲۲) */
      const seenLevels = new Set<number>();
      const details = (raw.details ?? []).map((d) => {
        if (seenLevels.has(d.levelIndex)) {
          throw new BadRequestException({
            statusCode: 422,
            message: `ردیف ${idx + 1}: برای تفصیلی ${d.levelIndex} بیش از یک مقدار انتخاب شده است.`,
            messageKey: "common.error",
          });
        }
        seenLevels.add(d.levelIndex);
        const di = detailById.get(d.detailItemRef);
        if (!di) {
          throw new BadRequestException({
            statusCode: 422,
            message: `ردیف ${idx + 1}: تفصیلی انتخابی (سطح ${d.levelIndex}) یافت نشد.`,
            messageKey: "common.error",
          });
        }
        const allowed = linkedTypes.get(levelKey(raw.moeinRef, d.levelIndex));
        if (!allowed || !allowed.has(Number(di.detailTypeRef))) {
          throw new BadRequestException({
            statusCode: 422,
            message: `ردیف ${idx + 1}: تفصیلی «${di.title}» به حساب معین «${moein.title}» در سطح ${d.levelIndex} متصل نیست و قابل انتخاب نیست.`,
            messageKey: "common.error",
          });
        }
        return {
          levelIndex: d.levelIndex,
          detailItemRef: BigInt(d.detailItemRef),
          detailTypeRef: BigInt(di.detailTypeRef),
        };
      });

      return {
        moeinRef: BigInt(raw.moeinRef),
        description,
        debit: debitPos ? debit : "0",
        credit: creditPos ? credit : "0",
        trackDate: raw.trackDate?.trim() || "",
        trackNumber: raw.trackNumber?.trim() || "",
        currencyRef: raw.currencyRef != null ? BigInt(raw.currencyRef) : null,
        currencyValue: raw.currencyValue?.trim() || null,
        currencyRate: raw.currencyRate?.trim() || null,
        details,
      };
    });
  }
}
