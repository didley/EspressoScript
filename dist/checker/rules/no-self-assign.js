import ts from "typescript";
import { posOf } from "../pos.js";
function nodeText(node, sf) {
    return sf.text.slice(node.getStart(sf), node.getEnd());
}
export const noSelfAssign = {
    name: "no-self-assign",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node))
            return;
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken)
            return;
        const lText = nodeText(node.left, ctx.sourceFile);
        const rText = nodeText(node.right, ctx.sourceFile);
        if (lText !== rText)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-self-assign", message: "Self-assignment has no effect." });
    },
};
//# sourceMappingURL=no-self-assign.js.map