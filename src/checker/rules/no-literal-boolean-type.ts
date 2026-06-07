import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

function isBooleanLiteral(node: ts.TypeNode): boolean {
    return ts.isLiteralTypeNode(node) &&
        (node.literal.kind === ts.SyntaxKind.TrueKeyword || node.literal.kind === ts.SyntaxKind.FalseKeyword)
}

export const noLiteralBooleanType: Rule = {
    name: "no-literal-boolean-type",
    visit(node, ctx) {
        if (ts.isUnionTypeNode(node) && node.types.length === 2) {
            const [a, b] = node.types
            if (a && b && isBooleanLiteral(a) && isBooleanLiteral(b)) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-literal-boolean-type", message: "`true | false` is just `boolean`." })
            }
        }
    },
}
