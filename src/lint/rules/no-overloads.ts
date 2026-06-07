import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Function overloads are not allowed. Use a union parameter type instead. */
export const noOverloads: Rule = {
    name: 'no-overloads',
    visit(node, ctx): void {
        if (ts.isFunctionDeclaration(node) && node.body === undefined) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-overloads', message: 'Function overloads are not allowed. Use a union parameter type instead.' })
        }
        if (ts.isMethodDeclaration(node) && node.body === undefined) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-overloads', message: 'Method overloads are not allowed. Use a union parameter type instead.' })
        }
    },
}
