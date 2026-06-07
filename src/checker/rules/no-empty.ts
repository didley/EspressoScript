import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noEmpty: Rule = {
    name: "no-empty",
    visit(node, ctx) {
        if (!ts.isBlock(node)) return
        if (node.statements.length !== 0) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-empty", message: "Empty blocks are not allowed." })
    },
}
