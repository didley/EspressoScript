import ts from "npm:typescript"
import type { Diagnostic, Context } from "./types.ts"
import { rules } from "./rules/index.ts"

export function posOf(sourceFile: ts.SourceFile, node: ts.Node): { line: number; col: number } {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    return { line: line + 1, col: character + 1 }
}

export function check(file: string, source: string): Diagnostic[] {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const diagnostics: Diagnostic[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseDiags: ts.DiagnosticWithLocation[] = (sourceFile as any).parseDiagnostics ?? []
    if (parseDiags.length > 0) {
        const d = parseDiags[0]
        const pos = sourceFile.getLineAndCharacterOfPosition(d.start ?? 0)
        diagnostics.push({
            file,
            line: pos.line + 1,
            col: pos.character + 1,
            rule: "parse-error",
            message: ts.flattenDiagnosticMessageText(d.messageText, " "),
        })
        return diagnostics
    }

    const ctx: Context = {
        file,
        source,
        sourceFile,
        push(d) {
            diagnostics.push({ file, ...d })
        },
    }

    function walk(node: ts.Node): void {
        for (const rule of rules) {
            rule.visit(node, ctx)
        }
        ts.forEachChild(node, walk)
    }
    walk(sourceFile)

    return diagnostics
}
