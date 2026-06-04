import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noAny: Rule = {
    name: "no-any",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-any", message: "`any` is not allowed. Use `unknown` or a concrete type." })
        }
    },
}
