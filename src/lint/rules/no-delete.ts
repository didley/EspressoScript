import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `delete` is not allowed. */
export const noDelete: Rule = {
    name: 'no-delete',
    visit(node, ctx): void {
        if (!ts.isDeleteExpression(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-delete', message: '`delete` is not allowed.' })
    },
}
