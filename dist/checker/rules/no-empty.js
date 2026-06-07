import ts from "typescript";
import { posOf } from "../pos.js";
export const noEmpty = {
    name: "no-empty",
    visit(node, ctx) {
        if (!ts.isBlock(node))
            return;
        if (node.statements.length !== 0)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-empty", message: "Empty blocks are not allowed." });
    },
};
//# sourceMappingURL=no-empty.js.map