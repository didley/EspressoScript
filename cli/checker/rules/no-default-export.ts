import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noDefaultExport: Rule = {
    name: "no-default-export",
    visit(node, ctx) {
        if (!ts.isExportAssignment(node)) return
        if (node.isExportEquals) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-default-export", message: "Default exports are not allowed. Use named exports." })
    },
}
