import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noReadonlyWrapper: Rule = {
    name: "no-readonly-wrapper",
    visit(node, ctx) {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            (node.typeName as ts.Identifier).escapedText === "Readonly"
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-readonly-wrapper", message: "`Readonly<T>` is redundant; declare each property `readonly`." })
        }
    },
}
