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
  baseDataScopeWhere,
  SYSTEM_ACTOR,
  appBaseOnUpdate,
  type AppBaseScope,
} from "../../../_shared/app-base-entity";
import { UpdateDetailTypeNumberingDto } from "./detail-type-numbering.dto";
import {
  allocateDetailTypeNumbering,
  type DetailTypeResidency,
} from "./allocate";
import { sortDetailTypeRows } from "../detail-type/canonical-detail-types";

/**
 * DetailTypeNumberingService — Task 131 (درخواست مالک): فرم «شماره گذاری
 * تفصیلی ها» در نرم‌افزار «حسابداری» → زیرمنوی «اطلاعات پایه» با کامپوننت
 * MainDataGrid.
 *
 * قواعد مالک که این سرویس پیاده‌شان می‌کند:
 *   ۱. «هر نوع تفصیلی که در فرم نوع تفصیلی ایجاد شود باید بصورت خودکار در
 *      این فرم مشاهده شود» ⇒ list() هر نوع تفصیلِ دیده‌شده در محدوده که
 *      ردیف شماره‌گذاری ندارد، خودکار backfill می‌کند (تخصیص پیوستهٔ
 *      ۱۰۰۰تایی — allocate.ts)؛ DetailTypeService.create هم بلافاصله پس
 *      از ثبت، ردیف را می‌سازد (هر دو مسیر idempotent‌اند).
 *   ۲. «شماره ها نباید با شماره های تفصیلی دیگر تداخل داشته باشند» ⇒
 *      هر ذخیرهٔ دستی بازه، با همهٔ ردیف‌های دیگرِ همان گرهٔ ساختار سنجیده
 *      می‌شود؛ تداخل = ۴۰۹ با پیام فارسیِ روشن.
 *   ۳. ستون‌های «خودکار» و «شرکت» (عین تصویر مالک) پرچم‌های ذخیره‌شدهٔ
 *      ردیف‌اند — پیش‌فرض تیک/خالی.
 *
 * دامنهٔ یکتایی بازه‌ها (تفسیر اعلامی §0.6): هر گرهٔ ساختار سازمانی فضای
 * شماره‌گذاری مستقل خودش را دارد (ردیف‌های دفتر مرکزی و شرکت‌ها تداخلشان
 * سنجیده نمی‌شود) — عین قرارداد اقامت AppBase (baseDataScopeWhere).
 */
@Injectable()
export class DetailTypeNumberingService {
  private readonly logger = new Logger(DetailTypeNumberingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /**
   * فهرست شماره‌گذاری تفصیل‌ها — join با DetailType + backfill خودکار
   * (قاعدهٔ ۱ بالا). با structureId ⇒ قرارداد واحد اشتراک داده
   * (baseDataScopeWhere)؛ بدون آن ⇒ خواندن سراسری (سازگاری قبلی).
   */
  async list(q: { structureId?: number; headOfficeShares?: boolean } = {}) {
    if (q.structureId != null && Number.isFinite(q.structureId) && q.structureId > 0) {
      const structureRef = BigInt(q.structureId);
      const node = await this.prisma.businessStructure.findUnique({
        where: { id: structureRef },
        select: { id: true, parentRef: true, businessStructureType: true },
      });
      const scope: AppBaseScope = { nodeId: structureRef };
      if (node) {
        // زنجیرهٔ ارث برای قرارداد اشتراک (عین resolveDetailTypeChain)
        let companyRef: bigint | null = null;
        let branchRef: bigint | null = null;
        let agencyRef: bigint | null = null;
        let shopRef: bigint | null = null;
        let cur: {
          id: bigint;
          parentRef: bigint;
          businessStructureType: number | null;
        } | null = node;
        let guard = 0;
        while (cur && guard++ <= 8) {
          const id = cur.id;
          const t = cur.businessStructureType;
          if (t === 5 && shopRef == null) shopRef = id;
          else if (t === 4 && agencyRef == null) agencyRef = id;
          else if (t === 3 && branchRef == null) branchRef = id;
          else if ((t === 1 || t === 2) && companyRef == null) companyRef = id;
          cur = cur.parentRef > 0n
            ? await this.prisma.businessStructure.findUnique({
                where: { id: cur.parentRef },
                select: { id: true, parentRef: true, businessStructureType: true },
              })
            : null;
        }
        scope.companyRef = companyRef;
        scope.branchRef = branchRef;
        scope.agencyRef = agencyRef;
        scope.shopRef = shopRef;
      }
      return this.listScoped(scope, q.headOfficeShares === true);
    }
    return this.listScoped(null, false);
  }

  private async listScoped(
    scope: AppBaseScope | null,
    headOfficeShares: boolean,
  ) {
    const where = scope ? baseDataScopeWhere(scope, headOfficeShares) : undefined;
    const types = sortDetailTypeRows(
      await this.prisma.detailType.findMany({ where }),
    );
    /* backfill خودکار — هر نوع تفصیلِ دیده‌شده بدون ردیف، تخصیص می‌گیرد
       (به ترتیب عددی کد تا بازه‌ها پیوسته و مطابق تصویر مالک باشند) */
    let backfilled = 0;
    for (const dt of types) {
      const exists = await this.prisma.detailTypeNumbering.findFirst({
        where: { detailTypeRef: dt.id, businessStructureRef: dt.businessStructureRef },
        select: { id: true },
      });
      if (exists) continue;
      const residency: DetailTypeResidency = {
        id: dt.id,
        businessStructureRef: dt.businessStructureRef,
        companyRef: dt.companyRef,
        branchRef: dt.branchRef,
        agencyRef: dt.agencyRef,
        shopRef: dt.shopRef,
      };
      const created = await allocateDetailTypeNumbering(
        this.prisma,
        this.idGen,
        residency,
        SYSTEM_ACTOR,
      );
      if (created) backfilled++;
    }
    if (backfilled > 0) {
      this.logger.log(
        `DetailTypeNumbering backfill: ${backfilled} row(s) auto-allocated (Task 131 — قاعدهٔ خودکار مالک)`,
      );
    }

    const rows = await this.prisma.detailTypeNumbering.findMany({ where });
    const typeMap = new Map(types.map((t) => [t.id, t]));
    const items = rows
      .map((r) => {
        const dt = typeMap.get(r.detailTypeRef);
        if (!dt) return null; // نوع تفصیل خارج از محدودهٔ دیده‌شده — نمایش نمی‌دهیم
        return this.toDto(r, dt);
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    /* ترتیب نمایش = عددی-آگاهِ کد تفصیل (عین تصویر مالک: ۱..۲۱) */
    items.sort((a, b) => {
      const key = (code: string): [number, string] => {
        const m = /^(\d+)$/.exec(code.trim());
        return m ? [Number(m[1]), ""] : [Number.MAX_SAFE_INTEGER, code];
      };
      const [na, sa] = key(a.code);
      const [nb, sb] = key(b.code);
      return na - nb || sa.localeCompare(sb);
    });
    return { items };
  }

  /**
   * ویرایش بازه/پرچم‌های یک ردیف — قاعدهٔ ۲ مالک: تداخل بازه با هر ردیف
   * دیگرِ همان گره رد می‌شود (۴۰۹)؛ شروع ≤ پایان و اعداد صحیح مثبتِ امن
   * الزامی است (۴۲۲).
   */
  async update(id: number, dto: UpdateDetailTypeNumberingDto) {
    const startNumber = BigInt(dto.startNumber);
    const endNumber = BigInt(dto.endNumber);
    if (!Number.isSafeInteger(dto.startNumber) || !Number.isSafeInteger(dto.endNumber)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "شماره‌ها باید عدد صحیح مثبت باشند.",
        messageKey: "common.error",
      });
    }
    if (startNumber > endNumber) {
      throw new BadRequestException({
        statusCode: 422,
        message: "شماره شروع نمی‌تواند بزرگ‌تر از شماره پایان باشد.",
        messageKey: "common.error",
      });
    }

    const existing = await this.prisma.detailTypeNumbering.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `ردیف شماره‌گذاری با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }

    /* قاعدهٔ تداخل — بازهٔ [شروع، پایان] با هیچ ردیف دیگرِ همان گره مجاز
       نیست هم‌پوشانی داشته باشد (شرط هم‌پوشانی دو بازه: a.start ≤ b.end
       و a.end ≥ b.start) */
    const clash = await this.prisma.detailTypeNumbering.findFirst({
      where: {
        businessStructureRef: existing.businessStructureRef,
        id: { not: existing.id },
        startNumber: { lte: endNumber },
        endNumber: { gte: startNumber },
      },
      select: { id: true, startNumber: true, endNumber: true, detailTypeRef: true },
    });
    if (clash) {
      const clashType = await this.prisma.detailType.findUnique({
        where: { id: clash.detailTypeRef },
        select: { code: true, title: true },
      });
      throw new ConflictException({
        statusCode: 409,
        message: `بازهٔ شماره‌ها با نوع تفصیل «${clashType?.code ?? "?"} - ${clashType?.title ?? "?"}» تداخل دارد (بازهٔ ثبت‌شده: ${clash.startNumber} تا ${clash.endNumber}).`,
        messageKey: "common.error",
      });
    }

    const row = await this.prisma.detailTypeNumbering.update({
      where: { id: existing.id },
      data: {
        startNumber,
        endNumber,
        isAutomatic: dto.isAutomatic === true,
        isCompany: dto.isCompany === true,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
      },
    });
    const dt = await this.prisma.detailType.findUnique({
      where: { id: row.detailTypeRef },
      select: {
        id: true,
        code: true,
        title: true,
        businessStructureRef: true,
        companyRef: true,
        branchRef: true,
        agencyRef: true,
        shopRef: true,
      },
    });
    return this.toDto(row, dt ?? null);
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(
    r: {
      id: bigint;
      detailTypeRef: bigint;
      startNumber: bigint;
      endNumber: bigint;
      isAutomatic: boolean;
      isCompany: boolean;
      version: number;
      businessStructureRef: bigint;
    },
    dt: {
      id: bigint;
      code: string;
      title: string;
    } | null,
  ) {
    return {
      id: Number(r.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      detailTypeRef: Number(r.detailTypeRef),
      code: dt?.code ?? "",
      title: dt?.title ?? "",
      startNumber: Number(r.startNumber),
      endNumber: Number(r.endNumber),
      isAutomatic: r.isAutomatic,
      isCompany: r.isCompany,
      structureId: Number(r.businessStructureRef),
      version: r.version,
    };
  }
}
