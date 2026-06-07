import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function typeCanBeNull(type: ts.Type): boolean {
    if (Boolean(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter))) return true
    if (Boolean(type.flags & ts.TypeFlags.Null)) return true
    if (type.isUnion()) {
        if (type.types.some(function hasEscape(t: ts.Type): boolean {
            return Boolean(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter))
        })) return true
        return type.types.some(function hasNull(t: ts.Type): boolean {
            return Boolean(t.flags & ts.TypeFlags.Null)
        })
    }
    return false
}

function getNullCheckedExpr(node: ts.BinaryExpression): ts.Expression | null {
    if (node.right.kind === ts.SyntaxKind.NullKeyword) return node.left
    if (node.left.kind === ts.SyntaxKind.NullKeyword) return node.right
    return null
}

/** `=== null` check on a value whose type can never be null — dead code. */
export const noUnnecessaryCondition: Rule = {
    name: 'no-unnecessary-condition',
    visit(node, ctx): void {
        if (!ctx.typeChecker) return
        if (!ts.isBinaryExpression(node)) return
        const op = node.operatorToken.kind
        if (op !== ts.SyntaxKind.EqualsEqualsEqualsToken && op !== ts.SyntaxKind.ExclamationEqualsEqualsToken) return
        const checked = getNullCheckedExpr(node)
        if (checked === null) return
        const type = ctx.typeChecker.getTypeAtLocation(checked)
        if (!typeCanBeNull(type)) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'no-unnecessary-condition',
                message: 'Unnecessary null check — this expression can never be null.',
            })
        }
    },
}
