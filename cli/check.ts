import { check as runCheck } from "./checker/mod.ts"

export async function check(files: string[]): Promise<number> {
    if (files.length === 0) {
        console.error("shot check: no files given")
        return 2
    }

    let totalDiagnostics = 0
    for (const file of files) {
        if (!file.endsWith(".shot")) {
            console.error(`shot check: skipping non-.shot file: ${file}`)
            continue
        }
        let source: string
        try {
            source = await Deno.readTextFile(file)
        } catch (e) {
            console.error(`shot check: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        const diagnostics = runCheck(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        totalDiagnostics += diagnostics.length
    }

    return totalDiagnostics > 0 ? 1 : 0
}
