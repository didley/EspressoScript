import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

function isParseNumberCall(node: ts.CallExpression): boolean {
    const expr = node.expression
    if (ts.isIdentifier(expr)) {
        return expr.text === "parseInt" || expr.text === "parseFloat"
    }
    if (ts.isPropertyAccessExpression(expr)) {
        const obj = expr.expression
        const name = expr.name.text
        if (ts.isIdentifier(obj) && obj.text === "Number") {
            return name === "parseInt" || name === "parseFloat"
        }
    }
    return false
}

export const noParseNumberFns: Rule = {
    name: "no-parse-number-fns",
    visit(node, ctx) {
        if (!ts.isCallExpression(node)) return
        if (!isParseNumberCall(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-parse-number-fns", message: "Use `Number()` instead of `parseInt` / `parseFloat`." })
    },
}
