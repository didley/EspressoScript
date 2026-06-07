import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const VAR_KINDS = new Set([
    ts.SyntaxKind.Identifier,
    ts.SyntaxKind.PropertyAccessExpression,
    ts.SyntaxKind.CallExpression,
])

export const preferTemplate: Rule = {
    name: "prefer-template",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node)) return
        if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) return
        const left = node.left
        const right = node.right
        const leftIsStr = ts.isStringLiteral(left)
        const rightIsStr = ts.isStringLiteral(right)
        const leftIsVar = VAR_KINDS.has(left.kind)
        const rightIsVar = VAR_KINDS.has(right.kind)
        if (!((leftIsStr && rightIsVar) || (rightIsStr && leftIsVar))) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "prefer-template", message: "Use a template literal instead of `+`." })
    },
}
