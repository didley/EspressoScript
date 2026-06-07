import ts from "typescript";
import { posOf } from "../pos.js";
export const noThrow = {
    name: "no-throw",
    visit(node, ctx) {
        if (!ts.isThrowStatement(node))
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-throw", message: "`throw` is not allowed. Return `[T, Error | null]` tuples." });
    },
};
//# sourceMappingURL=no-throw.js.map