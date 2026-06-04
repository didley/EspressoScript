import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const requireNamedFunctions: Rule = {
    name: "require-named-functions",
    visit(node, ctx) {
        if (!ts.isFunctionExpression(node)) return
        if (node.name !== undefined) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "require-named-functions", message: "Function expressions must be named." })
    },
}
