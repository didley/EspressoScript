import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const BANNED = new Set(["String", "Number", "Boolean", "Symbol"])

export const noPrimitiveWrapperTypes: Rule = {
    name: "no-primitive-wrapper-types",
    visit(node, ctx) {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has((node.typeName as ts.Identifier).escapedText as string)
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-primitive-wrapper-types", message: "Use the lowercase primitive type." })
        }
    },
}
