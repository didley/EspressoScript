import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

function isAsConst(node: ts.AsExpression): boolean {
    const t = node.type
    return ts.isTypeReferenceNode(t) &&
        ts.isIdentifier(t.typeName) &&
        (t.typeName as ts.Identifier).escapedText === "const"
}

export const noAssertion: Rule = {
    name: "no-assertion",
    visit(node, ctx) {
        if (ts.isAsExpression(node)) {
            if (!isAsConst(node)) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-assertion", message: "Type assertions are not allowed. `as const` is the only exception." })
            }
        } else if (ts.isTypeAssertionExpression(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-assertion", message: "Type assertions are not allowed. `as const` is the only exception." })
        }
    },
}
