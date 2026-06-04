import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noIndexSignature: Rule = {
    name: "no-index-signature",
    visit(node, ctx) {
        if (ts.isIndexSignatureDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-index-signature", message: "Index signatures are not allowed. Use `Map<K, V>`." })
        }
    },
}
