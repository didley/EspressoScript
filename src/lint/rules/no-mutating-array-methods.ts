import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const BANNED = new Set([
    'sort', 'reverse', 'splice', 'push', 'pop',
    'shift', 'unshift', 'fill', 'copyWithin',
])

const SUGGEST: ReadonlyMap<string, string> = new Map([
    ['sort', 'toSorted'],
    ['reverse', 'toReversed'],
    ['splice', 'toSpliced / with'],
    ['push', '[...xs, x] spread'],
    ['pop', 'toSpliced'],
    ['shift', 'toSpliced'],
    ['unshift', '[x, ...xs] spread'],
    ['fill', 'Array.from or map'],
    ['copyWithin', 'toSpliced / with'],
])

/** Ban mutating array methods; use ES2023 immutable alternatives instead. */
export const noMutatingArrayMethods: Rule = {
    name: 'no-mutating-array-methods',
    visit(node, ctx): void {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            BANNED.has(node.expression.name.text)
        ) {
            const method = node.expression.name.text
            const alt = SUGGEST.get(method) ?? 'an immutable alternative'
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-mutating-array-methods',
                message: `Use ${alt} instead of .${method}().`,
            })
        }
    },
}
