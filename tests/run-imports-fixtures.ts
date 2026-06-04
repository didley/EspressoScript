import { check } from "../cli/checker/mod.ts"
import { walk } from "jsr:@std/fs@^1.0.0/walk"

let fails = 0
for await (const entry of walk("tests/fixtures/imports/", { exts: [".shot"] })) {
    const source = await Deno.readTextFile(entry.path)
    const diagnostics = check(entry.path, source).filter(d => d.rule === "imports-allowlist")
    const expected = entry.path.includes("-invalid") ? 1 : 0
    if (diagnostics.length !== expected) {
        console.log(`FAIL: ${entry.path} expected ${expected}, got ${diagnostics.length}`)
        for (const d of diagnostics) console.log(`  [${d.rule}] ${d.message}`)
        fails++
    }
}
if (fails === 0) console.log("All imports fixtures passed.")
Deno.exit(fails > 0 ? 1 : 0)
