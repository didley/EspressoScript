import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noDoubleBang: Rule = {
    name: "no-double-bang",
    visit(node, ctx) {
        if (!ts.isPrefixUnaryExpression(node)) return
        if (node.operator !== ts.SyntaxKind.ExclamationToken) return
        const operand = node.operand
        if (!ts.isPrefixUnaryExpression(operand)) return
        if (operand.operator !== ts.SyntaxKind.ExclamationToken) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-double-bang", message: "`!!` is not allowed. Use `Boolean()`." })
    },
}
