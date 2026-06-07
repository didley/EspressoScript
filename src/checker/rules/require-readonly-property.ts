import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

export const requireReadonlyProperty: Rule = {
    name: "require-readonly-property",
    visit(node, ctx) {
        if (ts.isPropertySignature(node)) {
            const hasReadonly = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) ?? false
            if (!hasReadonly) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-readonly-property", message: "Object type properties must be declared `readonly`." })
            }
        }
    },
}
