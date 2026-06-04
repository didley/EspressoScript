import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noDestructuringDefault: Rule = {
    name: "no-destructuring-default",
    visit(node, ctx) {
        if (!ts.isBindingElement(node)) return
        if (node.initializer === undefined) return
        const parent = node.parent
        if (!ts.isObjectBindingPattern(parent) && !ts.isArrayBindingPattern(parent)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-destructuring-default", message: "Defaults in destructuring rely on `undefined` (banned sentinel)." })
    },
}
