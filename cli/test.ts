import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup, hasShotImports, shotFilesInDir, copyTransform } from "./pipeline.ts"
import { expandGlob } from "jsr:@std/fs/expand-glob"

const ASSERT_IMPORT = "jsr:@std/assert"

export async function test(args: string[]): Promise<number> {
    const sep = args.indexOf("--")
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    let testFiles: string[]

    if (positional.length === 0) {
        const found: string[] = []
        for await (const entry of expandGlob("**/*.test.shot", { root: Deno.cwd() })) {
            found.push(entry.path)
        }
        if (found.length === 0) {
            console.error("shot test: no *.test.shot files found")
            return 2
        }
        testFiles = found
    } else {
        testFiles = positional
    }

    // Check if any test file imports relative .shot modules
    const sourceCache = new Map<string, string>()
    let needsTransform = false
    for (const file of testFiles) {
        let source: string
        try {
            source = await Deno.readTextFile(file)
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

    // Gather all .shot files from the same directories as the test files
    let projectFiles: string[]
    if (needsTransform) {
        const dirs = new Set<string>()
        for (const f of testFiles) {
            const parts = f.split("/")
            parts.pop()
            dirs.add(parts.length > 0 ? parts.join("/") : ".")
        }
        const all: string[] = []
        for (const dir of dirs) {
            for (const f of await shotFilesInDir(dir)) {
                if (!all.includes(f)) {
                    all.push(f)
                }
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
                source = await Deno.readTextFile(file)
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

    const configPath = await writeImportMap({ "shot:assert": ASSERT_IMPORT })

    if (!needsTransform) {
        try {
            const cmd = new Deno.Command(Deno.execPath(), {
                args: [
                    "test",
                    "--ext=ts",
                    `--config=${configPath}`,
                    ...passthrough,
                    ...testFiles,
                ],
                stdout: "inherit",
                stderr: "inherit",
            })
            const { code } = await cmd.output()
            return code
        } finally {
            await cleanup(configPath)
        }
    }

    // Multi-file: copy all project .shot files to a temp dir as .ts
    const tmpDir = await Deno.makeTempDir({ prefix: "shot-test-" })
    try {
        await copyTransform(projectFiles, tmpDir)
        const tmpTestFiles = testFiles.map(function toTsPath(f: string): string {
            return `${tmpDir}/${f.split("/").pop()!.replace(/\.shot$/, ".ts")}`
        })
        const cmd = new Deno.Command(Deno.execPath(), {
            args: [
                "test",
                `--config=${configPath}`,
                ...passthrough,
                ...tmpTestFiles,
            ],
            stdout: "inherit",
            stderr: "inherit",
        })
        const { code } = await cmd.output()
        return code
    } finally {
        await cleanup(configPath)
        await Deno.remove(tmpDir, { recursive: true })
    }
}
