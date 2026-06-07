import ts from "typescript";
import { posOf } from "../pos.js";
export const noReadonlyWrapper = {
    name: "no-readonly-wrapper",
    visit(node, ctx) {
        if (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.escapedText === "Readonly") {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-readonly-wrapper", message: "`Readonly<T>` is redundant; declare each property `readonly`." });
        }
    },
};
//# sourceMappingURL=no-readonly-wrapper.js.map