import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Ban dynamic `import(...)` expressions — they defeat the static module graph. */
export const noDynamicImport: Rule = {
    name: 'no-dynamic-import',
    visit(node, ctx): void {
        if (
            ts.isCallExpression(node) &&
            node.expression.kind === ts.SyntaxKind.ImportKeyword
        ) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-dynamic-import',
                message: 'Dynamic import() is banned; use a static import.',
            })
        }
    },
}
