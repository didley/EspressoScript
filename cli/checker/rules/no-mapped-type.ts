import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noMappedType: Rule = {
    name: "no-mapped-type",
    visit(node, ctx) {
        if (ts.isMappedTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-mapped-type", message: "Mapped types are not allowed." })
        }
    },
}
