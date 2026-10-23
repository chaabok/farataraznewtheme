module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/settings/[...path]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>proxy,
    "GET",
    ()=>proxy,
    "PATCH",
    ()=>proxy,
    "POST",
    ()=>proxy,
    "PUT",
    ()=>proxy,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$internal$2d$sign$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/internal-sign.ts [app-route] (ecmascript)");
;
/**
 * BFF proxy → settings-service (سرویس عمومی, port 3001).
 * The browser only ever sees relative /api/settings/** paths (§3.3).
 * §4: every upstream hop is HMAC-signed (secret never leaves the server).
 */ const BASE = process.env.SETTINGS_SERVICE_URL ?? "http://127.0.0.1:3001";
const runtime = "nodejs";
const dynamic = "force-dynamic";
async function proxy(req, ctx) {
    const { path } = await ctx.params;
    const upstreamPath = `/${(path ?? []).join("/")}`;
    const target = `${BASE}${upstreamPath}${new URL(req.url).search}`;
    const init = {
        method: req.method,
        headers: {
            "content-type": "application/json",
            accept: "application/json",
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$internal$2d$sign$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signedInternalHeaders"])(req.method, upstreamPath)
        },
        cache: "no-store"
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
        init.body = await req.text();
    }
    try {
        const res = await fetch(target, init);
        const text = await res.text();
        return new Response(text, {
            status: res.status,
            headers: {
                "content-type": "application/json; charset=utf-8"
            }
        });
    } catch  {
        return Response.json({
            statusCode: 502,
            message: "settings-service unavailable",
            messageKey: "common.error"
        }, {
            status: 502
        });
    }
}
;
}),
"[project]/src/lib/internal-sign.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INTERNAL_KEY_HEADER",
    ()=>INTERNAL_KEY_HEADER,
    "INTERNAL_SIGN_HEADER",
    ()=>INTERNAL_SIGN_HEADER,
    "INTERNAL_TS_HEADER",
    ()=>INTERNAL_TS_HEADER,
    "normalizePath",
    ()=>normalizePath,
    "signedInternalHeaders",
    ()=>signedInternalHeaders
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const INTERNAL_KEY_HEADER = "x-internal-key";
const INTERNAL_TS_HEADER = "x-internal-timestamp";
const INTERNAL_SIGN_HEADER = "x-internal-signature";
function normalizePath(pathname) {
    const p = pathname.split("?")[0];
    return p.length > 1 ? p.replace(/\/+$/, "") : p;
}
function signedInternalHeaders(method, pathname) {
    const secret = process.env.INTERNAL_API_KEY ?? "";
    const ts = Date.now().toString();
    const canonical = `${method.toUpperCase()}:${normalizePath(pathname)}:${ts}`;
    return {
        [INTERNAL_KEY_HEADER]: secret,
        [INTERNAL_TS_HEADER]: ts,
        [INTERNAL_SIGN_HEADER]: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", secret).update(canonical).digest("hex")
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__01x_s2i-l3nco._.js.map