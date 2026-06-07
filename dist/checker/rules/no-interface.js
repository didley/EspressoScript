import ts from "typescript";
import { posOf } from "../pos.js";
export const noInterface = {
    name: "no-interface",
    visit(node, ctx) {
        if (ts.isInterfaceDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-interface", message: "`interface` is not allowed. Use `type`." });
        }
    },
};
//# sourceMappingURL=no-interface.js.map