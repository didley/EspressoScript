import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const noVoid: Rule = {
    name: "no-void",
    visit(node, ctx) {
        if (!ts.isVoidExpression(node)) return
        if (ts.isCallExpression(node.expression)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-void", message: "`void` is only allowed to explicitly discard a promise: `void someCall()`. Use `await` or direct assignment instead." })
    },
}
