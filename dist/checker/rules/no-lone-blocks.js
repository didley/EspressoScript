import ts from "typescript";
import { posOf } from "../pos.js";
export const noLoneBlocks = {
    name: "no-lone-blocks",
    visit(node, ctx) {
        if (!ts.isBlock(node))
            return;
        const parent = node.parent;
        if (!parent)
            return;
        const pk = parent.kind;
        if (pk === ts.SyntaxKind.SourceFile ||
            pk === ts.SyntaxKind.Block ||
            pk === ts.SyntaxKind.ModuleBlock) {
            const pos = posOf(ctx.sourceFile, node);
            ctx.push({ ...pos, rule: "no-lone-blocks", message: "Lone blocks are not allowed." });
        }
    },
};
//# sourceMappingURL=no-lone-blocks.js.map