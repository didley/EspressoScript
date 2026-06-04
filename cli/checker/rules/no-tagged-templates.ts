import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noTaggedTemplates: Rule = {
    name: "no-tagged-templates",
    visit(node, ctx) {
        if (!ts.isTaggedTemplateExpression(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-tagged-templates", message: "Tagged template literals are not allowed." })
    },
}
