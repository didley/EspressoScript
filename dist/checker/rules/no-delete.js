import ts from "typescript";
import { posOf } from "../pos.js";
export const noDelete = {
    name: "no-delete",
    visit(node, ctx) {
        if (!ts.isDeleteExpression(node))
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-delete", message: "`delete` is not allowed." });
    },
};
//# sourceMappingURL=no-delete.js.map