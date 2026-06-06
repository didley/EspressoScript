# T06 — Wire `shot check`

> **Note:** filename retained for stable task numbering; the embed step from earlier drafts is gone (no Go binary).

## Goal
Wire the `shot check` subcommand to invoke the in-process checker on the given files and print human-readable diagnostics. Pure in-process — no subprocess.

## Dependencies
T01 (CLI skeleton), T02 (checker), T03/T04/T05 (rules implemented) — needed for the verification cases.

## Files to modify
- `cli/check.ts`

## Implementation

```ts
// cli/check.ts
import { check } from "./checker/mod.ts"

export async function checkCmd(files: string[]): Promise<number> {
    if (files.length === 0) {
        console.error("shot check: no files given")
        return 2
    }

    let totalDiagnostics = 0
    for (const file of files) {
        if (!file.endsWith(".shot")) {
            console.error(`shot check: skipping non-.shot file: ${file}`)
            continue
        }
        let source: string
        try {
            source = await Deno.readTextFile(file)
        } catch (e) {
            console.error(`shot check: cannot read ${file}: ${(e as Error).message}`)
            return 2
        }
        const diagnostics = check(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        totalDiagnostics += diagnostics.length
    }

    return totalDiagnostics > 0 ? 1 : 0
}
```

Wire `checkCmd` into `cli/mod.ts`'s dispatcher.

## Acceptance criteria

- `shot check valid.shot` exits 0 with no output.
- `shot check arrow.shot` exits 1 with one diagnostic on stderr.
- `shot check missing.shot` exits 2 with a clear error.
- `shot check valid.shot arrow.shot` exits 1 (one diagnostic, both files processed).

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/ShotScript

# Valid
deno run --allow-read cli/mod.ts check tests/fixtures/syntax/no-arrow-functions-valid.shot
echo "exit: $?"   # 0

# Invalid
deno run --allow-read cli/mod.ts check tests/fixtures/syntax/no-arrow-functions-invalid.shot 2>&1
echo "exit: $?"   # 1

# Locally installed binary works too
deno install -gn shot ./cli/mod.ts
shot check tests/fixtures/syntax/no-arrow-functions-invalid.shot
```

## Notes
- No file cache, no temp dirs, no subprocess. The checker is just a function call.
- Diagnostic output format: `file:line:col  rule  message` (two spaces between fields). Match this exactly so downstream tooling can parse it.
- See `docs/CLI.md` for the canonical output spec.
