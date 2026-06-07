import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const FN_KINDS = new Set([
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.ArrowFunction,
    ts.SyntaxKind.MethodDeclaration,
])

export const noUselessReturn: Rule = {
    name: "no-useless-return",
    visit(node, ctx) {
        if (!ts.isReturnStatement(node)) return
        if (node.expression !== undefined) return
        const parent = node.parent
        if (!ts.isBlock(parent)) return
        const stmts = parent.statements
        if (stmts.length === 0) return
        if (stmts[stmts.length - 1] !== node) return
        const grandParent = parent.parent
        if (!grandParent || !FN_KINDS.has(grandParent.kind)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-useless-return", message: "Trailing bare `return` is unnecessary." })
    },
}
