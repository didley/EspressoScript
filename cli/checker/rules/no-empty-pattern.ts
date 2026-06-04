import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noEmptyPattern: Rule = {
    name: "no-empty-pattern",
    visit(node, ctx) {
        if (ts.isObjectBindingPattern(node) && node.elements.length === 0) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-empty-pattern", message: "Empty destructure has no effect." })
        } else if (ts.isArrayBindingPattern(node) && node.elements.length === 0) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-empty-pattern", message: "Empty destructure has no effect." })
        }
    },
}
