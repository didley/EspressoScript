import ts from "typescript";
import { posOf } from "../pos.js";
export const noOverloads = {
    name: "no-overloads",
    visit(node, ctx) {
        if (ts.isFunctionDeclaration(node) && node.body === undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-overloads", message: "Function overloads are not allowed. Use a union parameter type instead." });
        }
        if (ts.isMethodDeclaration(node) && node.body === undefined) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-overloads", message: "Method overloads are not allowed. Use a union parameter type instead." });
        }
    },
};
//# sourceMappingURL=no-overloads.js.map