import { Injectable, Logger } from "@nestjs/common";
import { APP_CATALOG, SETTINGS_SERVICE_PORT, findApp } from "../../../_shared/app-catalog";
import { InternalCallResult, InternalHttpClient } from "../../../_shared/internal-http";

export interface AppMetaDto {
  appKey: string;
  titleFa: string;
  titleKey: string;
  iconKey: string;
  appGroup: string;
  order: number;
  port: number;
  dbMode: string;
  host: string;
  status: "awaiting-analysis";
  version: number;
  endpoints: string[];
}

@Injectable()
export class AppsService {
  private readonly logger = new Logger(AppsService.name);
  private readonly http = new InternalHttpClient(process.env.INTERNAL_API_KEY ?? "");

  listApps() {
    return {
      items: APP_CATALOG.map((a) => ({
        appKey: a.appKey,
        order: a.order,
        titleFa: a.titleFa,
        titleKey: a.titleKey,
        iconKey: a.iconKey,
        appGroup: a.appGroup,
        port: a.port,
        dbMode: a.dbMode,
        host: a.host,
      })),
    };
  }

  getMeta(appKey: string): AppMetaDto {
    const app = findApp(appKey);
    if (!app) throw new Error(`unknown app: ${appKey}`);
    return {
      appKey: app.appKey,
      titleFa: app.titleFa,
      titleKey: app.titleKey,
      iconKey: app.iconKey,
      appGroup: app.appGroup,
      order: app.order,
      port: app.port,
      dbMode: app.dbMode,
      host: app.host,
      status: "awaiting-analysis",
      version: 1,
      endpoints: [
        `GET /${app.appKey}/meta`,
        `GET /${app.appKey}/health`,
        `GET /${app.appKey}/integrations/status`,
      ],
    };
  }

  /** Live proof of the secure mesh: signed call from this app to settings-service. */
  async integrationStatus(appKey: string) {
    const app = findApp(appKey);
    if (!app) throw new Error(`unknown app: ${appKey}`);
    const base = process.env.SETTINGS_SERVICE_URL ?? `http://127.0.0.1:${SETTINGS_SERVICE_PORT}`;
    const res = await this.callWithRetry(base, "/app-registry");
    return {
      appKey: app.appKey,
      at: new Date().toISOString(),
      peers: [
        {
          service: "settings-service",
          endpoint: `${base}/app-registry`,
          status: res.ok ? "ok" : res.status === 0 ? "unreachable" : "error",
          latencyMs: res.latencyMs,
          signed: true,
        },
      ],
      overall: res.ok ? "ok" : "degraded",
    };
  }

  private async callWithRetry(base: string, path: string, attempts = 2) {
    let last: InternalCallResult<unknown> | undefined;
    for (let i = 0; i < attempts; i++) {
      last = await this.http.call<unknown>(base, path, { timeoutMs: 3000 });
      if (last.ok) return last;
    }
    return last!;
  }
}
