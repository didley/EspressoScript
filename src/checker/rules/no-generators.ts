import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noGenerators: Rule = {
    name: "no-generators",
    visit(node, ctx) {
        if (
            (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) &&
            node.asteriskToken !== undefined
        ) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-generators", message: "Generators are not allowed." })
        } else if (ts.isYieldExpression(node)) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-generators", message: "Generators are not allowed." })
        }
    },
}
