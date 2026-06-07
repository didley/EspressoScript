import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const STD_FNS = new Set(['jsonParse', 'jsonStringify', 'safeFetch', 'toResult', 'toPromiseResult'])

/** Collects the subset of STD_FNS imported from shotscript/std in this file. */
function collectStdImports(sourceFile: ts.SourceFile): ReadonlySet<string> {
    const imported = new Set<string>()
    for (const stmt of sourceFile.statements) {
        if (!ts.isImportDeclaration(stmt)) continue
        const spec = stmt.moduleSpecifier
        if (!ts.isStringLiteral(spec) || spec.text !== 'shotscript/std') continue
        const bindings = stmt.importClause?.namedBindings
        if (!bindings || !ts.isNamedImports(bindings)) continue
        for (const el of bindings.elements) {
            const name = el.name.text
            if (STD_FNS.has(name)) imported.add(name)
        }
    }
    return imported
}

function unwrapAwait(expr: ts.Expression): ts.Expression {
    if (ts.isAwaitExpression(expr)) return expr.expression
    return expr
}

function walk(node: ts.Node, stdImports: ReadonlySet<string>, ctx: Parameters<Rule['visit']>[1]): void {
    if (ts.isVariableDeclaration(node)) {
        if (stdImports.size > 0 && ts.isIdentifier(node.name) && node.initializer !== undefined) {
            const init = unwrapAwait(node.initializer)
            if (ts.isCallExpression(init)) {
                const callee = init.expression
                if (ts.isIdentifier(callee) && stdImports.has(callee.text)) {
                    ctx.push({
                        ...posOf(ctx.sourceFile, node),
                        rule: 'require-tuple-destructure',
                        message: 'Tuple-returning calls must be destructured: use `const [result, err] = ...`.',
                    })
                }
            }
        }
    }
    ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, stdImports, ctx) })
}

/** Tuple-returning calls must be destructured: use `const [result, err] = ...`. */
export const requireTupleDestructure: Rule = {
    name: 'require-tuple-destructure',
    visit(node, ctx): void {
        if (!ts.isSourceFile(node)) return
        const stdImports = collectStdImports(node)
        ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, stdImports, ctx) })
    },
}
