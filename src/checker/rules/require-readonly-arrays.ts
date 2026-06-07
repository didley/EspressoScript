import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const requireReadonlyArrays: Rule = {
    name: "require-readonly-arrays",
    visit(node, ctx) {
        if (ts.isArrayTypeNode(node)) {
            const parent = node.parent
            const coveredByReadonly =
                ts.isTypeOperatorNode(parent) &&
                parent.operator === ts.SyntaxKind.ReadonlyKeyword
            if (!coveredByReadonly) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-readonly-arrays", message: "Array types must be declared `readonly T[]`." })
            }
        }
    },
}
