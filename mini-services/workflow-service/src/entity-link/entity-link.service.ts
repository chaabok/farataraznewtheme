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
