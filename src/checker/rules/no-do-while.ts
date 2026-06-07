import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noDoWhile: Rule = {
    name: "no-do-while",
    visit(node, ctx) {
        if (!ts.isDoStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-do-while", message: "`do...while` is not allowed. Use `while`." })
    },
}
