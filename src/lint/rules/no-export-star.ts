import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Ban `export * from './x'` and `export * as ns from './x'`; use named re-exports. */
export const noExportStar: Rule = {
    name: 'no-export-star',
    visit(node, ctx): void {
        if (!ts.isExportDeclaration(node)) return
        if (
            node.exportClause === undefined ||
            ts.isNamespaceExport(node.exportClause)
        ) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-export-star',
                message: 'export * is banned; use named re-exports for grep-ability.',
            })
        }
    },
}
