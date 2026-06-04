import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noTry: Rule = {
    name: "no-try",
    visit(node, ctx) {
        if (!ts.isTryStatement(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-try", message: "`try`/`catch`/`finally` is not allowed." })
    },
}
