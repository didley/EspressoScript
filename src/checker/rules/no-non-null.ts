import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noNonNull: Rule = {
    name: "no-non-null",
    visit(node, ctx) {
        if (ts.isNonNullExpression(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-non-null", message: "Non-null assertions (`!`) are not allowed." })
        }
    },
}
