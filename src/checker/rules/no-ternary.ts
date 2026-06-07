import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noTernary: Rule = {
    name: "no-ternary",
    visit(node, ctx) {
        if (!ts.isConditionalExpression(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-ternary", message: "Ternary expressions are not allowed. Use a named function." })
    },
}
