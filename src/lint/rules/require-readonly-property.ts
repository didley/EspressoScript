import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Object type properties must be declared `readonly`. */
export const requireReadonlyProperty: Rule = {
    name: 'require-readonly-property',
    visit(node, ctx): void {
        if (ts.isPropertySignature(node)) {
            const hasReadonly = node.modifiers?.some(function isReadonly(m: ts.ModifierLike): boolean {
                return m.kind === ts.SyntaxKind.ReadonlyKeyword
            }) ?? false
            if (!hasReadonly) {
                ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'require-readonly-property', message: 'Object type properties must be declared `readonly`.' })
            }
        }
    },
}
