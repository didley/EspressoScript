import * as fs from 'node:fs/promises'
import { glob } from 'glob'
import { check } from '../cli/checker/index.ts'

let fails = 0
const files = await glob('tests/fixtures/imports/**/*.shot')
for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf-8')
    const diagnostics = check(filePath, source).filter((d) => d.rule === 'imports-allowlist')
    const expected = filePath.includes('-invalid') ? 1 : 0
    if (diagnostics.length !== expected) {
        console.log(`FAIL: ${filePath} expected ${expected}, got ${diagnostics.length}`)
        for (const d of diagnostics) console.log(`  [${d.rule}] ${d.message}`)
        fails++
    }
}
if (fails === 0) console.log('All imports fixtures passed.')
process.exit(fails > 0 ? 1 : 0)
