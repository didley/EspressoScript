import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `infer` is not allowed. */
export const noInfer: Rule = {
    name: 'no-infer',
    visit(node, ctx): void {
        if (ts.isInferTypeNode(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-infer', message: '`infer` is not allowed.' })
        }
    },
}
