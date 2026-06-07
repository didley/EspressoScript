import ts from "typescript";
import { posOf } from "../pos.js";
export const noEmptyPattern = {
    name: "no-empty-pattern",
    visit(node, ctx) {
        if (ts.isObjectBindingPattern(node) && node.elements.length === 0) {
            const pos = posOf(ctx.sourceFile, node);
            ctx.push({ ...pos, rule: "no-empty-pattern", message: "Empty destructure has no effect." });
        }
        else if (ts.isArrayBindingPattern(node) && node.elements.length === 0) {
            const pos = posOf(ctx.sourceFile, node);
            ctx.push({ ...pos, rule: "no-empty-pattern", message: "Empty destructure has no effect." });
        }
    },
};
//# sourceMappingURL=no-empty-pattern.js.map