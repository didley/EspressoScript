import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { check as runCheck } from './checker/mod.ts'
import { copyTransform, makeTempDir, removeTempDir } from './pipeline.ts'
import { typecheckFiles, formatTypeDiagnostics } from './typecheck.ts'

export async function build(files: string[]): Promise<number> {
    if (files.length === 0) {
        console.error('shot build: no files given')
        return 2
    }

    // 1. Lint
    let lintFails = 0
    for (const file of files) {
        let source: string
        try {
            source = await fs.readFile(file, 'utf-8')
        } catch (e) {
            console.error(`shot build: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        const diagnostics = runCheck(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        lintFails += diagnostics.length
    }
    if (lintFails > 0) return 1

    // 2. Type-check in-process via TypeScript compiler API
    const tmpDir = await makeTempDir('shot-build-')
    try {
        await copyTransform(files, tmpDir)
        const tsFiles = files.map((f) =>
            path.join(tmpDir, path.basename(f).replace(/\.shot$/, '.ts')),
        )
        const diagnostics = typecheckFiles(tsFiles)
        if (diagnostics.length > 0) {
            process.stderr.write(formatTypeDiagnostics(diagnostics))
            return 1
        }
        return 0
    } finally {
        await removeTempDir(tmpDir)
    }
}
