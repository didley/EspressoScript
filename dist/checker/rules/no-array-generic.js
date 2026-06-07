import ts from "typescript";
import { posOf } from "../pos.js";
const BANNED = new Set(["Array", "ReadonlyArray"]);
export const noArrayGeneric = {
    name: "no-array-generic",
    visit(node, ctx) {
        if (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            BANNED.has(node.typeName.escapedText)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-array-generic", message: "Use `readonly T[]` instead of `Array<T>` or `ReadonlyArray<T>`." });
        }
    },
};
//# sourceMappingURL=no-array-generic.js.map