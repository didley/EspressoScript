import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

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

export const noBitwise: Rule = {
    name: "no-bitwise",
    visit(node, ctx) {
        if (ts.isBinaryExpression(node) && BITWISE_BINARY.has(node.operatorToken.kind)) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-bitwise", message: "Bitwise operators are not allowed." })
        } else if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.TildeToken) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-bitwise", message: "Bitwise operators are not allowed." })
        }
    },
}
