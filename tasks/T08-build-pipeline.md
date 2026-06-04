# T08 — `shot build` pipeline

## Goal
Implement `shot build`: lint each `.shot` file in-process, write a transient `deno.json` import map, then invoke `deno check` against the original `.shot` files. No source rewriting, no `.ts` emission.

## Dependencies
T01–T06.

## Files to create
- `cli/pipeline.ts` — shared helpers (`writeImportMap`, `invokeDeno`)
- `cli/build.ts` — the build subcommand

## Files to modify
- `cli/mod.ts` — dispatch

## Pipeline

1. **Lint** — for each input, read it and call `check()`. If any diagnostic, print all of them and exit 1. The program never reaches Deno.
2. **Import map** — write `<tempdir>/deno.json` with:
   ```json
   { "imports": { "shot:": "jsr:@espresso/" } }
   ```
3. **Type-check** — invoke `deno check --config=<tempdir>/deno.json --ext=ts <files>`. Stream output. Forward deno's exit code.
4. **Cleanup** — delete tempdir on completion (unless `SHOT_KEEP_TEMP=1`).

## Implementation sketch

```ts
// cli/pipeline.ts
const STRICT_COMPILER_OPTIONS = {
    strict: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    exactOptionalPropertyTypes: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
    noErrorTruncation: true,
    noUncheckedSideEffectImports: true,
    strictBuiltinIteratorReturn: true,
    moduleDetection: "force",
    isolatedModules: true,
    verbatimModuleSyntax: true,
    forceConsistentCasingInFileNames: true,
}

export async function writeImportMap(): Promise<string> {
    const dir = await Deno.makeTempDir({ prefix: "shot-" })
    const path = `${dir}/deno.json`
    const stdlibOverride = Deno.env.get("SHOT_STDLIB_LOCAL")
    const imports = stdlibOverride !== undefined && stdlibOverride !== ""
        ? { "shot:std": stdlibOverride, "shot:": "jsr:@espresso/" }
        : { "shot:": "jsr:@espresso/" }
    await Deno.writeTextFile(path, JSON.stringify({
        imports,
        compilerOptions: STRICT_COMPILER_OPTIONS,
    }))
    return path
}

export async function cleanup(configPath: string): Promise<void> {
    if (Deno.env.get("SHOT_KEEP_TEMP") === "1") {
        console.error(`SHOT_KEEP_TEMP: leaving ${configPath}`)
        return
    }
    const dir = configPath.replace(/\/deno\.json$/, "")
    await Deno.remove(dir, { recursive: true })
}
```

```ts
// cli/build.ts
import { check } from "./checker/mod.ts"
import { writeImportMap, cleanup } from "./pipeline.ts"

export async function buildCmd(files: string[]): Promise<number> {
    // 1. Lint
    let lintFails = 0
    for (const file of files) {
        const source = await Deno.readTextFile(file)
        const diagnostics = check(file, source)
        for (const d of diagnostics) {
            console.error(`${d.file}:${d.line}:${d.col}  ${d.rule}  ${d.message}`)
        }
        lintFails += diagnostics.length
    }
    if (lintFails > 0) return 1

    // 2. Import map
    const configPath = await writeImportMap()

    try {
        // 3. Type-check
        const cmd = new Deno.Command("deno", {
            args: ["check", `--config=${configPath}`, "--ext=ts", ...files],
            stdout: "inherit",
            stderr: "inherit",
        })
        const { code } = await cmd.output()
        return code === 0 ? 0 : 1
    } finally {
        await cleanup(configPath)
    }
}
```

## Acceptance criteria
- Valid `.shot` file → exit 0, no stderr output.
- File with arrow function → lint fails → exit 1, diagnostic points at the `.shot` source line.
- File with type error (`const x: number = "foo"`) → lint passes, type-check fails → exit 1, deno diagnostic surfaces.
- File with `import { x } from "shot:std"` and `x` actually used → all steps pass. Requires `@espresso/std` to be importable (depends on T10 or a local import map override; see Notes).
- `SHOT_KEEP_TEMP=1 shot build foo.shot` leaves the temp dir intact and prints its path.

## Verification commands

```bash
cd /var/home/dylanlamont/Developer/EspressoScript

# 1) Lint failure
echo 'const f = () => 1' > /tmp/arrow.shot
deno run -A cli/mod.ts build /tmp/arrow.shot 2>&1
echo "exit: $?"

# 2) Type failure
echo 'const x: number = "oops"' > /tmp/typeerr.shot
deno run -A cli/mod.ts build /tmp/typeerr.shot 2>&1
echo "exit: $?"
```

## Notes
- No `.ts` files are ever written. `deno check --ext=ts <file.shot>` tells Deno to treat the input as TypeScript regardless of extension.
- The transient `deno.json` is the only emitted artifact and is cleaned up.
- The strict `compilerOptions` are load-bearing — they're how the language enforces strict typing beyond what the AST-only checker can see. `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` in particular are the type-system half of the no-`undefined` story.
- For the `shot:std` happy-path test: `@espresso/std` may not be published when this task is run. The `SHOT_STDLIB_LOCAL=path/to/stdlib/mod.ts` env var maps `shot:std` to the local file (already wired in the sketch above).
- See `docs/ARCHITECTURE.md` "Import resolution via Deno import maps" and `docs/LANGUAGE.md` "Strict typing — the baseline".
