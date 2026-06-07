import ts from "typescript";
import { posOf } from "../pos.js";
export const noLabels = {
    name: "no-labels",
    visit(node, ctx) {
        if (ts.isLabeledStatement(node)) {
            const pos = posOf(ctx.sourceFile, node);
            ctx.push({ ...pos, rule: "no-labels", message: "Labels are not allowed. Extract a function and `return`." });
        }
        else if (ts.isBreakStatement(node) && node.label !== undefined) {
            const pos = posOf(ctx.sourceFile, node);
            ctx.push({ ...pos, rule: "no-labels", message: "Labels are not allowed. Extract a function and `return`." });
        }
        else if (ts.isContinueStatement(node) && node.label !== undefined) {
            const pos = posOf(ctx.sourceFile, node);
            ctx.push({ ...pos, rule: "no-labels", message: "Labels are not allowed. Extract a function and `return`." });
        }
    },
};
//# sourceMappingURL=no-labels.js.map