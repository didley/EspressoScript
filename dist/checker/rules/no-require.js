import ts from "typescript";
import { posOf } from "../pos.js";
export const noRequire = {
    name: "no-require",
    visit(node, ctx) {
        if (!ts.isCallExpression(node))
            return;
        const expr = node.expression;
        if (!ts.isIdentifier(expr))
            return;
        if (expr.text !== "require")
            return;
        const pos = posOf(ctx.sourceFile, node);
        ctx.push({ ...pos, rule: "no-require", message: "`require()` is not allowed. Use ESM `import`." });
    },
};
//# sourceMappingURL=no-require.js.map