import ts from "typescript";
import { posOf } from "../pos.js";
export const noEval = {
    name: "no-eval",
    visit(node, ctx) {
        if (!ts.isCallExpression(node))
            return;
        const expr = node.expression;
        if (!ts.isIdentifier(expr))
            return;
        if (expr.text !== "eval")
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-eval", message: "`eval` is not allowed." });
    },
};
//# sourceMappingURL=no-eval.js.map