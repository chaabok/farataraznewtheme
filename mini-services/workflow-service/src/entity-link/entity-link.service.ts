import { Injectable, Logger } from "@nestjs/common";
import { InternalHttpClient } from "../../../_shared/internal-http";
import { engineKeyHeaders } from "../../../_shared/engine-auth";

/**
 * EntityLinkService — پل سبک موتور → سرویس مالک فرم (t178 — فاز ۲).
 *
 * ۱) منبع حقیقت گلوگاه ورود (D-3): وضعیت واقعی سند از settings-service خوانده
 *    می‌شود تا ادعای فرمت قابل جعل نباشد.
 * ۲) اعمال وضعیت پایانی (D-4): پایان رسیدگی (تایید/رد/واگرد/ابطال) وضعیت سند
 *    را در settings-service می‌نویسد — endpoint فقط-موتور با ENGINE_API_KEY.
 *
 * ارجاع سبک: هیچ دادهٔ فرم کپی نمی‌شود؛ فقط entityType+entityID.
 */
@Injectable()
export class EntityLinkService {
  private readonly logger = new Logger(EntityLinkService.name);
  private readonly client = new InternalHttpClient(process.env.INTERNAL_API_KEY ?? "");
  private readonly settingsBase = process.env.SETTINGS_SERVICE_URL ?? "http://127.0.0.1:3001";

  /** وضعیت واقعی سند — منبع حقیقت گلوگاه ورود (D-3). */
  async getVoucherStatus(entityId: string) {
    return this.client.call<{ id: number; voucherNo: string; status: number }>(
      this.settingsBase,
      `/vouchers/${encodeURIComponent(entityId)}/status`,
      { timeoutMs: 1500 },
    );
  }

  /**
   * مبلغ سند — منبع حقیقت شرط آستانهٔ per فرم (D-2 — t179 فاز ۳): جمع بدهکار
   * اقلام از settings-service؛ کارتابل/هر کلاینت دیگر بدون دانستن مبلغ هم
   * موتور را از دورزدن ایستگاه مدیر محروم نمی‌کند.
   */
  async getVoucherAmount(entityId: string) {
    const r = await this.client.call<{
      id?: number;
      item?: { items?: Array<{ debit?: string | number; credit?: string | number }> };
      items?: Array<{ debit?: string | number; credit?: string | number }>;
    }>(this.settingsBase, `/vouchers/${encodeURIComponent(entityId)}`, { timeoutMs: 1500 });
    const rows = r.data?.item?.items ?? r.data?.items;
    if (!r.ok || !r.data || !Array.isArray(rows)) {
      return { ok: false as const, amount: null };
    }
    let total = 0;
    for (const it of rows) {
      const d = typeof it.debit === "number" ? it.debit : Number(String(it.debit ?? "0").replace(/,/g, "")) || 0;
      total += d;
    }
    return { ok: true as const, amount: total };
  }

  /**
   * اعمال وضعیت موتور روی سند (D-4/D-5) — ۱=ثبت اولیه (رد) · ۳/۴=گرهٔ پایان ·
   * ۵=بازگشت به گلوگاه ورود (ابطال/واگرد). خطا fatal نیست — لاگ می‌شود تا
   * نمونهٔ موتور اتمی بماند؛ همگرایی وضعیت با «واکشی مجدد فرم» جبران می‌شود.
   */
  async writeBackVoucherStatus(entityId: string, status: number, actorId: string) {
    const r = await this.client.call<unknown>(
      this.settingsBase,
      `/vouchers/${encodeURIComponent(entityId)}/engine-status`,
      {
        method: "PATCH",
        body: { status, actorId: actorId || "workflow-engine" },
        timeoutMs: 2500,
        headers: engineKeyHeaders(),
      },
    );
    if (!r.ok) {
      this.logger.warn(
        `write-back وضعیت سند ${entityId} → ${status} ناموفق بود (status=${r.status} err=${r.error ?? ""})`,
      );
    }
    return r;
  }
}
