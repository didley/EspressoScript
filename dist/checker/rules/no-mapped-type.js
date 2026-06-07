import ts from "typescript";
import { posOf } from "../pos.js";
export const noMappedType = {
    name: "no-mapped-type",
    visit(node, ctx) {
        if (ts.isMappedTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-mapped-type", message: "Mapped types are not allowed." });
        }
    },
};
//# sourceMappingURL=no-mapped-type.js.map