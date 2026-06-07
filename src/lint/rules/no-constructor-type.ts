import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Constructor type signatures are not allowed (no classes). */
export const noConstructorType: Rule = {
    name: 'no-constructor-type',
    visit(node, ctx): void {
        if (ts.isConstructorTypeNode(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-constructor-type', message: 'Constructor type signatures are not allowed (no classes).' })
        }
    },
}
