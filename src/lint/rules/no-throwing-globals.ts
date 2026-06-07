import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const BANNED_MEMBERS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
    ['JSON', new Set(['parse', 'stringify'])],
    ['globalThis', new Set(['fetch'])],
])

const BANNED_IDENTIFIERS: ReadonlySet<string> = new Set([
    'fetch',
    'decodeURIComponent',
    'decodeURI',
    'atob',
    'btoa',
])

function isBannedPropertyAccess(node: ts.PropertyAccessExpression): boolean {
    const obj = node.expression
    if (!ts.isIdentifier(obj)) return false
    const banned = BANNED_MEMBERS.get(obj.text)
    return banned !== undefined && banned.has(node.name.text)
}

const MSG = 'This global throws on failure — use the safe wrapper from `shotscript/std` that returns [T, Error | null] instead.'

/** This global throws on failure — use the safe wrapper from `shotscript/std` that returns [T, Error | null] instead. */
export const noThrowingGlobals: Rule = {
    name: 'no-throwing-globals',
    visit(node, ctx): void {
        if (ts.isPropertyAccessExpression(node)) {
            if (isBannedPropertyAccess(node)) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-throwing-globals', message: MSG })
            }
        } else if (ts.isCallExpression(node)) {
            const expr = node.expression
            if (ts.isIdentifier(expr) && BANNED_IDENTIFIERS.has(expr.text)) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-throwing-globals', message: MSG })
            }
        } else if (ts.isNewExpression(node)) {
            const expr = node.expression
            if (ts.isIdentifier(expr) && expr.text === 'URL' && node.arguments !== undefined && node.arguments.length > 0) {
                ctx.push({ ...posOf(ctx.sourceFile, node), rule: 'no-throwing-globals', message: MSG })
            }
        }
    },
}
