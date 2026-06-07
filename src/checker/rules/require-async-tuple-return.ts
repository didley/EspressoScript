import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

// Returns true if typeNode is a union containing `null` (i.e. `X | null`).
function containsNull(typeNode: ts.TypeNode): boolean {
    if (!ts.isUnionTypeNode(typeNode)) return false
    return typeNode.types.some(
        t => ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword,
    )
}

// Valid async return types:
//   Promise<void>                              — side-effect async, no meaningful return
//   Promise<never>                             — function that never resolves
//   Promise<[T | null, E | null]>              — standard tuple (second element nullable)
//   Promise<Result<T>>                         — Result<T> alias for the tuple
//   PromiseResult<T> / PromiseResult<T, E>     — canonical alias
function isValidAsyncReturn(typeNode: ts.TypeNode): boolean {
    if (!ts.isTypeReferenceNode(typeNode)) return false
    const name = typeNode.typeName
    if (!ts.isIdentifier(name)) return false

    if (name.text === "PromiseResult") return true

    if (name.text !== "Promise") return false
    const args = typeNode.typeArguments
    if (!args || args.length !== 1) return false
    const inner = args[0]
    if (!inner) return false

    if (inner.kind === ts.SyntaxKind.VoidKeyword) return true
    if (inner.kind === ts.SyntaxKind.NeverKeyword) return true

    if (ts.isTypeReferenceNode(inner) && ts.isIdentifier(inner.typeName) && inner.typeName.text === "Result") return true

    if (!ts.isTupleTypeNode(inner)) return false
    if (inner.elements.length !== 2) return false
    const second = inner.elements[1]
    return second !== undefined && containsNull(second)
}

export const requireAsyncTupleReturn: Rule = {
    name: "require-async-tuple-return",
    visit(node, ctx) {
        if (!ts.isFunctionDeclaration(node) && !ts.isFunctionExpression(node)) return
        const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false
        if (!isAsync) return
        if (!node.type) return // require-explicit-return-type already catches the missing annotation
        if (!isValidAsyncReturn(node.type)) {
            ctx.push({
                ...posOf(ctx.sourceFile, node),
                rule: "require-async-tuple-return",
                message: `Async functions must return PromiseResult<T> or Promise<[T | null, E | null]>. Use a tuple return type so callers can handle errors explicitly.`,
            })
        }
    },
}
