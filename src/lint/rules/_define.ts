import ts from 'typescript'
import type { Rule, Context } from '../types.js'
import { posOf } from '../pos.js'

export function defineSyntaxRule(spec: {
    readonly name: string
    readonly match: (node: ts.Node) => boolean
    readonly message: string
}): Rule {
    return {
        name: spec.name,
        visit(node: ts.Node, ctx: Context): void {
            if (!spec.match(node)) return
            ctx.report({
                ...posOf(ctx.sourceFile, node),
                rule: spec.name,
                message: spec.message,
            })
        },
    }
}
