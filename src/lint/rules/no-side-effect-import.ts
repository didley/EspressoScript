import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Ban bare side-effect imports (`import './setup'` with no bindings). */
export const noSideEffectImport: Rule = {
    name: 'no-side-effect-import',
    visit(node, ctx): void {
        if (ts.isImportDeclaration(node) && node.importClause === undefined) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-side-effect-import',
                message: 'Side-effect imports are banned; name what you import or remove the import.',
            })
        }
    },
}
