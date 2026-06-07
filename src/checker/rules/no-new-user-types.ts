import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const ALLOWED_CONSTRUCTORS = new Set([
    // Primitive wrappers — caught by no-new-wrappers, allowed here to avoid double-reporting
    "String", "Number", "Boolean", "Symbol",
    "Error", "TypeError", "RangeError", "SyntaxError",
    "Map", "Set", "WeakMap", "WeakSet",
    "Date", "URL", "URLSearchParams", "RegExp",
    "Promise",
    "Uint8Array", "Uint16Array", "Uint32Array",
    "Int8Array", "Int16Array", "Int32Array",
    "Float32Array", "Float64Array",
    "BigInt64Array", "BigUint64Array",
    "ArrayBuffer", "DataView",
    "TextDecoder", "TextEncoder",
    "AbortController", "AbortSignal",
    "EventTarget", "Event", "CustomEvent",
    "Headers", "Request", "Response",
    "Blob", "File", "FormData",
    "Worker",
])

export const noNewUserTypes: Rule = {
    name: "no-new-user-types",
    visit(node, ctx) {
        if (!ts.isNewExpression(node)) return
        const expr = node.expression
        if (!ts.isIdentifier(expr)) return
        if (ALLOWED_CONSTRUCTORS.has(expr.text)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-new-user-types", message: "`new` is only allowed on built-in runtime constructors." })
    },
}
