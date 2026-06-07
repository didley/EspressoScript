import ts from "typescript";
import { posOf } from "../pos.js";
export const noIn = {
    name: "no-in",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node))
            return;
        if (node.operatorToken.kind !== ts.SyntaxKind.InKeyword)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-in", message: "`in` operator is not allowed." });
    },
};
//# sourceMappingURL=no-in.js.map