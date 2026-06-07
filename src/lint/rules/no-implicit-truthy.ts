import ts from 'typescript'
import type { Rule, Context } from '../types.js'
import { posOf } from '../pos.js'

function isBooleanType(type: ts.Type): boolean {
    if (Boolean(type.flags & ts.TypeFlags.Boolean)) return true
    if (Boolean(type.flags & ts.TypeFlags.BooleanLiteral)) return true
    if (type.isUnion()) {
        return type.types.every(function checkBool(t: ts.Type): boolean {
            return Boolean(t.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral))
        })
    }
    return false
}

const MSG = 'Condition must be a boolean expression. Use an explicit comparison (=== null, === true, > 0, etc.).'

function checkCondition(checker: ts.TypeChecker, condition: ts.Expression, node: ts.Node, ctx: Context): void {
    const type = checker.getTypeAtLocation(condition)
    if (!isBooleanType(type)) {
        ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-implicit-truthy', message: MSG })
    }
}

/** Conditions must be boolean-typed. Use an explicit comparison (=== null, === true, > 0, etc.). */
export const noImplicitTruthy: Rule = {
    name: 'no-implicit-truthy',
    visit(node, ctx): void {
        if (!ctx.typeChecker) return
        if (ts.isIfStatement(node)) {
            checkCondition(ctx.typeChecker, node.expression, node, ctx)
            return
        }
        if (ts.isWhileStatement(node)) {
            checkCondition(ctx.typeChecker, node.expression, node, ctx)
            return
        }
        if (ts.isForStatement(node) && node.condition !== undefined) {
            checkCondition(ctx.typeChecker, node.condition, node, ctx)
        }
    },
}
