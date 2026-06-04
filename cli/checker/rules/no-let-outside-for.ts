import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noLetOutsideFor: Rule = {
    name: "no-let-outside-for",
    visit(node, ctx) {
        if (!ts.isVariableStatement(node)) return
        if ((node.declarationList.flags & ts.NodeFlags.Let) === 0) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-let-outside-for", message: "`let` is only allowed in a `for` header. Use `const`." })
    },
}
