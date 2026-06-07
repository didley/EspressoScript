import ts from "typescript";
import { posOf } from "../pos.js";
export const noEnum = {
    name: "no-enum",
    visit(node, ctx) {
        if (ts.isEnumDeclaration(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-enum", message: "`enum` is not allowed. Use an `as const` object." });
        }
    },
};
//# sourceMappingURL=no-enum.js.map