import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Variadic tuples are not allowed. Give the rest a name in a struct type. */
export const noVariadicTuple: Rule = {
    name: 'no-variadic-tuple',
    visit(node, ctx): void {
        if (ts.isTupleTypeNode(node)) {
            const hasRest = node.elements.some(function isRest(el: ts.TypeNode): boolean {
                return ts.isRestTypeNode(el)
            })
            if (hasRest) {
                ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-variadic-tuple', message: 'Variadic tuples are not allowed. Give the rest a name in a struct type.' })
            }
        }
    },
}
