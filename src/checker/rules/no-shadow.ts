import ts from "typescript"
import type { Rule, Context } from "../types.js"
import { posOf } from "../pos.js"

type ScopeFrame = {
    bindings: Map<string, ts.Node>
}

function collectNames(node: ts.BindingName): string[] {
    if (ts.isIdentifier(node)) return [node.text]
    const names: string[] = []
    for (const elem of node.elements) {
        if (ts.isBindingElement(elem)) names.push(...collectNames(elem.name))
        // OmittedExpression: skip
    }
    return names
}

function isDefinedAbove(scopes: ScopeFrame[], name: string): boolean {
    for (let i = scopes.length - 2; i >= 0; i--) {
        if (scopes[i]!.bindings.has(name)) return true
    }
    return false
}

function addBinding(
    scopes: ScopeFrame[],
    name: string,
    declNode: ts.Node,
    ctx: Context,
): void {
    if (isDefinedAbove(scopes, name)) {
        const pos = posOf(ctx.sourceFile, declNode)
        ctx.push({ ...pos, rule: "no-shadow", message: "Variable shadowing is not allowed. Rename the inner binding." })
    }
    scopes[scopes.length - 1]!.bindings.set(name, declNode)
}

function walk(node: ts.Node, scopes: ScopeFrame[], ctx: Context): void {
    if (ts.isFunctionDeclaration(node)) {
        if (node.name) {
            addBinding(scopes, node.name.text, node.name, ctx)
        }
        const frame: ScopeFrame = { bindings: new Map() }
        scopes.push(frame)
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) {
                addBinding(scopes, name, param.name, ctx)
            }
        }
        if (node.body) walk(node.body, scopes, ctx)
        scopes.pop()
    } else if (ts.isFunctionExpression(node)) {
        const frame: ScopeFrame = { bindings: new Map() }
        scopes.push(frame)
        if (node.name) {
            frame.bindings.set(node.name.text, node.name)
        }
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) {
                addBinding(scopes, name, param.name, ctx)
            }
        }
        if (node.body) walk(node.body, scopes, ctx)
        scopes.pop()
    } else if (ts.isArrowFunction(node)) {
        const frame: ScopeFrame = { bindings: new Map() }
        scopes.push(frame)
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) {
                addBinding(scopes, name, param.name, ctx)
            }
        }
        const body = node.body
        if (ts.isBlock(body)) {
            walk(body, scopes, ctx)
        } else {
            walk(body, scopes, ctx)
        }
        scopes.pop()
    } else if (ts.isBlock(node)) {
        const parent = node.parent
        const isFnBody = parent &&
            (ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isArrowFunction(parent))
        if (!isFnBody) {
            scopes.push({ bindings: new Map() })
        }
        ts.forEachChild(node, (child) => walk(child, scopes, ctx))
        if (!isFnBody) scopes.pop()
    } else if (ts.isVariableDeclaration(node)) {
        for (const name of collectNames(node.name)) {
            addBinding(scopes, name, node.name, ctx)
        }
        if (node.initializer) walk(node.initializer, scopes, ctx)
    } else if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) {
        scopes.push({ bindings: new Map() })
        ts.forEachChild(node, (child) => walk(child, scopes, ctx))
        scopes.pop()
    } else if (ts.isImportDeclaration(node)) {
        const clause = node.importClause
        if (clause) {
            if (clause.name) addBinding(scopes, clause.name.text, clause.name, ctx)
            if (clause.namedBindings) {
                if (ts.isNamespaceImport(clause.namedBindings)) {
                    addBinding(scopes, clause.namedBindings.name.text, clause.namedBindings.name, ctx)
                } else if (ts.isNamedImports(clause.namedBindings)) {
                    for (const spec of clause.namedBindings.elements) {
                        addBinding(scopes, spec.name.text, spec.name, ctx)
                    }
                }
            }
        }
    } else {
        ts.forEachChild(node, (child) => walk(child, scopes, ctx))
    }
}

export const noShadow: Rule = {
    name: "no-shadow",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile) return
        const scopes: ScopeFrame[] = [{ bindings: new Map() }]
        ts.forEachChild(node, (child) => walk(child, scopes, ctx))
    },
}
