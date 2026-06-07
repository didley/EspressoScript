import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noNamespace: Rule = {
    name: "no-namespace",
    visit(node, ctx) {
        if (!ts.isModuleDeclaration(node)) return
        const keyword = (node.flags & ts.NodeFlags.Namespace) !== 0 ? "namespace" : "module"
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-namespace", message: `\`${keyword}\` declarations are not allowed. Use ES modules instead.` })
    },
}
