import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noEnum: Rule = {
    name: "no-enum",
    visit(node, ctx) {
        if (ts.isEnumDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-enum", message: "`enum` is not allowed. Use an `as const` object." })
        }
    },
}
