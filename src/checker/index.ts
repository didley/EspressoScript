import ts from "typescript"
import type { Diagnostic, Context } from "./types.js"
import { rules } from "./rules/index.js"
export { posOf } from "./pos.js"

type ProgramResult = { sourceFile: ts.SourceFile; checker: ts.TypeChecker }

function buildProgram(file: string, source: string): ProgramResult | undefined {
    try {
        const options: ts.CompilerOptions = {
            target: ts.ScriptTarget.ES2022,
            noEmit: true,
            skipLibCheck: true,
        }
        const host = ts.createCompilerHost(options)
        const base = host.getSourceFile.bind(host)
        host.getSourceFile = (name: string, ver: ts.ScriptTarget) =>
            name === file
                ? ts.createSourceFile(name, source, ver, true)
                : base(name, ver)
        const program = ts.createProgram([file], options, host)
        const sourceFile = program.getSourceFile(file)
        if (!sourceFile) return undefined
        return { sourceFile, checker: program.getTypeChecker() }
    } catch {
        return undefined
    }
}

export function check(
    file: string,
    source: string,
    typeChecker?: ts.TypeChecker,
    programSourceFile?: ts.SourceFile,
): Diagnostic[] {
    const diagnostics: Diagnostic[] = []

    let sourceFile: ts.SourceFile
    let checker: ts.TypeChecker | undefined

    if (typeChecker && programSourceFile) {
        sourceFile = programSourceFile
        checker = typeChecker
    } else {
        const result = buildProgram(file, source)
        sourceFile = result?.sourceFile
            ?? ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
        checker = result?.checker
    }

    interface SourceFileInternal {
        parseDiagnostics?: ts.DiagnosticWithLocation[]
    }
    const parseDiags = (sourceFile as unknown as SourceFileInternal).parseDiagnostics ?? []
    if (parseDiags.length > 0) {
        const d = parseDiags[0]
        if (!d) return diagnostics
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
        typeChecker: checker,
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
