import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noInterface: Rule = {
    name: "no-interface",
    visit(node, ctx) {
        if (ts.isInterfaceDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-interface", message: "`interface` is not allowed. Use `type`." })
        }
    },
}
