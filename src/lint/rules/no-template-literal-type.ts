import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Template literal types are not allowed. */
export const noTemplateLiteralType: Rule = {
    name: 'no-template-literal-type',
    visit(node, ctx): void {
        if (ts.isTemplateLiteralTypeNode(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-template-literal-type', message: 'Template literal types are not allowed.' })
        }
    },
}
