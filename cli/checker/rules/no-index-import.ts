import ts from "npm:typescript"
import type { Rule } from "../types.ts"
import { posOf } from "../mod.ts"

function isIndexPath(spec: string): boolean {
    return spec.endsWith("/index.shot")
}

function check(spec: string, node: ts.Node, ctx: Parameters<Rule["visit"]>[1]): void {
    if (!isIndexPath(spec)) return
    ctx.push({ ...posOf(ctx.sourceFile, node), rule: "no-index-import", message: `Importing index files is not allowed. Import the specific module file instead (e.g. "./dir/module.shot").` })
}

export const noIndexImport: Rule = {
    name: "no-index-import",
    visit(node, ctx) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            check(node.moduleSpecifier.text, node.moduleSpecifier, ctx)
        } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            check(node.moduleSpecifier.text, node.moduleSpecifier, ctx)
        }
    },
}
