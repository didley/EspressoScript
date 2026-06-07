import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const BANNED = new Set([
    "Partial", "Required", "Record", "InstanceType", "ConstructorParameters",
    "ThisType", "Generator", "GeneratorFunction", "AsyncGenerator",
    "AsyncGeneratorFunction", "ClassDecorator", "MethodDecorator",
    "PropertyDecorator", "ParameterDecorator",
])

export const noBannedUtilityTypes: Rule = {
    name: "no-banned-utility-types",
    visit(node, ctx) {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has((node.typeName as ts.Identifier).escapedText as string)
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-banned-utility-types", message: "This utility type is banned. See `docs/LANGUAGE.md` for the canonical form." })
        }
    },
}
