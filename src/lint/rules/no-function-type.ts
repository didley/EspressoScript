import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `Function` is not allowed. Declare the specific function signature. */
export const noFunctionType: Rule = {
    name: 'no-function-type',
    visit(node, ctx): void {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.text === 'Function'
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-function-type', message: '`Function` is not allowed. Declare the specific function signature.' })
        }
    },
}
