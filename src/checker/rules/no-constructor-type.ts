import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noConstructorType: Rule = {
    name: "no-constructor-type",
    visit(node, ctx) {
        if (ts.isConstructorTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-constructor-type", message: "Constructor type signatures are not allowed (no classes)." })
        }
    },
}
