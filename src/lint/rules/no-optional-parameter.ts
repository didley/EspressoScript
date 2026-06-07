import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Optional parameters are not allowed. Use `| null` and require explicit values. */
export const noOptionalParameter: Rule = {
    name: 'no-optional-parameter',
    visit(node, ctx): void {
        if (ts.isParameter(node) && node.questionToken !== undefined) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-optional-parameter', message: 'Optional parameters are not allowed. Use `| null` and require explicit values.' })
        }
    },
}
