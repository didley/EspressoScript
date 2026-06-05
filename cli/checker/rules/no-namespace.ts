import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noNamespace: Rule = {
    name: "no-namespace",
    visit(node, ctx) {
        if (!ts.isModuleDeclaration(node)) return
        const keyword = (node.flags & ts.NodeFlags.Namespace) !== 0 ? "namespace" : "module"
        ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-namespace", message: `\`${keyword}\` declarations are not allowed. Use ES modules instead.` })
    },
}
