import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `any` is not allowed. Use `unknown` or a concrete type. */
export const noAny: Rule = {
    name: 'no-any',
    visit(node, ctx): void {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-any', message: '`any` is not allowed. Use `unknown` or a concrete type.' })
        }
    },
}
