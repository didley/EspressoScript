import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup } from "./pipeline.ts"

export async function build(files: string[]): Promise<number> {
    if (files.length === 0) {
        console.error("shot build: no files given")
        return 2
    }

    // 1. Lint
    let lintFails = 0
    for (const file of files) {
        let source: string
        try {
            source = await Deno.readTextFile(file)
        } catch (e) {
            console.error(`shot build: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        const diagnostics = check(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        lintFails += diagnostics.length
    }
    if (lintFails > 0) return 1

    // 2. Import map
    const configPath = await writeImportMap()

    try {
        // 3. Type-check via `deno run --check=all --ext=ts`
        // `deno check` in Deno 2.x does not support --ext, so we use `deno run --check=all`.
        // For library modules with no top-level side-effects this is equivalent to type-check only.
        const cmd = new Deno.Command(Deno.execPath(), {
            args: ["run", "--check=all", "--ext=ts", `--config=${configPath}`, ...files],
            stdout: "inherit",
            stderr: "inherit",
        })
        const { code } = await cmd.output()
        return code === 0 ? 0 : 1
    } finally {
        await cleanup(configPath)
    }
}
