import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noMultiVarDecl: Rule = {
    name: "no-multi-var-decl",
    visit(node, ctx) {
        if (!ts.isVariableDeclarationList(node)) return
        if (node.declarations.length <= 1) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-multi-var-decl", message: "One variable declaration per statement." })
    },
}
