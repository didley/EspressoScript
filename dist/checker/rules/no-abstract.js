import ts from "typescript";
import { posOf } from "../pos.js";
function hasAbstractModifier(node) {
    const mods = node.modifiers;
    return mods?.some(m => m.kind === ts.SyntaxKind.AbstractKeyword) ?? false;
}
export const noAbstract = {
    name: "no-abstract",
    visit(node, ctx) {
        if (ts.isClassDeclaration(node) && hasAbstractModifier(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-abstract", message: "`abstract` is not allowed." });
        }
        else if ((ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) &&
            hasAbstractModifier(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-abstract", message: "`abstract` is not allowed." });
        }
    },
};
//# sourceMappingURL=no-abstract.js.map