import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function isReadonlyModified(typeNode: ts.TypeNode): boolean {
    return (
        ts.isTypeOperatorNode(typeNode) &&
        typeNode.operator === ts.SyntaxKind.ReadonlyKeyword
    )
}

function hasReadonlyModifier(m: ts.ModifierLike): boolean {
    return m.kind === ts.SyntaxKind.ReadonlyKeyword
}

function isReadonlyProperty(member: ts.TypeElement): boolean {
    if (!ts.isPropertySignature(member)) return true
    return member.modifiers?.some(hasReadonlyModifier) ?? false
}

function hasAllReadonlyProperties(typeLiteral: ts.TypeLiteralNode): boolean {
    return typeLiteral.members.every(isReadonlyProperty)
}

/** Inline array and object-literal parameter types must be readonly. */
export const requireReadonlyParameters: Rule = {
    name: 'require-readonly-parameters',
    visit(node, ctx): void {
        if (!ts.isParameter(node) || node.type === undefined) return
        const t = node.type
        if (ts.isArrayTypeNode(t) && !isReadonlyModified(t)) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'require-readonly-parameters',
                message: 'Array parameter type must be readonly — use `readonly T[]`.',
            })
        } else if (ts.isTypeLiteralNode(t) && !hasAllReadonlyProperties(t)) {
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: 'require-readonly-parameters',
                message: 'Object parameter type must mark every property readonly.',
            })
        }
    },
}
