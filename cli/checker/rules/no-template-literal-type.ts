import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noTemplateLiteralType: Rule = {
    name: "no-template-literal-type",
    visit(node, ctx) {
        if (ts.isTemplateLiteralTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-template-literal-type", message: "Template literal types are not allowed." })
        }
    },
}
