import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noUnaryPlus: Rule = {
    name: "no-unary-plus",
    visit(node, ctx) {
        if (!ts.isPrefixUnaryExpression(node)) return
        if (node.operator !== ts.SyntaxKind.PlusToken) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-unary-plus", message: "Unary `+` coercion is not allowed. Use `Number()`." })
    },
}
