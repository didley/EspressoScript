import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const BITWISE_BINARY = new Set([
    ts.SyntaxKind.AmpersandToken,
    ts.SyntaxKind.BarToken,
    ts.SyntaxKind.CaretToken,
    ts.SyntaxKind.LessThanLessThanToken,
    ts.SyntaxKind.GreaterThanGreaterThanToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
])

function isTsFlagsExpr(node: ts.Node): boolean {
    if (ts.isParenthesizedExpression(node)) return isTsFlagsExpr(node.expression)
    if (ts.isPropertyAccessExpression(node)) {
        const expr = node.expression
        if (ts.isIdentifier(expr) && expr.text === 'ts') return true
        return isTsFlagsExpr(expr)
    }
    if (ts.isBinaryExpression(node)) {
        return isTsFlagsExpr(node.left) || isTsFlagsExpr(node.right)
    }
    return false
}

/** Bitwise operators are not allowed. */
export const noBitwise: Rule = {
    name: 'no-bitwise',
    visit(node, ctx): void {
        if (ts.isBinaryExpression(node) && BITWISE_BINARY.has(node.operatorToken.kind)) {
            if (isTsFlagsExpr(node.left) || isTsFlagsExpr(node.right)) return
            const pos = posOf(ctx.sourceFile, node)
            ctx.report({ ...pos, rule: 'no-bitwise', message: 'Bitwise operators are not allowed.' })
        } else if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.TildeToken) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.report({ ...pos, rule: 'no-bitwise', message: 'Bitwise operators are not allowed.' })
        }
    },
}
