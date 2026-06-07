import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const ALTS: ReadonlyMap<string, string> = new Map([
    ['hasOwnProperty', 'Object.hasOwn'],
    ['isPrototypeOf', 'Object.getPrototypeOf'],
    ['propertyIsEnumerable', 'Object.getOwnPropertyDescriptor'],
])

/** Ban prototype method calls — use Object.hasOwn etc. instead. */
export const noPrototypeMethodCall: Rule = {
    name: 'no-prototype-method-call',
    visit(node, ctx): void {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ALTS.has(node.expression.name.text)
        ) {
            const method = node.expression.name.text
            const alt = ALTS.get(method) ?? 'an Object.* alternative'
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-prototype-method-call',
                message: `Use ${alt} instead of .${method}().`,
            })
        }
    },
}
