import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

/** Intersection types are not allowed. Spell out the combined shape. */
export const noIntersectionTypes: Rule = {
    name: 'no-intersection-types',
    visit(node, ctx): void {
        if (ts.isIntersectionTypeNode(node)) {
            ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-intersection-types', message: 'Intersection types are not allowed. Spell out the combined shape.' })
        }
    },
}
