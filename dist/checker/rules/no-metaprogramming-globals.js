import ts from "typescript";
import { posOf } from "../pos.js";
const BANNED_GLOBALS = new Set(["Proxy", "Reflect", "Function", "Symbol"]);
const BANNED_OBJECT_METHODS = new Set([
    "create", "assign", "defineProperty", "defineProperties",
    "getOwnPropertyDescriptor", "getOwnPropertyDescriptors",
    "getOwnPropertyNames", "getOwnPropertySymbols",
    "getPrototypeOf", "setPrototypeOf",
]);
export const noMetaprogrammingGlobals = {
    name: "no-metaprogramming-globals",
    visit(node, ctx) {
        if (ts.isIdentifier(node)) {
            const name = node.escapedText;
            if (BANNED_GLOBALS.has(name)) {
                // Skip when in type position (TypeReferenceNode's typeName)
                if (ts.isTypeReferenceNode(node.parent))
                    return;
                // Skip when it's the property name part of a PropertyAccessExpression
                if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)
                    return;
                // Skip import bindings
                if (ts.isImportSpecifier(node.parent) || ts.isImportClause(node.parent))
                    return;
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-metaprogramming-globals", message: "Metaprogramming globals are banned." });
            }
        }
        else if (ts.isPropertyAccessExpression(node)) {
            const expr = node.expression;
            if (ts.isIdentifier(expr) &&
                expr.escapedText === "Object" &&
                BANNED_OBJECT_METHODS.has(node.name.escapedText)) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-metaprogramming-globals", message: "Metaprogramming globals are banned." });
            }
        }
    },
};
//# sourceMappingURL=no-metaprogramming-globals.js.map