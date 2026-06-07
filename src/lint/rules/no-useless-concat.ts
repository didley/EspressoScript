import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Concatenating string literals — write a single literal. */
export const noUselessConcat: Rule = {
    name: 'no-useless-concat',
    visit(node, ctx): void {
        if (!ts.isBinaryExpression(node)) return
        if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) return
        if (!ts.isStringLiteral(node.left)) return
        if (!ts.isStringLiteral(node.right)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: 'no-useless-concat', message: 'Concatenating string literals — write a single literal.' })
    },
}
