import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noIndexSignature: Rule = {
    name: "no-index-signature",
    visit(node, ctx) {
        if (ts.isIndexSignatureDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-index-signature", message: "Index signatures are not allowed. Use `Map<K, V>`." })
        }
    },
}
