import ts from "typescript";
import { posOf } from "../pos.js";
export const noMultiVarDecl = {
    name: "no-multi-var-decl",
    visit(node, ctx) {
        if (!ts.isVariableDeclarationList(node))
            return;
        if (node.declarations.length <= 1)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-multi-var-decl", message: "One variable declaration per statement." });
    },
};
//# sourceMappingURL=no-multi-var-decl.js.map