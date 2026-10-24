(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/desktop/app-tile.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppTile",
    ()=>AppTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/app-catalog.ts [app-client] (ecmascript)");
"use client";
;
;
;
function AppTile({ appKey, className, iconClass, style, iconStyle }) {
    const glyph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAppIcon"])(appKey);
    const Icon = glyph?.Icon;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": true,
        style: style,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", glyph?.tile ?? "from-slate-400 to-slate-600", className ?? "h-9 w-9"),
        children: Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
            style: iconStyle,
            className: iconClass ?? "h-5 w-5"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/app-tile.tsx",
            lineNumber: 35,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[10px]",
            children: "···"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/app-tile.tsx",
            lineNumber: 37,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/app-tile.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = AppTile;
var _c;
__turbopack_context__.k.register(_c, "AppTile");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/desktop/app-window.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppWindow",
    ()=>AppWindow,
    "useWindowChrome",
    ()=>useWindowChrome
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const TASKBAR_H = 52;
/* Task 28 — chromeless windows render NO light title bar: their form header
   (green gradient strip of SimpleFormTwoRowTabbed / SimpleTreeForm) becomes
   the drag handle and hosts the minimize/maximize/close caption buttons via
   WindowChrome. Extend this list when another window kind adopts the form
   shell. Task 32 — BusinessStructureWindow adopts SimpleTreeForm. */ const CHROMELESS_KINDS = [
    "form-demo",
    "tree-demo",
    "business-structure",
    "dfb-builder",
    "dfb-form"
];
const WindowChromeContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"](null);
function useWindowChrome() {
    _s();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"](WindowChromeContext);
}
_s(useWindowChrome, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function AppWindow({ win, title, icon, children }) {
    _s1();
    const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const dragRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const resizeRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    /* latest window state for stable drag callbacks (no stale closures,
     no per-frame context churn while dragging) */ const winRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](win);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"]({
        "AppWindow.useLayoutEffect": ()=>{
            winRef.current = win;
        }
    }["AppWindow.useLayoutEffect"]);
    const vw = ("TURBOPACK compile-time truthy", 1) ? window.innerWidth : "TURBOPACK unreachable";
    const vh = ("TURBOPACK compile-time truthy", 1) ? window.innerHeight : "TURBOPACK unreachable";
    const startDrag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "AppWindow.useCallback[startDrag]": (e)=>{
            const w = winRef.current;
            if (e.target.closest("[data-window-btn]")) return;
            focusWindow(w.id);
            if (w.maximized) return;
            dragRef.current = {
                dx: e.clientX - w.x,
                dy: e.clientY - w.y
            };
            /* capture keeps the drag alive when the pointer leaves the strip;
         a vanished pointer (synthetic/edge cases) must not crash — the
         header-targeted handlers still receive events while it hovers */ try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch  {
            /* no active pointer — ignore */ }
        }
    }["AppWindow.useCallback[startDrag]"], [
        focusWindow
    ]);
    const moveDrag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "AppWindow.useCallback[moveDrag]": (e)=>{
            const w = winRef.current;
            if (!dragRef.current) return;
            const x = clamp(e.clientX - dragRef.current.dx, -w.w + 140, vw - 80);
            const y = clamp(e.clientY - dragRef.current.dy, 0, vh - TASKBAR_H - 40);
            moveWindow(w.id, x, y);
        }
    }["AppWindow.useCallback[moveDrag]"], [
        moveWindow,
        vw,
        vh
    ]);
    const endDrag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "AppWindow.useCallback[endDrag]": ()=>{
            dragRef.current = null;
        }
    }["AppWindow.useCallback[endDrag]"], []);
    const doubleClickHeader = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "AppWindow.useCallback[doubleClickHeader]": ()=>toggleMaximize(winRef.current.id)
    }["AppWindow.useCallback[doubleClickHeader]"], [
        toggleMaximize
    ]);
    const onResizePointerDown = (e)=>{
        e.stopPropagation();
        focusWindow(win.id);
        resizeRef.current = {
            x: e.clientX,
            y: e.clientY,
            w: win.w,
            h: win.h
        };
        /* same vanished-pointer guard as startDrag — synthetic/edge-case
       pointers must not crash (uncaught NotFoundError in dev.log) */ try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch  {
        /* no active pointer — ignore */ }
    };
    const onResizePointerMove = (e)=>{
        if (!resizeRef.current) return;
        const r = resizeRef.current;
        resizeWindow(win.id, r.w + (e.clientX - r.x), r.h + (e.clientY - r.y));
    };
    const onResizePointerUp = ()=>resizeRef.current = null;
    if (win.minimized) return null;
    const maximized = win.maximized;
    const chromeless = CHROMELESS_KINDS.includes(win.kind);
    /* Task 28 — stable caption API for the chromeless form header */ const chrome = {
        onDragStart: startDrag,
        onDragMove: moveDrag,
        onDragEnd: endDrag,
        onDoubleClick: doubleClickHeader,
        onMinimize: ()=>minimizeWindow(win.id),
        onToggleMaximize: ()=>toggleMaximize(win.id),
        onClose: ()=>closeWindow(win.id)
    };
    /* clamp to viewport so windows never overflow on small screens */ const effW = Math.min(win.w, vw - 24);
    const effH = Math.min(win.h, vh - TASKBAR_H - 24);
    const effX = clamp(win.x, 12, Math.max(12, vw - effW - 12));
    const effY = clamp(win.y, 12, Math.max(12, vh - TASKBAR_H - effH - 12));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(/* Task 31 — the window root is OPAQUE (bg-card): desktop icons /
           wallpaper behind an open window must never bleed through the form
           (owner report). Acrylic glass stays on flyouts, taskbar and start
           menu — authentic Windows-11: window frames are solid. */ "pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl bg-card win-shadow window-in", maximized && "rounded-none"),
        style: /* Task 28 — the windows layer already stops at the taskbar
           (bottom: 52); a maximized window simply fills the layer, so the
           form footer sits flush on the desktop footer (no 52px gap). */ maximized ? {
            inset: 0,
            zIndex: win.z
        } : {
            left: effX,
            top: effY,
            width: effW,
            height: effH,
            zIndex: win.z
        },
        onPointerDown: ()=>focusWindow(win.id),
        children: [
            !chromeless && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-10 shrink-0 cursor-default items-center gap-2 border-b border-border/60 px-3 select-none",
                onPointerDown: startDrag,
                onPointerMove: moveDrag,
                onPointerUp: endDrag,
                onDoubleClick: doubleClickHeader,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex h-5 w-5 items-center justify-center",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/app-window.tsx",
                        lineNumber: 171,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate text-xs font-semibold text-foreground/90",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/app-window.tsx",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ms-auto flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "data-window-btn": true,
                                "aria-label": t("common.minimize"),
                                className: "flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 cursor-pointer",
                                onClick: ()=>minimizeWindow(win.id),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/app-window.tsx",
                                    lineNumber: 180,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/app-window.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "data-window-btn": true,
                                "aria-label": t("common.maximize"),
                                className: "flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 cursor-pointer",
                                onClick: ()=>toggleMaximize(win.id),
                                children: maximized ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-3 w-3 -scale-x-100"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/app-window.tsx",
                                    lineNumber: 188,
                                    columnNumber: 28
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                    className: "h-3 w-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/app-window.tsx",
                                    lineNumber: 188,
                                    columnNumber: 72
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/app-window.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "data-window-btn": true,
                                "aria-label": t("common.close"),
                                className: "flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-red-500 hover:text-white cursor-pointer",
                                onClick: ()=>closeWindow(win.id),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/app-window.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/app-window.tsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/app-window.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/app-window.tsx",
                lineNumber: 164,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-0 flex-1 overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WindowChromeContext.Provider, {
                    value: chrome,
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/desktop/app-window.tsx",
                    lineNumber: 204,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/app-window.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this),
            !maximized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 end-0 h-5 w-5 cursor-nwse-resize touch-none",
                onPointerDown: onResizePointerDown,
                onPointerMove: onResizePointerMove,
                onPointerUp: onResizePointerUp
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/app-window.tsx",
                lineNumber: 209,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/app-window.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_s1(AppWindow, "S3nia1u2ePDlq0cYAalH5ky36vc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"]
    ];
});
_c = AppWindow;
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}
var _c;
__turbopack_context__.k.register(_c, "AppWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/desktop/dashboard-header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardHeader",
    ()=>DashboardHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-horizontal.js [app-client] (ecmascript) <export default as GripHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-vertical.js [app-client] (ecmascript) <export default as GripVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left.js [app-client] (ecmascript) <export default as PanelLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-right.js [app-client] (ecmascript) <export default as PanelRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$top$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelTop$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-top.js [app-client] (ecmascript) <export default as PanelTop>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/floating-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
/* Task 22 — dockable dashboard header (owner re-spec of Task 21):
   • "top"          → horizontal bar spanning the FULL page width,
                      height exactly 30% less than the 52px footer (52 × 0.7 = 36.4px)
   • "left"/"right" → vertical strip spanning the full desktop height (thickness 36.4px)
   The user drags the bar with the mouse; a live preview highlights the target edge
   (pointer x < 30% → left, > 70% → right, otherwise top) and release commits the dock.
   The dock persists in `erp.desktop.layout` (headerDock). */ const THICK = 36.4; /* 52 × 0.7 — owner height contract */ 
const TASKBAR_H = 52; /* keep the footer visible under vertical docks (§7.7) */ 
const DRAG_THRESHOLD = 6;
function zoneFor(x, vw) {
    if (x < vw * 0.3) return "left";
    if (x > vw * 0.7) return "right";
    return "top";
}
/* hydration-safe clock (same pattern as the taskbar): server snapshot = 0 */ function subscribeClock(onChange) {
    const id = setInterval(onChange, 1_000);
    return ()=>clearInterval(id);
}
function clientSeconds() {
    return Math.floor(Date.now() / 1_000);
}
function serverSeconds() {
    return 0;
}
function DashboardHeader() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "DashboardHeader.useSettings[locale]": (s)=>s.locale
    }["DashboardHeader.useSettings[locale]"]);
    const dock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DashboardHeader.useDesktop[dock]": (s)=>s.headerDock
    }["DashboardHeader.useDesktop[dock]"]);
    const setHeaderDock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DashboardHeader.useDesktop[setHeaderDock]": (s)=>s.setHeaderDock
    }["DashboardHeader.useDesktop[setHeaderDock]"]);
    const setStartOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DashboardHeader.useDesktop[setStartOpen]": (s)=>s.setStartOpen
    }["DashboardHeader.useDesktop[setStartOpen]"]);
    /* SSR-safe: wait for the persisted layout rehydrate, then reveal the bar */ const [mounted, setMounted] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DashboardHeader.useEffect": ()=>{
            let alive = true;
            /* rehydrate() is typed `void | Promise<void>` in this zustand version */ Promise.resolve(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].persist.rehydrate()).then({
                "DashboardHeader.useEffect": ()=>{
                    if (alive) setMounted(true);
                }
            }["DashboardHeader.useEffect"]);
            return ({
                "DashboardHeader.useEffect": ()=>{
                    alive = false;
                }
            })["DashboardHeader.useEffect"];
        }
    }["DashboardHeader.useEffect"], []);
    /* narrow viewports get the compact content (icon search, no badge) */ const [narrow, setNarrow] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DashboardHeader.useEffect": ()=>{
            const mq = window.matchMedia("(max-width: 639px)");
            const apply = {
                "DashboardHeader.useEffect.apply": ()=>setNarrow(mq.matches)
            }["DashboardHeader.useEffect.apply"];
            apply();
            mq.addEventListener("change", apply);
            return ({
                "DashboardHeader.useEffect": ()=>mq.removeEventListener("change", apply)
            })["DashboardHeader.useEffect"];
        }
    }["DashboardHeader.useEffect"], []);
    const vertical = dock !== "top";
    const barRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    /* live drag state: pointer-follow position + grab offset; zone = predicted dock */ const [drag, setDrag] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [zone, setZone] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("top");
    const suppressClickRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](false);
    const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const beginDrag = (e)=>{
        if (e.button !== 0) return;
        const bar = barRef.current?.getBoundingClientRect();
        if (!bar) return;
        const grabX = e.clientX - bar.left;
        const grabY = e.clientY - bar.top;
        const startX = e.clientX;
        const startY = e.clientY;
        const pointerId = e.pointerId;
        let active = false;
        let target = dock;
        const onMove = (ev)=>{
            if (ev.pointerId !== pointerId) return;
            if (!active && Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
            active = true;
            target = zoneFor(ev.clientX, window.innerWidth);
            setZone(target);
            setDrag({
                x: ev.clientX - grabX,
                y: ev.clientY - grabY
            });
        };
        const finish = (commit)=>{
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onCancel);
            if (active) {
                /* a real drag happened — swallow the trailing click on child buttons */ suppressClickRef.current = true;
                window.setTimeout(()=>{
                    suppressClickRef.current = false;
                }, 0);
                if (commit) setHeaderDock(target);
            }
            setDrag(null);
        };
        const onUp = (ev)=>{
            if (ev.pointerId === pointerId) finish(true);
        };
        const onCancel = (ev)=>{
            if (ev.pointerId === pointerId) finish(false);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onCancel);
    };
    /* hydration-safe date — the footer shows the time, the header shows the weekday */ const seconds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"](subscribeClock, clientSeconds, serverSeconds);
    const now = seconds > 0 ? new Date(seconds * 1_000) : null;
    const dateLong = now ? now.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long"
    }) : "";
    const dateShort = now ? now.toLocaleDateString(locale, {
        day: "numeric",
        month: "short"
    }) : "";
    if (!mounted) return null;
    const dragging = drag !== null;
    /* ---------- shared content pieces (used by the docked bar AND the drag ghost) ---------- */ const grip = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        "aria-label": t("header.dragHint"),
        title: t("header.dragHint"),
        onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("header.dragHint")),
        className: "flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground",
        children: vertical ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__["GripHorizontal"], {
            className: "h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
            lineNumber: 159,
            columnNumber: 19
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__["GripVertical"], {
            className: "h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
            lineNumber: 159,
            columnNumber: 64
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
    const brandTile = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        title: t("app.name"),
        className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
            className: "h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
            lineNumber: 168,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 164,
        columnNumber: 5
    }, this);
    const searchBtn = vertical || narrow ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>setStartOpen(true),
        title: t("header.search"),
        "aria-label": t("header.search"),
        className: "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
            lineNumber: 180,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>setStartOpen(true),
        title: t("header.search"),
        "aria-label": t("header.search"),
        className: "flex h-6 min-w-0 cursor-pointer items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                className: "h-3 w-3 shrink-0"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "max-w-40 truncate",
                children: t("header.search")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
    const dateEl = vertical ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex shrink-0 flex-col items-center gap-1.5 pb-1 text-foreground/80",
        title: dateLong,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                className: "h-3 w-3 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    writingMode: "vertical-rl"
                },
                className: "text-[10px] tabular-nums",
                children: dateLong
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 196,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-foreground/80",
        title: dateLong,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                className: "h-3 w-3 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "tabular-nums",
                children: narrow ? dateShort : dateLong
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 211,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 206,
        columnNumber: 5
    }, this);
    const content = vertical ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            grip,
            brandTile,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "my-1 h-px w-4 shrink-0 bg-foreground/15",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            searchBtn,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "min-h-2 flex-1",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 221,
                columnNumber: 7
            }, this),
            dateEl
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 216,
        columnNumber: 5
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            grip,
            brandTile,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "truncate text-xs font-semibold text-foreground/95",
                children: t("app.shortName")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            !narrow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "shrink-0 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary",
                children: t("header.dashboard")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 232,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mx-1 hidden h-4 w-px shrink-0 bg-foreground/15 sm:block",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 236,
                columnNumber: 7
            }, this),
            searchBtn,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "min-w-2 flex-1",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            dateEl
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 225,
        columnNumber: 5
    }, this);
    /* ---------- geometry ---------- */ const dockedStyle = dock === "top" ? {
        top: 0,
        left: 0,
        right: 0,
        height: THICK
    } : {
        top: 0,
        bottom: TASKBAR_H,
        width: THICK,
        ...dock === "left" ? {
            left: 0
        } : {
            right: 0
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                ref: barRef,
                "data-desktop-header": true,
                "data-dock": dock,
                onPointerDown: beginDrag,
                onDoubleClick: ()=>{
                    if (!suppressClickRef.current) setHeaderDock("top"); /* snap back to top */ 
                },
                onContextMenu: (e)=>{
                    e.preventDefault();
                    setMenu({
                        x: e.clientX,
                        y: e.clientY
                    });
                },
                onClickCapture: (e)=>{
                    if (suppressClickRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                style: dockedStyle,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic menu-in fixed z-[9200] flex select-none items-center border-foreground/10 shadow-sm", vertical ? "flex-col gap-1.5 px-1 py-2" : "flex-row gap-2 px-2 sm:px-3", dock === "top" && "border-b", dock === "left" && "border-r", dock === "right" && "border-l", dragging && "pointer-events-none opacity-0"),
                children: content
            }, dock, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            drag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": true,
                        className: "menu-in pointer-events-none fixed z-[9150] bg-primary/12 ring-2 ring-inset ring-primary/60",
                        style: zone === "top" ? {
                            top: 0,
                            left: 0,
                            right: 0,
                            height: THICK
                        } : {
                            top: 0,
                            bottom: TASKBAR_H,
                            width: THICK,
                            ...zone === "left" ? {
                                left: 0
                            } : {
                                right: 0
                            }
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                dir: "auto",
                                className: "acrylic whitespace-nowrap rounded-full border bg-background/90 px-3 py-1 text-[11px] font-medium shadow-md",
                                children: t("header.dropHint")
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                                lineNumber: 298,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                            lineNumber: 297,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": true,
                        className: "pointer-events-none fixed z-[9600]",
                        style: {
                            left: drag.x,
                            top: drag.y
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic flex items-center rounded-xl border border-foreground/10 shadow-2xl ring-2 ring-primary/50", vertical ? "w-[36.4px] flex-col gap-1.5 px-1 py-2" : "h-[36.4px] gap-2 px-2"),
                            children: content
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                            lineNumber: 308,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                        lineNumber: 307,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 287,
                columnNumber: 9
            }, this),
            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatingMenu"], {
                x: menu.x,
                y: menu.y,
                onClose: ()=>setMenu(null),
                items: [
                    {
                        label: t("header.dockTop"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$top$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelTop$3e$__["PanelTop"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                            lineNumber: 329,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>setHeaderDock("top")
                    },
                    {
                        label: t("header.dockLeft"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__["PanelLeft"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                            lineNumber: 334,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>setHeaderDock("left")
                    },
                    {
                        label: t("header.dockRight"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRight$3e$__["PanelRight"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                            lineNumber: 339,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>setHeaderDock("right")
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 322,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/dashboard-header.tsx",
        lineNumber: 251,
        columnNumber: 5
    }, this);
}
_s(DashboardHeader, "g58FCyqbfKBwmrVNA3wSZmLM780=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"]
    ];
});
_c = DashboardHeader;
var _c;
__turbopack_context__.k.register(_c, "DashboardHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/desktop/desktop.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Desktop",
    ()=>Desktop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-plus-2.js [app-client] (ecmascript) <export default as FilePlus2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-tree.js [app-client] (ecmascript) <export default as ListTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-client] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-close.js [app-client] (ecmascript) <export default as PanelLeftClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-open.js [app-client] (ecmascript) <export default as PanelLeftOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-right-close.js [app-client] (ecmascript) <export default as PanelRightClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-right-open.js [app-client] (ecmascript) <export default as PanelRightOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-client] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin-off.js [app-client] (ecmascript) <export default as PinOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$direction$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-direction/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/app-registry-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$taskbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/taskbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$dashboard$2d$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/dashboard-header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$start$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/start-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/floating-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/business-structure/bs-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$settings$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/settings-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$app$2d$placeholder$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/app-placeholder-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$demo$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-demo-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$tree$2d$demo$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/tree-demo-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const STATIC_WINDOWS = {
    "business-structure": {
        titleKey: "menus.businessStructure",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-violet-700 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 52,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BusinessStructureWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 55,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    settings: {
        titleKey: "settings.title",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
            appKey: "settings",
            className: "h-5 w-5 rounded-md",
            iconClass: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 59,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$settings$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SettingsWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 60,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    /* Task 24 — live sample of the SimpleFormTwoRowTabbed form shell (additive;
     the 27 catalog placeholders keep their §4.6 contract untouched) */ "form-demo": {
        titleKey: "fdf.iconLabel",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 67,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$demo$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormDemoWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 71,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    /* Task 30 — live sample of the SimpleTreeForm master-detail shell
     (additive; the 27 catalog placeholders keep their §4.6 contract) */ "tree-demo": {
        titleKey: "stf.iconLabel",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 79,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 78,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$tree$2d$demo$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TreeDemoWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 82,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    }
};
function resolveWindowMeta(win, t) {
    if (win.kind === "app") {
        const appKey = win.appKey ?? "";
        return {
            title: t(`app.${appKey}`),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
                appKey: appKey,
                className: "h-5 w-5 rounded-md",
                iconClass: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 91,
                columnNumber: 13
            }, this),
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$app$2d$placeholder$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppPlaceholderWindow"], {
                appKey: appKey
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 92,
                columnNumber: 16
            }, this)
        };
    }
    const meta = STATIC_WINDOWS[win.kind];
    return {
        title: t(meta.titleKey),
        icon: meta.icon,
        content: meta.content
    };
}
/* ---------------- Task 19 — desktop icon drag & drop geometry ---------------- */ const ICON_W = 84;
const ICON_H = 100;
const GRID_STEP_X = 88;
const GRID_STEP_Y = 106;
const GRID_PAD = 8;
/* Task 22: header thickness = 52 × 0.7 = 36.4px (owner height contract).
   Docked header reserves its strip: layers below/beside it get this + the 8px pad. */ const HEADER_THICK = 36.4;
const DRAG_THRESHOLD = 6;
function DesktopIcons() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "DesktopIcons.useSettings[dir]": (s)=>s.dir()
    }["DesktopIcons.useSettings[dir]"]);
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "DesktopIcons.useSettings[locale]": (s)=>s.locale
    }["DesktopIcons.useSettings[locale]"]);
    /* Task 39 — owner request: icons are ordered by the selected language
     (fa → Persian alphabet, en → A-Z, …) via Intl collation. */ const collator = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "DesktopIcons.useMemo[collator]": ()=>new Intl.Collator(locale, {
                numeric: true
            })
    }["DesktopIcons.useMemo[collator]"], [
        locale
    ]);
    const openWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[openWindow]": (s)=>s.openWindow
    }["DesktopIcons.useDesktop[openWindow]"]);
    const iconPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[iconPositions]": (s)=>s.iconPositions
    }["DesktopIcons.useDesktop[iconPositions]"]);
    const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[pinned]": (s)=>s.pinned
    }["DesktopIcons.useDesktop[pinned]"]);
    const setIconPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[setIconPos]": (s)=>s.setIconPos
    }["DesktopIcons.useDesktop[setIconPos]"]);
    const resetIconLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[resetIconLayout]": (s)=>s.resetIconLayout
    }["DesktopIcons.useDesktop[resetIconLayout]"]);
    const pinToTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[pinToTaskbar]": (s)=>s.pinToTaskbar
    }["DesktopIcons.useDesktop[pinToTaskbar]"]);
    const setDragOverTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[setDragOverTaskbar]": (s)=>s.setDragOverTaskbar
    }["DesktopIcons.useDesktop[setDragOverTaskbar]"]);
    const headerDock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[headerDock]": (s)=>s.headerDock
    }["DesktopIcons.useDesktop[headerDock]"]);
    /* Task 38 — sidebar presentation state (owner request) */ const iconMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[iconMode]": (s)=>s.iconMode
    }["DesktopIcons.useDesktop[iconMode]"]);
    const sidebarCollapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[sidebarCollapsed]": (s)=>s.sidebarCollapsed
    }["DesktopIcons.useDesktop[sidebarCollapsed]"]);
    const setIconMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[setIconMode]": (s)=>s.setIconMode
    }["DesktopIcons.useDesktop[setIconMode]"]);
    const setSidebarCollapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "DesktopIcons.useDesktop[setSidebarCollapsed]": (s)=>s.setSidebarCollapsed
    }["DesktopIcons.useDesktop[setSidebarCollapsed]"]);
    const { apps, load } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppRegistry"])();
    const layerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const [rect, setRect] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [freeMode, setFreeMode] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [selected, setSelected] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [ghost, setGhost] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const suppressClickRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DesktopIcons.useEffect": ()=>{
            void load();
        }
    }["DesktopIcons.useEffect"], [
        load
    ]);
    /* SSR-safe: persisted layout (icon positions + footer pins) rehydrated after mount */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DesktopIcons.useEffect": ()=>{
            void __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].persist.rehydrate();
        }
    }["DesktopIcons.useEffect"], []);
    /* free positioning + dragging on ≥640px viewports; small screens keep the wrap flow */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DesktopIcons.useEffect": ()=>{
            const mq = window.matchMedia("(min-width: 640px)");
            const apply = {
                "DesktopIcons.useEffect.apply": ()=>setFreeMode(mq.matches)
            }["DesktopIcons.useEffect.apply"];
            apply();
            mq.addEventListener("change", apply);
            return ({
                "DesktopIcons.useEffect": ()=>mq.removeEventListener("change", apply)
            })["DesktopIcons.useEffect"];
        }
    }["DesktopIcons.useEffect"], []);
    /* measure the icons layer for clamping (viewport resizes keep icons inside).
     Task 39: re-attach on every grid (re)mount — the layer unmounts while the
     Task-38 sidebar is open, so a one-shot observer would leave a stale rect. */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DesktopIcons.useEffect": ()=>{
            if (iconMode !== "grid") return;
            const el = layerRef.current;
            if (!el) return;
            const update = {
                "DesktopIcons.useEffect.update": ()=>setRect({
                        w: el.clientWidth,
                        h: el.clientHeight
                    })
            }["DesktopIcons.useEffect.update"];
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return ({
                "DesktopIcons.useEffect": ()=>ro.disconnect()
            })["DesktopIcons.useEffect"];
        }
    }["DesktopIcons.useEffect"], [
        iconMode
    ]);
    const clampPos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "DesktopIcons.useCallback[clampPos]": (p)=>{
            const w = rect?.w ?? (("TURBOPACK compile-time truthy", 1) ? Math.max(0, window.innerWidth - 16) : "TURBOPACK unreachable");
            const h = rect?.h ?? (("TURBOPACK compile-time truthy", 1) ? Math.max(0, window.innerHeight - 68) : "TURBOPACK unreachable");
            return {
                x: Math.min(Math.max(p.x, 0), Math.max(0, w - ICON_W)),
                y: Math.min(Math.max(p.y, 0), Math.max(0, h - ICON_H))
            };
        }
    }["DesktopIcons.useCallback[clampPos]"], [
        rect
    ]);
    /* default slot = column-major grid anchored to the start edge (right in RTL, left in LTR) */ const defaultPos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "DesktopIcons.useCallback[defaultPos]": (index)=>{
            const h = rect?.h ?? (("TURBOPACK compile-time truthy", 1) ? Math.max(1, window.innerHeight - 68) : "TURBOPACK unreachable");
            const w = rect?.w ?? (("TURBOPACK compile-time truthy", 1) ? Math.max(1, window.innerWidth - 16) : "TURBOPACK unreachable");
            const rows = Math.max(1, Math.floor((h - GRID_PAD) / GRID_STEP_Y));
            const col = Math.floor(index / rows);
            const row = index % rows;
            const x = dir === "rtl" ? w - GRID_PAD - ICON_W - col * GRID_STEP_X : GRID_PAD + col * GRID_STEP_X;
            return {
                x,
                y: GRID_PAD + row * GRID_STEP_Y
            };
        }
    }["DesktopIcons.useCallback[defaultPos]"], [
        rect,
        dir
    ]);
    /* Task 35 — the BusinessStructure shortcut left the desktop: the form
     moved into the Settings window as a sub-page (owner request). Icons:
     the Task-24/Task-30 form-shell samples, then the catalog apps minus
     userManagement — it moved into the Settings window too (Task 37). */ const items = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "DesktopIcons.useMemo[items]": ()=>{
            const base = [
                {
                    id: "form-demo",
                    kind: "form-demo",
                    label: t("fdf.iconLabel")
                },
                {
                    id: "tree-demo",
                    kind: "tree-demo",
                    label: t("stf.iconLabel")
                },
                ...apps.filter({
                    "DesktopIcons.useMemo[items]": (a)=>a.appKey !== "userManagement"
                }["DesktopIcons.useMemo[items]"]).map({
                    "DesktopIcons.useMemo[items]": (a)=>({
                            id: a.appKey,
                            kind: "app",
                            appKey: a.appKey,
                            label: t(a.titleKey)
                        })
                }["DesktopIcons.useMemo[items]"])
            ];
            /* Task 39 — owner request: order by the active language's collation in
       BOTH presentations, so the desktop grid and the sidebar always tell
       the same story (labels are unique, the id is just a stable tiebreak). */ return base.sort({
                "DesktopIcons.useMemo[items]": (a, b)=>collator.compare(a.label, b.label) || collator.compare(a.id, b.id)
            }["DesktopIcons.useMemo[items]"]);
        }
    }["DesktopIcons.useMemo[items]"], [
        apps,
        t,
        collator
    ]);
    /* Task 36 — the catalog "settings" icon opens the real Settings window too:
     openWindow redirects (app, "settings") → kind "settings", so this icon,
     the taskbar pin and the start-menu tile all share one Settings window. */ const activate = (entry)=>openWindow(entry.kind, entry.appKey);
    /* Task 39 — self-heal: a persisted icon layout whose icons visually overlap
     (a legacy pile, or positions clamped together by a resize) is discarded in
     favor of the clean language-sorted grid. Deliberate drag positions that do
     NOT overlap are left untouched, and plain re-renders (selection, drag
     ghost…) never re-evaluate this — only grid (re)mounts and real layer
     geometry changes do. */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "DesktopIcons.useEffect": ()=>{
            if (iconMode !== "grid" || !freeMode || !rect) return;
            const saved = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().iconPositions;
            const pts = items.map({
                "DesktopIcons.useEffect.pts": (entry, i)=>clampPos(saved[entry.id] ?? defaultPos(i))
            }["DesktopIcons.useEffect.pts"]);
            for(let a = 0; a < pts.length; a++){
                for(let b = a + 1; b < pts.length; b++){
                    const p = pts[a];
                    const q = pts[b];
                    if (p.x < q.x + ICON_W && q.x < p.x + ICON_W && p.y < q.y + ICON_H && q.y < p.y + ICON_H) {
                        resetIconLayout();
                        return;
                    }
                }
            }
        }
    }["DesktopIcons.useEffect"], [
        iconMode,
        freeMode,
        rect,
        items,
        clampPos,
        defaultPos,
        resetIconLayout
    ]);
    const beginDragTracking = (e, entry)=>{
        if (!freeMode || e.button !== 0) return;
        const btn = e.currentTarget.getBoundingClientRect();
        const grab = {
            x: e.clientX - btn.left,
            y: e.clientY - btn.top
        };
        const startX = e.clientX;
        const startY = e.clientY;
        const pointerId = e.pointerId;
        const taskbarTop = document.querySelector("[data-taskbar]")?.getBoundingClientRect().top ?? (("TURBOPACK compile-time truthy", 1) ? window.innerHeight - 52 : "TURBOPACK unreachable");
        let active = false;
        let over = false;
        const onMove = (ev)=>{
            if (ev.pointerId !== pointerId) return;
            if (!active) {
                if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) return;
                active = true;
                setSelected(entry.id);
            }
            const o = ev.clientY >= taskbarTop - 12;
            if (o !== over) {
                over = o;
                setDragOverTaskbar(o);
            }
            setGhost({
                entry,
                x: ev.clientX - grab.x,
                y: ev.clientY - grab.y,
                overTaskbar: o
            });
        };
        const finish = (ev, commit)=>{
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onCancel);
            setDragOverTaskbar(false);
            setGhost(null);
            if (!active) return; /* plain click — let onClick/dblclick behave normally */ 
            suppressClickRef.current = true;
            window.setTimeout(()=>{
                suppressClickRef.current = false;
            }, 0);
            if (!commit || !ev) return;
            if (over) {
                if (pinToTaskbar(entry.id)) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.pinnedToast"));
                else __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("taskbar.alreadyPinned"));
                return;
            }
            const layer = layerRef.current?.getBoundingClientRect();
            if (!layer) return;
            setIconPos(entry.id, clampPos({
                x: ev.clientX - grab.x - layer.left,
                y: ev.clientY - grab.y - layer.top
            }));
        };
        const onUp = (ev)=>finish(ev, true);
        const onCancel = ()=>finish(null, false);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onCancel);
    };
    const handleClick = (e, entry)=>{
        if (suppressClickRef.current) return;
        setSelected(entry.id);
        /* touch devices: single tap opens (desktop convention: double-click) */ if (window.matchMedia?.("(pointer: coarse)").matches) activate(entry);
    };
    const handleContextMenu = (e, entry)=>{
        e.preventDefault();
        setSelected(entry.id);
        setMenu({
            x: e.clientX,
            y: e.clientY,
            entry,
            source: "grid"
        });
    };
    const iconGlyph = (entry)=>entry.id === "form-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 348,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 347,
            columnNumber: 7
        }, this) : entry.id === "tree-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 352,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 351,
            columnNumber: 7
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
            appKey: entry.appKey ?? "",
            className: "h-12 w-12 rounded-2xl",
            iconClass: "h-6 w-6"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 355,
            columnNumber: 7
        }, this);
    /* Task 38 — sidebar geometry: the panel docks on the inline-start edge,
     sliding clear of a dashboard header docked on the same side (§1.4:
     logical positioning only — no physical classes). */ const sidebarOpen = iconMode === "sidebar";
    const startDockedHeader = dir === "rtl" && headerDock === "right" || dir === "ltr" && headerDock === "left";
    const startOffset = startDockedHeader ? HEADER_THICK + GRID_PAD : GRID_PAD;
    const topOffset = headerDock === "top" ? HEADER_THICK + GRID_PAD : GRID_PAD;
    const SIDEBAR_W = "min(272px, 100vw - 72px)";
    const toggleStart = sidebarOpen ? `calc(${startOffset}px + ${sidebarCollapsed ? "64px" : SIDEBAR_W} + 8px)` : `${startOffset + 4}px`;
    const ToggleIcon = sidebarOpen ? dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__["PanelRightClose"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__["PanelLeftClose"] : dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__["PanelRightOpen"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__["PanelLeftOpen"];
    const SidebarCollapseIcon = dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"];
    const SidebarExpandIcon = dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"];
    /* Task 38 — sidebar icon style: compact tightly-rounded tiles (vs the
     desktop's large rounded glyphs) so the presentation visibly changes
     when switching modes (owner request). */ const sidebarGlyph = (entry)=>entry.id === "form-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                className: "h-4 w-4"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 386,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 385,
            columnNumber: 7
        }, this) : entry.id === "tree-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                className: "h-4 w-4"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 390,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 389,
            columnNumber: 7
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
            appKey: entry.appKey ?? "",
            className: "h-8 w-8 rounded-lg",
            iconClass: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 393,
            columnNumber: 7
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            iconMode === "grid" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: layerRef,
                "aria-label": t("startmenu.pinned"),
                style: {
                    top: headerDock === "top" ? HEADER_THICK + GRID_PAD : GRID_PAD,
                    bottom: 60,
                    left: headerDock === "left" ? HEADER_THICK + GRID_PAD : GRID_PAD,
                    right: headerDock === "right" ? HEADER_THICK + GRID_PAD : GRID_PAD
                },
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute z-0 select-none", freeMode ? "block" : "flex flex-row flex-wrap content-start gap-0.5 sm:flex-col sm:flex-wrap"),
                children: [
                    items.map((entry, i)=>{
                        const pos = freeMode ? clampPos(iconPositions[entry.id] ?? defaultPos(i)) : null;
                        const dragging = ghost?.entry.id === entry.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            "aria-pressed": selected === entry.id,
                            onClick: (e)=>handleClick(e, entry),
                            onDoubleClick: ()=>activate(entry),
                            onContextMenu: (e)=>handleContextMenu(e, entry),
                            onPointerDown: (e)=>beginDragTracking(e, entry),
                            style: pos ? {
                                left: pos.x,
                                top: pos.y
                            } : undefined,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("group flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/12 focus:outline-none cursor-pointer", freeMode && "absolute touch-none", selected === entry.id && "bg-white/18 ring-1 ring-white/30", dragging && "opacity-30"),
                            children: [
                                iconGlyph(entry),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "line-clamp-2 rounded-md px-1 text-center text-[11px] font-medium leading-tight text-white drop-shadow group-focus-visible:bg-white/20",
                                    children: entry.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 435,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, entry.id, true, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 419,
                            columnNumber: 11
                        }, this);
                    }),
                    ghost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": true,
                        className: "pointer-events-none fixed z-[9600] w-[84px]",
                        style: {
                            left: ghost.x,
                            top: ghost.y
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center gap-1.5 rounded-xl p-2 transition-transform duration-100", ghost.overTaskbar ? "scale-[0.62] opacity-90" : "scale-105 opacity-95 drop-shadow-2xl"),
                            children: [
                                iconGlyph(ghost.entry),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "line-clamp-2 rounded-md bg-black/30 px-1 text-center text-[11px] font-medium leading-tight text-white",
                                    children: ghost.entry.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 452,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 445,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 444,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 399,
                columnNumber: 7
            }, this),
            sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                "aria-label": t("sidebar.title"),
                style: {
                    insetInlineStart: startOffset,
                    top: topOffset,
                    bottom: 60,
                    width: sidebarCollapsed ? 64 : SIDEBAR_W
                },
                className: "acrylic-strong menu-in win-shadow absolute z-[80] flex flex-col overflow-hidden rounded-2xl border border-border/60 shadow-xl transition-[width] duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-12 shrink-0 items-center gap-1 border-b border-border/60 px-2",
                        children: [
                            !sidebarCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-0 flex-1 truncate px-1 text-xs font-semibold text-foreground/90",
                                        children: t("sidebar.title")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/desktop.tsx",
                                        lineNumber: 480,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "shrink-0 font-mono text-[10px]",
                                        children: items.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/desktop.tsx",
                                        lineNumber: 483,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 479,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setSidebarCollapsed(!sidebarCollapsed),
                                "aria-expanded": !sidebarCollapsed,
                                "aria-label": sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse"),
                                title: sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse"),
                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground cursor-pointer",
                                children: sidebarCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SidebarExpandIcon, {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 497,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SidebarCollapseIcon, {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 499,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 488,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 477,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "min-h-0 flex-1 overflow-y-auto scrollbar-slim p-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-0.5", sidebarCollapsed && "items-center"),
                            children: items.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "w-full",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-pressed": selected === entry.id,
                                        title: sidebarCollapsed ? entry.label : undefined,
                                        onClick: ()=>{
                                            setSelected(entry.id);
                                            activate(entry);
                                        },
                                        onContextMenu: (e)=>{
                                            e.preventDefault();
                                            setSelected(entry.id);
                                            setMenu({
                                                x: e.clientX,
                                                y: e.clientY,
                                                entry,
                                                source: "sidebar"
                                            });
                                        },
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(sidebarCollapsed ? "flex h-10 w-10 items-center justify-center rounded-xl" : "flex w-full items-center gap-2.5 rounded-xl p-2 text-start", "transition-colors hover:bg-foreground/8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selected === entry.id && "bg-foreground/10 ring-1 ring-foreground/15"),
                                        children: [
                                            sidebarGlyph(entry),
                                            !sidebarCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "min-w-0 truncate text-xs font-medium text-foreground/90",
                                                children: entry.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                                lineNumber: 532,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/desktop/desktop.tsx",
                                        lineNumber: 509,
                                        columnNumber: 19
                                    }, this)
                                }, entry.id, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 508,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 506,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 505,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 466,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                        asChild: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>{
                                if (!sidebarOpen) {
                                    setIconMode("sidebar");
                                    return;
                                }
                                /* Task 39 — owner request: returning to the desktop icon view must
                 never resurrect a stale/piled layout. The icons are laid out
                 fresh: sorted by the active language, sequential columns anchored
                 to the start edge (right in RTL, left in LTR) — no manual
                 rearranging needed. Free dragging still works inside the grid
                 session; the next round-trip re-arranges again. */ resetIconLayout();
                                setIconMode("grid");
                            },
                            "aria-pressed": sidebarOpen,
                            "aria-label": sidebarOpen ? t("sidebar.toGrid") : t("sidebar.toSidebar"),
                            style: {
                                bottom: 64,
                                insetInlineStart: toggleStart
                            },
                            className: "acrylic-strong win-shadow absolute z-[9300] flex h-10 w-10 items-center justify-center rounded-full border text-foreground/90 shadow-lg transition-[inset-inline-start] duration-300 hover:bg-foreground/10 cursor-pointer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleIcon, {
                                className: "h-4 w-4 shrink-0",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 572,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 551,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 550,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                        side: "top",
                        sideOffset: 10,
                        className: "rounded-full px-3.5 font-medium",
                        children: sidebarOpen ? t("sidebar.toGrid") : t("sidebar.toSidebar")
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 575,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 549,
                columnNumber: 7
            }, this),
            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatingMenu"], {
                x: menu.x,
                y: menu.y,
                onClose: ()=>setMenu(null),
                items: [
                    {
                        label: t("ctx.open"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 589,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>activate(menu.entry)
                    },
                    pinned.includes(menu.entry.id) ? {
                        label: t("ctx.unpinTaskbar"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__["PinOff"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 595,
                            columnNumber: 25
                        }, this),
                        onSelect: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().unpinFromTaskbar(menu.entry.id);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.unpinnedToast"));
                        }
                    } : {
                        label: t("ctx.pinTaskbar"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 603,
                            columnNumber: 25
                        }, this),
                        onSelect: ()=>{
                            if (pinToTaskbar(menu.entry.id)) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.pinnedToast"));
                            else __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("taskbar.alreadyPinned"));
                        }
                    },
                    ...freeMode && menu.source === "grid" ? [
                        {
                            label: t("ctx.resetLayout"),
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 613,
                                columnNumber: 27
                            }, this),
                            onSelect: ()=>resetIconLayout()
                        }
                    ] : []
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 582,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/desktop.tsx",
        lineNumber: 397,
        columnNumber: 5
    }, this);
}
_s(DesktopIcons, "CvNXtzHDfI+9j7EzMQJ1x7/FTek=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppRegistry"]
    ];
});
_c = DesktopIcons;
function Desktop() {
    _s1();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "Desktop.useSettings[dir]": (s)=>s.dir()
    }["Desktop.useSettings[dir]"]);
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "Desktop.useSettings[locale]": (s)=>s.locale
    }["Desktop.useSettings[locale]"]);
    const { windows, setStartOpen, startOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])();
    const headerDock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "Desktop.useDesktop[headerDock]": (s)=>s.headerDock
    }["Desktop.useDesktop[headerDock]"]);
    const { resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    /* apply locale direction + language to <html> */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "Desktop.useEffect": ()=>{
            document.documentElement.dir = dir;
            document.documentElement.lang = locale;
        }
    }["Desktop.useEffect"], [
        dir,
        locale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$direction$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DirectionProvider"], {
        dir: dir,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
            delayDuration: 300,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative h-dvh w-screen overflow-hidden", resolvedTheme === "dark" ? "erp-wallpaper-dark" : "erp-wallpaper"),
                onPointerDown: (e)=>{
                    if (e.target === e.currentTarget) setStartOpen(false);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DesktopIcons, {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 651,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$dashboard$2d$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DashboardHeader"], {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 654,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute z-[100]",
                        style: {
                            top: headerDock === "top" ? HEADER_THICK : 0,
                            left: headerDock === "left" ? HEADER_THICK : 0,
                            right: headerDock === "right" ? HEADER_THICK : 0,
                            bottom: 52
                        },
                        children: windows.map((win)=>{
                            const meta = resolveWindowMeta(win, t);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppWindow"], {
                                win: win,
                                title: meta.title,
                                icon: meta.icon,
                                children: meta.content
                            }, win.id, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 670,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 658,
                        columnNumber: 9
                    }, this),
                    startOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$start$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StartMenu"], {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 677,
                        columnNumber: 23
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$taskbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Taskbar"], {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 678,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                        position: dir === "rtl" ? "bottom-left" : "bottom-right",
                        offset: 64,
                        richColors: true,
                        closeButton: true
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 680,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 642,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 641,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/desktop.tsx",
        lineNumber: 640,
        columnNumber: 5
    }, this);
}
_s1(Desktop, "3cIbN/7F4ci3+qhL0nrM49q0W4Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c1 = Desktop;
var _c, _c1;
__turbopack_context__.k.register(_c, "DesktopIcons");
__turbopack_context__.k.register(_c1, "Desktop");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/desktop/floating-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingMenu",
    ()=>FloatingMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function FloatingMenu({ x, y, items, onClose }) {
    _s();
    const ref = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const [pos, setPos] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        x,
        y
    });
    /* keep the menu inside the viewport */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"]({
        "FloatingMenu.useLayoutEffect": ()=>{
            const el = ref.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setPos({
                x: Math.max(8, Math.min(x, window.innerWidth - r.width - 8)),
                y: Math.max(8, Math.min(y, window.innerHeight - r.height - 8))
            });
        }
    }["FloatingMenu.useLayoutEffect"], [
        x,
        y
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "FloatingMenu.useEffect": ()=>{
            const onDown = {
                "FloatingMenu.useEffect.onDown": (e)=>{
                    if (!ref.current?.contains(e.target)) onClose();
                }
            }["FloatingMenu.useEffect.onDown"];
            const onKey = {
                "FloatingMenu.useEffect.onKey": (e)=>{
                    if (e.key === "Escape") onClose();
                }
            }["FloatingMenu.useEffect.onKey"];
            window.addEventListener("pointerdown", onDown, true);
            window.addEventListener("keydown", onKey);
            return ({
                "FloatingMenu.useEffect": ()=>{
                    window.removeEventListener("pointerdown", onDown, true);
                    window.removeEventListener("keydown", onKey);
                }
            })["FloatingMenu.useEffect"];
        }
    }["FloatingMenu.useEffect"], [
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        role: "menu",
        dir: "auto",
        style: {
            left: pos.x,
            top: pos.y
        },
        className: "acrylic-strong menu-in fixed z-[9800] min-w-44 rounded-xl border bg-popover/95 p-1.5 text-popover-foreground shadow-xl",
        children: items.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                role: "menuitem",
                onClick: ()=>{
                    it.onSelect();
                    onClose();
                },
                className: "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-xs font-medium transition-colors hover:bg-foreground/10 focus:bg-foreground/10 focus:outline-none",
                children: [
                    it.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground",
                        children: it.icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/floating-menu.tsx",
                        lineNumber: 74,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate",
                        children: it.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/floating-menu.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this)
                ]
            }, it.label, true, {
                fileName: "[project]/src/components/desktop/floating-menu.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/floating-menu.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(FloatingMenu, "cJeU15YBZzQP6tnKnwB496TLgfE=");
_c = FloatingMenu;
var _c;
__turbopack_context__.k.register(_c, "FloatingMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/desktop/start-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StartMenu",
    ()=>StartMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-client] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/app-registry-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function StartMenu() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { setStartOpen, openWindow } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])();
    const { apps, load } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppRegistry"])();
    const [query, setQuery] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("");
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "StartMenu.useEffect": ()=>{
            void load();
        }
    }["StartMenu.useEffect"], [
        load
    ]);
    const close = ()=>setStartOpen(false);
    const q = query.trim().toLowerCase();
    /* the catalog apps, searchable (§1.3 titles via i18n).
     Task 35 — the BusinessStructure launcher tile was retired: the form now
     lives as a sub-page inside the Settings window (owner request).
     Task 37 — userManagement moved into Settings the same way: no standalone
     tile; it lives on the Settings home as a launcher card. */ const tiles = apps.filter((a)=>a.appKey !== "userManagement").map((a)=>({
            id: a.appKey,
            kind: "app",
            appKey: a.appKey,
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
                appKey: a.appKey
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/start-menu.tsx",
                lineNumber: 43,
                columnNumber: 13
            }, this),
            titleKey: a.titleKey
        }));
    const filtered = tiles.filter((a)=>!q || t(a.titleKey).toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9400]",
                onClick: close,
                onContextMenu: (e)=>e.preventDefault()
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/start-menu.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "menu-in acrylic-strong fixed bottom-[60px] left-1/2 z-[9500] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl win-shadow",
                dir: "auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                autoFocus: true,
                                value: query,
                                onChange: (e)=>setQuery(e.target.value),
                                placeholder: t("startmenu.searchPlaceholder"),
                                className: "h-10 rounded-xl ps-9"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                                className: "h-3.5 w-3.5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold text-muted-foreground",
                                children: t("startmenu.pinned")
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid max-h-[300px] grid-cols-4 gap-2 overflow-y-auto scrollbar-slim sm:grid-cols-6",
                        children: filtered.map((app)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    openWindow(app.kind, app.appKey);
                                    close();
                                },
                                className: "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors hover:bg-foreground/8 cursor-pointer",
                                children: [
                                    app.icon,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "line-clamp-2 text-center text-[11px] leading-tight text-foreground/90",
                                        children: t(app.titleKey)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                                        lineNumber: 85,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, app.id, true, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 mt-4 flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-semibold text-muted-foreground",
                            children: t("startmenu.recommended")
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                openWindow("settings");
                                close();
                            },
                            className: "flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-foreground/8 cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-white",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/start-menu.tsx",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block text-xs font-medium",
                                            children: t("settings.title")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                                            lineNumber: 109,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block text-[10px] text-muted-foreground",
                                            children: [
                                                LOCALES_COUNT,
                                                " ",
                                                t("common.language")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/desktop/start-menu.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/start-menu.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/start-menu.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(StartMenu, "u+bgwVExW6wdku/830f9fiJUhEo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppRegistry"]
    ];
});
_c = StartMenu;
const LOCALES_COUNT = 11;
void LOCALES_COUNT;
var _c;
__turbopack_context__.k.register(_c, "StartMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/desktop/taskbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Taskbar",
    ()=>Taskbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-client] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/languages.js [app-client] (ecmascript) <export default as Languages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-client] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin-off.js [app-client] (ecmascript) <export default as PinOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/floating-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function pinnedMeta(id) {
    if (id === "business-structure") return {
        kind: "business-structure",
        titleKey: "menus.businessStructure"
    };
    if (id === "settings") return {
        kind: "settings",
        titleKey: "settings.title"
    };
    return {
        kind: "app",
        appKey: id,
        titleKey: `app.${id}`
    };
}
/* dock tile glyph — scales with the smart size (Task 19) */ function PinnedGlyph({ id, size }) {
    const tile = Math.round(size * 0.82);
    const glyph = Math.max(10, Math.round(tile * 0.58));
    if (id === "business-structure") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                width: tile,
                height: tile
            },
            className: "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"], {
                style: {
                    width: glyph,
                    height: glyph
                }
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/taskbar.tsx",
            lineNumber: 37,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
        appKey: id,
        className: "rounded-lg",
        style: {
            width: tile,
            height: tile
        },
        iconStyle: {
            width: glyph,
            height: glyph
        }
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/taskbar.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_c = PinnedGlyph;
function WinLogo() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "grid h-5 w-5 grid-cols-2 gap-[2.5px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-400"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-300"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-300"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-400"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/taskbar.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_c1 = WinLogo;
/* hydration-safe clock: server snapshot = 0, client ticks every second */ function subscribeClock(onChange) {
    const id = setInterval(onChange, 1_000);
    return ()=>clearInterval(id);
}
function clientSeconds() {
    return Math.floor(Date.now() / 1_000);
}
function serverSeconds() {
    return 0;
}
const DOCK_GAP = 4;
function Taskbar() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "Taskbar.useSettings[locale]": (s)=>s.locale
    }["Taskbar.useSettings[locale]"]);
    const setLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "Taskbar.useSettings[setLocale]": (s)=>s.setLocale
    }["Taskbar.useSettings[setLocale]"]);
    const { windows, openWindow, focusWindow, minimizeWindow, startOpen, setStartOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])();
    const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "Taskbar.useDesktop[pinned]": (s)=>s.pinned
    }["Taskbar.useDesktop[pinned]"]);
    const dragOverTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "Taskbar.useDesktop[dragOverTaskbar]": (s)=>s.dragOverTaskbar
    }["Taskbar.useDesktop[dragOverTaskbar]"]);
    const unpinFromTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "Taskbar.useDesktop[unpinFromTaskbar]": (s)=>s.unpinFromTaskbar
    }["Taskbar.useDesktop[unpinFromTaskbar]"]);
    const seconds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"](subscribeClock, clientSeconds, serverSeconds);
    const now = seconds > 0 ? new Date(seconds * 1_000) : null;
    const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    /* measured width of the footer dock drives the smart sizing */ const dockRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const [dockW, setDockW] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "Taskbar.useEffect": ()=>{
            const el = dockRef.current;
            if (!el) return;
            const update = {
                "Taskbar.useEffect.update": ()=>setDockW(el.clientWidth)
            }["Taskbar.useEffect.update"];
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return ({
                "Taskbar.useEffect": ()=>ro.disconnect()
            })["Taskbar.useEffect"];
        }
    }["Taskbar.useEffect"], []);
    /* §Task-19 smart sizing: the more icons are pinned in the dashboard footer,
     the smaller every icon becomes — continuously, clamped to a usable range. */ const count = pinned.length;
    const size = count === 0 ? 40 : Math.max(22, Math.min(40, Math.floor((dockW - 8 - (count - 1) * DOCK_GAP) / count) || 22));
    const time = now ? now.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit"
    }) : "--:--";
    const date = now ? now.toLocaleDateString(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    }) : "";
    const toggleId = (id)=>{
        const meta = pinnedMeta(id);
        const win = windows.find((w)=>w.kind === meta.kind && w.appKey === meta.appKey);
        if (!win) {
            openWindow(meta.kind, meta.appKey);
            return;
        }
        if (win.minimized) {
            focusWindow(win.id);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].setState((s)=>({
                    windows: s.windows.map((w)=>w.id === win.id ? {
                            ...w,
                            minimized: false
                        } : w)
                }));
            return;
        }
        const isTop = Math.max(...windows.filter((w)=>!w.minimized).map((w)=>w.z)) === win.z;
        if (isTop && windows.filter((w)=>!w.minimized).length > 1) minimizeWindow(win.id);
        else focusWindow(win.id);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-taskbar": true,
        className: "taskbar-shadow acrylic-strong absolute inset-x-0 bottom-0 z-[9000] flex h-[52px] items-center gap-1.5 px-2 sm:px-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        "aria-label": "Start",
                        onClick: ()=>setStartOpen(!startOpen),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-foreground/10 cursor-pointer", startOpen && "bg-foreground/10"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WinLogo, {}, void 0, false, {
                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-1 hidden items-center gap-1 rounded-full acrylic px-3 py-1.5 sm:flex",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "h-3.5 w-3.5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "max-w-40 truncate text-xs text-muted-foreground",
                                children: t("taskbar.search")
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: dockRef,
                "aria-label": t("startmenu.pinned"),
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("no-scrollbar relative flex min-w-0 flex-1 items-center overflow-x-auto rounded-xl py-1.5 transition-all", count > 0 && "px-1", dragOverTaskbar && "bg-primary/15 ring-2 ring-primary/50"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex items-center",
                    style: {
                        gap: DOCK_GAP
                    },
                    children: [
                        count === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                            className: "h-4 w-4 text-muted-foreground/40"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                            lineNumber: 175,
                            columnNumber: 27
                        }, this),
                        pinned.map((id)=>{
                            const meta = pinnedMeta(id);
                            const win = windows.find((w)=>w.kind === meta.kind && w.appKey === meta.appKey);
                            const running = Boolean(win) && !win?.minimized;
                            const dotW = Math.max(5, Math.round(size * 0.3));
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                title: t(meta.titleKey),
                                "aria-label": t(meta.titleKey),
                                onClick: ()=>toggleId(id),
                                onContextMenu: (e)=>{
                                    e.preventDefault();
                                    setMenu({
                                        x: e.clientX,
                                        y: e.clientY,
                                        id
                                    });
                                },
                                style: {
                                    width: size,
                                    height: size
                                },
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex shrink-0 items-center justify-center rounded-lg transition-all hover:bg-foreground/10 cursor-pointer", running && "bg-foreground/8"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PinnedGlyph, {
                                        id: id,
                                        size: size
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, this),
                                    win && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: win.minimized ? Math.max(3, Math.round(dotW * 0.45)) : dotW
                                        },
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all", running ? "bg-primary" : "bg-muted-foreground/70")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                                        lineNumber: 199,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, id, true, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 182,
                                columnNumber: 15
                            }, this);
                        })
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/desktop/taskbar.tsx",
                    lineNumber: 174,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                asChild: true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    "aria-label": t("common.language"),
                                    className: "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors hover:bg-foreground/10 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__["Languages"], {
                                            className: "h-4 w-4 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                                            lineNumber: 221,
                                            columnNumber: 15
                                        }, this),
                                        locale.toUpperCase()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/desktop/taskbar.tsx",
                                    lineNumber: 217,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                align: "end",
                                className: "max-h-72 overflow-y-auto scrollbar-slim",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALES"].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                        onClick: ()=>setLocale(l),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(locale === l && "bg-accent font-semibold"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-8 font-mono text-[10px] text-muted-foreground",
                                                children: l
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                                lineNumber: 232,
                                                columnNumber: 17
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALE_NAMES"][l]
                                        ]
                                    }, l, true, {
                                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-end leading-tight",
                        dir: "ltr",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium tabular-nums",
                                children: time
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 240,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-muted-foreground tabular-nums",
                                children: date
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, this),
            dragOverTaskbar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                dir: "auto",
                className: "acrylic menu-in pointer-events-none absolute -top-9 left-1/2 z-[9100] -translate-x-1/2 whitespace-nowrap rounded-full border bg-background/90 px-3 py-1 text-[11px] font-medium shadow-md",
                children: t("taskbar.dropHint")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 247,
                columnNumber: 9
            }, this),
            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatingMenu"], {
                x: menu.x,
                y: menu.y,
                onClose: ()=>setMenu(null),
                items: [
                    {
                        label: t("ctx.unpinTaskbar"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__["PinOff"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                            lineNumber: 264,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>{
                            unpinFromTaskbar(menu.id);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.unpinnedToast"));
                        }
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 257,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/taskbar.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
_s(Taskbar, "baEQld+tTFZ6u4+reP3nhtVGrYk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"]
    ];
});
_c2 = Taskbar;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PinnedGlyph");
__turbopack_context__.k.register(_c1, "WinLogo");
__turbopack_context__.k.register(_c2, "Taskbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/erp/app-placeholder-window.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppPlaceholderWindow",
    ()=>AppPlaceholderWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-click.js [app-client] (ecmascript) <export default as MousePointerClick>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$server$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Server$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/server.js [app-client] (ecmascript) <export default as Server>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/app-catalog.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/form-action-bar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/* sample rows for the records-list dropdown demo — NOT business data (§4.6) */ const DEMO_ITEMS = [
    {
        id: "1001",
        title: "1001"
    },
    {
        id: "1002",
        title: "1002"
    },
    {
        id: "1003",
        title: "1003"
    }
];
function AppPlaceholderWindow({ appKey }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const descriptor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAppDescriptor"])(appKey);
    const [integration, setIntegration] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        phase: "checking"
    });
    const [tick, setTick] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    /* demo state of the action-bar preview: the "current record" of the fake form */ const [current, setCurrent] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "AppPlaceholderWindow.useEffect": ()=>{
            let alive = true;
            ({
                "AppPlaceholderWindow.useEffect": async ()=>{
                    /* yield a microtask first: state resets happen asynchronously, which keeps
         rapid appKey switches tear-free and satisfies react-hooks/set-state-in-effect */ await Promise.resolve();
                    if (!alive) return;
                    setIntegration({
                        phase: "checking"
                    });
                    try {
                        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appApi"])(appKey).get("integrations/status");
                        if (!alive) return;
                        const peer = res.peers?.[0];
                        if (res.overall === "ok" && peer?.status === "ok") {
                            setIntegration({
                                phase: "ok",
                                latencyMs: peer.latencyMs
                            });
                        } else {
                            setIntegration({
                                phase: "fail"
                            });
                        }
                    } catch  {
                        if (alive) setIntegration({
                            phase: "fail"
                        });
                    }
                }
            })["AppPlaceholderWindow.useEffect"]();
            return ({
                "AppPlaceholderWindow.useEffect": ()=>{
                    alive = false;
                }
            })["AppPlaceholderWindow.useEffect"];
        }
    }["AppPlaceholderWindow.useEffect"], [
        appKey,
        tick
    ]);
    const dbShared = (descriptor?.dbMode ?? "shared") === "shared";
    /* demo «بستن» — closes this placeholder window via the desktop store */ const closeThisWindow = ()=>{
        const win = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().windows.find((w)=>w.kind === "app" && w.appKey === appKey);
        if (win) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().closeWindow(win.id);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col items-center justify-center gap-5 overflow-y-auto p-6 scrollbar-slim",
        dir: "auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
                appKey: appKey,
                className: "h-24 w-24 rounded-3xl shadow-xl",
                iconClass: "h-11 w-11"
            }, void 0, false, {
                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold tracking-tight",
                        children: t(`app.${appKey}`)
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-muted-foreground",
                        children: t("app.name")
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-[11px] text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$server$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Server$3e$__["Server"], {
                                className: "h-3 w-3",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this),
                            t("ph.portLabel"),
                            ": ",
                            descriptor?.port ?? 3002
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-[11px] text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                className: "h-3 w-3",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            dbShared ? t("ph.dbShared") : t("ph.dbDedicated")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                            className: "mt-0.5 h-5 w-5 shrink-0 text-amber-600",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold text-amber-700 dark:text-amber-400",
                                    children: t("ph.awaitingBadge")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs leading-relaxed text-muted-foreground",
                                    children: t("ph.awaitingBody")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md rounded-2xl border bg-background/60 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-2 text-xs font-semibold",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                        className: "h-4 w-4 text-emerald-600",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this),
                                    t("ph.secureApi")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": t("common.retry"),
                                onClick: ()=>setTick((n)=>n + 1),
                                className: "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground cursor-pointer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                    className: "h-3.5 w-3.5",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between rounded-xl border bg-background/70 px-3 py-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-2 text-xs font-medium",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
                                        appKey: "settings",
                                        className: "h-6 w-6 rounded-md",
                                        iconClass: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this),
                                    "settings-service"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this),
                            integration.phase === "checking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1.5 text-[11px] text-muted-foreground",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "h-3.5 w-3.5 animate-spin",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this),
                                    t("ph.checking")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            integration.phase === "ok" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500/60"),
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                        lineNumber: 156,
                                        columnNumber: 15
                                    }, this),
                                    t("ph.linkOk"),
                                    " · ",
                                    integration.latencyMs,
                                    "ms"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this),
                            integration.phase === "fail" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "h-2 w-2 rounded-full bg-rose-500",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this),
                                    t("ph.linkFail")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-lg rounded-2xl border bg-background/60 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-1 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$click$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointerClick$3e$__["MousePointerClick"], {
                                className: "h-4 w-4 text-violet-600 dark:text-violet-400",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold",
                                children: t("abar.demoTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 174,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-3 text-[11px] leading-relaxed text-muted-foreground",
                        children: t("abar.demoNote")
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 flex items-center justify-between gap-2 rounded-xl border bg-background/70 px-3 py-2 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "shrink-0 text-muted-foreground",
                                children: t("abar.list")
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate font-medium",
                                children: current ? current.title : "—"
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border bg-background/70 p-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormActionBar"], {
                            onReset: ()=>{
                                setCurrent(null);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.resetToast"));
                            },
                            onSave: async ()=>{
                                await delay(600);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.savedToast"));
                            },
                            onCopy: ()=>{
                                setCurrent(null);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.copyToast"));
                            },
                            onDelete: async ()=>{
                                await delay(350);
                                setCurrent(null);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.deletedToast"));
                            },
                            onPrint: ()=>{
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.printToast"));
                            },
                            onClose: closeThisWindow,
                            listItems: DEMO_ITEMS,
                            onOpenListItem: (item)=>{
                                setCurrent(item);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.itemOpened"));
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/erp/app-placeholder-window.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_s(AppPlaceholderWindow, "TALOTzSK1R8Kdu6uGWdQR5yUYm4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"]
    ];
});
_c = AppPlaceholderWindow;
var _c;
__turbopack_context__.k.register(_c, "AppPlaceholderWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/erp/business-structure/bs-detail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BsLogoUploader",
    ()=>BsLogoUploader,
    "BsTypeIcon",
    ()=>BsTypeIcon,
    "parseTypes",
    ()=>parseTypes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/* Task 32 — the former BsDetail card moved onto the SimpleTreeForm shell:
   the shell now owns the detail header / action bar / field grid. This module
   keeps the BusinessStructure domain atoms — the type icon glyph, the
   activeStructureTypes parser and the logo uploader that rides the shell's
   detailExtra slot. All behavior is preserved verbatim. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building.js [app-client] (ecmascript) <export default as Building>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/landmark.js [app-client] (ecmascript) <export default as Landmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-client] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image-plus.js [app-client] (ecmascript) <export default as ImagePlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$business$2d$structure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/business-structure.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function BsTypeIcon({ type, className }) {
    const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$business$2d$structure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bsTypeColor"])(type);
    /* Task 34 — type 5 (Store) rides the same colored-chip family; the icons of
     types 1-4 are UNCHANGED (owner request: no visual change to the forms). */ const Icon = type === 1 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"] : type === 2 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building$3e$__["Building"] : type === 3 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"] : type === 4 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"] : type === 5 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__["Landmark"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1", c.bg, c.text, c.ring, className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
            className: "h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
            lineNumber: 60,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_c = BsTypeIcon;
function parseTypes(json) {
    if (!json) return [];
    try {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr.map(Number).filter((n)=>Number.isFinite(n)) : [];
    } catch  {
        return [];
    }
}
function BsLogoUploader({ logoUrl, onChange }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const fileRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const onFile = (file)=>{
        if (!file) return;
        if (file.size > 256 * 1024) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(t("bs.msg.saveError"), {
                description: "logo > 256KB"
            });
            return;
        }
        const reader = new FileReader();
        reader.onload = ()=>onChange(String(reader.result));
        reader.readAsDataURL(file);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-3 rounded-xl border border-border bg-card/50 p-3.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-2 text-xs font-semibold",
                children: t("bs.field.logo")
            }, void 0, false, {
                fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card/50",
                        children: logoUrl ? // eslint-disable-next-line @next/next/no-img-element
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: logoUrl,
                            alt: "logo",
                            className: "h-full w-full object-contain"
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__["ImagePlus"], {
                            className: "h-5 w-5 text-muted-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>fileRef.current?.click(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__["ImagePlus"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this),
                                    t("bs.field.logo")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                                lineNumber: 118,
                                columnNumber: 11
                            }, this),
                            logoUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                variant: "ghost",
                                size: "sm",
                                className: "text-destructive",
                                onClick: ()=>onChange(null),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                                    lineNumber: 135,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                                lineNumber: 128,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileRef,
                                type: "file",
                                accept: "image/*",
                                className: "hidden",
                                onChange: (e)=>onFile(e.target.files?.[0] ?? null)
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/erp/business-structure/bs-detail.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_s(BsLogoUploader, "yu9I4v53Sy1ydGTxNCRWhIt+jh4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"]
    ];
});
_c1 = BsLogoUploader;
var _c, _c1;
__turbopack_context__.k.register(_c, "BsTypeIcon");
__turbopack_context__.k.register(_c1, "BsLogoUploader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/erp/business-structure/bs-window.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BusinessStructureWindow",
    ()=>BusinessStructureWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/* Task 32 — BusinessStructureWindow refactored onto the SimpleTreeForm shell
   (owner request): the chromeless gradient header (Task 28 caption contract),
   the Task-20 FormActionBar and the Task-25 aligned field grid replace the
   former custom two-pane card layout (TreeForm + BsDetail). Every Task-17
   behavior is preserved: load/CRUD against the settings-service via the BFF,
   parent-driven type rules (allowedChildTypes), guarded delete, the
   save / save-new / save-close semantics and the erp:records-changed event
   (§5.6). */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-client] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$simple$2d$tree$2d$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/simple-tree-form.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/business-structure/bs-detail.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$business$2d$structure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/business-structure.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
const EMPTY = {
    title: "",
    titleEn: "",
    type: "",
    manager: "",
    logoUrl: null,
    isActive: true,
    isBasicInfoShared: false,
    activeStructureTypes: []
};
function formFromNode(node) {
    return {
        title: node.title ?? "",
        titleEn: node.titleEn ?? "",
        type: node.businessStructureType != null ? String(node.businessStructureType) : "",
        manager: node.manager ?? "",
        logoUrl: node.logoUrl,
        isActive: node.isActive,
        isBasicInfoShared: node.isBasicInfoShared,
        activeStructureTypes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseTypes"])(node.activeStructureTypes)
    };
}
function BusinessStructureWindow({ embedded = false, onEmbeddedClose }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    /* Task 28 contract — chromeless host: the green form header hosts the
     caption buttons and drags the window; maximized state subscribes reactively.
     Embedded (Task 35): the Settings window owns the chrome, so the header
     handlers are intentionally undefined (caption buttons hide, opt-in shell). */ const chrome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWindowChrome"])();
    const chromeApi = embedded ? null : chrome;
    const headerMaximized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "BusinessStructureWindow.useDesktop[headerMaximized]": (s)=>embedded ? false : s.windows.find({
                "BusinessStructureWindow.useDesktop[headerMaximized]": (w)=>w.kind === "business-structure"
            }["BusinessStructureWindow.useDesktop[headerMaximized]"])?.maximized ?? false
    }["BusinessStructureWindow.useDesktop[headerMaximized]"]);
    const closeThisWindow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "BusinessStructureWindow.useCallback[closeThisWindow]": ()=>{
            if (embedded) {
                onEmbeddedClose?.();
                return;
            }
            const win = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().windows.find({
                "BusinessStructureWindow.useCallback[closeThisWindow].win": (w)=>w.kind === "business-structure"
            }["BusinessStructureWindow.useCallback[closeThisWindow].win"]);
            if (win) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().closeWindow(win.id);
        }
    }["BusinessStructureWindow.useCallback[closeThisWindow]"], [
        embedded,
        onEmbeddedClose
    ]);
    const [items, setItems] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]([]);
    const [definedTypes, setDefinedTypes] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]([]);
    const [loading, setLoading] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](true);
    const [saving, setSaving] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [selectedId, setSelectedId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [mode, setMode] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("idle");
    const [createParentId, setCreateParentId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [form, setForm] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](EMPTY);
    /* marks the erp:records-changed events this window dispatches itself, so the
     §5.6 listener ignores them (no double refetch after save/delete) */ const selfEventRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](false);
    /* Task 33 — node picked via the tree right-click flyout for deletion;
     the confirm step is the SAME ConfirmDeleteDialog the ActionBar
     delete-family tiles use (single confirmation, Task-32 decision). */ const [contextDeleteId, setContextDeleteId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const load = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "BusinessStructureWindow.useCallback[load]": async ()=>{
            setLoading(true);
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get("business-structure");
                setItems(res.items);
                setDefinedTypes(res.definedTypes);
            } catch (e) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(t("bs.msg.loadError"), {
                    description: e instanceof Error ? e.message : undefined
                });
            } finally{
                setLoading(false);
            }
        }
    }["BusinessStructureWindow.useCallback[load]"], [
        t
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "BusinessStructureWindow.useEffect": ()=>{
            void Promise.resolve().then(load);
        }
    }["BusinessStructureWindow.useEffect"], [
        load
    ]);
    /* §5.6 — refetch when another surface changes business-structure records */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "BusinessStructureWindow.useEffect": ()=>{
            const onChanged = {
                "BusinessStructureWindow.useEffect.onChanged": (e)=>{
                    if (selfEventRef.current) {
                        selfEventRef.current = false;
                        return;
                    }
                    const detail = e.detail;
                    if (detail?.entity === "business-structure") void load();
                }
            }["BusinessStructureWindow.useEffect.onChanged"];
            window.addEventListener("erp:records-changed", onChanged);
            return ({
                "BusinessStructureWindow.useEffect": ()=>window.removeEventListener("erp:records-changed", onChanged)
            })["BusinessStructureWindow.useEffect"];
        }
    }["BusinessStructureWindow.useEffect"], [
        load
    ]);
    /* ---- tree helpers ---- */ const byId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "BusinessStructureWindow.useMemo[byId]": ()=>{
            const m = new Map();
            for (const n of items)m.set(String(n.id), n);
            return m;
        }
    }["BusinessStructureWindow.useMemo[byId]"], [
        items
    ]);
    /* nested tree for the shell pane — items order preserved, every branch
     expanded by default (shell behavior); icons keep the Task-17 type colors */ const treeNodes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "BusinessStructureWindow.useMemo[treeNodes]": ()=>{
            const map = new Map();
            for (const n of items){
                map.set(String(n.id), {
                    id: String(n.id),
                    label: n.title,
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BsTypeIcon"], {
                        type: n.businessStructureType,
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                        lineNumber: 176,
                        columnNumber: 15
                    }, this),
                    children: []
                });
            }
            const roots = [];
            for (const n of items){
                const me = map.get(String(n.id));
                if (!me) continue;
                const parent = n.parentRef && n.parentRef !== 0 ? map.get(String(n.parentRef)) : undefined;
                if (parent?.children) parent.children.push(me);
                else roots.push(me);
            }
            return roots;
        }
    }["BusinessStructureWindow.useMemo[treeNodes]"], [
        items
    ]);
    const selectedNode = selectedId ? byId.get(selectedId) ?? null : null;
    const createParent = createParentId ? byId.get(createParentId) ?? null : null;
    const parentNodeOfSelected = selectedNode && selectedNode.parentRef ? byId.get(String(selectedNode.parentRef)) ?? null : null;
    const isRoot = mode === "view" && selectedNode?.id === 1;
    /* ---- form state — derive-and-reset during render (React-recommended
     "adjusting state on prop change" pattern, carried over from BsDetail) ---- */ const formKey = `${mode}:${mode === "create" ? createParentId ?? "root" : selectedId ?? "-"}:${selectedNode?.version ?? "-"}`;
    const [renderedKey, setRenderedKey] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](formKey);
    if (renderedKey !== formKey) {
        setRenderedKey(formKey);
        setForm(mode === "create" ? {
            ...EMPTY
        } : selectedNode ? formFromNode(selectedNode) : EMPTY);
    }
    /* ---- navigation ---- */ const startCreate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "BusinessStructureWindow.useCallback[startCreate]": (parentId)=>{
            setCreateParentId(parentId);
            setSelectedId(parentId);
            setMode("create");
        }
    }["BusinessStructureWindow.useCallback[startCreate]"], []);
    const handleSelect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "BusinessStructureWindow.useCallback[handleSelect]": (id)=>{
            /* selecting a tree row abandons an in-progress create (Task-17 behavior) */ setMode("view");
            setSelectedId(id);
        }
    }["BusinessStructureWindow.useCallback[handleSelect]"], []);
    const bsCanDelete = (node)=>node.id !== 1 && !node.isSystem && node.childCount === 0;
    /* Task 34 — Store (type 5) is a leaf on the server (CHILD_TYPE_RULES[5]=[]);
     the tree flyout only offers «افزودن زیرشاخه» on nodes whose type may host
     children — the same rule the server enforces (§5.1 additive gating). */ const bsCanHostChild = (node)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$business$2d$structure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["allowedChildTypes"])(node.businessStructureType ?? null).length > 0;
    /* ---- actions (Task-17 semantics preserved) ----
     Task 32 — no window.confirm here: the FormActionBar delete-family tiles
     already own confirmation (ConfirmDeleteDialog); the old Task-17 inline
     delete button (single window.confirm) no longer exists on the shell. */ const handleDelete = async (node)=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].del(`business-structure/${node.id}`);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("bs.msg.deleted"));
            if (selectedId === String(node.id)) {
                setSelectedId(null);
                setMode("idle");
            }
            await load();
            selfEventRef.current = true;
            window.dispatchEvent(new CustomEvent("erp:records-changed", {
                detail: {
                    entity: "business-structure"
                }
            }));
            return true;
        } catch (e) {
            if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"]) {
                const key = e.messageKey ?? "bs.msg.saveError";
                const known = [
                    "bs.msg.deleteBlockedChildren",
                    "bs.msg.deleteBlockedRoot",
                    "bs.msg.deleteBlockedSystem"
                ];
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(known.includes(key) ? t(key) : t("common.error"), {
                    description: e.message
                });
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(t("common.error"));
            }
            return false;
        }
    };
    const handleSave = async (payload, after)=>{
        setSaving(true);
        try {
            if (mode === "create") {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].post("business-structure", payload);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("bs.msg.saved"));
                await load();
                if (after === "new") {
                    startCreate(createParentId);
                } else {
                    setSelectedId(String(res.item.id));
                    setMode("view");
                }
            } else if (mode === "view" && selectedNode) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].put(`business-structure/${selectedNode.id}`, payload);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("bs.msg.saved"));
                await load();
                /* Task 35 — save-close: standalone closes the window, embedded
           returns to the settings home (same closeThisWindow funnel) */ if (after === "close") closeThisWindow();
            }
            selfEventRef.current = true;
            window.dispatchEvent(new CustomEvent("erp:records-changed", {
                detail: {
                    entity: "business-structure"
                }
            }));
        } catch (e) {
            const msg = e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? e.message : t("bs.msg.saveError");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(t("bs.msg.saveError"), {
                description: msg
            });
        } finally{
            setSaving(false);
        }
    };
    /* ---- validation + payload (carried over from BsDetail) ---- */ const validate = ()=>{
        const errs = [];
        if (!isRoot) {
            if (!form.title.trim()) errs.push(t("bs.val.titleRequired"));
            if (!form.titleEn.trim()) errs.push(t("bs.val.titleEnRequired"));
            if (!form.type) errs.push(t("bs.val.typeRequired"));
        }
        return errs;
    };
    const buildPayload = ()=>{
        if (isRoot) {
            return {
                isBasicInfoShared: form.isBasicInfoShared,
                activeStructureTypes: form.activeStructureTypes,
                isActive: form.isActive
            };
        }
        if (mode === "create") {
            return {
                parentRef: createParent ? createParent.id : 1,
                title: form.title.trim(),
                titleEn: form.titleEn.trim(),
                businessStructureType: Number(form.type),
                manager: form.manager.trim() || null,
                logoUrl: form.logoUrl,
                isActive: form.isActive
            };
        }
        return {
            title: form.title.trim(),
            titleEn: form.titleEn.trim(),
            businessStructureType: Number(form.type),
            manager: form.manager.trim() || null,
            logoUrl: form.logoUrl,
            isActive: form.isActive
        };
    };
    const doValidateAndSave = async (after)=>{
        if (saving) return false;
        const errs = validate();
        if (errs.length > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(t("bs.msg.saveError"), {
                description: errs.join(" — ")
            });
            return false;
        }
        await handleSave(buildPayload(), after);
        return true;
    };
    /* ---- FormActionBar handlers (Task-20 contract) ----
     «+» (reset tile, legacy "new entry"): view/idle → create a child under
     the selected node (or the first root); create → abandon the entry. */ const actionReset = ()=>{
        if (mode === "create") setMode("idle");
        else {
            /* Task 34 — a leaf node (e.g. Store) cannot host a new child: fall back
         to the first root branch, like the nothing-selected case (Task-17
         «...or the root» semantics). */ const sel = selectedId ? byId.get(selectedId) : null;
            startCreate(sel && bsCanHostChild(sel) ? selectedId : treeNodes[0]?.id ?? null);
        }
    };
    const actionSave = ()=>{
        void doValidateAndSave("reload");
    };
    const actionSaveNew = async ()=>{
        if (mode === "create") {
            await doValidateAndSave("new");
            return;
        }
        /* view mode: save, then open a blank entry under the same parent */ const parentKey = selectedNode?.parentRef && selectedNode.parentRef !== 0 ? String(selectedNode.parentRef) : null;
        const ok = await doValidateAndSave("reload");
        if (ok) startCreate(parentKey ?? treeNodes[0]?.id ?? null);
    };
    const actionSaveClose = ()=>{
        void doValidateAndSave("close");
    };
    const actionDelete = ()=>{
        if (selectedNode) void handleDelete(selectedNode);
    };
    /* explicit async compositions (auto-composed sequence() would fire the
     second step while the delete confirm dialog is still open) */ const actionDeleteNew = async ()=>{
        if (!selectedNode) return;
        const ok = await handleDelete(selectedNode);
        if (ok) startCreate(treeNodes[0]?.id ?? null);
    };
    const actionDeleteClose = async ()=>{
        if (!selectedNode) return;
        const ok = await handleDelete(selectedNode);
        if (ok) closeThisWindow();
    };
    /* ---- records list (Task-20 action 10) — every tree node opens on click ---- */ const listItems = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "BusinessStructureWindow.useMemo[listItems]": ()=>items.map({
                "BusinessStructureWindow.useMemo[listItems]": (n)=>({
                        id: String(n.id),
                        title: n.title,
                        subtitle: n.code
                    })
            }["BusinessStructureWindow.useMemo[listItems]"])
    }["BusinessStructureWindow.useMemo[listItems]"], [
        items
    ]);
    /* ---- detail fields (shell contract) ---- */ const typeOptions = (()=>{
        if (isRoot) return [];
        const parentType = mode === "create" ? createParent?.businessStructureType ?? null : parentNodeOfSelected?.businessStructureType ?? null;
        const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$business$2d$structure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["allowedChildTypes"])(parentType);
        const cur = mode === "view" && selectedNode?.businessStructureType != null ? [
            selectedNode.businessStructureType
        ] : [];
        return [
            ...new Set([
                ...base,
                ...cur
            ])
        ].sort((a, b)=>a - b);
    })();
    const typeSelectOptions = typeOptions.map((v)=>({
            value: String(v),
            label: t(`bs.type.${v}`)
        }));
    const unionTypes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "BusinessStructureWindow.useMemo[unionTypes]": ()=>{
            if (!isRoot) return [];
            const set = new Set(definedTypes);
            for (const v of form.activeStructureTypes)set.add(v);
            return [
                ...set
            ].sort({
                "BusinessStructureWindow.useMemo[unionTypes]": (a, b)=>a - b
            }["BusinessStructureWindow.useMemo[unionTypes]"]);
        }
    }["BusinessStructureWindow.useMemo[unionTypes]"], [
        isRoot,
        definedTypes,
        form.activeStructureTypes
    ]);
    const fields = (()=>{
        if (mode === "create") {
            return [
                {
                    id: "title",
                    label: t("bs.field.title"),
                    required: true,
                    value: form.title
                },
                {
                    id: "titleEn",
                    label: t("bs.field.titleEn"),
                    required: true,
                    value: form.titleEn,
                    ltr: true,
                    placeholder: t("bs.hint.latinTitle")
                },
                {
                    id: "type",
                    label: t("bs.field.type"),
                    required: true,
                    type: "select",
                    value: form.type,
                    options: typeSelectOptions
                },
                {
                    id: "manager",
                    label: t("bs.field.manager"),
                    value: form.manager
                },
                {
                    id: "isActive",
                    label: t("bs.field.isActive"),
                    type: "checkbox",
                    checked: form.isActive
                }
            ];
        }
        if (isRoot && selectedNode) {
            return [
                {
                    id: "code",
                    label: t("bs.field.code"),
                    value: selectedNode.code,
                    readOnly: true
                },
                {
                    id: "hqTitle",
                    label: t("bs.field.title"),
                    value: selectedNode.title,
                    readOnly: true
                },
                {
                    id: "isBasicInfoShared",
                    label: t("bs.field.shareHeadquarterData"),
                    type: "checkbox",
                    checked: form.isBasicInfoShared
                },
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$business$2d$structure$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROOT_ALLOWED_TYPES"].map((v)=>({
                        id: `activeType${v}`,
                        label: t(`bs.type.${v}`),
                        type: "checkbox",
                        checked: form.activeStructureTypes.includes(v)
                    })),
                {
                    id: "isActive",
                    label: t("bs.field.isActive"),
                    type: "checkbox",
                    checked: form.isActive
                }
            ];
        }
        if (selectedNode) {
            return [
                {
                    id: "title",
                    label: t("bs.field.title"),
                    required: true,
                    value: form.title
                },
                {
                    id: "titleEn",
                    label: t("bs.field.titleEn"),
                    required: true,
                    value: form.titleEn,
                    ltr: true,
                    placeholder: t("bs.hint.latinTitle")
                },
                {
                    id: "type",
                    label: t("bs.field.type"),
                    required: true,
                    type: "select",
                    value: form.type,
                    options: typeSelectOptions,
                    disabled: Boolean(selectedNode.isSystem)
                },
                {
                    id: "manager",
                    label: t("bs.field.manager"),
                    value: form.manager
                },
                {
                    id: "isActive",
                    label: t("bs.field.isActive"),
                    type: "checkbox",
                    checked: form.isActive
                }
            ];
        }
        return [];
    })();
    const onFieldChange = (id, value)=>{
        /* root «activeStructureTypes» chips became four checkboxes on the shell */ if (id.startsWith("activeType")) {
            const v = Number(id.slice("activeType".length));
            setForm((f)=>({
                    ...f,
                    activeStructureTypes: value === true ? [
                        ...f.activeStructureTypes,
                        v
                    ].sort((a, b)=>a - b) : f.activeStructureTypes.filter((x)=>x !== v)
                }));
            return;
        }
        setForm((f)=>({
                ...f,
                [id]: value
            }));
    };
    const detailExtra = (()=>{
        if (mode === "create") {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BsLogoUploader"], {
                logoUrl: form.logoUrl,
                onChange: (v)=>setForm((f)=>({
                            ...f,
                            logoUrl: v
                        }))
            }, void 0, false, {
                fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                lineNumber: 535,
                columnNumber: 9
            }, this);
        }
        if (isRoot) {
            if (unionTypes.length === 0) return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 text-amber-700 dark:text-amber-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        className: "mt-0.5 h-3.5 w-3.5 shrink-0",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                        lineNumber: 545,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-semibold",
                                children: t("bs.root.unionWarning")
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                                lineNumber: 547,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 flex flex-wrap gap-1",
                                children: unionTypes.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "text-[10px]",
                                        children: t(`bs.type.${v}`)
                                    }, v, false, {
                                        fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                                        lineNumber: 550,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                                lineNumber: 548,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                        lineNumber: 546,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                lineNumber: 544,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BsLogoUploader"], {
                    logoUrl: form.logoUrl,
                    onChange: (v)=>setForm((f)=>({
                                ...f,
                                logoUrl: v
                            }))
                }, void 0, false, {
                    fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                    lineNumber: 561,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-2 text-[11px] text-muted-foreground",
                    children: t("bs.hint.codeAuto")
                }, void 0, false, {
                    fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                    lineNumber: 565,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
            lineNumber: 560,
            columnNumber: 7
        }, this);
    })();
    const detailTitleOverride = mode === "create" ? `${t("bs.action.new")} — ${t("bs.field.parent")}: ${createParent ? `${createParent.title} (${createParent.code})` : t("bs.type.hq")}` : null;
    const badge = mode === "create" ? t("bs.action.new") : selectedNode?.code || undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$simple$2d$tree$2d$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SimpleTreeForm"], {
                treeTitle: t("bs.treeTitle"),
                nodes: treeNodes,
                selectedId: selectedId,
                onSelect: (node)=>{
                    if (node) handleSelect(node.id);
                },
                badge: badge,
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"], {
                    className: "h-3.5 w-3.5",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                    lineNumber: 589,
                    columnNumber: 15
                }, this),
                detailTitleOverride: detailTitleOverride,
                emptyText: t("bs.selectNode"),
                treeEmptyText: loading ? t("bs.loadingTree") : t("bs.emptyTree"),
                fields: fields,
                onFieldChange: onFieldChange,
                detailExtra: detailExtra,
                /* Task 33 — right-click flyout: «افزودن زیرشاخه» opens the create
           form under the right-clicked node (parent-driven type rules then
           apply inside the form); «حذف شاخه» is gated by the SAME rules as
           the ActionBar delete tile (root/system/has-children excluded). */ onAddBranch: (parent)=>startCreate(parent.id),
                canAddBranch: (node)=>{
                    const bs = byId.get(node.id);
                    return bs ? bsCanHostChild(bs) : false;
                },
                onDeleteBranch: (node)=>setContextDeleteId(node.id),
                canDeleteBranch: (node)=>{
                    const bs = byId.get(node.id);
                    return bs ? bsCanDelete(bs) : false;
                },
                onReset: actionReset,
                onSave: actionSave,
                onSaveNew: actionSaveNew,
                onSaveClose: actionSaveClose,
                onDelete: actionDelete,
                onDeleteNew: actionDeleteNew,
                onDeleteClose: actionDeleteClose,
                onClose: closeThisWindow,
                canSave: mode !== "idle",
                canCopy: false,
                canDelete: Boolean(selectedNode && bsCanDelete(selectedNode)),
                canPrint: false,
                listItems: listItems,
                listLoading: loading,
                onOpenListItem: (item)=>handleSelect(item.id),
                /* Task 35 — embedded mode: no caption buttons / drag on the form
           header (the Settings window owns the chrome); standalone keeps the
           Task-28 chromeless contract verbatim. */ onHeaderClose: embedded ? undefined : closeThisWindow,
                onHeaderMinimize: chromeApi?.onMinimize,
                onHeaderMaximize: chromeApi?.onToggleMaximize,
                headerMaximized: headerMaximized,
                onHeaderDragStart: chromeApi?.onDragStart,
                onHeaderDragMove: chromeApi?.onDragMove,
                onHeaderDragEnd: chromeApi?.onDragEnd,
                onHeaderDoubleClick: chromeApi?.onDoubleClick
            }, void 0, false, {
                fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                lineNumber: 581,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmDeleteDialog"], {
                open: contextDeleteId !== null,
                onOpenChange: (o)=>{
                    if (!o) setContextDeleteId(null);
                },
                onConfirm: async ()=>{
                    const bs = contextDeleteId ? byId.get(contextDeleteId) : null;
                    if (bs) await handleDelete(bs);
                }
            }, void 0, false, {
                fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
                lineNumber: 637,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/erp/business-structure/bs-window.tsx",
        lineNumber: 580,
        columnNumber: 5
    }, this);
}
_s(BusinessStructureWindow, "dB5Q/gZwNyVp1zmyY+aHj7hNeHM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWindowChrome"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"]
    ];
});
_c = BusinessStructureWindow;
var _c;
__turbopack_context__.k.register(_c, "BusinessStructureWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/erp/form-demo-window.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormDemoWindow",
    ()=>FormDemoWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$simple$2d$form$2d$two$2d$row$2d$tabbed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/simple-form-two-row-tabbed.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-window.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/* sample rows for the records-list dropdown — NOT business data (§4.6) */ const DEMO_ITEMS = [
    {
        id: "1001",
        title: "1001"
    },
    {
        id: "1002",
        title: "1002"
    },
    {
        id: "1003",
        title: "1003"
    }
];
function FormDemoWindow() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    /* Task 28 — chromeless host: the green form header hosts the caption
     buttons and drags the window; maximized state subscribes reactively */ const chrome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWindowChrome"])();
    const headerMaximized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "FormDemoWindow.useDesktop[headerMaximized]": (s)=>s.windows.find({
                "FormDemoWindow.useDesktop[headerMaximized]": (w)=>w.kind === "form-demo"
            }["FormDemoWindow.useDesktop[headerMaximized]"])?.maximized ?? false
    }["FormDemoWindow.useDesktop[headerMaximized]"]);
    const closeThisWindow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "FormDemoWindow.useCallback[closeThisWindow]": ()=>{
            const win = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().windows.find({
                "FormDemoWindow.useCallback[closeThisWindow].win": (w)=>w.kind === "form-demo"
            }["FormDemoWindow.useCallback[closeThisWindow].win"]);
            if (win) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().closeWindow(win.id);
        }
    }["FormDemoWindow.useCallback[closeThisWindow]"], []);
    /* three sample records the record-nav / list dropdown switch between */ const records = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "FormDemoWindow.useMemo[records]": ()=>[
                {
                    code: "1001",
                    name: `${t("fdf.sampleName")} 1`,
                    customerType: "normal",
                    balance: "0",
                    formStatus: "direct",
                    effect: t("fdf.rial"),
                    active: true
                },
                {
                    code: "1002",
                    name: `${t("fdf.sampleName")} 2`,
                    customerType: "special",
                    balance: "2500000",
                    formStatus: "indirect",
                    effect: t("fdf.rial"),
                    active: true
                },
                {
                    code: "1003",
                    name: `${t("fdf.sampleName")} 3`,
                    customerType: "normal",
                    balance: "980000",
                    formStatus: "direct",
                    effect: t("fdf.rial"),
                    active: false
                }
            ]
    }["FormDemoWindow.useMemo[records]"], [
        t
    ]);
    const [recIndex, setRecIndex] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    const [values, setValues] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "FormDemoWindow.useState": ()=>({
                ...records[0]
            })
    }["FormDemoWindow.useState"]);
    const applyRecord = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "FormDemoWindow.useCallback[applyRecord]": (i)=>{
            setRecIndex(i);
            setValues({
                ...records[i]
            });
        }
    }["FormDemoWindow.useCallback[applyRecord]"], [
        records
    ]);
    const onFieldChange = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "FormDemoWindow.useCallback[onFieldChange]": (id, value)=>{
            setValues({
                "FormDemoWindow.useCallback[onFieldChange]": (v)=>({
                        ...v,
                        [id]: value
                    })
            }["FormDemoWindow.useCallback[onFieldChange]"]);
        }
    }["FormDemoWindow.useCallback[onFieldChange]"], []);
    const fields = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "FormDemoWindow.useMemo[fields]": ()=>[
                {
                    id: "code",
                    label: t("fdf.code"),
                    required: true,
                    value: String(values.code ?? ""),
                    readOnly: true
                },
                {
                    id: "customerType",
                    label: t("fdf.customerType"),
                    required: true,
                    type: "select",
                    value: String(values.customerType ?? "normal"),
                    options: [
                        {
                            value: "normal",
                            label: t("fdf.typeNormal")
                        },
                        {
                            value: "special",
                            label: t("fdf.typeSpecial")
                        }
                    ]
                },
                {
                    id: "name",
                    label: t("fdf.name"),
                    value: String(values.name ?? "")
                },
                {
                    id: "customerGroup",
                    label: t("fdf.customerGroup"),
                    type: "lookup",
                    placeholder: t("sft.selectPlaceholder"),
                    onLookup: {
                        "FormDemoWindow.useMemo[fields]": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("abar.demoNote"))
                    }["FormDemoWindow.useMemo[fields]"]
                },
                {
                    id: "balance",
                    label: t("fdf.balance"),
                    type: "number",
                    value: String(values.balance ?? "0"),
                    suffixChip: t("fdf.debit")
                },
                {
                    id: "formStatus",
                    label: t("fdf.formStatus"),
                    required: true,
                    type: "select",
                    value: String(values.formStatus ?? "direct"),
                    options: [
                        {
                            value: "direct",
                            label: t("fdf.dirDirect")
                        },
                        {
                            value: "indirect",
                            label: t("fdf.dirIndirect")
                        }
                    ]
                },
                {
                    id: "effect",
                    label: t("fdf.effect"),
                    required: true,
                    type: "lookup",
                    value: String(values.effect ?? ""),
                    onLookup: {
                        "FormDemoWindow.useMemo[fields]": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("abar.demoNote"))
                    }["FormDemoWindow.useMemo[fields]"]
                },
                {
                    id: "active",
                    label: t("fdf.active"),
                    type: "checkbox",
                    checked: values.active === true
                }
            ]
    }["FormDemoWindow.useMemo[fields]"], [
        t,
        values
    ]);
    /* OPTIONAL tabbed detail grids — both start empty («اطلاعاتی وجود ندارد») */ const tabs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "FormDemoWindow.useMemo[tabs]": ()=>[
                {
                    id: "addresses",
                    label: t("fdf.tabAddresses"),
                    columns: [
                        {
                            id: "addrType",
                            label: t("fdf.addrType"),
                            required: true,
                            minWidth: "min-w-28"
                        },
                        {
                            id: "city",
                            label: t("fdf.city"),
                            required: true,
                            minWidth: "min-w-28"
                        },
                        {
                            id: "fullAddr",
                            label: t("fdf.fullAddr"),
                            required: true,
                            minWidth: "min-w-64"
                        },
                        {
                            id: "postal",
                            label: t("fdf.postal"),
                            minWidth: "min-w-28"
                        }
                    ]
                },
                {
                    id: "contacts",
                    label: t("fdf.tabContacts"),
                    columns: [
                        {
                            id: "contactType",
                            label: t("fdf.contactType"),
                            required: true,
                            minWidth: "min-w-28"
                        },
                        {
                            id: "number",
                            label: t("fdf.number"),
                            required: true,
                            minWidth: "min-w-32"
                        },
                        {
                            id: "notes",
                            label: t("fdf.notes"),
                            minWidth: "min-w-48"
                        }
                    ]
                }
            ]
    }["FormDemoWindow.useMemo[tabs]"], [
        t
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$simple$2d$form$2d$two$2d$row$2d$tabbed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SimpleFormTwoRowTabbed"], {
        title: t("fdf.title"),
        badge: t("fdf.badge"),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
            className: "h-3.5 w-3.5",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/erp/form-demo-window.tsx",
            lineNumber: 179,
            columnNumber: 13
        }, this),
        fields: fields,
        onFieldChange: onFieldChange,
        tabs: tabs,
        onSaveRows: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.savedToast")),
        onFirst: ()=>applyRecord(0),
        onPrev: ()=>applyRecord(Math.max(0, recIndex - 1)),
        onNext: ()=>applyRecord(Math.min(records.length - 1, recIndex + 1)),
        onLast: ()=>applyRecord(records.length - 1),
        onReset: ()=>{
            applyRecord(recIndex);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.resetToast"));
        },
        onSave: async ()=>{
            await delay(550);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.savedToast"));
        },
        onCopy: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.copyToast"));
        },
        onDelete: async ()=>{
            await delay(350);
            applyRecord(0);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.deletedToast"));
        },
        onPrint: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.printToast"));
        },
        onClose: closeThisWindow,
        onHeaderClose: closeThisWindow,
        onHeaderMinimize: chrome?.onMinimize,
        onHeaderMaximize: chrome?.onToggleMaximize,
        headerMaximized: headerMaximized,
        onHeaderDragStart: chrome?.onDragStart,
        onHeaderDragMove: chrome?.onDragMove,
        onHeaderDragEnd: chrome?.onDragEnd,
        onHeaderDoubleClick: chrome?.onDoubleClick,
        onHelp: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("abar.demoNote"));
        },
        listItems: DEMO_ITEMS,
        onOpenListItem: (item)=>{
            const i = Number(item.id) - 1001;
            applyRecord(i >= 0 && i < records.length ? i : 0);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.itemOpened"));
        }
    }, void 0, false, {
        fileName: "[project]/src/components/erp/form-demo-window.tsx",
        lineNumber: 176,
        columnNumber: 5
    }, this);
}
_s(FormDemoWindow, "Z8M/F+Fq8EyMY34dhIQ532MlR3A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWindowChrome"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"]
    ];
});
_c = FormDemoWindow;
var _c;
__turbopack_context__.k.register(_c, "FormDemoWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/erp/settings-window.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SettingsWindow",
    ()=>SettingsWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MonitorCog$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor-cog.js [app-client] (ecmascript) <export default as MonitorCog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-client] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/separator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/business-structure/bs-window.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
function SettingsWindow() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "SettingsWindow.useSettings[locale]": (s)=>s.locale
    }["SettingsWindow.useSettings[locale]"]);
    const setLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "SettingsWindow.useSettings[setLocale]": (s)=>s.setLocale
    }["SettingsWindow.useSettings[setLocale]"]);
    const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])({
        "SettingsWindow.useSettings[dir]": (s)=>s.dir()
    }["SettingsWindow.useSettings[dir]"]);
    const { theme, setTheme, resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [page, setPage] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("home");
    /* §1.4 — direction-aware navigation glyphs (no hardcoded physical sides) */ const BackIcon = dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"];
    const ForwardIcon = dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"];
    if (page === "business-structure") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-10 shrink-0 items-center gap-1.5 border-b border-border/60 px-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setPage("home"),
                            className: "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackIcon, {
                                    className: "h-3.5 w-3.5",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this),
                                t("settings.back")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground/50",
                            "aria-hidden": true,
                            children: "/"
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "truncate text-xs font-semibold text-foreground/90",
                            children: t("menus.businessStructure")
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/erp/settings-window.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-h-0 flex-1",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BusinessStructureWindow"], {
                        embedded: true,
                        onEmbeddedClose: ()=>setPage("home")
                    }, void 0, false, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/erp/settings-window.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/erp/settings-window.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this);
    }
    if (page === "user-management") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-10 shrink-0 items-center gap-1.5 border-b border-border/60 px-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setPage("home"),
                            className: "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackIcon, {
                                    className: "h-3.5 w-3.5",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                t("settings.back")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs text-muted-foreground/50",
                            "aria-hidden": true,
                            children: "/"
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 90,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "truncate text-xs font-semibold text-foreground/90",
                            children: t("app.userManagement")
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/erp/settings-window.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto p-6 scrollbar-slim",
                    dir: "auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
                            appKey: "userManagement",
                            className: "h-20 w-20 rounded-3xl",
                            iconClass: "h-9 w-9"
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-bold tracking-tight",
                                    children: t("app.userManagement")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs text-muted-foreground",
                                    children: t("settings.umDesc")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                                        className: "mt-0.5 h-5 w-5 shrink-0 text-amber-600",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 114,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs leading-relaxed text-muted-foreground",
                                        children: t("settings.umPending")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/erp/settings-window.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/erp/settings-window.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full overflow-y-auto scrollbar-slim",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-border/60 bg-gradient-to-l from-primary/10 via-transparent to-transparent p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MonitorCog$3e$__["MonitorCog"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 129,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-bold",
                                    children: t("settings.title")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: t("settings.subtitle")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/erp/settings-window.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/erp/settings-window.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/erp/settings-window.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-xl space-y-5 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-xl border border-border/70 bg-card/60 p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-3 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                        className: "h-4 w-4 text-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 143,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-semibold",
                                        children: t("common.language")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "ms-auto font-mono text-[10px]",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALES"].length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALES"].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setLocale(l),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-all cursor-pointer", locale === l ? "border-primary bg-primary/10 font-semibold text-primary shadow-sm" : "border-border hover:border-primary/40 hover:bg-accent"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono text-[10px] text-muted-foreground",
                                                children: l
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOCALE_NAMES"][l]
                                        ]
                                    }, l, true, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-xl border border-border/70 bg-card/60 p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mb-3 text-sm font-semibold",
                                children: t("settings.appearance")
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: "theme-switch",
                                        className: "flex items-center gap-2 text-sm",
                                        children: [
                                            resolvedTheme === "dark" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                                className: "h-4 w-4 text-primary"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                                lineNumber: 174,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                className: "h-4 w-4 text-amber-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                                lineNumber: 176,
                                                columnNumber: 17
                                            }, this),
                                            theme === "dark" ? t("settings.dark") : t("settings.light")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 172,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                        id: "theme-switch",
                                        checked: theme === "dark",
                                        onCheckedChange: (v)=>setTheme(v ? "dark" : "light")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setPage("business-structure"),
                        className: "flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"], {
                                    className: "h-5 w-5",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/erp/settings-window.tsx",
                                    lineNumber: 195,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 194,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-sm font-semibold",
                                        children: t("menus.businessStructure")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 198,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-xs text-muted-foreground",
                                        children: t("settings.bsDesc")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForwardIcon, {
                                className: "h-4 w-4 shrink-0 text-muted-foreground",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setPage("user-management"),
                        className: "flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTile"], {
                                appKey: "userManagement",
                                className: "h-10 w-10",
                                iconClass: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-sm font-semibold",
                                        children: t("app.userManagement")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 214,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-xs text-muted-foreground",
                                        children: t("settings.umDesc")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/erp/settings-window.tsx",
                                        lineNumber: 215,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 213,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForwardIcon, {
                                className: "h-4 w-4 shrink-0 text-muted-foreground",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/erp/settings-window.tsx",
                                lineNumber: 217,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$separator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {}, void 0, false, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 220,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-xs text-muted-foreground",
                        children: [
                            t("app.name"),
                            " — ERP Rebuild · NestJS 11 + Next.js 16 + Prisma"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/erp/settings-window.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/erp/settings-window.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/erp/settings-window.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
_s(SettingsWindow, "lANCNH9787CfPzM6yGddOFu7E48=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = SettingsWindow;
var _c;
__turbopack_context__.k.register(_c, "SettingsWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/erp/tree-demo-window.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TreeDemoWindow",
    ()=>TreeDemoWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-tree.js [app-client] (ecmascript) <export default as ListTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$simple$2d$tree$2d$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/simple-tree-form.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-window.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/* sample detail data of the demo tree — NOT business data (§4.6); the
   «latin» strings are sample DATA (the legacy form's own «Tehran Provine»
   column), not UI chrome, so they stay outside the 11 dictionaries */ const PLACES = {
    geo: {
        labelKey: "stf.geoTitle",
        latin: "Geographic Locations",
        code: "0",
        kind: "country"
    },
    iran: {
        labelKey: "stf.iran",
        latin: "Iran",
        code: "1",
        kind: "country"
    },
    "tehran-province": {
        labelKey: "stf.tehranProvince",
        latin: "Tehran Province",
        code: "10",
        kind: "province"
    },
    tehran: {
        labelKey: "stf.tehran",
        latin: "Tehran",
        code: "101",
        kind: "city"
    },
    alborz: {
        labelKey: "stf.alborz",
        latin: "Alborz Province",
        code: "20",
        kind: "province"
    },
    karaj: {
        labelKey: "stf.karaj",
        latin: "Karaj",
        code: "201",
        kind: "city"
    }
};
function TreeDemoWindow() {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    /* Task 28 contract — chromeless host: the green form header hosts the
     caption buttons and drags the window; maximized state subscribes reactively */ const chrome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWindowChrome"])();
    const headerMaximized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"])({
        "TreeDemoWindow.useDesktop[headerMaximized]": (s)=>s.windows.find({
                "TreeDemoWindow.useDesktop[headerMaximized]": (w)=>w.kind === "tree-demo"
            }["TreeDemoWindow.useDesktop[headerMaximized]"])?.maximized ?? false
    }["TreeDemoWindow.useDesktop[headerMaximized]"]);
    const closeThisWindow = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "TreeDemoWindow.useCallback[closeThisWindow]": ()=>{
            const win = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().windows.find({
                "TreeDemoWindow.useCallback[closeThisWindow].win": (w)=>w.kind === "tree-demo"
            }["TreeDemoWindow.useCallback[closeThisWindow].win"]);
            if (win) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"].getState().closeWindow(win.id);
        }
    }["TreeDemoWindow.useCallback[closeThisWindow]"], []);
    const nodes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "TreeDemoWindow.useMemo[nodes]": ()=>[
                {
                    id: "geo",
                    label: t("stf.geoTitle"),
                    icon: "globe",
                    children: [
                        {
                            id: "iran",
                            label: t("stf.iran"),
                            icon: "flag",
                            children: [
                                {
                                    id: "tehran-province",
                                    label: t("stf.tehranProvince"),
                                    icon: "pin",
                                    children: [
                                        {
                                            id: "tehran",
                                            label: t("stf.tehran"),
                                            icon: "dot"
                                        }
                                    ]
                                },
                                {
                                    id: "alborz",
                                    label: t("stf.alborz"),
                                    icon: "pin",
                                    children: [
                                        {
                                            id: "karaj",
                                            label: t("stf.karaj"),
                                            icon: "dot"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
    }["TreeDemoWindow.useMemo[nodes]"], [
        t
    ]);
    /* detail values of a node, straight from the sample data */ const valuesOf = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "TreeDemoWindow.useCallback[valuesOf]": (id)=>{
            const p = PLACES[id] ?? PLACES.geo;
            return {
                type: p.kind,
                code: p.code,
                title: t(p.labelKey),
                latinTitle: p.latin,
                active: true
            };
        }
    }["TreeDemoWindow.useCallback[valuesOf]"], [
        t
    ]);
    /* legacy screenshot state: a province leaf is selected on open */ const [selectedId, setSelectedId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("tehran-province");
    const [values, setValues] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "TreeDemoWindow.useState": ()=>valuesOf("tehran-province")
    }["TreeDemoWindow.useState"]);
    const onSelect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "TreeDemoWindow.useCallback[onSelect]": (node)=>{
            const id = node?.id ?? null;
            setSelectedId(id);
            setValues(valuesOf(id ?? "geo"));
        }
    }["TreeDemoWindow.useCallback[onSelect]"], [
        valuesOf
    ]);
    const onFieldChange = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "TreeDemoWindow.useCallback[onFieldChange]": (id, value)=>{
            setValues({
                "TreeDemoWindow.useCallback[onFieldChange]": (v)=>({
                        ...v,
                        [id]: value
                    })
            }["TreeDemoWindow.useCallback[onFieldChange]"]);
        }
    }["TreeDemoWindow.useCallback[onFieldChange]"], []);
    const fields = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "TreeDemoWindow.useMemo[fields]": ()=>[
                {
                    id: "type",
                    label: t("stf.type"),
                    required: true,
                    type: "select",
                    value: values.type,
                    options: [
                        {
                            value: "country",
                            label: t("stf.optCountry")
                        },
                        {
                            value: "province",
                            label: t("stf.optProvince")
                        },
                        {
                            value: "city",
                            label: t("stf.optCity")
                        }
                    ]
                },
                {
                    id: "code",
                    label: t("fdf.code"),
                    required: true,
                    type: "number",
                    value: values.code
                },
                {
                    id: "title",
                    label: t("fdf.name"),
                    required: true,
                    value: values.title
                },
                {
                    id: "latinTitle",
                    label: t("stf.latinTitle"),
                    required: true,
                    value: values.latinTitle
                },
                {
                    id: "active",
                    label: t("fdf.active"),
                    type: "checkbox",
                    checked: values.active
                }
            ]
    }["TreeDemoWindow.useMemo[fields]"], [
        t,
        values
    ]);
    /* the records-list dropdown lists every tree node (opens it in the tree) */ const listItems = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "TreeDemoWindow.useMemo[listItems]": ()=>Object.entries(PLACES).map({
                "TreeDemoWindow.useMemo[listItems]": ([id, p])=>({
                        id,
                        title: t(p.labelKey)
                    })
            }["TreeDemoWindow.useMemo[listItems]"])
    }["TreeDemoWindow.useMemo[listItems]"], [
        t
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$simple$2d$tree$2d$form$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SimpleTreeForm"], {
        treeTitle: t("stf.geoTitle"),
        nodes: nodes,
        defaultSelectedId: selectedId,
        onSelect: onSelect,
        badge: t("fdf.badge"),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
            className: "h-3.5 w-3.5",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/erp/tree-demo-window.tsx",
            lineNumber: 153,
            columnNumber: 13
        }, this),
        fields: fields,
        onFieldChange: onFieldChange,
        onReset: ()=>{
            setValues(valuesOf(selectedId ?? "geo"));
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.resetToast"));
        },
        onSave: async ()=>{
            await delay(550);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.savedToast"));
        },
        onCopy: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.copyToast"));
        },
        onDelete: async ()=>{
            await delay(350);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.deletedToast"));
        },
        onPrint: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.printToast"));
        },
        onClose: closeThisWindow,
        onHeaderClose: closeThisWindow,
        onHeaderMinimize: chrome?.onMinimize,
        onHeaderMaximize: chrome?.onToggleMaximize,
        headerMaximized: headerMaximized,
        onHeaderDragStart: chrome?.onDragStart,
        onHeaderDragMove: chrome?.onDragMove,
        onHeaderDragEnd: chrome?.onDragEnd,
        onHeaderDoubleClick: chrome?.onDoubleClick,
        onHelp: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(t("abar.demoNote"));
        },
        canSave: Boolean(selectedId),
        canCopy: Boolean(selectedId),
        canDelete: Boolean(selectedId),
        listItems: listItems,
        onOpenListItem: (item)=>{
            const node = PLACES[item.id] ? {
                id: item.id,
                label: item.title,
                icon: "dot"
            } : null;
            if (node) onSelect(node);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(t("abar.itemOpened"));
        }
    }, void 0, false, {
        fileName: "[project]/src/components/erp/tree-demo-window.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
_s(TreeDemoWindow, "CeAQhG30JtLIncl8xO3niuslsPk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWindowChrome"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesktop"]
    ];
});
_c = TreeDemoWindow;
var _c;
__turbopack_context__.k.register(_c, "TreeDemoWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActionIconButton",
    ()=>ActionIconButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
function ActionIconButton({ label, tint, icon, onClick, disabled, busy, badge }) {
    const inactive = Boolean(disabled) || Boolean(busy);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        delayDuration: 250,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                    asChild: true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": label,
                        "aria-disabled": inactive || undefined,
                        onClick: ()=>{
                            if (!inactive) onClick?.();
                        },
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-pointer", tint, inactive && "opacity-40 hover:brightness-100 cursor-not-allowed"),
                        children: [
                            busy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "h-[18px] w-[18px] animate-spin",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                                lineNumber: 59,
                                columnNumber: 15
                            }, this) : icon,
                            badge && !busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": true,
                                className: "absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border",
                                children: badge === "plus" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "h-2.5 w-2.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                                    lineNumber: 69,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-2.5 w-2.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                                    lineNumber: 71,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                                lineNumber: 64,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                    dir: "auto",
                    className: "text-[11px]",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/action-icon-button.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c = ActionIconButton;
var _c;
__turbopack_context__.k.register(_c, "ActionIconButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmDeleteDialog",
    ()=>ConfirmDeleteDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as TriangleAlert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function ConfirmDeleteDialog({ open, onOpenChange, title, body, onConfirm }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const [working, setWorking] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const confirm = async ()=>{
        setWorking(true);
        try {
            await onConfirm();
        } finally{
            setWorking(false);
            onOpenChange(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: onOpenChange,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "max-w-sm",
            dir: "auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlert$3e$__["TriangleAlert"], {
                                    className: "h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this),
                                title ?? t("abar.confirmDeleteTitle")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            className: "text-start leading-relaxed",
                            children: body ?? t("abar.confirmDeleteBody")
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                    className: "gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: ()=>onOpenChange(false),
                            disabled: working,
                            className: "cursor-pointer",
                            children: t("common.cancel")
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "destructive",
                            onClick: confirm,
                            disabled: working,
                            className: "cursor-pointer",
                            children: [
                                working ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "h-4 w-4 animate-spin",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this),
                                t("common.confirm")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(ConfirmDeleteDialog, "mmU3R6p9KBXuERJXf83h28tTVK8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"]
    ];
});
_c = ConfirmDeleteDialog;
var _c;
__turbopack_context__.k.register(_c, "ConfirmDeleteDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/copy-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CopyRecordButton",
    ()=>CopyRecordButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function CopyRecordButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("abar.copy"),
        tint: "from-violet-500 to-violet-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/copy-button.tsx",
            lineNumber: 23,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/copy-button.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(CopyRecordButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = CopyRecordButton;
var _c;
__turbopack_context__.k.register(_c, "CopyRecordButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/delete-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeleteRecordButton",
    ()=>DeleteRecordButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function DeleteRecordButton({ onClick, disabled, label, confirmTitle, confirmBody }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    const [confirmOpen, setConfirmOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
                label: label ?? t("abar.delete"),
                tint: "from-rose-500 to-rose-600",
                busy: busy,
                disabled: disabled,
                onClick: ()=>setConfirmOpen(true),
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                    className: "h-[18px] w-[18px]",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/action-bar/delete-button.tsx",
                    lineNumber: 33,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/delete-button.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmDeleteDialog"], {
                open: confirmOpen,
                onOpenChange: setConfirmOpen,
                title: confirmTitle ?? t("abar.confirmDeleteTitle"),
                body: confirmBody ?? t("abar.confirmDeleteBody"),
                onConfirm: ()=>run(onClick)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/delete-button.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/action-bar/delete-button.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(DeleteRecordButton, "ar2/2cHQEp0rqojw210seRJNmWg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = DeleteRecordButton;
var _c;
__turbopack_context__.k.register(_c, "DeleteRecordButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/delete-close-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeleteCloseButton",
    ()=>DeleteCloseButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function DeleteCloseButton({ onClick, disabled, label, confirmTitle, confirmBody }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    const [confirmOpen, setConfirmOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
                label: label ?? t("abar.deleteClose"),
                tint: "from-rose-500 to-rose-600",
                busy: busy,
                disabled: disabled,
                onClick: ()=>setConfirmOpen(true),
                badge: "close",
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                    className: "h-[18px] w-[18px]",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/action-bar/delete-close-button.tsx",
                    lineNumber: 35,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/delete-close-button.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmDeleteDialog"], {
                open: confirmOpen,
                onOpenChange: setConfirmOpen,
                title: confirmTitle ?? t("abar.confirmDeleteTitle"),
                body: confirmBody ?? t("abar.confirmDeleteBody"),
                onConfirm: ()=>run(onClick)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/delete-close-button.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/action-bar/delete-close-button.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(DeleteCloseButton, "ar2/2cHQEp0rqojw210seRJNmWg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = DeleteCloseButton;
var _c;
__turbopack_context__.k.register(_c, "DeleteCloseButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/delete-new-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeleteNewButton",
    ()=>DeleteNewButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function DeleteNewButton({ onClick, disabled, label, confirmTitle, confirmBody }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    const [confirmOpen, setConfirmOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
                label: label ?? t("abar.deleteNew"),
                tint: "from-rose-500 to-rose-600",
                busy: busy,
                disabled: disabled,
                onClick: ()=>setConfirmOpen(true),
                badge: "plus",
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                    className: "h-[18px] w-[18px]",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/action-bar/delete-new-button.tsx",
                    lineNumber: 35,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/delete-new-button.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmDeleteDialog"], {
                open: confirmOpen,
                onOpenChange: setConfirmOpen,
                title: confirmTitle ?? t("abar.confirmDeleteTitle"),
                body: confirmBody ?? t("abar.confirmDeleteBody"),
                onConfirm: ()=>run(onClick)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/delete-new-button.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/action-bar/delete-new-button.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(DeleteNewButton, "ar2/2cHQEp0rqojw210seRJNmWg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = DeleteNewButton;
var _c;
__turbopack_context__.k.register(_c, "DeleteNewButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/form-action-bar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormActionBar",
    ()=>FormActionBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$reset$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/reset-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/save-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/save-new-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/save-close-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$copy$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/copy-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/delete-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/delete-new-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/delete-close-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$print$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/print-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$list$2d$dropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/list-dropdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$help$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/help-button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
/** legacy semantics: run a, then b (used for the *-New / *-Close compositions) */ function sequence(a, b) {
    if (!a || !b) return undefined;
    return ()=>Promise.resolve(a()).then(()=>b());
}
function Divider() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": true,
        className: "mx-0.5 h-6 w-px shrink-0 bg-border"
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
        lineNumber: 56,
        columnNumber: 10
    }, this);
}
_c = Divider;
function FormActionBar({ onReset, onSave, onSaveNew, onSaveClose, onCopy, onDelete, onDeleteNew, onDeleteClose, onPrint, onClose, onHelp, listItems, listLoading, onOpenListItem, canSave = true, canCopy = true, canDelete = true, canPrint = true, className }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const saveNew = onSaveNew ?? sequence(onSave, onReset);
    const saveClose = onSaveClose ?? sequence(onSave, onClose);
    const deleteNew = onDeleteNew ?? sequence(onDelete, onReset);
    const deleteClose = onDeleteClose ?? sequence(onDelete, onClose);
    const print = onPrint ?? (()=>window.print());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "toolbar",
        "aria-label": t("abar.toolbar"),
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex w-full flex-wrap items-center gap-1.5", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$reset$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResetFieldsButton"], {
                onClick: onReset
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SaveButton"], {
                onClick: onSave,
                disabled: !canSave
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SaveNewButton"], {
                onClick: saveNew,
                disabled: !canSave || !saveNew
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SaveCloseButton"], {
                onClick: saveClose,
                disabled: !canSave || !saveClose
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$copy$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CopyRecordButton"], {
                onClick: onCopy,
                disabled: !canCopy
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeleteRecordButton"], {
                onClick: onDelete,
                disabled: !canDelete
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeleteNewButton"], {
                onClick: deleteNew,
                disabled: !canDelete || !deleteNew
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeleteCloseButton"], {
                onClick: deleteClose,
                disabled: !canDelete || !deleteClose
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$print$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PrintFormButton"], {
                onClick: print,
                disabled: !canPrint
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$list$2d$dropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RecordListDropdown"], {
                items: listItems,
                loading: listLoading,
                onOpenListItem: onOpenListItem
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            onHelp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$help$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HelpButton"], {
                onClick: onHelp
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 125,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
}
_s(FormActionBar, "uZyfTDL5l50aWwhHvO0Py2n2h8Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"]
    ];
});
_c1 = FormActionBar;
var _c, _c1;
__turbopack_context__.k.register(_c, "Divider");
__turbopack_context__.k.register(_c1, "FormActionBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/help-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HelpButton",
    ()=>HelpButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-help.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function HelpButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("sft.help"),
        tint: "from-fuchsia-500 to-fuchsia-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/help-button.tsx",
            lineNumber: 25,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/help-button.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(HelpButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = HelpButton;
var _c;
__turbopack_context__.k.register(_c, "HelpButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/** Form action bar (Task 20 + Task 28 help) — legacy FaraTaraz-style action infrastructure. */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/form-action-bar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$confirm$2d$delete$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/confirm-delete-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$reset$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/reset-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/save-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/save-new-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/save-close-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$copy$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/copy-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/delete-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/delete-new-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/delete-close-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$print$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/print-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$list$2d$dropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/list-dropdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$help$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/help-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/list-dropdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecordListDropdown",
    ()=>RecordListDropdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function RecordListDropdown({ items, loading, disabled, label, onOpenListItem }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const text = label ?? t("abar.list");
    const list = items ?? [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    title: text,
                    "aria-label": text,
                    disabled: disabled,
                    className: "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                            className: "h-[18px] w-[18px]",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "absolute bottom-1 h-2.5 w-2.5 opacity-80",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                align: "start",
                className: "max-h-72 w-64 overflow-y-auto scrollbar-slim",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                        className: "text-xs",
                        children: text
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {}, void 0, false, {
                        fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "h-3.5 w-3.5 animate-spin",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                                lineNumber: 58,
                                columnNumber: 13
                            }, this),
                            t("common.loading")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this) : list.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-2 py-3 text-xs text-muted-foreground",
                        children: t("abar.listEmpty")
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this) : list.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                            onClick: ()=>onOpenListItem?.(it),
                            className: "cursor-pointer gap-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    "aria-hidden": true,
                                    className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                                        lineNumber: 74,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                                    lineNumber: 70,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex min-w-0 flex-col",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate text-xs font-medium",
                                            children: it.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                                            lineNumber: 77,
                                            columnNumber: 17
                                        }, this),
                                        it.subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate text-[10px] text-muted-foreground",
                                            children: it.subtitle
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                                            lineNumber: 79,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, it.id, true, {
                            fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/action-bar/list-dropdown.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(RecordListDropdown, "uZyfTDL5l50aWwhHvO0Py2n2h8Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"]
    ];
});
_c = RecordListDropdown;
var _c;
__turbopack_context__.k.register(_c, "RecordListDropdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/print-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PrintFormButton",
    ()=>PrintFormButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/printer.js [app-client] (ecmascript) <export default as Printer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function PrintFormButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("abar.print"),
        tint: "from-amber-500 to-amber-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick ?? (()=>window.print())),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/print-button.tsx",
            lineNumber: 23,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/print-button.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(PrintFormButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = PrintFormButton;
var _c;
__turbopack_context__.k.register(_c, "PrintFormButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/reset-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ResetFieldsButton",
    ()=>ResetFieldsButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ResetFieldsButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("abar.reset"),
        tint: "from-sky-500 to-sky-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/reset-button.tsx",
            lineNumber: 24,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/reset-button.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(ResetFieldsButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = ResetFieldsButton;
var _c;
__turbopack_context__.k.register(_c, "ResetFieldsButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/save-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SaveButton",
    ()=>SaveButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function SaveButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("abar.save"),
        tint: "from-emerald-500 to-emerald-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick),
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/save-button.tsx",
            lineNumber: 23,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/save-button.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(SaveButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = SaveButton;
var _c;
__turbopack_context__.k.register(_c, "SaveButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/save-close-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SaveCloseButton",
    ()=>SaveCloseButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function SaveCloseButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("abar.saveClose"),
        tint: "from-emerald-500 to-emerald-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick),
        badge: "close",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/save-close-button.tsx",
            lineNumber: 25,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/save-close-button.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(SaveCloseButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = SaveCloseButton;
var _c;
__turbopack_context__.k.register(_c, "SaveCloseButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/save-new-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SaveNewButton",
    ()=>SaveNewButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/action-icon-button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function SaveNewButton({ onClick, disabled, label }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const { busy, run } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$action$2d$icon$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActionIconButton"], {
        label: label ?? t("abar.saveNew"),
        tint: "from-emerald-500 to-emerald-600",
        busy: busy,
        disabled: disabled,
        onClick: ()=>run(onClick),
        badge: "plus",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
            className: "h-[18px] w-[18px]",
            "aria-hidden": true
        }, void 0, false, {
            fileName: "[project]/src/components/forms/action-bar/save-new-button.tsx",
            lineNumber: 25,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/forms/action-bar/save-new-button.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(SaveNewButton, "qBgU9UHDvCpdH5rDfJnRtLZpvqs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$use$2d$action$2d$run$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionRun"]
    ];
});
_c = SaveNewButton;
var _c;
__turbopack_context__.k.register(_c, "SaveNewButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/action-bar/use-action-run.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useActionRun",
    ()=>useActionRun
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useActionRun() {
    _s();
    const [busy, setBusy] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const busyRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](false);
    const run = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useActionRun.useCallback[run]": (fn)=>{
            if (!fn || busyRef.current) return Promise.resolve();
            busyRef.current = true;
            setBusy(true);
            return Promise.resolve().then(fn).catch({
                "useActionRun.useCallback[run]": (error)=>console.error("[form-action-bar]", error)
            }["useActionRun.useCallback[run]"]).finally({
                "useActionRun.useCallback[run]": ()=>{
                    busyRef.current = false;
                    setBusy(false);
                }
            }["useActionRun.useCallback[run]"]);
        }
    }["useActionRun.useCallback[run]"], []);
    return {
        busy,
        run
    };
}
_s(useActionRun, "INFBuLOSPl63yBUTERbutP5YSDc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/form-primitives.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FieldCell",
    ()=>FieldCell,
    "HeaderButton",
    ()=>HeaderButton,
    "NavButton",
    ()=>NavButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/checkbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/select.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
function HeaderButton({ onClick, label, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        /* window-caption contract: the host drag handler never starts a drag
         from these buttons (closest("[data-window-btn]") guard) */ "data-window-btn": true,
        "aria-label": label,
        title: label,
        onClick: onClick,
        className: "flex h-7 w-7 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/forms/form-primitives.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_c = HeaderButton;
function NavButton({ icon, label, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        "aria-label": label,
        title: label,
        disabled: !onClick,
        onClick: onClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-7 w-7 items-center justify-center rounded-md text-foreground/70 transition-colors rtl:-scale-x-100", onClick ? "hover:bg-foreground/10 hover:text-foreground cursor-pointer" : "opacity-40"),
        children: icon
    }, void 0, false, {
        fileName: "[project]/src/components/forms/form-primitives.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_c1 = NavButton;
function FieldCell({ field, onChange, idPrefix = "sft" }) {
    const type = field.type ?? "text";
    /* Task 27 — compact vertical metrics: field height 32px → 22px (−31%) so
     the tabs section and the form footer gain room. Horizontal metrics
     (label alignment, --label-w, gaps) are untouched. */ const inputBase = "h-5.5 min-w-0 text-xs";
    /* checkbox — inline toggle pushed to the row end (legacy «فعال» placement) */ if (type === "checkbox") {
        const cid = `${idPrefix}-chk-${field.id}`;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            htmlFor: cid,
            className: "flex cursor-pointer items-center justify-end gap-2 text-xs text-foreground/90",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Checkbox"], {
                    id: cid,
                    checked: field.checked === true,
                    onCheckedChange: (v)=>onChange?.(field.id, v === true),
                    disabled: field.disabled,
                    "aria-label": field.label
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "whitespace-nowrap",
                    children: field.label
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 123,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/forms/form-primitives.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-form-cell": true,
        className: "flex min-w-0 items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "data-form-label": true,
                className: "flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-[var(--label-w,auto)] shrink-0 text-end",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            "data-form-label-text": true,
                            className: "inline-block whitespace-nowrap",
                            children: field.label
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "opacity-70",
                        "aria-hidden": true,
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-rose-500", !field.required && "invisible"),
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            type === "select" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                value: field.value,
                onValueChange: (v)=>onChange?.(field.id, v),
                disabled: field.disabled,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                        "aria-label": field.label,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(inputBase, "flex-1"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                            placeholder: field.placeholder
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                        children: (field.options ?? []).map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                value: o.value,
                                className: "text-xs",
                                children: o.label
                            }, o.value, false, {
                                fileName: "[project]/src/components/forms/form-primitives.tsx",
                                lineNumber: 165,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 155,
                columnNumber: 9
            }, this) : type === "lookup" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-w-0 flex-1 items-center gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                        value: field.value ?? "",
                        placeholder: field.placeholder,
                        readOnly: field.readOnly,
                        disabled: field.disabled,
                        "aria-label": field.label,
                        dir: field.ltr ? "ltr" : undefined,
                        onChange: (e)=>onChange?.(field.id, e.target.value),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(inputBase, field.ltr && "text-start")
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this),
                    field.onLookup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": `${field.label} — +`,
                        onClick: field.onLookup,
                        className: "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "h-3.5 w-3.5",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 190,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 184,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 172,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-w-0 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                        value: field.value ?? "",
                        inputMode: type === "number" ? "decimal" : undefined,
                        placeholder: field.placeholder,
                        readOnly: field.readOnly,
                        disabled: field.disabled,
                        "aria-label": field.label,
                        dir: field.ltr ? "ltr" : undefined,
                        onChange: (e)=>onChange?.(field.id, e.target.value),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(inputBase, field.ltr && "text-start", field.suffixChip && "pe-16")
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 196,
                        columnNumber: 11
                    }, this),
                    field.suffixChip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "pointer-events-none absolute end-1 top-1/2 flex h-4 -translate-y-1/2 items-center rounded-md bg-rose-500/15 px-1.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400",
                        children: field.suffixChip
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 208,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/form-primitives.tsx",
        lineNumber: 129,
        columnNumber: 5
    }, this);
}
_c2 = FieldCell;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "HeaderButton");
__turbopack_context__.k.register(_c1, "NavButton");
__turbopack_context__.k.register(_c2, "FieldCell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/simple-form-two-row-tabbed.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SimpleFormTwoRowTabbed",
    ()=>SimpleFormTwoRowTabbed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$first$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronFirst$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-first.js [app-client] (ecmascript) <export default as ChevronFirst>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$last$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLast$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-last.js [app-client] (ecmascript) <export default as ChevronLast>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-client] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/form-action-bar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$use$2d$aligned$2d$labels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/use-aligned-labels.ts [app-client] (ecmascript)");
/* Task 30 — HeaderButton/NavButton/FieldCell moved verbatim to the shared
   form-primitives module so SimpleTreeForm reuses the identical visual
   contract (Task 25.1 label markup, Task 27 metrics, Task 26 RTL classes). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/form-primitives.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
/* ------------------------------------------------------------------ */ /* Internals                                                            */ /* ------------------------------------------------------------------ */ function MiniRowButton({ icon, label, tintClass, onClick, disabled }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        "aria-label": label,
        title: label,
        disabled: disabled,
        onClick: onClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-7 w-7 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tintClass, disabled && "pointer-events-none opacity-35"),
        children: icon
    }, void 0, false, {
        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
_c = MiniRowButton;
function SimpleFormTwoRowTabbed({ title, badge, icon, fields, onFieldChange, labelScope = "container", tabs, defaultTabId, onTabRowsChange, onSaveRows, onFirst, onPrev, onNext, onLast, onReset, onSave, onSaveNew, onSaveClose, onCopy, onDelete, onDeleteNew, onDeleteClose, onPrint, onClose, onHelp, listItems, listLoading, onOpenListItem, canSave = true, canCopy = true, canDelete = true, canPrint = true, onHeaderClose, onHeaderMaximize, onHeaderMinimize, headerMaximized, onHeaderDragStart, onHeaderDragMove, onHeaderDragEnd, onHeaderDoubleClick, className }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    const tabsProp = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "SimpleFormTwoRowTabbed.useMemo[tabsProp]": ()=>tabs ?? []
    }["SimpleFormTwoRowTabbed.useMemo[tabsProp]"], [
        tabs
    ]);
    /* Task 25.1 — automatic label alignment for the field grid. Default scope
     "container": one shared label width ⇒ every input starts on the same
     edge within its cell AND the edges stack into straight vertical columns
     across rows (the owner's expectation). Pass labelScope="row" for
     per-row alignment. */ const fieldsGridRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$use$2d$aligned$2d$labels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAlignedLabels"])(fieldsGridRef, {
        scope: labelScope
    });
    /* detail-grid rows: initialized once per mount from the tabs prop */ const [rowsByTab, setRowsByTab] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "SimpleFormTwoRowTabbed.useState": ()=>Object.fromEntries(tabsProp.map({
                "SimpleFormTwoRowTabbed.useState": (tb)=>[
                        tb.id,
                        (tb.rows ?? []).map({
                            "SimpleFormTwoRowTabbed.useState": (r)=>({
                                    ...r
                                })
                        }["SimpleFormTwoRowTabbed.useState"])
                    ]
            }["SimpleFormTwoRowTabbed.useState"]))
    }["SimpleFormTwoRowTabbed.useState"]);
    const [activeTab, setActiveTab] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "SimpleFormTwoRowTabbed.useState": ()=>defaultTabId ?? tabsProp[0]?.id ?? ""
    }["SimpleFormTwoRowTabbed.useState"]);
    const [selected, setSelected] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const hasTabs = tabsProp.length > 0;
    const hasNav = Boolean(onFirst || onPrev || onNext || onLast);
    const commitRows = (tabId, rows)=>{
        setRowsByTab((prev)=>({
                ...prev,
                [tabId]: rows
            }));
        onTabRowsChange?.(tabId, rows);
    };
    const addRow = ()=>{
        const tb = tabsProp.find((x)=>x.id === activeTab);
        if (!tb) return;
        const rows = rowsByTab[activeTab] ?? [];
        const blank = Object.fromEntries(tb.columns.map((c)=>[
                c.id,
                ""
            ]));
        const next = [
            ...rows,
            blank
        ];
        commitRows(activeTab, next);
        setSelected({
            tabId: activeTab,
            index: next.length - 1
        });
    };
    const removeSelectedRow = ()=>{
        if (!selected || selected.tabId !== activeTab) return;
        const rows = [
            ...rowsByTab[activeTab] ?? []
        ];
        rows.splice(selected.index, 1);
        commitRows(activeTab, rows);
        setSelected(null);
    };
    const copySelectedRow = ()=>{
        if (!selected || selected.tabId !== activeTab) return;
        const rows = [
            ...rowsByTab[activeTab] ?? []
        ];
        const clone = {
            ...rows[selected.index]
        };
        rows.splice(selected.index + 1, 0, clone);
        commitRows(activeTab, rows);
        setSelected({
            tabId: activeTab,
            index: selected.index + 1
        });
    };
    const setCell = (tabId, rowIndex, colId, value)=>{
        const rows = [
            ...rowsByTab[tabId] ?? []
        ];
        if (!rows[rowIndex]) return;
        rows[rowIndex] = {
            ...rows[rowIndex],
            [colId]: value
        };
        commitRows(tabId, rows);
    };
    const selectedInActive = Boolean(selected && selected.tabId === activeTab);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "data-simple-form": true,
        "aria-label": title,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-full min-h-0 flex-col overflow-hidden bg-background/25", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white",
                onPointerDown: onHeaderDragStart,
                onPointerMove: onHeaderDragMove,
                onPointerUp: onHeaderDragEnd,
                onPointerCancel: onHeaderDragEnd,
                onDoubleClick: (e)=>{
                    if (e.target.closest("[data-window-btn]")) return;
                    onHeaderDoubleClick?.();
                },
                children: [
                    icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 334,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "truncate text-sm font-bold tracking-tight drop-shadow-sm",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 338,
                        columnNumber: 9
                    }, this),
                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25",
                        children: badge
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 340,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ms-auto flex items-center gap-0.5",
                        children: [
                            onHeaderMinimize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeaderButton"], {
                                onClick: onHeaderMinimize,
                                label: t("common.minimize"),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 347,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 346,
                                columnNumber: 13
                            }, this),
                            onHeaderMaximize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeaderButton"], {
                                onClick: onHeaderMaximize,
                                label: t("common.maximize"),
                                children: headerMaximized ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-3 w-3 -scale-x-100",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 353,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                    className: "h-3 w-3",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 355,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 351,
                                columnNumber: 13
                            }, this),
                            onHeaderClose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeaderButton"], {
                                onClick: onHeaderClose,
                                label: t("common.close"),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 361,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 360,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 344,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 322,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormActionBar"], {
                        className: "min-w-0 flex-1",
                        onReset: onReset,
                        onSave: onSave,
                        onSaveNew: onSaveNew,
                        onSaveClose: onSaveClose,
                        onCopy: onCopy,
                        onDelete: onDelete,
                        onDeleteNew: onDeleteNew,
                        onDeleteClose: onDeleteClose,
                        onPrint: onPrint,
                        onClose: onClose,
                        onHelp: onHelp,
                        listItems: listItems,
                        listLoading: listLoading,
                        onOpenListItem: onOpenListItem,
                        canSave: canSave,
                        canCopy: canCopy,
                        canDelete: canDelete,
                        canPrint: canPrint
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 374,
                        columnNumber: 9
                    }, this),
                    hasNav && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "group",
                        "aria-label": t("sft.first"),
                        className: "flex shrink-0 items-center gap-0.5 rounded-lg border bg-background/60 p-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$first$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronFirst$3e$__["ChevronFirst"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 406,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.first"),
                                onClick: onFirst
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 406,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 407,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.prev"),
                                onClick: onPrev
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 407,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 408,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.next"),
                                onClick: onNext
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 408,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$last$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLast$3e$__["ChevronLast"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 409,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.last"),
                                onClick: onLast
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 401,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 373,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-slim",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 px-4 pb-2 pt-2.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: fieldsGridRef,
                            className: "grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3",
                            children: fields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FieldCell"], {
                                    field: f,
                                    onChange: onFieldChange
                                }, f.id, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 430,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                            lineNumber: 425,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 424,
                        columnNumber: 9
                    }, this),
                    hasTabs && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-h-44 flex-1 flex-col border-t border-border/60 bg-muted/30 px-4 pt-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                            className: "flex min-h-0 flex-1 flex-col",
                            value: activeTab,
                            onValueChange: (v)=>{
                                setActiveTab(v);
                                setSelected(null);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsList"], {
                                    className: "h-8 w-auto shrink-0 justify-start rounded-lg bg-background/70 p-1",
                                    children: tabsProp.map((tb)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                            value: tb.id,
                                            "data-simple-form-tab": tb.id,
                                            className: "h-6 rounded-md px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                            children: tb.label
                                        }, tb.id, false, {
                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                            lineNumber: 447,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 445,
                                    columnNumber: 15
                                }, this),
                                tabsProp.map((tb)=>{
                                    const rows = rowsByTab[tb.id] ?? [];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                        value: tb.id,
                                        className: "mt-2 flex min-h-0 flex-1 flex-col",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            "data-simple-form-grid": tb.id,
                                            className: "min-h-0 flex-1 overflow-auto rounded-xl border bg-background/70 scrollbar-slim",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "w-full min-w-max border-separate border-spacing-0 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: tb.columns.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    scope: "col",
                                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("sticky top-0 z-10 border-b bg-muted/95 px-3 py-1.5 text-start font-semibold backdrop-blur", c.minWidth),
                                                                    children: [
                                                                        c.label,
                                                                        c.required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "ms-0.5 text-rose-500",
                                                                            "aria-hidden": true,
                                                                            children: "*"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                            lineNumber: 480,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, c.id, true, {
                                                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                    lineNumber: 470,
                                                                    columnNumber: 31
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                            lineNumber: 468,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                        lineNumber: 467,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: tb.columns.length,
                                                                className: "px-3 py-12 text-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-col items-center gap-2 text-muted-foreground",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"], {
                                                                            className: "h-7 w-7 opacity-50",
                                                                            "aria-hidden": true
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                            lineNumber: 493,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs",
                                                                            children: t("sft.noData")
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                            lineNumber: 494,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                    lineNumber: 492,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                lineNumber: 491,
                                                                columnNumber: 31
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                            lineNumber: 490,
                                                            columnNumber: 29
                                                        }, this) : rows.map((row, ri)=>{
                                                            const sel = selected?.tabId === tb.id && selected.index === ri;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                onClick: ()=>setSelected({
                                                                        tabId: tb.id,
                                                                        index: ri
                                                                    }),
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("cursor-pointer transition-colors", sel ? "bg-primary/10" : "hover:bg-foreground/5"),
                                                                children: tb.columns.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "border-b border-border/50 px-1.5 py-0.5",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            value: row[c.id] ?? "",
                                                                            onChange: (e)=>setCell(tb.id, ri, c.id, e.target.value),
                                                                            "aria-label": `${tb.label} — ${c.label} ${ri + 1}`,
                                                                            className: "h-5 w-full min-w-32 rounded-md border border-transparent bg-transparent px-2 text-xs outline-none transition-colors hover:border-border focus:border-ring focus:bg-background"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                            lineNumber: 512,
                                                                            columnNumber: 39
                                                                        }, this)
                                                                    }, c.id, false, {
                                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                        lineNumber: 511,
                                                                        columnNumber: 37
                                                                    }, this))
                                                            }, ri, false, {
                                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                lineNumber: 502,
                                                                columnNumber: 33
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                        lineNumber: 488,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                lineNumber: 466,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                            lineNumber: 462,
                                            columnNumber: 21
                                        }, this)
                                    }, tb.id, false, {
                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                        lineNumber: 461,
                                        columnNumber: 19
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                            lineNumber: 437,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 436,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 423,
                columnNumber: 7
            }, this),
            hasTabs && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "flex h-10 shrink-0 items-center gap-1 border-t border-border/60 bg-muted/40 px-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "me-auto flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 545,
                                    columnNumber: 21
                                }, this),
                                label: t("sft.addRow"),
                                tintClass: "text-amber-500 hover:bg-amber-500/15",
                                onClick: addRow
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 544,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 551,
                                    columnNumber: 21
                                }, this),
                                label: t("sft.removeRow"),
                                tintClass: "text-rose-500 hover:bg-rose-500/15",
                                onClick: removeSelectedRow,
                                disabled: !selectedInActive
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 550,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 558,
                                    columnNumber: 21
                                }, this),
                                label: t("sft.copyRows"),
                                tintClass: "text-teal-500 hover:bg-teal-500/15",
                                onClick: copySelectedRow,
                                disabled: !selectedInActive
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 557,
                                columnNumber: 13
                            }, this),
                            onSaveRows && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": true,
                                        className: "mx-1 h-5 w-px bg-border"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                        lineNumber: 566,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                            lineNumber: 568,
                                            columnNumber: 25
                                        }, this),
                                        label: t("common.save"),
                                        tintClass: "text-emerald-500 hover:bg-emerald-500/15",
                                        onClick: ()=>onSaveRows(activeTab, rowsByTab[activeTab] ?? [])
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                        lineNumber: 567,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 565,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 543,
                        columnNumber: 11
                    }, this),
                    hasNav && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-muted-foreground",
                        "aria-live": "polite"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 577,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 542,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
        lineNumber: 313,
        columnNumber: 5
    }, this);
}
_s(SimpleFormTwoRowTabbed, "qwkIZhvj2Af219dPYNRvX8/LrK8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$use$2d$aligned$2d$labels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAlignedLabels"]
    ];
});
_c1 = SimpleFormTwoRowTabbed;
var _c, _c1;
__turbopack_context__.k.register(_c, "MiniRowButton");
__turbopack_context__.k.register(_c1, "SimpleFormTwoRowTabbed");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/simple-tree-form.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SimpleTreeForm",
    ()=>SimpleTreeForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-client] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-client] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-client] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/action-bar/form-action-bar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$use$2d$aligned$2d$labels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/use-aligned-labels.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/form-primitives.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
/* ------------------------------------------------------------------ */ /* Internals                                                            */ /* ------------------------------------------------------------------ */ const GLYPH_CLASSES = {
    globe: "text-teal-600 dark:text-teal-400",
    flag: "text-rose-500 dark:text-rose-400",
    pin: "text-amber-500 dark:text-amber-400",
    folder: "text-emerald-600 dark:text-emerald-400",
    dot: "text-muted-foreground"
};
function NodeGlyph({ kind }) {
    const k = kind ?? "dot";
    const cls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-3.5 w-3.5 shrink-0", GLYPH_CLASSES[k]);
    switch(k){
        case "globe":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 156,
                columnNumber: 14
            }, this);
        case "flag":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 158,
                columnNumber: 14
            }, this);
        case "pin":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 160,
                columnNumber: 14
            }, this);
        case "folder":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 162,
                columnNumber: 14
            }, this);
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(cls, "h-2.5 w-2.5"),
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 164,
                columnNumber: 14
            }, this);
    }
}
_c = NodeGlyph;
function flatten(nodes, pick) {
    for (const n of nodes){
        if (pick(n)) return n;
        const hit = n.children ? flatten(n.children, pick) : null;
        if (hit) return hit;
    }
    return null;
}
function SimpleTreeForm({ treeTitle, nodes, defaultSelectedId = null, selectedId: selectedIdProp, onSelect, badge, icon, fields, onFieldChange, labelScope = "container", onReset, onSave, onSaveNew, onSaveClose, onCopy, onDelete, onDeleteNew, onDeleteClose, onPrint, onClose, onHelp, listItems, listLoading, onOpenListItem, canSave = true, canCopy = true, canDelete = true, canPrint = true, detailTitleOverride, emptyText, detailExtra, treeEmptyText, onAddBranch, canAddBranch, onDeleteBranch, canDeleteBranch, addBranchLabel, deleteBranchLabel, onHeaderClose, onHeaderMaximize, onHeaderMinimize, headerMaximized, onHeaderDragStart, onHeaderDragMove, onHeaderDragEnd, onHeaderDoubleClick, className }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    /* selection lives inside the component (master pane owns navigation);
     the caller mirrors it through onSelect to swap the `fields` prop */ const [selectedId, setSelectedId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](defaultSelectedId);
    const selected = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "SimpleTreeForm.useMemo[selected]": ()=>selectedId ? flatten(nodes, {
                "SimpleTreeForm.useMemo[selected]": (n)=>n.id === selectedId
            }["SimpleTreeForm.useMemo[selected]"]) : null
    }["SimpleTreeForm.useMemo[selected]"], [
        nodes,
        selectedId
    ]);
    /* Task 32 — controlled mirror: a caller that owns navigation state
     (BusinessStructure CRUD) drives selection across save/delete refetches;
     the Task-30 uncontrolled behavior is preserved when the prop is omitted.
     Derive-during-render (React-recommended "adjusting state on prop change"
     pattern) — no effect, no cascading render. */ const [renderedProp, setRenderedProp] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](selectedIdProp);
    if (selectedIdProp !== renderedProp) {
        setRenderedProp(selectedIdProp);
        setSelectedId(selectedIdProp ?? null);
    }
    /* every branch starts expanded (legacy look: the full path is visible) */ const [collapsed, setCollapsed] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "SimpleTreeForm.useState": ()=>new Set()
    }["SimpleTreeForm.useState"]);
    /* Task 33 — node context menu (right-click). Closes on OUTSIDE pointerdown
     / Escape / resize (FloatingMenu contract — closing on the item's own
     pointerdown would unmount it before its click event lands). */ const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [menuPos, setMenuPos] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        x: 0,
        y: 0
    });
    const menuRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const closeMenu = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "SimpleTreeForm.useCallback[closeMenu]": ()=>setMenu(null)
    }["SimpleTreeForm.useCallback[closeMenu]"], []);
    /* keep the flyout inside the viewport (measured, like FloatingMenu) */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"]({
        "SimpleTreeForm.useLayoutEffect": ()=>{
            const el = menuRef.current;
            if (!el || !menu) return;
            const r = el.getBoundingClientRect();
            setMenuPos({
                x: Math.max(8, Math.min(menu.x, window.innerWidth - r.width - 8)),
                y: Math.max(8, Math.min(menu.y, window.innerHeight - r.height - 8))
            });
        }
    }["SimpleTreeForm.useLayoutEffect"], [
        menu
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "SimpleTreeForm.useEffect": ()=>{
            if (!menu) return;
            const onDown = {
                "SimpleTreeForm.useEffect.onDown": (e)=>{
                    if (!menuRef.current?.contains(e.target)) closeMenu();
                }
            }["SimpleTreeForm.useEffect.onDown"];
            const onKey = {
                "SimpleTreeForm.useEffect.onKey": (e)=>{
                    if (e.key === "Escape") closeMenu();
                }
            }["SimpleTreeForm.useEffect.onKey"];
            window.addEventListener("pointerdown", onDown, true);
            window.addEventListener("keydown", onKey);
            window.addEventListener("resize", closeMenu);
            return ({
                "SimpleTreeForm.useEffect": ()=>{
                    window.removeEventListener("pointerdown", onDown, true);
                    window.removeEventListener("keydown", onKey);
                    window.removeEventListener("resize", closeMenu);
                }
            })["SimpleTreeForm.useEffect"];
        }
    }["SimpleTreeForm.useEffect"], [
        menu,
        closeMenu
    ]);
    /* per-node visibility of the flyout items (also guards empty bubbles) */ const menuAddable = menu !== null && onAddBranch !== undefined && (canAddBranch?.(menu.node) ?? true);
    const menuDeletable = menu !== null && onDeleteBranch !== undefined && (canDeleteBranch?.(menu.node) ?? true);
    const select = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "SimpleTreeForm.useCallback[select]": (node)=>{
            setSelectedId(node.id);
            onSelect?.(node);
        }
    }["SimpleTreeForm.useCallback[select]"], [
        onSelect
    ]);
    const toggleBranch = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "SimpleTreeForm.useCallback[toggleBranch]": (id)=>{
            setCollapsed({
                "SimpleTreeForm.useCallback[toggleBranch]": (prev)=>{
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                }
            }["SimpleTreeForm.useCallback[toggleBranch]"]);
        }
    }["SimpleTreeForm.useCallback[toggleBranch]"], []);
    /* Task 25.1 — aligned label widths for the detail field grid */ const fieldsGridRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$use$2d$aligned$2d$labels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAlignedLabels"])(fieldsGridRef, {
        scope: labelScope
    });
    const renderNodes = (list, depth)=>list.map((node)=>{
            const hasKids = Boolean(node.children?.length);
            const open = hasKids && !collapsed.has(node.id);
            const isSelected = node.id === selectedId;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "treeitem",
                        "aria-selected": isSelected,
                        "aria-expanded": hasKids ? open : undefined,
                        "aria-level": depth + 1,
                        "data-tree-node": node.id,
                        tabIndex: 0,
                        onClick: ()=>select(node),
                        onContextMenu: (e)=>{
                            /* Task 33 — right-click opens the node flyout. With NO handlers
                 wired the Task-30 native behavior is left untouched; with
                 handlers but no applicable item the native menu is suppressed
                 without an empty bubble. Right-click selects the row first
                 (Windows-Explorer/legacy TreeForm behavior). */ if (!onAddBranch && !onDeleteBranch) return;
                            e.preventDefault();
                            const offers = onAddBranch && (canAddBranch?.(node) ?? true) || onDeleteBranch && (canDeleteBranch?.(node) ?? true);
                            if (!offers) return;
                            select(node);
                            setMenu({
                                x: e.clientX,
                                y: e.clientY,
                                node
                            });
                        },
                        onKeyDown: (e)=>{
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                select(node);
                            }
                        },
                        style: {
                            paddingInlineStart: `${depth * 14 + 6}px`
                        },
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("group flex cursor-pointer items-center gap-1.5 rounded-lg py-1 pe-2 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring", isSelected ? "bg-primary/15 font-semibold text-primary ring-1 ring-primary/30" : "text-foreground/85 hover:bg-foreground/5"),
                        children: [
                            /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidElement"](node.icon) ? node.icon : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NodeGlyph, {
                                kind: node.icon
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 384,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "min-w-0 truncate",
                                children: node.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 386,
                                columnNumber: 13
                            }, this),
                            hasKids && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": node.label,
                                "aria-expanded": open,
                                title: node.label,
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    toggleBranch(node.id);
                                },
                                className: "ms-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-3.5 w-3.5 transition-transform", !open && "ltr:-rotate-90 rtl:rotate-90"),
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 399,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 388,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 344,
                        columnNumber: 11
                    }, this),
                    open && node.children && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "group",
                        className: "min-w-0",
                        children: renderNodes(node.children, depth + 1)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 410,
                        columnNumber: 13
                    }, this)
                ]
            }, node.id, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 343,
                columnNumber: 9
            }, this);
        });
    const detailTitle = detailTitleOverride ?? (selected ? `${t("stf.details")}: ${selected.label}` : t("stf.details"));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "data-simple-tree-form": true,
        "aria-label": treeTitle,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-full min-h-0 flex-col overflow-hidden bg-background/25 sm:flex-row", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-44 min-h-0 shrink-0 flex-col border-b border-border/60 bg-background/40 sm:h-auto sm:w-72 sm:border-b-0 sm:border-e lg:w-80",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-11 shrink-0 select-none items-center gap-2 border-b border-border/60 bg-muted/40 px-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "truncate text-sm font-bold tracking-tight",
                            children: treeTitle
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 431,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 430,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "tree",
                        "aria-label": treeTitle,
                        className: "min-h-0 flex-1 overflow-y-auto p-2 scrollbar-slim",
                        children: [
                            renderNodes(nodes, 0),
                            nodes.length === 0 && treeEmptyText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "px-3 py-6 text-center text-xs text-muted-foreground",
                                children: treeEmptyText
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 440,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 433,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 429,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-h-0 min-w-0 flex-1 flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white",
                        onPointerDown: onHeaderDragStart,
                        onPointerMove: onHeaderDragMove,
                        onPointerUp: onHeaderDragEnd,
                        onPointerCancel: onHeaderDragEnd,
                        onDoubleClick: (e)=>{
                            if (e.target.closest("[data-window-btn]")) return;
                            onHeaderDoubleClick?.();
                        },
                        children: [
                            icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 shadow-inner",
                                children: icon
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 462,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "truncate text-sm font-bold tracking-tight drop-shadow-sm",
                                children: detailTitle
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 466,
                                columnNumber: 11
                            }, this),
                            badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25",
                                children: badge
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 468,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ms-auto flex items-center gap-0.5",
                                children: [
                                    onHeaderMinimize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeaderButton"], {
                                        onClick: onHeaderMinimize,
                                        label: t("common.minimize"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                            className: "h-4 w-4",
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 475,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                        lineNumber: 474,
                                        columnNumber: 15
                                    }, this),
                                    onHeaderMaximize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeaderButton"], {
                                        onClick: onHeaderMaximize,
                                        label: t("common.maximize"),
                                        children: headerMaximized ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                            className: "h-3 w-3 -scale-x-100",
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 481,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                            className: "h-3 w-3",
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 483,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                        lineNumber: 479,
                                        columnNumber: 15
                                    }, this),
                                    onHeaderClose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeaderButton"], {
                                        onClick: onHeaderClose,
                                        label: t("common.close"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "h-4 w-4",
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 489,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                        lineNumber: 488,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 472,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": true,
                                className: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25"
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 493,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 450,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$form$2d$action$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormActionBar"], {
                            className: "min-w-0 flex-1",
                            onReset: onReset,
                            onSave: onSave,
                            onSaveNew: onSaveNew,
                            onSaveClose: onSaveClose,
                            onCopy: onCopy,
                            onDelete: onDelete,
                            onDeleteNew: onDeleteNew,
                            onDeleteClose: onDeleteClose,
                            onPrint: onPrint,
                            onClose: onClose,
                            onHelp: onHelp,
                            listItems: listItems,
                            listLoading: listLoading,
                            onOpenListItem: onOpenListItem,
                            canSave: canSave,
                            canCopy: canCopy,
                            canDelete: canDelete,
                            canPrint: canPrint
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 501,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 500,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-h-0 flex-1 overflow-y-auto scrollbar-slim",
                        children: selected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 pb-2 pt-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: fieldsGridRef,
                                    className: "grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3",
                                    children: fields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FieldCell"], {
                                            field: f,
                                            onChange: onFieldChange,
                                            idPrefix: "stf"
                                        }, f.id, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 533,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 528,
                                    columnNumber: 15
                                }, this),
                                detailExtra
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 527,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex h-full flex-col items-center justify-center gap-2 text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"], {
                                    className: "h-7 w-7 opacity-50",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 540,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs",
                                    children: emptyText ?? t("sft.noData")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 541,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 539,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 525,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 447,
                columnNumber: 7
            }, this),
            menu && (menuAddable || menuDeletable) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: menuRef,
                role: "menu",
                "aria-label": treeTitle,
                className: "acrylic-strong menu-in fixed z-[13000] min-w-40 rounded-xl border p-1 shadow-lg win-shadow",
                style: {
                    left: menuPos.x,
                    top: menuPos.y
                },
                onContextMenu: (e)=>e.preventDefault(),
                children: [
                    menuAddable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        role: "menuitem",
                        className: "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        onClick: ()=>{
                            onAddBranch?.(menu.node);
                            closeMenu();
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                className: "h-3.5 w-3.5 shrink-0 text-primary",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 571,
                                columnNumber: 17
                            }, this),
                            addBranchLabel ?? t("bs.addNode")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 562,
                        columnNumber: 15
                    }, this),
                    menuDeletable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        role: "menuitem",
                        className: "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        onClick: ()=>{
                            onDeleteBranch?.(menu.node);
                            closeMenu();
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                className: "h-3.5 w-3.5 shrink-0",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 585,
                                columnNumber: 17
                            }, this),
                            deleteBranchLabel ?? t("bs.deleteBranch")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 576,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 553,
                columnNumber: 11
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
        lineNumber: 423,
        columnNumber: 5
    }, this);
}
_s(SimpleTreeForm, "nrI9vUEaBI6Od/bRC2IuvLdIMpc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$use$2d$aligned$2d$labels$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAlignedLabels"]
    ];
});
_c1 = SimpleTreeForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "NodeGlyph");
__turbopack_context__.k.register(_c1, "SimpleTreeForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/use-aligned-labels.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAlignedLabels",
    ()=>useAlignedLabels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
/** layout effect on the client, effect during SSR (no server warning) */ const useIsomorphicLayoutEffect = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"] : "TURBOPACK unreachable";
function useAlignedLabels(containerRef, options = {}) {
    _s();
    const scope = options.scope ?? "row";
    const selector = options.selector ?? "[data-form-label-text]";
    const cellSelector = options.cellSelector ?? "[data-form-cell]";
    useIsomorphicLayoutEffect({
        "useAlignedLabels.useIsomorphicLayoutEffect": ()=>{
            const root = containerRef.current;
            if (!root || typeof ResizeObserver === "undefined") return;
            const observed = new WeakSet();
            const update = {
                "useAlignedLabels.useIsomorphicLayoutEffect.update": ()=>{
                    const labels = Array.from(root.querySelectorAll(selector));
                    if (labels.length === 0) return;
                    /* watch labels that appeared after mount (dynamic field sets) */ for (const el of labels){
                        if (!observed.has(el)) {
                            observed.add(el);
                            ro.observe(el);
                        }
                    }
                    if (scope === "container") {
                        let max = 0;
                        for (const el of labels)max = Math.max(max, el.offsetWidth);
                        if (max > 0) root.style.setProperty("--label-w", `${max}px`);
                        return;
                    }
                    /* «row» scope — group labels by their visual row (shared top edge) */ const rows = new Map();
                    for (const el of labels){
                        const key = Math.round(el.getBoundingClientRect().top);
                        const bucket = rows.get(key);
                        if (bucket) bucket.push(el);
                        else rows.set(key, [
                            el
                        ]);
                    }
                    for (const bucket of rows.values()){
                        let max = 0;
                        for (const el of bucket)max = Math.max(max, el.offsetWidth);
                        if (max <= 0) continue;
                        for (const el of bucket){
                            const host = el.closest(cellSelector) ?? root;
                            host.style.setProperty("--label-w", `${max}px`);
                        }
                    }
                }
            }["useAlignedLabels.useIsomorphicLayoutEffect.update"];
            const ro = new ResizeObserver({
                "useAlignedLabels.useIsomorphicLayoutEffect": ()=>update()
            }["useAlignedLabels.useIsomorphicLayoutEffect"]);
            const mo = new MutationObserver({
                "useAlignedLabels.useIsomorphicLayoutEffect": ()=>update()
            }["useAlignedLabels.useIsomorphicLayoutEffect"]);
            update();
            ro.observe(root);
            mo.observe(root, {
                childList: true,
                subtree: true
            });
            return ({
                "useAlignedLabels.useIsomorphicLayoutEffect": ()=>{
                    ro.disconnect();
                    mo.disconnect();
                }
            })["useAlignedLabels.useIsomorphicLayoutEffect"];
        }
    }["useAlignedLabels.useIsomorphicLayoutEffect"], [
        containerRef,
        scope,
        selector,
        cellSelector
    ]);
}
_s(useAlignedLabels, "Vd+jpwighRca2oU8HoLqd+zm4Bo=", false, function() {
    return [
        useIsomorphicLayoutEffect
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground",
            secondary: "border-transparent bg-secondary text-secondary-foreground",
            destructive: "border-transparent bg-destructive text-destructive-foreground",
            outline: "text-foreground",
            success: "border-transparent bg-success/15 text-success",
            muted: "border-transparent bg-muted text-muted-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge({ className, variant, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/badge.tsx",
        lineNumber: 27,
        columnNumber: 10
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            outline: "border border-input bg-card/60 shadow-sm hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-6",
            icon: "h-9 w-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 43,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/checkbox.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Checkbox",
    ()=>Checkbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-checkbox/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const Checkbox = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("peer h-4 w-4 shrink-0 rounded-[4px] border border-primary shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground cursor-pointer", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: "flex items-center justify-center text-current",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                className: "h-3 w-3",
                strokeWidth: 3
            }, void 0, false, {
                fileName: "[project]/src/components/ui/checkbox.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/ui/checkbox.tsx",
            lineNumber: 20,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/checkbox.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Checkbox;
Checkbox.displayName = "Checkbox";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Checkbox$React.forwardRef");
__turbopack_context__.k.register(_c1, "Checkbox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const Dialog = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const DialogTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const DialogPortal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"];
const DialogClose = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"];
const DialogOverlay = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-[11000] bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in fade-in", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c = DialogOverlay;
DialogOverlay.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"].displayName;
const DialogContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c1 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/ui/dialog.tsx",
                lineNumber: 33,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic-strong fixed left-1/2 top-1/2 z-[11500] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border p-6 shadow-lg win-shadow window-in", className),
                ...props,
                children: [
                    children,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        className: "absolute end-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/dialog.tsx",
                                lineNumber: 44,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/dialog.tsx",
                                lineNumber: 45,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/dialog.tsx",
                        lineNumber: 43,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/dialog.tsx",
                lineNumber: 34,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 32,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c2 = DialogContent;
DialogContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const DialogHeader = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-1.5 text-center sm:text-start", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 53,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = DialogHeader;
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 58,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = DialogFooter;
DialogFooter.displayName = "DialogFooter";
const DialogTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c5 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 69,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c6 = DialogTitle;
DialogTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const DialogDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c7 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 81,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c8 = DialogDescription;
DialogDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "DialogOverlay");
__turbopack_context__.k.register(_c1, "DialogContent$React.forwardRef");
__turbopack_context__.k.register(_c2, "DialogContent");
__turbopack_context__.k.register(_c3, "DialogHeader");
__turbopack_context__.k.register(_c4, "DialogFooter");
__turbopack_context__.k.register(_c5, "DialogTitle$React.forwardRef");
__turbopack_context__.k.register(_c6, "DialogTitle");
__turbopack_context__.k.register(_c7, "DialogDescription$React.forwardRef");
__turbopack_context__.k.register(_c8, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DropdownMenu",
    ()=>DropdownMenu,
    "DropdownMenuCheckboxItem",
    ()=>DropdownMenuCheckboxItem,
    "DropdownMenuContent",
    ()=>DropdownMenuContent,
    "DropdownMenuGroup",
    ()=>DropdownMenuGroup,
    "DropdownMenuItem",
    ()=>DropdownMenuItem,
    "DropdownMenuLabel",
    ()=>DropdownMenuLabel,
    "DropdownMenuPortal",
    ()=>DropdownMenuPortal,
    "DropdownMenuRadioGroup",
    ()=>DropdownMenuRadioGroup,
    "DropdownMenuRadioItem",
    ()=>DropdownMenuRadioItem,
    "DropdownMenuSeparator",
    ()=>DropdownMenuSeparator,
    "DropdownMenuShortcut",
    ()=>DropdownMenuShortcut,
    "DropdownMenuSub",
    ()=>DropdownMenuSub,
    "DropdownMenuSubContent",
    ()=>DropdownMenuSubContent,
    "DropdownMenuSubTrigger",
    ()=>DropdownMenuSubTrigger,
    "DropdownMenuTrigger",
    ()=>DropdownMenuTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-client] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const DropdownMenu = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const DropdownMenuTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const DropdownMenuGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"];
const DropdownMenuPortal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"];
const DropdownMenuSub = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sub"];
const DropdownMenuRadioGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioGroup"];
const DropdownMenuSubTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, inset, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubTrigger"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-pointer select-none items-center rounded-md gap-2 px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent", inset && "ps-8", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                className: "ms-auto h-4 w-4 rtl:rotate-180"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                lineNumber: 29,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 19,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = DropdownMenuSubTrigger;
DropdownMenuSubTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubTrigger"].displayName;
const DropdownMenuSubContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubContent"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic-strong z-[12500] min-w-[8rem] overflow-hidden rounded-lg border p-1 shadow-lg win-shadow fade-in", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 38,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = DropdownMenuSubContent;
DropdownMenuSubContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubContent"].displayName;
const DropdownMenuContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            ref: ref,
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic-strong z-[12500] min-w-[8rem] overflow-hidden rounded-lg border p-1 shadow-md win-shadow fade-in", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/dropdown-menu.tsx",
            lineNumber: 54,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 53,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = DropdownMenuContent;
DropdownMenuContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const DropdownMenuItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, inset, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", inset && "ps-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 71,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = DropdownMenuItem;
DropdownMenuItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"].displayName;
const DropdownMenuCheckboxItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, children, checked, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckboxItem"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex cursor-pointer select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground", className),
        checked: checked,
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute start-2 flex h-3.5 w-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                    lineNumber: 97,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                lineNumber: 96,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 87,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = DropdownMenuCheckboxItem;
DropdownMenuCheckboxItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckboxItem"].displayName;
const DropdownMenuRadioItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioItem"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex cursor-pointer select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute start-2 flex h-3.5 w-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                        className: "h-2 w-2 fill-current"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                    lineNumber: 119,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                lineNumber: 118,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 110,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = DropdownMenuRadioItem;
DropdownMenuRadioItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioItem"].displayName;
const DropdownMenuLabel = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c12 = ({ className, inset, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1.5 text-sm font-semibold", inset && "ps-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 132,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c13 = DropdownMenuLabel;
DropdownMenuLabel.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"].displayName;
const DropdownMenuSeparator = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c14 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("-mx-1 my-1 h-px bg-border", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 144,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c15 = DropdownMenuSeparator;
DropdownMenuSeparator.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"].displayName;
const DropdownMenuShortcut = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("ms-auto text-xs tracking-widest opacity-60", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 153,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c16 = DropdownMenuShortcut;
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16;
__turbopack_context__.k.register(_c, "DropdownMenuSubTrigger$React.forwardRef");
__turbopack_context__.k.register(_c1, "DropdownMenuSubTrigger");
__turbopack_context__.k.register(_c2, "DropdownMenuSubContent$React.forwardRef");
__turbopack_context__.k.register(_c3, "DropdownMenuSubContent");
__turbopack_context__.k.register(_c4, "DropdownMenuContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "DropdownMenuContent");
__turbopack_context__.k.register(_c6, "DropdownMenuItem$React.forwardRef");
__turbopack_context__.k.register(_c7, "DropdownMenuItem");
__turbopack_context__.k.register(_c8, "DropdownMenuCheckboxItem$React.forwardRef");
__turbopack_context__.k.register(_c9, "DropdownMenuCheckboxItem");
__turbopack_context__.k.register(_c10, "DropdownMenuRadioItem$React.forwardRef");
__turbopack_context__.k.register(_c11, "DropdownMenuRadioItem");
__turbopack_context__.k.register(_c12, "DropdownMenuLabel$React.forwardRef");
__turbopack_context__.k.register(_c13, "DropdownMenuLabel");
__turbopack_context__.k.register(_c14, "DropdownMenuSeparator$React.forwardRef");
__turbopack_context__.k.register(_c15, "DropdownMenuSeparator");
__turbopack_context__.k.register(_c16, "DropdownMenuShortcut");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, type, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-9 w-full rounded-md border border-input bg-card/70 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/input.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/label.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Label;
Label.displayName = "Label";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-select/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const Select = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const SelectGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"];
const SelectValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Value"];
const SelectTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card/70 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                    className: "h-4 w-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 26,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/select.tsx",
                lineNumber: 25,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = SelectTrigger;
SelectTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"].displayName;
const SelectScrollUpButton = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/select.tsx",
            lineNumber: 41,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 36,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c2 = SelectScrollUpButton;
SelectScrollUpButton.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"].displayName;
const SelectScrollDownButton = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/select.tsx",
            lineNumber: 55,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 50,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = SelectScrollDownButton;
SelectScrollDownButton.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"].displayName;
const SelectContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, children, position = "popper", ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic-strong relative z-[12000] max-h-96 min-w-[8rem] overflow-hidden rounded-lg border shadow-md win-shadow data-[state=open]:animate-in fade-in", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1", className),
            position: position,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {}, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 76,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 77,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {}, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 86,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ui/select.tsx",
            lineNumber: 65,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 64,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = SelectContent;
SelectContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const SelectLabel = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1.5 text-sm font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 96,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = SelectLabel;
SelectLabel.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"].displayName;
const SelectItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pe-8 ps-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute end-2 flex h-3.5 w-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/select.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 117,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/select.tsx",
                lineNumber: 116,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemText"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/select.tsx",
                lineNumber: 121,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 108,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = SelectItem;
SelectItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "SelectTrigger$React.forwardRef");
__turbopack_context__.k.register(_c1, "SelectTrigger");
__turbopack_context__.k.register(_c2, "SelectScrollUpButton");
__turbopack_context__.k.register(_c3, "SelectScrollDownButton");
__turbopack_context__.k.register(_c4, "SelectContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "SelectContent");
__turbopack_context__.k.register(_c6, "SelectLabel$React.forwardRef");
__turbopack_context__.k.register(_c7, "SelectLabel");
__turbopack_context__.k.register(_c8, "SelectItem$React.forwardRef");
__turbopack_context__.k.register(_c9, "SelectItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/separator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Separator",
    ()=>Separator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-separator/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Separator = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, orientation = "horizontal", decorative = true, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        decorative: decorative,
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/separator.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Separator;
Separator.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$separator$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Separator$React.forwardRef");
__turbopack_context__.k.register(_c1, "Separator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/switch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Switch",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-switch/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Switch = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
        ...props,
        ref: ref,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("pointer-events-none block h-4 w-4 rounded-full bg-card shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")
        }, void 0, false, {
            fileName: "[project]/src/components/ui/switch.tsx",
            lineNumber: 19,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/switch.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Switch;
Switch.displayName = "Switch";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Switch$React.forwardRef");
__turbopack_context__.k.register(_c1, "Switch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/tabs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs,
    "TabsContent",
    ()=>TabsContent,
    "TabsList",
    ()=>TabsList,
    "TabsTrigger",
    ()=>TabsTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-tabs/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Tabs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const TabsList = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 13,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = TabsList;
TabsList.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"].displayName;
const TabsTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow cursor-pointer", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 28,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = TabsTrigger;
TabsTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"].displayName;
const TabsContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 43,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = TabsContent;
TabsContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "TabsList$React.forwardRef");
__turbopack_context__.k.register(_c1, "TabsList");
__turbopack_context__.k.register(_c2, "TabsTrigger$React.forwardRef");
__turbopack_context__.k.register(_c3, "TabsTrigger");
__turbopack_context__.k.register(_c4, "TabsContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "TabsContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tooltip",
    ()=>Tooltip,
    "TooltipContent",
    ()=>TooltipContent,
    "TooltipProvider",
    ()=>TooltipProvider,
    "TooltipTrigger",
    ()=>TooltipTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-tooltip/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const TooltipProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"];
const Tooltip = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const TooltipTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const TooltipContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            ref: ref,
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("acrylic-strong z-[12500] overflow-hidden rounded-md border px-3 py-1.5 text-xs shadow-md win-shadow fade-in", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/tooltip.tsx",
            lineNumber: 16,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tooltip.tsx",
        lineNumber: 15,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = TooltipContent;
TooltipContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "TooltipContent$React.forwardRef");
__turbopack_context__.k.register(_c1, "TooltipContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/i18n/config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_LOCALE",
    ()=>DEFAULT_LOCALE,
    "DIR_BY_LOCALE",
    ()=>DIR_BY_LOCALE,
    "LOCALES",
    ()=>LOCALES,
    "LOCALE_NAMES",
    ()=>LOCALE_NAMES,
    "dirOf",
    ()=>dirOf
]);
const LOCALES = [
    "fa",
    "en",
    "tr",
    "ar",
    "hi",
    "ps",
    "ckb",
    "pt",
    "ko",
    "fr",
    "zh"
];
const DEFAULT_LOCALE = "fa";
const DIR_BY_LOCALE = {
    fa: "rtl",
    ar: "rtl",
    ps: "rtl",
    ckb: "rtl",
    en: "ltr",
    tr: "ltr",
    hi: "ltr",
    pt: "ltr",
    ko: "ltr",
    fr: "ltr",
    zh: "ltr"
};
const LOCALE_NAMES = {
    fa: "فارسی",
    en: "English",
    tr: "Türkçe",
    ar: "العربية",
    hi: "हिन्दी",
    ps: "پښتو",
    ckb: "کوردی",
    pt: "Português",
    ko: "한국어",
    fr: "Français",
    zh: "中文"
};
function dirOf(locale) {
    return DIR_BY_LOCALE[locale] ?? "ltr";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/i18n/dictionaries.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDict",
    ()=>getDict
]);
/**
 * §1.3 — All 11 locales must stay perfectly in sync (same key set).
 * fa is the source of truth; TypeScript enforces the shape.
 */ const fa = {
    "common.loading": "در حال بارگذاری…",
    "common.retry": "تلاش مجدد",
    "common.close": "بستن",
    "common.minimize": "کوچک‌نمایی",
    "common.maximize": "بزرگ‌نمایی",
    "common.cancel": "انصراف",
    "common.save": "ذخیره",
    "common.delete": "حذف",
    "common.confirm": "تأیید",
    "common.all": "همه",
    "common.search": "جست‌وجو",
    "common.language": "زبان",
    "common.theme": "پوسته",
    "common.description": "توضیحات",
    "common.error": "خطا",
    "app.name": "سامانهٔ جامع بازرگانی",
    "app.shortName": "بازرگانی",
    "taskbar.search": "جست‌وجوی برنامه‌ها و تنظیمات",
    "header.dashboard": "داشبورد",
    "header.search": "جست‌وجو در داشبورد…",
    "header.dragHint": "برای جابه‌جایی هدر، آن را بکشید",
    "header.dockTop": "استقرار در بالای صفحه",
    "header.dockLeft": "استقرار در سمت چپ",
    "header.dockRight": "استقرار در سمت راست",
    "header.dropHint": "رها کنید تا هدر اینجا مستقر شود",
    "startmenu.pinned": "برنامه‌های سنجاق‌شده",
    "startmenu.recommended": "پیشنهاد شده",
    "startmenu.searchPlaceholder": "برای جست‌وجو تایپ کنید…",
    "menus.general": "تنظیمات و عمومی",
    "menus.structural": "تنظیمات ساختاری",
    "menus.businessStructure": "ساختار کسب و کار",
    "bs.title": "ساختار کسب و کار",
    "bs.subtitle": "مدیریت درخت ساختار سازمانی، شعب و نمایندگی‌ها",
    "bs.treeTitle": "درخت ساختار",
    "bs.searchPlaceholder": "جست‌وجو در ساختار…",
    "bs.newSubtree": "زیرشاخهٔ جدید",
    "bs.deleteBranch": "حذف شاخه",
    "bs.emptyTree": "هیچ ساختاری ثبت نشده است",
    "bs.loadingTree": "بارگذاری ساختار…",
    "bs.selectNode": "برای مشاهدهٔ جزئیات، یک شاخه را انتخاب کنید",
    "bs.addNode": "افزودن زیرشاخه",
    "bs.addDisabledMax": "حداکثر عمق ساختار (۴ سطح) تکمیل است",
    "bs.mainTab": "تب اصلی",
    "bs.usersTab": "کاربران مجاز",
    "bs.users.comingSoon": "اتصال کاربران در فاز IAM فعال می‌شود",
    "bs.field.code": "کد",
    "bs.field.title": "عنوان",
    "bs.field.titleEn": "عنوان لاتین",
    "bs.field.type": "نوع",
    "bs.field.manager": "مدیر",
    "bs.field.logo": "لوگو",
    "bs.field.isActive": "وضعیت فعال",
    "bs.field.isBasicInfoShared": "اشتراک اطلاعات پایه",
    "bs.field.shareHeadquarterData": "استفاده از داده‌های مشترک دفتر مرکزی",
    "bs.field.activeStructureTypes": "ساختارهای مجاز این کسب‌وکار",
    "bs.field.parent": "والد",
    "bs.type.1": "هولدینگ",
    "bs.type.2": "شرکت",
    "bs.type.3": "شعبه",
    "bs.type.4": "نمایندگی",
    "bs.type.5": "فروشگاه",
    "bs.type.hq": "دفتر مرکزی",
    "bs.action.save": "ذخیره",
    "bs.action.saveNew": "ذخیره و جدید",
    "bs.action.saveClose": "ذخیره و بستن",
    "bs.action.new": "جدید",
    "bs.action.delete": "حذف",
    "bs.msg.saved": "با موفقیت ذخیره شد",
    "bs.msg.deleted": "شاخه حذف شد",
    "bs.msg.deleteBlockedChildren": "این شاخه دارای زیرشاخه است و حذف نمی‌شود",
    "bs.msg.deleteBlockedRoot": "دفتر مرکزی قابل حذف نیست",
    "bs.msg.deleteBlockedSystem": "رکورد سیستمی قابل حذف نیست",
    "bs.msg.deleteConfirm": "آیا از حذف این شاخه مطمئن هستید؟",
    "bs.msg.loadError": "خطا در دریافت ساختار",
    "bs.msg.saveError": "خطا در ذخیره‌سازی",
    "bs.val.titleRequired": "عنوان الزامی است",
    "bs.val.titleEnRequired": "عنوان لاتین (انگلیسی) الزامی است",
    "bs.val.typeRequired": "انتخاب نوع الزامی است",
    "bs.hint.codeAuto": "کد به‌صورت خودکار تولید می‌شود",
    "bs.hint.latinTitle": "عنوان معادل به لاتین وارد کنید",
    "bs.root.unionWarning": "در نهایت، اجتماع (Union) ساختارهای تعریف‌شدهٔ سیستم و انتخاب شما اعمال می‌شود",
    "settings.title": "تنظیمات",
    "settings.subtitle": "شخصی‌سازی سامانه",
    "settings.appearance": "ظاهر",
    "settings.light": "روشن",
    "settings.dark": "تیره",
    "settings.back": "بازگشت",
    "settings.bsDesc": "مدیریت سطوح هلدینگ، شرکت، شعبه، نمایندگی و فروشگاه",
    "settings.umDesc": "مدیریت کاربران، نقش‌ها و سطوح دسترسی سامانه",
    "settings.umPending": "این بخش از چندین فرم تشکیل شده است؛ سند تحلیل آن ارائه خواهد شد و فرم‌ها پس از آن پیاده‌سازی می‌شوند.",
    "sidebar.title": "همهٔ آیتم‌ها",
    "sidebar.toSidebar": "نمایش به‌صورت منوی کناری",
    "sidebar.toGrid": "نمایش آیکون‌ها روی دسکتاپ",
    "sidebar.collapse": "جمع کردن منو",
    "sidebar.expand": "باز کردن منو",
    "app.settings": "تنظیمات",
    "app.accounting": "حسابداری",
    "app.receiptsPayment": "دریافت و پرداخت",
    "app.inventory": "انبار",
    "app.sales": "فروش",
    "app.fixedAssets": "دارایی ثابت",
    "app.procurement": "تدارکات",
    "app.foreignOrders": "سفارشات خارجی",
    "app.costing": "بهای تمام شده",
    "app.materialDelivery": "کنترل تحویل مواد",
    "app.productionPlanning": "برنامه ریزی تولید",
    "app.payroll": "حقوق و دستمزد",
    "app.hr": "منابع انسانی",
    "app.officeAutomation": "اتوماسیون اداری",
    "app.crm": "مدیریت ارتباط با مشتریان",
    "app.advancedTools": "ابزارهای پیشرفته",
    "app.userManagement": "مدیریت کاربران",
    "app.workflow": "گردش کار",
    "app.smsCenter": "پیامک رسان",
    "app.retailSales": "فروش فروشگاهی",
    "app.marketingSales": "بازاریابی و فروش",
    "app.coldDistribution": "پخش سرد",
    "app.hotDistribution": "پخش گرم",
    "app.financialStatements": "صورت های مالی",
    "app.businessIntelligence": "هوش تجاری",
    "app.maintenance": "تعمیرات و نگهداری",
    "app.onlineWebsite": "وبسایت آنلاین",
    "app.general": "عمومی",
    "ph.awaitingBadge": "در انتظار سند تحلیل",
    "ph.awaitingBody": "فرم‌ها و فیلدهای این نرم‌افزار هنوز تعریف نشده‌اند؛ پس از ارائهٔ سند تحلیل، طراحی و پیاده‌سازی دقیقاً بر اساس همان سند انجام می‌شود.",
    "ph.secureApi": "اتصال امن سرویس‌ها",
    "ph.infraStatus": "وضعیت زیرساخت",
    "ph.portLabel": "پورت سرویس",
    "ph.dbShared": "پایگاه‌دادهٔ اشتراکی",
    "ph.dbDedicated": "پایگاه‌دادهٔ مجزا",
    "ph.linkOk": "متصل (امضاشده)",
    "ph.linkFail": "قطع موقت",
    "ph.checking": "در حال بررسی اتصال امن…",
    "ctx.open": "باز کردن",
    "ctx.pinTaskbar": "سنجاق به نوار پایین",
    "ctx.unpinTaskbar": "برداشتن از نوار پایین",
    "ctx.resetLayout": "بازنشانی چیدمان میزکار",
    "taskbar.dropHint": "رها کنید تا به نوار پایین سنجاق شود",
    "taskbar.pinnedToast": "آیکون به نوار پایین سنجاق شد",
    "taskbar.unpinnedToast": "آیکون از نوار پایین برداشته شد",
    "taskbar.alreadyPinned": "این آیکون از قبل در نوار پایین قرار دارد",
    "abar.reset": "ریست فیلدهای فرم",
    "abar.save": "ذخیره اطلاعات",
    "abar.saveNew": "ذخیره و جدید",
    "abar.saveClose": "ذخیره و بستن",
    "abar.copy": "کپی اطلاعات فرم",
    "abar.delete": "حذف اطلاعات",
    "abar.deleteNew": "حذف و جدید",
    "abar.deleteClose": "حذف و بستن",
    "abar.print": "پرینت فرم",
    "abar.list": "لیست اطلاعات ثبت‌شده",
    "abar.listEmpty": "موردی برای نمایش وجود ندارد",
    "abar.confirmDeleteTitle": "تأیید حذف",
    "abar.confirmDeleteBody": "آیا از حذف اطلاعات فرم جاری مطمئن هستید؟ این عملیات قابل بازگشت نیست.",
    "abar.demoTitle": "نوار عملیات فرم — پیش‌نمایش زیرساخت",
    "abar.demoNote": "تا ارائهٔ سند تحلیل، اتصال به دادهٔ واقعی وجود ندارد و رفتار دکمهها با دادهٔ نمونه نمایش داده می شود.",
    "abar.resetToast": "فیلدهای فرم بازنشانی شد",
    "abar.savedToast": "اطلاعات با موفقیت ذخیره شد",
    "abar.deletedToast": "اطلاعات حذف شد",
    "abar.itemOpened": "اطلاعات آیتم انتخاب‌شده در فرم باز شد",
    "abar.printToast": "فرم برای پرینت ارسال شد",
    "abar.copyToast": "اطلاعات فرم برای ثبت جدید کپی شد",
    "abar.toolbar": "نوار عملیات فرم",
    "sft.noData": "اطلاعاتی وجود ندارد",
    "sft.addRow": "افزودن سطر جدید",
    "sft.removeRow": "حذف سطر انتخاب‌شده",
    "sft.copyRows": "کپی سطر انتخاب‌شده",
    "sft.first": "رکورد اول",
    "sft.prev": "رکورد قبلی",
    "sft.next": "رکورد بعدی",
    "sft.last": "رکورد آخر",
    "sft.help": "راهنما",
    "sft.selectPlaceholder": "انتخاب کنید…",
    "stf.details": "جزئیات",
    "stf.iconLabel": "نمونه درختی",
    "stf.geoTitle": "محل های جغرافیایی",
    "stf.iran": "ایران",
    "stf.tehranProvince": "استان تهران",
    "stf.tehran": "تهران",
    "stf.alborz": "استان البرز",
    "stf.karaj": "کرج",
    "stf.type": "نوع",
    "stf.latinTitle": "عنوان (لاتین)",
    "stf.optCountry": "کشور",
    "stf.optProvince": "استان",
    "stf.optCity": "شهر",
    "fdf.title": "مشتری جدید",
    "fdf.badge": "نمونه",
    "fdf.iconLabel": "نمونه فرم",
    "fdf.code": "کد",
    "fdf.customerType": "نوع مشتری",
    "fdf.name": "عنوان",
    "fdf.customerGroup": "گروه مشتری",
    "fdf.balance": "مانده حساب",
    "fdf.formStatus": "وضعیت فرم",
    "fdf.effect": "اثر",
    "fdf.typeNormal": "عادی",
    "fdf.typeSpecial": "ویژه",
    "fdf.dirDirect": "مستقیم",
    "fdf.dirIndirect": "غیرمستقیم",
    "fdf.rial": "ریال ایران",
    "fdf.debit": "بدهکار",
    "fdf.active": "فعال",
    "fdf.tabAddresses": "آدرس‌ها",
    "fdf.tabContacts": "تماس‌ها",
    "fdf.addrType": "نوع آدرس",
    "fdf.city": "شهر",
    "fdf.fullAddr": "آدرس کامل",
    "fdf.postal": "کد پستی",
    "fdf.contactType": "نوع تماس",
    "fdf.number": "شماره",
    "fdf.notes": "توضیحات",
    "fdf.sampleName": "مشتری نمونه"
};
const en = {
    "common.loading": "Loading…",
    "common.retry": "Retry",
    "common.close": "Close",
    "common.minimize": "Minimize",
    "common.maximize": "Maximize",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.confirm": "Confirm",
    "common.all": "All",
    "common.search": "Search",
    "common.language": "Language",
    "common.theme": "Theme",
    "common.description": "Description",
    "common.error": "Error",
    "app.name": "Unified Commerce ERP",
    "app.shortName": "Commerce",
    "taskbar.search": "Search apps and settings",
    "header.dashboard": "Dashboard",
    "header.search": "Search the dashboard…",
    "header.dragHint": "Drag to move the header",
    "header.dockTop": "Dock at the top",
    "header.dockLeft": "Dock on the left",
    "header.dockRight": "Dock on the right",
    "header.dropHint": "Release to dock the header here",
    "startmenu.pinned": "Pinned",
    "startmenu.recommended": "Recommended",
    "startmenu.searchPlaceholder": "Type here to search…",
    "menus.general": "General & Settings",
    "menus.structural": "Structural Settings",
    "menus.businessStructure": "Business Structure",
    "bs.title": "Business Structure",
    "bs.subtitle": "Manage the organization tree, branches and agencies",
    "bs.treeTitle": "Structure Tree",
    "bs.searchPlaceholder": "Search structure…",
    "bs.newSubtree": "New subtree",
    "bs.deleteBranch": "Delete branch",
    "bs.emptyTree": "No structure defined yet",
    "bs.loadingTree": "Loading structure…",
    "bs.selectNode": "Select a node to view details",
    "bs.addNode": "Add child",
    "bs.addDisabledMax": "Maximum depth (4 levels) reached",
    "bs.mainTab": "Main Tab",
    "bs.usersTab": "Authorized Users",
    "bs.users.comingSoon": "User assignment will be enabled in the IAM phase",
    "bs.field.code": "Code",
    "bs.field.title": "Title",
    "bs.field.titleEn": "Latin Title",
    "bs.field.type": "Type",
    "bs.field.manager": "Manager",
    "bs.field.logo": "Logo",
    "bs.field.isActive": "Active",
    "bs.field.isBasicInfoShared": "Share basic info",
    "bs.field.shareHeadquarterData": "Use shared headquarters data",
    "bs.field.activeStructureTypes": "Allowed structure types",
    "bs.field.parent": "Parent",
    "bs.type.1": "Holding",
    "bs.type.2": "Company",
    "bs.type.3": "Branch",
    "bs.type.4": "Agency",
    "bs.type.5": "Store",
    "bs.type.hq": "Headquarters",
    "bs.action.save": "Save",
    "bs.action.saveNew": "Save & New",
    "bs.action.saveClose": "Save & Close",
    "bs.action.new": "New",
    "bs.action.delete": "Delete",
    "bs.msg.saved": "Saved successfully",
    "bs.msg.deleted": "Branch deleted",
    "bs.msg.deleteBlockedChildren": "This node has children and cannot be deleted",
    "bs.msg.deleteBlockedRoot": "Headquarters cannot be deleted",
    "bs.msg.deleteBlockedSystem": "System records cannot be deleted",
    "bs.msg.deleteConfirm": "Are you sure you want to delete this node?",
    "bs.msg.loadError": "Failed to load structure",
    "bs.msg.saveError": "Failed to save",
    "bs.val.titleRequired": "Title is required",
    "bs.val.titleEnRequired": "Latin (English) title is required",
    "bs.val.typeRequired": "Type is required",
    "bs.hint.codeAuto": "Code is generated automatically",
    "bs.hint.latinTitle": "Enter the equivalent Latin title",
    "bs.root.unionWarning": "The union of system-defined structures and your selection will be applied",
    "settings.title": "Settings",
    "settings.subtitle": "Personalize the system",
    "settings.appearance": "Appearance",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.back": "Back",
    "settings.bsDesc": "Manage holding, company, branch, agency and store levels",
    "settings.umDesc": "Manage users, roles and system access levels",
    "settings.umPending": "User Management consists of several forms; its analysis document will be provided and the forms will be implemented after that.",
    "sidebar.title": "All items",
    "sidebar.toSidebar": "Show as sidebar menu",
    "sidebar.toGrid": "Show icons on desktop",
    "sidebar.collapse": "Collapse menu",
    "sidebar.expand": "Expand menu",
    "app.settings": "Settings",
    "app.accounting": "Accounting",
    "app.receiptsPayment": "Receipts & Payments",
    "app.inventory": "Warehouse",
    "app.sales": "Sales",
    "app.fixedAssets": "Fixed Assets",
    "app.procurement": "Procurement",
    "app.foreignOrders": "Foreign Orders",
    "app.costing": "Cost Accounting",
    "app.materialDelivery": "Material Delivery Control",
    "app.productionPlanning": "Production Planning",
    "app.payroll": "Payroll",
    "app.hr": "Human Resources",
    "app.officeAutomation": "Office Automation",
    "app.crm": "Customer Relationship Management",
    "app.advancedTools": "Advanced Tools",
    "app.userManagement": "User Management",
    "app.workflow": "Workflow",
    "app.smsCenter": "SMS Center",
    "app.retailSales": "Retail Sales",
    "app.marketingSales": "Marketing & Sales",
    "app.coldDistribution": "Cold Distribution",
    "app.hotDistribution": "Hot Distribution",
    "app.financialStatements": "Financial Statements",
    "app.businessIntelligence": "Business Intelligence",
    "app.maintenance": "Maintenance",
    "app.onlineWebsite": "Online Website",
    "app.general": "General",
    "ph.awaitingBadge": "Awaiting analysis document",
    "ph.awaitingBody": "The forms and fields of this module are not defined yet; once its analysis document is provided, design and implementation will follow that document exactly.",
    "ph.secureApi": "Secure service connectivity",
    "ph.infraStatus": "Infrastructure status",
    "ph.portLabel": "Service port",
    "ph.dbShared": "Shared database",
    "ph.dbDedicated": "Dedicated database",
    "ph.linkOk": "Connected (signed)",
    "ph.linkFail": "Temporarily unreachable",
    "ph.checking": "Checking secure connection…",
    "ctx.open": "Open",
    "ctx.pinTaskbar": "Pin to taskbar",
    "ctx.unpinTaskbar": "Unpin from taskbar",
    "ctx.resetLayout": "Reset desktop layout",
    "taskbar.dropHint": "Drop to pin to the taskbar",
    "taskbar.pinnedToast": "Icon pinned to the taskbar",
    "taskbar.unpinnedToast": "Icon removed from the taskbar",
    "taskbar.alreadyPinned": "This icon is already on the taskbar",
    "abar.reset": "Reset form fields",
    "abar.save": "Save data",
    "abar.saveNew": "Save & New",
    "abar.saveClose": "Save & Close",
    "abar.copy": "Copy form data",
    "abar.delete": "Delete data",
    "abar.deleteNew": "Delete & New",
    "abar.deleteClose": "Delete & Close",
    "abar.print": "Print form",
    "abar.list": "Saved records list",
    "abar.listEmpty": "No records to display",
    "abar.confirmDeleteTitle": "Confirm deletion",
    "abar.confirmDeleteBody": "Are you sure you want to delete the current form data? This action cannot be undone.",
    "abar.demoTitle": "Form action bar — infrastructure preview",
    "abar.demoNote": "Until the analysis document arrives there is no real data connection; button behavior is shown with sample data.",
    "abar.resetToast": "Form fields have been reset",
    "abar.savedToast": "Data saved successfully",
    "abar.deletedToast": "Data deleted",
    "abar.itemOpened": "The selected record opened in the form",
    "abar.printToast": "Form sent to printer",
    "abar.copyToast": "Form data copied for a new record",
    "abar.toolbar": "Form action bar",
    "sft.noData": "No data available",
    "sft.addRow": "Add a new row",
    "sft.removeRow": "Delete selected row",
    "sft.copyRows": "Copy selected row",
    "sft.first": "First record",
    "sft.prev": "Previous record",
    "sft.next": "Next record",
    "sft.last": "Last record",
    "sft.help": "Help",
    "sft.selectPlaceholder": "Select…",
    "stf.details": "Details",
    "stf.iconLabel": "Tree Form Sample",
    "stf.geoTitle": "Geographic Locations",
    "stf.iran": "Iran",
    "stf.tehranProvince": "Tehran Province",
    "stf.tehran": "Tehran",
    "stf.alborz": "Alborz Province",
    "stf.karaj": "Karaj",
    "stf.type": "Type",
    "stf.latinTitle": "Latin Title",
    "stf.optCountry": "Country",
    "stf.optProvince": "Province",
    "stf.optCity": "City",
    "fdf.title": "New Customer",
    "fdf.badge": "Sample",
    "fdf.iconLabel": "Form Sample",
    "fdf.code": "Code",
    "fdf.customerType": "Customer type",
    "fdf.name": "Title",
    "fdf.customerGroup": "Customer group",
    "fdf.balance": "Balance",
    "fdf.formStatus": "Form status",
    "fdf.effect": "Effect",
    "fdf.typeNormal": "Normal",
    "fdf.typeSpecial": "Special",
    "fdf.dirDirect": "Direct",
    "fdf.dirIndirect": "Indirect",
    "fdf.rial": "Iranian Rial",
    "fdf.debit": "Debit",
    "fdf.active": "Active",
    "fdf.tabAddresses": "Addresses",
    "fdf.tabContacts": "Contacts",
    "fdf.addrType": "Address type",
    "fdf.city": "City",
    "fdf.fullAddr": "Full address",
    "fdf.postal": "Postal code",
    "fdf.contactType": "Contact type",
    "fdf.number": "Number",
    "fdf.notes": "Notes",
    "fdf.sampleName": "Sample customer"
};
const tr = {
    ...en,
    "common.loading": "Yükleniyor…",
    "common.retry": "Tekrar dene",
    "common.close": "Kapat",
    "common.minimize": "Küçült",
    "common.maximize": "Büyüt",
    "common.cancel": "İptal",
    "common.save": "Kaydet",
    "common.delete": "Sil",
    "common.confirm": "Onayla",
    "common.all": "Tümü",
    "common.search": "Ara",
    "common.language": "Dil",
    "common.theme": "Tema",
    "common.description": "Açıklama",
    "common.error": "Hata",
    "app.name": "Birleşik Ticaret ERP",
    "app.shortName": "Ticaret",
    "taskbar.search": "Uygulama ve ayarlarda ara",
    "header.dashboard": "Kontrol Paneli",
    "header.search": "Kontrol panelinde ara…",
    "header.dragHint": "Başlığı taşımak için sürükleyin",
    "header.dockTop": "Üste yerleştir",
    "header.dockLeft": "Sola yerleştir",
    "header.dockRight": "Sağa yerleştir",
    "header.dropHint": "Başlığı buraya yerleştirmek için bırakın",
    "startmenu.pinned": "Sabitlenenler",
    "startmenu.recommended": "Önerilen",
    "startmenu.searchPlaceholder": "Aramak için yazın…",
    "menus.general": "Genel ve Ayarlar",
    "menus.structural": "Yapısal Ayarlar",
    "menus.businessStructure": "İşletme Yapısı",
    "bs.title": "İşletme Yapısı",
    "bs.subtitle": "Organizasyon ağacını, şubeleri ve acenteleri yönetin",
    "bs.treeTitle": "Yapı Ağacı",
    "bs.searchPlaceholder": "Yapıda ara…",
    "bs.newSubtree": "Yeni alt dal",
    "bs.deleteBranch": "Dalı sil",
    "bs.emptyTree": "Henüz yapı tanımlanmadı",
    "bs.loadingTree": "Yapı yükleniyor…",
    "bs.selectNode": "Detayları görmek için bir düğüm seçin",
    "bs.addNode": "Alt düğüm ekle",
    "bs.addDisabledMax": "Maksimum derinliğe (4 seviye) ulaşıldı",
    "bs.mainTab": "Ana Sekme",
    "bs.usersTab": "Yetkili Kullanıcılar",
    "bs.users.comingSoon": "Kullanıcı ataması IAM aşamasında etkinleşecek",
    "bs.field.code": "Kod",
    "bs.field.title": "Başlık",
    "bs.field.titleEn": "Latin Başlık",
    "bs.field.type": "Tür",
    "bs.field.manager": "Yönetici",
    "bs.field.logo": "Logo",
    "bs.field.isActive": "Etkin",
    "bs.field.isBasicInfoShared": "Temel bilgi paylaşımı",
    "bs.field.shareHeadquarterData": "Genel merkez ortak verilerini kullan",
    "bs.field.activeStructureTypes": "İzin verilen yapı türleri",
    "bs.field.parent": "Üst",
    "bs.type.1": "Holding",
    "bs.type.2": "Şirket",
    "bs.type.3": "Şube",
    "bs.type.4": "Acente",
    "bs.type.5": "Mağaza",
    "bs.type.hq": "Genel Merkez",
    "bs.action.save": "Kaydet",
    "bs.action.saveNew": "Kaydet ve Yeni",
    "bs.action.saveClose": "Kaydet ve Kapat",
    "bs.action.new": "Yeni",
    "bs.action.delete": "Sil",
    "bs.msg.saved": "Başarıyla kaydedildi",
    "bs.msg.deleted": "Dal silindi",
    "bs.msg.deleteBlockedChildren": "Bu dalın alt düğümleri var, silinemez",
    "bs.msg.deleteBlockedRoot": "Genel merkez silinemez",
    "bs.msg.deleteBlockedSystem": "Sistem kayıtları silinemez",
    "bs.msg.deleteConfirm": "Bu düğümü silmek istediğinizden emin misiniz?",
    "bs.msg.loadError": "Yapı yüklenemedi",
    "bs.msg.saveError": "Kaydedilemedi",
    "bs.val.titleRequired": "Başlık zorunludur",
    "bs.val.titleEnRequired": "Latin (İngilizce) başlık zorunludur",
    "bs.val.typeRequired": "Tür seçimi zorunludur",
    "bs.hint.codeAuto": "Kod otomatik oluşturulur",
    "bs.hint.latinTitle": "Eşdeğer Latin başlığı girin",
    "bs.root.unionWarning": "Sistemde tanımlı yapılarla seçiminizin birleşimi uygulanacaktır",
    "settings.title": "Ayarlar",
    "settings.subtitle": "Sistemi kişiselleştirin",
    "settings.appearance": "Görünüm",
    "settings.light": "Açık",
    "settings.dark": "Koyu",
    "settings.back": "Geri",
    "settings.bsDesc": "Holding, şirket, şube, acente ve mağaza seviyelerini yönetin",
    "settings.umDesc": "Kullanıcıları, rolleri ve sistem erişim düzeylerini yönetin",
    "settings.umPending": "Kullanıcı Yönetimi birkaç formdan oluşur; analiz belgesi sağlanacak ve formlar daha sonra uygulanacaktır.",
    "sidebar.title": "Tüm öğeler",
    "sidebar.toSidebar": "Kenar menü olarak göster",
    "sidebar.toGrid": "Simgeleri masaüstünde göster",
    "sidebar.collapse": "Menüyü daralt",
    "sidebar.expand": "Menüyü genişlet",
    "app.settings": "Ayarlar",
    "app.accounting": "Muhasebe",
    "app.receiptsPayment": "Tahsilat ve Ödemeler",
    "app.inventory": "Depo",
    "app.sales": "Satış",
    "app.fixedAssets": "Sabit Varlıklar",
    "app.procurement": "Satın Alma",
    "app.foreignOrders": "Yurtdışı Siparişleri",
    "app.costing": "Maliyet Muhasebesi",
    "app.materialDelivery": "Mal Teslim Kontrolü",
    "app.productionPlanning": "Üretim Planlama",
    "app.payroll": "Bordro",
    "app.hr": "İnsan Kaynakları",
    "app.officeAutomation": "Ofis Otomasyonu",
    "app.crm": "Müşteri İlişkileri Yönetimi",
    "app.advancedTools": "Gelişmiş Araçlar",
    "app.userManagement": "Kullanıcı Yönetimi",
    "app.workflow": "İş Akışı",
    "app.smsCenter": "SMS Merkezi",
    "app.retailSales": "Perakende Satış",
    "app.marketingSales": "Pazarlama ve Satış",
    "app.coldDistribution": "Soğuk Dağıtım",
    "app.hotDistribution": "Sıcak Dağıtım",
    "app.financialStatements": "Mali Tablolar",
    "app.businessIntelligence": "İş Zekası",
    "app.maintenance": "Bakım",
    "app.onlineWebsite": "Çevrimiçi Web Sitesi",
    "app.general": "Genel",
    "ph.awaitingBadge": "Analiz belgesi bekleniyor",
    "ph.awaitingBody": "Bu modülün formları ve alanları henüz tanımlanmadı; analiz belgesi sunulduğunda tasarım ve uygulama tam olarak o belgeye göre yapılacaktır.",
    "ph.secureApi": "Güvenli servis bağlantısı",
    "ph.infraStatus": "Altyapı durumu",
    "ph.portLabel": "Servis portu",
    "ph.dbShared": "Paylaşılan veritabanı",
    "ph.dbDedicated": "Ayrı veritabanı",
    "ph.linkOk": "Bağlı (imzalı)",
    "ph.linkFail": "Geçici kesinti",
    "ph.checking": "Güvenli bağlantı kontrol ediliyor…",
    "ctx.open": "Aç",
    "ctx.pinTaskbar": "Görev çubuğuna sabitle",
    "ctx.unpinTaskbar": "Görev çubuğundan kaldır",
    "ctx.resetLayout": "Masaüstü düzenini sıfırla",
    "taskbar.dropHint": "Görev çubuğuna sabitlemek için bırakın",
    "taskbar.pinnedToast": "Simge görev çubuğuna sabitlendi",
    "taskbar.unpinnedToast": "Simge görev çubuğundan kaldırıldı",
    "taskbar.alreadyPinned": "Bu simge zaten görev çubuğunda",
    "abar.reset": "Form alanlarını sıfırla",
    "abar.save": "Verileri kaydet",
    "abar.saveNew": "Kaydet ve yeni",
    "abar.saveClose": "Kaydet ve kapat",
    "abar.copy": "Form verilerini kopyala",
    "abar.delete": "Verileri sil",
    "abar.deleteNew": "Sil ve yeni",
    "abar.deleteClose": "Sil ve kapat",
    "abar.print": "Formu yazdır",
    "abar.list": "Kaydedilen kayıtların listesi",
    "abar.listEmpty": "Görüntülenecek kayıt yok",
    "abar.confirmDeleteTitle": "Silme onayı",
    "abar.confirmDeleteBody": "Geçerli form verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    "abar.demoTitle": "Form eylem çubuğu — altyapı önizlemesi",
    "abar.demoNote": "Analiz belgesi gelene kadar gerçek veri bağlantısı yoktur; düğmelerin davranışı örnek verilerle gösterilir.",
    "abar.resetToast": "Form alanları sıfırlandı",
    "abar.savedToast": "Veriler başarıyla kaydedildi",
    "abar.deletedToast": "Veriler silindi",
    "abar.itemOpened": "Seçilen kaydın verileri formda açıldı",
    "abar.printToast": "Form yazıcıya gönderildi",
    "abar.copyToast": "Form verileri yeni kayıt için kopyalandı",
    "abar.toolbar": "Form eylem çubuğu",
    "sft.noData": "Veri mevcut değil",
    "sft.addRow": "Yeni satır ekle",
    "sft.removeRow": "Seçili satırı sil",
    "sft.copyRows": "Seçili satırı kopyala",
    "sft.first": "İlk kayıt",
    "sft.prev": "Önceki kayıt",
    "sft.next": "Sonraki kayıt",
    "sft.last": "Son kayıt",
    "sft.help": "Yardım",
    "sft.selectPlaceholder": "Seçin…",
    "stf.details": "Ayrıntılar",
    "stf.iconLabel": "Ağaç Form Örneği",
    "stf.geoTitle": "Coğrafi Konumlar",
    "stf.iran": "İran",
    "stf.tehranProvince": "Tahran Eyaleti",
    "stf.tehran": "Tahran",
    "stf.alborz": "Elburz Eyaleti",
    "stf.karaj": "Kerec",
    "stf.type": "Tür",
    "stf.latinTitle": "Latin Başlık",
    "stf.optCountry": "Ülke",
    "stf.optProvince": "Eyalet",
    "stf.optCity": "Şehir",
    "fdf.title": "Yeni Müşteri",
    "fdf.badge": "Örnek",
    "fdf.iconLabel": "Form Örneği",
    "fdf.code": "Kod",
    "fdf.customerType": "Müşteri türü",
    "fdf.name": "Başlık",
    "fdf.customerGroup": "Müşteri grubu",
    "fdf.balance": "Bakiye",
    "fdf.formStatus": "Form durumu",
    "fdf.effect": "Etki",
    "fdf.typeNormal": "Normal",
    "fdf.typeSpecial": "Özel",
    "fdf.dirDirect": "Doğrudan",
    "fdf.dirIndirect": "Dolaylı",
    "fdf.rial": "İran Riyali",
    "fdf.debit": "Borç",
    "fdf.active": "Etkin",
    "fdf.tabAddresses": "Adresler",
    "fdf.tabContacts": "İletişim",
    "fdf.addrType": "Adres türü",
    "fdf.city": "Şehir",
    "fdf.fullAddr": "Tam adres",
    "fdf.postal": "Posta kodu",
    "fdf.contactType": "İletişim türü",
    "fdf.number": "Numara",
    "fdf.notes": "Notlar",
    "fdf.sampleName": "Örnek müşteri"
};
const ar = {
    ...en,
    "common.loading": "جارٍ التحميل…",
    "common.retry": "إعادة المحاولة",
    "common.close": "إغلاق",
    "common.minimize": "تصغير",
    "common.maximize": "تكبير",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.confirm": "تأكيد",
    "common.all": "الكل",
    "common.search": "بحث",
    "common.language": "اللغة",
    "common.theme": "السمة",
    "common.description": "الوصف",
    "common.error": "خطأ",
    "app.name": "نظام الأعمال الموحد",
    "app.shortName": "الأعمال",
    "taskbar.search": "ابحث في التطبيقات والإعدادات",
    "header.dashboard": "لوحة التحكم",
    "header.search": "ابحث في لوحة التحكم…",
    "header.dragHint": "اسحب لنقل الترويسة",
    "header.dockTop": "التثبيت في الأعلى",
    "header.dockLeft": "التثبيت على اليسار",
    "header.dockRight": "التثبيت على اليمين",
    "header.dropHint": "أفلت لتثبيت الترويسة هنا",
    "startmenu.pinned": "المثبتة",
    "startmenu.recommended": "موصى به",
    "startmenu.searchPlaceholder": "اكتب للبحث…",
    "menus.general": "عام والإعدادات",
    "menus.structural": "الإعدادات الهيكلية",
    "menus.businessStructure": "هيكل الأعمال",
    "bs.title": "هيكل الأعمال",
    "bs.subtitle": "إدارة شجرة المؤسسة والفروع والوكالات",
    "bs.treeTitle": "شجرة الهيكل",
    "bs.searchPlaceholder": "بحث في الهيكل…",
    "bs.newSubtree": "فرع جديد",
    "bs.deleteBranch": "حذف الفرع",
    "bs.emptyTree": "لم يتم تعريف أي هيكل بعد",
    "bs.loadingTree": "جارٍ تحميل الهيكل…",
    "bs.selectNode": "اختر عقدة لعرض التفاصيل",
    "bs.addNode": "إضافة عقدة فرعية",
    "bs.addDisabledMax": "تم بلوغ أقصى عمق (4 مستويات)",
    "bs.mainTab": "التبويب الرئيسي",
    "bs.usersTab": "المستخدمون المصرح لهم",
    "bs.users.comingSoon": "سيتم تفعيل ربط المستخدمين في مرحلة IAM",
    "bs.field.code": "الرمز",
    "bs.field.title": "العنوان",
    "bs.field.titleEn": "العنوان اللاتيني",
    "bs.field.type": "النوع",
    "bs.field.manager": "المدير",
    "bs.field.logo": "الشعار",
    "bs.field.isActive": "نشط",
    "bs.field.isBasicInfoShared": "مشاركة المعلومات الأساسية",
    "bs.field.shareHeadquarterData": "استخدام بيانات المقر المشتركة",
    "bs.field.activeStructureTypes": "أنواع الهياكل المسموحة",
    "bs.field.parent": "الأصل",
    "bs.type.1": "مجموعة قابضة",
    "bs.type.2": "شركة",
    "bs.type.3": "فرع",
    "bs.type.4": "وكالة",
    "bs.type.5": "متجر",
    "bs.type.hq": "المقر الرئيسي",
    "bs.action.save": "حفظ",
    "bs.action.saveNew": "حفظ وجديد",
    "bs.action.saveClose": "حفظ وإغلاق",
    "bs.action.new": "جديد",
    "bs.action.delete": "حذف",
    "bs.msg.saved": "تم الحفظ بنجاح",
    "bs.msg.deleted": "تم حذف الفرع",
    "bs.msg.deleteBlockedChildren": "هذه العقدة لها فروع ولا يمكن حذفها",
    "bs.msg.deleteBlockedRoot": "لا يمكن حذف المقر الرئيسي",
    "bs.msg.deleteBlockedSystem": "لا يمكن حذف سجلات النظام",
    "bs.msg.deleteConfirm": "هل أنت متأكد من حذف هذه العقدة؟",
    "bs.msg.loadError": "فشل تحميل الهيكل",
    "bs.msg.saveError": "فشل الحفظ",
    "bs.val.titleRequired": "العنوان مطلوب",
    "bs.val.titleEnRequired": "العنوان اللاتيني (الإنجليزي) مطلوب",
    "bs.val.typeRequired": "اختيار النوع مطلوب",
    "bs.hint.codeAuto": "يتم توليد الرمز تلقائياً",
    "bs.hint.latinTitle": "أدخل العنوان اللاتيني المكافئ",
    "bs.root.unionWarning": "سيتم تطبيق اتحاد هياكل النظام مع اختيارك",
    "settings.title": "الإعدادات",
    "settings.subtitle": "تخصيص النظام",
    "settings.appearance": "المظهر",
    "settings.light": "فاتح",
    "settings.dark": "داكن",
    "settings.back": "رجوع",
    "settings.bsDesc": "إدارة مستويات القابضة والشركة والفرع والوكالة والمتجر",
    "settings.umDesc": "إدارة المستخدمين والأدوار ومستويات الوصول إلى النظام",
    "settings.umPending": "تتكون إدارة المستخدمين من عدة نماذج؛ سيتم تقديم وثيقة التحليل وسيتم تنفيذ النماذج بعد ذلك.",
    "sidebar.title": "جميع العناصر",
    "sidebar.toSidebar": "عرض كقائمة جانبية",
    "sidebar.toGrid": "عرض الأيقونات على سطح المكتب",
    "sidebar.collapse": "طي القائمة",
    "sidebar.expand": "توسيع القائمة",
    "app.settings": "الإعدادات",
    "app.accounting": "المحاسبة",
    "app.receiptsPayment": "المقبوضات والمدفوعات",
    "app.inventory": "المخازن",
    "app.sales": "المبيعات",
    "app.fixedAssets": "الأصول الثابتة",
    "app.procurement": "المشتريات",
    "app.foreignOrders": "الطلبات الأجنبية",
    "app.costing": "محاسبة التكاليف",
    "app.materialDelivery": "مراقبة تسليم المواد",
    "app.productionPlanning": "تخطيط الإنتاج",
    "app.payroll": "الرواتب",
    "app.hr": "الموارد البشرية",
    "app.officeAutomation": "أتمتة المكتب",
    "app.crm": "إدارة علاقات العملاء",
    "app.advancedTools": "أدوات متقدمة",
    "app.userManagement": "إدارة المستخدمين",
    "app.workflow": "سير العمل",
    "app.smsCenter": "مركز الرسائل",
    "app.retailSales": "مبيعات التجزئة",
    "app.marketingSales": "التسويق والمبيعات",
    "app.coldDistribution": "التوزيع البارد",
    "app.hotDistribution": "التوزيع الساخن",
    "app.financialStatements": "القوائم المالية",
    "app.businessIntelligence": "ذكاء الأعمال",
    "app.maintenance": "الصيانة",
    "app.onlineWebsite": "الموقع الإلكتروني",
    "app.general": "عام",
    "ph.awaitingBadge": "بانتظار وثيقة التحليل",
    "ph.awaitingBody": "لم يتم تحديد نماذج وحقول هذه الوحدة بعد؛ وعند تقديم وثيقة التحليل، سيتم التصميم والتنفيذ وفقًا لتلك الوثيقة تمامًا.",
    "ph.secureApi": "اتصال آمن للخدمات",
    "ph.infraStatus": "حالة البنية التحتية",
    "ph.portLabel": "منفذ الخدمة",
    "ph.dbShared": "قاعدة بيانات مشتركة",
    "ph.dbDedicated": "قاعدة بيانات منفصلة",
    "ph.linkOk": "متصل (موقّع)",
    "ph.linkFail": "انقطاع مؤقت",
    "ph.checking": "جارٍ التحقق من الاتصال الآمن…",
    "ctx.open": "فتح",
    "ctx.pinTaskbar": "تثبيت في شريط المهام",
    "ctx.unpinTaskbar": "إلغاء التثبيت من شريط المهام",
    "ctx.resetLayout": "إعادة تعيين تخطيط سطح المكتب",
    "taskbar.dropHint": "أفلت للتثبيت في شريط المهام",
    "taskbar.pinnedToast": "تم تثبيت الأيقونة في شريط المهام",
    "taskbar.unpinnedToast": "تمت إزالة الأيقونة من شريط المهام",
    "taskbar.alreadyPinned": "هذه الأيقونة موجودة بالفعل في شريط المهام",
    "abar.reset": "إعادة تعيين حقول النموذج",
    "abar.save": "حفظ البيانات",
    "abar.saveNew": "حفظ وجديد",
    "abar.saveClose": "حفظ وإغلاق",
    "abar.copy": "نسخ بيانات النموذج",
    "abar.delete": "حذف البيانات",
    "abar.deleteNew": "حذف وجديد",
    "abar.deleteClose": "حذف وإغلاق",
    "abar.print": "طباعة النموذج",
    "abar.list": "قائمة السجلات المحفوظة",
    "abar.listEmpty": "لا توجد سجلات للعرض",
    "abar.confirmDeleteTitle": "تأكيد الحذف",
    "abar.confirmDeleteBody": "هل أنت متأكد من حذف بيانات النموذج الحالي؟ لا يمكن التراجع عن هذا الإجراء.",
    "abar.demoTitle": "شريط إجراءات النموذج — معاينة البنية التحتية",
    "abar.demoNote": "حتى وصول وثيقة التحليل لا يوجد اتصال بالبيانات الحقيقية؛ يُعرض سلوك الأزرار ببيانات نموذجية.",
    "abar.resetToast": "تمت إعادة تعيين حقول النموذج",
    "abar.savedToast": "تم حفظ البيانات بنجاح",
    "abar.deletedToast": "تم حذف البيانات",
    "abar.itemOpened": "تم فتح بيانات السجل المحدد في النموذج",
    "abar.printToast": "تم إرسال النموذج إلى الطابعة",
    "abar.copyToast": "تم نسخ بيانات النموذج لإنشاء سجل جديد",
    "abar.toolbar": "شريط إجراءات النموذج",
    "sft.noData": "لا توجد بيانات",
    "sft.addRow": "إضافة صف جديد",
    "sft.removeRow": "حذف الصف المحدد",
    "sft.copyRows": "نسخ الصف المحدد",
    "sft.first": "السجل الأول",
    "sft.prev": "السجل السابق",
    "sft.next": "السجل التالي",
    "sft.last": "السجل الأخير",
    "sft.help": "مساعدة",
    "sft.selectPlaceholder": "اختر…",
    "stf.details": "التفاصيل",
    "stf.iconLabel": "نموذج شجري",
    "stf.geoTitle": "المواقع الجغرافية",
    "stf.iran": "إيران",
    "stf.tehranProvince": "محافظة طهران",
    "stf.tehran": "طهران",
    "stf.alborz": "محافظة البرز",
    "stf.karaj": "كرج",
    "stf.type": "النوع",
    "stf.latinTitle": "العنوان (لاتيني)",
    "stf.optCountry": "البلد",
    "stf.optProvince": "المحافظة",
    "stf.optCity": "المدينة",
    "fdf.title": "عميل جديد",
    "fdf.badge": "عينة",
    "fdf.iconLabel": "عينة النموذج",
    "fdf.code": "الرمز",
    "fdf.customerType": "نوع العميل",
    "fdf.name": "العنوان",
    "fdf.customerGroup": "مجموعة العملاء",
    "fdf.balance": "الرصيد",
    "fdf.formStatus": "حالة النموذج",
    "fdf.effect": "الأثر",
    "fdf.typeNormal": "عادي",
    "fdf.typeSpecial": "خاص",
    "fdf.dirDirect": "مباشر",
    "fdf.dirIndirect": "غير مباشر",
    "fdf.rial": "ريال إيران",
    "fdf.debit": "مدين",
    "fdf.active": "نشط",
    "fdf.tabAddresses": "العناوين",
    "fdf.tabContacts": "جهات الاتصال",
    "fdf.addrType": "نوع العنوان",
    "fdf.city": "المدينة",
    "fdf.fullAddr": "العنوان الكامل",
    "fdf.postal": "الرمز البريدي",
    "fdf.contactType": "نوع الاتصال",
    "fdf.number": "الرقم",
    "fdf.notes": "ملاحظات",
    "fdf.sampleName": "عميل نموذجي"
};
const hi = {
    ...en,
    "common.loading": "लोड हो रहा है…",
    "common.retry": "पुनः प्रयास",
    "common.close": "बंद करें",
    "common.minimize": "छोटा करें",
    "common.maximize": "बड़ा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएँ",
    "common.confirm": "पुष्टि करें",
    "common.all": "सभी",
    "common.search": "खोजें",
    "common.language": "भाषा",
    "common.theme": "थीम",
    "common.description": "विवरण",
    "common.error": "त्रुटि",
    "app.name": "एकीकृत वाणिज्य ERP",
    "app.shortName": "वाणिज्य",
    "taskbar.search": "ऐप्स और सेटिंग्स खोजें",
    "header.dashboard": "डैशबोर्ड",
    "header.search": "डैशबोर्ड में खोजें…",
    "header.dragHint": "हेडर खिसकाने के लिए खींचें",
    "header.dockTop": "ऊपर डॉक करें",
    "header.dockLeft": "बाईं ओर डॉक करें",
    "header.dockRight": "दाईं ओर डॉक करें",
    "header.dropHint": "हेडर को यहाँ डॉक करने के लिए छोड़ें",
    "startmenu.pinned": "पिन किए गए",
    "startmenu.recommended": "अनुशंसित",
    "startmenu.searchPlaceholder": "खोजने के लिए टाइप करें…",
    "menus.general": "सामान्य और सेटिंग्स",
    "menus.structural": "संरचनात्मक सेटिंग्स",
    "menus.businessStructure": "व्यापार संरचना",
    "bs.title": "व्यापार संरचना",
    "bs.subtitle": "संगठन वृक्ष, शाखाएँ और एजेंसियाँ प्रबंधित करें",
    "bs.treeTitle": "संरचना वृक्ष",
    "bs.searchPlaceholder": "संरचना में खोजें…",
    "bs.newSubtree": "नया उपवृक्ष",
    "bs.deleteBranch": "शाखा हटाएँ",
    "bs.emptyTree": "अभी कोई संरचना परिभाषित नहीं है",
    "bs.loadingTree": "संरचना लोड हो रही है…",
    "bs.selectNode": "विवरण देखने के लिए नोड चुनें",
    "bs.addNode": "चाइल्ड जोड़ें",
    "bs.addDisabledMax": "अधिकतम गहराई (4 स्तर) पूर्ण",
    "bs.mainTab": "मुख्य टैब",
    "bs.usersTab": "अधिकृत उपयोगकर्ता",
    "bs.users.comingSoon": "उपयोगकर्ता लिंकिंग IAM चरण में सक्रिय होगी",
    "bs.field.code": "कोड",
    "bs.field.title": "शीर्षक",
    "bs.field.titleEn": "लैटिन शीर्षक",
    "bs.field.type": "प्रकार",
    "bs.field.manager": "प्रबंधक",
    "bs.field.logo": "लोगो",
    "bs.field.isActive": "सक्रिय",
    "bs.field.isBasicInfoShared": "बुनियादी जानकारी साझा करें",
    "bs.field.shareHeadquarterData": "मुख्यालय के साझा डेटा का उपयोग करें",
    "bs.field.activeStructureTypes": "अनुमत संरचना प्रकार",
    "bs.field.parent": "जनक",
    "bs.type.1": "होल्डिंग",
    "bs.type.2": "कंपनी",
    "bs.type.3": "शाखा",
    "bs.type.4": "एजेंसी",
    "bs.type.5": "स्टोर",
    "bs.type.hq": "मुख्यालय",
    "bs.action.save": "सहेजें",
    "bs.action.saveNew": "सहेजें और नया",
    "bs.action.saveClose": "सहेजें और बंद करें",
    "bs.action.new": "नया",
    "bs.action.delete": "हटाएँ",
    "bs.msg.saved": "सफलतापूर्वक सहेजा गया",
    "bs.msg.deleted": "शाखा हटाई गई",
    "bs.msg.deleteBlockedChildren": "इस नोड के चाइल्ड हैं, हटाया नहीं जा सकता",
    "bs.msg.deleteBlockedRoot": "मुख्यालय हटाया नहीं जा सकता",
    "bs.msg.deleteBlockedSystem": "सिस्टम रिकॉर्ड हटाए नहीं जा सकते",
    "bs.msg.deleteConfirm": "क्या आप वाकई इस नोड को हटाना चाहते हैं?",
    "bs.msg.loadError": "संरचना लोड करने में विफल",
    "bs.msg.saveError": "सहेजने में विफल",
    "bs.val.titleRequired": "शीर्षक आवश्यक है",
    "bs.val.titleEnRequired": "लैटिन (अंग्रेज़ी) शीर्षक आवश्यक है",
    "bs.val.typeRequired": "प्रकार चुनना आवश्यक है",
    "bs.hint.codeAuto": "कोड स्वतः जनरेट होता है",
    "bs.hint.latinTitle": "समतुल्य लैटिन शीर्षक दर्ज करें",
    "bs.root.unionWarning": "सिस्टम-परिभाषित संरचनाओं और आपके चयन का मिलन लागू होगा",
    "settings.title": "सेटिंग्स",
    "settings.subtitle": "सिस्टम व्यक्तिगत करें",
    "settings.appearance": "रूप",
    "settings.light": "हल्का",
    "settings.dark": "गहरा",
    "settings.back": "वापस",
    "settings.bsDesc": "होल्डिंग, कंपनी, शाखा, एजेंसी और स्टोर स्तरों का प्रबंधन करें",
    "settings.umDesc": "उपयोगकर्ताओं, भूमिकाओं और सिस्टम एक्सेस स्तरों का प्रबंधन करें",
    "settings.umPending": "उपयोगकर्ता प्रबंधन कई फ़ॉर्म से मिलकर बना है; इसका विश्लेषण दस्तावेज़ प्रदान किया जाएगा और फ़ॉर्म उसके बाद लागू किए जाएंगे।",
    "sidebar.title": "सभी आइटम",
    "sidebar.toSidebar": "साइडबार मेनू के रूप में दिखाएँ",
    "sidebar.toGrid": "आइकन को डेस्कटॉप पर दिखाएँ",
    "sidebar.collapse": "मेनू संकुचित करें",
    "sidebar.expand": "मेनू विस्तारित करें",
    "app.settings": "सेटिंग्स",
    "app.accounting": "लेखांकन",
    "app.receiptsPayment": "प्राप्तियाँ और भुगतान",
    "app.inventory": "गोदाम",
    "app.sales": "बिक्री",
    "app.fixedAssets": "स्थिर संपत्ति",
    "app.procurement": "आपूर्ति",
    "app.foreignOrders": "विदेशी ऑर्डर",
    "app.costing": "लागत लेखांकन",
    "app.materialDelivery": "सामग्री वितरण नियंत्रण",
    "app.productionPlanning": "उत्पादन योजना",
    "app.payroll": "पेरोल",
    "app.hr": "मानव संसाधन",
    "app.officeAutomation": "कार्यालय ऑटोमेशन",
    "app.crm": "ग्राहक संबंध प्रबंधन",
    "app.advancedTools": "उन्नत उपकरण",
    "app.userManagement": "उपयोगकर्ता प्रबंधन",
    "app.workflow": "कार्यप्रवाह",
    "app.smsCenter": "एसएमएस केंद्र",
    "app.retailSales": "खुदरा बिक्री",
    "app.marketingSales": "विपणन और बिक्री",
    "app.coldDistribution": "कोल्ड वितरण",
    "app.hotDistribution": "हॉट वितरण",
    "app.financialStatements": "वित्तीय विवरण",
    "app.businessIntelligence": "व्यावसायिक बुद्धिमत्ता",
    "app.maintenance": "रखरखाव",
    "app.onlineWebsite": "ऑनलाइन वेबसाइट",
    "app.general": "सामान्य",
    "ph.awaitingBadge": "विश्लेषण दस्तावेज़ की प्रतीक्षा",
    "ph.awaitingBody": "इस मॉड्यूल के फ़ॉर्म और फ़ील्ड अभी परिभाषित नहीं हैं; इसका विश्लेषण दस्तावेज़ दिए जाने पर डिज़ाइन और कार्यान्वयन ठीक उसी दस्तावेज़ के अनुसार किया जाएगा।",
    "ph.secureApi": "सुरक्षित सेवा कनेक्टिविटी",
    "ph.infraStatus": "अवसंरचना स्थिति",
    "ph.portLabel": "सेवा पोर्ट",
    "ph.dbShared": "साझा डेटाबेस",
    "ph.dbDedicated": "समर्पित डेटाबेस",
    "ph.linkOk": "जुड़ा हुआ (हस्ताक्षरित)",
    "ph.linkFail": "अस्थायी रूप से अनुपलब्ध",
    "ph.checking": "सुरक्षित कनेक्शन की जाँच हो रही है…",
    "ctx.open": "खोलें",
    "ctx.pinTaskbar": "टास्कबार पर पिन करें",
    "ctx.unpinTaskbar": "टास्कबार से अनपिन करें",
    "ctx.resetLayout": "डेस्कटॉप लेआउट रीसेट करें",
    "taskbar.dropHint": "टास्कबार पर पिन करने के लिए छोड़ें",
    "taskbar.pinnedToast": "आइकन टास्कबार पर पिन हो गया",
    "taskbar.unpinnedToast": "आइकन टास्कबार से हटा दिया गया",
    "taskbar.alreadyPinned": "यह आइकन पहले से टास्कबार पर है",
    "abar.reset": "फ़ॉर्म फ़ील्ड रीसेट करें",
    "abar.save": "डेटा सहेजें",
    "abar.saveNew": "सहेजें और नया",
    "abar.saveClose": "सहेजें और बंद करें",
    "abar.copy": "फ़ॉर्म डेटा कॉपी करें",
    "abar.delete": "डेटा हटाएँ",
    "abar.deleteNew": "हटाएँ और नया",
    "abar.deleteClose": "हटाएँ और बंद करें",
    "abar.print": "फ़ॉर्म प्रिंट करें",
    "abar.list": "सहेजे गए रिकॉर्ड की सूची",
    "abar.listEmpty": "दिखाने के लिए कोई रिकॉर्ड नहीं",
    "abar.confirmDeleteTitle": "हटाने की पुष्टि करें",
    "abar.confirmDeleteBody": "क्या आप वर्तमान फ़ॉर्म डेटा हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
    "abar.demoTitle": "फ़ॉर्म ऐक्शन बार — अवसंरचना पूर्वावलोकन",
    "abar.demoNote": "विश्लेषण दस्तावेज़ के आने तक वास्तविक डेटा कनेक्शन नहीं है; बटनों का व्यवहार नमूना डेटा से दिखाया जाता है।",
    "abar.resetToast": "फ़ॉर्म फ़ील्ड रीसेट कर दिए गए",
    "abar.savedToast": "डेटा सफ़लतापूर्वक सहेजा गया",
    "abar.deletedToast": "डेटा हटा दिया गया",
    "abar.itemOpened": "चयनित रिकॉर्ड का डेटा फ़ॉर्म में खुल गया",
    "abar.printToast": "फ़ॉर्म प्रिंटर को भेज दिया गया",
    "abar.copyToast": "नए रिकॉर्ड के लिए फ़ॉर्म डेटा कॉपी कर लिया गया",
    "abar.toolbar": "फ़ॉर्म ऐक्शन बार",
    "sft.noData": "कोई डेटा उपलब्ध नहीं",
    "sft.addRow": "नई पंक्ति जोड़ें",
    "sft.removeRow": "चयनित पंक्ति हटाएँ",
    "sft.copyRows": "चयनित पंक्ति कॉपी करें",
    "sft.first": "पहला रिकॉर्ड",
    "sft.prev": "पिछला रिकॉर्ड",
    "sft.next": "अगला रिकॉर्ड",
    "sft.last": "अंतिम रिकॉर्ड",
    "sft.help": "सहायता",
    "sft.selectPlaceholder": "चुनें…",
    "stf.details": "विवरण",
    "stf.iconLabel": "ट्री फ़ॉर्म नमूना",
    "stf.geoTitle": "भौगोलिक स्थान",
    "stf.iran": "ईरान",
    "stf.tehranProvince": "तेहरान प्रांत",
    "stf.tehran": "तेहरान",
    "stf.alborz": "अलबोर्ज़ प्रांत",
    "stf.karaj": "करज",
    "stf.type": "प्रकार",
    "stf.latinTitle": "लैटिन शीर्षक",
    "stf.optCountry": "देश",
    "stf.optProvince": "प्रांत",
    "stf.optCity": "शहर",
    "fdf.title": "नया ग्राहक",
    "fdf.badge": "नमूना",
    "fdf.iconLabel": "फ़ॉर्म नमूना",
    "fdf.code": "कोड",
    "fdf.customerType": "ग्राहक प्रकार",
    "fdf.name": "शीर्षक",
    "fdf.customerGroup": "ग्राहक समूह",
    "fdf.balance": "शेष",
    "fdf.formStatus": "फ़ॉर्म स्थिति",
    "fdf.effect": "प्रभाव",
    "fdf.typeNormal": "सामान्य",
    "fdf.typeSpecial": "विशेष",
    "fdf.dirDirect": "प्रत्यक्ष",
    "fdf.dirIndirect": "अप्रत्यक्ष",
    "fdf.rial": "ईरानी रियाल",
    "fdf.debit": "डेबिट",
    "fdf.active": "सक्रिय",
    "fdf.tabAddresses": "पते",
    "fdf.tabContacts": "संपर्क",
    "fdf.addrType": "पता प्रकार",
    "fdf.city": "शहर",
    "fdf.fullAddr": "पूरा पता",
    "fdf.postal": "पिन कोड",
    "fdf.contactType": "संपर्क प्रकार",
    "fdf.number": "नंबर",
    "fdf.notes": "टिप्पणियाँ",
    "fdf.sampleName": "नमूना ग्राहक"
};
const ps = {
    ...en,
    "common.loading": "بارېږي…",
    "common.retry": "بیا هڅه",
    "common.close": "بندول",
    "common.minimize": "کوچنیول",
    "common.maximize": "لویول",
    "common.cancel": "لغوه کول",
    "common.save": "خوندي کول",
    "common.delete": "ړنګول",
    "common.confirm": "تایید",
    "common.all": "ټول",
    "common.search": "لټون",
    "common.language": "ژبه",
    "common.theme": "تھیم",
    "common.description": "تشریح",
    "common.error": "تیروتنه",
    "app.name": "متحد تجارتي سیستم",
    "app.shortName": "تجارت",
    "taskbar.search": "پروګرامونه او تنظیمات ولټوئ",
    "header.dashboard": "ډاشبورډ",
    "header.search": "په ډاشبورډ کې لټون…",
    "header.dragHint": "د سرليک خوځولو لپاره يې راکش کړئ",
    "header.dockTop": "په سر کې ځای پرځای کول",
    "header.dockLeft": "په کیڼ کې ځای پرځای کول",
    "header.dockRight": "په ښي کې ځای پرځای کول",
    "header.dropHint": "د سرليک دلته ځای پرځای کولو لپاره پرېږدئ",
    "startmenu.pinned": "ټومبل شوي",
    "startmenu.recommended": "وړاندیز شوي",
    "startmenu.searchPlaceholder": "د لټون لپاره ولیکئ…",
    "menus.general": "عمومي او تنظیمات",
    "menus.structural": "جوړښتي تنظیمات",
    "menus.businessStructure": "د سوداګرۍ جوړښت",
    "bs.title": "د سوداګرۍ جوړښت",
    "bs.subtitle": "د سازمان ونه، څانګې او استازولۍ اداره کړئ",
    "bs.treeTitle": "د جوړښت ونه",
    "bs.searchPlaceholder": "په جوړښت کې لټون…",
    "bs.newSubtree": "نوې څانګه",
    "bs.deleteBranch": "څانګه ړنګول",
    "bs.emptyTree": "تر اوسه جوړښت نه دی تعریف شوی",
    "bs.loadingTree": "جوړښت بارېږي…",
    "bs.selectNode": "تفصیل لیدلو لپاره یو ګوټ وټاکئ",
    "bs.addNode": "بچي زیاتول",
    "bs.addDisabledMax": "تر ټولو ژوره کچه (۴ پوړۍ) ډکه ده",
    "bs.mainTab": "اصلي ټاب",
    "bs.usersTab": "اجازه لرونکي کاروونکي",
    "bs.users.comingSoon": "د کاروونکو تړل به د IAM په فاز کې فعال شي",
    "bs.field.code": "کوډ",
    "bs.field.title": "عنوان",
    "bs.field.titleEn": "لاتین عنوان",
    "bs.field.type": "ډول",
    "bs.field.manager": "مدیر",
    "bs.field.logo": "نښه",
    "bs.field.isActive": "فعال حالت",
    "bs.field.isBasicInfoShared": "د بنسټیزو معلوماتو شریکول",
    "bs.field.shareHeadquarterData": "د مرکزي دفتر شریکو ډاټا کارول",
    "bs.field.activeStructureTypes": "اجازه لرونکي جوړښت ډوله",
    "bs.field.parent": "پلار",
    "bs.type.1": "هولډینګ",
    "bs.type.2": "شرکت",
    "bs.type.3": "څانګه",
    "bs.type.4": "استازولي",
    "bs.type.5": "پلورنځی",
    "bs.type.hq": "مرکزي دفتر",
    "bs.action.save": "خوندي کول",
    "bs.action.saveNew": "خوندي او نوی",
    "bs.action.saveClose": "خوندي او بندول",
    "bs.action.new": "نوی",
    "bs.action.delete": "ړنګول",
    "bs.msg.saved": "په بریالیتوب سره خوندي شو",
    "bs.msg.deleted": "څانګه ړنګه شوه",
    "bs.msg.deleteBlockedChildren": "دا ګوټ بچيان لري، ړنګېدلی نه شي",
    "bs.msg.deleteBlockedRoot": "مرکزي دفتر ړنګېدلی نه شي",
    "bs.msg.deleteBlockedSystem": "سیستمي ریکارډونه ړنګېدلی نه شي",
    "bs.msg.deleteConfirm": "ایا له دې ګوټ ړنګولو ډاډه یاست؟",
    "bs.msg.loadError": "د جوړښت په راوړولو کې تېروتنه",
    "bs.msg.saveError": "په خوندي کولو کې تېروتنه",
    "bs.val.titleRequired": "عنوان اړین دی",
    "bs.val.titleEnRequired": "لاتین (انګلیسي) عنوان اړین دی",
    "bs.val.typeRequired": "ډول ټاکنه اړینه ده",
    "bs.hint.codeAuto": "کوډ اتوماتیک جوړېږي",
    "bs.hint.latinTitle": "برابر لاتین عنوان ولیکئ",
    "bs.root.unionWarning": "د سیستم تعریف شویو جوړښتونو او ستاسو ټاکنې اتحاد تطبیقیږي",
    "settings.title": "تنظیمات",
    "settings.subtitle": "سیستم شخصي کول",
    "settings.appearance": "ښکارېدنه",
    "settings.light": "روښانه",
    "settings.dark": "تور",
    "settings.back": "بیرته",
    "settings.bsDesc": "هلدینګ، شرکت، څانګه، استازیتوب او پلورنځي کچې اداره کړه",
    "settings.umDesc": "کارنان، رولونه او د سیسټم د لاسرسي کچې اداره کول",
    "settings.umPending": "د کارن اداره کول له څو فورمو څخه جوړ دی؛ د تحلیل سند به وړاندې شي او فورمې به وروسته پلي شي.",
    "sidebar.title": "ټول توکي",
    "sidebar.toSidebar": "د اړخ مینو په توګه وښایه",
    "sidebar.toGrid": "انځورونه په ډیسکټاپ باندې وښایه",
    "sidebar.collapse": "مینو راټولول",
    "sidebar.expand": "مینو پراخول",
    "app.settings": "تنظیمات",
    "app.accounting": "حسابداري",
    "app.receiptsPayment": "رسیدونه او تادیات",
    "app.inventory": "ګدام",
    "app.sales": "پلورنه",
    "app.fixedAssets": "ثابتې شتمنۍ",
    "app.procurement": "تدارکات",
    "app.foreignOrders": "د بهر فرمایشونه",
    "app.costing": "د لګښتونو حسابداري",
    "app.materialDelivery": "د موادو د سپارنې کنټرول",
    "app.productionPlanning": "د تولید پلان جوړونه",
    "app.payroll": "معاشونه",
    "app.hr": "بشري سرچینې",
    "app.officeAutomation": "د دفتر اتوماسیون",
    "app.crm": "د پیرودونکو د اړیکو مدیریت",
    "app.advancedTools": "پرمختللي وسایل",
    "app.userManagement": "د کاروونکو مدیریت",
    "app.workflow": "د کار بهیر",
    "app.smsCenter": "د پیغامونو مرکز",
    "app.retailSales": "پرچون پلورنه",
    "app.marketingSales": "بازارموندنه او پلورنه",
    "app.coldDistribution": "سړ وېش",
    "app.hotDistribution": "ګرم وېش",
    "app.financialStatements": "مالي بیانیې",
    "app.businessIntelligence": "سوداګریزه ځیرکتیا",
    "app.maintenance": "ترمیم او ساتنه",
    "app.onlineWebsite": "آنلاین وېبسایټ",
    "app.general": "عمومي",
    "ph.awaitingBadge": "د شننې سند ته انتظار",
    "ph.awaitingBody": "د دې ماډل فورمې او فیلډونه لا تر اوسه تعریف شوي نه دي؛ کله چې یې د شننې سند وړاندې شي، ډیزاین او پلي کول په دقیق ډول د همدې سند له مخې ترسره کیږي.",
    "ph.secureApi": "د خدماتو خوندي اړیکه",
    "ph.infraStatus": "د زیربنا حالت",
    "ph.portLabel": "د خدمت پورټ",
    "ph.dbShared": "شریک ډاټابیس",
    "ph.dbDedicated": "جلا ډاټابیس",
    "ph.linkOk": "نښلول شوی (لاسلیک شوی)",
    "ph.linkFail": "لنډمهاله قطع",
    "ph.checking": "د خوندي اړیکې بررسی کیږي…",
    "ctx.open": "خلاصول",
    "ctx.pinTaskbar": "ټاسکبار ته پین کول",
    "ctx.unpinTaskbar": "له ټاسکبار لرې کول",
    "ctx.resetLayout": "د ډیسکټاپ ترتیب بیا راګرځول",
    "taskbar.dropHint": "د ټاسکبار پین کولو لپاره پرېږدئ",
    "taskbar.pinnedToast": "انځونکی ټاسکبار ته پین شو",
    "taskbar.unpinnedToast": "انځونکی له ټاسکبار لرې شو",
    "taskbar.alreadyPinned": "دا انځونکی لا له مخکې په ټاسکبار کې دی",
    "abar.reset": "د فورم ساحې بیا تنظیمول",
    "abar.save": "معلومات خوندي کول",
    "abar.saveNew": "خوندي کول او نوی",
    "abar.saveClose": "خوندي کول او بندول",
    "abar.copy": "د فورم معلومات کاپي کول",
    "abar.delete": "معلومات ړنګول",
    "abar.deleteNew": "ړنګول او نوی",
    "abar.deleteClose": "ړنګول او بندول",
    "abar.print": "د فورم چاپول",
    "abar.list": "د خوندي شویو ریکارډونو لیست",
    "abar.listEmpty": "د ښودلو لپاره کوم ریکارډ نشته",
    "abar.confirmDeleteTitle": "د ړنګولو تایید",
    "abar.confirmDeleteBody": "ایا له اوسني فورم د معلوماتو د ړنګولو ډاډه یاست؟ دا کړنه بېرته نه ګرځي.",
    "abar.demoTitle": "د فورم د کړنو پټه — د زیربنا مخکتنه",
    "abar.demoNote": "د شننې سند تر رارسیدو پورې له ریښتینو معلوماتو سره اتصال نشته؛ د تڼیو چلند په بېلګه ییزو معلوماتو ښودل کیږي.",
    "abar.resetToast": "د فورم ساحې بیا تنظیم شوې",
    "abar.savedToast": "معلومات په بریالیتوب سره خوندي شول",
    "abar.deletedToast": "معلومات ړنګ شول",
    "abar.itemOpened": "د ټاکل شوي ریکارډ معلومات په فورم کې خلاص شول",
    "abar.printToast": "فورم چاپګر ته ولېږل شو",
    "abar.copyToast": "د فورم معلومات د نوي ریکارډ لپاره کاپي شول",
    "abar.toolbar": "د فورم د کړنو پټه",
    "sft.noData": "معلومات نشته",
    "sft.addRow": "نوې کرښه اضافه کول",
    "sft.removeRow": "ټاکل شوې کرښه ړنګول",
    "sft.copyRows": "ټاکل شوې کرښه کاپي کول",
    "sft.first": "لومړی ریکارډ",
    "sft.prev": "پخوانی ریکارډ",
    "sft.next": "بل ریکارډ",
    "sft.last": "وروستی ریکارډ",
    "sft.help": "مرسته",
    "sft.selectPlaceholder": "ټاکل…",
    "stf.details": "جزئیات",
    "stf.iconLabel": "د ونې فورمه نمونه",
    "stf.geoTitle": "جغرافیايي ځایونه",
    "stf.iran": "ایران",
    "stf.tehranProvince": "د تهران ولایت",
    "stf.tehran": "تهران",
    "stf.alborz": "د البرز ولایت",
    "stf.karaj": "کرج",
    "stf.type": "نوع",
    "stf.latinTitle": "عنوان (لاتین)",
    "stf.optCountry": "هېواد",
    "stf.optProvince": "ولایت",
    "stf.optCity": "ښار",
    "fdf.title": "نوی پیرودونکی",
    "fdf.badge": "بېلګه",
    "fdf.iconLabel": "د فورم بېلګه",
    "fdf.code": "کوډ",
    "fdf.customerType": "د پیرودونکي ډول",
    "fdf.name": "عنوان",
    "fdf.customerGroup": "د پیرودونکو ډله",
    "fdf.balance": "بیلانس",
    "fdf.formStatus": "د فورم حالت",
    "fdf.effect": "اثر",
    "fdf.typeNormal": "عادي",
    "fdf.typeSpecial": "ځانګړی",
    "fdf.dirDirect": "مستقیم",
    "fdf.dirIndirect": "نامستقیم",
    "fdf.rial": "ایراني ریال",
    "fdf.debit": "پور",
    "fdf.active": "فعال",
    "fdf.tabAddresses": "پتې",
    "fdf.tabContacts": "اړیکې",
    "fdf.addrType": "د پتې ډول",
    "fdf.city": "ښار",
    "fdf.fullAddr": "بشپړه پته",
    "fdf.postal": "زیپ کوډ",
    "fdf.contactType": "د اړیکې ډول",
    "fdf.number": "شمېره",
    "fdf.notes": "یاددښتونه",
    "fdf.sampleName": "بېلګه ییز پیرودونکی"
};
const ckb = {
    ...en,
    "common.loading": "بارکردن…",
    "common.retry": "هەوڵی دووبارە",
    "common.close": "داخستن",
    "common.minimize": "بچووککردنەوە",
    "common.maximize": "گەورەکردن",
    "common.cancel": "پاشگەزبوونەوە",
    "common.save": "پاشکەوتکردن",
    "common.delete": "سڕینەوە",
    "common.confirm": "پشتڕاستکردنەوە",
    "common.all": "هەموو",
    "common.search": "گەڕان",
    "common.language": "زمان",
    "common.theme": "ڕووکار",
    "common.description": "وەسف",
    "common.error": "هەڵە",
    "app.name": "سیستەمی یەکگرتووی بازرگانی",
    "app.shortName": "بازرگانی",
    "taskbar.search": "گەڕان بۆ بەرنامە و ڕێکخستنەکان",
    "header.dashboard": "داشبۆرد",
    "header.search": "گەڕان لە داشبۆرد…",
    "header.dragHint": "بۆ جوڵاندنی سەرپەڕە ڕایبکێشە",
    "header.dockTop": "لە سەرەوە جێگیرکردن",
    "header.dockLeft": "لە چەپ جێگیرکردن",
    "header.dockRight": "لە ڕاست جێگیرکردن",
    "header.dropHint": "بۆ جێگیرکردنی سەرپەڕە لێرە رقی بکە",
    "startmenu.pinned": "چەسپێندراو",
    "startmenu.recommended": "پێشنیارکراو",
    "startmenu.searchPlaceholder": "بۆ گەڕان بنووسە…",
    "menus.general": "گشتی و ڕێکخستن",
    "menus.structural": "ڕێکخستنە پێکهاتەییەکان",
    "menus.businessStructure": "پێکهاتەی بازرگانی",
    "bs.title": "پێکهاتەی بازرگانی",
    "bs.subtitle": "بەڕێوەبردنی دارایی ڕێکخراو، لق و نوێنەرایەتی",
    "bs.treeTitle": "داری پێکهاتە",
    "bs.searchPlaceholder": "گەڕان لە پێکهاتە…",
    "bs.newSubtree": "لقێکی نوێ",
    "bs.deleteBranch": "سڕینەوەی لق",
    "bs.emptyTree": "هێشتا هیچ پێکهاتەیەک دیاری نەکراوە",
    "bs.loadingTree": "پێکهاتە بار دەکرێت…",
    "bs.selectNode": "بۆ بینینی وردەکاری گرێیەک هەڵبژێرە",
    "bs.addNode": "زیادکردنی منداڵ",
    "bs.addDisabledMax": "قووڵترین ئاست (٤ ئاست) پڕ بووە",
    "bs.mainTab": "تابی سەرەکی",
    "bs.usersTab": "بەکارهێنەرانی مۆڵەتپێدراو",
    "bs.users.comingSoon": "بەستنەوەی بەکارهێنەران لە قۆناغی IAM چالاک دەبێت",
    "bs.field.code": "کۆد",
    "bs.field.title": "ناونیشان",
    "bs.field.titleEn": "ناونیشانی لاتینی",
    "bs.field.type": "جۆر",
    "bs.field.manager": "بەرپرس",
    "bs.field.logo": "لۆگۆ",
    "bs.field.isActive": "چالاک",
    "bs.field.isBasicInfoShared": "هاوبەشی زانیاری بنەڕەتی",
    "bs.field.shareHeadquarterData": "بەکارهێنانی داتا هاوبەشەکانی بارەگای سەرەکی",
    "bs.field.activeStructureTypes": "جۆرە پێکهاتە ڕێگەپێدراوەکان",
    "bs.field.parent": "باوک",
    "bs.type.1": "هۆڵدینگ",
    "bs.type.2": "کۆمپانیا",
    "bs.type.3": "لق",
    "bs.type.4": "نوێنەرایەتی",
    "bs.type.5": "فروشگا",
    "bs.type.hq": "بارەگای سەرەکی",
    "bs.action.save": "پاشکەوتکردن",
    "bs.action.saveNew": "پاشکەوت و نوێ",
    "bs.action.saveClose": "پاشکەوت و داخستن",
    "bs.action.new": "نوێ",
    "bs.action.delete": "سڕینەوە",
    "bs.msg.saved": "بە سەرکەوتوویی پاشکەوتکرا",
    "bs.msg.deleted": "لق سڕدرایەوە",
    "bs.msg.deleteBlockedChildren": "ئەم گرێیە منداڵی هەیە، ناتوانرێت بسڕدرێتەوە",
    "bs.msg.deleteBlockedRoot": "بارەگای سەرەکی ناسڕدرێتەوە",
    "bs.msg.deleteBlockedSystem": "تۆمارە سیستمییەکان ناسڕدرێنەوە",
    "bs.msg.deleteConfirm": "دڵنیای لە سڕینەوەی ئەم گرێیە؟",
    "bs.msg.loadError": "هەڵە لە بارکردنی پێکهاتە",
    "bs.msg.saveError": "هەڵە لە پاشکەوتکردن",
    "bs.val.titleRequired": "ناونیشان پێویستە",
    "bs.val.titleEnRequired": "ناونیشانی لاتینی (ئینگلیزی) پێویستە",
    "bs.val.typeRequired": "هەڵبژاردنی جۆر پێویستە",
    "bs.hint.codeAuto": "کۆد بە شێوەی خۆکار دروست دەکرێت",
    "bs.hint.latinTitle": "ناونیشانی لاتینی هاوتا بنووسە",
    "bs.root.unionWarning": "یەکگرتنی پێکهاتە سیستمییەکان و هەڵبژاردنی جێبەجێ دەکرێت",
    "settings.title": "ڕێکخستنەکان",
    "settings.subtitle": "کەسایەندکردنی سیستەم",
    "settings.appearance": "دەرکەوتن",
    "settings.light": "ڕووناک",
    "settings.dark": "تاریک",
    "settings.back": "گەڕانەوە",
    "settings.bsDesc": "بەڕێوەبردنی ئاستەکانی هۆڵدینگ، کۆمپانیا، لق، نوێنەرایەتی و فرۆشگا",
    "settings.umDesc": "بەڕێوەبردنی بەکارهێنەران، ڕۆڵەکان و ئاستەکانی دەستپێگەیشتنی سیستەم",
    "settings.umPending": "بەڕێوەبردنی بەکارهێنەران لە چەند فۆرمێک پێکهاتووە؛ بەڵگەنامەی شیکاری دەخرێتەڕوو و فۆرمەکان دوای ئەوە جێبەجێ دەکرێن.",
    "sidebar.title": "هەموو بابەتەکان",
    "sidebar.toSidebar": "وەک مێنیوی لایەن پیشان بدە",
    "sidebar.toGrid": "وێنۆچکەکان لەسەر ڕێمێز پیشان بدە",
    "sidebar.collapse": "بچووککردنەوەی مێنیو",
    "sidebar.expand": "گەورەکردنەوەی مێنیو",
    "app.settings": "ڕێکخستنەکان",
    "app.accounting": "ژمێریاری",
    "app.receiptsPayment": "وەرگرتن و پارەدان",
    "app.inventory": "کۆگا",
    "app.sales": "فرۆشتن",
    "app.fixedAssets": "سامانەی جێگیر",
    "app.procurement": "دابینکردن",
    "app.foreignOrders": "داواکارییە بیروانییەکان",
    "app.costing": "ژمێریاری تێچوون",
    "app.materialDelivery": "کۆنترۆڵی گەیاندنی کەرەستە",
    "app.productionPlanning": "پلانکردنی بەرهەمهێنان",
    "app.payroll": "مووچەدان",
    "app.hr": "سەرچاوە مرۆییەکان",
    "app.officeAutomation": "ئۆتۆماسیۆنی ئۆفیس",
    "app.crm": "بەڕێوەبردنی پەیوەندی کڕیاران",
    "app.advancedTools": "ئامرازە پێشکەوتووەکان",
    "app.userManagement": "بەڕێوەبردنی بەکارهێنەران",
    "app.workflow": "ڕەوتی کار",
    "app.smsCenter": "ناوەندی پەیام",
    "app.retailSales": "فرۆشتنی تاکبەرد",
    "app.marketingSales": "بازاڕکردن و فرۆشتن",
    "app.coldDistribution": "دابەشکردنی سارد",
    "app.hotDistribution": "دابەشکردنی گەرم",
    "app.financialStatements": "ڕاگەیاندنی دارایی",
    "app.businessIntelligence": "زیرەکی بازرگانی",
    "app.maintenance": "چاککردن و پاراستن",
    "app.onlineWebsite": "ماڵپەری ئۆنلاین",
    "app.general": "گشتی",
    "ph.awaitingBadge": "چاوەڕوانی بەڵگەنامەی شیکاری",
    "ph.awaitingBody": "فۆرم و خانەکانی ئەم مۆدیولە هێشتا دیاری نەکراون؛ دوای پێشکەشکردنی بەڵگەنامەی شیکاری، دیزاین و جێبەجێکردن بە تەواوی بەپێی هەمان بەڵگەنامە ئەنجام دەدرێت.",
    "ph.secureApi": "پەیوەندی پارێزراوی خزمەتگوزارییەکان",
    "ph.infraStatus": "دۆخی ژێرخان",
    "ph.portLabel": "پۆرتی خزمەتگوزاری",
    "ph.dbShared": "بنکەدراوەی هاوبەش",
    "ph.dbDedicated": "بنکەدراوەی جیا",
    "ph.linkOk": "پەیوەستکراوە (واژۆکراوە)",
    "ph.linkFail": "پچەڕانی کاتی",
    "ph.checking": "پشکنینی پەیوەندی پارێزراو دەکرێت…",
    "ctx.open": "کردنەوە",
    "ctx.pinTaskbar": "چەسپاندن لە تەسکبار",
    "ctx.unpinTaskbar": "لابردن لە تەسکبار",
    "ctx.resetLayout": "ڕێکخستنەوەی دێسکتۆپ",
    "taskbar.dropHint": "داشکێنە بۆ چەسپاندن لە تەسکبار",
    "taskbar.pinnedToast": "ئایکۆنەکە لە تەسکبار چەسپێندرا",
    "taskbar.unpinnedToast": "ئایکۆنەکە لە تەسکبار دەرکرا",
    "taskbar.alreadyPinned": "ئەم ئایکۆنە پێشتر لە تەسکبار هەیە",
    "abar.reset": "ڕێکخستنەوەی خانەکانی فۆرم",
    "abar.save": "پاشەکەوتکردنی زانیارییەکان",
    "abar.saveNew": "پاشەکەوتکردن و نوێ",
    "abar.saveClose": "پاشەکەوتکردن و داخستن",
    "abar.copy": "لەبەرگرتنەوەی زانیارییەکانی فۆرم",
    "abar.delete": "سڕینەوەی زانیارییەکان",
    "abar.deleteNew": "سڕینەوە و نوێ",
    "abar.deleteClose": "سڕینەوە و داخستن",
    "abar.print": "چاپکردنی فۆرم",
    "abar.list": "لیستی تۆمارە پاشەکەوتکراوەکان",
    "abar.listEmpty": "هیچ تۆمارێک بۆ پیشاندان نییە",
    "abar.confirmDeleteTitle": "پشتڕاستکردنەوەی سڕینەوە",
    "abar.confirmDeleteBody": "دڵنیایت لە سڕینەوەی زانیارییەکانی فۆرمی ئێستا؟ ئەم کردارە ناگەڕێتەوە.",
    "abar.demoTitle": "پەڕەی کردارەکانی فۆرم — پێشبینینی ژێرخان",
    "abar.demoNote": "تا گەیشتنی بەڵگەنامەی شیکاری پەیوەندی بە زانیاری ڕاستەقینە نییە؛ ڕەفتاری دوگمەکان بە زانیاری نموونە پیشان دەدرێت.",
    "abar.resetToast": "خانەکانی فۆرم ڕێکخستنەوە کران",
    "abar.savedToast": "زانیارییەکان بە سەرکەوتوویی پاشەکەوت کران",
    "abar.deletedToast": "زانیارییەکان سڕانەوە",
    "abar.itemOpened": "زانیارییەکانی تۆمارە هەڵبژێردراوەکە لە فۆرم کرایەوە",
    "abar.printToast": "فۆرم نێردرا بۆ چاپکەر",
    "abar.copyToast": "زانیارییەکانی فۆرم بۆ تۆمارێکی نوێ لەبەرگیرانەوە",
    "abar.toolbar": "پەڕەی کردارەکانی فۆرم",
    "sft.noData": "هیچ داتایەک نییە",
    "sft.addRow": "زیادکردنی ڕیزێکی نوێ",
    "sft.removeRow": "سڕینەوەی ڕیزی هەڵبژێردراو",
    "sft.copyRows": "لەبەرگرتنەوەی ڕیزی هەڵبژێردراو",
    "sft.first": "یەکەم تۆمار",
    "sft.prev": "تۆماری پێشوو",
    "sft.next": "تۆماری داهاتوو",
    "sft.last": "دوا تۆمار",
    "sft.help": "یارمەتی",
    "sft.selectPlaceholder": "هەڵبژێرە…",
    "stf.details": "وردەکاری",
    "stf.iconLabel": "نموونەی دارەکی",
    "stf.geoTitle": "شوێنە جوگرافییەکان",
    "stf.iran": "ئێران",
    "stf.tehranProvince": "پارێزگای تاران",
    "stf.tehran": "تاران",
    "stf.alborz": "پارێزگای ئەلبۆرز",
    "stf.karaj": "کەرەج",
    "stf.type": "جۆر",
    "stf.latinTitle": "ناونیشان (لاتینی)",
    "stf.optCountry": "وڵات",
    "stf.optProvince": "پارێزگا",
    "stf.optCity": "شار",
    "fdf.title": "کڕیاری نوێ",
    "fdf.badge": "نموونە",
    "fdf.iconLabel": "نموونەی فۆرم",
    "fdf.code": "کۆد",
    "fdf.customerType": "جۆری کڕیار",
    "fdf.name": "ناونیشان",
    "fdf.customerGroup": "گرووپی کڕیاران",
    "fdf.balance": "باڵانس",
    "fdf.formStatus": "دۆخی فۆرم",
    "fdf.effect": "کاریگەری",
    "fdf.typeNormal": "ئاسایی",
    "fdf.typeSpecial": "تایبەت",
    "fdf.dirDirect": "ڕاستەوخۆ",
    "fdf.dirIndirect": "ناڕاستەوخۆ",
    "fdf.rial": "ڕیالی ئێران",
    "fdf.debit": "قەرز",
    "fdf.active": "چالاک",
    "fdf.tabAddresses": "ناونیشانەکان",
    "fdf.tabContacts": "پەیوەندییەکان",
    "fdf.addrType": "جۆری ناونیشان",
    "fdf.city": "شار",
    "fdf.fullAddr": "ناونیشانی تەواو",
    "fdf.postal": "کۆدی پۆست",
    "fdf.contactType": "جۆری پەیوەندی",
    "fdf.number": "ژمارە",
    "fdf.notes": "تێبینییەکان",
    "fdf.sampleName": "کڕیاری نموونە"
};
const pt = {
    ...en,
    "common.loading": "Carregando…",
    "common.retry": "Tentar novamente",
    "common.close": "Fechar",
    "common.minimize": "Minimizar",
    "common.maximize": "Maximizar",
    "common.cancel": "Cancelar",
    "common.save": "Salvar",
    "common.delete": "Excluir",
    "common.confirm": "Confirmar",
    "common.all": "Todos",
    "common.search": "Pesquisar",
    "common.language": "Idioma",
    "common.theme": "Tema",
    "common.description": "Descrição",
    "common.error": "Erro",
    "app.name": "ERP Comercial Unificado",
    "app.shortName": "Comércio",
    "taskbar.search": "Pesquisar apps e configurações",
    "header.dashboard": "Painel",
    "header.search": "Pesquisar no painel…",
    "header.dragHint": "Arraste para mover o cabeçalho",
    "header.dockTop": "Ancorar no topo",
    "header.dockLeft": "Ancorar à esquerda",
    "header.dockRight": "Ancorar à direita",
    "header.dropHint": "Solte para ancorar o cabeçalho aqui",
    "startmenu.pinned": "Fixados",
    "startmenu.recommended": "Recomendados",
    "startmenu.searchPlaceholder": "Digite para pesquisar…",
    "menus.general": "Geral e Configurações",
    "menus.structural": "Configurações Estruturais",
    "menus.businessStructure": "Estrutura de Negócio",
    "bs.title": "Estrutura de Negócio",
    "bs.subtitle": "Gerencie a árvore organizacional, filiais e agências",
    "bs.treeTitle": "Árvore da Estrutura",
    "bs.searchPlaceholder": "Pesquisar na estrutura…",
    "bs.newSubtree": "Nova subárvore",
    "bs.deleteBranch": "Excluir ramo",
    "bs.emptyTree": "Nenhuma estrutura definida ainda",
    "bs.loadingTree": "Carregando estrutura…",
    "bs.selectNode": "Selecione um nó para ver os detalhes",
    "bs.addNode": "Adicionar filho",
    "bs.addDisabledMax": "Profundidade máxima (4 níveis) atingida",
    "bs.mainTab": "Aba Principal",
    "bs.usersTab": "Usuários Autorizados",
    "bs.users.comingSoon": "A vinculação de usuários será ativada na fase IAM",
    "bs.field.code": "Código",
    "bs.field.title": "Título",
    "bs.field.titleEn": "Título Latino",
    "bs.field.type": "Tipo",
    "bs.field.manager": "Gerente",
    "bs.field.logo": "Logotipo",
    "bs.field.isActive": "Ativo",
    "bs.field.isBasicInfoShared": "Compartilhar informações básicas",
    "bs.field.shareHeadquarterData": "Usar dados compartilhados da matriz",
    "bs.field.activeStructureTypes": "Tipos de estrutura permitidos",
    "bs.field.parent": "Pai",
    "bs.type.1": "Holding",
    "bs.type.2": "Empresa",
    "bs.type.3": "Filial",
    "bs.type.4": "Agência",
    "bs.type.5": "Loja",
    "bs.type.hq": "Matriz",
    "bs.action.save": "Salvar",
    "bs.action.saveNew": "Salvar e Novo",
    "bs.action.saveClose": "Salvar e Fechar",
    "bs.action.new": "Novo",
    "bs.action.delete": "Excluir",
    "bs.msg.saved": "Salvo com sucesso",
    "bs.msg.deleted": "Ramo excluído",
    "bs.msg.deleteBlockedChildren": "Este nó possui filhos e não pode ser excluído",
    "bs.msg.deleteBlockedRoot": "A matriz não pode ser excluída",
    "bs.msg.deleteBlockedSystem": "Registros do sistema não podem ser excluídos",
    "bs.msg.deleteConfirm": "Tem certeza de que deseja excluir este nó?",
    "bs.msg.loadError": "Falha ao carregar a estrutura",
    "bs.msg.saveError": "Falha ao salvar",
    "bs.val.titleRequired": "O título é obrigatório",
    "bs.val.titleEnRequired": "O título latino (inglês) é obrigatório",
    "bs.val.typeRequired": "A seleção do tipo é obrigatória",
    "bs.hint.codeAuto": "O código é gerado automaticamente",
    "bs.hint.latinTitle": "Informe o título latino equivalente",
    "bs.root.unionWarning": "A união das estruturas definidas pelo sistema e sua seleção será aplicada",
    "settings.title": "Configurações",
    "settings.subtitle": "Personalize o sistema",
    "settings.appearance": "Aparência",
    "settings.light": "Claro",
    "settings.dark": "Escuro",
    "settings.back": "Voltar",
    "settings.bsDesc": "Gerencie os níveis de holding, empresa, filial, agência e loja",
    "settings.umDesc": "Gerencie usuários, papéis e níveis de acesso do sistema",
    "settings.umPending": "A Gestão de Usuários consiste em vários formulários; o documento de análise será fornecido e os formulários serão implementados depois.",
    "sidebar.title": "Todos os itens",
    "sidebar.toSidebar": "Mostrar como menu lateral",
    "sidebar.toGrid": "Mostrar ícones na área de trabalho",
    "sidebar.collapse": "Recolher menu",
    "sidebar.expand": "Expandir menu",
    "app.settings": "Configurações",
    "app.accounting": "Contabilidade",
    "app.receiptsPayment": "Recebimentos e Pagamentos",
    "app.inventory": "Almoxarifado",
    "app.sales": "Vendas",
    "app.fixedAssets": "Ativos Fixos",
    "app.procurement": "Suprimentos",
    "app.foreignOrders": "Pedidos do Exterior",
    "app.costing": "Contabilidade de Custos",
    "app.materialDelivery": "Controle de Entrega de Materiais",
    "app.productionPlanning": "Planejamento de Produção",
    "app.payroll": "Folha de Pagamento",
    "app.hr": "Recursos Humanos",
    "app.officeAutomation": "Automação de Escritório",
    "app.crm": "Relacionamento com Clientes",
    "app.advancedTools": "Ferramentas Avançadas",
    "app.userManagement": "Gerenciamento de Usuários",
    "app.workflow": "Fluxo de Trabalho",
    "app.smsCenter": "Central de SMS",
    "app.retailSales": "Vendas no Varejo",
    "app.marketingSales": "Marketing e Vendas",
    "app.coldDistribution": "Distribuição Fria",
    "app.hotDistribution": "Distribuição Quente",
    "app.financialStatements": "Demonstrações Financeiras",
    "app.businessIntelligence": "Inteligência de Negócios",
    "app.maintenance": "Manutenção",
    "app.onlineWebsite": "Site Online",
    "app.general": "Geral",
    "ph.awaitingBadge": "Aguardando documento de análise",
    "ph.awaitingBody": "Os formulários e campos deste módulo ainda não foram definidos; quando o documento de análise for fornecido, o design e a implementação seguirão exatamente esse documento.",
    "ph.secureApi": "Conectividade segura de serviços",
    "ph.infraStatus": "Status da infraestrutura",
    "ph.portLabel": "Porta do serviço",
    "ph.dbShared": "Banco de dados compartilhado",
    "ph.dbDedicated": "Banco de dados dedicado",
    "ph.linkOk": "Conectado (assinado)",
    "ph.linkFail": "Indisponível temporariamente",
    "ph.checking": "Verificando conexão segura…",
    "ctx.open": "Abrir",
    "ctx.pinTaskbar": "Fixar na barra de tarefas",
    "ctx.unpinTaskbar": "Desafixar da barra de tarefas",
    "ctx.resetLayout": "Redefinir layout da área de trabalho",
    "taskbar.dropHint": "Solte para fixar na barra de tarefas",
    "taskbar.pinnedToast": "Ícone fixado na barra de tarefas",
    "taskbar.unpinnedToast": "Ícone removido da barra de tarefas",
    "taskbar.alreadyPinned": "Este ícone já está na barra de tarefas",
    "abar.reset": "Redefinir campos do formulário",
    "abar.save": "Salvar dados",
    "abar.saveNew": "Salvar e novo",
    "abar.saveClose": "Salvar e fechar",
    "abar.copy": "Copiar dados do formulário",
    "abar.delete": "Excluir dados",
    "abar.deleteNew": "Excluir e novo",
    "abar.deleteClose": "Excluir e fechar",
    "abar.print": "Imprimir formulário",
    "abar.list": "Lista de registros salvos",
    "abar.listEmpty": "Nenhum registro para exibir",
    "abar.confirmDeleteTitle": "Confirmar exclusão",
    "abar.confirmDeleteBody": "Tem certeza de que deseja excluir os dados do formulário atual? Esta ação não pode ser desfeita.",
    "abar.demoTitle": "Barra de ações do formulário — visualização da infraestrutura",
    "abar.demoNote": "Até a chegada do documento de análise não há conexão com dados reais; o comportamento dos botões é exibido com dados de exemplo.",
    "abar.resetToast": "Os campos do formulário foram redefinidos",
    "abar.savedToast": "Dados salvos com sucesso",
    "abar.deletedToast": "Dados excluídos",
    "abar.itemOpened": "Os dados do registro selecionado foram abertos no formulário",
    "abar.printToast": "Formulário enviado para a impressora",
    "abar.copyToast": "Dados do formulário copiados para um novo registro",
    "abar.toolbar": "Barra de ações do formulário",
    "sft.noData": "Nenhum dado disponível",
    "sft.addRow": "Adicionar nova linha",
    "sft.removeRow": "Excluir linha selecionada",
    "sft.copyRows": "Copiar linha selecionada",
    "sft.first": "Primeiro registro",
    "sft.prev": "Registro anterior",
    "sft.next": "Próximo registro",
    "sft.last": "Último registro",
    "sft.help": "Ajuda",
    "sft.selectPlaceholder": "Selecionar…",
    "stf.details": "Detalhes",
    "stf.iconLabel": "Exemplo de Formulário em Árvore",
    "stf.geoTitle": "Localizações Geográficas",
    "stf.iran": "Irã",
    "stf.tehranProvince": "Província de Teerã",
    "stf.tehran": "Teerã",
    "stf.alborz": "Província de Alborz",
    "stf.karaj": "Karaj",
    "stf.type": "Tipo",
    "stf.latinTitle": "Título em Latim",
    "stf.optCountry": "País",
    "stf.optProvince": "Província",
    "stf.optCity": "Cidade",
    "fdf.title": "Novo Cliente",
    "fdf.badge": "Exemplo",
    "fdf.iconLabel": "Exemplo de Formulário",
    "fdf.code": "Código",
    "fdf.customerType": "Tipo de cliente",
    "fdf.name": "Título",
    "fdf.customerGroup": "Grupo de clientes",
    "fdf.balance": "Saldo",
    "fdf.formStatus": "Situação do formulário",
    "fdf.effect": "Efeito",
    "fdf.typeNormal": "Normal",
    "fdf.typeSpecial": "Especial",
    "fdf.dirDirect": "Direto",
    "fdf.dirIndirect": "Indireto",
    "fdf.rial": "Rial iraniano",
    "fdf.debit": "Devedor",
    "fdf.active": "Ativo",
    "fdf.tabAddresses": "Endereços",
    "fdf.tabContacts": "Contatos",
    "fdf.addrType": "Tipo de endereço",
    "fdf.city": "Cidade",
    "fdf.fullAddr": "Endereço completo",
    "fdf.postal": "Código postal",
    "fdf.contactType": "Tipo de contato",
    "fdf.number": "Número",
    "fdf.notes": "Observações",
    "fdf.sampleName": "Cliente de exemplo"
};
const ko = {
    ...en,
    "common.loading": "로드 중…",
    "common.retry": "다시 시도",
    "common.close": "닫기",
    "common.minimize": "최소화",
    "common.maximize": "최대화",
    "common.cancel": "취소",
    "common.save": "저장",
    "common.delete": "삭제",
    "common.confirm": "확인",
    "common.all": "전체",
    "common.search": "검색",
    "common.language": "언어",
    "common.theme": "테마",
    "common.description": "설명",
    "common.error": "오류",
    "app.name": "통합 상거래 ERP",
    "app.shortName": "상거래",
    "taskbar.search": "앱 및 설정 검색",
    "header.dashboard": "대시보드",
    "header.search": "대시보드 검색…",
    "header.dragHint": "헤더를 이동하려면 끌어세요",
    "header.dockTop": "상단에 도킹",
    "header.dockLeft": "왼쪽에 도킹",
    "header.dockRight": "오른쪽에 도킹",
    "header.dropHint": "여기에 헤더를 고정하려면 놓으세요",
    "startmenu.pinned": "고정됨",
    "startmenu.recommended": "추천",
    "startmenu.searchPlaceholder": "검색하려면 입력…",
    "menus.general": "일반 및 설정",
    "menus.structural": "구조 설정",
    "menus.businessStructure": "비즈니스 구조",
    "bs.title": "비즈니스 구조",
    "bs.subtitle": "조직 트리, 지점 및 대리점 관리",
    "bs.treeTitle": "구조 트리",
    "bs.searchPlaceholder": "구조 검색…",
    "bs.newSubtree": "새 하위 트리",
    "bs.deleteBranch": "분기 삭제",
    "bs.emptyTree": "아직 정의된 구조가 없습니다",
    "bs.loadingTree": "구조 로드 중…",
    "bs.selectNode": "세부 정보를 보려면 노드를 선택하세요",
    "bs.addNode": "하위 추가",
    "bs.addDisabledMax": "최대 깊이(4단계)에 도달했습니다",
    "bs.mainTab": "기본 탭",
    "bs.usersTab": "권한 있는 사용자",
    "bs.users.comingSoon": "사용자 연결은 IAM 단계에서 활성화됩니다",
    "bs.field.code": "코드",
    "bs.field.title": "제목",
    "bs.field.titleEn": "라틴 제목",
    "bs.field.type": "유형",
    "bs.field.manager": "관리자",
    "bs.field.logo": "로고",
    "bs.field.isActive": "활성",
    "bs.field.isBasicInfoShared": "기본 정보 공유",
    "bs.field.shareHeadquarterData": "본사 공유 데이터 사용",
    "bs.field.activeStructureTypes": "허용된 구조 유형",
    "bs.field.parent": "상위",
    "bs.type.1": "홀딩스",
    "bs.type.2": "회사",
    "bs.type.3": "지점",
    "bs.type.4": "대리점",
    "bs.type.5": "상점",
    "bs.type.hq": "본사",
    "bs.action.save": "저장",
    "bs.action.saveNew": "저장 후 신규",
    "bs.action.saveClose": "저장 후 닫기",
    "bs.action.new": "신규",
    "bs.action.delete": "삭제",
    "bs.msg.saved": "성공적으로 저장되었습니다",
    "bs.msg.deleted": "분기가 삭제되었습니다",
    "bs.msg.deleteBlockedChildren": "이 노드에는 하위가 있어 삭제할 수 없습니다",
    "bs.msg.deleteBlockedRoot": "본사는 삭제할 수 없습니다",
    "bs.msg.deleteBlockedSystem": "시스템 레코드는 삭제할 수 없습니다",
    "bs.msg.deleteConfirm": "이 노드를 삭제하시겠습니까?",
    "bs.msg.loadError": "구조를 로드하지 못했습니다",
    "bs.msg.saveError": "저장하지 못했습니다",
    "bs.val.titleRequired": "제목은 필수입니다",
    "bs.val.titleEnRequired": "라틴(영문) 제목은 필수입니다",
    "bs.val.typeRequired": "유형 선택은 필수입니다",
    "bs.hint.codeAuto": "코드는 자동 생성됩니다",
    "bs.hint.latinTitle": "동등한 라틴 제목을 입력하세요",
    "bs.root.unionWarning": "시스템 정의 구조와 선택 항목의 합집합이 적용됩니다",
    "settings.title": "설정",
    "settings.subtitle": "시스템 개인 설정",
    "settings.appearance": "모양",
    "settings.light": "라이트",
    "settings.dark": "다크",
    "settings.back": "뒤로",
    "settings.bsDesc": "홀딩, 회사, 지점, 대리점 및 상점 수준을 관리합니다",
    "settings.umDesc": "사용자, 역할 및 시스템 액세스 수준 관리",
    "settings.umPending": "사용자 관리는 여러 양식으로 구성됩니다. 분석 문서가 제공되면 양식이 그 이후에 구현됩니다.",
    "sidebar.title": "모든 항목",
    "sidebar.toSidebar": "사이드바 메뉴로 표시",
    "sidebar.toGrid": "바탕화면에 아이콘 표시",
    "sidebar.collapse": "메뉴 접기",
    "sidebar.expand": "메뉴 펼치기",
    "app.settings": "설정",
    "app.accounting": "회계",
    "app.receiptsPayment": "수금 및 지급",
    "app.inventory": "창고",
    "app.sales": "영업",
    "app.fixedAssets": "고정자산",
    "app.procurement": "구매",
    "app.foreignOrders": "해외 주문",
    "app.costing": "원가회계",
    "app.materialDelivery": "자재 납품 관리",
    "app.productionPlanning": "생산 계획",
    "app.payroll": "급여",
    "app.hr": "인사",
    "app.officeAutomation": "사무 자동화",
    "app.crm": "고객 관계 관리",
    "app.advancedTools": "고급 도구",
    "app.userManagement": "사용자 관리",
    "app.workflow": "워크플로",
    "app.smsCenter": "SMS 센터",
    "app.retailSales": "소매 판매",
    "app.marketingSales": "마케팅 및 영업",
    "app.coldDistribution": "콜드 유통",
    "app.hotDistribution": "핫 유통",
    "app.financialStatements": "재무제표",
    "app.businessIntelligence": "비즈니스 인텔리전스",
    "app.maintenance": "유지보수",
    "app.onlineWebsite": "온라인 웹사이트",
    "app.general": "일반",
    "ph.awaitingBadge": "분석 문서 대기 중",
    "ph.awaitingBody": "이 모듈의 양식과 필드는 아직 정의되지 않았습니다. 분석 문서가 제공되면 해당 문서에 따라 정확히 설계 및 구현됩니다.",
    "ph.secureApi": "보안 서비스 연결",
    "ph.infraStatus": "인프라 상태",
    "ph.portLabel": "서비스 포트",
    "ph.dbShared": "공유 데이터베이스",
    "ph.dbDedicated": "전용 데이터베이스",
    "ph.linkOk": "연결됨 (서명됨)",
    "ph.linkFail": "일시적 연결 끊김",
    "ph.checking": "보안 연결 확인 중…",
    "ctx.open": "열기",
    "ctx.pinTaskbar": "작업 표시줄에 고정",
    "ctx.unpinTaskbar": "작업 표시줄에서 고정 해제",
    "ctx.resetLayout": "바탕 화면 레이아웃 초기화",
    "taskbar.dropHint": "작업 표시줄에 고정하려면 놓으세요",
    "taskbar.pinnedToast": "아이콘이 작업 표시줄에 고정되었습니다",
    "taskbar.unpinnedToast": "아이콘이 작업 표시줄에서 제거되었습니다",
    "taskbar.alreadyPinned": "이 아이콘은 이미 작업 표시줄에 있습니다",
    "abar.reset": "양식 필드 초기화",
    "abar.save": "데이터 저장",
    "abar.saveNew": "저장 후 새로 만들기",
    "abar.saveClose": "저장 후 닫기",
    "abar.copy": "양식 데이터 복사",
    "abar.delete": "데이터 삭제",
    "abar.deleteNew": "삭제 후 새로 만들기",
    "abar.deleteClose": "삭제 후 닫기",
    "abar.print": "양식 인쇄",
    "abar.list": "저장된 레코드 목록",
    "abar.listEmpty": "표시할 레코드가 없습니다",
    "abar.confirmDeleteTitle": "삭제 확인",
    "abar.confirmDeleteBody": "현재 양식 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    "abar.demoTitle": "양식 작업 모음 — 인프라 미리 보기",
    "abar.demoNote": "분석 문서가 제공될 때까지는 실제 데이터 연결이 없으며, 단추 동작은 샘플 데이터로 표시됩니다.",
    "abar.resetToast": "양식 필드가 초기화되었습니다",
    "abar.savedToast": "데이터가 성공적으로 저장되었습니다",
    "abar.deletedToast": "데이터가 삭제되었습니다",
    "abar.itemOpened": "선택한 레코드의 데이터가 양식에서 열렸습니다",
    "abar.printToast": "양식이 프린터로 전송되었습니다",
    "abar.copyToast": "새 레코드를 위해 양식 데이터가 복사되었습니다",
    "abar.toolbar": "양식 작업 모음",
    "sft.noData": "데이터가 없습니다",
    "sft.addRow": "새 행 추가",
    "sft.removeRow": "선택한 행 삭제",
    "sft.copyRows": "선택한 행 복사",
    "sft.first": "첫 레코드",
    "sft.prev": "이전 레코드",
    "sft.next": "다음 레코드",
    "sft.last": "마지막 레코드",
    "sft.help": "도움말",
    "sft.selectPlaceholder": "선택…",
    "stf.details": "상세",
    "stf.iconLabel": "트리 양식 샘플",
    "stf.geoTitle": "지리적 위치",
    "stf.iran": "이란",
    "stf.tehranProvince": "테헤란 주",
    "stf.tehran": "테헤란",
    "stf.alborz": "알보르즈 주",
    "stf.karaj": "카라지",
    "stf.type": "유형",
    "stf.latinTitle": "라틴어 제목",
    "stf.optCountry": "국가",
    "stf.optProvince": "주",
    "stf.optCity": "도시",
    "fdf.title": "신규 고객",
    "fdf.badge": "샘플",
    "fdf.iconLabel": "양식 샘플",
    "fdf.code": "코드",
    "fdf.customerType": "고객 유형",
    "fdf.name": "제목",
    "fdf.customerGroup": "고객 그룹",
    "fdf.balance": "잔액",
    "fdf.formStatus": "양식 상태",
    "fdf.effect": "효과",
    "fdf.typeNormal": "일반",
    "fdf.typeSpecial": "특별",
    "fdf.dirDirect": "직접",
    "fdf.dirIndirect": "간접",
    "fdf.rial": "이란 리알",
    "fdf.debit": "차변",
    "fdf.active": "활성",
    "fdf.tabAddresses": "주소",
    "fdf.tabContacts": "연락처",
    "fdf.addrType": "주소 유형",
    "fdf.city": "도시",
    "fdf.fullAddr": "전체 주소",
    "fdf.postal": "우편번호",
    "fdf.contactType": "연락 유형",
    "fdf.number": "번호",
    "fdf.notes": "메모",
    "fdf.sampleName": "샘플 고객"
};
const fr = {
    ...en,
    "common.loading": "Chargement…",
    "common.retry": "Réessayer",
    "common.close": "Fermer",
    "common.minimize": "Réduire",
    "common.maximize": "Agrandir",
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.delete": "Supprimer",
    "common.confirm": "Confirmer",
    "common.all": "Tous",
    "common.search": "Rechercher",
    "common.language": "Langue",
    "common.theme": "Thème",
    "common.description": "Description",
    "common.error": "Erreur",
    "app.name": "ERP Commercial Unifié",
    "app.shortName": "Commerce",
    "taskbar.search": "Rechercher applications et paramètres",
    "header.dashboard": "Tableau de bord",
    "header.search": "Rechercher dans le tableau de bord…",
    "header.dragHint": "Faites glisser pour déplacer l'en-tête",
    "header.dockTop": "Ancrer en haut",
    "header.dockLeft": "Ancrer à gauche",
    "header.dockRight": "Ancrer à droite",
    "header.dropHint": "Relâchez pour ancrer l'en-tête ici",
    "startmenu.pinned": "Épinglés",
    "startmenu.recommended": "Recommandés",
    "startmenu.searchPlaceholder": "Tapez pour rechercher…",
    "menus.general": "Général et Paramètres",
    "menus.structural": "Paramètres Structurels",
    "menus.businessStructure": "Structure d'Entreprise",
    "bs.title": "Structure d'Entreprise",
    "bs.subtitle": "Gérez l'arborescence, les succursales et les agences",
    "bs.treeTitle": "Arborescence",
    "bs.searchPlaceholder": "Rechercher dans la structure…",
    "bs.newSubtree": "Nouvelle sous-arborescence",
    "bs.deleteBranch": "Supprimer la branche",
    "bs.emptyTree": "Aucune structure définie",
    "bs.loadingTree": "Chargement de la structure…",
    "bs.selectNode": "Sélectionnez un nœud pour voir les détails",
    "bs.addNode": "Ajouter un enfant",
    "bs.addDisabledMax": "Profondeur maximale (4 niveaux) atteinte",
    "bs.mainTab": "Onglet principal",
    "bs.usersTab": "Utilisateurs autorisés",
    "bs.users.comingSoon": "Le rattachement des utilisateurs sera activé en phase IAM",
    "bs.field.code": "Code",
    "bs.field.title": "Titre",
    "bs.field.titleEn": "Titre latin",
    "bs.field.type": "Type",
    "bs.field.manager": "Responsable",
    "bs.field.logo": "Logo",
    "bs.field.isActive": "Actif",
    "bs.field.isBasicInfoShared": "Partager les infos de base",
    "bs.field.shareHeadquarterData": "Utiliser les données partagées du siège",
    "bs.field.activeStructureTypes": "Types de structure autorisés",
    "bs.field.parent": "Parent",
    "bs.type.1": "Holding",
    "bs.type.2": "Société",
    "bs.type.3": "Succursale",
    "bs.type.4": "Agence",
    "bs.type.5": "Magasin",
    "bs.type.hq": "Siège social",
    "bs.action.save": "Enregistrer",
    "bs.action.saveNew": "Enregistrer et nouveau",
    "bs.action.saveClose": "Enregistrer et fermer",
    "bs.action.new": "Nouveau",
    "bs.action.delete": "Supprimer",
    "bs.msg.saved": "Enregistré avec succès",
    "bs.msg.deleted": "Branche supprimée",
    "bs.msg.deleteBlockedChildren": "Ce nœud a des enfants et ne peut pas être supprimé",
    "bs.msg.deleteBlockedRoot": "Le siège social ne peut pas être supprimé",
    "bs.msg.deleteBlockedSystem": "Les enregistrements système ne peuvent pas être supprimés",
    "bs.msg.deleteConfirm": "Voulez-vous vraiment supprimer ce nœud ?",
    "bs.msg.loadError": "Échec du chargement de la structure",
    "bs.msg.saveError": "Échec de l'enregistrement",
    "bs.val.titleRequired": "Le titre est obligatoire",
    "bs.val.titleEnRequired": "Le titre latin (anglais) est obligatoire",
    "bs.val.typeRequired": "La sélection du type est obligatoire",
    "bs.hint.codeAuto": "Le code est généré automatiquement",
    "bs.hint.latinTitle": "Saisissez le titre latin équivalent",
    "bs.root.unionWarning": "L'union des structures définies par le système et votre sélection sera appliquée",
    "settings.title": "Paramètres",
    "settings.subtitle": "Personnalisez le système",
    "settings.appearance": "Apparence",
    "settings.light": "Clair",
    "settings.dark": "Sombre",
    "settings.back": "Retour",
    "settings.bsDesc": "Gérez les niveaux holding, société, branche, agence et magasin",
    "settings.umDesc": "Gérez les utilisateurs, les rôles et les niveaux d'accès du système",
    "settings.umPending": "La gestion des utilisateurs se compose de plusieurs formulaires ; le document d'analyse sera fourni et les formulaires seront implémentés ensuite.",
    "sidebar.title": "Tous les éléments",
    "sidebar.toSidebar": "Afficher comme menu latéral",
    "sidebar.toGrid": "Afficher les icônes sur le bureau",
    "sidebar.collapse": "Réduire le menu",
    "sidebar.expand": "Développer le menu",
    "app.settings": "Paramètres",
    "app.accounting": "Comptabilité",
    "app.receiptsPayment": "Reçus et Paiements",
    "app.inventory": "Entrepôt",
    "app.sales": "Ventes",
    "app.fixedAssets": "Immobilisations",
    "app.procurement": "Achats",
    "app.foreignOrders": "Commandes étrangères",
    "app.costing": "Comptabilité des coûts",
    "app.materialDelivery": "Contrôle livraison matières",
    "app.productionPlanning": "Planification de production",
    "app.payroll": "Paie",
    "app.hr": "Ressources Humaines",
    "app.officeAutomation": "Bureautique",
    "app.crm": "Gestion relation client",
    "app.advancedTools": "Outils avancés",
    "app.userManagement": "Gestion des utilisateurs",
    "app.workflow": "Flux de travail",
    "app.smsCenter": "Centre SMS",
    "app.retailSales": "Ventes au détail",
    "app.marketingSales": "Marketing et Ventes",
    "app.coldDistribution": "Distribution froide",
    "app.hotDistribution": "Distribution chaude",
    "app.financialStatements": "États financiers",
    "app.businessIntelligence": "Informatique décisionnelle",
    "app.maintenance": "Maintenance",
    "app.onlineWebsite": "Site web en ligne",
    "app.general": "Général",
    "ph.awaitingBadge": "En attente du document d'analyse",
    "ph.awaitingBody": "Les formulaires et les champs de ce module ne sont pas encore définis ; une fois son document d'analyse fourni, la conception et l'implémentation suivront exactement ce document.",
    "ph.secureApi": "Connectivité sécurisée des services",
    "ph.infraStatus": "État de l'infrastructure",
    "ph.portLabel": "Port du service",
    "ph.dbShared": "Base de données partagée",
    "ph.dbDedicated": "Base de données dédiée",
    "ph.linkOk": "Connecté (signé)",
    "ph.linkFail": "Temporairement inaccessible",
    "ph.checking": "Vérification de la connexion sécurisée…",
    "ctx.open": "Ouvrir",
    "ctx.pinTaskbar": "Épingler à la barre des tâches",
    "ctx.unpinTaskbar": "Désépingler de la barre des tâches",
    "ctx.resetLayout": "Réinitialiser la disposition du bureau",
    "taskbar.dropHint": "Déposez pour épingler à la barre des tâches",
    "taskbar.pinnedToast": "Icône épinglée à la barre des tâches",
    "taskbar.unpinnedToast": "Icône retirée de la barre des tâches",
    "taskbar.alreadyPinned": "Cette icône est déjà dans la barre des tâches",
    "abar.reset": "Réinitialiser les champs du formulaire",
    "abar.save": "Enregistrer les données",
    "abar.saveNew": "Enregistrer et nouveau",
    "abar.saveClose": "Enregistrer et fermer",
    "abar.copy": "Copier les données du formulaire",
    "abar.delete": "Supprimer les données",
    "abar.deleteNew": "Supprimer et nouveau",
    "abar.deleteClose": "Supprimer et fermer",
    "abar.print": "Imprimer le formulaire",
    "abar.list": "Liste des enregistrements enregistrés",
    "abar.listEmpty": "Aucun enregistrement à afficher",
    "abar.confirmDeleteTitle": "Confirmer la suppression",
    "abar.confirmDeleteBody": "Voulez-vous vraiment supprimer les données du formulaire actuel ? Cette action est irréversible.",
    "abar.demoTitle": "Barre d'actions du formulaire — aperçu de l'infrastructure",
    "abar.demoNote": "Jusqu'à l'arrivée du document d'analyse, il n'y a pas de connexion aux données réelles ; le comportement des boutons est illustré avec des données d'exemple.",
    "abar.resetToast": "Les champs du formulaire ont été réinitialisés",
    "abar.savedToast": "Données enregistrées avec succès",
    "abar.deletedToast": "Données supprimées",
    "abar.itemOpened": "Les données de l'enregistrement sélectionné ont été ouvertes dans le formulaire",
    "abar.printToast": "Formulaire envoyé à l'imprimante",
    "abar.copyToast": "Données du formulaire copiées pour un nouvel enregistrement",
    "abar.toolbar": "Barre d'actions du formulaire",
    "sft.noData": "Aucune donnée disponible",
    "sft.addRow": "Ajouter une nouvelle ligne",
    "sft.removeRow": "Supprimer la ligne sélectionnée",
    "sft.copyRows": "Copier la ligne sélectionnée",
    "sft.first": "Premier enregistrement",
    "sft.prev": "Enregistrement précédent",
    "sft.next": "Enregistrement suivant",
    "sft.last": "Dernier enregistrement",
    "sft.help": "Aide",
    "sft.selectPlaceholder": "Sélectionner…",
    "stf.details": "Détails",
    "stf.iconLabel": "Exemple de formulaire arborescent",
    "stf.geoTitle": "Localisations géographiques",
    "stf.iran": "Iran",
    "stf.tehranProvince": "Province de Téhéran",
    "stf.tehran": "Téhéran",
    "stf.alborz": "Province d'Alborz",
    "stf.karaj": "Karaj",
    "stf.type": "Type",
    "stf.latinTitle": "Titre latin",
    "stf.optCountry": "Pays",
    "stf.optProvince": "Province",
    "stf.optCity": "Ville",
    "fdf.title": "Nouveau client",
    "fdf.badge": "Exemple",
    "fdf.iconLabel": "Exemple de formulaire",
    "fdf.code": "Code",
    "fdf.customerType": "Type de client",
    "fdf.name": "Titre",
    "fdf.customerGroup": "Groupe de clients",
    "fdf.balance": "Solde",
    "fdf.formStatus": "Statut du formulaire",
    "fdf.effect": "Effet",
    "fdf.typeNormal": "Normal",
    "fdf.typeSpecial": "Spécial",
    "fdf.dirDirect": "Direct",
    "fdf.dirIndirect": "Indirect",
    "fdf.rial": "Rial iranien",
    "fdf.debit": "Débit",
    "fdf.active": "Actif",
    "fdf.tabAddresses": "Adresses",
    "fdf.tabContacts": "Contacts",
    "fdf.addrType": "Type d'adresse",
    "fdf.city": "Ville",
    "fdf.fullAddr": "Adresse complète",
    "fdf.postal": "Code postal",
    "fdf.contactType": "Type de contact",
    "fdf.number": "Numéro",
    "fdf.notes": "Remarques",
    "fdf.sampleName": "Client exemple"
};
const zh = {
    ...en,
    "common.loading": "加载中…",
    "common.retry": "重试",
    "common.close": "关闭",
    "common.minimize": "最小化",
    "common.maximize": "最大化",
    "common.cancel": "取消",
    "common.save": "保存",
    "common.delete": "删除",
    "common.confirm": "确认",
    "common.all": "全部",
    "common.search": "搜索",
    "common.language": "语言",
    "common.theme": "主题",
    "common.description": "描述",
    "common.error": "错误",
    "app.name": "统一商贸 ERP",
    "app.shortName": "商贸",
    "taskbar.search": "搜索应用和设置",
    "header.dashboard": "仪表板",
    "header.search": "搜索仪表板…",
    "header.dragHint": "拖动以移动顶栏",
    "header.dockTop": "停靠在顶部",
    "header.dockLeft": "停靠在左侧",
    "header.dockRight": "停靠在右侧",
    "header.dropHint": "松开以将顶栏停靠在此处",
    "startmenu.pinned": "已固定",
    "startmenu.recommended": "推荐",
    "startmenu.searchPlaceholder": "输入以搜索…",
    "menus.general": "常规与设置",
    "menus.structural": "结构设置",
    "menus.businessStructure": "业务结构",
    "bs.title": "业务结构",
    "bs.subtitle": "管理组织树、分公司和代理处",
    "bs.treeTitle": "结构树",
    "bs.searchPlaceholder": "搜索结构…",
    "bs.newSubtree": "新建子树",
    "bs.deleteBranch": "删除分支",
    "bs.emptyTree": "尚未定义任何结构",
    "bs.loadingTree": "正在加载结构…",
    "bs.selectNode": "选择一个节点以查看详情",
    "bs.addNode": "添加子节点",
    "bs.addDisabledMax": "已达到最大深度（4 级）",
    "bs.mainTab": "主选项卡",
    "bs.usersTab": "授权用户",
    "bs.users.comingSoon": "用户关联将在 IAM 阶段启用",
    "bs.field.code": "代码",
    "bs.field.title": "名称",
    "bs.field.titleEn": "拉丁文名称",
    "bs.field.type": "类型",
    "bs.field.manager": "负责人",
    "bs.field.logo": "标志",
    "bs.field.isActive": "启用",
    "bs.field.isBasicInfoShared": "共享基础信息",
    "bs.field.shareHeadquarterData": "使用总部共享数据",
    "bs.field.activeStructureTypes": "允许的结构类型",
    "bs.field.parent": "上级",
    "bs.type.1": "控股公司",
    "bs.type.2": "公司",
    "bs.type.3": "分公司",
    "bs.type.4": "代理处",
    "bs.type.5": "商店",
    "bs.type.hq": "总部",
    "bs.action.save": "保存",
    "bs.action.saveNew": "保存并新建",
    "bs.action.saveClose": "保存并关闭",
    "bs.action.new": "新建",
    "bs.action.delete": "删除",
    "bs.msg.saved": "保存成功",
    "bs.msg.deleted": "分支已删除",
    "bs.msg.deleteBlockedChildren": "该节点包含子节点，无法删除",
    "bs.msg.deleteBlockedRoot": "总部无法删除",
    "bs.msg.deleteBlockedSystem": "系统记录无法删除",
    "bs.msg.deleteConfirm": "确定要删除该节点吗？",
    "bs.msg.loadError": "加载结构失败",
    "bs.msg.saveError": "保存失败",
    "bs.val.titleRequired": "名称为必填项",
    "bs.val.titleEnRequired": "拉丁文（英文）名称为必填项",
    "bs.val.typeRequired": "必须选择类型",
    "bs.hint.codeAuto": "代码将自动生成",
    "bs.hint.latinTitle": "请输入对应的拉丁文名称",
    "bs.root.unionWarning": "最终将应用系统定义结构与您所选内容的并集",
    "settings.title": "设置",
    "settings.subtitle": "个性化系统",
    "settings.appearance": "外观",
    "settings.light": "浅色",
    "settings.dark": "深色",
    "settings.back": "返回",
    "settings.bsDesc": "管理控股、公司、分支、代理与商店层级",
    "settings.umDesc": "管理用户、角色和系统访问级别",
    "settings.umPending": "用户管理由多个表单组成；将提供分析文档，表单将在此之后实现。",
    "sidebar.title": "所有项目",
    "sidebar.toSidebar": "显示为侧边栏菜单",
    "sidebar.toGrid": "在桌面上显示图标",
    "sidebar.collapse": "折叠菜单",
    "sidebar.expand": "展开菜单",
    "app.settings": "设置",
    "app.accounting": "会计",
    "app.receiptsPayment": "收付款",
    "app.inventory": "仓库",
    "app.sales": "销售",
    "app.fixedAssets": "固定资产",
    "app.procurement": "采购",
    "app.foreignOrders": "海外订单",
    "app.costing": "成本核算",
    "app.materialDelivery": "物料交付控制",
    "app.productionPlanning": "生产计划",
    "app.payroll": "工资",
    "app.hr": "人力资源",
    "app.officeAutomation": "办公自动化",
    "app.crm": "客户关系管理",
    "app.advancedTools": "高级工具",
    "app.userManagement": "用户管理",
    "app.workflow": "工作流",
    "app.smsCenter": "短信中心",
    "app.retailSales": "零售销售",
    "app.marketingSales": "营销与销售",
    "app.coldDistribution": "冷分销",
    "app.hotDistribution": "热分销",
    "app.financialStatements": "财务报表",
    "app.businessIntelligence": "商业智能",
    "app.maintenance": "维护保养",
    "app.onlineWebsite": "在线网站",
    "app.general": "通用",
    "ph.awaitingBadge": "等待分析文档",
    "ph.awaitingBody": "此模块的表单和字段尚未定义；待其分析文档提供后，设计与实现将严格按照该文档进行。",
    "ph.secureApi": "服务安全连接",
    "ph.infraStatus": "基础设施状态",
    "ph.portLabel": "服务端口",
    "ph.dbShared": "共享数据库",
    "ph.dbDedicated": "独立数据库",
    "ph.linkOk": "已连接（已签名）",
    "ph.linkFail": "暂时无法连接",
    "ph.checking": "正在检查安全连接…",
    "ctx.open": "打开",
    "ctx.pinTaskbar": "固定到任务栏",
    "ctx.unpinTaskbar": "从任务栏取消固定",
    "ctx.resetLayout": "重置桌面布局",
    "taskbar.dropHint": "松开以固定到任务栏",
    "taskbar.pinnedToast": "图标已固定到任务栏",
    "taskbar.unpinnedToast": "图标已从任务栏移除",
    "taskbar.alreadyPinned": "该图标已在任务栏中",
    "abar.reset": "重置表单字段",
    "abar.save": "保存数据",
    "abar.saveNew": "保存并新建",
    "abar.saveClose": "保存并关闭",
    "abar.copy": "复制表单数据",
    "abar.delete": "删除数据",
    "abar.deleteNew": "删除并新建",
    "abar.deleteClose": "删除并关闭",
    "abar.print": "打印表单",
    "abar.list": "已保存记录列表",
    "abar.listEmpty": "没有可显示的记录",
    "abar.confirmDeleteTitle": "确认删除",
    "abar.confirmDeleteBody": "确定要删除当前表单数据吗？此操作无法撤销。",
    "abar.demoTitle": "表单操作栏 — 基础设施预览",
    "abar.demoNote": "在分析文档交付之前暂无真实数据连接；按钮行为将以示例数据演示。",
    "abar.resetToast": "表单字段已重置",
    "abar.savedToast": "数据保存成功",
    "abar.deletedToast": "数据已删除",
    "abar.itemOpened": "所选记录的数据已在表单中打开",
    "abar.printToast": "表单已发送至打印机",
    "abar.copyToast": "表单数据已复制，用于新建记录",
    "abar.toolbar": "表单操作栏",
    "sft.noData": "暂无数据",
    "sft.addRow": "添加新行",
    "sft.removeRow": "删除所选行",
    "sft.copyRows": "复制所选行",
    "sft.first": "第一条记录",
    "sft.prev": "上一条记录",
    "sft.next": "下一条记录",
    "sft.last": "最后一条记录",
    "sft.help": "帮助",
    "sft.selectPlaceholder": "请选择…",
    "stf.details": "详情",
    "stf.iconLabel": "树形表单示例",
    "stf.geoTitle": "地理位置",
    "stf.iran": "伊朗",
    "stf.tehranProvince": "德黑兰省",
    "stf.tehran": "德黑兰",
    "stf.alborz": "厄尔布尔士省",
    "stf.karaj": "卡拉季",
    "stf.type": "类型",
    "stf.latinTitle": "拉丁标题",
    "stf.optCountry": "国家",
    "stf.optProvince": "省份",
    "stf.optCity": "城市",
    "fdf.title": "新客户",
    "fdf.badge": "示例",
    "fdf.iconLabel": "表单示例",
    "fdf.code": "代码",
    "fdf.customerType": "客户类型",
    "fdf.name": "名称",
    "fdf.customerGroup": "客户组",
    "fdf.balance": "余额",
    "fdf.formStatus": "表单状态",
    "fdf.effect": "效果",
    "fdf.typeNormal": "普通",
    "fdf.typeSpecial": "特殊",
    "fdf.dirDirect": "直接",
    "fdf.dirIndirect": "间接",
    "fdf.rial": "伊朗里亚尔",
    "fdf.debit": "借方",
    "fdf.active": "启用",
    "fdf.tabAddresses": "地址",
    "fdf.tabContacts": "联系方式",
    "fdf.addrType": "地址类型",
    "fdf.city": "城市",
    "fdf.fullAddr": "完整地址",
    "fdf.postal": "邮政编码",
    "fdf.contactType": "联系类型",
    "fdf.number": "号码",
    "fdf.notes": "备注",
    "fdf.sampleName": "示例客户"
};
const DICTS = {
    fa,
    en,
    tr,
    ar,
    hi,
    ps,
    ckb,
    pt,
    ko,
    fr,
    zh
};
function getDict(locale) {
    return DICTS[locale] ?? fa;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/app-catalog.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left-right.js [app-client] (ecmascript) <export default as ArrowLeftRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/boxes.js [app-client] (ecmascript) <export default as Boxes>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calculator.js [app-client] (ecmascript) <export default as Calculator>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.js [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/factory.js [app-client] (ecmascript) <export default as Factory>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$chart$2d$column$2d$increasing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBarChart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-chart-column-increasing.js [app-client] (ecmascript) <export default as FileBarChart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileStack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-stack.js [app-client] (ecmascript) <export default as FileStack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2d$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HandCoins$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand-coins.js [app-client] (ecmascript) <export default as HandCoins>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hammer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hammer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hammer.js [app-client] (ecmascript) <export default as Hammer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$handshake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartHandshake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart-handshake.js [app-client] (ecmascript) <export default as HeartHandshake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/landmark.js [app-client] (ecmascript) <export default as Landmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-tree.js [app-client] (ecmascript) <export default as ListTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/megaphone.js [app-client] (ecmascript) <export default as Megaphone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$notebook$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__NotebookPen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/notebook-pen.js [app-client] (ecmascript) <export default as NotebookPen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2d$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PackageSearch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package-search.js [app-client] (ecmascript) <export default as PackageSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sigma$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sigma$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sigma.js [app-client] (ecmascript) <export default as Sigma>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/snowflake.js [app-client] (ecmascript) <export default as Snowflake>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-client] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-client] (ecmascript) <export default as UserCog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/warehouse.js [app-client] (ecmascript) <export default as Warehouse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.js [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/workflow.js [app-client] (ecmascript) <export default as Workflow>");
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
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        tile: "from-slate-400 to-slate-600"
    },
    accounting: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__["Calculator"],
        tile: "from-violet-500 to-violet-700"
    },
    receiptsPayment: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__["ArrowLeftRight"],
        tile: "from-emerald-500 to-emerald-700"
    },
    inventory: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__["Warehouse"],
        tile: "from-amber-500 to-amber-600"
    },
    sales: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
        tile: "from-rose-500 to-rose-700"
    },
    fixedAssets: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$landmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Landmark$3e$__["Landmark"],
        tile: "from-teal-500 to-teal-700"
    },
    procurement: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2d$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PackageSearch$3e$__["PackageSearch"],
        tile: "from-orange-500 to-orange-600"
    },
    foreignOrders: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"],
        tile: "from-cyan-500 to-cyan-700"
    },
    costing: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sigma$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sigma$3e$__["Sigma"],
        tile: "from-lime-600 to-lime-700"
    },
    materialDelivery: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
        tile: "from-sky-500 to-sky-700"
    },
    productionPlanning: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__["Factory"],
        tile: "from-fuchsia-500 to-fuchsia-700"
    },
    payroll: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2d$coins$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HandCoins$3e$__["HandCoins"],
        tile: "from-green-500 to-green-700"
    },
    hr: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        tile: "from-purple-500 to-purple-700"
    },
    officeAutomation: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileStack$3e$__["FileStack"],
        tile: "from-stone-500 to-stone-700"
    },
    crm: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2d$handshake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HeartHandshake$3e$__["HeartHandshake"],
        tile: "from-pink-500 to-pink-700"
    },
    advancedTools: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"],
        tile: "from-amber-600 to-amber-800"
    },
    userManagement: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__["UserCog"],
        tile: "from-violet-600 to-violet-800"
    },
    workflow: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$workflow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Workflow$3e$__["Workflow"],
        tile: "from-cyan-600 to-cyan-800"
    },
    smsCenter: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
        tile: "from-emerald-600 to-emerald-800"
    },
    retailSales: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"],
        tile: "from-rose-600 to-rose-800"
    },
    marketingSales: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$megaphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Megaphone$3e$__["Megaphone"],
        tile: "from-orange-600 to-orange-800"
    },
    coldDistribution: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$snowflake$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snowflake$3e$__["Snowflake"],
        tile: "from-sky-400 to-sky-600"
    },
    hotDistribution: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"],
        tile: "from-red-500 to-red-700"
    },
    financialStatements: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$chart$2d$column$2d$increasing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBarChart$3e$__["FileBarChart"],
        tile: "from-teal-600 to-teal-800"
    },
    businessIntelligence: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        tile: "from-fuchsia-600 to-fuchsia-800"
    },
    maintenance: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hammer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hammer$3e$__["Hammer"],
        tile: "from-yellow-500 to-yellow-600"
    },
    onlineWebsite: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"],
        tile: "from-cyan-500 to-cyan-700"
    },
    general: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$boxes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Boxes$3e$__["Boxes"],
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
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"],
        tile: "from-emerald-500 to-emerald-700"
    },
    listTree: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"],
        tile: "from-amber-500 to-orange-600"
    },
    clipboardList: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"],
        tile: "from-sky-500 to-sky-700"
    },
    notebookPen: {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$notebook$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__NotebookPen$3e$__["NotebookPen"],
        tile: "from-rose-500 to-rose-700"
    }
};
function getIconKeyGlyph(iconKey) {
    const direct = APP_ICONS[iconKey];
    if (direct) return direct;
    const desc = FRONTEND_APPS.find((a)=>a.iconKey === iconKey);
    if (desc && APP_ICONS[desc.appKey]) return APP_ICONS[desc.appKey];
    return ICON_KEY_EXTRA[iconKey] ?? {
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"],
        tile: "from-slate-400 to-slate-600"
    };
}
function getAppDescriptor(appKey) {
    return FRONTEND_APPS.find((a)=>a.appKey === appKey);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/app-registry-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppRegistry",
    ()=>useAppRegistry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/app-catalog.ts [app-client] (ecmascript)");
"use client";
;
;
;
function sortApps(apps) {
    return [
        ...apps
    ].sort((a, b)=>a.order - b.order);
}
const useAppRegistry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((set, get)=>({
        apps: [],
        source: "idle",
        loaded: false,
        load: async ()=>{
            if (get().loaded) return;
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].get("app-registry");
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
                    apps: sortApps(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FRONTEND_APPS"]),
                    source: "fallback",
                    loaded: true
                });
            }
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/desktop-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PINNED",
    ()=>DEFAULT_PINNED,
    "useDesktop",
    ()=>useDesktop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
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
    const vw = ("TURBOPACK compile-time truthy", 1) ? window.innerWidth : "TURBOPACK unreachable";
    const vh = ("TURBOPACK compile-time truthy", 1) ? window.innerHeight : "TURBOPACK unreachable";
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
const useDesktop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/settings-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSettings",
    ()=>useSettings,
    "useT",
    ()=>useT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$dictionaries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/dictionaries.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const useSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        locale: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_LOCALE"],
        setLocale: (l)=>set({
                locale: l
            }),
        t: (k)=>{
            const dict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$dictionaries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDict"])(get().locale);
            return dict[k] ?? String(k);
        },
        dir: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dirOf"])(get().locale)
    }), {
    name: "erp.settings"
}));
function useT() {
    _s();
    const locale = useSettings({
        "useT.useSettings[locale]": (s)=>s.locale
    }["useT.useSettings[locale]"]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useT.useMemo": ()=>{
            const dict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$dictionaries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDict"])(locale);
            return ({
                "useT.useMemo": (k)=>dict[k] ?? String(k)
            })["useT.useMemo"];
        }
    }["useT.useMemo"], [
        locale
    ]);
}
_s(useT, "1MO+SXetIhQVJSpr4kc4ie+WanE=", false, function() {
    return [
        useSettings
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/types/business-structure.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_1rok97rlt8_c5._.js.map