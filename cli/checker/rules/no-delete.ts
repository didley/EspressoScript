import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noDelete: Rule = {
    name: "no-delete",
    visit(node, ctx) {
        if (!ts.isDeleteExpression(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-delete", message: "`delete` is not allowed." })
    },
}
