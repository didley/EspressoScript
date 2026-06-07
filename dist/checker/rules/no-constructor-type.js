import ts from "typescript";
import { posOf } from "../pos.js";
export const noConstructorType = {
    name: "no-constructor-type",
    visit(node, ctx) {
        if (ts.isConstructorTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-constructor-type", message: "Constructor type signatures are not allowed (no classes)." });
        }
    },
};
//# sourceMappingURL=no-constructor-type.js.map