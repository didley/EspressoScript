import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const ASSIGN_OPS = new Set([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
])

export const noReturnAssign: Rule = {
    name: "no-return-assign",
    visit(node, ctx) {
        if (!ts.isReturnStatement(node)) return
        const expr = node.expression
        if (!expr) return
        if (!ts.isBinaryExpression(expr)) return
        if (!ASSIGN_OPS.has(expr.operatorToken.kind)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-return-assign", message: "Return value cannot be an assignment expression." })
    },
}
