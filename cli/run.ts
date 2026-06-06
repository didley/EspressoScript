import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { spawn } from 'node:child_process'
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

export async function run(args: string[]): Promise<number> {
    const sep = args.indexOf('--')
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    if (positional.length === 0) {
        console.error('shot run: expected at least one .shot file')
        return 2
    }

    const entry = positional[0]
    const sourceCache = new Map<string, string>()

    let projectFiles: string[]
    if (positional.length === 1) {
        let entrySource: string
        try {
            entrySource = await fs.readFile(entry, 'utf-8')
        } catch (e) {
            console.error(`shot run: cannot read ${entry}: ${(e as Error).message}`)
            return 2
        }
        sourceCache.set(entry, entrySource)
        if (hasShotImports(entrySource)) {
            const dir = path.dirname(entry)
            projectFiles = (await shotFilesInDir(dir)).filter(
                (f) => !f.endsWith('.test.shot'),
            )
        } else {
            projectFiles = [entry]
        }
    } else {
        projectFiles = positional
    }

    // Lint all project files
    let lintFails = 0
    for (const file of projectFiles) {
        let source = sourceCache.get(file)
        if (source === undefined) {
            try {
                source = await fs.readFile(file, 'utf-8')
            } catch (e) {
                console.error(`shot run: cannot read ${file}: ${(e as Error).message}`)
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

    const tmpDir = await makeTempDir('shot-run-')
    try {
        await copyTransform(projectFiles, tmpDir, path.dirname(path.resolve(entry)))
        const entryBasename = path.basename(entry).replace(/\.shot$/, '.ts')
        const tsEntry = path.join(tmpDir, entryBasename)

        // Type-check in-process
        const tsFiles =
            projectFiles.length === 1
                ? [tsEntry]
                : projectFiles.map((f) =>
                      path.join(tmpDir, path.basename(f).replace(/\.shot$/, '.ts')),
                  )
        const typeDiags = typecheckFiles(tsFiles, tmpDir)
        if (typeDiags.length > 0) {
            process.stderr.write(formatTypeDiagnostics(typeDiags))
            return 1
        }

        return await spawnBun(['run', tsEntry, ...passthrough])
    } finally {
        await removeTempDir(tmpDir)
    }
}
