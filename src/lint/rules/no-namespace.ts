import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

function getKeyword(flags: ts.NodeFlags): string {
    if ((flags & ts.NodeFlags.Namespace) !== 0) return 'namespace'
    return 'module'
}

/** \`…\` declarations are not allowed. Use ES modules instead. */
export const noNamespace: Rule = {
    name: 'no-namespace',
    visit(node, ctx): void {
        if (!ts.isModuleDeclaration(node)) return
        const keyword = getKeyword(node.flags)
        ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-namespace', message: `\`${keyword}\` declarations are not allowed. Use ES modules instead.` })
    },
}
