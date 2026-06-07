import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noSymbolType: Rule = {
    name: "no-symbol-type",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.SymbolKeyword) {
            // Skip the SymbolKeyword child of `unique symbol` — the TypeOperatorNode fires instead
            const parent = node.parent
            if (ts.isTypeOperatorNode(parent) && parent.operator === ts.SyntaxKind.UniqueKeyword) return
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-symbol-type", message: "`symbol` / `unique symbol` types are not allowed." })
        } else if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.UniqueKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-symbol-type", message: "`symbol` / `unique symbol` types are not allowed." })
        }
    },
}
