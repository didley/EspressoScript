import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noEmptyObjectType: Rule = {
    name: "no-empty-object-type",
    visit(node, ctx) {
        if (ts.isTypeLiteralNode(node) && node.members.length === 0) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-empty-object-type", message: "`{}` is not allowed as a type. Use `unknown` or a specific shape." })
        }
    },
}
