import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup } from "./pipeline.ts"
import { expandGlob } from "jsr:@std/fs/expand-glob"

const ASSERT_IMPORT = "jsr:@std/assert"

export async function test(args: string[]): Promise<number> {
    const sep = args.indexOf("--")
    const positional = sep === -1 ? args : args.slice(0, sep)
    const passthrough = sep === -1 ? [] : args.slice(sep + 1)

    let files: string[]

    if (positional.length === 0) {
        const found: string[] = []
        for await (const entry of expandGlob("**/*.test.shot", { root: Deno.cwd() })) {
            found.push(entry.path)
        }
        if (found.length === 0) {
            console.error("shot test: no *.test.shot files found")
            return 2
        }
        files = found
    } else {
        files = positional
    }

    let lintFails = 0
    for (const file of files) {
        let source: string
        try {
            source = await Deno.readTextFile(file)
        } catch (e) {
            console.error(`shot test: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        const diagnostics = check(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        lintFails += diagnostics.length
    }
    if (lintFails > 0) return 1

    const configPath = await writeImportMap({ "shot:assert": ASSERT_IMPORT })

    try {
        const cmd = new Deno.Command(Deno.execPath(), {
            args: [
                "test",
                "--ext=ts",
                `--config=${configPath}`,
                ...passthrough,
                ...files,
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
