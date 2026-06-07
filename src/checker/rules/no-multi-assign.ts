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

export const noMultiAssign: Rule = {
    name: "no-multi-assign",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node)) return
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return
        if (!ts.isBinaryExpression(node.right)) return
        if (!ASSIGN_OPS.has(node.right.operatorToken.kind)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-multi-assign", message: "Chained assignment (`a = b = c`) is not allowed." })
    },
}
