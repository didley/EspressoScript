import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const TERMINATORS = new Set([
    ts.SyntaxKind.BreakStatement,
    ts.SyntaxKind.ReturnStatement,
    ts.SyntaxKind.ThrowStatement,
    ts.SyntaxKind.ContinueStatement,
])

export const switchNoFallthrough: Rule = {
    name: "switch-no-fallthrough",
    visit(node, ctx) {
        if (!ts.isCaseClause(node)) return
        if (node.statements.length === 0) return
        const last = node.statements[node.statements.length - 1]!
        if (TERMINATORS.has(last.kind)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "switch-no-fallthrough", message: "Switch case must end with `break` or `return`." })
    },
}
