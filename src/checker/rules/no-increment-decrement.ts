import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noIncrementDecrement: Rule = {
    name: "no-increment-decrement",
    visit(node, ctx) {
        if (ts.isPostfixUnaryExpression(node)) {
            const op = node.operator
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                const pos = posOf(ctx.sourceFile, node)
                ctx.push({ ...pos, rule: "no-increment-decrement", message: "`++` and `--` are not allowed. Use `+= 1` or `-= 1`." })
            }
        } else if (ts.isPrefixUnaryExpression(node)) {
            const op = node.operator
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                const pos = posOf(ctx.sourceFile, node)
                ctx.push({ ...pos, rule: "no-increment-decrement", message: "`++` and `--` are not allowed. Use `+= 1` or `-= 1`." })
            }
        }
    },
}
