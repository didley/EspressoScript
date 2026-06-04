import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

export const noDecorators: Rule = {
    name: "no-decorators",
    visit(node, ctx) {
        if (ts.canHaveDecorators(node)) {
            const decorators = ts.getDecorators(node)
            if (decorators && decorators.length > 0) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-decorators", message: "Decorators are not allowed." })
            }
        }
    },
}
