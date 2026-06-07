import ts from "typescript";
import { posOf } from "../pos.js";
const BANNED = new Set(["String", "Number", "Boolean", "Symbol"]);
export const noPrimitiveWrapperTypes = {
    name: "no-primitive-wrapper-types",
    visit(node, ctx) {
        if (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has(node.typeName.escapedText)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-primitive-wrapper-types", message: "Use the lowercase primitive type." });
        }
    },
};
//# sourceMappingURL=no-primitive-wrapper-types.js.map