import ts from "typescript";
import { posOf } from "../pos.js";
export const noOptionalProperty = {
    name: "no-optional-property",
    visit(node, ctx) {
        if (ts.isPropertySignature(node) && node.questionToken !== undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-optional-property", message: "Optional properties (`?:`) are not allowed. Use `| null` explicitly." });
        }
    },
};
//# sourceMappingURL=no-optional-property.js.map