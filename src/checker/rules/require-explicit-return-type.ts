import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const requireExplicitReturnType: Rule = {
    name: "require-explicit-return-type",
    visit(node, ctx) {
        if (
            (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) &&
            node.type === undefined
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-explicit-return-type", message: "Function declarations must have an explicit return type annotation." })
        }
    },
}
