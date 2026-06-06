# T02 — Checker skeleton

## Goal
Stand up the in-process checker module. Parses `.shot` files with the official TypeScript Compiler API (`npm:typescript`) and exposes a `check(file, source)` function returning a list of diagnostics. No rules yet — the plumbing for rules without the rules.

## Dependencies
T01.

## Files to create
- `cli/checker/mod.ts` — public `check()` function, rule registry, AST walker
- `cli/checker/rules/index.ts` — empty exported `rules: Rule[]` array
- `cli/checker/types.ts` — `Diagnostic`, `Rule`, `Context` types
- `tests/fixtures/empty.shot` — empty smoke-test file

## Acceptance criteria
- `cli/checker/mod.ts` exports `check(filePath: string, source: string): Diagnostic[]`.
- Calling `check("empty.shot", "")` returns `[]`.
- Calling `check("bad.shot", "let x =")` returns one diagnostic with `rule: "parse-error"` and an exit-1-worthy shape.
- Multiple-file processing is done by the caller (the checker handles one file at a time).
- The AST walker visits every node and dispatches to all registered rules with a shared `Context`.

## Suggested types

```ts
// cli/checker/types.ts
import type ts from "npm:typescript"

export type Diagnostic = {
    file: string
    line: number   // 1-based
    col: number    // 1-based
    rule: string
    message: string
}

export type Context = {
    file: string
    source: string
    sourceFile: ts.SourceFile
    push(d: Omit<Diagnostic, "file">): void
}

export type Rule = {
    name: string
    visit(node: ts.Node, ctx: Context): void
}
```

## Suggested skeleton

```ts
// cli/checker/mod.ts
import ts from "npm:typescript"
import type { Diagnostic, Context, Rule } from "./types.ts"
import { rules } from "./rules/index.ts"

export function check(file: string, source: string): Diagnostic[] {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const diagnostics: Diagnostic[] = []

    if ((sourceFile as any).parseDiagnostics?.length > 0) {
        // emit a single parse-error diagnostic and bail
    }

    const ctx: Context = {
        file, source, sourceFile,
        push(d) {
            diagnostics.push({ file, ...d })
        },
    }

    function walk(node: ts.Node): void {
        for (const rule of rules) {
            rule.visit(node, ctx)
        }
        ts.forEachChild(node, walk)
    }
    walk(sourceFile)

    return diagnostics
}
```

```ts
// cli/checker/rules/index.ts
import type { Rule } from "../types.ts"
export const rules: Rule[] = []   // populated by T03/T04/T05
```

## Position helper

Every rule needs to convert a `ts.Node` start offset to line/col:
```ts
export function posOf(sourceFile: ts.SourceFile, node: ts.Node): { line: number; col: number } {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    return { line: line + 1, col: character + 1 }
}
```
Place this in `cli/checker/mod.ts` or a `cli/checker/util.ts`.

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/ShotScript
deno run --allow-read - <<'EOF'
import { check } from "./cli/checker/mod.ts"
console.log(check("empty.shot", ""))                // []
console.log(check("bad.shot", "let x ="))           // 1 parse-error diagnostic
EOF
```

## Notes
- `npm:typescript` is the **only** parser dependency. No `typescript-estree`, no eslint, no babel.
- AST node types come from the `typescript` package; nodes are checked via `ts.SyntaxKind` enum and type guards like `ts.isArrowFunction(node)`.
- The walker uses `ts.forEachChild` — handles all node types automatically, no manual recursion needed.
- Keep `Rule` interface stable — T03/T04/T05 depend on it.
- Reference: <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API>
