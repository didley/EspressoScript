import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const BANNED_MEMBERS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
    ["JSON", new Set(["parse", "stringify"])],
    ["globalThis", new Set(["fetch"])],
])

function isBannedPropertyAccess(node: ts.PropertyAccessExpression): boolean {
    const obj = node.expression
    if (!ts.isIdentifier(obj)) return false
    const banned = BANNED_MEMBERS.get(obj.text)
    return banned !== undefined && banned.has(node.name.text)
}

export const noThrowingGlobals: Rule = {
    name: "no-throwing-globals",
    visit(node, ctx) {
        if (ts.isPropertyAccessExpression(node)) {
            if (isBannedPropertyAccess(node)) {
                const pos = posOf(ctx.sourceFile, node)
                ctx.push({ ...pos, rule: "no-throwing-globals", message: "This global throws on failure — wrap it in a safe function that returns [T, Error | null] instead." })
            }
        } else if (ts.isCallExpression(node)) {
            const expr = node.expression
            if (ts.isIdentifier(expr) && expr.text === "fetch") {
                const pos = posOf(ctx.sourceFile, node)
                ctx.push({ ...pos, rule: "no-throwing-globals", message: "This global throws on failure — wrap it in a safe function that returns [T, Error | null] instead." })
            }
        }
    },
}
