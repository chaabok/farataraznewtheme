/**
 * SERVER-ONLY registry mapping each module id to its NestJS microservice.
 * API keys come from root .env (maintained by scripts/scaffold-module-services.ts)
 * and are never sent to the browser — the gateway injects them server-side.
 */

export interface ServiceEndpoint {
  baseUrl: string;
  apiKey: string;
}

const env = (key: string): string => process.env[key] ?? '';

function endpoint(urlKey: string, apiKeyEnv: string, fallbackPort: number): ServiceEndpoint {
  return {
    baseUrl: env(urlKey) || `http://127.0.0.1:${fallbackPort}`,
    apiKey: env(apiKeyEnv),
  };
}

export const AUTH_SERVICE: ServiceEndpoint = endpoint(
  'AUTH_SERVICE_URL',
  'AUTH_SERVICE_API_KEY',
  3002,
);

export const DESKTOP_SERVICE: ServiceEndpoint = endpoint(
  'DESKTOP_SERVICE_URL',
  'DESKTOP_SERVICE_API_KEY',
  3001,
);

/** Whitelist of ERP modules → their own microservice endpoint. */
const MODULE_SERVICES: Record<string, ServiceEndpoint> = {
  settings: endpoint('SETTINGS_SERVICE_URL', 'SETTINGS_SERVICE_API_KEY', 3003),
  accounting: endpoint('ACCOUNTING_SERVICE_URL', 'ACCOUNTING_SERVICE_API_KEY', 3004),
  payment: endpoint('PAYMENT_SERVICE_URL', 'PAYMENT_SERVICE_API_KEY', 3005),
  inventory: endpoint('INVENTORY_SERVICE_URL', 'INVENTORY_SERVICE_API_KEY', 3006),
  sales: endpoint('SALES_SERVICE_URL', 'SALES_SERVICE_API_KEY', 3007),
  fixedAsset: endpoint('FIXEDASSET_SERVICE_URL', 'FIXEDASSET_SERVICE_API_KEY', 3008),
  procurement: endpoint('PROCUREMENT_SERVICE_URL', 'PROCUREMENT_SERVICE_API_KEY', 3009),
  order: endpoint('ORDER_SERVICE_URL', 'ORDER_SERVICE_API_KEY', 3010),
  costing: endpoint('COSTING_SERVICE_URL', 'COSTING_SERVICE_API_KEY', 3011),
  financialStatement: endpoint(
    'FINANCIALSTATEMENT_SERVICE_URL',
    'FINANCIALSTATEMENT_SERVICE_API_KEY',
    3012,
  ),
};

export function getModuleService(moduleId: string): ServiceEndpoint | null {
  return MODULE_SERVICES[moduleId] ?? null;
}

export const MODULE_IDS = Object.keys(MODULE_SERVICES);
