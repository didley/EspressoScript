import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noObjectType: Rule = {
    name: "no-object-type",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.ObjectKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-object-type", message: "`object` / `Object` is not allowed. Use a specific type." })
        } else if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            (node.typeName as ts.Identifier).escapedText === "Object"
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-object-type", message: "`object` / `Object` is not allowed. Use a specific type." })
        }
    },
}
