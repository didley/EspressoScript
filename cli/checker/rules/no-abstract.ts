import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

function hasAbstractModifier(node: ts.Node): boolean {
    const mods = (node as ts.HasModifiers).modifiers
    return mods?.some(m => m.kind === ts.SyntaxKind.AbstractKeyword) ?? false
}

export const noAbstract: Rule = {
    name: "no-abstract",
    visit(node, ctx) {
        if (ts.isClassDeclaration(node) && hasAbstractModifier(node)) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-abstract", message: "`abstract` is not allowed." })
        } else if (
            (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) &&
            hasAbstractModifier(node)
        ) {
            ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-abstract", message: "`abstract` is not allowed." })
        }
    },
}
