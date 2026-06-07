import ts from "typescript";
import { posOf } from "../pos.js";
export const noDecorators = {
    name: "no-decorators",
    visit(node, ctx) {
        if (ts.canHaveDecorators(node)) {
            const decorators = ts.getDecorators(node);
            if (decorators && decorators.length > 0) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-decorators", message: "Decorators are not allowed." });
            }
        }
    },
};
//# sourceMappingURL=no-decorators.js.map