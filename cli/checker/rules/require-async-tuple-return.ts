import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

// Returns true if typeNode is a union containing `null` (i.e. `X | null`).
function containsNull(typeNode: ts.TypeNode): boolean {
    if (!ts.isUnionTypeNode(typeNode)) return false
    return typeNode.types.some(
        t => ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword,
    )
}

// Valid async return types:
//   Promise<void>                          — side-effect async, no meaningful return
//   Promise<never>                         — function that never resolves
//   Promise<[T | null, E | null]>          — standard tuple (second element nullable)
//   ShotPromise<T> / ShotPromise<T, E>     — canonical alias
function isValidAsyncReturn(typeNode: ts.TypeNode): boolean {
    if (!ts.isTypeReferenceNode(typeNode)) return false
    const name = typeNode.typeName
    if (!ts.isIdentifier(name)) return false

    if (name.text === "ShotPromise") return true

    if (name.text !== "Promise") return false
    const args = typeNode.typeArguments
    if (!args || args.length !== 1) return false
    const inner = args[0]

    if (inner.kind === ts.SyntaxKind.VoidKeyword) return true
    if (inner.kind === ts.SyntaxKind.NeverKeyword) return true

    if (!ts.isTupleTypeNode(inner)) return false
    if (inner.elements.length !== 2) return false
    return containsNull(inner.elements[1])
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
                message: `Async functions must return Promise<[T | null, E | null]> or ShotPromise<T, E>. Use a tuple return type so callers can handle errors explicitly.`,
            })
        }
    },
}
