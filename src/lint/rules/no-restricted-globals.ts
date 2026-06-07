import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const BANNED: ReadonlyMap<string, string> = new Map([
    ['isNaN', 'Use Number.isNaN instead of isNaN.'],
    ['isFinite', 'Use Number.isFinite instead of isFinite.'],
    ['hasOwnProperty', 'Use Object.hasOwn instead of hasOwnProperty.'],
])

/** Ban legacy global functions that have safer typed alternatives. */
export const noRestrictedGlobals: Rule = {
    name: 'no-restricted-globals',
    visit(node, ctx): void {
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            BANNED.has(node.expression.text)
        ) {
            const message = BANNED.get(node.expression.text)
            if (message === undefined) return
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-restricted-globals', message })
        }
    },
}
