import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noInfer: Rule = {
    name: "no-infer",
    visit(node, ctx) {
        if (ts.isInferTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-infer", message: "`infer` is not allowed." })
        }
    },
}
