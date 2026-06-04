import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

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
