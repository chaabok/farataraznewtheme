(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
        lineNumber: 62,
        columnNumber: 10
    }, this);
}
_c = Divider;
function FormActionBar({ onReset, onSave, onSaveNew, onSaveClose, onCopy, onDelete, onDeleteNew, onDeleteClose, onPrint, onClose, onHelp, listItems, listLoading, onOpenListItem, canSave = true, canCopy = true, canDelete = true, canPrint = true, actions, className }) {
    _s();
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$settings$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useT"])();
    /* Task 48 — per-key visibility (undefined allowlist = everything shows) */ const show = (k)=>!actions || actions.includes(k);
    const hasReset = show("reset");
    const hasSaveGroup = show("save") || show("saveNew") || show("saveClose");
    const hasCopyDelete = show("copy") || show("delete") || show("deleteNew") || show("deleteClose");
    const hasPrintList = show("print") || show("list");
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
            hasReset && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$reset$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResetFieldsButton"], {
                onClick: onReset
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 122,
                columnNumber: 20
            }, this),
            hasReset && hasSaveGroup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 123,
                columnNumber: 36
            }, this),
            show("save") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SaveButton"], {
                onClick: onSave,
                disabled: !canSave
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 124,
                columnNumber: 24
            }, this),
            show("saveNew") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SaveNewButton"], {
                onClick: saveNew,
                disabled: !canSave || !saveNew
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 125,
                columnNumber: 27
            }, this),
            show("saveClose") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$save$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SaveCloseButton"], {
                onClick: saveClose,
                disabled: !canSave || !saveClose
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 126,
                columnNumber: 29
            }, this),
            hasSaveGroup && hasCopyDelete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 127,
                columnNumber: 41
            }, this),
            show("copy") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$copy$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CopyRecordButton"], {
                onClick: onCopy,
                disabled: !canCopy
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 128,
                columnNumber: 24
            }, this),
            show("delete") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeleteRecordButton"], {
                onClick: onDelete,
                disabled: !canDelete
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 129,
                columnNumber: 26
            }, this),
            show("deleteNew") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$new$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeleteNewButton"], {
                onClick: deleteNew,
                disabled: !canDelete || !deleteNew
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 130,
                columnNumber: 29
            }, this),
            show("deleteClose") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$delete$2d$close$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeleteCloseButton"], {
                onClick: deleteClose,
                disabled: !canDelete || !deleteClose
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 131,
                columnNumber: 31
            }, this),
            hasCopyDelete && hasPrintList && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 132,
                columnNumber: 41
            }, this),
            show("print") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$print$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PrintFormButton"], {
                onClick: print,
                disabled: !canPrint
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 133,
                columnNumber: 25
            }, this),
            show("list") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$list$2d$dropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RecordListDropdown"], {
                items: listItems,
                loading: listLoading,
                onOpenListItem: onOpenListItem
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 135,
                columnNumber: 9
            }, this),
            onHelp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$action$2d$bar$2f$help$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HelpButton"], {
                onClick: onHelp
            }, void 0, false, {
                fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
                lineNumber: 141,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/action-bar/form-action-bar.tsx",
        lineNumber: 117,
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

__turbopack_context__.s([
    "ACTION_BAR_KEYS",
    ()=>ACTION_BAR_KEYS
]);
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
const ACTION_BAR_KEYS = [
    "reset",
    "save",
    "saveNew",
    "saveClose",
    "copy",
    "delete",
    "deleteNew",
    "deleteClose",
    "print",
    "list"
];
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
    "FlowFieldGrid",
    ()=>FlowFieldGrid,
    "HeaderButton",
    ()=>HeaderButton,
    "NavButton",
    ()=>NavButton,
    "applyDateMask",
    ()=>applyDateMask,
    "normalizeDigits",
    ()=>normalizeDigits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/checkbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/select.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
/* ------------------------------------------------------------------ */ /* Task 49 — owner date mask (YYYY/MM/DD auto separators): typing the  */ /* 4-digit year inserts «/» automatically, then the 2-digit month does */ /* the same, then the 2-digit day. Persian/Arabic-Indic digits are     */ /* normalized; only 8 digits ever fit (max 10 chars with slashes).     */ /* ------------------------------------------------------------------ */ const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
function normalizeDigits(input) {
    let out = "";
    for (const ch of input){
        const fi = FA_DIGITS.indexOf(ch);
        if (fi >= 0) {
            out += String(fi);
        } else {
            const ai = AR_DIGITS.indexOf(ch);
            out += ai >= 0 ? String(ai) : ch;
        }
    }
    return out;
}
function applyDateMask(raw, isDeleting) {
    const digits = normalizeDigits(raw).replace(/[^0-9]/g, "").slice(0, 8);
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    let out = y;
    if (m) out += "/" + m;
    if (d) out += "/" + d;
    if (!isDeleting) {
        if (digits.length === 4) out += "/";
        else if (digits.length === 6) out += "/";
    }
    return out;
}
function FlowFieldGrid({ fields, onFieldChange, idPrefix = "sft", align, gridRef }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: gridRef,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-wrap", align === "center" && "justify-center", align === "end" && "justify-end"),
        children: fields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "box-border min-w-0 px-2.5 pb-2",
                style: {
                    width: `${f.widthPct ?? 50}%`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FieldCell, {
                    field: f,
                    onChange: onFieldChange,
                    idPrefix: idPrefix
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 108,
                    columnNumber: 11
                }, this)
            }, f.id, false, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/forms/form-primitives.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
_c = FlowFieldGrid;
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
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
_c1 = HeaderButton;
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
        lineNumber: 167,
        columnNumber: 5
    }, this);
}
_c2 = NavButton;
function FieldCell({ field, onChange, idPrefix = "sft" }) {
    _s();
    const type = field.type ?? "text";
    /* Task 27 — compact vertical metrics: field height 32px → 22px (−31%) so
     the tabs section and the form footer gain room. Horizontal metrics
     (label alignment, --label-w, gaps) are untouched. */ const inputBase = "h-5.5 min-w-0 text-xs";
    /* Task 49 — date-mask state (declared unconditionally — rules-of-hooks);
     only used by the date branch below */ const dateRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const lastMasked = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"]("");
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
                    lineNumber: 219,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "whitespace-nowrap",
                    children: field.label
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 226,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/forms/form-primitives.tsx",
            lineNumber: 215,
            columnNumber: 7
        }, this);
    }
    /* Task 47 — textarea: same label unit, small multi-line box (row grows) */ if (type === "textarea") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            "data-form-cell": true,
            className: "flex min-w-0 items-start gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    "data-form-label": true,
                    className: "flex shrink-0 items-center gap-0.5 whitespace-nowrap pt-0.5 text-xs text-muted-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "w-[var(--label-w,auto)] shrink-0 text-end",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "data-form-label-text": true,
                                className: "inline-block whitespace-nowrap",
                                children: field.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/form-primitives.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 239,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "opacity-70",
                            "aria-hidden": true,
                            children: ":"
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            "aria-hidden": true,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-rose-500", !field.required && "invisible"),
                            children: "*"
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 235,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    value: field.value ?? "",
                    rows: 2,
                    placeholder: field.placeholder,
                    readOnly: field.readOnly,
                    disabled: field.disabled,
                    "aria-label": field.label,
                    onChange: (e)=>onChange?.(field.id, e.target.value),
                    className: "min-h-10 min-w-0 flex-1 resize-y rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background disabled:opacity-50"
                }, void 0, false, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 251,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/forms/form-primitives.tsx",
            lineNumber: 234,
            columnNumber: 7
        }, this);
    }
    /* Task 47 — date: LTR YYYY/MM/DD input with an inline calendar chip
     (mirrors the design studio's date preview and the EAV string storage).
     Task 49 — owner mask: «/» auto-inserts after the 4-digit year and the
     2-digit month while typing; rejected keystrokes snap the DOM value back. */ if (type === "date") {
        const onDateChange = (e)=>{
            const deleting = e.target.value.length < lastMasked.current.length;
            const masked = applyDateMask(e.target.value, deleting);
            if (masked === lastMasked.current && dateRef.current) {
                /* keystroke rejected by the mask — force the controlled value back */ dateRef.current.value = masked;
            }
            lastMasked.current = masked;
            onChange?.(field.id, masked);
        };
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
                                lineNumber: 287,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 286,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "opacity-70",
                            "aria-hidden": true,
                            children: ":"
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 291,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            "aria-hidden": true,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-rose-500", !field.required && "invisible"),
                            children: "*"
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 294,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 282,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative min-w-0 flex-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                            ref: dateRef,
                            value: field.value ?? "",
                            placeholder: "YYYY/MM/DD",
                            inputMode: "numeric",
                            readOnly: field.readOnly,
                            disabled: field.disabled,
                            "aria-label": field.label,
                            dir: "ltr",
                            onChange: onDateChange,
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(inputBase, "pe-7 text-start")
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 299,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                            "aria-hidden": true,
                            className: "pointer-events-none absolute end-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/form-primitives.tsx",
                            lineNumber: 311,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/forms/form-primitives.tsx",
                    lineNumber: 298,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/forms/form-primitives.tsx",
            lineNumber: 281,
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
                            lineNumber: 331,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 330,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "opacity-70",
                        "aria-hidden": true,
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 335,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-rose-500", !field.required && "invisible"),
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 338,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 326,
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
                            lineNumber: 353,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 352,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                        children: (field.options ?? []).map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                value: o.value,
                                className: "text-xs",
                                children: o.label
                            }, o.value, false, {
                                fileName: "[project]/src/components/forms/form-primitives.tsx",
                                lineNumber: 357,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 355,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 347,
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
                        lineNumber: 365,
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
                            lineNumber: 382,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 376,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 364,
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
                        lineNumber: 388,
                        columnNumber: 11
                    }, this),
                    field.suffixChip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "pointer-events-none absolute end-1 top-1/2 flex h-4 -translate-y-1/2 items-center rounded-md bg-rose-500/15 px-1.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400",
                        children: field.suffixChip
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/form-primitives.tsx",
                        lineNumber: 400,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/form-primitives.tsx",
                lineNumber: 387,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/form-primitives.tsx",
        lineNumber: 321,
        columnNumber: 5
    }, this);
}
_s(FieldCell, "VdJZvd2JGSeIbubfeQ0JIT+D+wk=");
_c3 = FieldCell;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "FlowFieldGrid");
__turbopack_context__.k.register(_c1, "HeaderButton");
__turbopack_context__.k.register(_c2, "NavButton");
__turbopack_context__.k.register(_c3, "FieldCell");
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
        lineNumber: 205,
        columnNumber: 5
    }, this);
}
_c = MiniRowButton;
function SimpleFormTwoRowTabbed({ title, badge, icon, headerClassName, titleClassName, bodyStyle, fields, onFieldChange, labelScope = "container", tabs, defaultTabId, onTabRowsChange, onSaveRows, onFirst, onPrev, onNext, onLast, onReset, onSave, onSaveNew, onSaveClose, onCopy, onDelete, onDeleteNew, onDeleteClose, onPrint, onClose, onHelp, listItems, listLoading, onOpenListItem, canSave = true, canCopy = true, canDelete = true, canPrint = true, actions, fieldsAlign, onHeaderClose, onHeaderMaximize, onHeaderMinimize, headerMaximized, onHeaderDragStart, onHeaderDragMove, onHeaderDragEnd, onHeaderDoubleClick, className }) {
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
    /* Task 48 — flow mode when the dfb design supplies widths/alignment;
     legacy consumers (no widthPct, no fieldsAlign) keep the fixed grid */ const flowMode = Boolean(fieldsAlign && fieldsAlign !== "start") || fields.some((f)=>f.widthPct != null);
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
    /* Task 49 — the footer record buttons (+ / × / copy / save-rows) belong to
     GRID tabs (rows are created with the footer add button); while a
     "fields" tab is active they are hidden */ const activeTabDef = tabsProp.find((x)=>x.id === activeTab);
    const activeTabIsGrid = activeTabDef ? activeTabDef.kind !== "fields" : true;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        "data-simple-form": true,
        "aria-label": title,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-full min-h-0 flex-col overflow-hidden bg-background/25", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white", headerClassName),
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
                        lineNumber: 385,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("truncate text-sm font-bold tracking-tight drop-shadow-sm", titleClassName),
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 389,
                        columnNumber: 9
                    }, this),
                    badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25",
                        children: badge
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 391,
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
                                    lineNumber: 398,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 397,
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
                                    lineNumber: 404,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                    className: "h-3 w-3",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 406,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 402,
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
                                    lineNumber: 412,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 411,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 395,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 416,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 370,
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
                        canPrint: canPrint,
                        actions: actions
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 425,
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
                                    lineNumber: 458,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.first"),
                                onClick: onFirst
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 458,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 459,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.prev"),
                                onClick: onPrev
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 459,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 460,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.next"),
                                onClick: onNext
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 460,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NavButton"], {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$last$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLast$3e$__["ChevronLast"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 461,
                                    columnNumber: 30
                                }, this),
                                label: t("sft.last"),
                                onClick: onLast
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 461,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 453,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 424,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-slim",
                style: bodyStyle,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "shrink-0 px-4 pb-2 pt-2.5",
                        children: flowMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlowFieldGrid"], {
                            fields: fields,
                            onFieldChange: onFieldChange,
                            gridRef: fieldsGridRef,
                            align: fieldsAlign
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                            lineNumber: 478,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: fieldsGridRef,
                            className: "grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3",
                            children: fields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FieldCell"], {
                                    field: f,
                                    onChange: onFieldChange
                                }, f.id, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 490,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                            lineNumber: 485,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 476,
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
                                            lineNumber: 508,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 506,
                                    columnNumber: 15
                                }, this),
                                tabsProp.map((tb)=>{
                                    const rows = rowsByTab[tb.id] ?? [];
                                    /* Task 49 — "fields" tabs render input fields, not a grid */ if (tb.kind === "fields") {
                                        const tabFields = tb.fields ?? [];
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                                            value: tb.id,
                                            className: "mt-2 flex min-h-0 flex-1 flex-col",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                "data-simple-form-fields-tab": tb.id,
                                                className: "min-h-0 flex-1 overflow-auto rounded-xl border bg-background/70 scrollbar-slim",
                                                children: tabFields.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center gap-2 px-3 py-10 text-center text-muted-foreground",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"], {
                                                            className: "h-7 w-7 opacity-50",
                                                            "aria-hidden": true
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                            lineNumber: 532,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs",
                                                            children: t("dfb.studio.emptyFieldsTab")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                            lineNumber: 533,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                    lineNumber: 531,
                                                    columnNumber: 27
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "px-3 pb-1 pt-3",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlowFieldGrid"], {
                                                        fields: tabFields,
                                                        onFieldChange: onFieldChange,
                                                        align: fieldsAlign
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                    lineNumber: 536,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                lineNumber: 526,
                                                columnNumber: 23
                                            }, this)
                                        }, tb.id, false, {
                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                            lineNumber: 525,
                                            columnNumber: 21
                                        }, this);
                                    }
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
                                                                            lineNumber: 564,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, c.id, true, {
                                                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                    lineNumber: 554,
                                                                    columnNumber: 31
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                            lineNumber: 552,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                        lineNumber: 551,
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
                                                                            lineNumber: 577,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs",
                                                                            children: t("sft.noData")
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                            lineNumber: 578,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                    lineNumber: 576,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                lineNumber: 575,
                                                                columnNumber: 31
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                            lineNumber: 574,
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
                                                                            lineNumber: 596,
                                                                            columnNumber: 39
                                                                        }, this)
                                                                    }, c.id, false, {
                                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                        lineNumber: 595,
                                                                        columnNumber: 37
                                                                    }, this))
                                                            }, ri, false, {
                                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                                lineNumber: 586,
                                                                columnNumber: 33
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                        lineNumber: 572,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                                lineNumber: 550,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                            lineNumber: 546,
                                            columnNumber: 21
                                        }, this)
                                    }, tb.id, false, {
                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                        lineNumber: 545,
                                        columnNumber: 19
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                            lineNumber: 498,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 497,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 475,
                columnNumber: 7
            }, this),
            hasTabs && activeTabIsGrid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
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
                                    lineNumber: 631,
                                    columnNumber: 21
                                }, this),
                                label: t("sft.addRow"),
                                tintClass: "text-amber-500 hover:bg-amber-500/15",
                                onClick: addRow
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 630,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 637,
                                    columnNumber: 21
                                }, this),
                                label: t("sft.removeRow"),
                                tintClass: "text-rose-500 hover:bg-rose-500/15",
                                onClick: removeSelectedRow,
                                disabled: !selectedInActive
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 636,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                    lineNumber: 644,
                                    columnNumber: 21
                                }, this),
                                label: t("sft.copyRows"),
                                tintClass: "text-teal-500 hover:bg-teal-500/15",
                                onClick: copySelectedRow,
                                disabled: !selectedInActive
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 643,
                                columnNumber: 13
                            }, this),
                            onSaveRows && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": true,
                                        className: "mx-1 h-5 w-px bg-border"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                        lineNumber: 652,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniRowButton, {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                            lineNumber: 654,
                                            columnNumber: 25
                                        }, this),
                                        label: t("common.save"),
                                        tintClass: "text-emerald-500 hover:bg-emerald-500/15",
                                        onClick: ()=>onSaveRows(activeTab, rowsByTab[activeTab] ?? [])
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                        lineNumber: 653,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                                lineNumber: 651,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 629,
                        columnNumber: 11
                    }, this),
                    hasNav && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-muted-foreground",
                        "aria-live": "polite"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                        lineNumber: 663,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
                lineNumber: 628,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/simple-form-two-row-tabbed.tsx",
        lineNumber: 361,
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
                lineNumber: 166,
                columnNumber: 14
            }, this);
        case "flag":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 168,
                columnNumber: 14
            }, this);
        case "pin":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 170,
                columnNumber: 14
            }, this);
        case "folder":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                className: cls,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 172,
                columnNumber: 14
            }, this);
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(cls, "h-2.5 w-2.5"),
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 174,
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
function SimpleTreeForm({ treeTitle, nodes, defaultSelectedId = null, selectedId: selectedIdProp, onSelect, badge, icon, fields, onFieldChange, labelScope = "container", onReset, onSave, onSaveNew, onSaveClose, onCopy, onDelete, onDeleteNew, onDeleteClose, onPrint, onClose, onHelp, listItems, listLoading, onOpenListItem, canSave = true, canCopy = true, canDelete = true, canPrint = true, actions, fieldsAlign, detailTitleOverride, emptyText, detailExtra, treeEmptyText, onAddBranch, canAddBranch, onDeleteBranch, canDeleteBranch, addBranchLabel, deleteBranchLabel, headerClassName, titleClassName, bodyStyle, onHeaderClose, onHeaderMaximize, onHeaderMinimize, headerMaximized, onHeaderDragStart, onHeaderDragMove, onHeaderDragEnd, onHeaderDoubleClick, className }) {
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
                                lineNumber: 399,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "min-w-0 truncate",
                                children: node.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 401,
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
                                    lineNumber: 414,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 403,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 359,
                        columnNumber: 11
                    }, this),
                    open && node.children && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        role: "group",
                        className: "min-w-0",
                        children: renderNodes(node.children, depth + 1)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 425,
                        columnNumber: 13
                    }, this)
                ]
            }, node.id, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 358,
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
                            lineNumber: 446,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 445,
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
                                lineNumber: 455,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 448,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 444,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-h-0 min-w-0 flex-1 flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex h-11 shrink-0 select-none items-center gap-2.5 rtl:bg-gradient-to-l ltr:bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 px-3 text-white", headerClassName),
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
                                lineNumber: 480,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("truncate text-sm font-bold tracking-tight drop-shadow-sm", titleClassName),
                                children: detailTitle
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 484,
                                columnNumber: 11
                            }, this),
                            badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 ring-1 ring-inset ring-white/25",
                                children: badge
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 486,
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
                                            lineNumber: 493,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                        lineNumber: 492,
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
                                            lineNumber: 499,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                            className: "h-3 w-3",
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 501,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                        lineNumber: 497,
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
                                            lineNumber: 507,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                        lineNumber: 506,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 490,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": true,
                                className: "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25"
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                lineNumber: 511,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 465,
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
                            canPrint: canPrint,
                            actions: actions
                        }, void 0, false, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 519,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 518,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-h-0 flex-1 overflow-y-auto scrollbar-slim",
                        style: bodyStyle,
                        children: selected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 pb-2 pt-2.5",
                            children: [
                                fieldsAlign && fieldsAlign !== "start" || fields.some((f)=>f.widthPct != null) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlowFieldGrid"], {
                                    fields: fields,
                                    onFieldChange: onFieldChange,
                                    idPrefix: "stf",
                                    gridRef: fieldsGridRef,
                                    align: fieldsAlign
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 548,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: fieldsGridRef,
                                    className: "grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3",
                                    children: fields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$form$2d$primitives$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FieldCell"], {
                                            field: f,
                                            onChange: onFieldChange,
                                            idPrefix: "stf"
                                        }, f.id, false, {
                                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                            lineNumber: 561,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 556,
                                    columnNumber: 17
                                }, this),
                                detailExtra
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 546,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex h-full flex-col items-center justify-center gap-2 text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"], {
                                    className: "h-7 w-7 opacity-50",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 569,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs",
                                    children: emptyText ?? t("sft.noData")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                                    lineNumber: 570,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                            lineNumber: 568,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 544,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 462,
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
                                lineNumber: 600,
                                columnNumber: 17
                            }, this),
                            addBranchLabel ?? t("bs.addNode")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 591,
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
                                lineNumber: 614,
                                columnNumber: 17
                            }, this),
                            deleteBranchLabel ?? t("bs.deleteBranch")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                        lineNumber: 605,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/simple-tree-form.tsx",
                lineNumber: 582,
                columnNumber: 11
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/simple-tree-form.tsx",
        lineNumber: 438,
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
]);})()

//# sourceMappingURL=src_components_forms_096_2j797ips6._.js.map