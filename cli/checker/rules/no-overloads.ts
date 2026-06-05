import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noOverloads: Rule = {
    name: "no-overloads",
    visit(node, ctx) {
        if (ts.isFunctionDeclaration(node) && node.body === undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-overloads", message: "Function overloads are not allowed. Use a union parameter type instead." })
        }
        if (ts.isMethodDeclaration(node) && node.body === undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-overloads", message: "Method overloads are not allowed. Use a union parameter type instead." })
        }
    },
}
