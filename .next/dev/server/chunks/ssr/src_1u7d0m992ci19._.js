(()=>{"use strict";module.exports = [
"[project]/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "api",
    ()=>api,
    "appApi",
    ()=>appApi
]);
"use client";
class ApiError extends Error {
    status;
    messageKey;
    constructor(status, message, messageKey){
        super(message);
        this.status = status;
        this.messageKey = messageKey;
    }
}
async function request(base, path, init) {
    let res;
    try {
        res = await fetch(`${base}/${path.replace(/^\//, "")}`, {
            headers: {
                "content-type": "application/json"
            },
            ...init
        });
    } catch  {
        throw new ApiError(0, "network error", "common.error");
    }
    const text = await res.text();
    let body = null;
    try {
        body = text ? JSON.parse(text) : null;
    } catch  {
    /* non-json */ }
    if (!res.ok) {
        const b = body ?? {};
        throw new ApiError(res.status, b.message ?? `HTTP ${res.status}`, b.messageKey);
    }
    return body;
}
const api = {
    get: (path)=>request("/api/settings", path),
    post: (path, body)=>request("/api/settings", path, {
            method: "POST",
            body: JSON.stringify(body)
        }),
    put: (path, body)=>request("/api/settings", path, {
            method: "PUT",
            body: JSON.stringify(body)
        }),
    del: (path)=>request("/api/settings", path, {
            method: "DELETE"
        })
};
function appApi(appKey) {
    const base = `/api/${appKey}`;
    return {
        get: (path)=>request(base, path),
        post: (path, body)=>request(base, path, {
                method: "POST",
                body: JSON.stringify(body)
            }),
        put: (path, body)=>request(base, path, {
                method: "PUT",
                body: JSON.stringify(body)
            }),
        del: (path)=>request(base, path, {
                method: "DELETE"
            })
    };
}
}),
"[project]/src/lib/app-catalog.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ICONS",
    ()=>APP_ICONS,
    "FRONTEND_APPS",
    ()=>FRONTEND_APPS,
    "getAppDescriptor",
    ()=>getAppDescriptor,
    "getAppIcon",
    ()=>getAppIcon,
    "getIconKeyGlyph",
    ()=>getIconKeyGlyph
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left-right.js [app-ssr] (ecmascript) <export default as ArrowLeftRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/boxes.js [app-ssr] (ecmascript) <export default as Boxes>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calculator.js [app-ssr] (ecmascript) <export default as Calculator>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-ssr] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/factory.js [app-ssr] (ecmascript) <export default as Factory>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$chart$2d$column$2d$increasing$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBarChart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-chart-column-increasing.js [app-ssr] (ecmascript) <export default as FileBarChart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileStack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-stack.js [app-ssr] (ecmascript) <export default as FileStack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-ssr] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-ssr] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2d$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HandCoins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand-coins.js [app-ssr] (ecmascript) <export default as HandCoins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hammer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hammer.js [app-ssr] (ecmascript) <export default as Hammer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$handshake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartHandshake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-handshake.js [app-ssr] (ecmascript) <export default as HeartHandshake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/landmark.js [app-ssr] (ecmascript) <export default as Landmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-tree.js [app-ssr] (ecmascript) <export default as ListTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-ssr] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$notebook$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__NotebookPen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/notebook-pen.js [app-ssr] (ecmascript) <export default as NotebookPen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PackageSearch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package-search.js [app-ssr] (ecmascript) <export default as PackageSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-ssr] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sigma$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sigma$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sigma.js [app-ssr] (ecmascript) <export default as Sigma>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/snowflake.js [app-ssr] (ecmascript) <export default as Snowflake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-ssr] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-ssr] (ecmascript) <export default as UserCog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/warehouse.js [app-ssr] (ecmascript) <export default as Warehouse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-ssr] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.js [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/workflow.js [app-ssr] (ecmascript) <export default as Workflow>");
;
const FRONTEND_APPS = [
    {
        appKey: "settings",
        order: 1,
        titleKey: "app.settings",
        iconKey: "settings",
        appGroup: "platform",
        port: 3001,
        dbMode: "shared"
    },
    {
        appKey: "accounting",
        order: 2,
        titleKey: "app.accounting",
        iconKey: "calculator",
        appGroup: "financial",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "receiptsPayment",
        order: 3,
        titleKey: "app.receiptsPayment",
        iconKey: "receiptsPayment",
        appGroup: "financial",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "inventory",
        order: 4,
        titleKey: "app.inventory",
        iconKey: "warehouse",
        appGroup: "logistics",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "sales",
        order: 5,
        titleKey: "app.sales",
        iconKey: "cart",
        appGroup: "sales",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "fixedAssets",
        order: 6,
        titleKey: "app.fixedAssets",
        iconKey: "landmark",
        appGroup: "financial",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "procurement",
        order: 7,
        titleKey: "app.procurement",
        iconKey: "packageSearch",
        appGroup: "logistics",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "foreignOrders",
        order: 8,
        titleKey: "app.foreignOrders",
        iconKey: "globe",
        appGroup: "sales",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "costing",
        order: 9,
        titleKey: "app.costing",
        iconKey: "sigma",
        appGroup: "financial",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "materialDelivery",
        order: 10,
        titleKey: "app.materialDelivery",
        iconKey: "truckCheck",
        appGroup: "logistics",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "productionPlanning",
        order: 11,
        titleKey: "app.productionPlanning",
        iconKey: "factory",
        appGroup: "production",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "payroll",
        order: 12,
        titleKey: "app.payroll",
        iconKey: "handCoins",
        appGroup: "hr",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "hr",
        order: 14,
        titleKey: "app.hr",
        iconKey: "users",
        appGroup: "hr",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "officeAutomation",
        order: 15,
        titleKey: "app.officeAutomation",
        iconKey: "fileStack",
        appGroup: "platform",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "crm",
        order: 16,
        titleKey: "app.crm",
        iconKey: "heartHandshake",
        appGroup: "sales",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "advancedTools",
        order: 17,
        titleKey: "app.advancedTools",
        iconKey: "wrench",
        appGroup: "platform",
        port: 3003,
        dbMode: "dedicated"
    },
    {
        appKey: "userManagement",
        order: 18,
        titleKey: "app.userManagement",
        iconKey: "userCog",
        appGroup: "platform",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "workflow",
        order: 19,
        titleKey: "app.workflow",
        iconKey: "workflow",
        appGroup: "platform",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "smsCenter",
        order: 20,
        titleKey: "app.smsCenter",
        iconKey: "messageSquare",
        appGroup: "platform",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "retailSales",
        order: 21,
        titleKey: "app.retailSales",
        iconKey: "store",
        appGroup: "sales",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "marketingSales",
        order: 22,
        titleKey: "app.marketingSales",
        iconKey: "megaphone",
        appGroup: "sales",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "coldDistribution",
        order: 23,
        titleKey: "app.coldDistribution",
        iconKey: "snowflake",
        appGroup: "distribution",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "hotDistribution",
        order: 24,
        titleKey: "app.hotDistribution",
        iconKey: "flame",
        appGroup: "distribution",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "financialStatements",
        order: 25,
        titleKey: "app.financialStatements",
        iconKey: "fileBarChart",
        appGroup: "financial",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "businessIntelligence",
        order: 26,
        titleKey: "app.businessIntelligence",
        iconKey: "barChart",
        appGroup: "analytics",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "maintenance",
        order: 27,
        titleKey: "app.maintenance",
        iconKey: "hammer",
        appGroup: "production",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "onlineWebsite",
        order: 28,
        titleKey: "app.onlineWebsite",
        iconKey: "globe",
        appGroup: "platform",
        port: 3002,
        dbMode: "shared"
    },
    {
        appKey: "general",
        order: 29,
        titleKey: "app.general",
        iconKey: "boxes",
        appGroup: "platform",
        port: 3002,
        dbMode: "shared"
    }
];
const APP_ICONS = {
    settings: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        tile: "from-slate-400 to-slate-600"
    },
    accounting: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__["Calculator"],
        tile: "from-violet-500 to-violet-700"
    },
    receiptsPayment: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__["ArrowLeftRight"],
        tile: "from-emerald-500 to-emerald-700"
    },
    inventory: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__["Warehouse"],
        tile: "from-amber-500 to-amber-600"
    },
    sales: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
        tile: "from-rose-500 to-rose-700"
    },
    fixedAssets: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__["Landmark"],
        tile: "from-teal-500 to-teal-700"
    },
    procurement: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PackageSearch$3e$__["PackageSearch"],
        tile: "from-orange-500 to-orange-600"
    },
    foreignOrders: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"],
        tile: "from-cyan-500 to-cyan-700"
    },
    costing: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sigma$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sigma$3e$__["Sigma"],
        tile: "from-lime-600 to-lime-700"
    },
    materialDelivery: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
        tile: "from-sky-500 to-sky-700"
    },
    productionPlanning: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__["Factory"],
        tile: "from-fuchsia-500 to-fuchsia-700"
    },
    payroll: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2d$coins$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HandCoins$3e$__["HandCoins"],
        tile: "from-green-500 to-green-700"
    },
    hr: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        tile: "from-purple-500 to-purple-700"
    },
    officeAutomation: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileStack$3e$__["FileStack"],
        tile: "from-stone-500 to-stone-700"
    },
    crm: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$handshake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartHandshake$3e$__["HeartHandshake"],
        tile: "from-pink-500 to-pink-700"
    },
    advancedTools: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"],
        tile: "from-amber-600 to-amber-800"
    },
    userManagement: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__["UserCog"],
        tile: "from-violet-600 to-violet-800"
    },
    workflow: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__["Workflow"],
        tile: "from-cyan-600 to-cyan-800"
    },
    smsCenter: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
        tile: "from-emerald-600 to-emerald-800"
    },
    retailSales: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"],
        tile: "from-rose-600 to-rose-800"
    },
    marketingSales: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"],
        tile: "from-orange-600 to-orange-800"
    },
    coldDistribution: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__["Snowflake"],
        tile: "from-sky-400 to-sky-600"
    },
    hotDistribution: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
        tile: "from-red-500 to-red-700"
    },
    financialStatements: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$chart$2d$column$2d$increasing$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBarChart$3e$__["FileBarChart"],
        tile: "from-teal-600 to-teal-800"
    },
    businessIntelligence: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        tile: "from-fuchsia-600 to-fuchsia-800"
    },
    maintenance: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hammer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Hammer$3e$__["Hammer"],
        tile: "from-yellow-500 to-yellow-600"
    },
    onlineWebsite: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"],
        tile: "from-cyan-500 to-cyan-700"
    },
    general: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__["Boxes"],
        tile: "from-fuchsia-600 to-rose-700"
    }
};
function getAppIcon(appKey) {
    return APP_ICONS[appKey];
}
/* Task 45 (فرمساز) — glyph by ICON KEY: user-created menus/icons store an
   iconKey (the same keys as the catalog iconKey column); resolve through the
   catalog, then a small extra set, then a neutral folder fallback. */ const ICON_KEY_EXTRA = {
    folder: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"],
        tile: "from-emerald-500 to-emerald-700"
    },
    listTree: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"],
        tile: "from-amber-500 to-orange-600"
    },
    clipboardList: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"],
        tile: "from-sky-500 to-sky-700"
    },
    notebookPen: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$notebook$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__NotebookPen$3e$__["NotebookPen"],
        tile: "from-rose-500 to-rose-700"
    }
};
function getIconKeyGlyph(iconKey) {
    const direct = APP_ICONS[iconKey];
    if (direct) return direct;
    const desc = FRONTEND_APPS.find((a)=>a.iconKey === iconKey);
    if (desc && APP_ICONS[desc.appKey]) return APP_ICONS[desc.appKey];
    return ICON_KEY_EXTRA[iconKey] ?? {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"],
        tile: "from-slate-400 to-slate-600"
    };
}
function getAppDescriptor(appKey) {
    return FRONTEND_APPS.find((a)=>a.appKey === appKey);
}
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/src/stores/app-registry-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppRegistry",
    ()=>useAppRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/app-catalog.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function sortApps(apps) {
    return [
        ...apps
    ].sort((a, b)=>a.order - b.order);
}
const useAppRegistry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((set, get)=>({
        apps: [],
        source: "idle",
        loaded: false,
        load: async ()=>{
            if (get().loaded) return;
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].get("app-registry");
                const apps = (res.items ?? []).map((r)=>({
                        appKey: String(r.appKey),
                        order: Number(r.order),
                        titleKey: String(r.titleKey),
                        iconKey: String(r.iconKey),
                        appGroup: String(r.appGroup),
                        port: Number(r.port),
                        dbMode: String(r.dbMode)
                    }));
                if (apps.length === 0) throw new Error("empty registry");
                set({
                    apps: sortApps(apps),
                    source: "registry",
                    loaded: true
                });
            } catch  {
                set({
                    apps: sortApps(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FRONTEND_APPS"]),
                    source: "fallback",
                    loaded: true
                });
            }
        }
    }));
}),
"[project]/src/stores/desktop-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PINNED",
    ()=>DEFAULT_PINNED,
    "useDesktop",
    ()=>useDesktop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
"use client";
;
;
const DEFAULT_PINNED = [
    "settings"
];
const MIN_W = 520;
const MIN_H = 400;
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}
function defaultBounds() {
    const vw = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1280;
    const vh = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 800;
    const taskbar = 52;
    if (vw < 640) {
        return {
            x: 12,
            y: 12,
            w: vw - 24,
            h: vh - taskbar - 24
        };
    }
    const w = clamp(Math.round(vw * 0.78), MIN_W, 1240);
    const h = clamp(Math.round((vh - taskbar) * 0.86), MIN_H, 940);
    const n = Math.floor(Math.random() * 3);
    return {
        x: Math.max(12, Math.round((vw - w) / 2) + n * 26 - 26),
        y: Math.max(12, Math.round((vh - taskbar - h) / 2) + n * 18 - 18),
        w,
        h
    };
}
const useDesktop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        windows: [],
        zTop: 10,
        startOpen: false,
        iconPositions: {},
        pinned: DEFAULT_PINNED,
        headerDock: "top",
        iconMode: "grid",
        sidebarCollapsed: false,
        dragOverTaskbar: false,
        openWindow: (kind, appKey)=>{
            /* Task 36 — owner request: the desktop Settings icon and the taskbar
           Settings pin must show exactly the same information. Every launcher
           of the catalog "settings" app (desktop icon, start-menu grid) is
           redirected here to the real Settings window (kind "settings", with
           the Business Structure sub-page) instead of the §4.6 placeholder —
           one window instance shared by all entry points (owner-approved
           §4.6 exception; the other 26 catalog apps keep their placeholder). */ if (kind === "app" && appKey === "settings") {
                kind = "settings";
                appKey = undefined;
            }
            /* Task 45 — the catalog "advancedTools" app opens the real form-builder
           window (فرمساز, dfb-service) instead of the §4.6 placeholder —
           owner-requested promotion, same one-window pattern as settings. */ if (kind === "app" && appKey === "advancedTools") {
                kind = "dfb-builder";
                appKey = undefined;
            }
            const existing = get().windows.find((w)=>w.kind === kind && w.appKey === appKey);
            if (existing) {
                set((s)=>({
                        zTop: s.zTop + 1,
                        startOpen: false,
                        windows: s.windows.map((w)=>w.id === existing.id ? {
                                ...w,
                                z: s.zTop + 1,
                                minimized: false
                            } : w)
                    }));
                return;
            }
            const b = defaultBounds();
            set((s)=>({
                    startOpen: false,
                    zTop: s.zTop + 1,
                    windows: [
                        ...s.windows,
                        {
                            id: `${kind}:${appKey ?? ""}-${Date.now()}`,
                            kind,
                            appKey,
                            x: b.x,
                            y: b.y,
                            w: b.w,
                            h: b.h,
                            z: s.zTop + 1,
                            minimized: false,
                            maximized: false
                        }
                    ]
                }));
        },
        closeWindow: (id)=>set((s)=>({
                    windows: s.windows.filter((w)=>w.id !== id)
                })),
        focusWindow: (id)=>set((s)=>({
                    zTop: s.zTop + 1,
                    windows: s.windows.map((w)=>w.id === id ? {
                            ...w,
                            z: s.zTop + 1
                        } : w)
                })),
        minimizeWindow: (id)=>set((s)=>({
                    windows: s.windows.map((w)=>w.id === id ? {
                            ...w,
                            minimized: true
                        } : w)
                })),
        toggleMaximize: (id)=>set((s)=>({
                    windows: s.windows.map((w)=>{
                        if (w.id !== id) return w;
                        if (w.maximized) {
                            const p = w.prev ?? {
                                x: 40,
                                y: 40,
                                w: 900,
                                h: 600
                            };
                            return {
                                ...w,
                                maximized: false,
                                ...p,
                                prev: undefined
                            };
                        }
                        return {
                            ...w,
                            maximized: true,
                            prev: {
                                x: w.x,
                                y: w.y,
                                w: w.w,
                                h: w.h
                            }
                        };
                    })
                })),
        moveWindow: (id, x, y)=>set((s)=>({
                    windows: s.windows.map((w)=>w.id === id ? {
                            ...w,
                            x,
                            y
                        } : w)
                })),
        resizeWindow: (id, w, h, x, y)=>set((s)=>({
                    windows: s.windows.map((win)=>win.id === id ? {
                            ...win,
                            w: Math.max(MIN_W, w),
                            h: Math.max(MIN_H, h),
                            x: x !== undefined ? x : win.x,
                            y: y !== undefined ? y : win.y
                        } : win)
                })),
        setStartOpen: (open)=>set({
                startOpen: open
            }),
        setIconPos: (id, pos)=>set((s)=>({
                    iconPositions: {
                        ...s.iconPositions,
                        [id]: pos
                    }
                })),
        resetIconLayout: ()=>set({
                iconPositions: {}
            }),
        pinToTaskbar: (id)=>{
            if (get().pinned.includes(id)) return false;
            set((s)=>({
                    pinned: [
                        ...s.pinned,
                        id
                    ]
                }));
            return true;
        },
        unpinFromTaskbar: (id)=>set((s)=>({
                    pinned: s.pinned.filter((p)=>p !== id)
                })),
        setHeaderDock: (dock)=>set({
                headerDock: dock
            }),
        setIconMode: (mode)=>set({
                iconMode: mode
            }),
        setSidebarCollapsed: (collapsed)=>set({
                sidebarCollapsed: collapsed
            }),
        setDragOverTaskbar: (over)=>set((s)=>s.dragOverTaskbar === over ? s : {
                    dragOverTaskbar: over
                })
    }), {
    /* Task 19/22: persist ONLY the desktop layout (icon positions + footer pins + header dock).
         skipHydration keeps SSR markup deterministic; Desktop rehydrates after mount. */ name: "erp.desktop.layout",
    version: 2,
    /* Task 35/37 — one-time migrations: retired desktop shortcuts (the
         BusinessStructure form and — Task 37 — the userManagement catalog app
         both moved into the Settings window). Strip them from persisted footer
         pins and icon positions so existing layouts match the new desktop;
         no other persisted key is touched. */ migrate: (persisted, version)=>{
        if (version >= 2) return persisted;
        const s = persisted ?? {};
        const retired = [
            "business-structure",
            "userManagement"
        ];
        return {
            ...s,
            pinned: (Array.isArray(s.pinned) ? s.pinned : DEFAULT_PINNED).filter((id)=>!retired.includes(id)),
            iconPositions: Object.fromEntries(Object.entries(s.iconPositions ?? {}).filter(([id])=>!retired.includes(id)))
        };
    },
    skipHydration: true,
    partialize: (s)=>({
            iconPositions: s.iconPositions,
            pinned: s.pinned,
            headerDock: s.headerDock,
            iconMode: s.iconMode,
            sidebarCollapsed: s.sidebarCollapsed
        })
}));
}),
"[project]/src/stores/dfb-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dfbApi",
    ()=>dfbApi,
    "executeQuery",
    ()=>executeQuery,
    "fetchFormDetail",
    ()=>fetchFormDetail,
    "findFormInTree",
    ()=>findFormInTree,
    "findMenuNode",
    ()=>findMenuNode,
    "loadFormData",
    ()=>loadFormData,
    "saveFormData",
    ()=>saveFormData,
    "useDfb",
    ()=>useDfb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-ssr] (ecmascript)");
"use client";
;
;
function collectUserIcons(nodes, out) {
    for (const n of nodes){
        if (n.nodeType === 1 && !n.isSystem) out.push(n);
    }
}
const useDfb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((set, get)=>({
        tree: [],
        loaded: false,
        loading: false,
        userIcons: [],
        load: async ()=>{
            if (get().loading) return;
            set({
                loading: true
            });
            try {
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appApi"])("advancedTools").get("menus/tree");
                const tree = res.items ?? [];
                const userIcons = [];
                collectUserIcons(tree, userIcons);
                set({
                    tree,
                    userIcons,
                    loaded: true,
                    loading: false
                });
            } catch  {
                set({
                    loading: false,
                    loaded: true
                });
            }
        }
    }));
function findMenuNode(nodes, id) {
    for (const n of nodes){
        if (n.id === id) return n;
        const hit = n.children ? findMenuNode(n.children, id) : null;
        if (hit) return hit;
    }
    return null;
}
function findFormInTree(nodes, id) {
    for (const n of nodes){
        const f = n.forms.find((x)=>x.id === id);
        if (f) return f;
        const hit = n.children ? findFormInTree(n.children, id) : null;
        if (hit) return hit;
    }
    return null;
}
const dfbApi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appApi"])("advancedTools");
async function fetchFormDetail(id) {
    const res = await dfbApi.get(`forms/${id}`);
    return res.item;
}
async function executeQuery(id) {
    const res = await dfbApi.post(`queries/${id}/execute`, {});
    return res.rows ?? [];
}
async function saveFormData(formId, values, externalKey) {
    return dfbApi.post(`forms/${formId}/data`, {
        values,
        externalKey
    });
}
async function loadFormData(formId) {
    const res = await dfbApi.get(`forms/${formId}/data`);
    return res.items ?? [];
}
}),
"[project]/src/stores/settings-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSettings",
    ()=>useSettings,
    "useT",
    ()=>useT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$dictionaries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/dictionaries.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const useSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        locale: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_LOCALE"],
        setLocale: (l)=>set({
                locale: l
            }),
        t: (k)=>{
            const dict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$dictionaries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDict"])(get().locale);
            return dict[k] ?? String(k);
        },
        dir: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dirOf"])(get().locale)
    }), {
    name: "erp.settings"
}));
function useT() {
    const locale = useSettings((s)=>s.locale);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
        const dict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$dictionaries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDict"])(locale);
        return (k)=>dict[k] ?? String(k);
    }, [
        locale
    ]);
}
}),
"[project]/src/types/business-structure.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Shared client-side types for the BusinessStructure domain (Task 17). */ __turbopack_context__.s([
    "CHILD_TYPE_RULES",
    ()=>CHILD_TYPE_RULES,
    "MAX_LEVELS",
    ()=>MAX_LEVELS,
    "ROOT_ALLOWED_TYPES",
    ()=>ROOT_ALLOWED_TYPES,
    "allowedChildTypes",
    ()=>allowedChildTypes,
    "bsTypeColor",
    ()=>bsTypeColor
]);
const CHILD_TYPE_RULES = {
    1: [
        2,
        3,
        4,
        5
    ],
    2: [
        2,
        3,
        4,
        5
    ],
    3: [
        4,
        5
    ],
    4: [
        4,
        5
    ],
    5: []
};
const ROOT_ALLOWED_TYPES = [
    1,
    2,
    3,
    4,
    5
];
const MAX_LEVELS = 5;
function allowedChildTypes(parentType) {
    if (parentType === null || parentType === undefined) return ROOT_ALLOWED_TYPES;
    return CHILD_TYPE_RULES[parentType] ?? [];
}
function bsTypeColor(type) {
    switch(type){
        case 1:
            return {
                bg: "bg-violet-500/15",
                text: "text-violet-600 dark:text-violet-400",
                ring: "ring-violet-500/30"
            };
        case 2:
            return {
                bg: "bg-amber-500/15",
                text: "text-amber-600 dark:text-amber-400",
                ring: "ring-amber-500/30"
            };
        case 3:
            return {
                bg: "bg-emerald-500/15",
                text: "text-emerald-600 dark:text-emerald-400",
                ring: "ring-emerald-500/30"
            };
        case 4:
            return {
                bg: "bg-sky-500/15",
                text: "text-sky-600 dark:text-sky-400",
                ring: "ring-sky-500/30"
            };
        case 5:
            return {
                bg: "bg-fuchsia-500/15",
                text: "text-fuchsia-600 dark:text-fuchsia-400",
                ring: "ring-fuchsia-500/30"
            };
        default:
            return {
                bg: "bg-primary/15",
                text: "text-primary",
                ring: "ring-primary/30"
            };
    }
}
}),
];})()

//# sourceMappingURL=src_1u7d0m992ci19._.js.map