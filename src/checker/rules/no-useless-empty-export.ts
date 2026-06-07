import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noUselessEmptyExport: Rule = {
    name: "no-useless-empty-export",
    visit(node, ctx) {
        if (!ts.isExportDeclaration(node)) return
        const clause = node.exportClause
        if (!clause) return
        if (!ts.isNamedExports(clause)) return
        if (clause.elements.length !== 0) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-useless-empty-export", message: "`export {}` is meaningless under `moduleDetection: force`." })
    },
}
