import ts from "typescript";
import { posOf } from "../pos.js";
const CMP_OPS = new Set([
    ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ts.SyntaxKind.EqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken,
]);
function nodeText(node, sf) {
    return sf.text.slice(node.getStart(sf), node.getEnd());
}
export const noSelfCompare = {
    name: "no-self-compare",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node))
            return;
        if (!CMP_OPS.has(node.operatorToken.kind))
            return;
        const lText = nodeText(node.left, ctx.sourceFile);
        const rText = nodeText(node.right, ctx.sourceFile);
        if (lText !== rText)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-self-compare", message: "Comparing a value to itself is a bug or a NaN-check abuse — use `Number.isNaN()`." });
    },
};
//# sourceMappingURL=no-self-compare.js.map