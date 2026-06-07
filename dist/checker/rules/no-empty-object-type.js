import ts from "typescript";
import { posOf } from "../pos.js";
export const noEmptyObjectType = {
    name: "no-empty-object-type",
    visit(node, ctx) {
        if (ts.isTypeLiteralNode(node) && node.members.length === 0) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-empty-object-type", message: "`{}` is not allowed as a type. Use `unknown` or a specific shape." });
        }
    },
};
//# sourceMappingURL=no-empty-object-type.js.map