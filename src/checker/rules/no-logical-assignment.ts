import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const LOGICAL_ASSIGN_OPS = new Set([
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken,
])

export const noLogicalAssignment: Rule = {
    name: "no-logical-assignment",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node)) return
        if (!LOGICAL_ASSIGN_OPS.has(node.operatorToken.kind)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-logical-assignment", message: "Logical assignment is not allowed. Spell it out." })
    },
}
