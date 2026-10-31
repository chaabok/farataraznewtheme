import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  Inject,
} from "@nestjs/common";
import { CartableService } from "./cartable.service";

/**
 * CartableSlaTimer — تایمر داخلی SLA (t179 فاز ۳): هر ۵ دقیقه یک‌بار
 * runSlaCheck را اجرا می‌کند تا ابلاغ‌های kind=sla برای گام‌های ازموعده‌گذشته
 * ساخته شوند بدون وابستگی به cron بیرونی (هم‌الگوی mini-service مستقل).
 * خطاها بلعیده می‌شوند (لاگ) تا تایمر زنده بماند.
 */
@Injectable()
export class CartableSlaTimer implements OnApplicationBootstrap {
  private static readonly INTERVAL_MS = 5 * 60 * 1000;
  private readonly logger = new Logger(CartableSlaTimer.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(@Inject(CartableService) private readonly cartable: CartableService) {}

  onApplicationBootstrap() {
    /* اولین اجرا با تأخیر — رقابت با بوت سرویس نداشته باشد */
    this.timer = setInterval(() => {
      void this.tick();
    }, CartableSlaTimer.INTERVAL_MS);
    this.timer.unref?.();
    this.logger.log("SLA timer armed (هر ۵ دقیقه — FR-12)");
  }

  private async tick() {
    try {
      await this.cartable.runSlaCheck({});
    } catch (e) {
      this.logger.warn(
        `SLA tick failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
