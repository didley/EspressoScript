import ts from "typescript";
import { posOf } from "../pos.js";
const STD_FNS = new Set(["jsonParse", "jsonStringify", "safeFetch", "toResult", "toPromiseResult"]);
function collectStdImports(sourceFile) {
    const imported = new Set();
    for (const stmt of sourceFile.statements) {
        if (!ts.isImportDeclaration(stmt))
            continue;
        const spec = stmt.moduleSpecifier;
        if (!ts.isStringLiteral(spec) || spec.text !== "shotscript/utils")
            continue;
        const bindings = stmt.importClause?.namedBindings;
        if (!bindings || !ts.isNamedImports(bindings))
            continue;
        for (const el of bindings.elements) {
            const name = el.name.escapedText;
            if (STD_FNS.has(name))
                imported.add(name);
        }
    }
    return imported;
}
function walk(node, stdImports, ctx) {
    if (ts.isVariableDeclaration(node)) {
        if (stdImports.size > 0 && ts.isIdentifier(node.name) && node.initializer) {
            let init = node.initializer;
            // Peel one await
            if (ts.isAwaitExpression(init))
                init = init.expression;
            if (ts.isCallExpression(init)) {
                const callee = init.expression;
                if (ts.isIdentifier(callee) && stdImports.has(callee.escapedText)) {
                    ctx.push({
                        ...posOf(ctx.sourceFile, node),
                        rule: "require-tuple-destructure",
                        message: `Tuple-returning calls must be destructured: use \`const [result, err] = ...\`.`,
                    });
                }
            }
        }
    }
    ts.forEachChild(node, child => walk(child, stdImports, ctx));
}
export const requireTupleDestructure = {
    name: "require-tuple-destructure",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile)
            return;
        const stdImports = collectStdImports(node);
        // Walk children only (SourceFile itself is not a VariableDeclaration)
        ts.forEachChild(node, child => walk(child, stdImports, ctx));
    },
};
//# sourceMappingURL=require-tuple-destructure.js.map