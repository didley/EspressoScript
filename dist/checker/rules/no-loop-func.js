import ts from "typescript";
import { posOf } from "../pos.js";
const LOOP_KINDS = new Set([
    ts.SyntaxKind.ForStatement,
    ts.SyntaxKind.ForOfStatement,
    ts.SyntaxKind.ForInStatement,
    ts.SyntaxKind.WhileStatement,
    ts.SyntaxKind.DoStatement,
]);
const FN_KINDS = new Set([
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.ArrowFunction,
    ts.SyntaxKind.MethodDeclaration,
]);
function walk(node, inLoop, ctx) {
    const isLoop = LOOP_KINDS.has(node.kind);
    const isFn = FN_KINDS.has(node.kind);
    if (isFn && inLoop) {
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-loop-func", message: "Declaring a function inside a loop closes over the loop variable — extract it." });
        ts.forEachChild(node, (child) => walk(child, false, ctx));
        return;
    }
    ts.forEachChild(node, (child) => walk(child, inLoop || isLoop, ctx));
}
export const noLoopFunc = {
    name: "no-loop-func",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile)
            return;
        ts.forEachChild(node, (child) => walk(child, false, ctx));
    },
};
//# sourceMappingURL=no-loop-func.js.map