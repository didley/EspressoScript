import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** One variable declaration per statement. */
export const noMultiVarDecl: Rule = {
    name: 'no-multi-var-decl',
    visit(node, ctx): void {
        if (!ts.isVariableDeclarationList(node)) return
        if (node.declarations.length <= 1) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: 'no-multi-var-decl', message: 'One variable declaration per statement.' })
    },
}
