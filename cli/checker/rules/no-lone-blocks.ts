import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noLoneBlocks: Rule = {
    name: "no-lone-blocks",
    visit(node, ctx) {
        if (!ts.isBlock(node)) return
        const parent = node.parent
        if (!parent) return
        const pk = parent.kind
        if (
            pk === ts.SyntaxKind.SourceFile ||
            pk === ts.SyntaxKind.Block ||
            pk === ts.SyntaxKind.ModuleBlock
        ) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-lone-blocks", message: "Lone blocks are not allowed." })
        }
    },
}
