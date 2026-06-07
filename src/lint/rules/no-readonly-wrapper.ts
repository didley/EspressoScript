import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `Readonly<T>` is redundant; declare each property `readonly`. */
export const noReadonlyWrapper: Rule = {
    name: 'no-readonly-wrapper',
    visit(node, ctx): void {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.text === 'Readonly'
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-readonly-wrapper', message: '`Readonly<T>` is redundant; declare each property `readonly`.' })
        }
    },
}
