import ts from "typescript";
import { posOf } from "../pos.js";
function hasAbstract(node) {
    return node.modifiers?.some(m => m.kind === ts.SyntaxKind.AbstractKeyword) ?? false;
}
function hasDecorator(node) {
    return node.modifiers?.some(m => m.kind === ts.SyntaxKind.Decorator) ?? false;
}
export const noClass = {
    name: "no-class",
    visit(node, ctx) {
        if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
            // Defer abstract classes to no-abstract and decorated to no-decorators
            if (hasAbstract(node) || hasDecorator(node))
                return;
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-class", message: "`class` is not allowed. Use plain objects + functions." });
        }
    },
};
//# sourceMappingURL=no-class.js.map