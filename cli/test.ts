import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { spawn } from 'node:child_process'
import { glob } from 'glob'
import { check } from './checker/mod.ts'
import {
    hasShotImports,
    shotFilesInDir,
    copyTransform,
    makeTempDir,
    removeTempDir,
} from './pipeline.ts'
import { typecheckFiles, formatTypeDiagnostics } from './typecheck.ts'

function spawnBun(args: string[]): Promise<number> {
    return new Promise((resolve) => {
        const proc = spawn(process.execPath, args, { stdio: 'inherit' })
        proc.on('close', (code) => resolve(code ?? 1))
    })
}

export async function test(args: string[]): Promise<number> {
    const sep = args.indexOf('--')
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    let testFiles: string[]

    if (positional.length === 0) {
        const found = await glob('**/*.test.shot', {
            cwd: process.cwd(),
            absolute: true,
            ignore: 'node_modules/**',
        })
        if (found.length === 0) {
            console.error('shot test: no *.test.shot files found')
            return 2
        }
        testFiles = found
    } else {
        testFiles = positional
    }

    const sourceCache = new Map<string, string>()
    let needsTransform = false
    for (const file of testFiles) {
        let source: string
        try {
            source = await fs.readFile(file, 'utf-8')
        } catch (e) {
            console.error(`shot test: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        sourceCache.set(file, source)
        if (hasShotImports(source)) {
            needsTransform = true
            break
        }
    }

    let projectFiles: string[]
    if (needsTransform) {
        const dirs = new Set<string>()
        for (const f of testFiles) {
            dirs.add(path.dirname(f))
        }
        const all: string[] = []
        for (const dir of dirs) {
            for (const f of await shotFilesInDir(dir)) {
                if (!all.includes(f)) all.push(f)
            }
        }
        projectFiles = all
    } else {
        projectFiles = testFiles
    }

    // Lint test files only
    let lintFails = 0
    for (const file of testFiles) {
        let source = sourceCache.get(file)
        if (source === undefined) {
            try {
                source = await fs.readFile(file, 'utf-8')
            } catch (e) {
                console.error(`shot test: cannot read ${file}: ${(e as Error).message}`)
                return 2
            }
        }
        const diagnostics = check(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        lintFails += diagnostics.length
    }
    if (lintFails > 0) return 1

    const tmpDir = await makeTempDir('shot-test-')
    try {
        await copyTransform(projectFiles, tmpDir)
        const tmpTestFiles = testFiles.map(
            (f) => path.join(tmpDir, path.basename(f).replace(/\.shot$/, '.ts')),
        )

        // Type-check in-process
        const allTsFiles = projectFiles.map((f) =>
            path.join(tmpDir, path.basename(f).replace(/\.shot$/, '.ts')),
        )
        const typeDiags = typecheckFiles(allTsFiles)
        if (typeDiags.length > 0) {
            process.stderr.write(formatTypeDiagnostics(typeDiags))
            return 1
        }

        return await spawnBun(['test', ...passthrough, ...tmpTestFiles])
    } finally {
        await removeTempDir(tmpDir)
    }
}
