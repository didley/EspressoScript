import ts from "typescript";
import { posOf } from "../pos.js";
export const noAndShorthand = {
    name: "no-and-shorthand",
    visit(node, ctx) {
        if (!ts.isExpressionStatement(node))
            return;
        const expr = node.expression;
        if (!ts.isBinaryExpression(expr))
            return;
        if (expr.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-and-shorthand", message: "Don't use `&&` as conditional execution. Use an `if` block." });
    },
};
//# sourceMappingURL=no-and-shorthand.js.map