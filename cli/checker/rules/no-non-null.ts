import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noNonNull: Rule = {
    name: "no-non-null",
    visit(node, ctx) {
        if (ts.isNonNullExpression(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-non-null", message: "Non-null assertions (`!`) are not allowed." })
        }
    },
}
