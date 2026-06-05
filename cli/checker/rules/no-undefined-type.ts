import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noUndefinedType: Rule = {
    name: "no-undefined-type",
    visit(node, ctx) {
        // Only ban `undefined` inside union types (string | undefined → string | null).
        // Standalone `undefined` as a return type annotation is permitted; it is the
        // idiomatic replacement for `void` (which is banned by no-void-type).
        if (node.kind !== ts.SyntaxKind.UndefinedKeyword) return
        if (!ts.isUnionTypeNode(node.parent)) return
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-undefined-type", message: "`undefined` is not allowed in union types. Use `null`." })
    },
}
