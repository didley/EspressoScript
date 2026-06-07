import ts from "typescript";
import { posOf } from "../pos.js";
export const noDefaultExport = {
    name: "no-default-export",
    visit(node, ctx) {
        if (!ts.isExportAssignment(node))
            return;
        if (node.isExportEquals)
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-default-export", message: "Default exports are not allowed. Use named exports." });
    },
};
//# sourceMappingURL=no-default-export.js.map