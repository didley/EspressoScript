import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `enum` is not allowed. Use an `as const` object. */
export const noEnum: Rule = {
    name: 'no-enum',
    visit(node, ctx): void {
        if (ts.isEnumDeclaration(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-enum', message: '`enum` is not allowed. Use an `as const` object.' })
        }
    },
}
