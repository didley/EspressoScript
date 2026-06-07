import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `object` / `Object` is not allowed. Use a specific type. */
export const noObjectType: Rule = {
    name: 'no-object-type',
    visit(node, ctx): void {
        if (node.kind === ts.SyntaxKind.ObjectKeyword) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-object-type', message: '`object` / `Object` is not allowed. Use a specific type.' })
        } else if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.text === 'Object'
        ) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-object-type', message: '`object` / `Object` is not allowed. Use a specific type.' })
        }
    },
}
