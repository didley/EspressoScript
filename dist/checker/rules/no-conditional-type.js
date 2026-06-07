import ts from "typescript";
import { posOf } from "../pos.js";
function containsInfer(node) {
    if (ts.isInferTypeNode(node))
        return true;
    return !!ts.forEachChild(node, containsInfer);
}
export const noConditionalType = {
    name: "no-conditional-type",
    visit(node, ctx) {
        if (ts.isConditionalTypeNode(node)) {
            // If the conditional type contains `infer`, defer to no-infer to avoid double-reporting
            if (containsInfer(node))
                return;
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-conditional-type", message: "Conditional types are not allowed." });
        }
    },
};
//# sourceMappingURL=no-conditional-type.js.map