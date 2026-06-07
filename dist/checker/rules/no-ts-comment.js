import ts from "typescript";
const TS_ESCAPE = /^\s*@ts-(ignore|expect-error|nocheck)\b/;
function scanComments(source, pos, ctx) {
    const ranges = ts.getLeadingCommentRanges(source, pos) ?? [];
    for (const r of ranges) {
        const text = source.slice(r.pos, r.end);
        const body = r.kind === ts.SyntaxKind.SingleLineCommentTrivia
            ? text.slice(2)
            : text.slice(2, -2);
        if (TS_ESCAPE.test(body)) {
            const before = source.slice(0, r.pos);
            const line = (before.match(/\n/g) ?? []).length + 1;
            const lastNl = before.lastIndexOf("\n");
            const col = r.pos - (lastNl === -1 ? -1 : lastNl);
            ctx.push({ line, col, rule: "no-ts-comment", message: "TS escape-hatch comments are not allowed." });
        }
    }
}
export const noTsComment = {
    name: "no-ts-comment",
    visit(node, ctx) {
        if (node.kind !== ts.SyntaxKind.SourceFile)
            return;
        const source = ctx.source;
        const seen = new Set();
        function walk(n) {
            const start = n.getFullStart();
            if (!seen.has(start)) {
                seen.add(start);
                scanComments(source, start, ctx);
            }
            ts.forEachChild(n, walk);
        }
        walk(node);
    },
};
//# sourceMappingURL=no-ts-comment.js.map