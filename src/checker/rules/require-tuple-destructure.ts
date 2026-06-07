import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const STD_FNS = new Set(["jsonParse", "jsonStringify", "safeFetch", "toResult", "toPromiseResult"])

function collectStdImports(sourceFile: ts.SourceFile): Set<string> {
    const imported = new Set<string>()
    for (const stmt of sourceFile.statements) {
        if (!ts.isImportDeclaration(stmt)) continue
        const spec = stmt.moduleSpecifier
        if (!ts.isStringLiteral(spec) || spec.text !== "shotscript/utils") continue
        const bindings = stmt.importClause?.namedBindings
        if (!bindings || !ts.isNamedImports(bindings)) continue
        for (const el of bindings.elements) {
            const name = el.name.escapedText as string
            if (STD_FNS.has(name)) imported.add(name)
        }
    }
    return imported
}

function walk(node: ts.Node, stdImports: Set<string>, ctx: Parameters<Rule["visit"]>[1]): void {
    if (ts.isVariableDeclaration(node)) {
        if (stdImports.size > 0 && ts.isIdentifier(node.name) && node.initializer) {
            let init = node.initializer
            // Peel one await
            if (ts.isAwaitExpression(init)) init = init.expression
            if (ts.isCallExpression(init)) {
                const callee = init.expression
                if (ts.isIdentifier(callee) && stdImports.has((callee as ts.Identifier).escapedText as string)) {
                    ctx.push({
                        ...posOf(ctx.sourceFile, node),
                        rule: "require-tuple-destructure",
                        message: `Tuple-returning calls must be destructured: use \`const [result, err] = ...\`.`,
                    })
                }
            }
        }
    }
    ts.forEachChild(node, child => walk(child, stdImports, ctx))
}

export const requireTupleDestructure: Rule = {
    name: "require-tuple-destructure",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile) return
        const stdImports = collectStdImports(node as ts.SourceFile)
        // Walk children only (SourceFile itself is not a VariableDeclaration)
        ts.forEachChild(node, child => walk(child, stdImports, ctx))
    },
}
