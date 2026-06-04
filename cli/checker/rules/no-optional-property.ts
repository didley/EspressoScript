import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noOptionalProperty: Rule = {
    name: "no-optional-property",
    visit(node, ctx) {
        if (ts.isPropertySignature(node) && node.questionToken !== undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-optional-property", message: "Optional properties (`?:`) are not allowed. Use `| null` explicitly." })
        }
    },
}
