import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noThis: Rule = {
    name: "no-this",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.ThisKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-this", message: "`this` is not allowed." })
        }
    },
}
