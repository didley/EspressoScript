import * as fs from 'node:fs/promises'
import { glob } from 'glob'
import { check } from '../cli/checker/mod.ts'

let fails = 0
const files = await glob('tests/fixtures/types/**/*.shot')
for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf-8')
    const diagnostics = check(filePath, source)
    const expected = filePath.includes('-invalid') ? 1 : 0
    if (diagnostics.length !== expected) {
        console.log(`FAIL: ${filePath}`)
        console.log(`  expected ${expected} diagnostic(s), got ${diagnostics.length}`)
        for (const d of diagnostics) {
            console.log(`  [${d.rule}] ${d.file}:${d.line}:${d.col} — ${d.message}`)
        }
        fails++
    }
}
if (fails === 0) {
    console.log('All type fixtures passed.')
}
process.exit(fails > 0 ? 1 : 0)
