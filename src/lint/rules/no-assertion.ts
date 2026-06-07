import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function isAsConst(node: ts.AsExpression): boolean {
    const t = node.type
    return ts.isTypeReferenceNode(t) &&
        ts.isIdentifier(t.typeName) &&
        t.typeName.text === 'const'
}

/** Type assertions are not allowed. `as const` is the only exception. */
export const noAssertion: Rule = {
    name: 'no-assertion',
    visit(node, ctx): void {
        if (ts.isAsExpression(node)) {
            if (!isAsConst(node)) {
                ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-assertion', message: 'Type assertions are not allowed. `as const` is the only exception.' })
            }
        } else if (ts.isTypeAssertionExpression(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-assertion', message: 'Type assertions are not allowed. `as const` is the only exception.' })
        }
    },
}
