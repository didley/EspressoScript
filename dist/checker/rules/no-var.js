import ts from "typescript";
import { posOf } from "../pos.js";
export const noVar = {
    name: "no-var",
    visit(node, ctx) {
        if (!ts.isVariableDeclarationList(node))
            return;
        if ((node.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const)) !== 0)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-var", message: "`var` is not allowed. Use `const`." });
    },
};
//# sourceMappingURL=no-var.js.map