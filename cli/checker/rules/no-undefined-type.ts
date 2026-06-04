import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noUndefinedType: Rule = {
    name: "no-undefined-type",
    visit(node, ctx) {
        // UndefinedKeyword only appears in type positions in the TS AST;
        // runtime `undefined` identifiers are Identifier nodes, not UndefinedKeyword.
        if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-undefined-type", message: "`undefined` is not allowed in types. Use `null`." })
        }
    },
}
