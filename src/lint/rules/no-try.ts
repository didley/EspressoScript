import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `try`/`catch`/`finally` is not allowed. */
export const noTry: Rule = {
    name: 'no-try',
    visit(node, ctx): void {
        if (!ts.isTryStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-try', message: '`try`/`catch`/`finally` is not allowed.' })
    },
}
