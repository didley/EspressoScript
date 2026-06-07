import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Array types must be declared `readonly T[]`. */
export const requireReadonlyArrays: Rule = {
    name: 'require-readonly-arrays',
    visit(node, ctx): void {
        if (ts.isArrayTypeNode(node)) {
            const parent = node.parent
            const coveredByReadonly =
                ts.isTypeOperatorNode(parent) &&
                parent.operator === ts.SyntaxKind.ReadonlyKeyword
            if (!coveredByReadonly) {
                ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'require-readonly-arrays', message: 'Array types must be declared `readonly T[]`.' })
            }
        }
    },
}
