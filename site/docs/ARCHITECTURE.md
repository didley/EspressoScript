# Architecture

## High-level shape

`shot` is a **single TypeScript entrypoint** executed by a small runtime layer (currently Deno). No Go binary, no compiled artifacts in v1. Users install via a curl-able script that handles the runtime bootstrap; under the hood the binary is registered via `deno install -gn`. The script orchestrates a small pipeline that ends with the runtime doing the actual TS → JS work.

```
.shot file
   │
   │  (1) lint via checker (TS Compiler API)
   ▼
diagnostics? ─── yes ──► exit 1
   │ no
   ▼
write temp deno.json with import map
   │
   │  (2) shot: prefix maps to jsr:@shotscript/ via import map
   ▼
deno run --check=all --config <tempjson> <file.ts>
                                  ▲
                                  │ (3) Deno type-checks the entry + graph,
                                  │     then runs (or errors out before run)
```

No source rewriting. No file copying. No temp `.ts` files. The `.shot` file is fed to Deno directly with `--ext=ts` so Deno treats it as TypeScript.

## Repository layout

```
ShotScript/
├── cli/
│   ├── mod.ts             # entry: parses argv, dispatches subcommands
│   ├── deno.json          # JSR publish config (@shotscript/shot)
│   ├── check.ts           # shot check
│   ├── fmt.ts             # shot fmt
│   ├── build.ts           # shot build
│   ├── run.ts             # shot run
│   ├── pipeline.ts        # shared: write import-map, invoke deno
│   └── checker/
│       ├── mod.ts         # AST walker, rule registry
│       └── rules/         # one file per rule
├── stdlib/
│   ├── mod.ts             # shot:std implementation
│   └── deno.json          # JSR publish config (@shotscript/std)
├── tests/
│   └── fixtures/          # one .shot pair per rule (valid + invalid)
├── docs/
└── deno.json              # workspace config (optional)
```

## The CLI

- Single Deno entrypoint: `cli/mod.ts`
- Argument parsing via Deno standard library (`@std/cli/parse-args`). No third-party CLI framework.
- All subcommands live in `cli/*.ts` and are wired up by `cli/mod.ts`.

## The checker

Pure Deno; no subprocess. The checker is a function imported by `shot check`, not a separate script:

```ts
import { check } from "./checker/mod.ts"
const diagnostics = check(filePath, source)   // returns Diagnostic[]
```

- Parses with `npm:typescript` (the official TS Compiler API).
- v1 uses `ts.createSourceFile()` — no `Program`, no type checker, AST-only.
- Walks the AST and runs each registered rule. Rules are registered in `cli/checker/rules/index.ts`.
- Each diagnostic carries `{ file, line, col, rule, message }`.

Going type-aware in v2 means upgrading to `ts.createProgram()` — same library, no dep change.

## Import resolution + strict tsconfig via transient `deno.json`

`.shot` source uses branded `shot:<name>` imports. Rather than rewriting source, the CLI writes a transient `deno.json` containing both an import map and the language's strict `compilerOptions`:

```json
{
    "imports": { "shot:": "jsr:@shotscript/" },
    "compilerOptions": {
        "strict": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noUncheckedIndexedAccess": true,
        "noPropertyAccessFromIndexSignature": true,
        "exactOptionalPropertyTypes": true,
        "allowUnreachableCode": false,
        "allowUnusedLabels": false,
        "noErrorTruncation": true,
        "noUncheckedSideEffectImports": true,
        "strictBuiltinIteratorReturn": true,
        "moduleDetection": "force",
        "isolatedModules": true,
        "verbatimModuleSyntax": true,
        "forceConsistentCasingInFileNames": true
    }
}
```

Deno's import-map resolver follows the trailing-slash convention: `shot:std` → `jsr:@shotscript/std`. No source modification; the `.shot` file Deno sees is identical to the `.shot` file the user wrote.

The `compilerOptions` block is the type-system half of the strict-typing contract: `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` close the holes the AST-only checker can't see, and `noUnusedLocals` is what makes ignored tuple-error bindings fail the build (see `docs/LANGUAGE.md`).

`shot build` and `shot run` create this `deno.json` in a temp directory and pass it via `deno run --config <path>`. The user's own `deno.json` (if any) is overridden — this is intentional. The language defines its own tsconfig; users don't get to relax it.

## `shot build` pipeline

1. Lint each `.shot` file (in-process).
2. If lint clean: write temp `deno.json` with the import map.
3. `deno check --config=<tempjson> --ext=ts <file.shot>` — type-checks the module graph.
4. Surface diagnostics or exit 0.

## `shot run` pipeline

1. Same as build through step 2.
2. `deno run --check=all --config=<tempjson> --ext=ts [user-flags] <file.shot>` — type-checks first, then runs. If type-check fails, the program never executes.

`--check=all` checks the entire module graph (entry plus all imports). `--ext=ts` tells Deno to treat the `.shot` file as TypeScript.

## Distribution

Two layers — user-facing and underlying:

**User-facing (the only thing documented in README/CLI docs):**
```
curl -fsSL https://shotscript.dev/install.sh | sh
```

**Underlying (what the install script actually does):**
1. Detect platform (Linux, macOS).
2. Check for Deno on PATH. If absent, install it via Deno's own install script.
3. `deno install -gn --global shot jsr:@shotscript/shot`.
4. Print confirmation + next-steps.

The two-layer split exists so ShotScript's UX never leaks "this is a Deno script." Users see "shot." Internals reuse the JS ecosystem. If we ever swap runtimes or ship `deno compile`-bundled binaries, the install URL stays stable — only the script body changes.

## What we don't do

- No custom parser. Ever.
- No custom formatter. `shot fmt` delegates to `deno fmt --ext ts`.
- No source rewriting. Import resolution happens at Deno's resolver layer via import maps.
- No source maps needed. The `.shot` file is what Deno parses.
- No type-aware rules in v1. Upgrading to `ts.createProgram()` is a v2 candidate.
- No Go. The tool is a Deno script.
