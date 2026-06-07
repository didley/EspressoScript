import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noIn: Rule = {
    name: "no-in",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node)) return
        if (node.operatorToken.kind !== ts.SyntaxKind.InKeyword) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-in", message: "`in` operator is not allowed." })
    },
}
