import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const WRAPPER_TYPES = new Set(["String", "Number", "Boolean", "Symbol"])

export const noNewWrappers: Rule = {
    name: "no-new-wrappers",
    visit(node, ctx) {
        if (!ts.isNewExpression(node)) return
        const expr = node.expression
        if (!ts.isIdentifier(expr)) return
        if (!WRAPPER_TYPES.has(expr.text)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-new-wrappers", message: "`new String/Number/Boolean/Symbol` creates wrapped primitives — use the function call form." })
    },
}
