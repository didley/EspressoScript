import ts from 'typescript'

const STRICT_OPTIONS: ts.CompilerOptions = {
    strict: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    exactOptionalPropertyTypes: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
    noErrorTruncation: true,
    strictBuiltinIteratorReturn: true,
    verbatimModuleSyntax: true,
    skipLibCheck: true,
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
}

// Bun-specific globals not in standard TypeScript lib.
const BUN_AMBIENT_PATH = '__shot_bun_ambient__.d.ts'
const BUN_AMBIENT_SOURCE = `
declare global {
    interface ImportMeta {
        readonly main: boolean
        readonly dir: string
        readonly path: string
        readonly file: string
    }
    var process: {
        readonly argv: readonly string[]
        readonly execPath: string
        readonly env: Readonly<Record<string, string | undefined>>
        cwd(): string
        exit(code?: number): never
    }
}
export {}
`

export function typecheckFiles(files: string[]): readonly ts.Diagnostic[] {
    const host = ts.createCompilerHost(STRICT_OPTIONS)
    const origGetSourceFile = host.getSourceFile.bind(host)
    host.getSourceFile = (
        fileName: string,
        languageVersion: ts.ScriptTarget,
        onError?: (message: string) => void,
        shouldCreateNewSourceFile?: boolean,
    ) => {
        if (fileName === BUN_AMBIENT_PATH) {
            return ts.createSourceFile(BUN_AMBIENT_PATH, BUN_AMBIENT_SOURCE, languageVersion)
        }
        return origGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
    }
    host.fileExists = (fileName: string) => {
        if (fileName === BUN_AMBIENT_PATH) return true
        return ts.sys.fileExists(fileName)
    }
    host.readFile = (fileName: string) => {
        if (fileName === BUN_AMBIENT_PATH) return BUN_AMBIENT_SOURCE
        return ts.sys.readFile(fileName)
    }

    const program = ts.createProgram(
        [BUN_AMBIENT_PATH, ...files],
        STRICT_OPTIONS,
        host,
    )
    return ts.getPreEmitDiagnostics(program)
}

export function formatTypeDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
    if (diagnostics.length === 0) return ''
    return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: (f: string) => f,
        getNewLine: () => '\n',
    })
}
