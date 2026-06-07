import ts from "typescript";
import { posOf } from "../pos.js";
export const noUnaryPlus = {
    name: "no-unary-plus",
    visit(node, ctx) {
        if (!ts.isPrefixUnaryExpression(node))
            return;
        if (node.operator !== ts.SyntaxKind.PlusToken)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-unary-plus", message: "Unary `+` coercion is not allowed. Use `Number()`." });
    },
};
//# sourceMappingURL=no-unary-plus.js.map