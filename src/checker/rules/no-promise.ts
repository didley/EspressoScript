import ts from "typescript"
import type { Rule } from "../types.js"
import { posOf } from "../pos.js"

const PROMISE_STATIC_METHODS = new Set([
    "resolve",
    "reject",
    "all",
    "allSettled",
    "race",
    "any",
])

export const noPromise: Rule = {
    name: "no-promise",
    visit(node, ctx) {
        // Ban: new Promise(...)
        if (
            ts.isNewExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === "Promise"
        ) {
            ctx.push({
                ...posOf(ctx.sourceFile, node),
                rule: "no-promise",
                message: `new Promise() is not allowed. Use toPromiseResult(() => externalFn()) to wrap external Promise-returning functions.`,
            })
            return
        }

        // Ban: Promise.resolve(), Promise.reject(), Promise.all(), etc.
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === "Promise" &&
            ts.isIdentifier(node.expression.name) &&
            PROMISE_STATIC_METHODS.has(node.expression.name.text)
        ) {
            ctx.push({
                ...posOf(ctx.sourceFile, node),
                rule: "no-promise",
                message: `Promise.${node.expression.name.text}() is not allowed. Use toPromiseResult(() => externalFn()) to wrap external Promise-returning functions.`,
            })
        }
    },
}
