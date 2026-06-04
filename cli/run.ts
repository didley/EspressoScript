import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup } from "./pipeline.ts"

export async function run(args: string[]): Promise<number> {
    const sep = args.indexOf("--")
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    if (positional.length !== 1) {
        console.error("shot run: expected exactly one .shot file")
        return 2
    }
    const file = positional[0]

    // Lint
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
    if (diagnostics.length > 0) return 1

    // Import map
    const configPath = await writeImportMap()

    try {
        // Type-check + run in one invocation
        const cmd = new Deno.Command(Deno.execPath(), {
            args: [
                "run",
                "--check=all",
                `--config=${configPath}`,
                "--ext=ts",
                ...passthrough,
                file,
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
