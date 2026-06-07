import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import { check } from "../src/checker/index.ts"

const PASS_DIR = resolve(import.meta.dirname ?? __dirname, "fixtures/pass")
const FAIL_DIR = resolve(import.meta.dirname ?? __dirname, "fixtures/fail")

function tsFiles(dir: string): readonly string[] {
    return readdirSync(dir)
        .filter(function isTsFile(f: string): boolean { return f.endsWith(".ts") })
        .map(function toPath(f: string): string { return join(dir, f) })
}

for (const file of tsFiles(PASS_DIR)) {
    test(`pass: ${file.split("/").slice(-2).join("/")}`, function runPass(): void {
        const source = readFileSync(file, "utf8")
        const diags = check(file, source)
        assert.equal(diags.length, 0, `Expected no diagnostics, got:\n${diags.map(function fmt(d: { rule: string; message: string; line: number; col: number }): string { return `  [${d.rule}] ${d.message} (${d.line}:${d.col})` }).join("\n")}`)
    })
}

for (const file of tsFiles(FAIL_DIR)) {
    test(`fail: ${file.split("/").slice(-2).join("/")}`, function runFail(): void {
        const source = readFileSync(file, "utf8")
        const diags = check(file, source)
        assert.ok(diags.length > 0, `Expected at least one diagnostic but got none for ${file}`)
    })
}
