import ts from "typescript";
import { posOf } from "../pos.js";
export const noTernary = {
    name: "no-ternary",
    visit(node, ctx) {
        if (!ts.isConditionalExpression(node))
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-ternary", message: "Ternary expressions are not allowed. Use a named function." });
    },
};
//# sourceMappingURL=no-ternary.js.map