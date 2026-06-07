import ts from "typescript"
import type { Rule, Context } from "../types.js"
import { posOf } from "../pos.js"

const ASSIGN_OPS = new Set([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
])

type Frame = {
    params: Set<string>
    isFunction: boolean
}

function collectNames(node: ts.BindingName): string[] {
    if (ts.isIdentifier(node)) return [node.text]
    const names: string[] = []
    for (const elem of node.elements) {
        if (ts.isBindingElement(elem)) names.push(...collectNames(elem.name))
    }
    return names
}

function isParamInScope(frames: Frame[], name: string): boolean {
    for (let i = frames.length - 1; i >= 0; i--) {
        if (frames[i]!.isFunction) {
            return frames[i]!.params.has(name)
        }
    }
    return false
}

function walk(node: ts.Node, frames: Frame[], ctx: Context): void {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        const fnNode = node as ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction
        const params = new Set<string>()
        for (const param of fnNode.parameters) {
            for (const name of collectNames(param.name)) params.add(name)
        }
        frames.push({ params, isFunction: true })
        const body = (node as ts.FunctionLikeDeclarationBase).body
        if (body) walk(body, frames, ctx)
        frames.pop()
    } else if (ts.isBinaryExpression(node) && ASSIGN_OPS.has(node.operatorToken.kind)) {
        const lhs = node.left
        if (ts.isIdentifier(lhs) && isParamInScope(frames, lhs.text)) {
            const pos = posOf(ctx.sourceFile, lhs)
            ctx.push({ ...pos, rule: "no-param-reassign", message: "Function parameters cannot be reassigned. Use a new `const`." })
        }
        walk(node.right, frames, ctx)
    } else {
        ts.forEachChild(node, (child) => walk(child, frames, ctx))
    }
}

export const noParamReassign: Rule = {
    name: "no-param-reassign",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile) return
        ts.forEachChild(node, (child) => walk(child, [{ params: new Set(), isFunction: false }], ctx))
    },
}
