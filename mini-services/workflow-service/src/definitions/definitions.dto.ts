/**
 * DefinitionsDto — t180 فاز ۴: طراح بصری فرآیند.
 * GraphDto = جایگزینی کامل گره‌ها/گذارهای یک تعریف در یک تراکنش (فقط نسخهٔ
 * بدون نمونهٔ گردش کار). nodeCode مرجع پایدار سمت کلاینت است — سرور به ID
 * واقعی نگاشت می‌کند و اعتبارسنجی موتور-سازگار (start/action/condition/end)
 * انجام می‌دهد.
 */

export interface CreateDefinitionDto {
  code: string;
  name: string;
  entityType: string;
  description?: string;
  thresholdAmount?: number;
}

export interface UpdateDefinitionMetaDto {
  name?: string;
  description?: string;
  thresholdAmount?: number | null;
}

/** t190 — خاتمهٔ فرآیند: تاریخ خاتمه (ISO 'YYYY-MM-DD'، پیش‌فرض مودال = امروز)
 *  + توضیحات. نسخهٔ خاتمه‌یافته فقط-خواندنی می‌شود و از موتور خارج است. */
export interface TerminateDefinitionDto {
  terminatedAt: string; // 'YYYY-MM-DD'
  note?: string;
}

export interface GraphNodeDto {
  nodeCode: string;
  nodeType: string; // start | action | condition | end
  title: string;
  roleCode?: string;
  slaHours?: number | null;
  orderIndex?: number;
  finalStatus?: number | null;
  instanceState?: string; // approved | rejected — فقط گرهٔ پایان
  posX?: number;
  posY?: number;
}

export interface GraphTransitionDto {
  fromCode: string;
  toCode: string;
  action: string;
  conditionExpr?: string;
  isDefault?: boolean;
}

export interface SaveGraphDto {
  nodes: GraphNodeDto[];
  transitions: GraphTransitionDto[];
}

export interface SaveLayoutDto {
  positions: Array<{ nodeId: number; posX: number; posY: number }>;
}
