import ts from "typescript";
import { posOf } from "../pos.js";
export const noThis = {
    name: "no-this",
    visit(node, ctx) {
        if (node.kind === ts.SyntaxKind.ThisKeyword) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-this", message: "`this` is not allowed." });
        }
    },
};
//# sourceMappingURL=no-this.js.map