import ts from "typescript";
import { posOf } from "../pos.js";
export const noTemplateLiteralType = {
    name: "no-template-literal-type",
    visit(node, ctx) {
        if (ts.isTemplateLiteralTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-template-literal-type", message: "Template literal types are not allowed." });
        }
    },
};
//# sourceMappingURL=no-template-literal-type.js.map