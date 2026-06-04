import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noEmptyObjectType: Rule = {
    name: "no-empty-object-type",
    visit(node, ctx) {
        if (ts.isTypeLiteralNode(node) && node.members.length === 0) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-empty-object-type", message: "`{}` is not allowed as a type. Use `unknown` or a specific shape." })
        }
    },
}
