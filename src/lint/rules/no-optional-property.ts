import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Optional properties (`?:`) are not allowed. Use `| null` explicitly. */
export const noOptionalProperty: Rule = {
    name: 'no-optional-property',
    visit(node, ctx): void {
        if (ts.isPropertySignature(node) && node.questionToken !== undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-optional-property', message: 'Optional properties (`?:`) are not allowed. Use `| null` explicitly.' })
        }
    },
}
