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
  baseDataScopeWhere,
  HEAD_OFFICE_NODE_ID,
  SYSTEM_ACTOR,
  type AppBaseScope,
} from "../../../_shared/app-base-entity";
import { UpsertContractDto } from "./contract.dto";
import {
  DetailCodeAssignmentService,
  type NumberingInfo,
} from "../detail-code-assignment/detail-code-assignment.service";
import { resolveDetailTypeChain } from "../detail-type/canonical-detail-types";

/**
 * ContractService — Task 148 (درخواست مالک): فرم «قرارداد جدید» در نرم‌افزار
 * «حسابداری» ← زیرمنوی «اطلاعات تفصیلی ها».
 *
 * قرارداد یک «حساب تفصیلی» است (نوع «قرارداد» — کد مرجع ۹ از فرم نوع تفصیلی)
 * + پروفایل اختصاصی. هر ثبت/ویرایش دو ردیف هم‌تراز می‌سازد (تراکنش اتمی):
 *   · DetailItem — کد تفصیلی/عنوان تفصیلی/شرح/فعال (در فهرست «ایجاد تفصیلی
 *     ها» هم دیده می‌شود؛ فضای شماره‌گذاری مشترک همهٔ تفصیلی‌ها).
 *   · Contract   — شماره/تاریخ/پروژه/محل انجام کار/طرف قرارداد/موضوع‌ها/
 *     تاریخ شروع-خاتمه/مدت/مبلغ/شرح (۲)/عنوان تفصیلی (۲).
 *
 * کد تفصیلی — «دقیقاً همانند پروژه» (فرمان مالک): تخصیص با «متد اختصاصی
 * تخصیص کد تفصیل» (DetailCodeAssignmentService — Task 146؛ formKey "contract"
 * ← نوع تفصیل «قرارداد» کد ۹) بر پایهٔ تنظیمات ساختار کسب و کار (گرهٔ فعال
 * OrgScope) و ردیف شماره‌گذاری همان نوع (ستون‌های شماره شروع/شماره پایان —
 * فرم Task 131):
 *   · ثبت تازه با کد تفصیلی خالی و شماره‌گذاری خودکار ⇒ نخستین عدد
 *     بلااستفادهٔ بازه — تخصیص نهایی همیشه سمت سرور است (تک‌مرجع).
 *   · شماره‌گذاری دستی ⇒ کد دستی با قوانین عددی/درون‌بازه/یکتا.
 *
 * طرف قرارداد — اجباری؛ ارجاع به جدول طرف حساب (Party) که از فرم «طرف حساب
 * جدید» تغذیه می‌شود (دراپ‌داون فرم با ستون‌های کد تفصیلی/نام/ماهیت).
 * پروژه — اختیاری؛ ارجاع به Project (فرم «تعریف پروژه» — Task 147).
 *
 * زنجیرهٔ اعتبارسنجی سرور (خط دفاعی نهایی — فرانت همان قوانین را پیش از
 * ارسال با پیام‌های دقیق مالک چک می‌کند): ۴۲۲ فیلدی، ۴۰۹ تکراری، ۴۰۴ ناموجود.
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** تاریخ میلادی ISO معتبر ('YYYY-MM-DD' واقعی — ماه/روز در بازهٔ درست). */
function isValidISODate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const probe = new Date(Date.UTC(y, mo - 1, d));
  return (
    probe.getUTCFullYear() === y &&
    probe.getUTCMonth() === mo - 1 &&
    probe.getUTCDate() === d
  );
}

/** ترتیب عددی-آگاهِ شماره («۱..۲۱» درست مرتب شود، شماره‌های حرفی آخر). */
function sortNumericAware<T extends { number: string }>(rows: T[]): T[] {
  const key = (v: string): [number, string] => {
    const m = /^(\d+)$/.exec(v.trim());
    return m ? [Number(m[1]), ""] : [Number.MAX_SAFE_INTEGER, v];
  };
  return [...rows].sort((a, b) => {
    const [na, sa] = key(a.number);
    const [nb, sb] = key(b.number);
    return na - nb || sa.localeCompare(sb);
  });
}

/** DTO خواندن قرارداد (join دستی DetailItem + Party + Project). */
export interface ContractDto {
  id: number;
  detailItemId: number;
  number: string;
  date: string;
  projectRef: number | null;
  projectTitle: string;
  projectDetailCode: string;
  partyRef: number;
  partyName: string;
  partyTafsiliCode: number;
  partyNature: string;
  workLocation: string;
  subject: string;
  subject2: string;
  detailCode: string;
  typeCode: string;
  typeTitle: string;
  title: string;
  title2: string;
  startDate: string;
  endDate: string;
  durationDays: number | null;
  amount: string;
  description: string;
  description2: string;
  isActive: boolean;
  version: number;
  structureId: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
    private readonly assignment: DetailCodeAssignmentService,
  ) {}

  /* -------------------------------- read --------------------------------- */

  /**
   * فهرست قراردادها — Task 122 (قرارداد واحد اشتراک داده): با structureId ⇒
   * ردیف‌های گرهٔ فعال + در صورت اشتراک (headOfficeShares) دفتر مرکزی؛
   * بدون پارامتر ⇒ دفتر مرکزی. ترتیب: عددی-آگاهِ شماره قرارداد.
   */
  async list(q: { structureId?: number; headOfficeShares?: boolean } = {}) {
    const scope = await this.resolveReadScope(q.structureId);
    const rows = await this.prisma.contract.findMany({
      where: baseDataScopeWhere(scope, q.headOfficeShares === true),
    });
    /* join دستی DetailItem + نوع تفصیل + Party + Project (بدون relation در اسکیما) */
    const itemRefs = rows.map((r) => r.detailItemRef);
    const items = await this.prisma.detailItem.findMany({
      where: { id: { in: itemRefs } },
      select: {
        id: true,
        detailTypeRef: true,
        code: true,
        title: true,
        description: true,
        isActive: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const typeIds = [...new Set(items.map((i) => i.detailTypeRef))];
    const types = await this.prisma.detailType.findMany({
      where: { id: { in: typeIds } },
      select: { id: true, code: true, title: true },
    });
    const typeMap = new Map(types.map((t) => [t.id, t]));
    /* طرف حساب‌ها — نام/کد تفصیلی/ماهیت برای دراپ‌داون و گرید */
    const partyRefs = [...new Set(rows.map((r) => r.partyRef))];
    const parties = await this.prisma.party.findMany({
      where: { id: { in: partyRefs } },
      select: { id: true, name: true, lastName: true, tafsiliCode: true, nature: true },
    });
    const partyMap = new Map(parties.map((p) => [p.id, p]));
    /* پروژه‌ها — عنوان + کد تفصیلی ردیف تفصیلیِ پروژه */
    const projectRefs = [
      ...new Set(rows.map((r) => r.projectRef).filter((x): x is bigint => x != null)),
    ];
    const projects = await this.prisma.project.findMany({
      where: { id: { in: projectRefs } },
      select: { id: true, detailItemRef: true },
    });
    const projectItemRefs = projects.map((p) => p.detailItemRef);
    const projectItems = await this.prisma.detailItem.findMany({
      where: { id: { in: projectItemRefs } },
      select: { id: true, title: true, code: true },
    });
    const projectItemMap = new Map(projectItems.map((i) => [i.id, i]));
    const projectMap = new Map(
      projects.map((p) => {
        const it = projectItemMap.get(p.detailItemRef);
        return [p.id, { title: it?.title ?? "", detailCode: it?.code ?? "" }];
      }),
    );
    const joined = rows
      .map((r) => {
        const item = itemMap.get(r.detailItemRef);
        if (!item) return null; // ردیف یتیم — نمایش داده نمی‌شود
        const dt = typeMap.get(item.detailTypeRef);
        const party = partyMap.get(r.partyRef);
        const project = r.projectRef != null ? projectMap.get(r.projectRef) : undefined;
        return this.toDto(r, item, dt?.code ?? "", dt?.title ?? "", party, project);
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return { items: sortNumericAware(joined) };
  }

  /* ------------------------------- mutations ------------------------------ */

  /** ثبت قرارداد — کد تفصیلی از متد اختصاصی (عین پروژه). */
  async create(dto: UpsertContractDto) {
    const target = await this.resolveTargetStructure(dto.structureId);
    const norm = await this.normalizeInput(dto, target.structureRef, null);

    const type = await this.assignment.resolveFormType(
      { canonicalCode: "9", title: "قرارداد" },
      { nodeId: target.structureRef, ...target.chain },
      true,
    );
    const numbering = await this.assignment.ensureNumbering(type);

    /* کد تفصیلی — تخصیص با متد اختصاصی (لایو ایجکس فقط پیشنهاد می‌دهد) */
    let detailCode = norm.detailCode;
    if (detailCode === "") {
      detailCode = await this.assignment.allocateDetailCode({
        formKey: "contract",
        structureRef: target.structureRef,
      });
    } else {
      this.assertDetailCodeFormat(detailCode, numbering, type);
      await this.assertDetailCodeAvailable(detailCode, target.structureRef, null);
    }

    await this.assertTitleAvailable(norm.title, target.structureRef, null, type);
    await this.assertNumberAvailable(norm.number, target.structureRef, null);

    /* ثبت اتمی: DetailItem (تفصیلی) + Contract (پروفایل) */
    const detailItemId = await this.idGen.generateNextId("DetailItem");
    const contractId = await this.idGen.generateNextId("Contract");
    const { item, contract } = await this.prisma.$transaction(async (tx) => {
      const item = await tx.detailItem.create({
        data: {
          id: BigInt(detailItemId),
          detailTypeRef: type.id,
          code: detailCode,
          title: norm.title,
          description: norm.description,
          isActive: norm.isActive,
          ...appBaseOnCreate({
            userId: SYSTEM_ACTOR.userId,
            nodeId: target.structureRef,
            ...target.chain,
          }),
        },
      });
      const contract = await tx.contract.create({
        data: {
          id: BigInt(contractId),
          detailItemRef: item.id,
          number: norm.number,
          date: norm.date,
          projectRef: norm.projectRef,
          partyRef: norm.partyRef,
          workLocation: norm.workLocation,
          subject: norm.subject,
          subject2: norm.subject2,
          title2: norm.title2,
          startDate: norm.startDate,
          endDate: norm.endDate,
          durationDays: norm.durationDays,
          amount: norm.amount,
          description2: norm.description2,
          ...appBaseOnCreate({
            userId: SYSTEM_ACTOR.userId,
            nodeId: target.structureRef,
            ...target.chain,
          }),
        },
      });
      return { item, contract };
    });
    this.logger.log(
      `Contract created — ID=${contractId} Number=${norm.number} DetailCode=${detailCode} Party=${norm.partyRef} Structure=${target.structureRef}`,
    );
    return this.toDetailDto(contract, item, type.code, type.title);
  }

  async update(id: number, dto: UpsertContractDto) {
    const existing = await this.prisma.contract.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `قرارداد با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const item = await this.prisma.detailItem.findUnique({ where: { id: existing.detailItemRef } });
    if (!item) {
      throw new NotFoundException({
        statusCode: 404,
        message: `ردیف تفصیلی قرارداد با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const target = await this.resolveTargetStructure(dto.structureId);
    const norm = await this.normalizeInput(dto, target.structureRef, existing.id);
    const type = await this.assignment.resolveFormType(
      { canonicalCode: "9", title: "قرارداد" },
      { nodeId: target.structureRef, ...target.chain },
      true,
    );
    const numbering = await this.assignment.ensureNumbering(type);

    /* ویرایش: کد تفصیلی همیشه صریح و معتبر می‌ماند (تخصیص خودکار فقط ثبت
       تازه؛ ارسال خالی = حفظ کد فعلی) — عین قرارداد فرم پروژه */
    let detailCode = norm.detailCode === "" ? item.code : norm.detailCode;
    this.assertDetailCodeFormat(detailCode, numbering, type);
    await this.assertDetailCodeAvailable(detailCode, target.structureRef, item.id);
    await this.assertTitleAvailable(norm.title, target.structureRef, item.id, type);
    await this.assertNumberAvailable(norm.number, target.structureRef, existing.id);

    const { updatedItem, updatedContract } = await this.prisma.$transaction(async (tx) => {
      const updatedItem = await tx.detailItem.update({
        where: { id: item.id },
        data: {
          code: detailCode,
          title: norm.title,
          description: norm.description,
          isActive: norm.isActive,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      const updatedContract = await tx.contract.update({
        where: { id: existing.id },
        data: {
          number: norm.number,
          date: norm.date,
          projectRef: norm.projectRef,
          partyRef: norm.partyRef,
          workLocation: norm.workLocation,
          subject: norm.subject,
          subject2: norm.subject2,
          title2: norm.title2,
          startDate: norm.startDate,
          endDate: norm.endDate,
          durationDays: norm.durationDays,
          amount: norm.amount,
          description2: norm.description2,
          ...appBaseOnUpdate(SYSTEM_ACTOR),
        },
      });
      return { updatedItem, updatedContract };
    });
    return this.toDetailDto(updatedContract, updatedItem, type.code, type.title);
  }

  async remove(id: number) {
    const existing = await this.prisma.contract.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `قرارداد با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.contract.delete({ where: { id: existing.id } });
      await tx.detailItem.delete({ where: { id: existing.detailItemRef } });
    });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی ورودی + قوانین فیلدی دقیق مالک + گارد ارجاع‌ها. */
  private async normalizeInput(dto: UpsertContractDto, structureRef: bigint, excludeId: bigint | null) {
    const number = toLatinDigits(String(dto.number ?? "")).replace(/\s+/g, "");
    if (number === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "شماره الزامی است؛ شماره قرارداد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (number.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "شماره حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const date = String(dto.date ?? "").trim();
    if (date === "" || !isValidISODate(date)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "تاریخ الزامی است و باید میلادی و در قالب YYYY-MM-DD باشد.",
        messageKey: "common.error",
      });
    }
    /* طرف قرارداد — اجباری؛ ردیف باید موجود باشد */
    const partyRef = dto.partyRef;
    if (partyRef == null || !Number.isFinite(partyRef) || partyRef <= 0) {
      throw new BadRequestException({
        statusCode: 422,
        message: "طرف قرارداد الزامی است.",
        messageKey: "common.error",
      });
    }
    const party = await this.prisma.party.findUnique({
      where: { id: BigInt(partyRef) },
      select: { id: true },
    });
    if (!party) {
      throw new NotFoundException({
        statusCode: 404,
        message: `طرف قرارداد با شناسهٔ ${partyRef} یافت نشد؛ آن را از فرم طرف حساب جدید ایجاد کنید.`,
        messageKey: "common.error",
      });
    }
    /* پروژه — اختیاری؛ در صورت ارسال باید موجود باشد */
    let projectRef: bigint | null = null;
    if (dto.projectRef != null && Number.isFinite(dto.projectRef) && dto.projectRef > 0) {
      const project = await this.prisma.project.findUnique({
        where: { id: BigInt(dto.projectRef) },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException({
          statusCode: 404,
          message: `پروژه با شناسهٔ ${dto.projectRef} یافت نشد؛ آن را از فرم پروژه جدید ایجاد کنید.`,
          messageKey: "common.error",
        });
      }
      projectRef = project.id;
    }
    const subject = String(dto.subject ?? "").trim();
    if (subject === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "موضوع قرارداد الزامی است؛ موضوع قرارداد نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (subject.length > 200) {
      throw new BadRequestException({
        statusCode: 422,
        message: "موضوع قرارداد حداکثر ۲۰۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const title = String(dto.title ?? "").trim();
    if (title === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان تفصیلی الزامی است؛ عنوان تفصیلی نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }
    if (title.length > 100) {
      throw new BadRequestException({
        statusCode: 422,
        message: "عنوان تفصیلی حداکثر ۱۰۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    const amount = toLatinDigits(String(dto.amount ?? "")).replace(/\s+/g, "");
    if (amount === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "مبلغ قرارداد الزامی است.",
        messageKey: "common.error",
      });
    }
    if (!/^[0-9]+$/.test(amount)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "مبلغ قرارداد باید فقط عدد باشد.",
        messageKey: "common.error",
      });
    }
    if (amount.length > 18) {
      throw new BadRequestException({
        statusCode: 422,
        message: "مبلغ قرارداد حداکثر ۱۸ رقم است.",
        messageKey: "common.error",
      });
    }
    const detailCode = toLatinDigits(String(dto.detailCode ?? "")).replace(/\s+/g, "");
    if (detailCode.length > 20) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد تفصیلی حداکثر ۲۰ نویسه است.",
        messageKey: "common.error",
      });
    }
    /* تاریخ‌های اختیاری — در صورت ارسال باید میلادی ISO معتبر باشند */
    const optDate = (raw: string | undefined, label: string): string | null => {
      const v = String(raw ?? "").trim();
      if (v === "") return null;
      if (!isValidISODate(v)) {
        throw new BadRequestException({
          statusCode: 422,
          message: `${label} باید میلادی و در قالب YYYY-MM-DD باشد.`,
          messageKey: "common.error",
        });
      }
      return v;
    };
    const startDate = optDate(dto.startDate, "تاریخ شروع");
    const endDate = optDate(dto.endDate, "تاریخ خاتمه");
    /* شماره تکراری — همان خطای ۴۰۹ سریع (گارد دوم در assertNumberAvailable) */
    void structureRef;
    void excludeId;
    return {
      number,
      date,
      projectRef,
      partyRef: BigInt(partyRef),
      workLocation: String(dto.workLocation ?? "").trim() || null,
      subject,
      subject2: String(dto.subject2 ?? "").trim() || null,
      detailCode,
      title,
      title2: String(dto.title2 ?? "").trim() || null,
      startDate,
      endDate,
      durationDays:
        dto.durationDays != null && Number.isFinite(dto.durationDays) && dto.durationDays >= 0
          ? Math.floor(dto.durationDays)
          : null,
      amount,
      description: String(dto.description ?? "").trim() || null,
      description2: String(dto.description2 ?? "").trim() || null,
      isActive: dto.isActive === true,
    };
  }

  /** کد تفصیلی باید عددی باشد و اگر بازهٔ شماره‌گذاری موجود است، درون آن بماند. */
  private assertDetailCodeFormat(
    code: string,
    numbering: NumberingInfo | null,
    type: { code: string; title: string },
  ) {
    if (!/^[0-9]+$/.test(code)) {
      throw new BadRequestException({
        statusCode: 422,
        message: "کد تفصیلی باید فقط عدد باشد.",
        messageKey: "common.error",
      });
    }
    if (numbering) {
      const n = BigInt(code);
      if (n < numbering.startNumber || n > numbering.endNumber) {
        throw new BadRequestException({
          statusCode: 422,
          message: `کد تفصیلی باید در بازهٔ شماره‌گذاری نوع تفصیل «${type.code} - ${type.title}» باشد (از ${numbering.startNumber} تا ${numbering.endNumber}).`,
          messageKey: "common.error",
        });
      }
    }
  }

  /** یکتایی کد تفصیلی در گرهٔ ساختار (فضای شماره‌گذاری مشترک همهٔ انواع) — ۴۰۹. */
  private async assertDetailCodeAvailable(
    code: string,
    structureRef: bigint,
    excludeDetailItemId: bigint | null,
  ) {
    const clash = await this.prisma.detailItem.findFirst({
      where: {
        businessStructureRef: structureRef,
        code,
        ...(excludeDetailItemId ? { id: { not: excludeDetailItemId } } : {}),
      },
      select: { id: true, code: true, title: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `کد تفصیلی تکراری است: کد «${code}» قبلاً برای تفصیلی «${clash.code} - ${clash.title}» ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** یکتایی شماره قرارداد در گرهٔ ساختار — ۴۰۹. */
  private async assertNumberAvailable(
    number: string,
    structureRef: bigint,
    excludeId: bigint | null,
  ) {
    const clash = await this.prisma.contract.findFirst({
      where: {
        businessStructureRef: structureRef,
        number,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, number: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `شماره قرارداد تکراری است: شمارهٔ «${number}» قبلاً ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** یکتایی عنوان تفصیلی در نوع «قرارداد» و همان گرهٔ ساختار — ۴۰۹. */
  private async assertTitleAvailable(
    title: string,
    structureRef: bigint,
    excludeDetailItemId: bigint | null,
    type: { id: bigint; code: string; title: string },
  ) {
    const clash = await this.prisma.detailItem.findFirst({
      where: {
        businessStructureRef: structureRef,
        detailTypeRef: type.id,
        title,
        ...(excludeDetailItemId ? { id: { not: excludeDetailItemId } } : {}),
      },
      select: { id: true, title: true },
    });
    if (clash) {
      throw new ConflictException({
        statusCode: 409,
        message: `عنوان تفصیلی تکراری است: عنوان «${title}» قبلاً ثبت شده است.`,
        messageKey: "common.error",
      });
    }
  }

  /** Task 122 — گرهٔ هدف: structureId اختیاری؛ نامعتبر ⇒ ۴۲۲؛ نبود ⇒ دفتر مرکزی. */
  private async resolveTargetStructure(structureId?: number) {
    if (structureId == null || !Number.isFinite(structureId) || structureId <= 0) {
      return {
        structureRef: HEAD_OFFICE_NODE_ID,
        chain: await resolveDetailTypeChain(this.prisma, HEAD_OFFICE_NODE_ID),
      };
    }
    const structureRef = BigInt(structureId);
    const node = await this.prisma.businessStructure.findUnique({
      where: { id: structureRef },
      select: { id: true, isActive: true, title: true },
    });
    if (!node || !node.isActive) {
      throw new BadRequestException({
        statusCode: 422,
        message: `ساختار سازمانی با شناسهٔ ${structureId} یافت نشد یا غیرفعال است.`,
        messageKey: "common.error",
      });
    }
    return {
      structureRef,
      chain: await resolveDetailTypeChain(this.prisma, structureRef),
    };
  }

  /** دامنهٔ خواندن (Task 122 — قرارداد واحد اشتراک داده). */
  private async resolveReadScope(structureId?: number): Promise<AppBaseScope> {
    if (structureId != null && Number.isFinite(structureId) && structureId > 0) {
      const structureRef = BigInt(structureId);
      return { nodeId: structureRef, ...(await resolveDetailTypeChain(this.prisma, structureRef)) };
    }
    return { nodeId: HEAD_OFFICE_NODE_ID, ...(await resolveDetailTypeChain(this.prisma, HEAD_OFFICE_NODE_ID)) };
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(
    contract: {
      id: bigint;
      detailItemRef: bigint;
      number: string;
      date: string;
      projectRef: bigint | null;
      partyRef: bigint;
      workLocation: string | null;
      subject: string;
      subject2: string | null;
      title2: string | null;
      startDate: string | null;
      endDate: string | null;
      durationDays: number | null;
      amount: string;
      description2: string | null;
      version: number;
      businessStructureRef: bigint;
      createdAt: Date;
      updatedAt: Date;
    },
    item: {
      id: bigint;
      code: string;
      title: string;
      description: string | null;
      isActive: boolean;
      version: number;
      createdAt: Date;
      updatedAt: Date;
    },
    typeCode: string,
    typeTitle: string,
    party: { id: bigint; name: string; lastName: string | null; tafsiliCode: number; nature: string } | undefined,
    project: { title: string; detailCode: string } | undefined,
  ): ContractDto {
    const partyName = party ? `${party.name}${party.lastName ? ` ${party.lastName}` : ""}`.trim() : "";
    return {
      id: Number(contract.id), // §2.4 BigInt → number (گارد 2^53 در مولد ID)
      detailItemId: Number(contract.detailItemRef),
      number: contract.number,
      date: contract.date,
      projectRef: contract.projectRef != null ? Number(contract.projectRef) : null,
      projectTitle: project?.title ?? "",
      projectDetailCode: project?.detailCode ?? "",
      partyRef: Number(contract.partyRef),
      partyName,
      partyTafsiliCode: party?.tafsiliCode ?? 0,
      partyNature: party?.nature ?? "",
      workLocation: contract.workLocation ?? "",
      subject: contract.subject,
      subject2: contract.subject2 ?? "",
      detailCode: item.code,
      typeCode,
      typeTitle,
      title: item.title,
      title2: contract.title2 ?? "",
      startDate: contract.startDate ?? "",
      endDate: contract.endDate ?? "",
      durationDays: contract.durationDays ?? null,
      amount: contract.amount,
      description: item.description ?? "",
      description2: contract.description2 ?? "",
      isActive: item.isActive,
      version: contract.version,
      structureId: Number(contract.businessStructureRef),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  /** DTO خروجی ثبت/ویرایش — همان toDto با joinهای تازه. */
  private async toDetailDto(
    contract: {
      id: bigint;
      detailItemRef: bigint;
      number: string;
      date: string;
      projectRef: bigint | null;
      partyRef: bigint;
      workLocation: string | null;
      subject: string;
      subject2: string | null;
      title2: string | null;
      startDate: string | null;
      endDate: string | null;
      durationDays: number | null;
      amount: string;
      description2: string | null;
      version: number;
      businessStructureRef: bigint;
      createdAt: Date;
      updatedAt: Date;
    },
    item: {
      id: bigint;
      detailTypeRef: bigint;
      code: string;
      title: string;
      description: string | null;
      isActive: boolean;
      version: number;
      createdAt: Date;
      updatedAt: Date;
    },
    typeCode: string,
    typeTitle: string,
  ): Promise<ContractDto> {
    const party = await this.prisma.party.findUnique({
      where: { id: contract.partyRef },
      select: { id: true, name: true, lastName: true, tafsiliCode: true, nature: true },
    });
    let project: { title: string; detailCode: string } | undefined;
    if (contract.projectRef != null) {
      const p = await this.prisma.project.findUnique({
        where: { id: contract.projectRef },
        select: { detailItemRef: true },
      });
      if (p) {
        const it = await this.prisma.detailItem.findUnique({
          where: { id: p.detailItemRef },
          select: { title: true, code: true },
        });
        if (it) project = { title: it.title, detailCode: it.code };
      }
    }
    return this.toDto(contract, item, typeCode, typeTitle, party ?? undefined, project);
  }
}
