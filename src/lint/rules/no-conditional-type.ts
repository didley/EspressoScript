import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function containsInfer(node: ts.Node): boolean {
    if (ts.isInferTypeNode(node)) return true
    return Boolean(ts.forEachChild(node, containsInfer))
}

/** Conditional types are not allowed. */
export const noConditionalType: Rule = {
    name: 'no-conditional-type',
    visit(node, ctx): void {
        if (ts.isConditionalTypeNode(node)) {
            // If the conditional type contains `infer`, defer to no-infer to avoid double-reporting
            if (containsInfer(node)) return
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-conditional-type', message: 'Conditional types are not allowed.' })
        }
    },
}
