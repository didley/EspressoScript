import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const ASSIGN_OPS = new Set([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken,
])

// Short-circuit ops that may have side effects on the RHS - handled by no-and-shorthand
const SHORTCIRCUIT_OPS = new Set([
    ts.SyntaxKind.AmpersandAmpersandToken,
    ts.SyntaxKind.BarBarToken,
    ts.SyntaxKind.QuestionQuestionToken,
])

function hasNoSideEffect(expr: ts.Expression): boolean {
    const k = expr.kind
    if (k === ts.SyntaxKind.Identifier) return true
    if (k === ts.SyntaxKind.PropertyAccessExpression) return true
    if (k === ts.SyntaxKind.ElementAccessExpression) return true
    if (ts.isBinaryExpression(expr)) {
        const op = expr.operatorToken.kind
        if (ASSIGN_OPS.has(op)) return false
        if (SHORTCIRCUIT_OPS.has(op)) return false
        return true
    }
    if (ts.isConditionalExpression(expr)) return true
    return false
}

export const noUnusedExpressions: Rule = {
    name: "no-unused-expressions",
    visit(node, ctx) {
        if (!ts.isExpressionStatement(node)) return
        if (!hasNoSideEffect(node.expression)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-unused-expressions", message: "Bare expression has no effect." })
    },
}
