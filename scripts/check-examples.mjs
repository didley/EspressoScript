// CI-only script: runs shotscript's check() against each example project.
// Builds one shared ts.createProgram per example using its own tsconfig.json.
import { readFileSync } from "node:fs"
import path from "node:path"
import { glob } from "glob"
import ts from "typescript"
import { check } from "../dist/lint/index.js"

const examples = [
    { name: "feature-showcase", pattern: "examples/feature-showcase/src/**/*.ts" },
]

let totalErrors = 0

for (const example of examples) {
    const files = await glob(example.pattern, { absolute: true })

    const configPath = ts.findConfigFile(files[0] ?? process.cwd(), ts.sys.fileExists)
    const compilerOptions = configPath
        ? ts.parseJsonConfigFileContent(
              ts.readConfigFile(configPath, ts.sys.readFile).config,
              ts.sys,
              path.dirname(configPath),
          ).options
        : { target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true }

    const program = ts.createProgram(files, { ...compilerOptions, noEmit: true })
    const typeChecker = program.getTypeChecker()

    let errorCount = 0
    for (const file of files) {
        const source = readFileSync(file, "utf8")
        const programSourceFile = program.getSourceFile(file) ?? null
        for (const d of check(file, source, typeChecker, programSourceFile)) {
            process.stderr.write(`${d.file}:${d.line}:${d.col} [${d.rule}] ${d.message}\n`)
            errorCount++
        }
    }

    if (errorCount > 0) {
        process.stderr.write(`\n${errorCount} error(s) in examples/${example.name}\n`)
    } else {
        console.log(`examples/${example.name}: ${files.length} files passed`)
    }
    totalErrors += errorCount
}

if (totalErrors > 0) process.exit(1)
