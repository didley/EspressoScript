import ts from "typescript";
import { posOf } from "../pos.js";
export const noLooseEquality = {
    name: "no-loose-equality",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node))
            return;
        const op = node.operatorToken.kind;
        if (op !== ts.SyntaxKind.EqualsEqualsToken && op !== ts.SyntaxKind.ExclamationEqualsToken)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-loose-equality", message: "Loose equality is not allowed. Use `===` / `!==`." });
    },
};
//# sourceMappingURL=no-loose-equality.js.map