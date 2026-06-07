import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const FN_BOUNDARIES = new Set([
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.ArrowFunction,
    ts.SyntaxKind.MethodDeclaration,
])

function hasDirectAwait(body: ts.Node): boolean {
    function walk(n: ts.Node): true | void {
        if (ts.isAwaitExpression(n)) return true
        if (FN_BOUNDARIES.has(n.kind)) return
        return ts.forEachChild(n, walk)
    }
    return ts.forEachChild(body, walk) === true
}

/** Async function has no `await` — remove `async` and return `Result<T>` instead of `PromiseResult<T>`. */
export const noAsyncWithoutAwait: Rule = {
    name: 'no-async-without-await',
    visit(node, ctx): void {
        if (!ts.isFunctionDeclaration(node) && !ts.isFunctionExpression(node)) return
        const isAsync = node.modifiers?.some(function isAsyncMod(m: ts.ModifierLike): boolean {
            return m.kind === ts.SyntaxKind.AsyncKeyword
        }) ?? false
        if (!isAsync) return
        if (!node.body) return
        if (!hasDirectAwait(node.body)) {
            ctx.push({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-async-without-await',
                message: 'Async function has no `await` — remove `async` and return `Result<T>` instead of `PromiseResult<T>`.',
            })
        }
    },
}
