import ts from 'typescript'
import type { Rule } from '../types.js'
import { posOf } from '../pos.js'

const INDEX_SUFFIXES = ['/index.ts', '/index.tsx', '/index.js', '/index.mjs', '/index.cjs']

function isIndexPath(spec: string): boolean {
    return INDEX_SUFFIXES.some(function isSuffix(s: string): boolean { return spec.endsWith(s) })
        || /\/index$/.test(spec)
}

function check(spec: string, node: ts.Node, ctx: Parameters<Rule['visit']>[1]): void {
    if (!isIndexPath(spec)) return
    ctx.report({ ...posOf(ctx.sourceFile, node), rule: 'no-index-import', message: `Importing index files is not allowed. Import the specific module file instead (e.g. './dir/module.ts').` })
}

/** Importing index files is not allowed. Import the specific module file instead (e.g. './dir/module.ts'). */
export const noIndexImport: Rule = {
    name: 'no-index-import',
    visit(node, ctx): void {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            check(node.moduleSpecifier.text, node.moduleSpecifier, ctx)
        } else if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier)) {
            check(node.moduleSpecifier.text, node.moduleSpecifier, ctx)
        }
    },
}
