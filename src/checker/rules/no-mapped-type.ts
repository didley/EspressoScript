import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noMappedType: Rule = {
    name: "no-mapped-type",
    visit(node, ctx) {
        if (ts.isMappedTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-mapped-type", message: "Mapped types are not allowed." })
        }
    },
}
