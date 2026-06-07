import ts from "typescript";
import { posOf } from "../pos.js";
export const requireReadonlyProperty = {
    name: "require-readonly-property",
    visit(node, ctx) {
        if (ts.isPropertySignature(node)) {
            const hasReadonly = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) ?? false;
            if (!hasReadonly) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "require-readonly-property", message: "Object type properties must be declared `readonly`." });
            }
        }
    },
};
//# sourceMappingURL=require-readonly-property.js.map