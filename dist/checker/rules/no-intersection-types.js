import ts from "typescript";
import { posOf } from "../pos.js";
export const noIntersectionTypes = {
    name: "no-intersection-types",
    visit(node, ctx) {
        if (ts.isIntersectionTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-intersection-types", message: "Intersection types are not allowed. Spell out the combined shape." });
        }
    },
};
//# sourceMappingURL=no-intersection-types.js.map