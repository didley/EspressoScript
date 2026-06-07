import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noVariadicTuple: Rule = {
    name: "no-variadic-tuple",
    visit(node, ctx) {
        if (ts.isTupleTypeNode(node)) {
            const hasRest = node.elements.some(el => ts.isRestTypeNode(el))
            if (hasRest) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-variadic-tuple", message: "Variadic tuples are not allowed. Give the rest a name in a struct type." })
            }
        }
    },
}
