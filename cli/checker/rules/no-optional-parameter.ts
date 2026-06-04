import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noOptionalParameter: Rule = {
    name: "no-optional-parameter",
    visit(node, ctx) {
        if (ts.isParameter(node) && node.questionToken !== undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-optional-parameter", message: "Optional parameters are not allowed. Use `| null` and require explicit values." })
        }
    },
}
