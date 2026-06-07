#!/usr/bin/env node
// CLI entry point — runs the ShotScript linter over glob patterns from argv
// and exits with code 1 if any diagnostics are found.
// Usage: shotscript 'src/**/*.ts'
import { readFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { glob } from 'glob'
import ts from 'typescript'
import { check } from './lint/check.js'
import type { Diagnostic } from './lint/types.js'

const patterns = process.argv.slice(2)

if (patterns.length === 0) {
    process.stderr.write('Usage: shotscript <glob> [...glob]\n       shotscript commands -- install Claude Code skills\n')
    process.exit(1)
}

if (patterns[0] === 'commands') {
    const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
    const src = path.join(pkgRoot, 'commands')
    const dest = path.join(process.cwd(), '.claude', 'commands')
    mkdirSync(dest, { recursive: true })
    const files = readdirSync(src)
    for (const file of files) {
        copyFileSync(path.join(src, file), path.join(dest, file))
    }
    process.stdout.write('ShotScript Claude skills installed to .claude/commands/\n')
    process.stdout.write('Available in Claude Code: /shotscript-fix  /shotscript-migrate  /shotscript-explain\n')
    process.exit(0)
}

const fileGroups = []
for (const pattern of patterns) {
    const matches = await glob(pattern, { absolute: true })
    fileGroups[fileGroups.length] = matches
}
const files = fileGroups.flat()

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

function fmtDiag(d: Diagnostic): string {
    return `${d.file}:${d.line}:${d.col} [${d.rule}] ${d.message}`
}

function lintFile(file: string): readonly string[] {
    const source = readFileSync(file, 'utf8')
    const programSourceFile = program.getSourceFile(file) ?? null
    return check(file, source, typeChecker, programSourceFile).map(fmtDiag)
}

const lines = files.flatMap(lintFile)

for (const line of lines) {
    process.stdout.write(`${line}\n`)
}

if (lines.length > 0) process.exit(1)
