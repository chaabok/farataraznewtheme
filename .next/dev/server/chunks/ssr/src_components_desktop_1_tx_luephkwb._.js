(()=>{"use strict";module.exports = [
"[project]/src/components/desktop/app-tile.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppTile",
    ()=>AppTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/app-catalog.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function AppTile({ appKey, className, iconClass, style, iconStyle }) {
    const glyph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$app$2d$catalog$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAppIcon"])(appKey);
    const Icon = glyph?.Icon;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": true,
        style: style,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", glyph?.tile ?? "from-slate-400 to-slate-600", className ?? "h-9 w-9"),
        children: Icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
            style: iconStyle,
            className: iconClass ?? "h-5 w-5"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/app-tile.tsx",
            lineNumber: 35,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/src/components/desktop/app-window.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppWindow",
    ()=>AppWindow,
    "useWindowChrome",
    ()=>useWindowChrome
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.js [app-ssr] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-ssr] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-ssr] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-ssr] (ecmascript)");
"use client";
;
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
const WindowChromeContext = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"](null);
function useWindowChrome() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"](WindowChromeContext);
}
function AppWindow({ win, title, icon, children }) {
    const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const dragRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const resizeRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    /* latest window state for stable drag callbacks (no stale closures,
     no per-frame context churn while dragging) */ const winRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](win);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"](()=>{
        winRef.current = win;
    });
    const vw = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1280;
    const vh = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 800;
    const startDrag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((e)=>{
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
    }, [
        focusWindow
    ]);
    const moveDrag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((e)=>{
        const w = winRef.current;
        if (!dragRef.current) return;
        const x = clamp(e.clientX - dragRef.current.dx, -w.w + 140, vw - 80);
        const y = clamp(e.clientY - dragRef.current.dy, 0, vh - TASKBAR_H - 40);
        moveWindow(w.id, x, y);
    }, [
        moveWindow,
        vw,
        vh
    ]);
    const endDrag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](()=>{
        dragRef.current = null;
    }, []);
    const doubleClickHeader = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"](()=>toggleMaximize(winRef.current.id), [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(/* Task 31 — the window root is OPAQUE (bg-card): desktop icons /
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
            !chromeless && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-10 shrink-0 cursor-default items-center gap-2 border-b border-border/60 px-3 select-none",
                onPointerDown: startDrag,
                onPointerMove: moveDrag,
                onPointerUp: endDrag,
                onDoubleClick: doubleClickHeader,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex h-5 w-5 items-center justify-center",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/app-window.tsx",
                        lineNumber: 171,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate text-xs font-semibold text-foreground/90",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/app-window.tsx",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ms-auto flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "data-window-btn": true,
                                "aria-label": t("common.minimize"),
                                className: "flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 cursor-pointer",
                                onClick: ()=>minimizeWindow(win.id),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "data-window-btn": true,
                                "aria-label": t("common.maximize"),
                                className: "flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 cursor-pointer",
                                onClick: ()=>toggleMaximize(win.id),
                                children: maximized ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-3 w-3 -scale-x-100"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/app-window.tsx",
                                    lineNumber: 188,
                                    columnNumber: 28
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                "data-window-btn": true,
                                "aria-label": t("common.close"),
                                className: "flex h-8 w-10 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-red-500 hover:text-white cursor-pointer",
                                onClick: ()=>closeWindow(win.id),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-h-0 flex-1 overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WindowChromeContext.Provider, {
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
            !maximized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}
}),
"[project]/src/components/desktop/dashboard-header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardHeader",
    ()=>DashboardHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-ssr] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-horizontal.js [app-ssr] (ecmascript) <export default as GripHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grip-vertical.js [app-ssr] (ecmascript) <export default as GripVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left.js [app-ssr] (ecmascript) <export default as PanelLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-right.js [app-ssr] (ecmascript) <export default as PanelRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$top$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelTop$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-top.js [app-ssr] (ecmascript) <export default as PanelTop>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/floating-menu.tsx [app-ssr] (ecmascript)");
"use client";
;
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
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.locale);
    const dock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.headerDock);
    const setHeaderDock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.setHeaderDock);
    const setStartOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.setStartOpen);
    /* SSR-safe: wait for the persisted layout rehydrate, then reveal the bar */ const [mounted, setMounted] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        let alive = true;
        /* rehydrate() is typed `void | Promise<void>` in this zustand version */ Promise.resolve(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"].persist.rehydrate()).then(()=>{
            if (alive) setMounted(true);
        });
        return ()=>{
            alive = false;
        };
    }, []);
    /* narrow viewports get the compact content (icon search, no badge) */ const [narrow, setNarrow] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const mq = window.matchMedia("(max-width: 639px)");
        const apply = ()=>setNarrow(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return ()=>mq.removeEventListener("change", apply);
    }, []);
    const vertical = dock !== "top";
    const barRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    /* live drag state: pointer-follow position + grab offset; zone = predicted dock */ const [drag, setDrag] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const [zone, setZone] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"]("top");
    const suppressClickRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](false);
    const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
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
    /* hydration-safe date — the footer shows the time, the header shows the weekday */ const seconds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"](subscribeClock, clientSeconds, serverSeconds);
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
    /* ---------- shared content pieces (used by the docked bar AND the drag ghost) ---------- */ const grip = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        "aria-label": t("header.dragHint"),
        title: t("header.dragHint"),
        onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(t("header.dragHint")),
        className: "flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground",
        children: vertical ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$horizontal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripHorizontal$3e$__["GripHorizontal"], {
            className: "h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/dashboard-header.tsx",
            lineNumber: 159,
            columnNumber: 19
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grip$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GripVertical$3e$__["GripVertical"], {
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
    const brandTile = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        title: t("app.name"),
        className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
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
    const searchBtn = vertical || narrow ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>setStartOpen(true),
        title: t("header.search"),
        "aria-label": t("header.search"),
        className: "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
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
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>setStartOpen(true),
        title: t("header.search"),
        "aria-label": t("header.search"),
        className: "flex h-6 min-w-0 cursor-pointer items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 text-[11px] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                className: "h-3 w-3 shrink-0"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
    const dateEl = vertical ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex shrink-0 flex-col items-center gap-1.5 pb-1 text-foreground/80",
        title: dateLong,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                className: "h-3 w-3 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-foreground/80",
        title: dateLong,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                className: "h-3 w-3 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
    const content = vertical ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            grip,
            brandTile,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "my-1 h-px w-4 shrink-0 bg-foreground/15",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            searchBtn,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            grip,
            brandTile,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "truncate text-xs font-semibold text-foreground/95",
                children: t("app.shortName")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            !narrow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "shrink-0 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary",
                children: t("header.dashboard")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 232,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mx-1 hidden h-4 w-px shrink-0 bg-foreground/15 sm:block",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 236,
                columnNumber: 7
            }, this),
            searchBtn,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
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
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("acrylic menu-in fixed z-[9200] flex select-none items-center border-foreground/10 shadow-sm", vertical ? "flex-col gap-1.5 px-1 py-2" : "flex-row gap-2 px-2 sm:px-3", dock === "top" && "border-b", dock === "left" && "border-r", dock === "right" && "border-l", dragging && "pointer-events-none opacity-0"),
                children: content
            }, dock, false, {
                fileName: "[project]/src/components/desktop/dashboard-header.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            drag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": true,
                        className: "pointer-events-none fixed z-[9600]",
                        style: {
                            left: drag.x,
                            top: drag.y
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("acrylic flex items-center rounded-xl border border-foreground/10 shadow-2xl ring-2 ring-primary/50", vertical ? "w-[36.4px] flex-col gap-1.5 px-1 py-2" : "h-[36.4px] gap-2 px-2"),
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
            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FloatingMenu"], {
                x: menu.x,
                y: menu.y,
                onClose: ()=>setMenu(null),
                items: [
                    {
                        label: t("header.dockTop"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$top$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelTop$3e$__["PanelTop"], {
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
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__["PanelLeft"], {
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
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRight$3e$__["PanelRight"], {
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
}),
"[project]/src/components/desktop/desktop.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Desktop",
    ()=>Desktop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-plus-2.js [app-ssr] (ecmascript) <export default as FilePlus2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-tree.js [app-ssr] (ecmascript) <export default as ListTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-ssr] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-close.js [app-ssr] (ecmascript) <export default as PanelLeftClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-open.js [app-ssr] (ecmascript) <export default as PanelLeftOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-right-close.js [app-ssr] (ecmascript) <export default as PanelRightClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-right-open.js [app-ssr] (ecmascript) <export default as PanelRightOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-ssr] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin-off.js [app-ssr] (ecmascript) <export default as PinOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-ssr] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$direction$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-direction/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/app-registry-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$taskbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/taskbar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$dashboard$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/dashboard-header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$start$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/start-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/floating-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/business-structure/bs-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$settings$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/settings-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$app$2d$placeholder$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/app-placeholder-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$demo$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-demo-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$tree$2d$demo$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/tree-demo-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$form$2d$builder$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/form-builder-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$menu$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/dfb-menu-window.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$form$2d$runtime$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/dfb-form-runtime.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$studio$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/dfb-studio.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/dfb-dialogs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dfb-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-ssr] (ecmascript)");
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
;
;
;
;
;
;
;
/* Task 45 — dfb-menu/dfb-form resolve dynamically in resolveWindowMeta,
   so the static map only covers the fixed kinds (Partial on purpose). */ const STATIC_WINDOWS = {
    "business-structure": {
        titleKey: "menus.businessStructure",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-violet-700 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$business$2d$structure$2f$bs$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BusinessStructureWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 67,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    settings: {
        titleKey: "settings.title",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
            appKey: "settings",
            className: "h-5 w-5 rounded-md",
            iconClass: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 71,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$settings$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SettingsWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 72,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    /* Task 24 — live sample of the SimpleFormTwoRowTabbed form shell (additive;
     the 27 catalog placeholders keep their §4.6 contract untouched) */ "form-demo": {
        titleKey: "fdf.iconLabel",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 79,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$demo$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormDemoWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 83,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    /* Task 30 — live sample of the SimpleTreeForm master-detail shell
     (additive; the 27 catalog placeholders keep their §4.6 contract) */ "tree-demo": {
        titleKey: "stf.iconLabel",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 91,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 90,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$tree$2d$demo$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TreeDemoWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 94,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    },
    /* Task 45/46 — the form builder (فرمساز) of the advancedTools app
     (dfb-service). Since Task 46 the advancedTools icon opens the app's
     forms menu (kind "dfb-menu", ref "app:advancedTools") and the «فرمساز»
     launcher form inside that menu opens THIS builder window — one shared
     instance for every entry point. */ "dfb-builder": {
        titleKey: "dfb.builderTitle",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-600 to-amber-800 text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                className: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)),
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$form$2d$builder$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormBuilderWindow"], {}, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 108,
            columnNumber: 14
        }, ("TURBOPACK compile-time value", void 0))
    }
};
function resolveWindowMeta(win, t, dfbTree, locale) {
    if (win.kind === "app") {
        const appKey = win.appKey ?? "";
        return {
            title: t(`app.${appKey}`),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
                appKey: appKey,
                className: "h-5 w-5 rounded-md",
                iconClass: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 122,
                columnNumber: 13
            }, this),
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$app$2d$placeholder$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppPlaceholderWindow"], {
                appKey: appKey
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 123,
                columnNumber: 16
            }, this)
        };
    }
    /* Task 45/46 — dynamic dfb windows: titles come from the builder tree
     (dfb.db). A dfb-menu ref is either a numeric node id (user icons) or
     "app:<appKey>" (a system catalog app's forms menu — Task 46): while the
     tree is still loading the catalog label/icon answer for it, then the
     live node takes over. */ if (win.kind === "dfb-menu") {
        const ref = win.appKey ?? "";
        const appRef = ref.startsWith("app:") ? ref.slice(4) : null;
        const node = appRef ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findMenuNodeByAppKey"])(dfbTree, appRef) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findMenuNode"])(dfbTree, Number(ref));
        return {
            title: node ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dfbNodeTitle"])(node, t, locale) : appRef ? t(`app.${appRef}`) : t("dfb.menuNotFound"),
            icon: node ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbGlyph"], {
                iconKey: node.iconKey,
                className: "h-5 w-5 rounded-md",
                iconClass: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 144,
                columnNumber: 9
            }, this) : appRef ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
                appKey: appRef,
                className: "h-5 w-5 rounded-md",
                iconClass: "h-3 w-3"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this) : STATIC_WINDOWS["dfb-builder"]?.icon ?? null,
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$menu$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbMenuWindow"], {
                menuRef: ref
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 150,
                columnNumber: 16
            }, this)
        };
    }
    if (win.kind === "dfb-form") {
        const formId = Number(win.appKey ?? 0);
        const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findFormInTree"])(dfbTree, formId);
        return {
            title: form ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dfbFormTitle"])(form, locale) : t("dfb.formNotFound"),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                    className: "h-3 w-3"
                }, void 0, false, {
                    fileName: "[project]/src/components/desktop/desktop.tsx",
                    lineNumber: 160,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 159,
                columnNumber: 9
            }, this),
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$form$2d$runtime$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbFormRuntime"], {
                formId: formId
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 163,
                columnNumber: 16
            }, this)
        };
    }
    /* Task 47 — the per-form design studio (استودیوی طراحی فرم) */ if (win.kind === "dfb-studio") {
        const formId = Number(win.appKey ?? 0);
        const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findFormInTree"])(dfbTree, formId);
        return {
            title: form ? `${t("dfb.studio.title")} — ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dfbFormTitle"])(form, locale)}` : t("dfb.studio.title"),
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                    className: "h-3 w-3"
                }, void 0, false, {
                    fileName: "[project]/src/components/desktop/desktop.tsx",
                    lineNumber: 176,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 175,
                columnNumber: 9
            }, this),
            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$studio$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FormDesignStudio"], {
                formId: formId
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 179,
                columnNumber: 16
            }, this)
        };
    }
    const meta = STATIC_WINDOWS[win.kind];
    if (!meta) {
        /* unreachable today — every fixed kind has a static entry */ return {
            title: win.kind,
            icon: null,
            content: null
        };
    }
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
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.dir());
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.locale);
    /* Task 39 — owner request: icons are ordered by the selected language
     (fa → Persian alphabet, en → A-Z, …) via Intl collation. */ const collator = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>new Intl.Collator(locale, {
            numeric: true
        }), [
        locale
    ]);
    const openWindow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.openWindow);
    const iconPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.iconPositions);
    const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.pinned);
    const setIconPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.setIconPos);
    const resetIconLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.resetIconLayout);
    const pinToTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.pinToTaskbar);
    const setDragOverTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.setDragOverTaskbar);
    const headerDock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.headerDock);
    /* Task 38 — sidebar presentation state (owner request) */ const iconMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.iconMode);
    const sidebarCollapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.sidebarCollapsed);
    const setIconMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.setIconMode);
    const setSidebarCollapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.setSidebarCollapsed);
    const { apps, load } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppRegistry"])();
    /* Task 45 — user-created main icons (فرمساز) merge into the very same list:
     grid, sidebar and context-menu all treat them exactly like catalog apps */ const dfbUserIcons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"])((s)=>s.userIcons);
    const dfbLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"])((s)=>s.load);
    const layerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const [rect, setRect] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const [freeMode, setFreeMode] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](false);
    const [selected, setSelected] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const [ghost, setGhost] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    const suppressClickRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](false);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        void load();
    }, [
        load
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        void dfbLoad();
    }, [
        dfbLoad
    ]);
    /* SSR-safe: persisted layout (icon positions + footer pins) rehydrated after mount */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        void __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"].persist.rehydrate();
    }, []);
    /* free positioning + dragging on ≥640px viewports; small screens keep the wrap flow */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const mq = window.matchMedia("(min-width: 640px)");
        const apply = ()=>setFreeMode(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return ()=>mq.removeEventListener("change", apply);
    }, []);
    /* measure the icons layer for clamping (viewport resizes keep icons inside).
     Task 39: re-attach on every grid (re)mount — the layer unmounts while the
     Task-38 sidebar is open, so a one-shot observer would leave a stale rect. */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        if (iconMode !== "grid") return;
        const el = layerRef.current;
        if (!el) return;
        const update = ()=>setRect({
                w: el.clientWidth,
                h: el.clientHeight
            });
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return ()=>ro.disconnect();
    }, [
        iconMode
    ]);
    const clampPos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((p)=>{
        const w = rect?.w ?? (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1264);
        const h = rect?.h ?? (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 732);
        return {
            x: Math.min(Math.max(p.x, 0), Math.max(0, w - ICON_W)),
            y: Math.min(Math.max(p.y, 0), Math.max(0, h - ICON_H))
        };
    }, [
        rect
    ]);
    /* default slot = column-major grid anchored to the start edge (right in RTL, left in LTR) */ const defaultPos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"]((index)=>{
        const h = rect?.h ?? (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 732);
        const w = rect?.w ?? (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1264);
        const rows = Math.max(1, Math.floor((h - GRID_PAD) / GRID_STEP_Y));
        const col = Math.floor(index / rows);
        const row = index % rows;
        const x = dir === "rtl" ? w - GRID_PAD - ICON_W - col * GRID_STEP_X : GRID_PAD + col * GRID_STEP_X;
        return {
            x,
            y: GRID_PAD + row * GRID_STEP_Y
        };
    }, [
        rect,
        dir
    ]);
    /* Task 35 — the BusinessStructure shortcut left the desktop: the form
     moved into the Settings window as a sub-page (owner request). Icons:
     the Task-24/Task-30 form-shell samples, then the catalog apps minus
     userManagement — it moved into the Settings window too (Task 37). */ const items = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"](()=>{
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
            ...apps.filter((a)=>a.appKey !== "userManagement").map((a)=>({
                    id: a.appKey,
                    kind: "app",
                    appKey: a.appKey,
                    label: t(a.titleKey)
                })),
            /* Task 45 — user-created main icons (isSystem=false, NodeType=1):
         same grid slot semantics as catalog apps (owner-confirmed default:
         mixed alphabetical ordering via the language collator below) */ ...dfbUserIcons.map((n)=>({
                    id: `dfb-menu-${n.id}`,
                    kind: "dfb-menu",
                    appKey: String(n.id),
                    label: n.title,
                    iconKey: n.iconKey
                }))
        ];
        /* Task 39 — owner request: order by the active language's collation in
       BOTH presentations, so the desktop grid and the sidebar always tell
       the same story (labels are unique, the id is just a stable tiebreak). */ return base.sort((a, b)=>collator.compare(a.label, b.label) || collator.compare(a.id, b.id));
    }, [
        apps,
        dfbUserIcons,
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
     geometry changes do. */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        if (iconMode !== "grid" || !freeMode || !rect) return;
        const saved = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"].getState().iconPositions;
        const pts = items.map((entry, i)=>clampPos(saved[entry.id] ?? defaultPos(i)));
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
    }, [
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
        const taskbarTop = document.querySelector("[data-taskbar]")?.getBoundingClientRect().top ?? (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 748);
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
                if (pinToTaskbar(entry.id)) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.pinnedToast"));
                else __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(t("taskbar.alreadyPinned"));
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
    const iconGlyph = (entry)=>entry.id === "form-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 459,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 458,
            columnNumber: 7
        }, this) : entry.id === "tree-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                className: "h-6 w-6"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 463,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 462,
            columnNumber: 7
        }, this) : entry.kind === "dfb-menu" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbGlyph"], {
            iconKey: entry.iconKey ?? "folder",
            className: "h-12 w-12 rounded-2xl",
            iconClass: "h-6 w-6"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 466,
            columnNumber: 7
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
            appKey: entry.appKey ?? "",
            className: "h-12 w-12 rounded-2xl",
            iconClass: "h-6 w-6"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 468,
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
    const ToggleIcon = sidebarOpen ? dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__["PanelRightClose"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__["PanelLeftClose"] : dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__["PanelRightOpen"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__["PanelLeftOpen"];
    const SidebarCollapseIcon = dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"];
    const SidebarExpandIcon = dir === "rtl" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"];
    /* Task 38 — sidebar icon style: compact tightly-rounded tiles (vs the
     desktop's large rounded glyphs) so the presentation visibly changes
     when switching modes (owner request). */ const sidebarGlyph = (entry)=>entry.id === "form-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$plus$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePlus2$3e$__["FilePlus2"], {
                className: "h-4 w-4"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 499,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 498,
            columnNumber: 7
        }, this) : entry.id === "tree-demo" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$tree$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ListTree$3e$__["ListTree"], {
                className: "h-4 w-4"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 503,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 502,
            columnNumber: 7
        }, this) : entry.kind === "dfb-menu" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbGlyph"], {
            iconKey: entry.iconKey ?? "folder",
            className: "h-8 w-8 rounded-lg",
            iconClass: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 506,
            columnNumber: 7
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
            appKey: entry.appKey ?? "",
            className: "h-8 w-8 rounded-lg",
            iconClass: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 508,
            columnNumber: 7
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            iconMode === "grid" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: layerRef,
                "aria-label": t("startmenu.pinned"),
                style: {
                    top: headerDock === "top" ? HEADER_THICK + GRID_PAD : GRID_PAD,
                    bottom: 60,
                    left: headerDock === "left" ? HEADER_THICK + GRID_PAD : GRID_PAD,
                    right: headerDock === "right" ? HEADER_THICK + GRID_PAD : GRID_PAD
                },
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute z-0 select-none", freeMode ? "block" : "flex flex-row flex-wrap content-start gap-0.5 sm:flex-col sm:flex-wrap"),
                children: [
                    items.map((entry, i)=>{
                        const pos = freeMode ? clampPos(iconPositions[entry.id] ?? defaultPos(i)) : null;
                        const dragging = ghost?.entry.id === entry.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            "aria-pressed": selected === entry.id,
                            onClick: (e)=>handleClick(e, entry),
                            onDoubleClick: ()=>activate(entry),
                            onContextMenu: (e)=>handleContextMenu(e, entry),
                            onPointerDown: (e)=>beginDragTracking(e, entry),
                            style: pos ? {
                                left: pos.x,
                                top: pos.y
                            } : undefined,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("group flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/12 focus:outline-none cursor-pointer", freeMode && "absolute touch-none", selected === entry.id && "bg-white/18 ring-1 ring-white/30", dragging && "opacity-30"),
                            children: [
                                iconGlyph(entry),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "line-clamp-2 rounded-md px-1 text-center text-[11px] font-medium leading-tight text-white drop-shadow group-focus-visible:bg-white/20",
                                    children: entry.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 550,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, entry.id, true, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 534,
                            columnNumber: 11
                        }, this);
                    }),
                    ghost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": true,
                        className: "pointer-events-none fixed z-[9600] w-[84px]",
                        style: {
                            left: ghost.x,
                            top: ghost.y
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col items-center gap-1.5 rounded-xl p-2 transition-transform duration-100", ghost.overTaskbar ? "scale-[0.62] opacity-90" : "scale-105 opacity-95 drop-shadow-2xl"),
                            children: [
                                iconGlyph(ghost.entry),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "line-clamp-2 rounded-md bg-black/30 px-1 text-center text-[11px] font-medium leading-tight text-white",
                                    children: ghost.entry.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 567,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 560,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 559,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 514,
                columnNumber: 7
            }, this),
            sidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                "aria-label": t("sidebar.title"),
                style: {
                    insetInlineStart: startOffset,
                    top: topOffset,
                    bottom: 60,
                    width: sidebarCollapsed ? 64 : SIDEBAR_W
                },
                className: "acrylic-strong menu-in win-shadow absolute z-[80] flex flex-col overflow-hidden rounded-2xl border border-border/60 shadow-xl transition-[width] duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-12 shrink-0 items-center gap-1 border-b border-border/60 px-2",
                        children: [
                            !sidebarCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-0 flex-1 truncate px-1 text-xs font-semibold text-foreground/90",
                                        children: t("sidebar.title")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/desktop.tsx",
                                        lineNumber: 595,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "shrink-0 font-mono text-[10px]",
                                        children: items.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/desktop.tsx",
                                        lineNumber: 598,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 594,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setSidebarCollapsed(!sidebarCollapsed),
                                "aria-expanded": !sidebarCollapsed,
                                "aria-label": sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse"),
                                title: sidebarCollapsed ? t("sidebar.expand") : t("sidebar.collapse"),
                                className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground cursor-pointer",
                                children: sidebarCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SidebarExpandIcon, {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 612,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SidebarCollapseIcon, {
                                    className: "h-4 w-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 614,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 603,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 592,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "min-h-0 flex-1 overflow-y-auto scrollbar-slim p-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-0.5", sidebarCollapsed && "items-center"),
                            children: items.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "w-full",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(sidebarCollapsed ? "flex h-10 w-10 items-center justify-center rounded-xl" : "flex w-full items-center gap-2.5 rounded-xl p-2 text-start", "transition-colors hover:bg-foreground/8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selected === entry.id && "bg-foreground/10 ring-1 ring-foreground/15"),
                                        children: [
                                            sidebarGlyph(entry),
                                            !sidebarCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "min-w-0 truncate text-xs font-medium text-foreground/90",
                                                children: entry.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                                lineNumber: 647,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/desktop/desktop.tsx",
                                        lineNumber: 624,
                                        columnNumber: 19
                                    }, this)
                                }, entry.id, false, {
                                    fileName: "[project]/src/components/desktop/desktop.tsx",
                                    lineNumber: 623,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 621,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 620,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 581,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                        asChild: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleIcon, {
                                className: "h-4 w-4 shrink-0",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 687,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 666,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 665,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipContent"], {
                        side: "top",
                        sideOffset: 10,
                        className: "rounded-full px-3.5 font-medium",
                        children: sidebarOpen ? t("sidebar.toGrid") : t("sidebar.toSidebar")
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 690,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 664,
                columnNumber: 7
            }, this),
            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FloatingMenu"], {
                x: menu.x,
                y: menu.y,
                onClose: ()=>setMenu(null),
                items: [
                    {
                        label: t("ctx.open"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 704,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>activate(menu.entry)
                    },
                    pinned.includes(menu.entry.id) ? {
                        label: t("ctx.unpinTaskbar"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__["PinOff"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 710,
                            columnNumber: 25
                        }, this),
                        onSelect: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"].getState().unpinFromTaskbar(menu.entry.id);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.unpinnedToast"));
                        }
                    } : {
                        label: t("ctx.pinTaskbar"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/desktop.tsx",
                            lineNumber: 718,
                            columnNumber: 25
                        }, this),
                        onSelect: ()=>{
                            if (pinToTaskbar(menu.entry.id)) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.pinnedToast"));
                            else __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info(t("taskbar.alreadyPinned"));
                        }
                    },
                    ...freeMode && menu.source === "grid" ? [
                        {
                            label: t("ctx.resetLayout"),
                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 728,
                                columnNumber: 27
                            }, this),
                            onSelect: ()=>resetIconLayout()
                        }
                    ] : []
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 697,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/desktop.tsx",
        lineNumber: 512,
        columnNumber: 5
    }, this);
}
function Desktop() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.dir());
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.locale);
    const { windows, setStartOpen, startOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])();
    const headerDock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.headerDock);
    const { resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    /* Task 45 — dfb tree feeds the dynamic window titles/icons (dfb-menu/dfb-form) */ const dfbTree = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"])((s)=>s.tree);
    const dfbLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"])((s)=>s.load);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        void dfbLoad();
    }, [
        dfbLoad
    ]);
    /* apply locale direction + language to <html> */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
    }, [
        dir,
        locale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$direction$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DirectionProvider"], {
        dir: dir,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TooltipProvider"], {
            delayDuration: 300,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative h-dvh w-screen overflow-hidden", resolvedTheme === "dark" ? "erp-wallpaper-dark" : "erp-wallpaper"),
                onPointerDown: (e)=>{
                    if (e.target === e.currentTarget) setStartOpen(false);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DesktopIcons, {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 773,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$dashboard$2d$header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DashboardHeader"], {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 776,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute z-[100]",
                        style: {
                            top: headerDock === "top" ? HEADER_THICK : 0,
                            left: headerDock === "left" ? HEADER_THICK : 0,
                            right: headerDock === "right" ? HEADER_THICK : 0,
                            bottom: 52
                        },
                        children: windows.map((win)=>{
                            const meta = resolveWindowMeta(win, t, dfbTree, locale);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$window$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppWindow"], {
                                win: win,
                                title: meta.title,
                                icon: meta.icon,
                                children: meta.content
                            }, win.id, false, {
                                fileName: "[project]/src/components/desktop/desktop.tsx",
                                lineNumber: 792,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 780,
                        columnNumber: 9
                    }, this),
                    startOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$start$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StartMenu"], {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 799,
                        columnNumber: 23
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$taskbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Taskbar"], {}, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 800,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
                        position: dir === "rtl" ? "bottom-left" : "bottom-right",
                        offset: 64,
                        richColors: true,
                        closeButton: true
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/desktop.tsx",
                        lineNumber: 802,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/desktop.tsx",
                lineNumber: 764,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/desktop.tsx",
            lineNumber: 763,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/desktop/desktop.tsx",
        lineNumber: 762,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/desktop/floating-menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingMenu",
    ()=>FloatingMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function FloatingMenu({ x, y, items, onClose }) {
    const ref = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const [pos, setPos] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"]({
        x,
        y
    });
    /* keep the menu inside the viewport */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"](()=>{
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({
            x: Math.max(8, Math.min(x, window.innerWidth - r.width - 8)),
            y: Math.max(8, Math.min(y, window.innerHeight - r.height - 8))
        });
    }, [
        x,
        y
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const onDown = (e)=>{
            if (!ref.current?.contains(e.target)) onClose();
        };
        const onKey = (e)=>{
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("pointerdown", onDown, true);
        window.addEventListener("keydown", onKey);
        return ()=>{
            window.removeEventListener("pointerdown", onDown, true);
            window.removeEventListener("keydown", onKey);
        };
    }, [
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        role: "menu",
        dir: "auto",
        style: {
            left: pos.x,
            top: pos.y
        },
        className: "acrylic-strong menu-in fixed z-[9800] min-w-44 rounded-xl border bg-popover/95 p-1.5 text-popover-foreground shadow-xl",
        children: items.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                role: "menuitem",
                onClick: ()=>{
                    it.onSelect();
                    onClose();
                },
                className: "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-xs font-medium transition-colors hover:bg-foreground/10 focus:bg-foreground/10 focus:outline-none",
                children: [
                    it.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground",
                        children: it.icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/floating-menu.tsx",
                        lineNumber: 74,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/src/components/desktop/start-menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StartMenu",
    ()=>StartMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-ssr] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/app-registry-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dfb-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/dfb-dialogs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-ssr] (ecmascript)");
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
function StartMenu() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const { setStartOpen, openWindow } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])();
    const { apps, load } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$app$2d$registry$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppRegistry"])();
    /* Task 45 — user-created main icons join the start-menu grid */ const dfbUserIcons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"])((s)=>s.userIcons);
    const dfbLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"])((s)=>s.load);
    const [query, setQuery] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"]("");
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        void load();
    }, [
        load
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        void dfbLoad();
    }, [
        dfbLoad
    ]);
    const close = ()=>setStartOpen(false);
    const q = query.trim().toLowerCase();
    /* the catalog apps, searchable (§1.3 titles via i18n).
     Task 35 — the BusinessStructure launcher tile was retired: the form now
     lives as a sub-page inside the Settings window (owner request).
     Task 37 — userManagement moved into Settings the same way: no standalone
     tile; it lives on the Settings home as a launcher card. */ const tiles = [
        ...apps.filter((a)=>a.appKey !== "userManagement").map((a)=>({
                id: a.appKey,
                kind: "app",
                appKey: a.appKey,
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
                    appKey: a.appKey
                }, void 0, false, {
                    fileName: "[project]/src/components/desktop/start-menu.tsx",
                    lineNumber: 53,
                    columnNumber: 15
                }, this),
                titleKey: a.titleKey
            })),
        /* Task 45 — user-created main icons (فرمساز) */ ...dfbUserIcons.map((n)=>({
                id: `dfb-menu-${n.id}`,
                kind: "dfb-menu",
                appKey: String(n.id),
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbGlyph"], {
                    iconKey: n.iconKey
                }, void 0, false, {
                    fileName: "[project]/src/components/desktop/start-menu.tsx",
                    lineNumber: 61,
                    columnNumber: 13
                }, this),
                titleKey: n.title
            }))
    ];
    const filtered = tiles.filter((a)=>{
        const label = dfbUserIcons.some((n)=>`dfb-menu-${n.id}` === a.id) ? a.titleKey : t(a.titleKey);
        return !q || label.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[9400]",
                onClick: close,
                onContextMenu: (e)=>e.preventDefault()
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/start-menu.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "menu-in acrylic-strong fixed bottom-[60px] left-1/2 z-[9500] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl win-shadow",
                dir: "auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                autoFocus: true,
                                value: query,
                                onChange: (e)=>setQuery(e.target.value),
                                placeholder: t("startmenu.searchPlaceholder"),
                                className: "h-10 rounded-xl ps-9"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                                className: "h-3.5 w-3.5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold text-muted-foreground",
                                children: t("startmenu.pinned")
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid max-h-[300px] grid-cols-4 gap-2 overflow-y-auto scrollbar-slim sm:grid-cols-6",
                        children: filtered.map((app)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    openWindow(app.kind, app.appKey);
                                    close();
                                },
                                className: "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors hover:bg-foreground/8 cursor-pointer",
                                children: [
                                    app.icon,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "line-clamp-2 text-center text-[11px] leading-tight text-foreground/90",
                                        children: dfbUserIcons.some((n)=>`dfb-menu-${n.id}` === app.id) ? app.titleKey : t(app.titleKey)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, app.id, true, {
                                fileName: "[project]/src/components/desktop/start-menu.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 mt-4 flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-semibold text-muted-foreground",
                            children: t("startmenu.recommended")
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                openWindow("settings");
                                close();
                            },
                            className: "flex w-full items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-foreground/8 cursor-pointer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-white",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                                        lineNumber: 130,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/desktop/start-menu.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block text-xs font-medium",
                                            children: t("settings.title")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block text-[10px] text-muted-foreground",
                                            children: [
                                                LOCALES_COUNT,
                                                " ",
                                                t("common.language")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                                            lineNumber: 134,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/desktop/start-menu.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/desktop/start-menu.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/start-menu.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/start-menu.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/start-menu.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
const LOCALES_COUNT = 11;
void LOCALES_COUNT;
}),
"[project]/src/components/desktop/taskbar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Taskbar",
    ()=>Taskbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-ssr] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/languages.js [app-ssr] (ecmascript) <export default as Languages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin.js [app-ssr] (ecmascript) <export default as Pin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pin-off.js [app-ssr] (ecmascript) <export default as PinOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/settings-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/desktop-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/config.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/app-tile.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/desktop/floating-menu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/dfb-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/erp/form-builder/dfb-dialogs.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-ssr] (ecmascript)");
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
function pinnedMeta(id) {
    if (id === "business-structure") return {
        kind: "business-structure",
        titleKey: "menus.businessStructure"
    };
    if (id === "settings") return {
        kind: "settings",
        titleKey: "settings.title"
    };
    /* Task 45 — user-created dfb main icons pinned to the dock */ if (id.startsWith("dfb-menu-")) {
        const menuId = Number(id.slice("dfb-menu-".length));
        return {
            kind: "dfb-menu",
            appKey: String(menuId),
            titleKey: `dfb-menu-${menuId}`
        };
    }
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                width: tile,
                height: tile
            },
            className: "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"], {
                style: {
                    width: glyph,
                    height: glyph
                }
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/taskbar.tsx",
            lineNumber: 44,
            columnNumber: 7
        }, this);
    }
    /* Task 45 — dfb icon glyph by its stored iconKey */ if (id.startsWith("dfb-menu-")) {
        const menuId = Number(id.slice("dfb-menu-".length));
        const node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findMenuNode"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"].getState().tree, menuId);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$erp$2f$form$2d$builder$2f$dfb$2d$dialogs$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DfbGlyph"], {
            iconKey: node?.iconKey ?? "folder",
            className: "rounded-lg",
            iconClass: "",
            style: {
                width: tile,
                height: tile
            }
        }, void 0, false, {
            fileName: "[project]/src/components/desktop/taskbar.tsx",
            lineNumber: 57,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$app$2d$tile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppTile"], {
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
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function WinLogo() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "grid h-5 w-5 grid-cols-2 gap-[2.5px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-400"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-300"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-300"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-[3px] bg-sky-400"
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/taskbar.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
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
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useT"])();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.locale);
    const setLocale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSettings"])((s)=>s.setLocale);
    const { windows, openWindow, focusWindow, minimizeWindow, startOpen, setStartOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])();
    const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.pinned);
    const dragOverTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.dragOverTaskbar);
    const unpinFromTaskbar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"])((s)=>s.unpinFromTaskbar);
    const seconds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"](subscribeClock, clientSeconds, serverSeconds);
    const now = seconds > 0 ? new Date(seconds * 1_000) : null;
    const [menu, setMenu] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](null);
    /* measured width of the footer dock drives the smart sizing */ const dockRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"](null);
    const [dockW, setDockW] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](0);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        const el = dockRef.current;
        if (!el) return;
        const update = ()=>setDockW(el.clientWidth);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return ()=>ro.disconnect();
    }, []);
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
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$desktop$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDesktop"].setState((s)=>({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-taskbar": true,
        className: "taskbar-shadow acrylic-strong absolute inset-x-0 bottom-0 z-[9000] flex h-[52px] items-center gap-1.5 px-2 sm:px-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        "aria-label": "Start",
                        onClick: ()=>setStartOpen(!startOpen),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-foreground/10 cursor-pointer", startOpen && "bg-foreground/10"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WinLogo, {}, void 0, false, {
                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-1 hidden items-center gap-1 rounded-full acrylic px-3 py-1.5 sm:flex",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "h-3.5 w-3.5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "max-w-40 truncate text-xs text-muted-foreground",
                                children: t("taskbar.search")
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: dockRef,
                "aria-label": t("startmenu.pinned"),
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("no-scrollbar relative flex min-w-0 flex-1 items-center overflow-x-auto rounded-xl py-1.5 transition-all", count > 0 && "px-1", dragOverTaskbar && "bg-primary/15 ring-2 ring-primary/50"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex items-center",
                    style: {
                        gap: DOCK_GAP
                    },
                    children: [
                        count === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pin$3e$__["Pin"], {
                            className: "h-4 w-4 text-muted-foreground/40"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                            lineNumber: 195,
                            columnNumber: 27
                        }, this),
                        pinned.map((id)=>{
                            const meta = pinnedMeta(id);
                            const win = windows.find((w)=>w.kind === meta.kind && w.appKey === meta.appKey);
                            const running = Boolean(win) && !win?.minimized;
                            const dotW = Math.max(5, Math.round(size * 0.3));
                            /* Task 45 — dfb pins show their DB title (not a dictionary key) */ const dfbLabel = id.startsWith("dfb-menu-") ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findMenuNode"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$dfb$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDfb"].getState().tree, Number(id.slice("dfb-menu-".length)))?.title : undefined;
                            const pinLabel = dfbLabel ?? t(meta.titleKey);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                title: pinLabel,
                                "aria-label": pinLabel,
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
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative flex shrink-0 items-center justify-center rounded-lg transition-all hover:bg-foreground/10 cursor-pointer", running && "bg-foreground/8"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PinnedGlyph, {
                                        id: id,
                                        size: size
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this),
                                    win && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: win.minimized ? Math.max(3, Math.round(dotW * 0.45)) : dotW
                                        },
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all", running ? "bg-primary" : "bg-muted-foreground/70")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                                        lineNumber: 224,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, id, true, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 207,
                                columnNumber: 15
                            }, this);
                        })
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/desktop/taskbar.tsx",
                    lineNumber: 194,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                asChild: true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    "aria-label": t("common.language"),
                                    className: "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors hover:bg-foreground/10 cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__["Languages"], {
                                            className: "h-4 w-4 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                                            lineNumber: 246,
                                            columnNumber: 15
                                        }, this),
                                        locale.toUpperCase()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/desktop/taskbar.tsx",
                                    lineNumber: 242,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                align: "end",
                                className: "max-h-72 overflow-y-auto scrollbar-slim",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCALES"].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                        onClick: ()=>setLocale(l),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(locale === l && "bg-accent font-semibold"),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-8 font-mono text-[10px] text-muted-foreground",
                                                children: l
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                                lineNumber: 257,
                                                columnNumber: 17
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LOCALE_NAMES"][l]
                                        ]
                                    }, l, true, {
                                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                                        lineNumber: 252,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-end leading-tight",
                        dir: "ltr",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium tabular-nums",
                                children: time
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] text-muted-foreground tabular-nums",
                                children: date
                            }, void 0, false, {
                                fileName: "[project]/src/components/desktop/taskbar.tsx",
                                lineNumber: 266,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/desktop/taskbar.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this),
            dragOverTaskbar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                dir: "auto",
                className: "acrylic menu-in pointer-events-none absolute -top-9 left-1/2 z-[9100] -translate-x-1/2 whitespace-nowrap rounded-full border bg-background/90 px-3 py-1 text-[11px] font-medium shadow-md",
                children: t("taskbar.dropHint")
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 272,
                columnNumber: 9
            }, this),
            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$desktop$2f$floating$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FloatingMenu"], {
                x: menu.x,
                y: menu.y,
                onClose: ()=>setMenu(null),
                items: [
                    {
                        label: t("ctx.unpinTaskbar"),
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pin$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PinOff$3e$__["PinOff"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/desktop/taskbar.tsx",
                            lineNumber: 289,
                            columnNumber: 21
                        }, this),
                        onSelect: ()=>{
                            unpinFromTaskbar(menu.id);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(t("taskbar.unpinnedToast"));
                        }
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/desktop/taskbar.tsx",
                lineNumber: 282,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/desktop/taskbar.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
}),
];})()

//# sourceMappingURL=src_components_desktop_1_tx_luephkwb._.js.map