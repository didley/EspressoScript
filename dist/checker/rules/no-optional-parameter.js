import ts from "typescript";
import { posOf } from "../pos.js";
export const noOptionalParameter = {
    name: "no-optional-parameter",
    visit(node, ctx) {
        if (ts.isParameter(node) && node.questionToken !== undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-optional-parameter", message: "Optional parameters are not allowed. Use `| null` and require explicit values." });
        }
    },
};
//# sourceMappingURL=no-optional-parameter.js.map