import ts from "typescript";
import { posOf } from "../pos.js";
export const noCommaOperator = {
    name: "no-comma-operator",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node))
            return;
        if (node.operatorToken.kind !== ts.SyntaxKind.CommaToken)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-comma-operator", message: "Comma operator is not allowed." });
    },
};
//# sourceMappingURL=no-comma-operator.js.map