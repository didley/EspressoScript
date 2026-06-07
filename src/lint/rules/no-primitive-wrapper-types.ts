import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const BANNED = new Set(['String', 'Number', 'Boolean', 'Symbol'])

/** Use the lowercase primitive type. */
export const noPrimitiveWrapperTypes: Rule = {
    name: 'no-primitive-wrapper-types',
    visit(node, ctx): void {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has(node.typeName.text)
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-primitive-wrapper-types', message: 'Use the lowercase primitive type.' })
        }
    },
}
