import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `do...while` is not allowed. Use `while`. */
export const noDoWhile: Rule = {
    name: 'no-do-while',
    visit(node, ctx): void {
        if (!ts.isDoStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-do-while', message: '`do...while` is not allowed. Use `while`.' })
    },
}
