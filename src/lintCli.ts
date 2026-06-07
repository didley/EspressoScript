// CLI entry point — runs the ShotScript linter over glob patterns from argv
// and exits with code 1 if any diagnostics are found.
// Usage: shotscript 'src/**/*.ts'
import { readFileSync } from 'node:fs'
import { glob } from 'glob'
import { check } from './lint/check.js'

const patterns = process.argv.slice(2)

if (patterns.length === 0) {
    process.stderr.write('Usage: shotscript <glob> [...glob]\n')
    process.exit(1)
}

const files = []
for (const pattern of patterns) {
    const matches = await glob(pattern, { absolute: true })
    files.push(...matches)
}

const lines = []
for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const d of check(file, source, null, null)) {
        lines.push(`${d.file}:${d.line}:${d.col} [${d.rule}] ${d.message}`)
    }
}

for (const line of lines) {
    process.stdout.write(`${line}\n`)
}

if (lines.length > 0) process.exit(1)
