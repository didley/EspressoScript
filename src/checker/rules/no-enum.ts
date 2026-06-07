import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noEnum: Rule = {
    name: "no-enum",
    visit(node, ctx) {
        if (ts.isEnumDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-enum", message: "`enum` is not allowed. Use an `as const` object." })
        }
    },
}
