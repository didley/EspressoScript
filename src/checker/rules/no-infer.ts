import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noInfer: Rule = {
    name: "no-infer",
    visit(node, ctx) {
        if (ts.isInferTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-infer", message: "`infer` is not allowed." })
        }
    },
}
