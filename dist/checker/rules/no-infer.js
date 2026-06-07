import ts from "typescript";
import { posOf } from "../pos.js";
export const noInfer = {
    name: "no-infer",
    visit(node, ctx) {
        if (ts.isInferTypeNode(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-infer", message: "`infer` is not allowed." });
        }
    },
};
//# sourceMappingURL=no-infer.js.map