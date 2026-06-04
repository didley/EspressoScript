import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noInterface: Rule = {
    name: "no-interface",
    visit(node, ctx) {
        if (ts.isInterfaceDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-interface", message: "`interface` is not allowed. Use `type`." })
        }
    },
}
