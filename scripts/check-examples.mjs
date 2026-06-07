// CI-only script: runs shotscript's check() against the example files.
// Not part of the published package — this avoids needing a CLI binary.
import { readFileSync } from "node:fs"
import { glob } from "glob"
import { check } from "../dist/checker/index.js"

const patterns = [
    "examples/feature-showcase/src/**/*.ts",
]

const files = (await Promise.all(patterns.map((p) => glob(p, { absolute: true })))).flat()

let errorCount = 0

for (const file of files) {
    const source = readFileSync(file, "utf8")
    for (const d of check(file, source)) {
        process.stderr.write(`${d.file}:${d.line}:${d.col} [${d.rule}] ${d.message}\n`)
        errorCount++
    }
}

if (errorCount > 0) {
    process.stderr.write(`\n${errorCount} error(s) found in examples\n`)
    process.exit(1)
}

console.log(`All example files passed (${files.length} files checked)`)
