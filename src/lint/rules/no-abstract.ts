import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function hasAbstractModifier(node: ts.Node): boolean {
    if (!ts.canHaveModifiers(node)) return false
    const mods = ts.getModifiers(node)
    if (mods === undefined) return false
    return mods.some(function isAbstract(m: ts.ModifierLike): boolean {
        return m.kind === ts.SyntaxKind.AbstractKeyword
    })
}

/** `abstract` is not allowed. */
export const noAbstract: Rule = {
    name: 'no-abstract',
    visit(node, ctx): void {
        if (ts.isClassDeclaration(node) && hasAbstractModifier(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-abstract', message: '`abstract` is not allowed.' })
        } else if (
            (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) &&
            hasAbstractModifier(node)
        ) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-abstract', message: '`abstract` is not allowed.' })
        }
    },
}
