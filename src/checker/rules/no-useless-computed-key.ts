import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

export const noUselessComputedKey: Rule = {
    name: "no-useless-computed-key",
    visit(node, ctx) {
        if (!ts.isComputedPropertyName(node)) return
        const expr = node.expression
        if (ts.isStringLiteral(expr) && IDENT_RE.test(expr.text)) {
            const pos = posOf(ctx.sourceFile, node)
            ctx.push({ ...pos, rule: "no-useless-computed-key", message: "Computed key is unnecessary — use the identifier form." })
        }
    },
}
