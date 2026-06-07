import ts from "typescript";
import { posOf } from "../pos.js";
export const noFunctionType = {
    name: "no-function-type",
    visit(node, ctx) {
        if (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.escapedText === "Function") {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-function-type", message: "`Function` is not allowed. Declare the specific function signature." });
        }
    },
};
//# sourceMappingURL=no-function-type.js.map