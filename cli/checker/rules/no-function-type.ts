import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noFunctionType: Rule = {
    name: "no-function-type",
    visit(node, ctx) {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            (node.typeName as ts.Identifier).escapedText === "Function"
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-function-type", message: "`Function` is not allowed. Declare the specific function signature." })
        }
    },
}
