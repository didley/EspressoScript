import ts from 'typescript'
import type { Diagnostic, Context } from './types.js'
import { rules } from './rules/all.js'

type ProgramResult = {
    readonly sourceFile: ts.SourceFile
    readonly checker: ts.TypeChecker
}

type CheckProgram = {
    readonly sourceFile: ts.SourceFile
    readonly checker: ts.TypeChecker | null
}

function buildProgram(file: string): ProgramResult | null {
    const options: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2022,
        noEmit: true,
        skipLibCheck: true,
        strictNullChecks: true,
    }
    const program = ts.createProgram([file], options)
    const sourceFile = program.getSourceFile(file)
    if (sourceFile === undefined) return null
    return { sourceFile, checker: program.getTypeChecker() }
}

function resolveCheckProgram(
    file: string,
    source: string,
    typeChecker: ts.TypeChecker | null,
    programSourceFile: ts.SourceFile | null,
): CheckProgram {
    if (typeChecker !== null && programSourceFile !== null) {
        return { sourceFile: programSourceFile, checker: typeChecker }
    }
    const result = buildProgram(file)
    const sourceFile = result?.sourceFile
        ?? ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    return { sourceFile, checker: result?.checker ?? null }
}

export function check(
    file: string,
    source: string,
    typeChecker: ts.TypeChecker | null,
    programSourceFile: ts.SourceFile | null,
): readonly Diagnostic[] {
    const { sourceFile, checker } = resolveCheckProgram(file, source, typeChecker, programSourceFile)
    const diagMap = new Map<number, Diagnostic>()

    const ctx: Context = {
        file,
        source,
        sourceFile,
        typeChecker: checker,
        report(d: Omit<Diagnostic, 'file'>): void {
            diagMap.set(diagMap.size, { file, ...d })
        },
    }

    function walk(node: ts.Node): void {
        for (const rule of rules) {
            rule.visit(node, ctx)
        }
        ts.forEachChild(node, walk)
    }
    walk(sourceFile)

    return [...diagMap.values()]
}
