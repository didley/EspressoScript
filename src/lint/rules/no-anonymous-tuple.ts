import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Tuple types must use named elements: `[value: T, err: E]` not `[T, E]`. */
export const noAnonymousTuple: Rule = {
    name: 'no-anonymous-tuple',
    visit(node, ctx): void {
        if (!ts.isTupleTypeNode(node)) return
        const hasUnnamed = node.elements.some(function isUnnamed(el: ts.TypeNode): boolean {
            return !ts.isNamedTupleMember(el) && !ts.isRestTypeNode(el)
        })
        if (hasUnnamed) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-anonymous-tuple',
                message: 'Tuple elements must be named: `[value: T, err: E]` not `[T, E]`.',
            })
        }
    },
}
