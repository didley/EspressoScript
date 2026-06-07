import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function isAwaitable(checker: ts.TypeChecker, node: ts.Node): boolean {
    const type = checker.getTypeAtLocation(node)
    if (Boolean(type.flags & ts.TypeFlags.Any)) return false
    if (Boolean(type.flags & ts.TypeFlags.Unknown)) return false
    const thenProp = type.getProperty('then')
    if (!thenProp) return false
    const thenType = checker.getTypeOfSymbol(thenProp)
    return thenType.getCallSignatures().length > 0
}

/** Promise must be handled. Use \`await\` to wait for the result, or \`void fn()\` to explicitly discard it. */
export const noFloatingPromises: Rule = {
    name: 'no-floating-promises',
    visit(node, ctx): void {
        if (!ctx.typeChecker) return
        if (!ts.isExpressionStatement(node)) return
        const expr = node.expression
        if (ts.isVoidExpression(expr)) return
        if (ts.isAwaitExpression(expr)) return
        if (!ts.isCallExpression(expr)) return
        if (!isAwaitable(ctx.typeChecker, expr)) return
        ctx.push({
            ...posOf(ctx.sourceFile, node),
            rule: 'no-floating-promises',
            message: `Promise must be handled. Use \`await\` to wait for the result, or \`void fn()\` to explicitly discard it.`,
        })
    },
}
