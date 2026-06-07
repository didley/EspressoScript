import ts from 'typescript'
import type { Rule, Context } from '../types.js'
import { posOf } from '../pos.js'

const _SCOPE_BINDINGS_PROTO = new Map<string, ts.Node>()

type ScopeFrame = {
    readonly bindings: typeof _SCOPE_BINDINGS_PROTO
}

function createFrame(): ScopeFrame {
    return { bindings: new Map<string, ts.Node>() }
}

function collectNames(node: ts.BindingName): readonly string[] {
    if (ts.isIdentifier(node)) return [node.text]
    return node.elements.flatMap(function getNames(elem: ts.ArrayBindingElement): readonly string[] {
        if (ts.isBindingElement(elem)) return collectNames(elem.name)
        return []
    })
}

function isDefinedAbove(scopes: readonly ScopeFrame[], name: string): boolean {
    for (let i = scopes.length - 2; i >= 0; i -= 1) {
        const scope = scopes[i]
        if (scope !== undefined && scope.bindings.has(name)) return true
    }
    return false
}

function addBinding(
    scope: ScopeFrame,
    name: string,
    declNode: ts.Node,
    scopes: readonly ScopeFrame[],
    ctx: Context,
): void {
    if (isDefinedAbove(scopes, name)) {
        const pos = posOf(ctx.sourceFile, declNode)
        ctx.push({ ...pos, rule: 'no-shadow', message: 'Variable shadowing is not allowed. Rename the inner binding.' })
    }
    scope.bindings.set(name, declNode)
}

function walk(node: ts.Node, scopes: readonly ScopeFrame[], ctx: Context): void {
    if (ts.isFunctionDeclaration(node)) {
        const top = scopes[scopes.length - 1]
        if (node.name !== undefined && top !== undefined) addBinding(top, node.name.text, node.name, scopes, ctx)
        const frame = createFrame()
        const fnScopes = [...scopes, frame]
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) addBinding(frame, name, param.name, fnScopes, ctx)
        }
        if (node.body !== undefined) walk(node.body, fnScopes, ctx)
    } else if (ts.isFunctionExpression(node)) {
        const frame = createFrame()
        const fnScopes = [...scopes, frame]
        if (node.name !== undefined) frame.bindings.set(node.name.text, node.name)
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) addBinding(frame, name, param.name, fnScopes, ctx)
        }
        if (node.body !== undefined) walk(node.body, fnScopes, ctx)
    } else if (ts.isArrowFunction(node)) {
        const frame = createFrame()
        const fnScopes = [...scopes, frame]
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) addBinding(frame, name, param.name, fnScopes, ctx)
        }
        walk(node.body, fnScopes, ctx)
    } else if (ts.isBlock(node)) {
        const parent = node.parent
        const isFnBody = parent &&
            (ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isArrowFunction(parent))
        if (!isFnBody) {
            const frame = createFrame()
            const blockScopes = [...scopes, frame]
            ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, blockScopes, ctx) })
        } else {
            ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, scopes, ctx) })
        }
    } else if (ts.isVariableDeclaration(node)) {
        const top = scopes[scopes.length - 1]
        if (top !== undefined) {
            for (const name of collectNames(node.name)) addBinding(top, name, node.name, scopes, ctx)
        }
        if (node.initializer !== undefined) walk(node.initializer, scopes, ctx)
    } else if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) {
        const frame = createFrame()
        const forScopes = [...scopes, frame]
        ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, forScopes, ctx) })
    } else if (ts.isImportDeclaration(node)) {
        const top = scopes[scopes.length - 1]
        if (top !== undefined) {
            const clause = node.importClause
            if (clause !== undefined) {
                if (clause.name !== undefined) addBinding(top, clause.name.text, clause.name, scopes, ctx)
                if (clause.namedBindings !== undefined) {
                    if (ts.isNamespaceImport(clause.namedBindings)) {
                        addBinding(top, clause.namedBindings.name.text, clause.namedBindings.name, scopes, ctx)
                    } else if (ts.isNamedImports(clause.namedBindings)) {
                        for (const spec of clause.namedBindings.elements) {
                            addBinding(top, spec.name.text, spec.name, scopes, ctx)
                        }
                    }
                }
            }
        }
    } else {
        ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, scopes, ctx) })
    }
}

/** Variable shadowing is not allowed. Rename the inner binding. */
export const noShadow: Rule = {
    name: 'no-shadow',
    visit(node, ctx): void {
        if (node.kind !== ts.SyntaxKind.SourceFile) return
        const initialFrame = createFrame()
        ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, [initialFrame], ctx) })
    },
}
