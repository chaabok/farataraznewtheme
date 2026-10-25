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
  PARTY_ADDR_TYPES,
  PARTY_NATURES,
  PARTY_PHONE_TYPES,
  PARTY_SIDES,
  PARTY_SUBTYPES,
  UpsertPartyDto,
} from "./party.dto";

/**
 * Party — Task 84 (درخواست مالک): فرم «طرف حساب جدید» در نرم‌افزار «عمومی» ←
 * زیرمنوی «اطلاعات پایه».
 *
 * قراردادهای کلیدی:
 *   · ID دستی از IDGeneration (§16) برای Party و هر سه جدول فرزند (بلوک).
 *   · بلوک کامل ارث‌بری AppBaseEntity ۸فیلدی (Task 76) روی همهٔ ردیف‌ها؛
 *     تا استقرار IAM = SYSTEM_ACTOR (دفتر مرکزی، ID=1).
 *   · Version با §2.5 auto-rowversion (VERSIONED_MODELS).
 *   · «کد تفصیلی» به‌صورت خودکار از شماره‌گذاری پر می‌شود: سریال سراسری
 *     max(TafsiliCode)+1 — حقیقی ← نوع تفصیلی ۶، حقوقی ← نوع تفصیلی ۷
 *     (متادیتای تفصیلی حسابداری؛ به‌همراه DTO برمی‌گردد).
 *   · تغییر ماهیت ⇔ فیلدهای مخصوص حالت دیگر پاک می‌شوند (سرور همان را اعمال
 *     می‌کند — خط دفاعی نهایی).
 *   · تب جزئیات: مبلغ ماندهٔ غیر صفر ⇔ وضعیت بدهکار/بستانکار همان نقش اجباری
 *     (دولایه — فرانت هم پیش از ارسال چک می‌کند).
 *   · تب‌های جدولی: افراد مرتبط (نام+نام خانوادگی اجباری)، نشانی (نوع آدرس +
 *     شهر از جدول شهرها + آدرس کامل اجباری)، تلفن (بدون الزامی؛ ردیف خالی نادیده).
 *   · تاریخ‌های ازدواج/تولد میلادی ISO 'YYYY-MM-DD' ذخیره می‌شوند (Task 77) —
 *     تبدیل تقویمِ زبان انتخابی فقط در فرانت.
 */

/** تبدیل ارقام فارسی/عربی به لاتین (سرور هر ورودی کاربری را نرمال می‌کند). */
function toLatinDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** 'YYYY-MM-DD' یا 'YYYY/MM/DD' یا 'YYYYMMDD' میلادی → 'YYYY-MM-DD' نرمال، یا null. */
function normalizeGregorianDate(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const digits = toLatinDigits(String(raw)).replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  const y = Number(digits.slice(0, 4));
  const m = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  if (y < 1900 || y > 2199) return null;
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

const clean = (v: unknown, max: number): string | null => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s.slice(0, max);
};

/** آیا ردیفِ جدول کاملاً خالی است؟ (همهٔ مقادیر تهی/خالی) */
function isBlankRow(row: Record<string, unknown>): boolean {
  return Object.values(row).every((v) => v == null || String(v).trim() === "");
}

/** نوع تفصیلی حسابداری: شخص حقیقی ← ۶، شخص حقوقی ← ۷ (عین عبارت مالک). */
export function tafsiliTypeOf(nature: string): 6 | 7 {
  return nature === "legal" ? 7 : 6;
}

interface NormalizedRole {
  checked: boolean;
  balance: number | null;
  side: string | null;
}

interface NormalizedParty {
  nature: string;
  subtype: string | null;
  name: string;
  lastName: string | null;
  latinName2: string | null;
  latinLastName2: string | null;
  latinName: string | null;
  economicCode: string | null;
  nationalId: string | null;
  legalIdentity: string | null;
  registrationNo: string | null;
  isActive: boolean;
  supplier: NormalizedRole;
  customer: NormalizedRole;
  salesAgent: NormalizedRole;
  passportNo: string | null;
  website: string | null;
  email: string | null;
  marriageDate: string | null;
  birthDate: string | null;
  persons: {
    firstName: string;
    lastName: string;
    relation: string | null;
    nationalId: string | null;
    phone: string | null;
    notes: string | null;
  }[];
  addresses: {
    addrType: string;
    cityRef: number;
    fullAddress: string;
    postalCode: string | null;
    longitude: number | null;
    latitude: number | null;
  }[];
  phones: {
    phoneType: string;
    number: string | null;
    extension: string | null;
    notes: string | null;
  }[];
}

@Injectable()
export class PartyService {
  private readonly logger = new Logger(PartyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /** فهرست طرف حساب‌ها با همهٔ ردیف‌های تب‌ها (حجم فعلی کوچک است). */
  async list() {
    const rows = await this.prisma.party.findMany({
      orderBy: [{ tafsiliCode: "asc" }],
      include: {
        persons: { orderBy: [{ orderIndex: "asc" }] },
        addresses: { orderBy: [{ orderIndex: "asc" }] },
        phones: { orderBy: [{ orderIndex: "asc" }] },
      },
    });
    return { items: rows.map((r) => this.toDto(r)) };
  }

  /** شمارهٔ بعدی «کد تفصیلی» (بدون سوزاندن شماره — نمایشِ فرم ثبت جدید). */
  async nextTafsili() {
    const agg = await this.prisma.party.aggregate({ _max: { tafsiliCode: true } });
    return { nextTafsili: (agg._max.tafsiliCode ?? 0) + 1 };
  }

  /** جدول شهرها برای دراپ‌داونِ تب «نشانی». */
  async cities() {
    const rows = await this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
    });
    return {
      items: rows.map((c) => ({
        id: Number(c.id),
        code: c.code,
        title: c.title,
        titleLatin: c.titleLatin ?? "",
        provinceName: c.provinceName,
        countryName: c.countryName,
      })),
    };
  }

  async create(dto: UpsertPartyDto) {
    const norm = this.normalize(dto);

    const newId = await this.idGen.generateNextId("Party");
    const tafsili = await this.allocateTafsili();

    /* IDهای فرزندان — بلوک پیوسته از شمارندهٔ هر جدول (§16) */
    const personIds = norm.persons.length
      ? await this.idGen.generateNextIdBlock("PartyPerson", norm.persons.length)
      : [];
    const addressIds = norm.addresses.length
      ? await this.idGen.generateNextIdBlock("PartyAddress", norm.addresses.length)
      : [];
    const phoneIds = norm.phones.length
      ? await this.idGen.generateNextIdBlock("PartyPhone", norm.phones.length)
      : [];

    let row;
    try {
      row = await this.prisma.party.create({
        data: {
          id: BigInt(newId),
          tafsiliCode: tafsili,
          nature: norm.nature,
          subtype: norm.subtype,
          name: norm.name,
          lastName: norm.lastName,
          latinName2: norm.latinName2,
          latinLastName2: norm.latinLastName2,
          latinName: norm.latinName,
          economicCode: norm.economicCode,
          nationalId: norm.nationalId,
          legalIdentity: norm.legalIdentity,
          registrationNo: norm.registrationNo,
          isActive: norm.isActive,
          isSupplier: norm.supplier.checked,
          supplierBalance: norm.supplier.balance,
          supplierSide: norm.supplier.side,
          isCustomer: norm.customer.checked,
          customerBalance: norm.customer.balance,
          customerSide: norm.customer.side,
          isSalesAgent: norm.salesAgent.checked,
          salesAgentBalance: norm.salesAgent.balance,
          salesAgentSide: norm.salesAgent.side,
          passportNo: norm.passportNo,
          website: norm.website,
          email: norm.email,
          marriageDate: norm.marriageDate,
          birthDate: norm.birthDate,
          ...appBaseOnCreate(SYSTEM_ACTOR),
          persons: {
            create: norm.persons.map((p, i) => ({
              id: BigInt(personIds[i]),
              ...p,
              orderIndex: i,
              ...appBaseOnCreate(SYSTEM_ACTOR),
            })),
          },
          addresses: {
            create: norm.addresses.map((a, i) => ({
              id: BigInt(addressIds[i]),
              ...a,
              cityRef: BigInt(a.cityRef),
              orderIndex: i,
              ...appBaseOnCreate(SYSTEM_ACTOR),
            })),
          },
          phones: {
            create: norm.phones.map((ph, i) => ({
              id: BigInt(phoneIds[i]),
              ...ph,
              orderIndex: i,
              ...appBaseOnCreate(SYSTEM_ACTOR),
            })),
          },
        },
        include: this.fullInclude(),
      });
    } catch (e) {
      if (this.isUniqueViolation(e)) {
        throw new ConflictException({
          statusCode: 409,
          message: "کد تفصیلی تکراری شد (شماره‌گذاری هم‌زمان)؛ لطفاً دوباره ذخیره کنید.",
          messageKey: "common.error",
        });
      }
      throw e;
    }
    this.logger.log(
      `Party created — ID=${newId} Tafsili=${tafsili} Nature=${norm.nature} Name=${norm.name}`,
    );
    return this.toDto(row);
  }

  async update(id: number, dto: UpsertPartyDto) {
    const existing = await this.prisma.party.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `طرف حساب با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    const norm = this.normalize(dto);

    const personIds = norm.persons.length
      ? await this.idGen.generateNextIdBlock("PartyPerson", norm.persons.length)
      : [];
    const addressIds = norm.addresses.length
      ? await this.idGen.generateNextIdBlock("PartyAddress", norm.addresses.length)
      : [];
    const phoneIds = norm.phones.length
      ? await this.idGen.generateNextIdBlock("PartyPhone", norm.phones.length)
      : [];

    /* بازنویسی کامل ردیف‌های تب‌ها (قرارداد ویرایش سند-محور) */
    let row;
    try {
      row = await this.prisma.$transaction(async (tx) => {
        await tx.partyPerson.deleteMany({ where: { partyRef: existing.id } });
        await tx.partyAddress.deleteMany({ where: { partyRef: existing.id } });
        await tx.partyPhone.deleteMany({ where: { partyRef: existing.id } });
        return tx.party.update({
          where: { id: existing.id },
          data: {
            nature: norm.nature,
            subtype: norm.subtype,
            name: norm.name,
            lastName: norm.lastName,
            latinName2: norm.latinName2,
            latinLastName2: norm.latinLastName2,
            latinName: norm.latinName,
            economicCode: norm.economicCode,
            nationalId: norm.nationalId,
            legalIdentity: norm.legalIdentity,
            registrationNo: norm.registrationNo,
            isActive: norm.isActive,
            isSupplier: norm.supplier.checked,
            supplierBalance: norm.supplier.balance,
            supplierSide: norm.supplier.side,
            isCustomer: norm.customer.checked,
            customerBalance: norm.customer.balance,
            customerSide: norm.customer.side,
            isSalesAgent: norm.salesAgent.checked,
            salesAgentBalance: norm.salesAgent.balance,
            salesAgentSide: norm.salesAgent.side,
            passportNo: norm.passportNo,
            website: norm.website,
            email: norm.email,
            marriageDate: norm.marriageDate,
            birthDate: norm.birthDate,
            ...appBaseOnUpdate(SYSTEM_ACTOR),
            persons: {
              create: norm.persons.map((p, i) => ({
                id: BigInt(personIds[i]),
                ...p,
                orderIndex: i,
                ...appBaseOnCreate(SYSTEM_ACTOR),
              })),
            },
            addresses: {
              create: norm.addresses.map((a, i) => ({
                id: BigInt(addressIds[i]),
                ...a,
                cityRef: BigInt(a.cityRef),
                orderIndex: i,
                ...appBaseOnCreate(SYSTEM_ACTOR),
              })),
            },
            phones: {
              create: norm.phones.map((ph, i) => ({
                id: BigInt(phoneIds[i]),
                ...ph,
                orderIndex: i,
                ...appBaseOnCreate(SYSTEM_ACTOR),
              })),
            },
          },
          include: this.fullInclude(),
        });
      });
    } catch (e) {
      if (this.isUniqueViolation(e)) {
        throw new ConflictException({
          statusCode: 409,
          message: "کد تفصیلی تکراری است (شماره‌گذاری هم‌زمان)؛ لطفاً دوباره ذخیره کنید.",
          messageKey: "common.error",
        });
      }
      throw e;
    }
    return this.toDto(row);
  }

  async remove(id: number) {
    const existing = await this.prisma.party.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        message: `طرف حساب با شناسهٔ ${id} یافت نشد`,
        messageKey: "common.error",
      });
    }
    await this.prisma.party.delete({ where: { id: existing.id } });
    return { deleted: true, id };
  }

  /* ------------------------------ validation ------------------------------ */

  /** نرمال‌سازی + پاک‌سازی متقاطع فیلدهای دو حالت + زنجیرهٔ قوانین مالک. */
  private normalize(dto: UpsertPartyDto): NormalizedParty {
    const nature = String(dto.nature ?? "").trim();
    if (!PARTY_NATURES.includes(nature as (typeof PARTY_NATURES)[number])) {
      throw new BadRequestException({
        statusCode: 422,
        message: "انتخاب ماهیت (شخص حقیقی / شخص حقوقی) الزامی است.",
        messageKey: "common.error",
      });
    }
    const isLegal = nature === "legal";

    const name = String(dto.name ?? "").trim();
    if (name === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: "ثبت نام الزامی است؛ نام نمی‌تواند خالی باشد.",
        messageKey: "common.error",
      });
    }

    const lastName = clean(dto.lastName, 100);
    if (!isLegal && !lastName) {
      throw new BadRequestException({
        statusCode: 422,
        message: "در حالت شخص حقیقی، ثبت نام خانوادگی الزامی است.",
        messageKey: "common.error",
      });
    }

    /* نوع فرعی فقط برای شخص حقوقی */
    let subtype: string | null = clean(dto.subtype, 40);
    if (subtype && !PARTY_SUBTYPES.includes(subtype as (typeof PARTY_SUBTYPES)[number])) {
      subtype = null;
    }
    if (!isLegal) subtype = null;

    /* تغییر ماهیت ⇔ فیلدهای حالت دیگر پاک (قرارداد مالک) */
    const latinName2 = isLegal ? null : clean(dto.latinName2, 100);
    const latinLastName2 = isLegal ? null : clean(dto.latinLastName2, 100);
    const latinName = isLegal ? clean(dto.latinName, 200) : null;
    const nationalId = isLegal ? null : clean(dto.nationalId, 20);
    const legalIdentity = isLegal ? clean(dto.legalIdentity, 20) : null;
    const registrationNo = isLegal ? clean(dto.registrationNo, 20) : null;
    const passportNo = isLegal ? null : clean(dto.other?.passportNo, 50);
    const marriageDate = isLegal ? null : this.normDate(dto.other?.marriageDate, "تاریخ ازدواج");
    const birthDate = isLegal ? null : this.normDate(dto.other?.birthDate, "تاریخ تولد");

    /* تب جزئیات — سه نقش: تیک ← مبلغ ← وضعیت؛ مبلغ غیر صفر ⇔ وضعیت اجباری */
    const supplier = this.normalizeRole(
      dto.details?.isSupplier === true,
      dto.details?.supplierBalance,
      dto.details?.supplierSide,
      "تامین کننده",
    );
    const customer = this.normalizeRole(
      dto.details?.isCustomer === true,
      dto.details?.customerBalance,
      dto.details?.customerSide,
      "مشتری",
    );
    const salesAgent = this.normalizeRole(
      dto.details?.isSalesAgent === true,
      dto.details?.salesAgentBalance,
      dto.details?.salesAgentSide,
      "واسط فروش",
    );

    /* تب‌های جدولی — ردیف خالی نادیده، ردیف ناقص رد */
    const persons = (dto.persons ?? []).filter((p) => !isBlankRow(p as unknown as Record<string, unknown>)).map((p, i) => {
      const firstName = String(p.firstName ?? "").trim();
      const ln = String(p.lastName ?? "").trim();
      if (firstName === "" || ln === "") {
        throw new BadRequestException({
          statusCode: 422,
          message: `در تب «افراد مرتبط» تکمیل نام و نام خانوادگیِ ردیف ${i + 1} الزامی است.`,
          messageKey: "common.error",
        });
      }
      return {
        firstName: firstName.slice(0, 100),
        lastName: ln.slice(0, 100),
        relation: clean(p.relation, 100),
        nationalId: clean(p.nationalId, 20),
        phone: clean(p.phone, 30),
        notes: clean(p.notes, 300),
      };
    });

    const addresses = (dto.addresses ?? [])
      .filter((a) => !isBlankRow(a as unknown as Record<string, unknown>))
      .map((a, i) => {
        const addrType = String(a.addrType ?? "").trim();
        if (!PARTY_ADDR_TYPES.includes(addrType as (typeof PARTY_ADDR_TYPES)[number])) {
          throw new BadRequestException({
            statusCode: 422,
            message: `در تب «نشانی» انتخاب نوع آدرسِ ردیف ${i + 1} الزامی است.`,
            messageKey: "common.error",
          });
        }
        if (a.cityRef == null || !Number.isFinite(Number(a.cityRef))) {
          throw new BadRequestException({
            statusCode: 422,
            message: `در تب «نشانی» انتخاب شهرِ ردیف ${i + 1} الزامی است.`,
            messageKey: "common.error",
          });
        }
        const fullAddress = String(a.fullAddress ?? "").trim();
        if (fullAddress === "") {
          throw new BadRequestException({
            statusCode: 422,
            message: `در تب «نشانی» تکمیل آدرس کاملِ ردیف ${i + 1} الزامی است.`,
            messageKey: "common.error",
          });
        }
        return {
          addrType,
          cityRef: Number(a.cityRef),
          fullAddress: fullAddress.slice(0, 500),
          postalCode: clean(a.postalCode, 20),
          longitude: this.normCoord(a.longitude),
          latitude: this.normCoord(a.latitude),
        };
      });

    const phones = (dto.phones ?? [])
      .filter((p) => !isBlankRow(p as unknown as Record<string, unknown>))
      .map((p, i) => {
        const phoneType = String(p.phoneType ?? "").trim();
        if (phoneType && !PARTY_PHONE_TYPES.includes(phoneType as (typeof PARTY_PHONE_TYPES)[number])) {
          throw new BadRequestException({
            statusCode: 422,
            message: `در تب «تلفن» نوع تلفنِ ردیف ${i + 1} معتبر نیست.`,
            messageKey: "common.error",
          });
        }
        return {
          phoneType: phoneType || "other",
          number: clean(p.number, 30),
          extension: clean(p.extension, 10),
          notes: clean(p.notes, 300),
        };
      });

    return {
      nature,
      subtype,
      name: name.slice(0, 200),
      lastName,
      latinName2,
      latinLastName2,
      latinName,
      economicCode: clean(dto.economicCode, 50),
      nationalId,
      legalIdentity,
      registrationNo,
      isActive: dto.isActive === true,
      supplier,
      customer,
      salesAgent,
      passportNo,
      website: clean(dto.other?.website, 200),
      email: clean(dto.other?.email, 200),
      marriageDate,
      birthDate,
      persons,
      addresses,
      phones,
    };
  }

  /** یک نقشِ تب جزئیات: بدون تیک همه‌چیز پاک؛ مبلغ غیر صفر ⇔ وضعیت اجباری. */
  private normalizeRole(checked: boolean, balance: unknown, side: unknown, roleFa: string): NormalizedRole {
    if (!checked) return { checked: false, balance: null, side: null };
    const b =
      balance == null || String(balance).trim() === "" ? null : Number(toLatinDigits(String(balance)));
    if (b != null && (!Number.isFinite(b) || b < 0)) {
      throw new BadRequestException({
        statusCode: 422,
        message: `«مبلغ مانده» ${roleFa} باید عددی نامنفی باشد.`,
        messageKey: "common.error",
      });
    }
    let s = String(side ?? "").trim();
    if (s && !PARTY_SIDES.includes(s as (typeof PARTY_SIDES)[number])) s = "";
    if (b != null && b !== 0 && s === "") {
      throw new BadRequestException({
        statusCode: 422,
        message: `با ورود مبلغ ماندهٔ غیر صفر برای «${roleFa}»، انتخاب وضعیت بدهکار/بستانکار الزامی است.`,
        messageKey: "common.error",
      });
    }
    return { checked: true, balance: b, side: s === "" ? null : s };
  }

  private normCoord(v: unknown): number | null {
    if (v == null || String(v).trim() === "") return null;
    const n = Number(toLatinDigits(String(v)));
    return Number.isFinite(n) ? n : null;
  }

  private normDate(raw: string | null | undefined, labelFa: string): string | null {
    if (raw == null || String(raw).trim() === "") return null;
    const iso = normalizeGregorianDate(raw);
    if (!iso) {
      throw new BadRequestException({
        statusCode: 422,
        message: `${labelFa} باید میلادی و در قالب YYYY-MM-DD باشد.`,
        messageKey: "common.error",
      });
    }
    return iso;
  }

  /** شماره‌گذاری «کد تفصیلی»: سریال سراسری max+1 (یکتا با BusinessStructureRef). */
  private async allocateTafsili(): Promise<number> {
    const agg = await this.prisma.party.aggregate({ _max: { tafsiliCode: true } });
    return (agg._max.tafsiliCode ?? 0) + 1;
  }

  private isUniqueViolation(e: unknown): boolean {
    return (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      ((e as { code?: string }).code === "P2002" || (e as { code?: string }).code === "23505")
    );
  }

  private fullInclude() {
    return {
      persons: { orderBy: [{ orderIndex: "asc" as const }] },
      addresses: { orderBy: [{ orderIndex: "asc" as const }] },
      phones: { orderBy: [{ orderIndex: "asc" as const }] },
    };
  }

  /* --------------------------------- dto --------------------------------- */

  private toDto(r: {
    id: bigint;
    nature: string;
    subtype: string | null;
    name: string;
    lastName: string | null;
    latinName2: string | null;
    latinLastName2: string | null;
    latinName: string | null;
    tafsiliCode: number;
    economicCode: string | null;
    nationalId: string | null;
    legalIdentity: string | null;
    registrationNo: string | null;
    isActive: boolean;
    isSupplier: boolean;
    supplierBalance: number | null;
    supplierSide: string | null;
    isCustomer: boolean;
    customerBalance: number | null;
    customerSide: string | null;
    isSalesAgent: boolean;
    salesAgentBalance: number | null;
    salesAgentSide: string | null;
    passportNo: string | null;
    website: string | null;
    email: string | null;
    marriageDate: string | null;
    birthDate: string | null;
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
    persons: Array<{
      id: bigint;
      firstName: string;
      lastName: string;
      relation: string | null;
      nationalId: string | null;
      phone: string | null;
      notes: string | null;
    }>;
    addresses: Array<{
      id: bigint;
      addrType: string;
      cityRef: bigint | null;
      cityTitle: string | null;
      fullAddress: string;
      postalCode: string | null;
      longitude: number | null;
      latitude: number | null;
    }>;
    phones: Array<{
      id: bigint;
      phoneType: string;
      number: string | null;
      extension: string | null;
      notes: string | null;
    }>;
  }) {
    return {
      id: Number(r.id), // §2.4 BigInt → number
      nature: r.nature,
      tafsiliType: tafsiliTypeOf(r.nature), // حقیقی ← ۶، حقوقی ← ۷
      subtype: r.subtype ?? "",
      name: r.name,
      lastName: r.lastName ?? "",
      latinName2: r.latinName2 ?? "",
      latinLastName2: r.latinLastName2 ?? "",
      latinName: r.latinName ?? "",
      tafsiliCode: r.tafsiliCode,
      economicCode: r.economicCode ?? "",
      nationalId: r.nationalId ?? "",
      legalIdentity: r.legalIdentity ?? "",
      registrationNo: r.registrationNo ?? "",
      isActive: r.isActive,
      details: {
        isSupplier: r.isSupplier,
        supplierBalance: r.supplierBalance,
        supplierSide: r.supplierSide ?? "",
        isCustomer: r.isCustomer,
        customerBalance: r.customerBalance,
        customerSide: r.customerSide ?? "",
        isSalesAgent: r.isSalesAgent,
        salesAgentBalance: r.salesAgentBalance,
        salesAgentSide: r.salesAgentSide ?? "",
      },
      other: {
        passportNo: r.passportNo ?? "",
        website: r.website ?? "",
        email: r.email ?? "",
        marriageDate: r.marriageDate ?? "",
        birthDate: r.birthDate ?? "",
      },
      persons: r.persons.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        relation: p.relation ?? "",
        nationalId: p.nationalId ?? "",
        phone: p.phone ?? "",
        notes: p.notes ?? "",
      })),
      addresses: r.addresses.map((a) => ({
        addrType: a.addrType,
        cityRef: a.cityRef == null ? null : Number(a.cityRef),
        cityTitle: a.cityTitle ?? "",
        fullAddress: a.fullAddress,
        postalCode: a.postalCode ?? "",
        longitude: a.longitude,
        latitude: a.latitude,
      })),
      phones: r.phones.map((p) => ({
        phoneType: p.phoneType,
        number: p.number ?? "",
        extension: p.extension ?? "",
        notes: p.notes ?? "",
      })),
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
