import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noUndefinedType: Rule = {
    name: "no-undefined-type",
    visit(node, ctx) {
        // UndefinedKeyword only appears in type positions in the TS AST;
        // runtime `undefined` identifiers are Identifier nodes, not UndefinedKeyword.
        // Use `null` everywhere instead; use `void` for functions that return nothing.
        if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-undefined-type", message: "`undefined` is not allowed in types. Use `null` for absent values; use `void` for functions that return nothing." })
        }
    },
}
