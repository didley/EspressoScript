import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `for...in` is not allowed. Use `for...of` or indexed `for`. */
export const noForIn: Rule = {
    name: 'no-for-in',
    visit(node, ctx): void {
        if (!ts.isForInStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: 'no-for-in', message: '`for...in` is not allowed. Use `for...of` or indexed `for`.' })
    },
}
