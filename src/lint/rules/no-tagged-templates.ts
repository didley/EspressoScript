import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Tagged template literals are not allowed. */
export const noTaggedTemplates: Rule = {
    name: 'no-tagged-templates',
    visit(node, ctx): void {
        if (!ts.isTaggedTemplateExpression(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-tagged-templates', message: 'Tagged template literals are not allowed.' })
    },
}
