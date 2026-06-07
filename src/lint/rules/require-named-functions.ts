import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Function expressions must be named. */
export const requireNamedFunctions: Rule = {
    name: 'require-named-functions',
    visit(node, ctx): void {
        if (!ts.isFunctionExpression(node)) return
        if (node.name !== undefined) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'require-named-functions', message: 'Function expressions must be named.' })
    },
}
