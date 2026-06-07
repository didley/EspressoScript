import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noAndShorthand: Rule = {
    name: "no-and-shorthand",
    visit(node, ctx) {
        if (!ts.isExpressionStatement(node)) return
        const expr = node.expression
        if (!ts.isBinaryExpression(expr)) return
        if (expr.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-and-shorthand", message: "Don't use `&&` as conditional execution. Use an `if` block." })
    },
}
