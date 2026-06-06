import ts from 'typescript'
import type { Rule } from "../types.ts"
import { posOf } from "../index.ts"

function isAllowed(spec: string): boolean {
    if (spec.startsWith('shot:')) return true
    if (spec.startsWith('bun:')) return true
    if ((spec.startsWith('./') || spec.startsWith('../')) && spec.endsWith('.shot')) return true
    return false
}

function checkSpec(spec: string, node: ts.Node, ctx: Parameters<Rule['visit']>[1]): void {
    if (isAllowed(spec)) return
    const pos = posOf(ctx.sourceFile, node)
    ctx.push({ ...pos, rule: 'imports-allowlist', message: `Import specifier "${spec}" is not allowed. v1 permits shot:*, bun:*, and relative *.shot imports only.` })
}

export const importsAllowlist: Rule = {
    name: "imports-allowlist",
    visit(node, ctx) {
        if (ts.isImportDeclaration(node)) {
            const spec = node.moduleSpecifier
            if (ts.isStringLiteral(spec)) checkSpec(spec.text, spec, ctx)
        } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
            const spec = node.moduleSpecifier
            if (ts.isStringLiteral(spec)) checkSpec(spec.text, spec, ctx)
        } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
            const arg = node.arguments[0]
            if (arg && ts.isStringLiteral(arg)) checkSpec(arg.text, arg, ctx)
        }
    },
}
