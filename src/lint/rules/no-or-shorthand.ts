import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Don't use `||` as conditional execution — use an `if` block. */
export const noOrShorthand: Rule = {
    name: 'no-or-shorthand',
    visit(node, ctx): void {
        if (!ts.isExpressionStatement(node)) return
        const expr = node.expression
        if (!ts.isBinaryExpression(expr)) return
        if (expr.operatorToken.kind !== ts.SyntaxKind.BarBarToken) return
        ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-or-shorthand', message: "Don't use `||` as conditional execution. Use an `if` block." })
    },
}
