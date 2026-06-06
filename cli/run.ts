import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup } from "./pipeline.ts"

function hasRelativeShotImports(source: string): boolean {
    return /(["']\.[^"']*?)\.shot(["'])/.test(source)
}

function rewriteShotImports(source: string): string {
    return source.replace(/(["']\.[^"']*?)\.shot(["'])/g, "$1.ts$2")
}

async function discoverProjectFiles(entry: string): Promise<string[]> {
    const parts = entry.split("/")
    parts.pop()
    const dir = parts.length > 0 ? parts.join("/") : "."
    const files: string[] = []
    for await (const e of Deno.readDir(dir)) {
        if (e.isFile && e.name.endsWith(".shot") && !e.name.endsWith(".test.shot")) {
            files.push(`${dir}/${e.name}`)
        }
    }
    return files
}

export async function run(args: string[]): Promise<number> {
    const sep = args.indexOf("--")
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    if (positional.length === 0) {
        console.error("shot run: expected at least one .shot file")
        return 2
    }

    const entry = positional[0]

    // Determine all project files to lint and (if multi-file) transform
    let projectFiles: string[]
    if (positional.length === 1) {
        let entrySource: string
        try {
            entrySource = await Deno.readTextFile(entry)
        } catch (e) {
            console.error(`shot run: cannot read ${entry}: ${(e as Error).message}`)
            return 2
        }
        projectFiles = hasRelativeShotImports(entrySource)
            ? await discoverProjectFiles(entry)
            : [entry]
    } else {
        projectFiles = positional
    }

    // Lint all project files
    let lintFails = 0
    for (const file of projectFiles) {
        let source: string
        try {
            source = await Deno.readTextFile(file)
        } catch (e) {
            console.error(`shot run: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        const diagnostics = check(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        lintFails += diagnostics.length
    }
    if (lintFails > 0) return 1

    const configPath = await writeImportMap()

    // Single-file fast path
    if (projectFiles.length === 1) {
        try {
            const cmd = new Deno.Command(Deno.execPath(), {
                args: [
                    "run",
                    "--check=all",
                    `--config=${configPath}`,
                    "--ext=ts",
                    ...passthrough,
                    entry,
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

    // Multi-file: copy all .shot files to a temp dir as .ts, rewriting relative imports
    const tmpDir = await Deno.makeTempDir({ prefix: "shot-run-" })
    try {
        for (const file of projectFiles) {
            const source = await Deno.readTextFile(file)
            const transformed = rewriteShotImports(source)
            const basename = file.split("/").pop()!.replace(/\.shot$/, ".ts")
            await Deno.writeTextFile(`${tmpDir}/${basename}`, transformed)
        }
        const entryBasename = entry.split("/").pop()!.replace(/\.shot$/, ".ts")
        const cmd = new Deno.Command(Deno.execPath(), {
            args: [
                "run",
                "--check=all",
                `--config=${configPath}`,
                ...passthrough,
                `${tmpDir}/${entryBasename}`,
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
