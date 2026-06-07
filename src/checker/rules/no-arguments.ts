import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

function isBindingPosition(node: ts.Identifier): boolean {
    const parent = node.parent
    if (!parent) return false
    if (ts.isVariableDeclaration(parent) && parent.name === node) return true
    if (ts.isParameter(parent) && parent.name === node) return true
    if (ts.isBindingElement(parent) && parent.name === node) return true
    if (ts.isFunctionDeclaration(parent) && parent.name === node) return true
    if (ts.isFunctionExpression(parent) && parent.name === node) return true
    if (ts.isPropertyAssignment(parent) && parent.name === node) return true
    return false
}

export const noArguments: Rule = {
    name: "no-arguments",
    visit(node, ctx) {
        if (!ts.isIdentifier(node)) return
        if (node.text !== "arguments") return
        if (isBindingPosition(node)) return
        const pos = posOf(ctx.sourceFile, node)
        ctx.push({ ...pos, rule: "no-arguments", message: "`arguments` is not allowed. Use rest params `...args`." })
    },
}
