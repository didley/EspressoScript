import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noConstructorType: Rule = {
    name: "no-constructor-type",
    visit(node, ctx) {
        if (ts.isConstructorTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-constructor-type", message: "Constructor type signatures are not allowed (no classes)." })
        }
    },
}
