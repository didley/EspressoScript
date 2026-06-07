import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const BANNED = new Set(["Array", "ReadonlyArray"])

export const noArrayGeneric: Rule = {
    name: "no-array-generic",
    visit(node, ctx) {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has((node.typeName as ts.Identifier).escapedText as string)
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-array-generic", message: "Use `readonly T[]` instead of `Array<T>` or `ReadonlyArray<T>`." })
        }
    },
}
