import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Default exports are not allowed. Use named exports. */
export const noDefaultExport: Rule = {
    name: 'no-default-export',
    visit(node, ctx): void {
        if (!ts.isExportAssignment(node)) return
        if (node.isExportEquals === true) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.report({ ...pos, rule: 'no-default-export', message: 'Default exports are not allowed. Use named exports.' })
    },
}
