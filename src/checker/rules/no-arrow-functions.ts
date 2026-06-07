import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noArrowFunctions: Rule = {
    name: "no-arrow-functions",
    visit(node, ctx) {
        if (!ts.isArrowFunction(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-arrow-functions", message: "Arrow functions are not allowed. Use the `function` keyword." })
    },
}
