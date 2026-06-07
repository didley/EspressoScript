import ts from "typescript";
import { posOf } from "../pos.js";
export const noUselessConcat = {
    name: "no-useless-concat",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node))
            return;
        if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken)
            return;
        if (!ts.isStringLiteral(node.left))
            return;
        if (!ts.isStringLiteral(node.right))
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-useless-concat", message: "Concatenating string literals — write a single literal." });
    },
};
//# sourceMappingURL=no-useless-concat.js.map