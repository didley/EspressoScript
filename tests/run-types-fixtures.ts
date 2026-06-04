import { check } from "../cli/checker/mod.ts"
import { walk } from "jsr:@std/fs@^1.0.0/walk"

let fails = 0
for await (const entry of walk("tests/fixtures/types/", { exts: [".shot"] })) {
    const source = await Deno.readTextFile(entry.path)
    const diagnostics = check(entry.path, source)
    const expected = entry.path.includes("-invalid") ? 1 : 0
    if (diagnostics.length !== expected) {
        console.log(`FAIL: ${entry.path}`)
        console.log(`  expected ${expected} diagnostic(s), got ${diagnostics.length}`)
        for (const d of diagnostics) {
            console.log(`  [${d.rule}] ${d.file}:${d.line}:${d.col} — ${d.message}`)
        }
        fails++
    }
}
if (fails === 0) {
    console.log("All type fixtures passed.")
}
Deno.exit(fails > 0 ? 1 : 0)
