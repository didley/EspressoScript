import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Ban get/set accessors in object literals — they smuggle hidden behavior. */
export const noObjectLiteralAccessors: Rule = {
    name: 'no-object-literal-accessors',
    visit(node, ctx): void {
        if (!ts.isObjectLiteralExpression(node)) return
        for (const prop of node.properties) {
            if (ts.isGetAccessorDeclaration(prop)) {
                ctx.report({
                    ...posOf(ctx.sourceFile, prop),
                    rule: 'no-object-literal-accessors',
                    message: 'get accessors in object literals are banned; use a plain property or function.',
                })
            } else if (ts.isSetAccessorDeclaration(prop)) {
                ctx.report({
                    ...posOf(ctx.sourceFile, prop),
                    rule: 'no-object-literal-accessors',
                    message: 'set accessors in object literals are banned; use a plain property or function.',
                })
            }
        }
    },
}
