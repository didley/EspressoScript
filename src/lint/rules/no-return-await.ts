import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Ban `return await x` — redundant since no-try bans the only case where it differs. */
export const noReturnAwait: Rule = {
    name: 'no-return-await',
    visit(node, ctx): void {
        if (
            ts.isReturnStatement(node) &&
            node.expression !== undefined &&
            ts.isAwaitExpression(node.expression)
        ) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-return-await',
                message: 'return await is redundant; use return instead.',
            })
        }
    },
}
