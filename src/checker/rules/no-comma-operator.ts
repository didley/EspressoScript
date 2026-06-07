import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noCommaOperator: Rule = {
    name: "no-comma-operator",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node)) return
        if (node.operatorToken.kind !== ts.SyntaxKind.CommaToken) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-comma-operator", message: "Comma operator is not allowed." })
    },
}
