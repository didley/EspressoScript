import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Non-null assertions (`!`) are not allowed. */
export const noNonNull: Rule = {
    name: 'no-non-null',
    visit(node, ctx): void {
        if (ts.isNonNullExpression(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-non-null', message: 'Non-null assertions (`!`) are not allowed.' })
        }
    },
}
