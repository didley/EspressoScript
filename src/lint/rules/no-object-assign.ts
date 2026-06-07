import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Ban Object.assign — use object spread `{ ...a, ...b }` instead. */
export const noObjectAssign: Rule = {
    name: 'no-object-assign',
    visit(node, ctx): void {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'Object' &&
            node.expression.name.text === 'assign'
        ) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-object-assign',
                message: 'Object.assign mutates its target; use object spread `{ ...a, ...b }` instead.',
            })
        }
    },
}
