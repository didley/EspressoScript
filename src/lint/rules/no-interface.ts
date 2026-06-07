import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** `interface` is not allowed. Use `type`. */
export const noInterface: Rule = {
    name: 'no-interface',
    visit(node, ctx): void {
        if (ts.isInterfaceDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-interface', message: '`interface` is not allowed. Use `type`.' })
        }
    },
}
