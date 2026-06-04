import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

function nodeText(node: ts.Node, sf: ts.SourceFile): string {
    return sf.text.slice(node.getStart(sf), node.getEnd())
}

export const noSelfAssign: Rule = {
    name: "no-self-assign",
    visit(node, ctx) {
        if (!ts.isBinaryExpression(node)) return
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return
        const lText = nodeText(node.left, ctx.sourceFile)
        const rText = nodeText(node.right, ctx.sourceFile)
        if (lText !== rText) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-self-assign", message: "Self-assignment has no effect." })
    },
}
