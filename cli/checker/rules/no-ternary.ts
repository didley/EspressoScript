import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noTernary: Rule = {
    name: "no-ternary",
    visit(node, ctx) {
        if (!ts.isConditionalExpression(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-ternary", message: "Ternary expressions are not allowed. Use a named function." })
    },
}
