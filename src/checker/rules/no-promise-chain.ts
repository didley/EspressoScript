import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const CHAIN_METHODS = new Set(["then", "catch", "finally"])

export const noPromiseChain: Rule = {
    name: "no-promise-chain",
    visit(node, ctx) {
        if (!ts.isCallExpression(node)) return
        const expr = node.expression
        if (!ts.isPropertyAccessExpression(expr)) return
        if (!CHAIN_METHODS.has(expr.name.text)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-promise-chain", message: "Promise chains are not allowed. Use `async`/`await`." })
    },
}
