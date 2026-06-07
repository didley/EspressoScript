import ts from "typescript";
import { posOf } from "../pos.js";
export const noObjectType = {
    name: "no-object-type",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.ObjectKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-object-type", message: "`object` / `Object` is not allowed. Use a specific type." });
        }
        else if (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.escapedText === "Object") {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-object-type", message: "`object` / `Object` is not allowed. Use a specific type." });
        }
    },
};
//# sourceMappingURL=no-object-type.js.map