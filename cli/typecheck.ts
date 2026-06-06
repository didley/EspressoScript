import ts from 'typescript'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Written to tmpDir to provide global Bun/Deno stubs.
const BUN_GLOBALS_SOURCE = `
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
    var Deno: {
        readTextFile(path: string): Promise<string>
        writeTextFile(path: string, data: string): Promise<void>
        serve(handler: (req: Request) => Response | Promise<Response>): void
        serve(options: { port?: number }, handler: (req: Request) => Response | Promise<Response>): void
    }
}
export {}
`

// Written to tmpDir and mapped via paths so 'node:fs/promises' resolves correctly.
const NODE_FS_SHIM_SOURCE = `
export declare function readFile(path: string, encoding: 'utf-8'): Promise<string>
export declare function writeFile(path: string, data: string, encoding: 'utf-8'): Promise<void>
`

// Written to tmpDir and mapped via paths so 'bun:test' resolves correctly.
const BUN_TEST_SHIM_SOURCE = `
interface Matchers {
    toBe(expected: unknown): void
    toEqual(expected: unknown): void
    toBeNull(): void
    toBeInstanceOf(cls: new (...args: any[]) => unknown): void
    toContain(item: unknown): void
    not: Matchers
}
export declare function test(name: string, fn: () => void | Promise<void>): void
export declare function expect(value: unknown): Matchers
`

export function typecheckFiles(files: string[], tmpDir: string): readonly ts.Diagnostic[] {
    const globalsPath = path.join(tmpDir, '__shot_globals__.d.ts')
    const shimPath = path.join(tmpDir, '__shot_bun_test__.d.ts')
    const nodeFsShimPath = path.join(tmpDir, '__shot_node_fs__.d.ts')
    fs.writeFileSync(globalsPath, BUN_GLOBALS_SOURCE)
    fs.writeFileSync(shimPath, BUN_TEST_SHIM_SOURCE)
    fs.writeFileSync(nodeFsShimPath, NODE_FS_SHIM_SOURCE)

    const options: ts.CompilerOptions = {
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
        allowImportingTsExtensions: true,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        baseUrl: tmpDir,
        paths: {
            'bun:test': ['./__shot_bun_test__'],
            'node:fs/promises': ['./__shot_node_fs__'],
        },
    }

    const program = ts.createProgram([globalsPath, ...files], options)
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
