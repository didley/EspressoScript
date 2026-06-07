import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `throw` is not allowed. Return `[T, Error | null]` tuples. */
export const noThrow: Rule = {
    name: 'no-throw',
    visit(node, ctx): void {
        if (!ts.isThrowStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-throw', message: '`throw` is not allowed. Return `[T, Error | null]` tuples.' })
    },
}
