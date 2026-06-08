import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function hasDefaultModifier(node: ts.Node): boolean {
    return ts.canHaveModifiers(node)
        && (ts.getModifiers(node) ?? []).some(function isDefault(m: ts.Modifier): boolean { return m.kind === ts.SyntaxKind.DefaultKeyword })
}

/** Default exports are not allowed. Use named exports. */
export const noDefaultExport: Rule = {
    name: 'no-default-export',
    visit(node, ctx): void {
        // `export default expr` / `export default class` (anonymous)
        if (ts.isExportAssignment(node) && node.isExportEquals !== true) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.report({ ...pos, rule: 'no-default-export', message: 'Default exports are not allowed. Use named exports.' })
            return
        }
        // `export default function foo()` / `export default class Foo {}`
        if (
            (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node))
            && hasDefaultModifier(node)
        ) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.report({ ...pos, rule: 'no-default-export', message: 'Default exports are not allowed. Use named exports.' })
        }
    },
}
