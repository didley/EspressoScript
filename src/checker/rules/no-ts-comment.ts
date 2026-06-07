import ts from "typescript"
import type { Rule } from "../types.js"

const TS_ESCAPE = /^\s*@ts-(ignore|expect-error|nocheck)\b/

function scanComments(source: string, pos: number, ctx: Parameters<Rule["visit"]>[1]): void {
    const ranges = ts.getLeadingCommentRanges(source, pos) ?? []
    for (const r of ranges) {
        const text = source.slice(r.pos, r.end)
        const body = r.kind === ts.SyntaxKind.SingleLineCommentTrivia
            ? text.slice(2)
            : text.slice(2, -2)
        if (TS_ESCAPE.test(body)) {
            const before = source.slice(0, r.pos)
            const line = (before.match(/\n/g) ?? []).length + 1
            const lastNl = before.lastIndexOf("\n")
            const col = r.pos - (lastNl === -1 ? -1 : lastNl)
            ctx.push({ line, col, rule: "no-ts-comment", message: "TS escape-hatch comments are not allowed." })
        }
    }
}

export const noTsComment: Rule = {
    name: "no-ts-comment",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile) return
        const source = ctx.source
        const seen = new Set<number>()
        function walk(n: ts.Node): void {
            const start = n.getFullStart()
            if (!seen.has(start)) {
                seen.add(start)
                scanComments(source, start, ctx)
            }
            ts.forEachChild(n, walk)
        }
        walk(node)
    },
}
