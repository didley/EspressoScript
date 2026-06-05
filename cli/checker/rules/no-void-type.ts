import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noVoidType: Rule = {
    name: "no-void-type",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.VoidKeyword) return
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-void-type", message: "`void` is not allowed as a type. Use `undefined` instead." })
    },
}
