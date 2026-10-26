import { Injectable, HttpException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { IdGenerationService } from "../id-generation/id-generation.service";
import { appBaseOnCreate, appBaseOnUpdate, SYSTEM_ACTOR } from "../../../_shared/app-base-entity";
import { CreateGeoDto, UpdateGeoDto } from "./geo-location.dto";

/**
 * GeoLocationService — Task 103 (درخواست مالک): بک‌اند فرم «محل های جغرافیایی»
 * (عمومی ← اطلاعات پایه). درخت مرجع مکان‌ها با قواعد سطحِ والد-محور:
 *   ریشه (ParentRef=0) → [1 کشور]        1 کشور → [2 استان، 3 شهر]
 *   2 استان → [3 شهر]                    3 شهر → [4 روستا، 5 خیابان]
 *   4 روستا → [6 کوچه]                   5 خیابان → [6 کوچه]
 *   6 کوچه → برگ (بدون زیرشاخه)
 * Task 103 حکم مالک: «اولین شاخه کشور؛ زیر کشور فقط استان و زیر استان فقط
 * شهر». Task 105 (درخواست مالک — دادهٔ کامل کشورهای جهان + پایتخت‌ها):
 * «شهر» هم به فرزندان مجازِ کشور اضافه شد تا پایتختِ کشورهای فاقد استانِ ثبت‌شده
 * (تمام کشورها به‌جز ایران) مستقیماً زیر خودِ کشور ثبت شود؛ پایتختِ ایران
 * (تهران) طبق ساختار، زیر «استان تهران» است.
 * (ادامهٔ سطوح پایین‌تر فرض اعلام‌شدهٔ کارنام است — با همین ثابت‌ها قابل اصلاح.)
 */

const CHILD_TYPE_RULES: Record<number, number[]> = {
  1: [2, 3], // کشور → استان | شهر (پایتخت — Task 105)
  2: [3], // استان → شهر
  3: [4, 5], // شهر → روستا/خیابان (فرض اعلام‌شده)
  4: [6], // روستا → کوچه (فرض اعلام‌شده)
  5: [6], // خیابان → کوچه
  6: [], // کوچه — برگ
};
const ROOT_ALLOWED = [1]; // اولین شاخه فقط کشور
const TYPE_FA: Record<number, string> = {
  1: "کشور",
  2: "استان",
  3: "شهر",
  4: "روستا",
  5: "خیابان",
  6: "کوچه",
};

function allowedChildTypes(parentType: number | null): number[] {
  if (parentType == null) return ROOT_ALLOWED;
  return CHILD_TYPE_RULES[parentType] ?? [];
}

function fail(status: number, message: string, messageKey?: string): never {
  throw new HttpException({ statusCode: status, message, messageKey }, status);
}

@Injectable()
export class GeoLocationService {
  private readonly logger = new Logger(GeoLocationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idGen: IdGenerationService,
  ) {}

  /* ------------------------------- mapping ------------------------------ */

  private toDto(n: {
    id: bigint;
    parentRef: bigint;
    levelType: number;
    code: number;
    title: string;
    titleLatin: string;
    isActive: boolean;
    version: number;
  }) {
    return {
      id: Number(n.id),
      parentRef: Number(n.parentRef),
      levelType: n.levelType,
      code: n.code,
      title: n.title,
      titleLatin: n.titleLatin,
      isActive: n.isActive,
      version: n.version,
      childCount: 0,
    };
  }

  /* --------------------------------- read -------------------------------- */

  async list() {
    const [items, childGroups] = await Promise.all([
      this.prisma.geoLocation.findMany({ orderBy: [{ parentRef: "asc" }, { code: "asc" }] }),
      this.prisma.geoLocation.groupBy({ by: ["parentRef"], _count: { parentRef: true } }),
    ]);
    const counts = new Map<number, number>();
    for (const g of childGroups) counts.set(Number(g.parentRef), g._count.parentRef);

    return {
      items: items.map((n) => ({ ...this.toDto(n), childCount: counts.get(Number(n.id)) ?? 0 })),
    };
  }

  /* -------------------------------- create ------------------------------- */

  async create(dto: CreateGeoDto) {
    /* قاعدهٔ والد: ریشه فقط کشور؛ بقیه بر اساس نوع والد */
    if (dto.parentRef === 0) {
      if (!ROOT_ALLOWED.includes(dto.levelType)) {
        fail(422, `اولین شاخه فقط می‌تواند «${TYPE_FA[1]}» باشد`, "geo.val.rootCountryOnly");
      }
    } else {
      const parent = await this.prisma.geoLocation.findUnique({
        where: { id: BigInt(dto.parentRef) },
      });
      if (!parent) fail(404, "گرهٔ والد یافت نشد", "geo.msg.loadError");
      const allowed = allowedChildTypes(parent.levelType);
      if (!allowed.includes(dto.levelType)) {
        const list = allowed.map((t) => TYPE_FA[t] ?? String(t)).join("، ");
        fail(
          422,
          dto.levelType === 1 && dto.parentRef !== 0
            ? `زیرشاخه فقط «${list}» است — «${TYPE_FA[1]}» فقط در اولین سطح تعریف می‌شود`
            : `زیرشاخهٔ «${TYPE_FA[parent.levelType] ?? parent.levelType}» فقط می‌تواند «${list}» باشد`,
          "geo.val.childTypeNotAllowed",
        );
      }
    }

    // id generation runs in its own short transaction (spec §6; gaps accepted)
    const newId = await this.idGen.generateNextId("GeoLocation");

    const created = await this.prisma.geoLocation
      .create({
        data: {
          id: BigInt(newId),
          parentRef: BigInt(dto.parentRef),
          levelType: dto.levelType,
          code: dto.code,
          title: dto.title.trim(),
          /* Task 110 — عنوان لاتین از فرم‌ها حذف شد؛ ستون legacy با مقدار پیش‌فرض */
          titleLatin: dto.titleLatin?.trim() ?? "",
          isActive: dto.isActive ?? true,
          ...appBaseOnCreate(SYSTEM_ACTOR),
        },
      })
      .catch((e) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          fail(409, "کد تکراری است — در این سطح کد دیگری انتخاب کنید", "geo.val.codeDuplicate");
        }
        throw e;
      });

    return { item: this.toDto(created) };
  }

  /* -------------------------------- update ------------------------------- */

  async update(id: number, dto: UpdateGeoDto) {
    const node = await this.prisma.geoLocation.findUnique({ where: { id: BigInt(id) } });
    if (!node) fail(404, "گره یافت نشد", "geo.msg.loadError");

    if (dto.title !== undefined && !dto.title.trim()) {
      fail(422, "عنوان الزامی است", "geo.val.titleRequired");
    }
    if (dto.titleLatin !== undefined && !dto.titleLatin.trim()) {
      fail(422, "عنوان لاتین الزامی است", "geo.val.titleLatinRequired");
    }

    /* تغییر نوع فقط وقتی مجاز است که با نوع والد و انواع زیرشاخه‌های موجود
       سازگار بماند (الگوی business-structure) */
    if (dto.levelType !== undefined && dto.levelType !== node.levelType) {
      const parentType =
        node.parentRef === 0n
          ? null
          : (await this.prisma.geoLocation.findUnique({
                where: { id: node.parentRef },
                select: { levelType: true },
              })
            )?.levelType ?? null;
      if (!allowedChildTypes(parentType).includes(dto.levelType)) {
        fail(422, "نوع انتخابی با قواعد سطح والد سازگار نیست", "geo.val.childTypeNotAllowed");
      }
      const childTypes = await this.prisma.geoLocation.findMany({
        where: { parentRef: node.id },
        select: { levelType: true },
      });
      for (const c of childTypes) {
        if (!allowedChildTypes(dto.levelType).includes(c.levelType)) {
          fail(422, "تغییر نوع به دلیل ناسازگاری با زیرشاخه‌های موجود مجاز نیست");
        }
      }
    }

    const updated = await this.prisma.geoLocation.update({
      where: { id: BigInt(id) },
      data: {
        levelType: dto.levelType,
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        titleLatin: dto.titleLatin !== undefined ? dto.titleLatin.trim() : undefined,
        isActive: dto.isActive,
        ...appBaseOnUpdate(SYSTEM_ACTOR),
        // §2.5: Version is auto-bumped by the global PrismaService $extends
      },
    });
    return { item: this.toDto(updated) };
  }

  /* -------------------------------- delete ------------------------------- */

  async remove(id: number) {
    const node = await this.prisma.geoLocation.findUnique({ where: { id: BigInt(id) } });
    if (!node) fail(404, "گره یافت نشد", "geo.msg.loadError");

    const children = await this.prisma.geoLocation.count({ where: { parentRef: BigInt(id) } });
    if (children > 0) {
      fail(409, "این شاخه دارای زیرشاخه است و حذف نمی‌شود", "geo.msg.deleteBlockedChildren");
    }

    await this.prisma.geoLocation.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }
}
