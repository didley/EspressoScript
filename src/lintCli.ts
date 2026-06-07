#!/usr/bin/env node
// CLI entry point — runs the ShotScript linter over glob patterns from argv
// and exits with code 1 if any diagnostics are found.
// Usage: shotscript 'src/**/*.ts'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'
import ts from 'typescript'
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

const configPath = ts.findConfigFile(files[0] ?? process.cwd(), ts.sys.fileExists)

function resolveCompilerOptions(cfgPath: string | null): ts.CompilerOptions {
    if (cfgPath === null) {
        return { target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true }
    }
    return ts.parseJsonConfigFileContent(
        ts.readConfigFile(cfgPath, ts.sys.readFile).config,
        ts.sys,
        path.dirname(cfgPath),
    ).options
}

const compilerOptions = resolveCompilerOptions(configPath ?? null)

const program = ts.createProgram(files, { ...compilerOptions, noEmit: true })
const typeChecker = program.getTypeChecker()

const lines = []
for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const programSourceFile = program.getSourceFile(file) ?? null
    const diags = check(file, source, typeChecker, programSourceFile)
    for (const d of diags) {
        lines.push(`${d.file}:${d.line}:${d.col} [${d.rule}] ${d.message}`)
    }
}

for (const line of lines) {
    process.stdout.write(`${line}\n`)
}

if (lines.length > 0) process.exit(1)
