import ts from 'typescript'
import type { Rule, Context } from '../types.js'
import { posOf } from '../pos.js'

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
    readonly params: ReadonlySet<string>
    readonly isFunction: boolean
}

function collectNames(node: ts.BindingName): readonly string[] {
    if (ts.isIdentifier(node)) return [node.text]
    return node.elements.flatMap(function getNames(elem: ts.ArrayBindingElement): readonly string[] {
        if (ts.isBindingElement(elem)) return collectNames(elem.name)
        return []
    })
}

function isParamInScope(frames: readonly Frame[], name: string): boolean {
    for (let i = frames.length - 1; i >= 0; i -= 1) {
        const frame = frames[i]
        if (frame === undefined) continue
        if (frame.isFunction) return frame.params.has(name)
    }
    return false
}

function walk(node: ts.Node, frames: readonly Frame[], ctx: Context): void {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        const params = new Set<string>()
        for (const param of node.parameters) {
            for (const name of collectNames(param.name)) params.add(name)
        }
        const fnFrames = [...frames, { params, isFunction: true }]
        const body = node.body
        if (body !== undefined) walk(body, fnFrames, ctx)
    } else if (ts.isBinaryExpression(node) && ASSIGN_OPS.has(node.operatorToken.kind)) {
        const lhs = node.left
        if (ts.isIdentifier(lhs) && isParamInScope(frames, lhs.text)) {
            const pos = posOf(ctx.sourceFile, lhs)
            ctx.report({ ...pos, rule: 'no-param-reassign', message: 'Function parameters cannot be reassigned. Use a new `const`.' })
        }
        walk(node.right, frames, ctx)
    } else {
        ts.forEachChild(node, function walkChild(child: ts.Node): void { walk(child, frames, ctx) })
    }
}

/** Function parameters cannot be reassigned. Use a new `const`. */
export const noParamReassign: Rule = {
    name: 'no-param-reassign',
    visit(node, ctx): void {
        if (node.kind !== ts.SyntaxKind.SourceFile) return
        ts.forEachChild(node, function walkChild(child: ts.Node): void {
            walk(child, [{ params: new Set(), isFunction: false }], ctx)
        })
    },
}
