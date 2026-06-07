import ts from "typescript";
import { posOf } from "../pos.js";
export const noDefaultParameter = {
    name: "no-default-parameter",
    visit(node, ctx) {
        if (ts.isParameter(node) && node.initializer !== undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-default-parameter", message: "Default parameters are not allowed (uses `undefined` as sentinel). Wrap with a thin function instead." });
        }
    },
};
//# sourceMappingURL=no-default-parameter.js.map