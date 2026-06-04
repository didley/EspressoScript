import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noDoWhile: Rule = {
    name: "no-do-while",
    visit(node, ctx) {
        if (!ts.isDoStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-do-while", message: "`do...while` is not allowed. Use `while`." })
    },
}
