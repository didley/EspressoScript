import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Array literals must not have holes. Use `null` for an explicit empty slot. */
export const noSparseArrays: Rule = {
    name: 'no-sparse-arrays',
    visit(node, ctx): void {
        if (!ts.isArrayLiteralExpression(node)) return
        for (const element of node.elements) {
            if (element.kind === ts.SyntaxKind.OmittedExpression) {
                ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-sparse-arrays', message: 'Sparse arrays are not allowed. Use `null` for an explicit empty slot.' })
                return
            }
        }
    },
}
