import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noIntersectionTypes: Rule = {
    name: "no-intersection-types",
    visit(node, ctx) {
        if (ts.isIntersectionTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-intersection-types", message: "Intersection types are not allowed. Spell out the combined shape." })
        }
    },
}
