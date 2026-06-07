import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `eval` is not allowed. */
export const noEval: Rule = {
    name: 'no-eval',
    visit(node, ctx): void {
        if (!ts.isCallExpression(node)) return
        const expr = node.expression
        if (!ts.isIdentifier(expr)) return
        if (expr.text !== 'eval') return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-eval', message: '`eval` is not allowed.' })
    },
}
