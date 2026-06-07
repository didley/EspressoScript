import ts from "typescript";
import { posOf } from "../pos.js";
export const noAny = {
    name: "no-any",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-any", message: "`any` is not allowed. Use `unknown` or a concrete type." });
        }
    },
};
//# sourceMappingURL=no-any.js.map